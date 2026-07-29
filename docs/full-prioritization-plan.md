# Clinical Lens — Feature Prioritization (Master Plan)

Scoring: Value = business/clinical impact (5 = high), Ease = implementation simplicity (5 = easy), Priority Score = Value × Ease.

| Rank | Initiative | Value | Ease | Score | Why It's High ROI | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Fix embedding-model mismatch for case similarity search | 5 | 5 | 25 | Immediate quality lift for core 'similar cases' feature | **DONE** |
| 2 | Enforce auth consistently across all Convex clinical queries | 5 | 4 | 20 | Critical trust/safety hardening | **DONE** |
| 3 | Convert Alerts page from static cards to live data-driven workflow | 5 | 4 | 20 | Turns demo UI into real operations | **DONE** |
| 4 | Add evidence metadata to guideline results | 5 | 4 | 20 | Big credibility gain for clinicians | **DONE** |
| 5 | Fix lint/type baseline and CI quality gate | 4 | 5 | 20 | Speeds future delivery and reduces regressions | **DONE** |
| 6 | Remove doc drift + broken links (e.g., /docs) | 3 | 5 | 15 | Fast win for team alignment | **DONE** |
| 7 | Alert workflow actions (assign/snooze/resolve/audit trail) | 5 | 3 | 15 | High workflow value | **DONE** |
| 8 | Protocol search page wired to real Tavily/agent outputs | 4 | 3 | 12 | Converts a visible feature into real utility | **DONE** |
| 9 | Cohort explorer for similar-patient outcomes | 5 | 2 | 10 | Strong differentiator | **DONE** |
| 10 | Safety audit v2 with RxNorm/interactions/renal rules | 5 | 2 | 10 | Huge clinical value | **DONE** |
| 11 | Evaluation harness (groundedness/citation suite) | 4 | 2 | 8 | Essential for scale | Pending |
| 12 | FHIR-native ingestion/export + terminology normalization | 5 | 1 | 5 | Strategic enterprise moat | Pending |

## Recommended Execution Plan

| Sprint | Focus | Deliverables | Status |
| :--- | :--- | :--- | :--- |
| Sprint 1 | Reliability + Safety Foundation | #1, #2, #5, #6 | **COMPLETED** |
| **Sprint 2** | **Turn Demo Surfaces into Real Workflow** | **#3, #4, #8** | **COMPLETED** |
| **Sprint 3** | **Operational Clinical Workflow** | **#7** | **COMPLETED** |
| **Sprint 4** | **Advanced Analysis & Foundations** | **#1, #5, #9** | **COMPLETED** |
| **Sprint 5** | **Hardened Safety & Advanced Auditing** | **#2, #6, #10** | **COMPLETED** |
| Sprint 6+ | Enterprise & Scale | #11, #12 | Roadmap |
