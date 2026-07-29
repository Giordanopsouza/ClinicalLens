# Sprint 5: Hardened Safety & Advanced Auditing

**Goal**: Finalize the core security foundation by enforcing consistent authentication and take the Safety Audit system to the next level with rule-based clinical logic.

## Initiatives
1. **#2: Enforce auth consistently across all Convex clinical queries** (Score: 20)
2. **#6: Remove doc drift + broken links** (Score: 15)
3. **#10: Safety audit v2 with initial renal/interaction logic** (Score: 10)

## Task Breakdown

### 1. Auth Hardening (#2)
- [x] **Audit all Queries**: Reviewed and updated `convex/queries.ts` to ensure `getAuth(ctx)` is called in all public queries.
- [x] **Patient Context Lockdown**: Queries like `getPatientById` and `getLabsByAdmission` now return null/empty if unauthenticated.
- [x] **Mutation Hardening**: Verified `requireAuth` is consistent across mutations.

### 2. Documentation & Link Integrity (#6)
- [x] **Link Audit**: Removed broken `/docs` links from landing page and navigation.
- [x] **Remove Obsolete Docs**: Archived `phase-*.md` files into `docs/archive/`.
- [x] **Update Plan**: Updated the master prioritization plan.

### 3. Safety Audit v2 (#10)
- [x] **Renal Rule Implementation**: Added logic to `safetyCheckTool` to flag nephrotoxic drugs when Serum Creatinine > 1.5.
- [x] **Drug Interaction Prototype**: Implemented basic interaction checks for Warfarin/Aspirin and Lisinopril/Spironolactone.
- [x] **Enhanced UI Flags**: Updated `SafetyAlertCard` to display categorizations (Renal, Interaction, Diagnosis, Documentation).

## Success Criteria
- [x] Zero "open" clinical queries accessible without a valid Clerk token.
- [x] No broken `/docs` links in the main UI paths.
- [x] Safety Audit automatically flags renal risks and key interactions.
