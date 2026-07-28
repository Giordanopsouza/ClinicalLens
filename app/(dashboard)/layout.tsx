"use client";

import { PatientProvider } from "@/context/patient-context";
import { SidebarProvider } from "@/context/sidebar-context";
import { PatientSidebar } from "@/components/patients/patient-sidebar";
import { ClinicalChat } from "@/components/chat/clinical-chat";
import { GlobalHeader } from "@/components/layout/global-header";

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
          <main className="flex-1 overflow-hidden border-r border-border/50">
            {children}
          </main>

          {/* Right: AI Intelligence Panel (Copilot) */}
          <ClinicalChat />
        </div>
      </div>
    </PatientProvider>
    </SidebarProvider>
  );
}
