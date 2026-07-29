"use client";

import { PatientProvider } from "@/context/patient-context";
import { SidebarProvider } from "@/context/sidebar-context";
import { PatientSidebar } from "@/components/patients/patient-sidebar";
import { ClinicalChat } from "@/components/chat/clinical-chat";
import { GlobalHeader } from "@/components/layout/global-header";
import { ErrorBoundary } from "@/components/error-boundary";
import { Footer } from "@/components/layout/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PatientProvider>
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
      </PatientProvider>
    </SidebarProvider>
  );
}
