"use client";

import Link from "next/link";
import { Bell, Search, HeartPulse, Settings } from "lucide-react";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";

export function GlobalHeader() {
  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
      <div className="flex-1" />
      
      <div className="flex items-center justify-center flex-1 w-full shrink-0 min-w-0">
        {/* Global Search Bar */}
        <div className="relative w-full max-w-[600px] group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search across all patient records, protocols, and clinical data..." 
            className="h-10 pl-9 text-[13px] bg-muted/40 border-transparent focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg w-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 flex-1">
        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted transition-all duration-300">
            <Bell className="h-4 w-4" />
          </button>
          
          <div className="h-6 w-px bg-border/50 mx-1" />
          
          {/* Live System Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-md">
            <div className="size-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live System</span>
          </div>
        </div>
      </div>
    </header>
  );
}
