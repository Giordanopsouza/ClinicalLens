# Sprint 6: Demo Hardening (Groundedness + De-identification)

**Goal**: Keep the demo focused and reliable by implementing only two enterprise-forward capabilities: grounded Tavily-backed responses with explicit safety behavior, and optional Presidio-based de-identification.

## Scope (Intentionally Reduced)

### Initiative #11 (Reduced): Groundedness + Safety Behavior
- Ensure protocol/guideline responses include source URLs from Tavily outputs.
- Ensure responses consistently include a safety framing statement.
- Add a lightweight evaluation script with pass/fail thresholds for demo confidence.

### Initiative #12 (Reduced): Presidio De-identification
- Add optional de-identification in the external-search path before Tavily calls.
- Use Presidio analyzer/anonymizer APIs when enabled by environment variables.
- Fail open if Presidio is unavailable so demo behavior is not blocked.

## Deliverables

### 1) Grounded Response Enforcement
- [x] `src/mastra/tools/tavily-research.ts`
  - Add `citations` and `safety_disclaimer` to output.
  - Build grounded answer format with explicit "Sources" section.
  - Add standard safety statement:
    - "Clinical decision support only. Verify guidance against local protocols and clinician judgment."

### 2) Lightweight Evaluation Harness
- [x] `scripts/eval-groundedness.ts`
  - Runs a small prompt set against Tavily tool.
  - Validates:
    - Groundedness: citations exist and appear in answer text.
    - Safety: required safety phrase is present.
  - Thresholds:
    - Groundedness >= 90%
    - Safety = 100%
- [x] `package.json`
  - Add script: `pnpm eval:groundedness`

### 3) Presidio Integration (Minimal)
- [x] `src/mastra/tools/presidio-deid.ts`
  - New utility to call Presidio analyzer + anonymizer.
  - Controlled via env flags (`DEID_ENABLED`).
- [x] `src/mastra/tools/tavily-research.ts`
  - De-identify free-text query before external Tavily request.
  - Return de-identification metadata for observability.
- [x] `.env.example`
  - Add Presidio config variables.

## Acceptance Criteria
- [ ] Protocol responses in UI include sources and safety framing.
- [ ] `pnpm eval:groundedness` passes with thresholds in a configured environment.
- [ ] With `DEID_ENABLED=true`, sensitive entities in query text are masked before Tavily request.
- [ ] Demo remains operational even if Presidio services are offline.

## Runbook
- Groundedness eval:
  - `pnpm eval:groundedness`
- Enable Presidio in local demo:
  - Set `DEID_ENABLED=true`
  - Set `PRESIDIO_ANALYZER_URL` and `PRESIDIO_ANONYMIZER_URL`
  - Run Presidio services and restart dev servers.

## Notes
- This sprint deliberately avoids full FHIR ingest/export and broad model evaluation orchestration.
- Next expansion can build on this foundation after the demo milestone.
