# Gimmee

Travel-compensation prototype for delayed trains and British Airways flight-claim preparation.

## Features

- **Clerk auth** — multi-user accounts
- **Manual report flow** — search Realtime Trains, pick a service, enter ticket details
- **DR15 eligibility engine** — single / return / contactless / season
- **TfL connection prototype** — a browser-local linked-account state for demonstrating the contactless journey-proof flow
- **Daytona verification** — a contactless claim creates a prototype journey-proof record, checks it in an isolated sandbox, then deletes the sandbox
- **Flight claims** — British Airways evidence form and an optional AI-backed readiness review
- **Claim summaries** — copy-ready text + links to operator claim portals
- **Dashboard** — delay feed + open compensation total + automation status

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com) (or pause/upgrade an existing free project if you hit the free-project limit).
2. From **Project Settings → API**, copy the Project URL and **service role** key.
3. From **Connect**, copy:
   - **Transaction pooler** URL → `DATABASE_URL` (port `6543`, append `?pgbouncer=true`)
   - **Session pooler** (or direct) URL → `DIRECT_URL` (port `5432`)
4. Apply the private storage bucket (SQL Editor or `supabase db push` after `supabase link`):

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'claim-evidence',
  'claim-evidence',
  false,
  10485760,
  array['application/pdf', 'text/csv', 'application/octet-stream', 'image/png', 'image/jpeg']
)
on conflict (id) do nothing;
```

Leave the bucket **private** (no public policies). The app uploads/downloads with the service role key.

### 2. App

```bash
npm install
npx playwright install chromium   # only needed for CLAIM_SUBMIT_MODE=live (local)
cp .env.example .env
# Fill Supabase + Clerk keys (required)
# Optional: RTT_TOKEN from api-portal.rtt.io
# Set CREDENTIALS_ENCRYPTION_KEY (required in production)
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

1. Link the prototype TfL account at [/settings](http://localhost:3000/settings).
2. Report a delay at [/report](http://localhost:3000/report). For a contactless journey, Gimmee runs the Daytona proof-check step when the claim is submitted.

Without RTT credentials, the report wizard uses **demo mock services** (27-minute delay).

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase transaction pooler (`:6543`, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase session/direct URL for Prisma migrate (`:5432`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for Storage |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `RTT_TOKEN` | Realtime Trains portal token ([api-portal.rtt.io](https://api-portal.rtt.io/)) |
| `RTT_USERNAME` / `RTT_PASSWORD` | Legacy `api.rtt.io` Basic Auth (deprecated Sep 2026) |
| `CLAIM_SUBMIT_MODE` | `mock` (default; use on Vercel) or `live` Playwright (local only) |
| `CREDENTIALS_ENCRYPTION_KEY` | Encrypts stored TOC/TfL passwords (required in production) |
| `MOLLIE_API_KEY` | Mollie API key for 20% success fee checkout |
| `MOLLIE_CHARITY_ORG_ID` | Connected Mollie org receiving the 5% charity split |
| `NEXT_PUBLIC_APP_URL` | Public base URL for Mollie redirect + webhook |
| `DAYTONA_API_KEY` | Server-side API key used to create the temporary evidence-verification sandbox |
| `DAYTONA_TARGET` | Optional Daytona region/target override |
| `OPENAI_API_KEY` | Optional server-side key for the Flight Claim Agent; without it the agent uses a local demo review |

## Daytona sandbox verification

For a contactless train claim, Gimmee automatically creates a small **prototype journey-proof record** from the selected journey. If `DAYTONA_API_KEY` is configured, the server:

1. Creates an ephemeral, network-blocked Daytona sandbox.
2. Uploads the generated proof record and checks that it is non-empty.
3. Deletes the sandbox and its temporary file.

The contactless-claim screen makes the result visible: it shows either **“Daytona sandbox verification completed”** or an explicit prototype fallback if Daytona is unavailable.

This is a sandbox/file-integrity check only. It does **not** access a real TfL Contactless & Oyster account or retrieve private TfL journey data. A production connection would require an approved TfL integration.

### Deploy to Vercel

1. Push the repo and import the project on Vercel.
2. Set all env vars from `.env.example` (use `CLAIM_SUBMIT_MODE=mock`).
3. In Clerk, add the Vercel domain to allowed origins / redirect URLs.
4. Deploy — `npm run build` runs `prisma migrate deploy` then `next build`.

Do **not** set `CLAIM_SUBMIT_MODE=live` on Vercel: Playwright/Chromium is not supported on standard Functions.

## Scripts

- `npm run dev` — Next.js dev server
- `npm test` — Vitest (DR15 eligibility)
- `npm run db:migrate` — apply Prisma migrations (`prisma migrate deploy`)
- `npm run db:push` — push schema without migration history (dev only)
- `npm run build` — migrate + production build

## Compensation rules

Aligned with SWR / Southeastern published tables:

| Delay | Single / Contactless | Return | Season |
| --- | --- | --- | --- |
| 15–29 | 25% | 12.5% | 25% of journey rate |
| 30–59 | 50% | 25% | 50% of journey rate |
| 60–119 | 100% | 50% | 100% of journey rate |
| 120+ | 100% | 100% | return journey rate (2×) |

Season journey rate = price ÷ (10 weekly / 16 flexi / 40 monthly / 120 quarterly / 464 annual).
Contactless base = TfL-charged fare for the matched journey (fallback: entered ticket price).
