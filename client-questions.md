# A Thyme To Heal - Client Decision Guide

This document outlines key decisions needed to guide the implementation of your wellness platform. Please review each section and provide your preferences.

---

## 1. Authentication & User Login

### Question 1.1: Login Methods
Which login methods would you like to offer to your clients?

**Options:**
- [ ] **Email & Password** (Traditional login)
  - Professional appearance
  - Full control over user experience
  - Requires users to remember password
  - Built into Supabase

- [ ] **Google Login** (Social login)
  - One-click signup/login
  - Higher conversion rates
  - No password to remember
  - Requires Google Cloud setup (free)
  - Works with Supabase (NOT Firebase!)

- [ ] **Facebook Login** (Social login)
  - Popular with certain demographics
  - Easy onboarding
  - Requires Facebook Developers setup (free)
  - Works with Supabase

- [ ] **Apple Login** (Social login)
  - Required if you plan iOS app
  - Privacy-focused users prefer it
  - Requires Apple Developer account ($99/year)

**Recommendation:** Start with Email/Password + Google Login for best coverage.

---

### Question 1.2: User Profile Information
What information do you want to collect from clients?

**Basic (Required for any portal):**
- [ ] Full Name
- [ ] Email Address
- [ ] Profile Photo (optional upload)

**Enhanced (For personalized service):**
- [ ] Phone Number
- [ ] Birth Date
- [ ] Mailing Address
- [ ] Emergency Contact

**Health & Wellness (For consultation tracking):**
- [ ] Health Goals
- [ ] Dietary Restrictions/Allergies
- [ ] Current Medications/Supplements
- [ ] Health Conditions
- [ ] Consultation Notes (practitioner only)

**Important:** If collecting health information, we'll need to implement HIPAA-compliant practices including:
- Encrypted storage
- Strict access controls
- Audit logging
- Business Associate Agreement (BAA) with hosting provider

**Your Decision:**
- Which profile fields do you want? _______________________
- Will you store medical/health information? Yes / No
- If yes, do you need HIPAA compliance? Yes / No

---

## 2. Subscription & Membership Tiers

### Question 2.1: Pricing Structure
What subscription tiers would you like to offer?

**Example Structure (modify as needed):**

| Tier | Monthly Price | Annual Price | Features |
|------|---------------|--------------|----------|
| Free | $0 | $0 | Newsletter, Blog access, Limited free videos |
| Basic | $9.99 | $99/year (save $20) | + Access to free videos, Community forum |
| Premium | $29.99 | $299/year (save $60) | + Full video library, Downloadable guides, Monthly group Q&A |
| VIP | $99.99 | $999/year (save $200) | + 1-on-1 consultations, Custom plans, Priority support |

**Your Decision:**
- How many tiers? _______
- What are the price points? _______________________
- What features in each tier? _______________________
- Offer annual discounts? Yes / No

---

### Question 2.2: Free Trial
Would you like to offer a free trial for paid tiers?

- [ ] No free trial (pay immediately)
- [ ] 7-day free trial
- [ ] 14-day free trial
- [ ] 30-day free trial
- [ ] First month discounted (e.g., $1 first month)

**Your Decision:** _______________________

---

## 3. Video Content Strategy

### Question 3.1: Video Categories
What types of video content will you offer?

- [ ] Wellness Workshops (live or recorded)
- [ ] Cooking Demonstrations (herbal recipes, meal prep)
- [ ] Meditation & Mindfulness Guides
- [ ] Herbal Medicine Education
- [ ] Exercise/Movement Classes
- [ ] Consultation Recordings (with client permission)
- [ ] Product Tutorials (how to use products)
- [ ] Seasonal Wellness Series
- [ ] Other: _______________________

---

### Question 3.2: Video Access Control
How should video access be controlled?

- [ ] **By Subscription Tier** (Premium members see all premium videos)
- [ ] **Individual Purchase** (Buy each video/course separately)
- [ ] **Hybrid** (Subscription + option to buy individual courses)
- [ ] **Time-limited** (Access expires after certain period)

**Your Decision:** _______________________

---

### Question 3.3: Initial Video Library
How many videos do you have ready to upload at launch?

- [ ] 0-5 videos (soft launch, build library over time)
- [ ] 5-20 videos (good starting library)
- [ ] 20-50 videos (substantial library)
- [ ] 50+ videos (comprehensive library)

**Your Decision:** _______ videos ready

**Content planning:**
- How often will you add new videos? (weekly, monthly, quarterly) _______
- Average video length? (5-15 min, 15-30 min, 30-60 min, 60+ min) _______

---

## 4. Digital Products & Downloads

### Question 4.1: Product Types
What digital products will you sell?

- [ ] Meal Plans (PDF downloads)
- [ ] Herbal Guides/E-books
- [ ] Recipe Collections
- [ ] Seasonal Wellness Guides
- [ ] Printable Trackers (habit, symptom, mood)
- [ ] Audio Content (meditations, podcasts)
- [ ] Workbooks & Journals
- [ ] Other: _______________________

---

### Question 4.2: Product Pricing
How should digital products be priced?

- [ ] **Included with subscription** (Premium members get all downloads)
- [ ] **Individual purchase** ($5-50 per product)
- [ ] **Product bundles** (3 guides for $30, etc.)
- [ ] **Hybrid** (Some free with subscription, some à la carte)

**Your Decision:** _______________________

**Estimated price range for individual products:** $_______ to $_______

---

## 5. Coming Soon Page Content

### Question 5.1: Launch Timeline
What's your estimated timeline for each feature?

| Feature | Target Date | Priority (High/Medium/Low) |
|---------|-------------|----------------------------|
| Client Portal (login/dashboard) | _________ | _________ |
| Video Library | _________ | _________ |
| Digital Products Store | _________ | _________ |
| Subscription Management | _________ | _________ |
| Online Consultation Booking | _________ | _________ |
| Mobile App | _________ | _________ |

---

### Question 5.2: Newsletter Signup
The coming-soon page has a newsletter signup. Where should signups be stored?

- [ ] **Airtable** (mentioned in current code)
  - Free tier: 1,000 records
  - Easy to view/manage in spreadsheet format
  - Can integrate with automation tools

- [ ] **Supabase Database** (same platform as user accounts)
  - Unlimited in your database
  - Integrated with rest of platform
  - Requires custom admin interface

- [ ] **Email Service Provider** (Mailchimp, ConvertKit, etc.)
  - Built-in email campaign tools
  - Templates and automation
  - Monthly cost ($10-50/month depending on list size)

**Your Decision:** _______________________

---

## 6. Client Portal Features

### Question 6.1: Dashboard Content
What should clients see on their dashboard after logging in?

- [ ] Active subscription status & renewal date
- [ ] Recently watched videos
- [ ] Recommended content based on interests
- [ ] Upcoming consultations/appointments
- [ ] Download history
- [ ] Progress tracking (videos completed, goals achieved)
- [ ] Notifications/announcements
- [ ] Quick links to support/FAQ

**Your priorities (rank 1-3):** _______________________

---

### Question 6.2: Consultation Booking
Do you want online consultation booking in the portal?

- [ ] Yes, build it now (Phase 1)
- [ ] Yes, but later (Phase 2 or 3)
- [ ] No, I prefer phone/email booking
- [ ] Maybe, need to think about it

**If yes, what details:**
- Consultation types? (15 min intro, 60 min deep dive, follow-up, etc.) _______
- Pricing per session? _______________________
- Integrated calendar system? (Calendly, Cal.com, custom) _______
- Payment at booking or invoiced later? _______________________

---

## 7. Technical & Budget Considerations

### Question 7.1: Estimated User Base
How many clients do you expect in the first year?

- [ ] 0-100 clients
- [ ] 100-500 clients
- [ ] 500-1,000 clients
- [ ] 1,000+ clients

**This helps determine:**
- Hosting tier needed (Supabase free tier supports up to ~500 active users)
- Stripe payment processing volume
- Video storage requirements

---

### Question 7.2: Monthly Platform Costs
Are you comfortable with these estimated monthly costs?

**Supabase (Database, Auth, Storage):**
- Free tier: $0/month (up to 500MB database, 1GB storage, 50,000 monthly active users)
- Pro tier: $25/month (8GB database, 100GB storage, 100,000 MAU)
- Note: Will likely need Pro tier once video library grows

**Stripe (Payment Processing):**
- 2.9% + $0.30 per transaction
- Example: 50 subscriptions at $29.99 = $1,499.50 revenue → $49.73 in fees

**Domain & Hosting:**
- Vercel (recommended for Next.js): Free tier available, Pro $20/month
- Domain (athymetoheal.org): ~$12/year

**Email Service (if using for newsletters):**
- Mailchimp/ConvertKit: $10-50/month depending on list size

**Total estimated monthly cost (Year 1):** $25-100/month

**Your Decision:** This budget is: Acceptable / Too high / Need more info

---

### Question 7.3: Development Timeline
What's your ideal timeline for full platform launch?

- [ ] ASAP (1-2 months, MVP approach)
- [ ] 2-3 months (phased rollout)
- [ ] 3-6 months (comprehensive build)
- [ ] Flexible, no rush

**Your Decision:** _______________________

---

## 8. Content & Marketing

### Question 8.1: Social Media Integration
Which social media platforms are you active on?

- [ ] Instagram (handle: _____________)
- [ ] Facebook (page: _____________)
- [ ] Twitter/X (handle: _____________)
- [ ] YouTube (channel: _____________)
- [ ] TikTok (handle: _____________)
- [ ] LinkedIn (profile: _____________)
- [ ] Pinterest (profile: _____________)

**Note:** We'll update the coming-soon page social links with your actual URLs.

---

### Question 8.2: Brand Voice & Messaging
How would you describe your brand voice? (check all that apply)

- [ ] Professional & Scientific
- [ ] Warm & Nurturing
- [ ] Empowering & Motivational
- [ ] Educational & Informative
- [ ] Spiritual & Holistic
- [ ] Approachable & Friendly
- [ ] Other: _______________________

**This helps with:**
- Copy on portal pages
- Email templates
- UI tone and design

---

## 9. Priority Ranking

### Question 9.1: What's Most Important Right Now?
Please rank these features in order of priority (1 = highest priority):

- [ ] _____ Update hero section (DONE!)
- [ ] _____ Client portal with login/signup
- [ ] _____ Video library implementation
- [ ] _____ Digital product store
- [ ] _____ Subscription payment processing
- [ ] _____ Consultation booking system
- [ ] _____ Enhanced coming-soon page
- [ ] _____ Email newsletter integration
- [ ] _____ User profile & health tracking
- [ ] _____ Mobile app (future)

---

## 10. Open Questions & Additional Notes

### Question 10.1: Any Special Requirements?
Are there any specific features, integrations, or requirements not covered above?

_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

### Question 10.2: Inspiration & Reference
Are there any websites or platforms whose functionality you'd like to emulate?

Examples:
- "I like how [website] handles their video library"
- "I want subscription management similar to [platform]"
- "The user dashboard on [site] is clean and simple"

Your references:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

## Next Steps

Once you've completed this questionnaire:

1. Email responses to your developer
2. We'll schedule a call to discuss any clarifications
3. Receive updated project timeline and cost estimate
4. Approve final implementation plan
5. Begin development in phases

**Questions?** Contact your developer with any questions about this document.

---

**Document Version:** 1.0
**Last Updated:** December 18, 2025
**Project:** AThymeToHeal Platform Development
