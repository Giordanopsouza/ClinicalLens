# Agent Notes — Cross-Phase Gotchas & Learnings

This file is maintained by agents for agents. Add learnings here when you discover something that
would have saved time if you'd known it upfront. Organized by topic.

---

## Convex

### Deployment
- Dev deployment: `energetic-jaguar-742` (set in `.env.local` as `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`)
- Push to dev: `npx convex dev --once`
- BLOCKED: `convex dev --once` currently fails due to `convex/mastra.ts` importing `@convex-dev/mastra/client` (invalid subpath). Fix that file before deploying any Convex changes.

### Function Visibility
- All mutations in `convex/mutations.ts` are `internalMutation` — intentionally not callable from the browser/HTTP client.
- All queries in `convex/queries.ts` require Clerk auth (`ctx.auth.getUserIdentity()`) and return `[]`/`null` for unauthenticated callers.
- Use `npx convex run <module:fn>` to call any function with admin access (bypasses HTTP auth, but NOT user identity auth).
- Internal queries/mutations: call via `npx convex run internal.<module>:<fn>`.

### Seeding Data
- Never use `ConvexHttpClient` to call seed mutations — they are `internalMutation`.
- Use `npx convex import -y --replace --format jsonLines --table <table> <file.jsonl>` instead.
- Flag order matters: `convex import -y` (not `convex -y import`).
- JSONL files go in `data/_convex_import/` (gitignored).

### `load-env.ts` Inline Comment Bug (Fixed)
The custom env loader (`scripts/load-env.ts`) previously did not strip inline comments.
`.env.local` lines like `CONVEX_DEPLOYMENT=dev:xyz # comment` would set the full string as the value.
This was fixed — the loader now strips ` #...` suffixes from unquoted values.

---

## Embeddings

### Current Setup (as of Phase 1 completion)
- Model: OpenAI `text-embedding-3-small`
- Dimensions: 1536 (matches `convex/schema.ts` vector index `by_embedding`)
- Key: `OPENAI_API_KEY` in `.env.local`
- Script: `scripts/generate-embeddings.ts` — batches 100 cases/request, ~20 requests for 2000 cases

### Do NOT use Gemini for embeddings
`gemini-embedding-001` is severely rate-limited on free tier (~5 req/min). Tried and failed multiple times
with 429/503 errors. OpenAI handles the full 2000 cases in ~30 seconds.

---

## Data Pipeline (Phase 1 — Complete)

Run order:
```bash
pnpm run data:seed:small    # clinical_cases (2000), lab_dictionary (554), diagnosis_dictionary (2390)
pnpm run data:import:large  # labs (841,507), prescriptions (153,433), diagnoses (23,428)
pnpm run data:embed         # generates OpenAI embeddings, re-imports clinical_cases with embeddings
pnpm run data:verify        # checks JSONL files and reports counts
```

All data is in the Convex dev deployment. Do not re-run seed/import unless you want to replace existing data
(scripts use `--replace` which wipes and re-inserts).

---

## Auth (Clerk)

- Clerk keys are in `.env.local` (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
- All Convex queries gate on `ctx.auth.getUserIdentity()` — frontend must pass Clerk JWT.
- See `docs/phase-0-5-auth.md` for full auth setup.

---

## Package Manager
- Use `pnpm` (not npm or yarn).
- `@convex-dev/mastra` (v0.0.1-alpha.4) was added to dependencies — install before running Convex-related Mastra code.
