"use client";

import { History, ArrowRight, Activity, FlaskConical, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimelineEventProps {
  type: "admission" | "lab" | "medication";
  date: string;
  title: string;
  description: string;
  color: string;
  isLast?: boolean;
}

function TimelineEvent({ type, date, title, description, color, isLast }: TimelineEventProps) {
  return (
    <div className="relative pl-8 pb-8 last:pb-0">
      {!isLast && <div className="absolute left-[11px] top-4 bottom-0 w-0.5 bg-border/50" />}
      <div className={cn(
        "absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-background flex items-center justify-center z-10 shadow-sm",
        color
      )}>
        {/* Small dot or icon could go here, but design used solid color */}
      </div>
      
      <div className="group bg-card dark:bg-brand-surface p-5 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-muted/50">
              {type}
            </Badge>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{date}</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
        </div>
        <h4 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function LongitudinalRecord() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
          <History className="h-3.5 w-3.5" />
          Longitudinal Patient History
        </h2>
        <div className="flex gap-2">
          <button className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground hover:text-primary transition-colors"><Activity className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="space-y-2 pr-2">
        <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2 px-1">
          <div className="size-1.5 rounded-full bg-primary animate-pulse" />
          October 2023
        </div>

        <TimelineEvent 
          type="admission"
          date="Oct 24, 09:15 AM"
          title="Acute Decompensated Heart Failure"
          description="Patient presented with 3-day history of worsening orthopnea and peripheral edema. BP 155/92, SpO2 91% on RA."
          color="bg-blue-500"
        />

        <TimelineEvent 
          type="lab"
          date="Oct 24, 11:30 AM"
          title="Comprehensive Metabolic Panel (CMP)"
          description="Creatinine elevated to 1.8 mg/dL. BNP critical at 1,240 pg/mL. Electrolytes within normal limits."
          color="bg-amber-500"
        />

        <TimelineEvent 
          type="medication"
          date="Oct 24, 01:00 PM"
          title="Medication Change: Furosemide"
          description="IV Furosemide 40mg BID initiated for acute diuresis. Monitor daily weights and electrolytes closely."
          color="bg-emerald-500"
        />

        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] my-10 flex items-center gap-2 px-1">
          <div className="size-1.5 rounded-full bg-muted-foreground/30" />
          September 2023
        </div>

        <TimelineEvent 
          type="admission"
          date="Sep 12, 02:30 PM"
          title="Cardiology Follow-up (Outpatient)"
          description="Stable NYHA Class II symptoms. Discussed strict salt restriction and weight monitoring."
          color="bg-slate-400"
          isLast
        />
      </div>
    </div>
  );
}
