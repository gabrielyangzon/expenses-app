# Expense Tracker

A small, two-person shared expense tracker. RoseAnn and Gabriel each log what they
spend, and the app answers the question the two of them actually care about:
**who has spent more this month, and by how much?**

Expenses are recorded in euros and shown alongside a Philippine peso equivalent,
converted at the exchange rate that was published on the day of each expense — not
today's rate — so past months don't quietly change value as the currency moves.

Built with Next.js (App Router), Drizzle ORM, and Neon Postgres.

## Features

- **Month-at-a-glance dashboard** — total spent, a per-person breakdown, and the
  running difference between the two payers ("Gabriel spent more", or "Even").
- **Calendar or list view** — the month grid groups each day's expenses into
  colour-coded pills; the list view is the default on narrow screens. Toggle at will.
- **Per-day currency conversion** — EUR totals are authoritative; PHP equivalents use
  each expense date's own historical rate, carried forward across weekends and
  holidays when no rate was published.
- **Add, edit, delete** — adding happens inline on the dashboard with a confirmation
  message; editing and deleting live on a per-expense page.
- **Categories and payers** — Food, Transport, Housing, Utilities, Entertainment,
  Health, Other; split between two named payers. Both are Postgres enums, so the
  database rejects anything else.

## Getting started

**Prerequisites:** Node.js and a [Neon](https://console.neon.tech) Postgres database
(the free tier is plenty).

```bash
npm install

# Point the app at your database
cp .env.example .env.local   # then edit DATABASE_URL

# Create the expenses table
npm run db:push

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`DATABASE_URL` is required — both the app and `drizzle-kit` read it from
`.env.local`, which is gitignored. Never put a real connection string in
`.env.example`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check |
| `npm run db:push` | Push `db/schema.ts` straight to Neon — the normal schema workflow |
| `npm run db:generate` | Generate SQL migration files |
| `npm run db:migrate` | Apply generated migrations |
| `npm run db:studio` | Open Drizzle Studio |

There is no test suite in this repo.

Schema changes go through `db:push` rather than generate/migrate: this is a small
single-user app, and a reviewable migration history isn't worth the ceremony. The
migration scripts exist if that ever changes.

> **Note:** `tsc` and `eslint` do not catch every error in this stack — some, like
> exporting a non-function from a `"use server"` file, only surface during
> `npm run build`. Run the build before assuming a change is good.

## How it's put together

```
app/
  page.tsx              Dashboard: month totals, add form, calendar/list
  actions.ts            Server Actions — create / update / delete
  expenses/[id]/edit/   Edit + delete page for a single expense
  components/           Form, calendar, list, month nav
  lib/                  Month arithmetic, exchange rates, payer colours
db/
  schema.ts             The single `expenses` table (source of truth for enums)
  queries.ts            Read-only, month-scoped queries
  index.ts              Drizzle client singleton
```

A few decisions worth knowing before changing things:

- **Money is never floating-point.** `amount` is `numeric(10,2)` and comes back from
  Drizzle as a string. Sums are done in SQL (`SUM`, `GROUP BY`), never reduced in JS.
- **Validation lives in the Server Actions**, not just in the form, because Server
  Actions are directly reachable by POST.
- **The category and payer lists are declared once** in `db/schema.ts` and reused for
  both the Postgres enums and the `<select>` options.
- **Light theme is deliberate.** `color-scheme: light` is set globally and no `dark:`
  variants are used anywhere — that's a choice, not an oversight.

Exchange rates come from [Frankfurter](https://frankfurter.dev), cached for an hour,
with a fallback rate if the API is unreachable so the dashboard never fails to render.

## Deployment

Deployed on [Vercel](https://vercel.com); pushes to `main` trigger a production
deploy. Set `DATABASE_URL` in the project's environment variables.

## Contributing notes

`CLAUDE.md` and `AGENTS.md` hold working notes for AI coding agents, including the
ways this version of Next.js differs from what a model is likely to assume. Worth a
skim before making changes.
