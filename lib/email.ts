/**
 * Transactional email via Resend's REST API (plain fetch, so it runs on Vercel and
 * Cloudflare Workers alike).
 *
 * Env vars:
 *   RESEND_API_KEY      — without it every send is skipped (logged), never thrown
 *   EMAIL_FROM          — e.g. "A Thyme to Heal <bookings@athymetoheal.org>"
 *   ADMIN_NOTIFY_EMAILS — comma-separated list that gets new-booking / message alerts
 *   NEXT_PUBLIC_SITE_URL — used for links back to /admin
 *
 * Emails never block or fail the action that triggered them: a booking that saved
 * is a booking, even if the alert email bounces.
 */

import { SERVICES, type ServiceType } from '@/lib/db';
import { utcToMountain, formatDay, formatTime, addMinutes } from '@/lib/admin/time';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://athymetoheal.org').replace(/\/$/, '');

function adminRecipients(): string[] {
  return (process.env.ADMIN_NOTIFY_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

async function send(opts: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
  idempotencyKey: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from || opts.to.length === 0) {
    console.warn(`[email] skipped "${opts.subject}": email not configured`);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': opts.idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[email] send failed:', error);
    return false;
  }
}

/** Shared frame: cream card, forest-green header, plain readable type. */
function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f0e9d2;font-family:Georgia,serif;color:#2a2319">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#023020;color:#f0e9d2;padding:20px 28px;font-size:20px">A Thyme to Heal</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 16px;font-size:22px;font-weight:normal;color:#023020">${esc(title)}</h1>
${body}
</td></tr></table></td></tr></table></body></html>`;
}

function rows(pairs: Array<[string, unknown]>): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-family:Arial,sans-serif;font-size:15px;line-height:1.5">${pairs
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b6152;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`
    )
    .join('')}</table>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0 0"><a href="${esc(href)}" style="display:inline-block;background:#023020;color:#f0e9d2;text-decoration:none;padding:12px 20px;border-radius:8px;font-family:Arial,sans-serif;font-size:15px">${esc(label)}</a></p>`;
}

export interface BookingEmailData {
  id: string;
  dateAndTime: string; // UTC ISO
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  serviceType: string;
  consultant: string;
  userLocalTime?: string;
  manageToken?: string;
}

export function manageUrl(token: string): string {
  return `${SITE_URL}/booking/${token}`;
}

function manageBlock(b: BookingEmailData): string {
  if (!b.manageToken) {
    return `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;margin:20px 0 0">If you need to change or cancel, just reply to this email and we'll take care of it.</p>`;
  }
  return (
    button(manageUrl(b.manageToken), 'Reschedule or cancel') +
    `<p style="font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#6b6152;margin:12px 0 0">Changes online are possible until 24 hours before your appointment. After that, just reply to this email.</p>`
  );
}

function when(b: BookingEmailData): { day: string; range: string } {
  const { date, time } = utcToMountain(b.dateAndTime);
  const duration = SERVICES[b.serviceType as ServiceType]?.duration ?? 60;
  return { day: formatDay(date), range: `${formatTime(time)} – ${formatTime(addMinutes(time, duration))} Mountain Time` };
}

/** Alert to the practice: someone booked online. */
export async function sendNewBookingAlert(b: BookingEmailData): Promise<void> {
  const { day, range } = when(b);
  await send({
    to: adminRecipients(),
    subject: `New booking: ${b.firstName} ${b.lastName}, ${b.serviceType} on ${day}`,
    replyTo: b.email,
    idempotencyKey: `booking-alert/${b.id}`,
    html: layout(
      'New booking from the website',
      rows([
        ['Client', `${b.firstName} ${b.lastName}`],
        ['Service', b.serviceType],
        ['With', b.consultant],
        ['When', `${day}, ${range}`],
        ['Their time', b.userLocalTime],
        ['Email', b.email],
        ['Phone', b.phone],
      ]) + button(`${SITE_URL}/admin/schedule/${b.id}`, 'Open in admin')
    ),
  });
}

/** Confirmation to the client who booked. */
export async function sendBookingConfirmation(b: BookingEmailData): Promise<void> {
  const { day, range } = when(b);
  await send({
    to: [b.email],
    subject: `You're booked: ${b.serviceType} on ${day}`,
    replyTo: adminRecipients()[0],
    idempotencyKey: `booking-confirmation/${b.id}`,
    html: layout(
      `Thank you, ${b.firstName}. You're booked.`,
      rows([
        ['Service', b.serviceType],
        ['With', b.consultant],
        ['When', `${day}, ${range}`],
        ['Your time', b.userLocalTime],
      ]) + manageBlock(b)
    ),
  });
}

/** Day-before reminder to the client. */
export async function sendReminder(b: BookingEmailData): Promise<boolean> {
  const { day, range } = when(b);
  return send({
    to: [b.email],
    subject: `Reminder: ${b.serviceType} tomorrow with ${b.consultant}`,
    replyTo: adminRecipients()[0],
    idempotencyKey: `reminder/${b.id}/${b.dateAndTime}`,
    html: layout(
      `See you tomorrow, ${b.firstName}`,
      rows([
        ['Service', b.serviceType],
        ['With', b.consultant],
        ['When', `${day}, ${range}`],
      ]) + manageBlock(b)
    ),
  });
}

/** Client changed their own booking from the manage link: tell them and the practice. */
export async function sendRescheduled(b: BookingEmailData, previous: string): Promise<void> {
  const { day, range } = when(b);
  const before = when({ ...b, dateAndTime: previous });
  await Promise.all([
    send({
      to: [b.email],
      subject: `Your appointment moved to ${day}`,
      replyTo: adminRecipients()[0],
      idempotencyKey: `rescheduled-client/${b.id}/${b.dateAndTime}`,
      html: layout('Your new time is confirmed', rows([
        ['Service', b.serviceType],
        ['With', b.consultant],
        ['New time', `${day}, ${range}`],
      ]) + manageBlock(b)),
    }),
    send({
      to: adminRecipients(),
      subject: `Rescheduled: ${b.firstName} ${b.lastName} moved to ${day}`,
      replyTo: b.email,
      idempotencyKey: `rescheduled-admin/${b.id}/${b.dateAndTime}`,
      html: layout('A client rescheduled online', rows([
        ['Client', `${b.firstName} ${b.lastName}`],
        ['Service', b.serviceType],
        ['With', b.consultant],
        ['Was', `${before.day}, ${before.range}`],
        ['Now', `${day}, ${range}`],
      ]) + button(`${SITE_URL}/admin/schedule/${b.id}`, 'Open in admin')),
    }),
  ]);
}

/** Client cancelled from the manage link: tell them and the practice. */
export async function sendCancelled(b: BookingEmailData): Promise<void> {
  const { day, range } = when(b);
  await Promise.all([
    send({
      to: [b.email],
      subject: `Cancelled: ${b.serviceType} on ${day}`,
      replyTo: adminRecipients()[0],
      idempotencyKey: `cancelled-client/${b.id}`,
      html: layout('Your appointment is cancelled', rows([
        ['Service', b.serviceType],
        ['Was', `${day}, ${range}`],
      ]) + button(`${SITE_URL}/how-we-can-help-you`, 'Book another time')),
    }),
    send({
      to: adminRecipients(),
      subject: `Cancelled: ${b.firstName} ${b.lastName}, ${b.serviceType} on ${day}`,
      replyTo: b.email,
      idempotencyKey: `cancelled-admin/${b.id}`,
      html: layout('A client cancelled online', rows([
        ['Client', `${b.firstName} ${b.lastName}`],
        ['Service', b.serviceType],
        ['With', b.consultant],
        ['Was', `${day}, ${range}`],
        ['Email', b.email],
        ['Phone', b.phone],
      ]) + `<p style="font-family:Arial,sans-serif;font-size:14px;color:#6b6152;margin:16px 0 0">That time is open on the website again.</p>`),
    }),
  ]);
}

/** Invite or password-reset link for the admin. */
export async function sendAdminLink(to: string, name: string, url: string, kind: 'invite' | 'reset'): Promise<boolean> {
  const invite = kind === 'invite';
  return send({
    to: [to],
    subject: invite ? "You're invited to the A Thyme to Heal admin" : 'Set a new password for the A Thyme to Heal admin',
    idempotencyKey: `admin-link/${url.slice(-16)}`,
    html: layout(
      invite ? `Welcome, ${name}` : `Hi ${name}`,
      `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;margin:0">${
        invite
          ? 'You now have your own sign-in for the practice admin, where you can see bookings, add time off, and manage clients and reviews. Choose a password to get started.'
          : 'Someone asked to reset your admin password. If it was you, choose a new one below. If not, you can ignore this email.'
      }</p>` +
        button(url, invite ? 'Choose my password' : 'Set a new password') +
        `<p style="font-family:Arial,sans-serif;font-size:13px;color:#6b6152;margin:16px 0 0">This link works once and expires in ${invite ? '7 days' : '1 hour'}.</p>`
    ),
  });
}

/** Alert to the practice: new contact-form message. */
export async function sendContactAlert(c: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<void> {
  await send({
    to: adminRecipients(),
    subject: `New message from ${c.firstName} ${c.lastName}${c.subject ? `: ${c.subject}` : ''}`,
    replyTo: c.email,
    idempotencyKey: `contact-alert/${c.id}`,
    html: layout(
      'New message from the website',
      rows([
        ['From', `${c.firstName} ${c.lastName}`],
        ['Email', c.email],
        ['Phone', c.phone],
        ['Subject', c.subject],
      ]) +
        `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;white-space:pre-wrap;margin:16px 0 0;padding:16px;background:#f7f3e6;border-radius:8px">${esc(c.message)}</p>` +
        `<p style="font-family:Arial,sans-serif;font-size:13px;color:#6b6152;margin:16px 0 0">Reply to this email to answer them directly.</p>`
    ),
  });
}

/** Alert to the practice: a review is waiting for approval. */
export async function sendReviewAlert(r: { id: string; name: string; text: string; rating?: number }): Promise<void> {
  await send({
    to: adminRecipients(),
    subject: `New review from ${r.name} is waiting for approval`,
    idempotencyKey: `review-alert/${r.id}`,
    html: layout(
      'A new review is waiting',
      rows([
        ['From', r.name],
        ['Rating', r.rating ? `${r.rating} of 5` : undefined],
      ]) +
        `<p style="font-family:Georgia,serif;font-size:16px;line-height:1.6;font-style:italic;margin:16px 0 0">&ldquo;${esc(r.text)}&rdquo;</p>` +
        button(`${SITE_URL}/admin/reviews`, 'Approve or hide it')
    ),
  });
}
