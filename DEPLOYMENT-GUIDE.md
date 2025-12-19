# Deployment Guide - A Thyme To Heal

Complete step-by-step guide to set up Airtable and deploy your website.

## Phase 1: Airtable Setup

### Step 1: Create All Tables

Follow **AIRTABLE-SETUP-GUIDE.md** to create all 7 tables:
1. ✅ `contact` (already exists)
2. `Booked`
3. `Clients`
4. `Newsletter Signups`
5. `Testimonials`
6. `FAQs`
7. `FAQ Clicks`

**Estimated time:** 30-45 minutes

### Step 2: Add Sample Testimonials

In the `Testimonials` table, add these 3 records:

**Record 1:**
- Name: `Sarah M.`
- Text: `A Thyme to Heal transformed my approach to wellness. The custom blends have made such a difference in my daily life!`
- Rating: `5`
- Approved: ✅ (checked)

**Record 2:**
- Name: `Michael R.`
- Text: `The herbal consultation was incredibly insightful. I finally found natural solutions that work for me.`
- Rating: `5`
- Approved: ✅ (checked)

**Record 3:**
- Name: `Jennifer L.`
- Text: `Professional, knowledgeable, and genuinely caring. I highly recommend A Thyme to Heal to anyone seeking natural wellness.`
- Rating: `5`
- Approved: ✅ (checked)

### Step 3: Migrate FAQs to Airtable

Run the migration script to copy all 21 FAQs from code to Airtable:

```bash
npm run migrate-faqs
```

This will:
- Create all 21 FAQ records in Airtable
- Set proper categories and order
- Initialize ClickCount to 0

**Verification:**
- Go to Airtable
- Open `FAQs` table
- Should see 21 records
- Each with Question, Answer, Category, Order, ClickCount

### Step 4: Verify Environment Variables

Check `.env.local`:

```bash
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**For production (Vercel):**
- Set `NEXT_PUBLIC_SITE_URL=https://athymetoheal.org`

---

## Phase 2: Local Testing

### Step 1: Restart Development Server

```bash
npm run dev
```

### Step 2: Test All Features

**Homepage (`http://localhost:3000`):**
- [ ] Testimonials section shows 3 testimonials from Airtable
- [ ] Newsletter signup form works
- [ ] "Book Your Free Consultation" button opens modal
- [ ] If you have saved progress, shows "📝 Resume Your Booking"

**Booking System:**
- [ ] Click "Book Your Free Consultation"
- [ ] Calendar shows (weekends disabled)
- [ ] Select a date → time slots appear
- [ ] Timezone selector works
- [ ] Fill out all form fields
- [ ] Submit booking
- [ ] Success screen appears
- [ ] Check Airtable `Booked` table → new record
- [ ] Check Airtable `Clients` table → new record (linked to booking)

**Contact Form (`/contact`):**
- [ ] Fill out form (first name, last name, email, message)
- [ ] Check newsletter box
- [ ] Submit form
- [ ] Success message appears
- [ ] Check Airtable `contact` table → new record
- [ ] Check Airtable `Newsletter Signups` table → new record (if checked)

**Newsletter Signup:**
- [ ] Homepage newsletter → submit email
- [ ] Success message appears
- [ ] Check Airtable `Newsletter Signups` table → new record with Source: "Homepage"
- [ ] Go to `/coming-soon` → submit email
- [ ] Check Airtable → new record with Source: "Coming Soon Page"

**FAQ Page (`/faq`):**
- [ ] Page loads with all 21 FAQs from Airtable
- [ ] Search works (type "shipping" → shows only shipping FAQs)
- [ ] Category filter works (click "Products" → shows only product FAQs)
- [ ] Click an FAQ to expand
- [ ] Check Airtable `FAQ Clicks` table → new click record
- [ ] Check Airtable `FAQs` table → ClickCount incremented

**Data Persistence:**
- [ ] Start booking → select date/time → fill form halfway
- [ ] Click outside modal → confirmation dialog appears
- [ ] Confirm close → modal closes
- [ ] Refresh page
- [ ] Click booking button → shows "📝 Resume Your Booking"
- [ ] Click → modal opens to same step with all data restored

---

## Phase 3: Production Deployment (Vercel)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Complete Airtable integration

- Added booking system with timezone support
- Integrated contact form with Airtable
- Added newsletter signups (homepage & coming-soon)
- Implemented FAQ search and click tracking
- Added data persistence for booking modal
- Migrated FAQs and testimonials to Airtable

🤖 Generated with Claude Code"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
npm install -g vercel
vercel
```

### Step 3: Set Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:

| Name | Value |
|------|-------|
| `AIRTABLE_API_KEY` | `your_airtable_api_key_here` |
| `AIRTABLE_BASE_ID` | `your_airtable_base_id_here` |
| `NEXT_PUBLIC_SITE_URL` | `https://athymetoheal.org` |

3. Click "Save"
4. Go to Deployments → Click "..." → Redeploy

### Step 4: Test Production Site

Visit your production URL and test all features (same checklist as Phase 2).

---

## Phase 4: Domain Setup

### If Using Vercel Domain

Your site will be at: `your-project.vercel.app`

### If Using Custom Domain (athymetoheal.org)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `athymetoheal.org`
3. Add domain: `www.athymetoheal.org`
4. Follow Vercel's DNS instructions
5. Update nameservers or add A/CNAME records

**DNS Records (example):**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

6. Wait for DNS propagation (5 minutes - 48 hours)
7. Verify site loads at `https://athymetoheal.org`

---

## Phase 5: Post-Deployment

### Monitor Performance

**Vercel Analytics:**
- Go to Vercel Dashboard → Analytics
- View page views, visitor data, performance metrics

**Airtable Monitoring:**
- Check daily for new:
  - Bookings (`Booked` table)
  - Contact submissions (`contact` table)
  - Newsletter signups (`Newsletter Signups` table)

### FAQ Analytics

Check which FAQs are most clicked:
1. Go to Airtable `FAQs` table
2. Sort by `ClickCount` descending
3. Highest counts = most popular FAQs
4. Consider featuring these prominently

### Testimonial Management

**To add new testimonials:**
1. User submits via contact form or booking
2. You manually add to `Testimonials` table
3. Set `Approved` = unchecked (review first)
4. Review content
5. Set `Approved` = checked
6. Appears on homepage immediately

**To hide a testimonial:**
- Uncheck `Approved`
- Will disappear from homepage

---

## Troubleshooting

### Issue: FAQs not showing on website

**Check:**
1. Airtable `FAQs` table exists and has data
2. Table name is exactly `FAQs` (case-sensitive)
3. Field names match:
   - `Question` (not question)
   - `Answer` (not answer)
   - `Category`
   - `Order`
   - `ClickCount`
4. Environment variables are set in Vercel
5. Clear browser cache
6. Check browser console for errors

**Solution:**
- If tables don't exist: Follow AIRTABLE-SETUP-GUIDE.md
- If FAQ migration failed: Run `npm run migrate-faqs` again
- If fetch fails: Check API token permissions

### Issue: Testimonials not showing on homepage

**Check:**
1. Airtable `Testimonials` table exists
2. At least one record has `Approved` = checked
3. Field names match exactly:
   - `Name`
   - `Text`
   - `Rating`
   - `Approved`
   - `DateCreated`

**Solution:**
- Add sample testimonials from AIRTABLE-SETUP-GUIDE.md
- Verify `Approved` checkbox is checked
- Check API endpoint: `your-site.com/api/testimonials`

### Issue: Booking not saving to Airtable

**Check:**
1. `Booked` and `Clients` tables exist
2. Tables have all required fields
3. `BookedRecord` in Clients table links to `Booked` table
4. Check browser console for API errors
5. Try a booking and check Network tab

**Solution:**
- Verify table schemas match AIRTABLE-SETUP-GUIDE.md
- Check API token has write permissions
- Review `/api/bookings` and `/api/clients` endpoint logs

### Issue: "Resume Your Booking" not working

**Check:**
1. Browser localStorage is enabled
2. Not in incognito/private mode
3. Same browser used

**Solution:**
- localStorage is browser-specific
- Check with: `localStorage.getItem('bookingProgress')` in console
- Clear localStorage: `localStorage.removeItem('bookingProgress')`

### Issue: Environment variables not working

**Check:**
1. File is named exactly `.env.local` (not `.env`)
2. No quotes around values
3. Restart dev server after changing .env.local
4. Variables starting with `NEXT_PUBLIC_` are public (safe in browser)
5. Other variables are server-only

**Solution:**
```bash
# Stop dev server (Ctrl+C)
# Verify .env.local contents
cat .env.local

# Restart
npm run dev
```

---

## Maintenance Guide

### Weekly Tasks

- [ ] Check Airtable for new bookings
- [ ] Respond to contact form submissions
- [ ] Review and approve new testimonials (if any)

### Monthly Tasks

- [ ] Review FAQ click analytics
- [ ] Update FAQs based on common questions
- [ ] Check newsletter signup growth
- [ ] Export Airtable data for backup

### As Needed

- [ ] Add new FAQs when clients ask repeated questions
- [ ] Update testimonials as you receive new reviews
- [ ] Adjust booking time slots if needed (edit `lib/timezone.ts`)
- [ ] Add/modify products and services

---

## Future Enhancements

Based on your plan in `IMPLEMENTATION-SUMMARY.md`:

### Phase 6: Email Notifications

Add email service (Resend, SendGrid):
- Booking confirmation emails to clients
- Booking notification emails to you
- Newsletter welcome email
- Contact form acknowledgment

### Phase 7: Supabase for Video Content

When ready to add video subscriptions:
- Set up Supabase project
- Implement authentication
- Add video storage and streaming
- Integrate with existing Airtable data
- Build client portal

### Phase 8: Stripe Payments

For paid consultations and products:
- Set up Stripe account
- Add payment endpoints
- Implement subscription tiers
- Add checkout flow
- Handle webhooks

---

## Support

**Issues or Questions?**
- Check AIRTABLE-SETUP-GUIDE.md for table setup
- Check IMPLEMENTATION-SUMMARY.md for technical details
- Review error messages in browser console
- Check Vercel deployment logs

**All set! 🎉**

Your website is now fully integrated with Airtable and ready for production use!
