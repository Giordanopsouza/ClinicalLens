"use client";

import Link from "next/link";
import { ArrowRight, Activity, Shield, Search, Database, Globe, LineChart, FileText, Zap, Sparkles } from "lucide-react";
import { motion, Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative container mx-auto px-4 py-24 md:py-32 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative flex flex-col items-center text-center z-10"
          >
            <motion.div 
              variants={itemVariants}
              className="mb-8 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-black tracking-widest uppercase text-primary shadow-sm"
            >
              <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
              The AI-Powered Medical OS
            </motion.div>
            <motion.h1 
              variants={itemVariants}
              className="max-w-5xl text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60 leading-[1.1]"
            >
              Agentic Intelligence <br className="hidden md:block" />
              <span className="text-primary italic pr-2">for Clinical Teams.</span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed font-medium"
            >
              The AI-powered workbench for physicians and researchers. 
              Instantly analyze 2,000+ records, audit clinical safety, and discover grounded insights in seconds.
            </motion.p>
            <motion.div 
              variants={itemVariants}
              className="mt-12 flex flex-col gap-4 sm:flex-row items-center justify-center w-full sm:w-auto"
            >
              <Button size="lg" className="h-14 px-10 text-sm font-black uppercase tracking-widest shadow-[0_0_40px_rgba(13,59,165,0.3)] hover:shadow-[0_0_60px_rgba(13,59,165,0.4)] transition-all active:scale-95 rounded-full w-full sm:w-auto" asChild>
                <Link href="/dashboard">
                  Launch Clinical Workbench <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            
            {/* Interactive Search Mockup */}
            <motion.div variants={itemVariants} className="mt-20 w-full max-w-3xl mx-auto">
              <div className="p-2 rounded-2xl bg-card border border-border/50 shadow-2xl flex items-center gap-3 backdrop-blur-xl bg-card/80">
                <Search className="ml-4 h-5 w-5 text-muted-foreground" />
                <div className="flex-1 text-left text-sm text-muted-foreground font-mono">
                  Search registry (e.g. COPD, AEG-193143)...
                </div>
                <div className="hidden sm:flex items-center gap-1 pr-2">
                  <kbd className="h-7 px-2.5 rounded-lg border border-border bg-muted/50 text-[11px] font-black text-foreground shadow-sm uppercase flex items-center justify-center">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Grid Section */}
        <section className="border-t border-border/50 bg-card py-32 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="mb-20 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl uppercase">
                A Unified Clinical Platform
              </h2>
              <p className="mt-6 text-lg text-muted-foreground font-medium leading-relaxed">
                We've combined lightning-fast global discovery with deep, agentic medical analysis to create the ultimate tool for hospitalists and researchers.
              </p>
            </div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <FeatureCard
                variants={itemVariants}
                icon={<Database className="h-6 w-6 text-primary" />}
                title="Global Discovery"
                description="Press ⌘K from anywhere to instantly search across 2,000+ patient cases. Intelligent indexing finds matches by ID or diagnosis in under 50ms."
              />
              <FeatureCard
                variants={itemVariants}
                icon={<Activity className="h-6 w-6 text-emerald-500" />}
                title="Clinical Intelligence"
                description="Our clinical agent automatically recognizes your active patient context. Ask it to synthesize histories or draw interactive time-series lab charts."
              />
              <FeatureCard
                variants={itemVariants}
                icon={<FileText className="h-6 w-6 text-amber-500" />}
                title="Official Medical Archive"
                description="A high-fidelity document viewer featuring intelligent sectioning, sticky navigation, PDF exports, and cryptographic audit trails."
              />
              <FeatureCard
                variants={itemVariants}
                icon={<Globe className="h-6 w-6 text-blue-500" />}
                title="Grounded Evidence Search"
                description="Search the live internet for current clinical guidelines from global health organizations and major medical journals."
              />
              <FeatureCard
                variants={itemVariants}
                icon={<Shield className="h-6 w-6 text-red-500" />}
                title="Safety Alert Center"
                description="Automated heuristic scanning flags dangerous prescription-diagnosis mismatches across the entire patient population."
              />
              <FeatureCard
                variants={itemVariants}
                icon={<LineChart className="h-6 w-6 text-purple-500" />}
                title="Cohort Analytics"
                description="Dive into population-level data. Analyze average age, gender density, and primary admission drivers across the entire hospital registry."
              />
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <Zap className="h-12 w-12 mx-auto mb-8 text-white/80" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">
              Ready to modernize your workflow?
            </h2>
            <p className="text-xl text-primary-foreground/80 font-medium max-w-2xl mx-auto mb-12">
              Experience the future of medical record analysis. No setup required.
            </p>
            <Button size="lg" variant="secondary" className="h-14 px-10 text-sm font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform text-primary" asChild>
              <Link href="/dashboard">
                Start Exploring Now
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
              <Activity className="h-4 w-4" />
            </div>
            <span className="font-black uppercase tracking-widest text-sm">Clinical Lens</span>
          </div>
          <p className="text-xs font-bold text-muted-foreground text-center sm:text-left uppercase tracking-widest">
            © 2026 Clinical Lens. For demo and research purposes only. 
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ variants, icon, title, description }: { variants: Variants; icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      variants={variants}
      className={cn(
        "group relative rounded-3xl border border-border/50 bg-muted/20 p-8 transition-all hover:bg-muted/50 hover:border-primary/20",
        "dark:hover:bg-primary/[0.02]"
      )}
    >
      <div className="mb-6 inline-flex size-12 items-center justify-center rounded-2xl bg-background border border-border/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="mb-3 text-lg font-black uppercase tracking-widest text-foreground/90">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
        {description}
      </p>
    </motion.div>
  );
}
