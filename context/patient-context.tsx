"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PatientContextType {
  selectedHadmId: number | null;
  setSelectedHadmId: (id: number | null) => void;
}

const PatientContext = createContext<PatientContextType>({
  selectedHadmId: null,
  setSelectedHadmId: () => {},
});

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedHadmId, setSelectedHadmId] = useState<number | null>(null);

  return (
    <PatientContext.Provider value={{ selectedHadmId, setSelectedHadmId }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  return useContext(PatientContext);
}
