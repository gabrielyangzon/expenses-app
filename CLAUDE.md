# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server (http://localhost:3000)
npm run build         # production build
npm run lint          # eslint
npx tsc --noEmit      # type-check (no separate script defined)

npm run db:push       # push db/schema.ts straight to Neon (primary workflow, see below)
npm run db:generate   # generate SQL migration files
npm run db:migrate    # apply generated migrations
npm run db:studio     # open Drizzle Studio against DATABASE_URL
```

There is no test suite in this repo.

`DATABASE_URL` must be set in `.env.local` (gitignored) for the app and for `drizzle-kit` to reach the Neon database. `.env.example` holds only a placeholder and is deliberately excluded from the `.env*` gitignore pattern (`!.env.example` in `.gitignore`) so it can be committed — never put a real connection string in it.

Schema changes: edit `db/schema.ts`, then run `npm run db:push`. This project intentionally uses `push` (not `generate`/`migrate`) as the default workflow since it's a small single-user app with no need for reviewable migration history; the `generate`/`migrate`/`studio` scripts exist but aren't the normal path.

## Architecture

Full-stack expense tracker: Next.js App Router + Drizzle ORM + Neon Postgres (`drizzle-orm/neon-http`, chosen over the websocket `neon-serverless` driver because every DB operation here is a single independent statement — no interactive multi-statement transactions are needed).

**This Next.js version (16.2.10) has real API differences from stock Next.js** — see `AGENTS.md` (imported above). Before writing Next.js-specific code, check `node_modules/next/dist/docs/`. Differences already discovered and relied on in this codebase:
- `cacheComponents` is **not** enabled in `next.config.ts`, so the app uses the standard/previous caching model: Server Components fetch data directly, no `<Suspense>` is required around runtime data, and `searchParams` usage is what opts a route into per-request dynamic rendering.
- `params` and `searchParams` are `Promise`s in route props and must be `await`ed.
- The `error.tsx` boundary's reset callback prop is named `unstable_retry`, not `reset` (see `app/error.tsx`).
- Server Actions use the `xxxAction` naming convention when passed into Client Components as props.

### Data layer (`db/`)

- `schema.ts` — single `expenses` table. `category` and `paidBy` are Postgres enums (`pgEnum`), with their allowed values exported as `EXPENSE_CATEGORIES` and `PAYERS` const arrays — this is the single source of truth reused by both server-side validation (`app/actions.ts`) and UI `<select>` options (`ExpenseForm`). `amount` is `numeric(10,2)` (returned as a string by Drizzle) to avoid float rounding — never do arithmetic on it in JS; sums are always done in SQL.
- `index.ts` — the Drizzle client singleton (`db`), guarded with `import "server-only"` so it can't accidentally end up in a client bundle.
- `queries.ts` — read-only queries, all month-scoped: `getMonthRange` (shared date-boundary helper), `getExpensesForMonth`, `getMonthTotal` (SQL `SUM`, not JS reduction), `getMonthTotalsByPayer` (SQL `GROUP BY paid_by`, always returns both payers even at €0). Also `server-only`-guarded.

### Mutations (`app/actions.ts`)

All three Server Actions (`createExpenseAction`, `updateExpenseAction`, `deleteExpenseAction`) live in one file with a `"use server"` file directive and share `parseExpenseInput`/`parseExpenseId` validation helpers. Validation happens here (not just client-side) because Server Actions are directly POST-reachable. `update` and `delete` both `redirect("/")` after `revalidatePath("/")` since they're invoked from the edit page and should return the user to the dashboard.

`create` is the odd one out: it stays on the dashboard, so instead of the `(formData) => Promise<void>` signature the other two use, it's a `useActionState` reducer — `(prevState: CreateExpenseState, formData) => Promise<CreateExpenseState>` — that catches validation errors and returns them as `{ status, message }` for inline display rather than throwing into `error.tsx`. Its `submissions` counter is incremented only on success and used as the form's React `key` in `components/add-expense-form.tsx`, which is what clears the fields after an add.

`CreateExpenseState` and its initial value live in `lib/create-expense-state.ts`, **not** in `actions.ts`: a `"use server"` file may only export async functions, so exporting the initial-state object from there fails the build (`invalid-use-server-value`) — and `tsc`/`eslint` won't catch it, only `npm run build` will.

### UI (`app/`)

- `page.tsx` — the dashboard: reads the `?month=YYYY-MM` search param (via `app/lib/month.ts` helpers, defaulting to the current month), fetches expenses/total/per-payer totals in parallel, and renders the month nav, the add form, and the calendar.
- `expenses/[id]/edit/page.tsx` — fetches one row via `db.query.expenses.findFirst` (relational query API, enabled by passing `schema` to `drizzle()` in `db/index.ts`), 404s via `notFound()` if missing, and reuses `ExpenseForm`. Also hosts the delete button (deletion lives on the edit page, not inline in the calendar, since calendar cells are too small for it).
- `components/expense-form.tsx` — one form shared by add and edit; the hidden `id` field (and thus whether it's an insert or update) is driven by whether `defaultValues.id` is set, so keep new fields working for both call sites.
- `components/expense-calendar.tsx` — the expense list is a month-grid calendar, not a table. Each day cell groups that day's expenses; each entry is a small pill linking to its edit page, with a colored initial badge for who paid.
- `components/month-nav.tsx` / `month-picker.tsx` — prev/next are plain server-rendered `<Link>`s to `/?month=...`; only the native `<input type="month">` needs `'use client'`, to auto-submit a GET form on change.
- `lib/month.ts` — all year/month arithmetic (parsing the search param, shifting months, days-in-month, today's date) lives here so it's shared between the dashboard, the calendar, and the nav.
- `lib/payer-colors.ts` — the RoseAnn/Gabriel color map, shared between the calendar badges and the dashboard summary dots so they stay visually consistent.

### Auth (`proxy.ts`, `app/lib/auth.ts`, `app/lib/session.ts`, `app/lib/pin.ts`)

A single shared 4-digit PIN locks the whole app — there are no user accounts, and the `login` table holds exactly one row.

- **The PIN is never stored.** `login.password` holds a scrypt hash (`scrypt$<salt>$<key>`), written only by `npm run set-pin -- 1234`. Don't add a UI that writes the raw PIN.
- **`SESSION_SECRET` is required** (`openssl rand -hex 32`, in `.env.local` and in Vercel's env vars). `app/lib/session.ts` throws if it's missing rather than falling back to a default — a default would make every session cookie forgeable. The cookie is `<expiry>.<HMAC-SHA256>`, httpOnly + sameSite=lax + secure in production.
- **Two layers, on purpose.** `proxy.ts` (this version's `middleware.ts` — renamed in Next 16) does an *optimistic* check: cookie signature only, no DB, because it runs on every request including prefetches. Every page and every mutating Server Action additionally calls `requireSession()`. Server Actions are directly POST-reachable, so the proxy alone would not protect them — if you add an action or route, add the `requireSession()` call too.
- Failed logins return one generic "Incorrect PIN." for both a malformed PIN and a wrong one, so the response reveals nothing.

**Known gap:** there is no rate limiting on the login form. 10,000 PIN combinations is trivially brute-forceable by a script against the public URL; the PIN only stops casual access. Add throttling before treating this as real protection.

### Styling

Light theme is forced intentionally: `color-scheme: light` is set in `app/globals.css` and no `dark:` Tailwind variants are used anywhere in the app. Don't reintroduce `dark:` classes or a `prefers-color-scheme` media query without being asked — this was a deliberate choice, not an oversight.
