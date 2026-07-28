"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePatient } from "@/context/patient-context";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavigationMenu } from "./navigation-menu";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { useUser, UserButton } from "@clerk/nextjs";
import { useSidebar } from "@/context/sidebar-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function PatientSidebar() {
  const { user } = useUser();
  const patients = useQuery(api.queries.getPatientList, { limit: 100 });
  const { selectedHadmId, setSelectedHadmId } = usePatient();
  const [search, setSearch] = useState("");
  const { isCollapsed } = useSidebar();

  const filtered = (patients ?? []).filter(
    (p) =>
      p.admission_diagnosis?.toLowerCase().includes(search.toLowerCase()) ||
      String(p.hadm_id).includes(search) ||
      String(p.subject_id).includes(search)
  );

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-card dark:bg-brand-surface z-10 transition-all duration-300 ease-in-out overflow-hidden shrink-0",
          "shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]",
          isCollapsed ? "w-[64px]" : "w-[280px]"
        )}
      >
        {/* Main Navigation */}
        <NavigationMenu isCollapsed={isCollapsed} />

        {/* Patient Search & List — hidden when collapsed */}
        {!isCollapsed && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 bg-muted/5 z-10 border-b border-border/50 shadow-sm relative">
              <div className="flex items-center justify-between px-1 mb-3">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                  Registry
                </p>
              </div>
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search registry..."
                  className="pl-9 h-9 text-xs bg-background/50 dark:bg-[#030712] border-border/50 focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="mt-4 flex items-center justify-between px-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-80">
                  Registry Items
                </p>
                <Badge
                  variant="outline"
                  className="text-[9px] h-4 px-1.5 font-black border-border/50 bg-background"
                >
                  {filtered.length}
                </Badge>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-1 p-2 pb-8">
                {filtered.map((patient) => (
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
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Collapsed: spacer to push footer down */}
        {isCollapsed && <div className="flex-1" />}

        {/* Footer Status */}
        <div
          className={cn(
            "border-t border-border/50 bg-card shrink-0",
            isCollapsed ? "p-3 flex flex-col items-center gap-3" : "p-4 flex flex-col gap-4"
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center justify-between">
              <ThemeSwitcher className="scale-90 origin-left" />
              <span className="text-[10px] font-bold text-muted-foreground opacity-60">
                V1.4.2
              </span>
            </div>
          )}

          {/* User Profile */}
          {isCollapsed ? (
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
