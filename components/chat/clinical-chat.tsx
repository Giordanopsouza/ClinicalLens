"use client";

import { useMemo, useEffect } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { usePatient } from "@/context/patient-context";
import { useSidebar } from "@/context/sidebar-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LabChartCard } from "./generative-ui/lab-chart-card";
import { SafetyAlertCard, SafetyFlag } from "./generative-ui/safety-alert-card";
import { GuidelineCard, GuidelineResult } from "./generative-ui/guideline-card";
import { Activity, Mic, Upload, Sparkles, PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ClinicalChat() {
  const { selectedHadmId } = usePatient();
  const { isRightCollapsed, toggleRight } = useSidebar();
  
  const patient = useQuery(
    api.queries.getPatientById,
    selectedHadmId ? { hadm_id: selectedHadmId } : "skip"
  );

  // ─── Pass patient context to the agent automatically ───────────
  // We use a memoized string to prevent the re-render loop
  const patientInfo = useMemo(() => {
    if (!patient) return "No patient selected";
    return `Patient AEG-${patient.hadm_id}, Age ${patient.age}, Gender ${patient.gender}, Diagnosis: ${patient.admission_diagnosis}`;
  }, [patient]);

  useCopilotReadable({
    description: "Currently selected patient information",
    value: patientInfo,
  });

  // ─── Generative UI Actions ─────────────────────────────────────
  useMemo(() => {
    // These actions are memoized to prevent re-registration and duplicate UI elements
  }, []);

  useCopilotAction({
    name: "renderLabChart",
    description: "Render an interactive lab chart inside the chat.",
    parameters: [
      { name: "hadmId", type: "number", required: true },
      { name: "itemid", type: "number", required: true },
      { name: "labName", type: "string", required: true },
    ],
    handler: async () => {},
    render: ({ args }) => (
      <LabChartCard hadmId={args.hadmId as number} itemid={args.itemid as number} labName={args.labName as string} />
    ),
  });

  useCopilotAction({
    name: "renderSafetyAlert",
    description: "Render a safety alert card showing prescription-diagnosis mismatches.",
    parameters: [
      { name: "hadmId", type: "number", required: true },
      { name: "flags", type: "object", required: true },
      { name: "summary", type: "string", required: true },
    ],
    handler: async () => {},
    render: ({ args }) => (
      <SafetyAlertCard hadmId={args.hadmId as number} flags={args.flags as SafetyFlag[]} summary={args.summary as string} />
    ),
  });

  useCopilotAction({
    name: "renderGuidelines",
    description: "Render guideline search results as cards.",
    parameters: [
      { name: "query", type: "string", required: true },
      { name: "results", type: "object", required: true },
      { name: "answer", type: "string", required: false },
    ],
    handler: async () => {},
    render: ({ args }) => (
      <GuidelineCard query={args.query as string} results={args.results as GuidelineResult[]} answer={args.answer as string} />
    ),
  });

  // ─── Listen for Explore button events ──────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.log("Explore event:", detail.message);
    };
    window.addEventListener("copilot-explore", handler);
    return () => window.removeEventListener("copilot-explore", handler);
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <aside 
        className={cn(
          "border-l border-border bg-card/30 flex flex-col h-full overflow-hidden shadow-xl transition-all duration-300 ease-in-out shrink-0",
          isRightCollapsed ? "w-[64px]" : "w-[380px]"
        )}
      >
        {/* Copilot Header */}
        <div className={cn(
          "p-5 border-b border-border/50 bg-primary/[0.03] flex items-center shrink-0",
          isRightCollapsed ? "justify-center px-0" : "justify-between"
        )}>
          {!isRightCollapsed ? (
            <>
              <div className="flex items-center gap-3">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-foreground uppercase tracking-tight">Clinical Copilot</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Active Intelligence</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={toggleRight}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                    >
                      <PanelRightClose className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Collapse copilot</TooltipContent>
                </Tooltip>
              </div>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={toggleRight}
                  className="flex items-center justify-center w-full h-full py-4 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                >
                  <PanelRightOpen className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">Expand copilot</TooltipContent>
            </Tooltip>
          )}
        </div>

        {!isRightCollapsed && (
          <>
            {/* Chat Area */}
            <div className="flex-1 overflow-hidden relative">
              <CopilotChat
                labels={{
                  title: "Clinical Copilot",
                  initial: patient 
                    ? `I'm Aegis, analyzing Patient AEG-${patient.hadm_id}. How can I assist with this case?`
                    : "I'm Aegis, your clinical intelligence partner. Select a patient to begin analysis.",
                  placeholder: "Ask about clinical data...",
                }}
                className="h-full border-none shadow-none rounded-none"
              />
            </div>

            {/* Chat Input Helpers */}
            <div className="px-4 pb-4 bg-transparent mt-2">
              <div className="flex justify-between items-center px-1">
                <button className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:text-primary transition-colors group">
                  <Mic className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                  Voice Command
                </button>
                <button className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:text-primary transition-colors group">
                  <Upload className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                  Upload Record
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </TooltipProvider>
  );
}
