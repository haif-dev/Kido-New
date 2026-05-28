# Kido

Babysitting marketplace for Algeria (FR + AR). Monorepo for web (Next.js),
mobile (Expo / React Native), and shared packages, with Supabase as the
backend.

> **Rename first**: `pnpm rename my-app MyApp`
> (runs `scripts/rename.sh` to find/replace the placeholder everywhere)

---

## Structure

```
my-app/
├── apps/
│   ├── web/           Next.js 14 (App Router) — parent web app + marketing + /admin
│   └── mobile/        Expo (React Native) — iOS + Android
├── packages/
│   ├── ui/            Design tokens (colors, typography, spacing) + components
│   ├── lib/           Domain types, Zod validation, Supabase client factories
│   ├── i18n/          FR + AR translations, RTL helpers
│   └── config/        Shared tsconfig, eslint, tailwind preset
├── supabase/
│   ├── migrations/    SQL schema (versioned)
│   ├── functions/     Edge functions (Deno)
│   └── templates/     Email templates
└── scripts/
    └── rename.sh
```

## Stack

| Layer | Tech |
|---|---|
| Web | Next.js 14, Tailwind, App Router with `[locale]` segment |
| Mobile | Expo (React Native) + Expo Router |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Payments | Chargily Pay (Algerian fintech — supports CIB + EDAHABIA) |
| Maps | Mapbox |
| Email | Resend |
| Monorepo | pnpm workspaces + Turborepo |

## Aesthetic direction

Warm modernist — terracotta `#C45A3F`, cream `#FBF7F2`, forest green `#2D5544`,
marigold accent `#E8A82C`. Display font **Fraunces** (serif), body **Manrope**,
Arabic **Tajawal**. Deliberately **not** generic teal — we want the look to
feel warm, trustworthy, and editorial.

All tokens live in `packages/ui/src/tokens/` and the Tailwind preset at
`packages/config/tailwind/preset.js`. Change them in one place; both apps
update.

## Prerequisites

- **Node 20.11+** (`.nvmrc` provided)
- **pnpm 9+** — `npm i -g pnpm`
- **Supabase CLI** — `brew install supabase/tap/supabase` (or see docs)
- For mobile: **Expo Go** app on your phone, or Xcode / Android Studio

## First-time setup

```bash
# 1. Install
pnpm install

# 2. Rename (recommended early — touches many files)
pnpm rename my-real-name MyRealName

# 3. Copy env templates
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local

# 4. Start the local database + apply migrations
pnpm db:start
# (the CLI prints local URL + anon key — paste them into the .env files)

# 5. Generate TypeScript types from the schema
pnpm db:types

# 6. Run apps
pnpm dev:web      # http://localhost:3000
pnpm dev:mobile   # opens Expo
```

## Algeria-specific notes

- **Payments**: Stripe doesn't operate in Algeria. Use [Chargily Pay](https://chargily.com)
  for CIB / EDAHABIA card payments. Recommended v1 model: parents pay sitters
  in cash; the platform monetizes via a Chargily-based subscription.
- **Phone numbers**: stored in E.164 (`+213...`), Algerian mobile = `+213[5-7]\d{8}`.
- **RTL**: every screen built with logical properties so Arabic flips
  automatically. Confirm before shipping any new screen.
- **Hosting region**: Vercel `cdg1` (Paris) + Supabase EU West (Ireland or
  Frankfurt) — best latency to Algeria.

## What's in this skeleton

- ✅ Workspace + Turbo + pnpm
- ✅ Shared design tokens + Tailwind preset
- ✅ i18n (FR + AR) with RTL helpers
- ✅ Initial Supabase schema with RLS policies on every table
- ✅ Auth trigger that creates a `profiles` row on signup
- ✅ Email confirmation template
- ✅ Web app boots with locale-routed marketing page
- ✅ Mobile app boots with welcome screen
- ✅ CI workflow

## What lands next (Phase 2)

- Onboarding carousel (auto-rotating + swipeable)
- Sign-up / sign-in screens with social providers
- Email-verification screen + resend flow
- Account type picker (sitter / nanny / parent)
- Map-based search + filters
- Conversation list + thread view
