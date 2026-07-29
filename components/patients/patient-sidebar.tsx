"use client";

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
  const { isLeftCollapsed } = useSidebar();

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

        {/* Registry list removed - migrated to Global Header Search */}
        <div className="flex-1" />

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
