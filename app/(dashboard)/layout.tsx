"use client";

import { useEffect } from "react";
import { PatientProvider, usePatient } from "@/context/patient-context";
import { SidebarProvider } from "@/context/sidebar-context";
import { PatientSidebar } from "@/components/patients/patient-sidebar";
import { ClinicalChat } from "@/components/chat/clinical-chat";
import { GlobalHeader } from "@/components/layout/global-header";
import { ErrorBoundary } from "@/components/error-boundary";
import { Footer } from "@/components/layout/footer";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CopilotKit } from "@copilotkit/react-core";

const COPILOTKIT_URL =
  process.env.NEXT_PUBLIC_COPILOTKIT_URL || "/api/copilotkit";

// Inner component — has access to PatientContext so it can pass hadm_id as a header
function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.mutations.storeUser);
  const { selectedHadmId } = usePatient();

  useEffect(() => {
    if (isAuthenticated) {
      storeUser();
    }
  }, [isAuthenticated, storeUser]);

  return (
    <CopilotKit
      runtimeUrl={COPILOTKIT_URL}
      agent="clinicalCopilotAgent"
      showDevConsole={false}
      headers={{ "x-hadm-id": selectedHadmId?.toString() ?? "" }}
    >
      <SidebarProvider>
        <div className="flex h-screen flex-col bg-background overflow-hidden font-sans">
          {/* Top: Global Navigation & User Controls */}
          <GlobalHeader />

          <div className="flex flex-1 overflow-hidden">
            {/* Left: Module Sidebar (Patient Registry) */}
            <PatientSidebar />

            {/* Center: Workspace Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-border/50">
              <main className="flex-1 overflow-hidden">
                <ErrorBoundary fallbackMessage="The clinical workspace encountered a data synchronization error.">
                  {children}
                </ErrorBoundary>
              </main>

              {/* Contextual Footer (Compliance) */}
              <Footer />
            </div>

            {/* Right: AI Intelligence Panel (Copilot) */}
            <ClinicalChat />
          </div>
        </div>
      </SidebarProvider>
    </CopilotKit>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PatientProvider>
      <DashboardShell>{children}</DashboardShell>
    </PatientProvider>
  );
}
