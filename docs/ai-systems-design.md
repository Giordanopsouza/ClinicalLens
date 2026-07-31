# AI Systems Design: Clinical Lens

## 1. Executive Summary
Clinical Lens is an **Agentic Medical Operating System** designed to transform raw EHR (Electronic Health Record) data into actionable clinical intelligence. The system utilizes a multi-agent architecture powered by **Mastra**, integrated with **CopilotKit** for generative UI, and backed by **Convex** for low-latency clinical data retrieval.

---

## 2. High-Level Architecture

The system is divided into three primary layers:

### A. The Intelligence Layer (Mastra)
*   **Orchestration**: Mastra serves as the primary agentic framework, handling tool-binding, memory management, and agent reasoning.
*   **Multi-Agent System**:
    *   **Clinical Copilot (Aegis)**: Generalist agent focused on history synthesis, lab trend analysis, and protocol research.
    *   **Safety Auditor**: Specialist agent focused on cross-referencing prescriptions against diagnoses to flag contraindications.
*   **Memory System**: Thread-scoped memory with observational synthesis, allowing agents to "remember" previous clinical findings and build a longitudinal mental model of the patient.

### B. The Contextual Interface (CopilotKit)
*   **Context Sync**: Uses `useCopilotReadable` to stream the current frontend state (Active Patient AEG-XXXXXX) into the agent's reasoning loop.
*   **Generative UI**: Extends the chat interface beyond text. Agents trigger `useCopilotAction` to render high-fidelity React components (interactive AreaCharts, Safety Cards) directly in the message stream.

### C. The Clinical Data Plane (Convex)
*   **Vector Database**: Stores 1536-dimensional embeddings of discharge summaries for semantic similarity search ("Find similar cases").
*   **Discovery Indexing**: A lightweight `patient_discovery` table enables sub-50ms searches across 2,000+ cases without hitting memory limits.
*   **Relational Mapping**: High-performance indexes on `hadm_id` and `itemid` for real-time time-series lab retrieval.

---

## 3. Agentic Workflow & Tool-Use

Agents interact with the clinical environment through a suite of Zod-validated tools:

| Tool | Capability | Data Source |
| :--- | :--- | :--- |
| `patientQueryTool` | Full medical record retrieval | Convex (`clinical_cases`) |
| `labTrendTool` | Time-series data extraction | Convex (`labs` + `lab_dictionary`) |
| `safetyCheckTool` | Heuristic mismatch scanning | Convex (`prescriptions` + `diagnoses`) |
| `tavilyResearchTool` | Real-time clinical guideline research | Live Internet (FDA, NIH, NEJM) |
| `dischargeSearchTool` | Semantic similarity case finding | Convex Vector Index |

### The Reasoning Loop (Chain-of-Thought)
1.  **User Input**: "What is the creatinine trend for this patient?"
2.  **Context Injection**: Frontend injects the active `hadm_id` via a hidden system hint.
3.  **Tool Selection**: Agent identifies the need for `labTrendTool`.
4.  **Execution**: Tool queries Convex, retrieves time-series JSON.
5.  **Synthesis**: Agent analyzes the trend (e.g., "Rising from 1.2 to 2.4").
6.  **UI Trigger**: Agent calls `renderLabChart`, prompting the frontend to draw the SVG AreaChart.

---

## 4. Retrieval Strategy (RAG & Search)

Clinical Lens employs a **Tri-Modal Search Strategy** to handle medical data at scale:

1.  **Direct Index Lookup**: Instant retrieval by Patient ID (`hadm_id`) using B-tree indexes.
2.  **Keyword Search Index**: Token-based searching for diagnoses using Convex `searchIndex` (e.g., "Sepsis", "COPD").
3.  **Vector RAG**: Uses OpenAI `text-embedding-3-small` to convert discharge summaries into vectors. This allows for clinical pattern matching (e.g., "Find patients with similar post-op complications").

---

## 5. Security & Compliance Design

*   **De-identification**: Frontend utility `cleanClinicalText` strips MIMIC-III de-identification brackets to prevent "database leaking" into the UI.
*   **Auth Tunneling**: Clerk identities are synchronized with Convex `getUserIdentity` to ensure only licensed clinicians access the clinical ledgers.
*   **Auditability**: Every document access and clinical synthesis event is logged in a cryptographic **Audit Trail**, accessible via the "Full Audit Log" side-sheet.

---

## 6. Performance Optimization

*   **Discovery Metadata Table**: By separating heavy discharge summaries from lightweight discovery fields (Age, Gender, Diagnosis), we avoid Convex's 16MB memory limit during global searches.
*   **Memoized Context**: `useCopilotReadable` values are memoized to prevent the "Re-render Loop" common in real-time AI integrations.
*   **Paginated Retrieval**: All clinical lists use a standard `paginationOpts` validator to handle the 2,000+ records efficiently.

---

## 7. Future AI Roadmap
*   **Agentic Vision**: Integrating Gemini Vision to analyze uploaded clinical images (X-rays, EKGs).
*   **Semantic Recall**: Upgrading the memory system to use a long-term vector store for multi-session clinician preferences.
*   **Predictive Heuristics**: Moving from reactive safety alerts to proactive "Risk Scoring" agents.
