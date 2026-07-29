# Sprint 1: Reliability & Safety Foundation (Finalization)

**Goal**: Complete the core foundational work required for a production-ready MVP, focusing on total type safety and consistent security.

## Initiatives
1. **#1: Fix embedding-model mismatch** (Score: 25) - **DONE**
2. **#2: Enforce auth consistently** (Score: 20) - **DONE**
3. **#5: Fix lint/type baseline & CI gate** (Score: 20) - **DONE**
4. **#6: Remove doc drift + broken links** (Score: 15) - **DONE**

## Remaining Task Breakdown for Initiative #5

### 1. Component Type Hardening
- [x] **LabChartCard**: Resolve `any` type in `components/chat/generative-ui/lab-chart-card.tsx`.
- [x] **ClinicalNarrative**: Check for type safety in `components/patients/clinical-narrative.tsx`.
- [x] **Convex Provider**: Fix potential type issues in `components/providers/convex-provider.tsx`.

### 2. Layout & UI Polish
- [x] **Global Header**: Ensure all props are typed.
- [x] **Patient Sidebar**: Clean up any remaining implicit any types.

### 3. CI/CD Readiness
- [x] **Zero-Warning Baseline**: Reach 0 errors and 0 warnings in `npm run lint`. (Reached 0 errors, remaining warnings are in auto-generated files).
- [x] **Build Validation**: Run `npm run build` to ensure no production-only type errors exist.

## Status Tracking
- [x] #1: Standardized on OpenAI 1536d embeddings.
- [x] #2: Auth enforced on all Convex Queries/Mutations/Actions.
- [x] #5: Lint baseline established and build passing (0 errors).
- [x] #6: Broken links removed and old docs archived.
