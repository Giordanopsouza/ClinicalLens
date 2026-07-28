"use client";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 px-6 py-2 shrink-0">
      <p className="text-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
        <span className="text-primary mr-1">Compliance Notice:</span> Clinical Lens is a clinical decision 
        <em className="text-foreground mx-1 not-italic underline decoration-primary/30">support</em> 
        tool for research and educational purposes only. Not intended for direct clinical use. 
        Consult qualified healthcare professionals for all medical decisions.
      </p>
    </footer>
  );
}
