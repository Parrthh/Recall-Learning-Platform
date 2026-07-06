# Recall — DSA & System Design Learning Platform

A web platform for learning and practicing **Data Structures & Algorithms** and **System Design** in one place: theory + reusable patterns + practice questions + progress tracking, without context-switching between a notes app, LeetCode, and system design blogs.

## Features

- **Content library** — one page per topic with theory, the reusable pattern template (annotated TypeScript), a per-pattern complexity subsection, common pitfalls, and related-topic links. Topics are organized into a sidebar taxonomy (DSA: Foundations → Patterns; System Design: Fundamentals → Case Studies).
- **Practice question bank** — each topic has attached questions with difficulty tags, progressively revealed hints, collapsible solution writeups, a local scratchpad, and Attempted / Solved / Needs Review tracking plus a "review again in N days" flag.
- **Progress tracking** — per-topic completion (theory read = 50%, questions solved = 50%), overall dashboard with topics covered, questions solved, study streak, last-studied date, and a due-for-review queue.
- **Auth** — email/password via Auth.js (NextAuth v5) with optional Google OAuth; all content/progress routes are protected, landing page is public.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend + API | Next.js 16 (App Router) |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Auth | Auth.js (NextAuth v5) |
| Content | Markdown files in `content/` (GFM + syntax highlighting) |
| Tests | Vitest (unit + integration), Playwright (E2E) |
| CI | GitHub Actions |
| Deploy | Docker (standalone Next.js build) or Vercel |

## Getting started

Requirements: Node 22+, PostgreSQL 16+.

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
# edit DATABASE_URL, set AUTH_SECRET (openssl rand -base64 32)

# 3. Create the database schema and seed content
npx prisma migrate deploy
npm run db:seed

# 4. Run
npm run dev
```

Sign up at `http://localhost:3000/signup` and start studying.

To enable Google sign-in, set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env` — the "Continue with Google" button appears automatically when both are present.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit + integration tests (needs `recall_test` DB, see below) |
| `npm run test:e2e` | Playwright E2E (build + migrate + seed first) |
| `npm run db:migrate` | Apply migrations (`prisma migrate deploy`) |
| `npm run db:seed` | Upsert topics/questions from `data/seed-data.ts` |

## Testing

- **Unit tests** (`tests/unit/`) cover the pure logic: completion percentages, topic status derivation, streak computation, question state transitions, and review scheduling.
- **Integration tests** (`tests/integration/`) call the API route handlers against a real Postgres database (`TEST_DATABASE_URL`, default `recall_test`) — e.g. "mark question solved updates topic progress", auth guards, validation.
- **E2E tests** (`e2e/`) drive the real app with Playwright: signup → browse topic → reveal hint → solve question → dashboard progress → persistence across re-login.

```bash
# one-time: create the test database
createdb recall_test   # or: CREATE DATABASE recall_test;

npm test               # unit + integration

npm run build          # E2E runs against a production build
npx prisma migrate deploy && npm run db:seed
npm run test:e2e
```

If your machine provides a system Chromium instead of Playwright's managed download, point the tests at it: `PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium npm run test:e2e`.

CI (`.github/workflows/ci.yml`) runs lint → unit/integration tests → build → E2E against a Postgres service container on every push and PR, then validates the Docker image build.

## Adding content — no code changes needed

1. Write a markdown file under `content/dsa/` or `content/system-design/` (sections used: `## Theory`, `## Pattern`, `## Common Pitfalls`, `## Related Topics`; case studies use `## Requirements Gathering Checklist`, `## Back-of-Envelope Estimation`, `## Suggested Architecture`, `## Trade-off Discussion`).
2. Add a topic entry (and its questions) to `data/seed-data.ts` — slug, section, order, prerequisites, and question prompts/hints/solutions.
3. `npm run db:seed` — the seed upserts by slug, so re-running is safe and edits propagate.

## Deployment

**Docker** (any host — ECS/Fargate, Fly, Railway…):

```bash
docker build -t recall .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://… \
  -e AUTH_SECRET=… \
  -e AUTH_TRUST_HOST=true \
  recall
```

Run migrations on release: `npx prisma migrate deploy` (the image ships `prisma/` for this; run it as a release/init step against the production `DATABASE_URL`).

**Vercel** (recommended): import the repo at [vercel.com/new](https://vercel.com/new) and set two environment variables:

- `DATABASE_URL` — a managed Postgres connection string (e.g. [Neon](https://neon.tech) free tier; use the *direct/unpooled* string so Prisma migrations work).
- `AUTH_SECRET` — generate with `openssl rand -base64 32`.
- (optional) `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` for Google sign-in.

`vercel.json` makes every deploy run `prisma migrate deploy` + `db:seed` (idempotent upserts) before the build, so schema and content changes ship automatically on push — no manual migration step. If you later hit Postgres connection limits under load, switch `DATABASE_URL` to Neon's pooled string and add `directUrl` to `prisma/schema.prisma` for migrations.

## Project structure

```
app/                 # Next.js App Router pages + API routes
  (app)/             # authenticated shell: sidebar layout, dashboard, topic pages
  api/               # signup, auth, question-status, topic-progress endpoints
components/          # Sidebar, QuestionCard, Markdown, forms, toggles
content/             # topic markdown (dsa/, system-design/)
data/seed-data.ts    # topic + question seed definitions
lib/                 # prisma client, auth config, progress/question-status logic
prisma/              # schema, migrations, seed script
tests/               # vitest unit + integration
e2e/                 # playwright specs
```

## Roadmap

- Populate the remaining DSA + System Design taxonomy (linked lists, trees, heaps, backtracking, greedy, bit manipulation, tries; rate limiting, CDNs, microservices, observability, more case studies).
- Automated spaced-repetition scheduling (the manual "review in N days" flag is the v1 hook).
- In-browser code execution sandbox for practice questions.
- Mobile-responsive sidebar polish.
