"use client";

import React, { useMemo } from "react";
import { cleanClinicalText } from "@/lib/utils";
import { FileText, List, Info, Pill, Stethoscope, History, Clock, User, Heart, Activity } from "lucide-react";

interface Section {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
}

const SECTION_HEADERS = [
  { keywords: ["HISTORY OF PRESENT ILLNESS"], title: "History of Present Illness", icon: <History className="h-4 w-4" /> },
  { keywords: ["PAST MEDICAL HISTORY"], title: "Past Medical History", icon: <Clock className="h-4 w-4" /> },
  { keywords: ["SOCIAL HISTORY"], title: "Social History", icon: <User className="h-4 w-4" /> },
  { keywords: ["FAMILY HISTORY"], title: "Family History", icon: <Heart className="h-4 w-4" /> },
  { keywords: ["PHYSICAL EXAMINATION ON ADMISSION", "PHYSICAL EXAMINATION"], title: "Physical Examination", icon: <Stethoscope className="h-4 w-4" /> },
  { keywords: ["LABORATORIES ON ADMISSION", "LABORATORIES"], title: "Initial Laboratories", icon: <Activity className="h-4 w-4" /> },
  { keywords: ["HOSPITAL COURSE"], title: "Hospital Course", icon: <List className="h-4 w-4" /> },
  { keywords: ["DISCHARGE MEDICATIONS", "MEDICATIONS"], title: "Medications", icon: <Pill className="h-4 w-4" /> },
  { keywords: ["DISCHARGE DIAGNOSES", "DISCHARGE DIAGNOSIS"], title: "Discharge Diagnoses", icon: <Info className="h-4 w-4" /> },
  { keywords: ["DISPOSITION"], title: "Disposition", icon: <FileText className="h-4 w-4" /> },
  { keywords: ["FOLLOWUP", "FOLLOW-UP"], title: "Follow-up Plan", icon: <Clock className="h-4 w-4" /> },
];

export function MedicalDocument({ rawText, highlightTerm = "" }: { rawText: string; highlightTerm?: string }) {
  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return <>{text}</>;
    const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const sections = useMemo(() => {
    if (!rawText) return [];

    const cleanedText = cleanClinicalText(rawText);
    const parsedSections: Section[] = [];
    
    // Split the text into parts based on common medical headers
    const lines = cleanedText.split('\n');
    let currentSection: Section = {
      id: "intro",
      title: "Admission Summary",
      content: "",
      icon: <Info className="h-4 w-4" />
    };

    for (const line of lines) {
      const upperLine = line.trim().toUpperCase();
      let matchedHeader = null;

      for (const header of SECTION_HEADERS) {
        if (header.keywords.some(kw => upperLine.startsWith(kw))) {
          matchedHeader = header;
          break;
        }
      }

      if (matchedHeader) {
        // Save previous section if it has content
        if (currentSection.content.trim()) {
          parsedSections.push(currentSection);
        }
        
        const baseId = matchedHeader.title.toLowerCase().replace(/\s+/g, "-");
        let finalId = baseId;
        let counter = 1;
        
        // Ensure unique ID
        while (parsedSections.some(s => s.id === finalId)) {
          finalId = `${baseId}-${counter}`;
          counter++;
        }

        currentSection = {
          id: finalId,
          title: matchedHeader.title,
          content: "",
          icon: matchedHeader.icon
        };
      } else {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection.content.trim()) {
      parsedSections.push(currentSection);
    }

    return parsedSections;
  }, [rawText]);

  if (sections.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-3xl">
        <p className="text-sm text-muted-foreground italic">No medical record data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative">
      {/* Table of Contents - Sidebar */}
      <div className="lg:w-64 shrink-0">
        <div className="sticky top-6 space-y-4">
          <div className="px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Record Sections</p>
          </div>
          <nav className="space-y-1">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group"
              >
                <span className="opacity-40 group-hover:opacity-100 transition-opacity">
                  {section.icon}
                </span>
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-8 min-w-0">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="bg-card border border-border/50 rounded-3xl shadow-sm overflow-hidden scroll-mt-24 group hover:border-primary/20 transition-colors"
          >
            <div className="px-8 py-5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-foreground/80">
                  {section.title}
                </h3>
              </div>
            </div>
            <div className="p-8">
              <p className="text-sm leading-relaxed text-foreground/70 font-medium whitespace-pre-wrap selection:bg-primary/20">
                {highlightText(section.content.trim(), highlightTerm)}
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
