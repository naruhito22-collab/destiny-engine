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
- Supabase schema + RLS
- placeholder top screen

Next:
1. Rokuyo
2. Tarot
3. I Ching
4. Nine Star Ki
5. Astrology (Caelus candidate)
6. Core score merger
7. Daily Destiny generation
8. ACTION generation via OpenAI Structured Outputs

## Environment

Copy `.env.example` to `.env.local` and set Supabase/OpenAI credentials.
