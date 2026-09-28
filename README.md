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
