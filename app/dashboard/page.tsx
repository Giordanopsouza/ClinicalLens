"use client";

import { PatientProvider } from "@/context/patient-context";
import { PatientSidebar } from "@/components/patients/patient-sidebar";
import { PatientDetail } from "@/components/patients/patient-detail";
import { ClinicalChat } from "@/components/chat/clinical-chat";
import { GlobalHeader } from "@/components/layout/global-header";

export default function DashboardPage() {
  return (
    <PatientProvider>
      <div className="flex h-screen bg-background overflow-hidden font-sans">
        {/* Left: Module Sidebar (Patient Registry) */}
        <PatientSidebar />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top: Global Navigation & User Controls */}
          <GlobalHeader />

          <div className="flex flex-1 overflow-hidden">
            {/* Center: Workspace (Details, Charts, Records) */}
            <main className="flex-1 overflow-hidden border-r border-border/50">
              <PatientDetail />
            </main>

            {/* Right: AI Intelligence Panel (Copilot) */}
            <ClinicalChat />
          </div>
        </div>
      </div>
    </PatientProvider>
  );
}
