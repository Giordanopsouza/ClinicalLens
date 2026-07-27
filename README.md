# Clinical Lens

**Clinical Lens** is an advanced clinical decision support platform designed to help healthcare professionals analyze patient data, explore medical guidelines, and find similar cases through an AI-powered copilot interface.

## 🚀 Overview
The platform leverages a modern tech stack to provide real-time, context-aware clinical insights. It integrates structured patient data (labs, prescriptions, diagnoses) with unstructured discharge summaries and live medical research to empower clinicians at the point of care.

## 🛠️ Tech Stack
- **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **Database**: [Convex](https://www.convex.dev/) (Real-time DB, Vector Search)
- **AI Orchestration**: [Mastra](https://mastra.ai/) (Agents, Tools, Memory)
- **Copilot Interface**: [CopilotKit](https://www.copilotkit.ai/) (Generative UI)
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes) (Light/Dark/System)
- **Icons**: [Lucide React](https://lucide.dev/)

## ✨ Key Features
- **Clinical Copilot**: Interactive AI assistant that understands patient context and assists with data lookup and guideline research.
- **Safety Auditing**: Automated heuristic-based cross-referencing of prescriptions against diagnoses to identify potential charting errors.
- **Visual Analytics**: Interactive time-series charts for laboratory measurements using [Recharts](https://recharts.org/).
- **Vector Search**: Semantic search across thousands of discharge summaries to find clinically similar patient cases.
- **Evidence-Based Insights**: Real-time access to the latest medical guidelines and clinical trials via Tavily integration.

## 📖 Documentation
- [**Phase 0: Project Setup**](docs/phase-0-project-setup.md)
- [**Phase 0.5: Clerk + Convex Auth**](docs/phase-0-5-auth.md)
- [**Phase 1: Data Foundation**](docs/phase-1-data-foundation.md)
- [**Phase 2: Mastra Agents**](docs/phase-2-mastra-agents.md)
- [**Phase 3: Frontend**](docs/phase-3-frontend.md)
- [**Phase 4: Polish & Demo**](docs/phase-4-polish-demo.md)
- [**Design System**](designsystem.md) — Frontend standards and component guidelines.
- [**Agent Guidelines**](AGENTS.md) — Instructions for AI agents working on this project.

## 🚦 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and fill in your API keys (Gemini, Convex, Tavily, OpenAI).

### 3. Run Development Server
```bash
# Start Next.js frontend
pnpm dev

# In a separate terminal, start Convex development server
pnpm dlx convex dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🤝 For AI Agents
If you are an AI agent working on this repository, please read and follow the [**AGENTS.md**](AGENTS.md) guidelines and refer to [**designsystem.md**](designsystem.md) for UI implementation details.
