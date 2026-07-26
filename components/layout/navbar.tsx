"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { motion } from "motion/react";
import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher";
import { Button } from "@/components/ui/button";

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
            <span className="hidden font-bold sm:inline-block tracking-tight">
              Clinical Lens
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Documentation
            </Link>
          </div>
          <ThemeSwitcher />
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button variant="default" size="sm" asChild className="shadow-sm shadow-primary/20">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
