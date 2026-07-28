"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Settings, Activity, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
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
  "/settings": "Settings",
};

export function GlobalHeader() {
  const pathname = usePathname();
  const pageLabel = ROUTE_LABELS[pathname] ?? "Dashboard";
  const { isCollapsed, toggle } = useSidebar();

  return (
    <TooltipProvider delayDuration={300}>
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center sticky top-0 z-50 shrink-0 shadow-sm">
        {/* Left brand zone — matches sidebar width, contains logo + toggle */}
        <div
          className="flex items-center shrink-0 border-r border-border/50 h-full transition-all duration-300"
          style={{ width: isCollapsed ? 64 : 280 }}
        >
          {isCollapsed ? (
            /* Collapsed: full-zone toggle button for easy clicking */
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggle}
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
                    onClick={toggle}
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
          <div className="relative w-full max-w-md group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search clinical data..."
              className="h-8 pl-9 text-[10px] bg-muted/30 border-transparent focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg"
            />
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
