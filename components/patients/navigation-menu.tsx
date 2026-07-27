"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, BookOpen, Bell, Settings } from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active }: NavItemProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer group relative",
      active 
        ? "bg-primary/10 text-primary font-bold" 
        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium"
    )}>
      <span className={cn(
        "size-5 flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
        active ? "text-primary" : "text-muted-foreground/60 group-hover:text-primary"
      )}>
        {icon}
      </span>
      <span className="text-[13px] tracking-tight">{label}</span>
      {active && (
        <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </div>
  );
}

export function NavigationMenu() {
  return (
    <div className="px-3 py-4 space-y-1 border-b border-border/50">
      <NavItem icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" active />
      <NavItem icon={<FileText className="h-4 w-4" />} label="Patient Records" />
      <NavItem icon={<BookOpen className="h-4 w-4" />} label="Protocols" />
      <NavItem icon={<Bell className="h-4 w-4" />} label="Alert Center" />
      <div className="pt-2">
        <NavItem icon={<Settings className="h-4 w-4" />} label="System Settings" />
      </div>
    </div>
  );
}
