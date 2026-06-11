-- DRX Supabase Database Schema
-- Paste this into Supabase Dashboard > SQL Editor > New Query > Run

-- Enable UUID support
create extension if not exists "pgcrypto";

-- =========================
-- Admin Users
-- =========================
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- =========================
-- Pre-launch Registrations
-- =========================
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  organization text,
  role text,
  plan text,
  description text,
  lead_score integer default 0,
  lead_label text default 'Cold Lead',
  status text default 'New',
  source text default 'Pre-launch Form',
  created_at timestamptz not null default now()
);

create index if not exists idx_registrations_email on registrations(email);
create index if not exists idx_registrations_status on registrations(status);
create index if not exists idx_registrations_lead_label on registrations(lead_label);
create index if not exists idx_registrations_created_at on registrations(created_at desc);

-- =========================
-- Demo Requests
-- =========================
create table if not exists demo_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  organization text,
  problem_type text default 'General Demo',
  description text,
  status text default 'New Demo Request',
  created_at timestamptz not null default now()
);

create index if not exists idx_demo_requests_email on demo_requests(email);
create index if not exists idx_demo_requests_status on demo_requests(status);
create index if not exists idx_demo_requests_created_at on demo_requests(created_at desc);

-- =========================
-- Demo Alerts
-- =========================
create table if not exists demo_alerts (
  id uuid primary key default gen_random_uuid(),
  demo_request_id uuid references demo_requests(id) on delete cascade,
  title text not null,
  priority text default 'Normal',
  status text default 'New',
  message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_demo_alerts_demo_request_id on demo_alerts(demo_request_id);
create index if not exists idx_demo_alerts_priority on demo_alerts(priority);
create index if not exists idx_demo_alerts_status on demo_alerts(status);
create index if not exists idx_demo_alerts_created_at on demo_alerts(created_at desc);

-- =========================
-- Assistant Messages
-- =========================
create table if not exists assistant_messages (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text,
  visitor_email text default 'Anonymous',
  created_at timestamptz not null default now()
);

create index if not exists idx_assistant_messages_visitor_email on assistant_messages(visitor_email);
create index if not exists idx_assistant_messages_created_at on assistant_messages(created_at desc);

-- =========================
-- Optional: Contact Messages
-- Useful later if you add a contact form
-- =========================
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text default 'New',
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_email on contact_messages(email);
create index if not exists idx_contact_messages_status on contact_messages(status);
create index if not exists idx_contact_messages_created_at on contact_messages(created_at desc);

-- =========================
-- Row Level Security
-- =========================
-- Backend uses SUPABASE_SERVICE_ROLE_KEY, so it can access tables securely from server.
-- Do NOT expose service role key in frontend.

alter table admins enable row level security;
alter table registrations enable row level security;
alter table demo_requests enable row level security;
alter table demo_alerts enable row level security;
alter table assistant_messages enable row level security;
alter table contact_messages enable row level security;

-- No public frontend policies are added here.
-- All inserts/selects should go through your Express backend.
-- This is safer for admin login, email notifications, and lead scoring.

-- =========================
-- Test Queries
-- =========================
-- select * from registrations order by created_at desc;
-- select * from demo_requests order by created_at desc;
-- select * from demo_alerts order by created_at desc;
-- select * from assistant_messages order by created_at desc;
