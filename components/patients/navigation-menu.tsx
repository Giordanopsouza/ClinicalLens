"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, BookOpen, Bell, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function NavItem({ icon, label, href }: NavItemProps) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer group relative",
        active 
          ? "bg-primary/10 text-primary font-bold" 
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium"
      )}
    >
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
    </Link>
  );
}

export function NavigationMenu() {
  return (
    <div className="px-3 py-4 space-y-1 border-b border-border/50">
      <NavItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
      <NavItem href="/records" icon={<FileText className="h-4 w-4" />} label="Patient Records" />
      <NavItem href="/protocols" icon={<BookOpen className="h-4 w-4" />} label="Protocols" />
      <NavItem href="/alerts" icon={<Bell className="h-4 w-4" />} label="Alert Center" />
      <div className="pt-2">
        <NavItem href="/settings" icon={<Settings className="h-4 w-4" />} label="System Settings" />
      </div>
    </div>
  );
}
