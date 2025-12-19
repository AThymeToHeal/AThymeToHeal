# Airtable Schema Fix Required

## Problem

The Airtable tables were created with an older schema that doesn't match the current code. This causes booking errors with the message:

```
Unknown field name: "dateAndTime"
```

## Solution Options

### Option 1: Delete and Recreate Tables (Recommended if no important data)

**WARNING: This will delete all existing records in these tables!**

1. Go to your Airtable base: https://airtable.com
2. Delete these tables:
   - Booked
   - Clients (if it exists)
   - Newsletter Signups (if it exists)
   - Testimonials (if it exists)
   - FAQ Clicks (if it exists)

3. Run the setup script to recreate them:
   ```bash
   npm run setup-tables
   ```

4. Repopulate the FAQ data:
   ```bash
   npm run migrate-faqs
   ```

5. Add sample testimonials in Airtable (at least 3 with Approved=true)

---

### Option 2: Manually Update Field Names (If you have data to preserve)

#### Booked Table Changes:

1. **Add new fields:**
   - `dateAndTime` - Type: Date and time (set timezone to UTC)
   - `FirstName` - Type: Single line text
   - `LastName` - Type: Single line text
   - `BookingType` - Type: Single select (options: Initial Consultation, Follow-up, Package Session)
   - `UserTimezone` - Type: Single line text
   - `UserLocalTime` - Type: Single line text

2. **Delete old fields** (after migrating data if needed):
   - `Date`
   - `Time`
   - `Timezone`
   - `DateCreated`

#### Clients Table Changes:

1. **Add new field:**
   - `Consent` - Type: Checkbox

2. **Delete field:**
   - `BestTimeToContact`

3. **Update DateCreated timezone:**
   - Click the field settings
   - Change timezone from America/New_York to America/Denver

#### Newsletter Signups Table Changes:

1. **Rename field:**
   - Rename `DateCreated` to `Subscribed Date`

2. **Add new field:**
   - `Status` - Type: Single select (options: Active, Unsubscribed)

3. **Update timezone:**
   - Click the "Subscribed Date" field settings
   - Change timezone from America/New_York to America/Denver

#### FAQ Clicks Table Changes:

1. **Update linked field name:**
   - Rename `FAQRecord` to `FAQId` (if it exists)

#### All DateTime Fields:

Update timezone from `America/New_York` to `America/Denver` for consistency.

---

## Verification

After making changes, test the booking flow:

1. Go to your website
2. Click "Book a Consultation"
3. Select a date and time
4. Fill out the form
5. Submit

If it works without errors, the schema is correct!

---

## Current Schema Reference

### Booked Table
- dateAndTime (Date and time, UTC timezone)
- FirstName (Single line text)
- LastName (Single line text)
- Email (Email)
- BookingType (Single select)
- UserTimezone (Single line text)
- UserLocalTime (Single line text)
- *Linked field:* BookedRecord (links to Clients table)

### Clients Table
- FirstName (Single line text)
- LastName (Single line text)
- Email (Email)
- Phone (Phone number)
- HealthGoals (Long text)
- DietaryRestrictions (Long text)
- CurrentMedications (Long text)
- HealthConditions (Long text)
- PreferredContactMethod (Single select: Email, Phone, Text)
- Consent (Checkbox)
- DateCreated (Date and time, America/Denver timezone)
- *Linked field:* BookedRecord (links to Booked table)

### Newsletter Signups Table
- Email (Email)
- Name (Single line text)
- Source (Single select: Homepage, Contact Page, Coming Soon Page)
- Subscribed Date (Date and time, America/Denver timezone)
- Status (Single select: Active, Unsubscribed)

### Testimonials Table
- Name (Single line text)
- Text (Long text)
- Rating (Number)
- Approved (Checkbox)
- DateCreated (Date and time, America/Denver timezone)

### FAQs Table
- Question (Single line text)
- Answer (Long text)
- Category (Single select)
- Order (Number)
- ClickCount (Number)

### FAQ Clicks Table
- ClickedAt (Date and time, America/Denver timezone)
- *Linked field:* FAQId (links to FAQs table)

### contact Table
(This table already exists and should not be modified)
- FirstName (Single line text)
- LastName (Single line text)
- Email (Email)
- Phone (Phone number)
- Message (Long text)
- Source (Single line text)
- DateCreated (Date and time)
