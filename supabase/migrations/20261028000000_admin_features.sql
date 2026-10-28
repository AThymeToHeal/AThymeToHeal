-- Admin features: separate logins, client self-service links, reminders, editable FAQs.
-- Same access model as the first migration: server key only; RLS on, no policies, no anon grants.

-- ---------------------------------------------------------------------------
-- Bookings: private manage link for the client + reminder bookkeeping
-- ---------------------------------------------------------------------------
alter table public.bookings
  add column manage_token text unique
    default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),  -- 244 random bits
  add column reminder_sent_at timestamptz;

update public.bookings
set manage_token = replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
where manage_token is null;

alter table public.bookings alter column manage_token set not null;

-- ---------------------------------------------------------------------------
-- Admin users (one login per person) + one-time set-password links
-- ---------------------------------------------------------------------------
create table public.admin_users (
  id             uuid primary key default gen_random_uuid(),
  email          text not null unique check (email = lower(email)),
  name           text not null,
  password_hash  text,                     -- null until they set a password from their invite link
  created_at     timestamptz not null default now(),
  last_login_at  timestamptz
);
alter table public.admin_users enable row level security;

create table public.admin_tokens (
  token_hash  text primary key,            -- sha-256 of the emailed token; the token itself is never stored
  user_id     uuid not null references public.admin_users (id) on delete cascade,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index admin_tokens_user_idx on public.admin_tokens (user_id);
alter table public.admin_tokens enable row level security;

-- ---------------------------------------------------------------------------
-- FAQs: visibility switch, and the list that is live on the site today
-- ---------------------------------------------------------------------------
alter table public.faqs add column is_visible boolean not null default true;

-- The 13 FAQs copied from Airtable were never shown on the website; keep them, hidden.
update public.faqs set is_visible = false where airtable_id is not null;

insert into public.faqs (question, answer, category, sort_order, is_visible) values
  ($q$What types of herbal products do you offer?$q$, $q$We offer a wide range of herbal products including custom tea blends, tinctures, salves, herbal capsules, and wellness kits. Each product is crafted using high-quality, organic herbs tailored to support various health needs.$q$, $q$Products$q$, 1, true),
  ($q$Are your herbal products safe?$q$, $q$Yes, we use only high-quality, organic herbs from reputable suppliers. However, we always recommend consulting with your healthcare provider before starting any new herbal regimen, especially if you are pregnant, nursing, taking medications, or have existing health conditions.$q$, $q$Products$q$, 2, true),
  ($q$How do I store my herbal products?$q$, $q$Most herbal products should be stored in a cool, dry place away from direct sunlight. Tinctures typically have a shelf life of 3-5 years, while dried herbs and teas are best used within 1-2 years. Specific storage instructions will be provided with each product.$q$, $q$Products$q$, 3, true),
  ($q$Can I take herbal remedies with my current medications?$q$, $q$Some herbs can interact with medications, so it's essential to consult with your healthcare provider before combining herbal remedies with prescription medications. During your consultation, we'll discuss any potential interactions.$q$, $q$Products$q$, 4, true),
  ($q$What happens during a consultation?$q$, $q$During your consultation, we'll discuss your health history, current concerns, wellness goals, and lifestyle. We'll then create a personalized herbal protocol tailored to your needs, including recommended herbs, dosages, and lifestyle suggestions.$q$, $q$Services$q$, 5, true),
  ($q$Do you offer virtual consultations?$q$, $q$Yes! We offer both in-person and virtual consultations via video call to accommodate your preferences and schedule. Virtual consultations are just as comprehensive as in-person sessions.$q$, $q$Services$q$, 6, true),
  ($q$How long does a consultation take?$q$, $q$Initial consultations typically last 60 minutes, while follow-up sessions are usually 30-45 minutes. We want to ensure we have enough time to thoroughly understand your needs and create an effective wellness plan.$q$, $q$Services$q$, 7, true),
  ($q$Do you offer follow-up support?$q$, $q$Absolutely! We provide ongoing support to help you achieve your wellness goals. Follow-up consultations allow us to assess your progress, adjust your protocol as needed, and answer any questions that arise.$q$, $q$Services$q$, 8, true),
  ($q$Can you help with specific health conditions?$q$, $q$We work with a wide range of health concerns including digestive issues, stress and anxiety, sleep problems, immune support, hormonal balance, and more. However, we are not medical doctors and do not diagnose, treat, or cure diseases. We support your body's natural healing processes.$q$, $q$Services$q$, 9, true),
  ($q$How do I place an order?$q$, $q$You can place an order by contacting us directly through our contact form, phone, or email. After your consultation, we'll help you select the right products and guide you through the ordering process.$q$, $q$Orders$q$, 10, true),
  ($q$What are your shipping options?$q$, $q$We offer standard shipping (5-7 business days) and expedited shipping (2-3 business days) within the United States. International shipping may be available upon request. Shipping costs are calculated based on your location and order size.$q$, $q$Orders$q$, 11, true),
  ($q$When will my order arrive?$q$, $q$Orders are typically processed within 1-2 business days. Standard shipping takes 5-7 business days, while expedited shipping takes 2-3 business days. You'll receive a tracking number once your order ships.$q$, $q$Orders$q$, 12, true),
  ($q$Do you offer local pickup?$q$, $q$Yes, local pickup is available by appointment. This option allows you to save on shipping costs and receive your products immediately.$q$, $q$Orders$q$, 13, true),
  ($q$What is your return policy?$q$, $q$We want you to be completely satisfied with your purchase. If you're not happy with a product, please contact us within 30 days of receipt. Unopened products in original packaging can be returned for a full refund. Custom blends and opened products cannot be returned due to their personalized nature.$q$, $q$Returns$q$, 14, true),
  ($q$How long does it take to process a refund?$q$, $q$Refunds are typically processed within 5-7 business days after we receive your returned product. You'll receive an email confirmation once the refund has been issued.$q$, $q$Returns$q$, 15, true),
  ($q$What if my product arrives damaged?$q$, $q$We take great care in packaging our products, but if something arrives damaged, please contact us immediately with photos. We'll send a replacement or issue a full refund right away.$q$, $q$Returns$q$, 16, true),
  ($q$What payment methods do you accept?$q$, $q$We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, and PayPal. Payment is required at the time of consultation booking or product purchase.$q$, $q$Payment$q$, 17, true),
  ($q$Do you offer payment plans?$q$, $q$For certain services and larger orders, we may offer payment plans on a case-by-case basis. Please contact us to discuss your specific needs.$q$, $q$Payment$q$, 18, true),
  ($q$Are your prices negotiable?$q$, $q$Our prices reflect the high quality of our products and personalized service. While prices are generally fixed, we occasionally offer package deals and seasonal promotions. Subscribe to our newsletter to stay informed about special offers.$q$, $q$Payment$q$, 19, true),
  ($q$Do you offer workshops or classes?$q$, $q$Yes! We regularly host workshops on various herbal topics including tea blending, making herbal remedies, herb identification, and seasonal wellness. Check our website or subscribe to our newsletter for upcoming workshop dates.$q$, $q$Workshops$q$, 20, true),
  ($q$Are workshops suitable for beginners?$q$, $q$Absolutely! Our workshops are designed for all experience levels, from complete beginners to seasoned herbalists. We create a welcoming, supportive learning environment for everyone.$q$, $q$Workshops$q$, 21, true);

-- ---------------------------------------------------------------------------
-- Grants: server key only
-- ---------------------------------------------------------------------------
revoke all on public.admin_users, public.admin_tokens from anon, authenticated;
grant select, insert, update, delete on public.admin_users, public.admin_tokens to service_role;
