"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePatient } from "@/context/patient-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavigationMenu } from "./navigation-menu";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { useUser, UserButton } from "@clerk/nextjs";
import { useSidebar } from "@/context/sidebar-context";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PatientSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const isRecordsPage = pathname === "/records";
  const patients = useQuery(api.queries.getPatientList, { limit: 100 });
  const { selectedHadmId, setSelectedHadmId } = usePatient();
  const { isLeftCollapsed } = useSidebar();

  const filteredPatients = (patients ?? []).filter((p) => {
    const searchLower = searchQuery.toLowerCase().trim();
    if (!searchLower) return true;
    
    // Strip "AEG-" if present for ID matching
    const idSearch = searchLower.startsWith("aeg-") ? searchLower.slice(4) : searchLower;
    
    return (
      p.admission_diagnosis?.toLowerCase().includes(searchLower) ||
      String(p.hadm_id).includes(idSearch) ||
      (p.subject_id && String(p.subject_id).includes(idSearch))
    );
  });

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-card dark:bg-brand-surface z-10 transition-all duration-300 ease-in-out overflow-hidden shrink-0",
          "shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]",
          isLeftCollapsed ? "w-[64px]" : "w-[280px]"
        )}
      >
        {/* Main Navigation */}
        <NavigationMenu isCollapsed={isLeftCollapsed} />

        {/* Patient List — hidden when collapsed */}
        {!isLeftCollapsed && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-muted/5 z-10 border-b border-border/50 shadow-sm relative">
              <div className="px-4 py-3 flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                  Registry
                </p>
                <Badge
                  variant="outline"
                  className="text-[9px] h-4 px-1.5 font-black border-border/50 bg-background"
                >
                  {filteredPatients.length}
                </Badge>
              </div>
              <div className="px-3 pb-3">
                <div className="relative group">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Filter registry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-7 pl-8 text-[11px] bg-background border-border/50 rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2 pb-8">
                {filteredPatients.map((patient: { hadm_id: number; gender: string; age: number; admission_diagnosis: string }) => (
                  <button
                    key={patient.hadm_id}
                    onClick={() => setSelectedHadmId(patient.hadm_id)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1.5 rounded-xl p-3.5 text-left transition-all duration-300 border border-transparent group",
                      selectedHadmId === patient.hadm_id
                        ? "bg-primary/[0.08] border-primary/20 dark:bg-primary/[0.15] dark:border-primary/30 shadow-sm"
                        : "hover:bg-muted/80 dark:hover:bg-white/[0.02]"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "size-7 rounded-full flex items-center justify-center transition-all duration-300",
                            selectedHadmId === patient.hadm_id
                              ? "bg-primary text-white scale-110 shadow-md shadow-primary/20"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          )}
                        >
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <span
                          className={cn(
                            "font-black font-mono text-[11px]",
                            selectedHadmId === patient.hadm_id
                              ? "text-primary"
                              : "text-foreground/80"
                          )}
                        >
                          AEG-{patient.hadm_id}
                        </span>
                      </div>
                      <Badge
                        variant={
                          selectedHadmId === patient.hadm_id
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "text-[9px] px-1.5 h-4 font-black uppercase tracking-tighter",
                          selectedHadmId === patient.hadm_id
                            ? "bg-primary"
                            : "text-muted-foreground/60 border-border/50"
                        )}
                      >
                        {patient.gender} · {patient.age}y
                      </Badge>
                    </div>
                    <p
                      className={cn(
                        "line-clamp-2 text-xs leading-relaxed pl-9 font-medium",
                        selectedHadmId === patient.hadm_id
                          ? "text-foreground"
                          : "text-muted-foreground/80"
                      )}
                    >
                      {patient.admission_diagnosis ||
                        "No primary diagnosis recorded"}
                    </p>
                  </button>
                ))}
                {filteredPatients.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                      No matching records
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Collapsed: spacer to push footer down */}
        {isLeftCollapsed && <div className="flex-1" />}

        {/* Footer Status */}
        <div
          className={cn(
            "border-t border-border/50 bg-card shrink-0",
            isLeftCollapsed ? "p-3 flex flex-col items-center gap-3" : "p-4 flex flex-col gap-4"
          )}
        >
          {!isLeftCollapsed && (
            <div className="flex items-center justify-between">
              <ThemeSwitcher className="scale-90 origin-left" />
              <span className="text-[10px] font-bold text-muted-foreground opacity-60">
                V1.4.2
              </span>
            </div>
          )}

          {/* User Profile */}
          {isLeftCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="size-9 rounded-lg flex items-center justify-center relative overflow-hidden bg-muted cursor-pointer">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 rounded-lg",
                        userButtonPopoverCard: "bottom-full mb-2",
                      },
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {user?.fullName || "Profile"}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 w-full hover:bg-muted/50 p-2 -mx-2 rounded-xl transition-colors cursor-pointer group">
              <div className="size-9 rounded-lg flex items-center justify-center relative overflow-hidden bg-muted">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 rounded-lg",
                      userButtonPopoverCard: "bottom-full mb-2",
                    },
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {user?.fullName || "Loading..."}
                  </p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate group-hover:text-primary/70 transition-colors">
                    Clinician
                  </p>
                </div>
                <span className="text-muted-foreground group-hover:text-primary transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
