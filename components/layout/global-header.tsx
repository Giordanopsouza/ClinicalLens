"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Settings, Activity, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/context/sidebar-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Workbench",
  "/records": "Patient Records",
  "/protocols": "Protocols",
  "/alerts": "Alert Center",
  "/cohorts": "Cohort Explorer",
  "/settings": "Settings",
};

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePatient } from "@/context/patient-context";
import { useRouter } from "next/navigation";

export function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const pageLabel = ROUTE_LABELS[pathname] ?? "Dashboard";
  const { isLeftCollapsed, toggleLeft } = useSidebar();
  const { setSelectedHadmId } = usePatient();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchResults = useQuery(
    api.queries.searchPatients,
    searchQuery.length >= 2 ? { query: searchQuery, limit: 10 } : "skip"
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPatient = (hadmId: number) => {
    setSelectedHadmId(hadmId);
    setSearchQuery("");
    setShowResults(false);
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center sticky top-0 z-50 shrink-0 shadow-sm">
        {/* Left brand zone — matches sidebar width, contains logo + toggle */}
        <div
          className="flex items-center shrink-0 border-r border-border/50 h-full transition-all duration-300"
          style={{ width: isLeftCollapsed ? 64 : 280 }}
        >
          {isLeftCollapsed ? (
            /* Collapsed: full-zone toggle button for easy clicking */
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleLeft}
                  className="flex items-center justify-center w-full h-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : (
            /* Expanded: logo + name + collapse button */
            <div className="flex items-center gap-3 px-4 w-full">
              <div className="size-7 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm shadow-primary/20 shrink-0">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-sm font-black tracking-tight text-foreground uppercase truncate flex-1">
                Clinical Lens
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleLeft}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 shrink-0"
                    aria-label="Collapse sidebar"
                  >
                    <PanelLeftClose className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Collapse sidebar</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Right zone — breadcrumb + search + actions */}
        <div className="flex items-center gap-6 flex-1 px-6">
          {/* Breadcrumb */}
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest shrink-0">
            {pageLabel}
          </span>

          {/* Global Search Bar */}
          <div className="relative w-full max-w-md group hidden md:block" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                ref={inputRef}
                placeholder="Search registry (e.g. COPD, AEG-123)..."
                className="h-9 pl-9 pr-12 text-[11px] bg-muted/30 border-border/50 focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-xl shadow-inner"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:flex items-center gap-1">
                <kbd className="h-5 px-1.5 rounded border border-border bg-background text-[9px] font-black text-muted-foreground/50 shadow-sm uppercase">
                  ⌘K
                </kbd>
              </div>
            </div>
            
            {showResults && searchQuery.length >= 2 && (
              <div className="absolute top-full mt-3 w-full bg-card border border-border/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                <div className="p-3 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Registry Results</p>
                  {searchResults && (
                    <Badge variant="secondary" className="text-[8px] h-4 px-1 font-black opacity-60">{searchResults.length} matches</Badge>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {searchResults === undefined ? (
                    <div className="p-8 text-center">
                      <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest animate-pulse">Scanning Registry...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-10 text-center">
                      <div className="size-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-20">
                        <Search className="h-5 w-5" />
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">No patients found</p>
                      <p className="text-[9px] text-muted-foreground/60 mt-1">Try searching by ID (e.g. 123) or Diagnosis</p>
                    </div>
                  ) : (
                    <div className="p-1.5 space-y-0.5">
                      {searchResults.map((p) => (
                        <button
                          key={p.hadm_id}
                          onClick={() => handleSelectPatient(p.hadm_id)}
                          className="w-full flex flex-col items-start gap-1 p-3.5 rounded-xl hover:bg-primary/[0.04] dark:hover:bg-primary/[0.1] transition-all text-left group border border-transparent hover:border-primary/10"
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Activity className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-[11px] font-black font-mono text-primary group-hover:scale-105 transition-transform origin-left">AEG-{p.hadm_id}</span>
                            </div>
                            <Badge variant="outline" className="text-[8px] h-4 px-1.5 font-black uppercase tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">{p.gender} · {p.age}y</Badge>
                          </div>
                          <p className="text-xs font-bold text-foreground/80 group-hover:text-foreground transition-colors line-clamp-1 pl-8">{p.admission_diagnosis}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions pushed to right */}
          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all duration-300">
              <Settings className="h-4 w-4" />
            </button>

            <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all duration-300">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 size-1.5 bg-red-500 rounded-full ring-2 ring-card" />
            </button>

            <div className="h-6 w-px bg-border/50 mx-1" />

            <ThemeSwitcher className="scale-90" />

            <div className="h-6 w-px bg-border/50 mx-1" />

            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "size-8 rounded-lg border border-primary/20 shadow-sm",
                },
              }}
            />
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
