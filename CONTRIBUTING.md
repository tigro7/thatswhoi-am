# Contributing

Progetto personale. Queste convenzioni mantengono la git history leggibile.

## Commit Message Convention

Segue [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | Quando usarlo |
|---|---|
| `feat` | Nuova funzionalità |
| `fix` | Bug fix |
| `chore` | Manutenzione, dipendenze, config |
| `docs` | Solo documentazione |
| `refactor` | Ristrutturazione senza cambi di comportamento |
| `perf` | Miglioramento performance |
| `security` | Hardening auth, permessi, RLS |

### Scopes

| Scope | Cosa copre |
|---|---|
| `auth` | Flusso login/signup, Supabase Auth, callback email |
| `onboarding` | Pagine `/login`, `/onboarding`, `/enrich` |
| `templates` | `AdapterTemplate`, `ClimberTemplate`, `BuilderTemplate` |
| `shared` | Componenti in `components/profile/shared/` |
| `api` | Route API (`generate-headline`, `save-profile`, `infer-sector`, ecc.) |
| `archetype` | Algoritmo di scoring in `lib/archetype.ts` |
| `pdf` | Export PDF (`api/export-pdf`) |
| `db` | Migrazioni Supabase (`supabase/migrations/`) |
| `deploy` | Configurazione Vercel, env vars |

### Esempi

```
feat(onboarding): add AI sector inference with debounce
fix(auth): handle silent null response for unconfirmed email
refactor(templates): extract shared ProfileHeader and ContactLinks
feat(pdf): add server-side PDF export via Puppeteer
security(db): grant missing privileges to service_role
chore(deps): bump @anthropic-ai/sdk to latest
fix(api): replace supabase-js with direct REST call in save-profile
```

### Regole

- **Imperativo** nella descrizione: "add", non "added" o "adds"
- Prima riga **sotto 72 caratteri**
- **Niente punto** finale nella descrizione
- Breaking changes con `!` dopo il type: `feat(api)!: change save-profile body shape`

## Stack di riferimento

- **Framework**: Next.js 16 (App Router, no `src/` dir, alias `@/*` → root)
- **Auth + DB**: Supabase (Postgres + Supabase Auth)
- **AI**: Anthropic Claude API — Sonnet per headline/descrizioni, Haiku per inferenza settore
- **Email**: Resend via SMTP custom su Supabase
- **Styling**: Tailwind CSS puro, nessuna libreria di componenti
- **Deploy**: Vercel (`onepagecv-theta.vercel.app`)
- **Repo**: `github.com/tigro7/thatswhoi-am`

## Note operative

- Le variabili d'ambiente sensibili sono in `.env.local` (ignorato da git). Per il deploy aggiornarle su Vercel.
- Il `SUPABASE_SERVICE_ROLE_KEY` bypassa RLS — usarlo solo nelle route API server-side.
- Prima di ogni push con `git push`, fare `gh auth switch --user tigro7` per usare l'account personale invece di quello aziendale.
- Le migrazioni SQL vanno eseguite manualmente su **Supabase → SQL Editor** — non esiste una pipeline di migrazione automatica.
