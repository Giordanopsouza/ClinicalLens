# Clinical Lens — Feature Prioritization (Value × Ease)

Scoring: Value = business/clinical impact (5 = high), Ease = implementation simplicity (5 = easy), Priority Score = Value × Ease.

| Rank | Initiative | Value | Ease | Score | Why It's High ROI |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Fix embedding-model mismatch for case similarity search | 5 | 5 | 25 | Immediate quality lift for core 'similar cases' feature with low effort |
| 2 | Enforce auth consistently across all Convex clinical queries | 5 | 4 | 20 | Critical trust/safety hardening, straightforward backend changes |
| 3 | Convert Alerts page from static cards to live data-driven workflow | 5 | 4 | 20 | [DONE] Turns demo UI into real daily-use clinical operations |
| 4 | Add evidence metadata to guideline results (source/date/strength/freshness) | 5 | 4 | 20 | [DONE] Big credibility gain for clinicians with moderate frontend/tooling work |
| 5 | Fix lint/type baseline and CI quality gate | 4 | 5 | 20 | Speeds all future delivery and reduces regressions immediately |
| 6 | Remove doc drift + broken links (e.g., /docs) | 3 | 5 | 15 | Fast win for team alignment and onboarding reliability |
| 7 | Alert workflow actions (assign/snooze/resolve/audit trail) | 5 | 3 | 15 | High workflow value, moderate schema + UI + mutation work |
| 8 | Protocol search page wired to real Tavily/agent outputs | 4 | 3 | 12 | [DONE] Converts a visible feature into real utility |
| 9 | Cohort explorer for similar-patient outcomes | 5 | 2 | 10 | Strong differentiator, but more data/model work |
| 10 | Safety audit v2 with RxNorm/interactions/renal rules | 5 | 2 | 10 | Huge clinical value, but domain mapping complexity |
| 11 | Evaluation harness (groundedness/citation/safety regression suite) | 4 | 2 | 8 | Essential for scale, less immediate end-user visibility |
| 12 | FHIR-native ingestion/export + terminology normalization | 5 | 1 | 5 | Strategic enterprise moat, high complexity and longer timeline |

## Recommended Execution Plan

| Sprint | Focus | Deliverables | Status |
| :--- | :--- | :--- | :--- |
| Sprint 1 (Quick Wins) | Reliability + Safety Foundation | #1, #2, #5, #6 | Pending |
| **Sprint 2** | **Turn Demo Surfaces into Real Workflow** | **#3, #4, #8** | **COMPLETED** |
| Sprint 3 | Operational Clinical Workflow | #7 | Pending |
| Sprint 4+ | Differentiators + Enterprise | #9, #10, #11, #12 | Pending |
