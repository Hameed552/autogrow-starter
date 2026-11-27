# IronSight ERP

GCC food & FMCG operations system — lot traceability, FEFO batch costing, UAE VAT, and accounting journal export.

This repo is the production rebuild of IronSight (formerly Base44-hosted). Highest-impact 9.5 work shipped here:

- **Real FG costing** — finished goods inherit FIFO/FEFO lot costs (fixes AED 0.00 unit cost bug)
- **UAE VAT invoices** — 5% split, TRN, emirate
- **Accounting CSV export** — Xero / QBO / Zoho-mapped journals (live OAuth sync next)
- **Trust center** — residency, security roadmap, honest scope (no fake pharma claims)
- **Arabic i18n foundation** — `src/lib/i18n.ts`

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind 4
- Prisma 6 + SQLite (local) — swap `DATABASE_URL` to Postgres for deploy
- zod, date-fns, lucide-react

## Quick start

```bash
npm install
npm run db:reset
npm run test:costing
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — demo workspace **Gulf Fresh Foods LLC**.

## Demo

Seed creates `demo@ironsight.ae` as workspace owner (no auth gate in this build; add NextAuth/Clerk before production).

## Base44 migration

If you have Builder access, export the live app or set:

```
BASE44_API_TOKEN=
BASE44_APP_ID=6aefb83a9b0705a5cbe7b99a
```

Then we can map entities onto this schema.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run db:reset` | Recreate SQLite + seed |
| `npm run test:costing` | Assert unit cost > 0 |
| `npm run build` | Production build |
