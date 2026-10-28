-- A Thyme to Heal: replaces the Airtable base (free plan capped at 1,000 API calls/month,
-- which is what broke online booking).
--
-- Access model: the website reads and writes ONLY from server routes using the secret key
-- (service_role, which bypasses RLS). No browser ever talks to the database, so anon and
-- authenticated get no grants and no policies: RLS on + no policy = deny all.
-- The project is created with "Automatically expose new tables" OFF, so every grant is here.

-- ---------------------------------------------------------------------------
-- Bookings (was Airtable "Booked")
-- ---------------------------------------------------------------------------
create table public.bookings (
  id               uuid primary key default gen_random_uuid(),
  date_and_time    timestamptz not null,              -- appointment start, UTC
  first_name       text,
  last_name        text,
  email            text,
  phone            text,
  booking_type     text,
  service_type     text,
  consultant       text check (consultant in ('Heidi Lynn', 'Illiana')),  -- null = manual block, blocks both
  duration         integer not null default 30,       -- minutes
  price            numeric(10, 2),
  user_timezone    text,
  user_local_time  text,
  notes            text,
  airtable_id      text unique,                       -- set only on rows copied from Airtable
  created_at       timestamptz not null default now()
);
create index bookings_date_and_time_idx on public.bookings (date_and_time);
alter table public.bookings enable row level security;

-- ---------------------------------------------------------------------------
-- Advisor days off (was "Advisor Days Off")
-- ---------------------------------------------------------------------------
create table public.advisor_days_off (
  id           uuid primary key default gen_random_uuid(),
  date         date not null,
  consultant   text not null check (consultant in ('Heidi Lynn', 'Illiana')),
  all_day      boolean not null default true,
  start_time   text check (start_time ~ '^([01]\d|2[0-3]):[0-5]\d$'),  -- HH:MM Mountain Time
  end_time     text check (end_time ~ '^([01]\d|2[0-3]):[0-5]\d$'),
  reason       text,
  airtable_id  text unique,
  created_at   timestamptz not null default now()
);
create index advisor_days_off_date_idx on public.advisor_days_off (date);
alter table public.advisor_days_off enable row level security;

-- ---------------------------------------------------------------------------
-- Clients (was "Clients"; health intake answers, keep server-only)
-- ---------------------------------------------------------------------------
create table public.clients (
  id                        uuid primary key default gen_random_uuid(),
  first_name                text,
  last_name                 text,
  email                     text,
  phone                     text,
  preferred_contact_method  text,
  consent                   boolean not null default false,
  health_goals              text,
  dietary_restrictions      text,
  current_medications       text,
  health_conditions         text,
  airtable_id               text unique,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create index clients_email_idx on public.clients (lower(email));
create index clients_phone_idx on public.clients (phone);
alter table public.clients enable row level security;

-- ---------------------------------------------------------------------------
-- Contact form, newsletter, testimonials, FAQs, coming-soon
-- ---------------------------------------------------------------------------
create table public.contacts (
  id           uuid primary key default gen_random_uuid(),
  first_name   text,
  last_name    text,
  email        text,
  phone        text,
  subject      text,
  message      text,
  source       text,
  airtable_id  text unique,
  created_at   timestamptz not null default now()
);
alter table public.contacts enable row level security;

create table public.newsletter_signups (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  name         text,
  source       text,
  status       text not null default 'Active',
  airtable_id  text unique,
  created_at   timestamptz not null default now()
);
alter table public.newsletter_signups enable row level security;

create table public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  text         text,
  rating       integer check (rating between 1 and 5),
  approved     boolean not null default false,       -- new submissions wait for approval
  airtable_id  text unique,
  created_at   timestamptz not null default now()
);
alter table public.testimonials enable row level security;

create table public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  answer       text not null,
  category     text,
  sort_order   integer,
  click_count  integer not null default 0,
  airtable_id  text unique,
  created_at   timestamptz not null default now()
);
alter table public.faqs enable row level security;

create table public.coming_soon_features (
  id             uuid primary key default gen_random_uuid(),
  title          text,
  description    text,
  icon           text,
  eta            text,
  status         text,
  priority       text,
  display_order  integer,
  is_visible     boolean not null default false,
  airtable_id    text unique,
  created_at     timestamptz not null default now()
);
alter table public.coming_soon_features enable row level security;

-- ---------------------------------------------------------------------------
-- Grants: server key only
-- ---------------------------------------------------------------------------
revoke all on
  public.bookings, public.advisor_days_off, public.clients, public.contacts,
  public.newsletter_signups, public.testimonials, public.faqs, public.coming_soon_features
from anon, authenticated;

grant select, insert, update, delete on
  public.bookings, public.advisor_days_off, public.clients, public.contacts,
  public.newsletter_signups, public.testimonials, public.faqs, public.coming_soon_features
to service_role;
