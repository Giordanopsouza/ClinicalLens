"use client";

import { createContext, useContext, useState } from "react";

interface SidebarContextValue {
  isLeftCollapsed: boolean;
  toggleLeft: () => void;
  isRightCollapsed: boolean;
  toggleRight: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isLeftCollapsed: false,
  toggleLeft: () => {},
  isRightCollapsed: false,
  toggleRight: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isLeftCollapsed,
        toggleLeft: () => setIsLeftCollapsed((v) => !v),
        isRightCollapsed,
        toggleRight: () => setIsRightCollapsed((v) => !v),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
