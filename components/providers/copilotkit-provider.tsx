"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { ReactNode } from "react";

// Points to the Mastra-powered API route (or standalone server)
const COPILOTKIT_URL =
  process.env.NEXT_PUBLIC_COPILOTKIT_URL || "/api/copilotkit";

export function CopilotKitProvider({ children }: { children: ReactNode }) {
  return (
    <CopilotKit runtimeUrl={COPILOTKIT_URL} agent="clinicalCopilotAgent" showDevConsole={false}>
      {children}
    </CopilotKit>
  );
}
