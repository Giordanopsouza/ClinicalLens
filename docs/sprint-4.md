# Sprint 4: Advanced Analysis & Foundation Solidification

**Goal**: Elevate the platform's core search quality, stabilize the codebase through rigorous type-safety, and introduce the "Cohort Explorer" for population-level clinical insights.

## Initiatives
1. **#1: Fix embedding-model mismatch for case similarity search** (Score: 25)
2. **#5: Fix lint/type baseline and CI quality gate** (Score: 20)
3. **#9: Cohort explorer for similar-patient outcomes** (Score: 10)

## Task Breakdown

### 1. Vector Search Optimization (#1)
- [x] **Audit Current Embeddings**: Verified `generate-embeddings.ts` uses OpenAI `text-embedding-3-small` (1536d).
- [x] **Re-generation Pipeline**: Identified and fixed mismatch in `discharge-search.ts` (was using Google 768d model).
- [x] **Batch Update**: Search tool now correctly generates OpenAI 1536d embeddings to match the Convex vector index.

### 2. Code Quality & Baseline (#5)
- [x] **Fix `any` Types**: Systematically replaced `any` with specific types (`Doc`, `ActionCtx`, `QueryCtx`, etc.) in `convex/`, `src/mastra/`, and `components/`.
- [x] **Clean Lint Errors**: Resolved unescaped quotes, unused imports, and impure render calls. Reduced total issues significantly.
- [x] **CI Configuration**: Established a stable baseline for `npm run lint`.

### 3. Cohort Explorer (#9)
- [x] **New Dashboard Surface**: Created `app/(dashboard)/cohorts/page.tsx`.
- [x] **Aggregation Queries**: Implemented `getCohortStats` Convex query for population metrics.
- [x] **Outcome Visualization**: Added distribution charts for Age and Top Admission Drivers.
- [x] **Navigation**: Integrated "Cohort Explorer" into the main sidebar and global header.

## Success Criteria
- [x] Case similarity search returns clinically relevant matches (validated consistent dimension usage).
- [x] `npm run lint` pass with zero errors in modified files.
- [x] A user can view a summary of the 2,000-patient cohort analytics.
