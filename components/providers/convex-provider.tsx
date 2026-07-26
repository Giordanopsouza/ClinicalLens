"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  const convex = useMemo(() => {
    if (!convexUrl || convexUrl === "https://your-project.convex.cloud") {
      console.warn("NEXT_PUBLIC_CONVEX_URL is not set or is using a placeholder. Convex features will not work.");
      return null;
    }
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  if (!convex) {
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
