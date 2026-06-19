# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versions before 1.0.0 follow zero-based semver — minor bumps are features, patch bumps are fixes and polish.

---

## [Unreleased]

---

## [0.4.0] — 2026-06-15

### Added
- Dynamic OG image endpoint (`/api/og`, edge runtime, 1200×630) — branded default card and personalized profile card with name, headline, and archetype label fetched from Supabase
- `og:title`, `og:image`, and canonical URL (`alternates.canonical`) on every page via Next.js `metadataBase`
- Twitter `summary_large_image` card on all pages
- Route-group layouts for `(auth)` and `(onboarding)` carrying `robots: noindex` — private flows excluded from search indexing
- `.env.example` template committed to repo

---

## [0.3.0] — 2026-06-15

### Added
- Three distinct profile templates, each matching an archetype automatically:
  - **Adapter** — horizontal journey with purple sector badges, 3-stat grid, detail list with descriptions
  - **Builder** — 2-column experience grid with orange sector badges, stats for projects and sectors
  - **Climber** — vertical growth timeline (unchanged visual, refactored to shared components)
- Shared component layer in `components/profile/shared/`: `ProfileHeader`, `ProfileFooter`, `ContactLinks`, `SkillTags`, `ArchetypeCard`, and shared `types.ts`
- `isPrint` prop on all templates; `?print=true` query param suppresses owner controls and footer for PDF rendering
- PDF export button (owner-only) linking to `/api/export-pdf/[slug]`
- `archetype` field properly drives template selection in `[slug]/page.tsx`; `climber` is the fallback for null/undefined

### Changed
- All three templates refactored to import from `components/profile/shared/` — no UI logic duplication
- `[slug]/page.tsx` routing updated to a clean `if/else if/else` chain

---

## [0.2.0] — 2026-06-14

### Added
- `/enrich` page: optional enrichment step after first publish — AI-generated experience descriptions (Claude Sonnet, shown as animated skeletons while generating), contact links (LinkedIn, GitHub, website, public email), and skill tags (max 12, Enter-to-add, ×-to-remove)
- `/api/generate-descriptions`: generates 1–2 sentence CV-style descriptions per experience via Claude Sonnet; returns empty array on parse failure so the page degrades gracefully
- `/api/save-enrich`: REST admin route (service role key) that PATCHes `profiles` and individual `experiences` rows
- Owner-only enrichment CTA banner on `[slug]` page — hidden once the profile has any contact link, description, or skill
- `description` field on all experience cards across all three templates (conditional, no empty placeholders)
- `skills` pill section and `contacts` section on all templates (conditional)
- `supabase/migrations/002_enrichment.sql`: adds `linkedin_url`, `github_url`, `website_url`, `contact_email`, `skills[]` to `profiles` and `description` to `experiences`

### Fixed
- `save-profile` replaced Supabase JS client with direct REST API calls — JS client was silently ignoring the service role key due to missing table-level GRANT privileges
- `GRANT` statements added for `service_role`, `authenticated`, and `anon` on both `profiles` and `experiences` tables

---

## [0.1.1] — 2026-06-14

### Fixed
- Auth flow now saves profile via `/api/save-profile` (service role, bypasses RLS) for both signup and login — eliminates 404 after redirect
- `auth/callback` route handles both PKCE (`exchangeCodeForSession`) and token-hash (`verifyOtp`) flows
- Homepage forwards `/?code=...` to `/auth/callback` as safety net for misconfigured Supabase redirect URLs
- "Already registered" message now surfaces correctly when Supabase returns silent null for unconfirmed emails
- Removed all debug `console.log` from `AuthGate`; errors now surface as inline UI messages

### Added
- Sector auto-inference via Claude Haiku (`/api/infer-sector`) — replaces manual sector dropdown in the experience form; badge appears after 700ms debounce, editable if wrong
- `sessionStorage` persistence for all onboarding state — back button, refresh, and accidental navigation no longer lose data
- "← Modifica esperienze" sticky bar in preview phase
- `AuthGate` check-email state with 📬 screen shown when Supabase email confirmation is pending
- Resend SMTP integration for Supabase transactional emails; custom dark-theme email template
- `/auth/callback` route with post-confirmation redirect to `/{slug}`

---

## [0.1.0] — 2026-05-25

### Added
- Next.js 16 (App Router) project scaffold with TypeScript, Tailwind CSS, `@supabase/ssr`, `@anthropic-ai/sdk`
- Supabase schema: `profiles` and `experiences` tables with RLS policies
- Archetype scoring algorithm (`lib/archetype.ts`) — classifies careers as **Adapter**, **Climber**, or **Builder** based on tenure, company count, and sector variance
- Claude Sonnet headline generation (`/api/generate-headline`) — Italian personal branding copy, archetype-aware prompt
- Auth-last onboarding flow: name → slug → experiences → AI generation → profile preview → signup/login → publish
- `/api/check-slug` with debounced availability check; accepts letters, numbers, hyphens, dots, underscores
- Slug auto-generated from name (`nome.cognome`), manually editable
- `GeneratingScreen` with animated step list during AI generation
- `ExperienceForm` with add/remove, years input
- Three profile templates (initial versions): `AdapterTemplate` with `SkillConstellation` SVG, `ClimberTemplate` with `GrowthTimeline`, `BuilderTemplate` with `ImpactGrid`
- Public `[slug]` page as SEO-friendly server component with `generateMetadata`
- Deployed to Vercel; env vars set via Vercel CLI; repo at `github.com/tigro7/thatswhoi-am`

[Unreleased]: https://github.com/tigro7/thatswhoi-am/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/tigro7/thatswhoi-am/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/tigro7/thatswhoi-am/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/tigro7/thatswhoi-am/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/tigro7/thatswhoi-am/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/tigro7/thatswhoi-am/releases/tag/v0.1.0
