# DESTINY ENGINE

MVP implementation scaffold for **運命演算 / DESTINY ENGINE**.

## Architecture

6 divination engines → Daily Destiny Data → ACTION / ORACLE

AI never calculates or changes the divination result. It only turns structured, precomputed data into readable ACTION/ORACLE output.

## Current status

Implemented scaffold:
- Next.js App Router
- TypeScript domain types
- Numerology v1
- deterministic Daily Seed
- Rokuyo calculation + Gregorian→kyureki server provider
- Supabase schema + RLS
- placeholder top screen

Next:
1. I Ching resulting-hexagram calculation
2. Nine Star Ki
3. Astrology (Caelus candidate)
4. Core score merger
5. Daily Destiny generation
6. ACTION generation via OpenAI Structured Outputs

## Kyureki provider

The Gregorian→kyureki lookup is isolated in `lib/server/kyureki.ts`.
MVP currently uses Shirabe as the provider and verifies its returned Rokuyo
against DESTINY ENGINE's own Rokuyo formula. This provider is intentionally
replaceable so the engine is not permanently coupled to one external service.

## Environment

Copy `.env.example` to `.env.local` and set Supabase/OpenAI credentials.


## MVP runtime setup

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY`
- `DESTINY_SEED_SALT`
- optional `OPENAI_MODEL` (default: `gpt-5.6-luna`)
- optional `KYUREKI_API_BASE_URL`

Database:

1. Apply `supabase/migrations/20260928_001_initial.sql`.
2. Enable email OTP / magic-link authentication in Supabase Auth.
3. Add the deployed app URL plus `/auth/callback` to allowed redirect URLs.

Current browser flow:

`email login → profile → Daily Destiny → ACTION → saved action`

The database unique constraints preserve one Daily Destiny row per user/date/engine version and one ACTION row per Daily Destiny record.
