"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, HeartPulse, Settings } from "lucide-react";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  label: string;
}

function NavItem({ href, label }: NavItemProps) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 rounded-lg",
        active 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
      )}
    >
      {label}
    </Link>
  );
}

export function GlobalHeader() {
  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50 shrink-0 shadow-sm">
      <div className="flex items-center gap-8 flex-1">
        {/* Module Switcher (Header Level) */}
        <nav className="flex items-center gap-2">
          <NavItem href="/dashboard" label="Workbench" />
          <NavItem href="/records" label="Records" />
          <NavItem href="/protocols" label="Protocols" />
          <NavItem href="/alerts" label="Alerts" />
        </nav>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search clinical data..." 
            className="h-8 pl-9 text-[10px] bg-muted/30 border-transparent focus-visible:ring-1 focus-visible:ring-primary transition-all rounded-lg"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Global Actions */}
        <div className="flex items-center gap-2">
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
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}
