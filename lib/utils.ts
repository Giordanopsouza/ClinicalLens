import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard utility for tailwind class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Utility to remove MIMIC-III de-identification brackets
 */
export function cleanClinicalText(text: string | undefined | null): string {
  if (!text) return "";
  // Remove MIMIC-III brackets like [**Hospital 1**] or [**2180-11-7**]
  // but keep the text inside if it's not a generic placeholder
  return text.replace(/\[\*\*.*?\*\*\]/g, (match) => {
    const content = match.slice(3, -3).trim();
    // If it's a date or name pattern, we can keep it cleaner
    return content || "";
  });
}
