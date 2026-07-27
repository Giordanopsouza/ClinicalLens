"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { motion } from "motion/react";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
            <Activity className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block tracking-tight text-foreground uppercase">
              Clinical Lens
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/dashboard"
              className="text-xs font-black uppercase tracking-widest transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/docs"
              className="text-xs font-black uppercase tracking-widest transition-colors hover:text-primary"
            >
              Docs
            </Link>
          </div>
          
          <ThemeSwitcher className="scale-90" />
          
          <div className="h-6 w-px bg-border/50 mx-1" />

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="default" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest px-4 shadow-sm shadow-primary/20">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild className="h-8 text-[10px] font-black uppercase tracking-widest px-4 border-primary/20 text-primary hover:bg-primary/5">
                <Link href="/dashboard">Launch Dashboard</Link>
              </Button>
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "size-8 rounded-lg border border-primary/20 shadow-sm",
                  }
                }}
              />
            </div>
          </SignedIn>
        </div>
      </div>
    </motion.nav>
  );
}
