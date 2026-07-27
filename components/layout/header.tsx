"use client";

import { Activity } from "lucide-react";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold tracking-tight">
          Clinical Lens
        </h1>
        <span className="text-xs text-muted-foreground">
          Clinical Copilot
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
      </div>
    </header>
  );
}
