# Clinical Lens Agent Guidelines

This document serves as the primary instruction set for AI agents (like Gemini CLI) working on the **Clinical Lens** project. Following these rules ensures consistency, safety, and high-quality implementation.

## 1. Core Mission
**Clinical Lens** is a healthcare AI platform that provides clinical decision support. The mission is to enable clinicians to analyze patient data, explore medical guidelines, and find similar cases through an AI-powered copilot interface.

## 2. Technical Stack & Architecture
Agents MUST adhere to the following architecture:
- **Frontend**: Next.js 15+ (App Router), React 19.
- **Backend/Data**: Convex (Real-time database, queries, mutations, actions).
- **AI Framework**: Mastra (Agentic orchestration, tools, memory).
- **Interface**: CopilotKit (Generative UI, chat integration).
- **Design**: Shadcn UI + Tailwind CSS v4 + motion/react.

## 3. Skill-Based Workflows
The following specialized skills are available and MUST be activated in their respective scenarios:

### 3.1 Backend & Database (Convex)
- **Skill**: `convex`
- **Scenario**: When modifying `convex/schema.ts`, writing new queries in `convex/queries.ts`, or implementing mutations/actions.
- **Rule**: Activate the `convex` skill before proposing or executing database changes to ensure optimal Convex patterns and type safety.

### 3.2 Agentic Logic & Tools (Mastra)
- **Skill**: `mastra`
- **Scenario**: When creating or refining agents in `src/mastra/agents/`, or building tools in `src/mastra/tools/`.
- **Rule**: Activate the `mastra` skill to leverage the latest orchestration patterns, tool definitions, and memory configurations.

### 3.3 Frontend Best Practices
- **Skill**: `vercel-react-best-practices`
- **Scenario**: When building new pages, optimizing performance, or implementing complex React 19 hooks.
- **Rule**: Activate this skill to ensure adherence to Next.js 15 App Router standards and Vercel-recommended performance patterns.

### 3.4 UI/UX & Design System
- **Skill**: `web-design-guidelines`
- **Scenario**: When building new UI components, adjusting layouts, or refining the visual aesthetic.
- **Rule**: Activate this skill alongside referencing `designsystem.md` to ensure a premium, accessible, and professional medical interface.

## 4. Frontend Development Rules
- **Design System**: ALWAYS reference and follow `designsystem.md` when building or modifying UI components.
- **Animations**: Follow the "Mild Professional Enterprise" standard in `designsystem.md` using `motion/react`.
- **Theming**: Ensure all components support both light and dark modes (OKLCH palette).
- **Components**: Use Shadcn UI (`components/ui/`) for all standard elements.

## 5. Coding Standards
- **TypeScript**: Use strict TypeScript. Avoid `any`.
- **Clean Code**: Follow SOLID principles. Keep components and functions small.
- **Documentation**: Keep project docs in `/docs` up to date.

## 6. Security & Safety
- **PHI/PII**: Never log or expose sensitive patient information.
- **Medical Disclaimer**: Always include the research-only disclaimer in UI and agent responses.

## 7. Development Workflow
1. **Research**: Read `/docs` and identify necessary skills.
2. **Activate Skills**: Call `activate_skill` for the relevant domain.
3. **Strategy**: Plan implementation based on expert skill instructions.
4. **Execution**: Implement and validate.
