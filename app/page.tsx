"use client";

import Link from "next/link";
import { ArrowRight, Activity, Shield, BarChart3, Search } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as any,
        stiffness: 100,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 md:py-32 overflow-hidden">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center text-center"
          >
            <motion.div 
              variants={itemVariants}
              className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              <span className="mr-2 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Next-Gen Clinical Decision Support
            </motion.div>
            <motion.h1 
              variants={itemVariants}
              className="max-w-4xl text-4xl font-bold tracking-tight sm:text-7xl"
            >
              Precision Medicine Powered by <span className="text-primary italic">Clinical Lens</span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed"
            >
              Empower clinicians with real-time AI insights, automated safety audits, 
              and advanced data visualization. The ultimate copilot for the modern healthcare professional.
            </motion.p>
            <motion.div 
              variants={itemVariants}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 button-glow transition-all active:scale-95" asChild>
                <Link href="/dashboard">
                  Launch Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link href="/docs">View Documentation</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-muted/30 py-24 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_50%)] opacity-[0.03]" />
          <div className="container mx-auto px-4 relative">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Advanced AI Capabilities
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Clinical Lens integrates deeply with patient data to provide actionable intelligence.
              </p>
            </div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              <FeatureCard
                variants={itemVariants}
                icon={<Activity className="h-6 w-6 text-primary" />}
                title="Clinical Copilot"
                description="Real-time AI assistant that understands complex medical histories and provides immediate answers."
              />
              <FeatureCard
                variants={itemVariants}
                icon={<Shield className="h-6 w-6 text-[var(--color-brand-success)]" />}
                title="Safety Auditing"
                description="Automated cross-referencing of medications and diagnoses to catch potential charting errors."
              />
              <FeatureCard
                variants={itemVariants}
                icon={<BarChart3 className="h-6 w-6 text-[var(--color-brand-info)]" />}
                title="Visual Lab Trends"
                description="Interactive time-series visualization for lab results, helping identify critical patient changes."
              />
              <FeatureCard
                variants={itemVariants}
                icon={<Search className="h-6 w-6 text-[var(--color-brand-warning)]" />}
                title="Case Search"
                description="Semantic vector search to find similar clinical presentations across historical data."
              />
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-bold">Clinical Lens</span>
          </div>
          <p className="text-sm text-muted-foreground text-center sm:text-left max-w-md">
            © 2026 Clinical Lens. For research and clinical decision support only. 
            Not a substitute for professional medical judgment.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ variants, icon, title, description }: { variants: any; icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      variants={variants}
      whileHover={{ y: -8, transition: { duration: 0.2 } as any }}
      className={cn(
        "group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50",
        "dark:card-glow"
      )}
    >
      <div className="mb-6 inline-block rounded-xl bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/5 group-hover:ring-primary/20 transition-all" />
    </motion.div>
  );
}
