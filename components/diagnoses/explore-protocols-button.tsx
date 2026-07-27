"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";

interface ExploreProtocolsButtonProps {
  icd9Code: string;
  diagnosisTitle: string;
}

export function ExploreProtocolsButton({
  icd9Code,
  diagnosisTitle,
}: ExploreProtocolsButtonProps) {
  const [loading, setLoading] = useState(false);

  // This triggers the CopilotKit chat to search for guidelines
  const handleExplore = () => {
    setLoading(true);
    // Dispatch a message to the copilot chat via window event
    window.dispatchEvent(
      new CustomEvent("copilot-explore", {
        detail: {
          message: `Search for the latest 2026 clinical guidelines and treatment protocols for ICD-9 code ${icd9Code} (${diagnosisTitle}). Include any relevant clinical trials or FDA updates.`,
        },
      })
    );
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExplore}
      disabled={loading}
      className="shrink-0 h-8 text-[10px] font-bold uppercase tracking-wider gap-1.5 px-3 border-primary/20 text-primary hover:bg-primary/5"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <ExternalLink className="h-3 w-3" />
      )}
      Explore
    </Button>
  );
}
