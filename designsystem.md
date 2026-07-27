# Clinical Lens Design System

This document outlines the design standards, component guidelines, and technical implementation details for the **Clinical Lens** project. All agents building frontend components MUST adhere to these rules.

## 1. Technical Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn UI (Radix UI primitives)
- **Icons**: Lucide React
- **Theming**: `next-themes` (Dark/Light/System)
- **Animations**: `motion/react` (Framer Motion)
- **Font**: Lexend (Primary Sans-serif) / JetBrains Mono (Monospace)

## 2. Color Palette
The project uses a clean, high-contrast palette optimized for clinical environments.

### Light Mode (:root)
- **Primary Blue**: `#0D3BA5` — Main actions, branding, key data points.
- **Success Green**: `#10B981` — Positive states, stable vitals.
- **Warning Yellow**: `#F59E0B` — Cautionary alerts, missing data.
- **Critical Red**: `#EF4444` — Errors, critical patient alerts.
- **Info Blue**: `#3B82F6` — Informational highlights.
- **Background**: `#F8FAFC` (Neutral 50)
- **Surface/Card**: `#FFFFFF`
- **Text (Main)**: `#1E293B` (Neutral 800)
- **Text (Muted)**: `#64748B` (Neutral 500)
- **Border**: `#E2E8F0` (Neutral 200)

### Dark Mode (.dark)
- **Primary Blue**: `#1E5EFF` — Vibrant blue for high contrast on dark backgrounds.
- **Success Green**: `#10B981`
- **Warning Yellow**: `#F59E0B`
- **Critical Red**: `#EF4444`
- **Info Blue**: `#60A5FA`
- **Background Deep**: `#030712`
- **Surface/Card**: `#111827`
- **Text (Main)**: `#F3F4F6`
- **Text (Muted)**: `#9CA3AF`
- **Border Subtle**: `#1F2937`

## 3. Typography
- **Primary Font**: **Lexend** (Google Font)
  - Used for all reading content, headings, and descriptions.
- **Mono Font**: **JetBrains Mono** (Google Font)
  - Used for precise data display (IDs, vitals, lab values).

## 4. Animation Standards (Mild Professional Enterprise)
To maintain a professional medical aesthetic, animations must be subtle, purposeful, and non-distracting.

### 4.1 Transition Rules
- **Duration**: Use short durations (0.2s to 0.4s). Avoid long, sluggish transitions.
- **Physics**: Prefer `type: "spring"` with high stiffness and damping for a snappy, responsive feel.
- **Distance**: Keep movement distances small (e.g., `y: 10` or `y: 20` instead of `y: 100`).

### 4.2 Common Patterns
- **Entry Fades**: Subtle `opacity` + small `y` offset (10-20px) on page or section load.
- **Staggering**: Apply a slight `staggerChildren` (0.05s - 0.1s) for lists or card grids to guide the eye.
- **Hover States**:
  - **Cards**: Gentle lift (`y: -4` to `-8`) with a subtle increase in border intensity or shadow (e.g. `card-glow`).
  - **Buttons**: Scale up slightly (`scale: 1.02`) or adjust background-color.
- **Active States**: Immediate feedback with `scale: 0.98`.

## 5. Component Standards
- **Shadcn UI**: MANDATORY for all standard UI elements.
- **Radius**: Medium corners (`--radius: 0.5rem` / `8px`).
- **Cards**: Use subtle shadows in light mode, and a soft glow (`box-shadow: 0 0 15px rgba(30, 94, 255, 0.1)`) in dark mode.

## 6. Generative UI (CopilotKit)
- Chat cards MUST use the `primary` and `card` variables.
- Animations in chat (e.g., new messages) should follow the "Mild Professional" standard.
