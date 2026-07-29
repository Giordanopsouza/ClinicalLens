"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, BookOpen, Bell, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isCollapsed?: boolean;
}

function NavItem({ icon, label, href, isCollapsed }: NavItemProps) {
  const pathname = usePathname();
  const active = pathname === href;

  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center rounded-xl transition-all cursor-pointer group relative",
        isCollapsed
          ? "justify-center size-10 mx-auto"
          : "gap-3 px-4 py-2.5 w-full",
        active
          ? "bg-primary/10 text-primary font-bold"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0",
          isCollapsed ? "size-5" : "size-5",
          active
            ? "text-primary"
            : "text-muted-foreground/60 group-hover:text-primary"
        )}
      >
        {icon}
      </span>
      {!isCollapsed && (
        <span className="text-[13px] tracking-tight">{label}</span>
      )}
      {!isCollapsed && active && (
        <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

interface NavigationMenuProps {
  isCollapsed?: boolean;
}

export function NavigationMenu({ isCollapsed }: NavigationMenuProps) {
  return (
    <div
      className={cn(
        "py-4 border-b border-border/50",
        isCollapsed ? "px-2" : "px-3"
      )}
    >
      {!isCollapsed && (
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 px-4 pb-2">
          Navigation
        </p>
      )}
      <div className="space-y-1">
        <NavItem
          href="/dashboard"
          icon={<LayoutDashboard className="h-4 w-4" />}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/records"
          icon={<FileText className="h-4 w-4" />}
          label="Patient Records"
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/protocols"
          icon={<BookOpen className="h-4 w-4" />}
          label="Protocols"
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/alerts"
          icon={<Bell className="h-4 w-4" />}
          label="Alert Center"
          isCollapsed={isCollapsed}
        />
        <NavItem
          href="/cohorts"
          icon={<Users className="h-4 w-4" />}
          label="Cohort Explorer"
          isCollapsed={isCollapsed}
        />
      </div>
      <div
        className={cn(
          "mt-4 pt-3 border-t border-border/30 space-y-1",
        )}
      >
        {!isCollapsed && (
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 px-4 pb-2">
            Configuration
          </p>
        )}
        <NavItem
          href="/settings"
          icon={<Settings className="h-4 w-4" />}
          label="System Settings"
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  );
}
