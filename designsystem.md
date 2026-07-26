# Clinical Lens Design System

This document outlines the design standards, component guidelines, and technical implementation details for the **Clinical Lens** project. All agents building frontend components MUST adhere to these rules.

## 1. Technical Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: Shadcn UI (Radix UI primitives)
- **Icons**: Lucide React
- **Theming**: `next-themes` (Dark/Light/System)
- **Animations**: `motion/react` (Framer Motion)
- **Font**: Roboto (Primary Sans-serif)

## 2. Color Palette (OKLCH - Creative Dark Blue)
Professional and vibrant blue-centric palette.
- **Light Mode**: Primary `oklch(0.35 0.12 250)`, Background `oklch(0.99 0 0)`
- **Dark Mode**: Primary `oklch(0.7 0.15 250)`, Background `oklch(0.12 0.02 250)`

## 3. Typography
- **Primary Font**: **Roboto** (Google Font)
- **Mono Font**: Geist Mono

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
  - **Cards**: Gentle lift (`y: -4` to `-8`) with a subtle increase in border intensity or shadow.
  - **Buttons**: Scale up slightly (`scale: 1.02`) or adjust background-color.
- **Active States**: Immediate feedback with `scale: 0.98`.

### 4.3 Implementation
Always use `motion` from `motion/react`. 
```tsx
import { motion } from "motion/react";

// Example of professional entry animation
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  Content
</motion.div>
```

## 5. Component Standards
- **Shadcn UI**: MANDATORY for all standard UI elements.
- **Radius**: Modern corners (`--radius: 0.75rem`).
- **Glassmorphism**: Use `backdrop-blur` for fixed headers.

## 6. Generative UI (CopilotKit)
- Chat cards MUST use the `primary` and `card` variables.
- Animations in chat (e.g., new messages) should follow the "Mild Professional" standard.
