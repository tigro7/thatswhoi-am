-- Migration 002: enrichment fields
-- Run in Supabase SQL Editor

alter table public.profiles add column if not exists linkedin_url text;
alter table public.profiles add column if not exists github_url text;
alter table public.profiles add column if not exists website_url text;
alter table public.profiles add column if not exists contact_email text;
alter table public.profiles add column if not exists skills text[] default '{}';

alter table public.experiences add column if not exists description text;

-- Grant new columns to existing roles
grant update (linkedin_url, github_url, website_url, contact_email, skills) on public.profiles to authenticated;
grant update (description) on public.experiences to authenticated;
grant update (linkedin_url, github_url, website_url, contact_email, skills) on public.profiles to service_role;
grant update (description) on public.experiences to service_role;
