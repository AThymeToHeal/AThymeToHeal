# Airtable Setup Guide - A Thyme To Heal

This guide will walk you through setting up all required Airtable tables for your website.

## Access Your Base

1. Go to https://airtable.com
2. Open your base: `appUa0ep1unhG1RKj`
3. You should see the `contact` table already exists

---

## Table 1: `contact` ✅ (Already Exists)

**Purpose:** Store contact form submissions

Verify it has these fields:
- FirstName (Single line text)
- LastName (Single line text)
- Email (Email)
- Phone (Phone number)
- Message (Long text)
- Source (Single select: Contact Page, Other)
- DateCreated (Created time)

---

## Table 2: `Booked`

**Purpose:** Store consultation bookings

### Steps to Create:
1. Click **"Add or import"** > **"Create empty table"**
2. Name it: `Booked`
3. Add these fields:

| Field Name | Field Type | Configuration |
|------------|------------|---------------|
| dateAndTime | Date | Include time, Use GMT |
| FirstName | Single line text | - |
| LastName | Single line text | - |
| Email | Email | - |
| BookingType | Single select | Options: "Free Consultation", "Paid Consultation" |
| UserTimezone | Single line text | - |
| UserLocalTime | Single line text | - |

### Field-by-Field Instructions:

**dateAndTime:**
- Click **"+"** to add field
- Choose **"Date"**
- Name: `dateAndTime`
- Toggle **"Include a time field"** ON
- Toggle **"Use the same time zone (GMT) for all collaborators"** ON
- Click **"Create field"**

**FirstName:**
- Click **"+"** > **"Single line text"**
- Name: `FirstName`

**LastName:**
- Click **"+"** > **"Single line text"**
- Name: `LastName`

**Email:**
- Click **"+"** > **"Email"**
- Name: `Email`

**BookingType:**
- Click **"+"** > **"Single select"**
- Name: `BookingType`
- Add options:
  - `Free Consultation`
  - `Paid Consultation`

**UserTimezone:**
- Click **"+"** > **"Single line text"**
- Name: `UserTimezone`

**UserLocalTime:**
- Click **"+"** > **"Single line text"**
- Name: `UserLocalTime`

---

## Table 3: `Clients`

**Purpose:** Store detailed client information linked to bookings

### Steps to Create:
1. Click **"Add or import"** > **"Create empty table"**
2. Name it: `Clients`
3. Add these fields:

| Field Name | Field Type | Configuration |
|------------|------------|---------------|
| FirstName | Single line text | - |
| LastName | Single line text | - |
| Email | Email | - |
| Phone | Phone number | - |
| HealthGoals | Long text | - |
| DietaryRestrictions | Long text | - |
| CurrentMedications | Long text | - |
| HealthConditions | Long text | - |
| PreferredContactMethod | Single select | Options: "Email", "Phone", "Text" |
| BestTimeToContact | Single line text | - |
| Consent | Checkbox | - |
| BookedRecord | Link to another record | Link to: Booked table |

### Field-by-Field Instructions:

**FirstName through Phone:** (Same as Booked table)

**HealthGoals:**
- Click **"+"** > **"Long text"**
- Name: `HealthGoals`
- Toggle **"Enable rich text formatting"** OFF

**DietaryRestrictions:**
- Click **"+"** > **"Long text"**
- Name: `DietaryRestrictions`

**CurrentMedications:**
- Click **"+"** > **"Long text"**
- Name: `CurrentMedications`

**HealthConditions:**
- Click **"+"** > **"Long text"**
- Name: `HealthConditions`

**PreferredContactMethod:**
- Click **"+"** > **"Single select"**
- Name: `PreferredContactMethod`
- Add options:
  - `Email`
  - `Phone`
  - `Text`

**BestTimeToContact:**
- Click **"+"** > **"Single line text"**
- Name: `BestTimeToContact`

**Consent:**
- Click **"+"** > **"Checkbox"**
- Name: `Consent`

**BookedRecord:**
- Click **"+"** > **"Link to another record"**
- Name: `BookedRecord`
- Choose: **"Booked"** table
- Click **"Create field"**

---

## Table 4: `Newsletter Signups`

**Purpose:** Store email newsletter subscriptions

### Steps to Create:
1. Click **"Add or import"** > **"Create empty table"**
2. Name it: `Newsletter Signups`
3. Add these fields:

| Field Name | Field Type | Configuration |
|------------|------------|---------------|
| Email | Email | - |
| Name | Single line text | - |
| Source | Single select | Options: "Homepage", "Coming Soon Page", "Contact Page" |
| Subscribed Date | Created time | - |
| Status | Single select | Options: "Active", "Unsubscribed" |

### Field-by-Field Instructions:

**Email:**
- Click **"+"** > **"Email"**
- Name: `Email`

**Name:**
- Click **"+"** > **"Single line text"**
- Name: `Name`

**Source:**
- Click **"+"** > **"Single select"**
- Name: `Source`
- Add options:
  - `Homepage`
  - `Coming Soon Page`
  - `Contact Page`

**Subscribed Date:**
- Click **"+"** > **"Created time"**
- Name: `Subscribed Date`

**Status:**
- Click **"+"** > **"Single select"**
- Name: `Status`
- Add options:
  - `Active`
  - `Unsubscribed`
- Set default: `Active`

---

## Table 5: `Testimonials`

**Purpose:** Store customer testimonials and reviews

### Steps to Create:
1. Click **"Add or import"** > **"Create empty table"**
2. Name it: `Testimonials`
3. Add these fields:

| Field Name | Field Type | Configuration |
|------------|------------|---------------|
| Name | Single line text | - |
| Text | Long text | - |
| Rating | Number | Integer, Min: 1, Max: 5 |
| Approved | Checkbox | Default: unchecked |
| DateCreated | Created time | - |

### Field-by-Field Instructions:

**Name:**
- Click **"+"** > **"Single line text"**
- Name: `Name`

**Text:**
- Click **"+"** > **"Long text"**
- Name: `Text`

**Rating:**
- Click **"+"** > **"Number"**
- Name: `Rating`
- Precision: **Integer**
- Click **"Add validation"**
- Min: `1`
- Max: `5`

**Approved:**
- Click **"+"** > **"Checkbox"**
- Name: `Approved`
- Leave unchecked by default

**DateCreated:**
- Click **"+"** > **"Created time"**
- Name: `DateCreated`

---

## Table 6: `FAQs`

**Purpose:** Store FAQ content for the FAQ page

### Steps to Create:
1. Click **"Add or import"** > **"Create empty table"**
2. Name it: `FAQs`
3. Add these fields:

| Field Name | Field Type | Configuration |
|------------|------------|---------------|
| Question | Single line text | - |
| Answer | Long text | - |
| Category | Single select | Options: Products, Services, Orders, Returns, Payment, Workshops, General |
| Order | Number | Integer |
| ClickCount | Number | Integer, Default: 0 |

### Field-by-Field Instructions:

**Question:**
- Click **"+"** > **"Single line text"**
- Name: `Question`

**Answer:**
- Click **"+"** > **"Long text"**
- Name: `Answer`

**Category:**
- Click **"+"** > **"Single select"**
- Name: `Category`
- Add options:
  - `Products`
  - `Services`
  - `Orders`
  - `Returns`
  - `Payment`
  - `Workshops`
  - `General`

**Order:**
- Click **"+"** > **"Number"**
- Name: `Order`
- Precision: **Integer**

**ClickCount:**
- Click **"+"** > **"Number"**
- Name: `ClickCount`
- Precision: **Integer**
- Default value: `0`

---

## Table 7: `FAQ Clicks`

**Purpose:** Track analytics on FAQ interactions

### Steps to Create:
1. Click **"Add or import"** > **"Create empty table"**
2. Name it: `FAQ Clicks`
3. Add these fields:

| Field Name | Field Type | Configuration |
|------------|------------|---------------|
| FAQId | Link to another record | Link to: FAQs table |
| ClickedAt | Created time | - |

### Field-by-Field Instructions:

**FAQId:**
- Click **"+"** > **"Link to another record"**
- Name: `FAQId`
- Choose: **"FAQs"** table
- Click **"Create field"**

**ClickedAt:**
- Click **"+"** > **"Created time"**
- Name: `ClickedAt`

---

## Quick Setup Checklist

After creating all tables, verify you have:

- [ ] Table 1: `contact` ✅ (already exists)
- [ ] Table 2: `Booked` (7 fields)
- [ ] Table 3: `Clients` (12 fields)
- [ ] Table 4: `Newsletter Signups` (5 fields)
- [ ] Table 5: `Testimonials` (5 fields)
- [ ] Table 6: `FAQs` (5 fields)
- [ ] Table 7: `FAQ Clicks` (2 fields)

Total: **7 tables**

---

## Sample Data

### Sample Testimonials

Add these to test (set Approved = checked):

**Testimonial 1:**
- Name: `Sarah M.`
- Text: `A Thyme to Heal transformed my approach to wellness. The custom blends have made such a difference in my daily life!`
- Rating: `5`
- Approved: ✅

**Testimonial 2:**
- Name: `Michael R.`
- Text: `The herbal consultation was incredibly insightful. I finally found natural solutions that work for me.`
- Rating: `5`
- Approved: ✅

**Testimonial 3:**
- Name: `Jennifer L.`
- Text: `Professional, knowledgeable, and genuinely caring. I highly recommend A Thyme to Heal to anyone seeking natural wellness.`
- Rating: `5`
- Approved: ✅

### Sample FAQs

See the current `/app/faq/page.tsx` file for all FAQ content. You'll need to copy each question/answer into Airtable. I'll create a migration script to help with this.

---

## Verification

Test each integration:

### 1. Contact Form
- Go to `/contact`
- Submit a form
- Check Airtable `contact` table
- Should see new record

### 2. Newsletter Signup
- Go to homepage
- Submit newsletter signup
- Check Airtable `Newsletter Signups` table
- Should see new record with Source: "Homepage"

### 3. Booking System
- Click "Book Your Free Consultation"
- Complete full booking flow
- Check Airtable `Booked` table
- Check Airtable `Clients` table
- Should see linked records

### 4. FAQ Clicks
- Go to `/faq`
- Click on an FAQ to expand it
- Check Airtable `FAQ Clicks` table
- Should see new click record
- Check `FAQs` table - ClickCount should increment

### 5. Testimonials
- Homepage should display testimonials from Airtable
- Only shows Approved = true testimonials

---

## Troubleshooting

**Q: API calls failing?**
- Verify table names match exactly (case-sensitive)
- Check field names match exactly
- Confirm API token has read/write permissions

**Q: No data showing on website?**
- Clear browser cache
- Check browser console for errors
- Verify `.env.local` has correct credentials
- Restart Next.js dev server

**Q: 404 errors on API routes?**
- Check API route files exist in `/app/api/`
- Verify Next.js is running (`npm run dev`)

**Q: Linked records not working?**
- Ensure both tables exist before creating link
- Verify link field points to correct table
- Check record IDs are being passed correctly

---

## Next Steps After Setup

1. ✅ Create all 7 tables
2. ✅ Add sample testimonials (3 records, Approved = true)
3. ✅ Migrate FAQ data from code to Airtable
4. Test all integrations
5. Deploy to production
6. Update Vercel environment variables

**Once tables are created, I'll update the code to fetch FAQs and testimonials from Airtable!**
