"use client";

import React, { createContext, useContext, useState } from "react";
import CopilotCenterModal from "./CopilotCenterModal";

interface CopilotModalContextValue {
  openCopilot: (taskId?: string) => void;
  closeCopilot: () => void;
}

const CopilotModalContext = createContext<CopilotModalContextValue | null>(null);

export function CopilotModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialTaskId, setInitialTaskId] = useState<string | undefined>(undefined);

  const openCopilot = (taskId?: string) => {
    setInitialTaskId(taskId);
    setIsOpen(true);
  };
  const closeCopilot = () => setIsOpen(false);

  return (
    <CopilotModalContext.Provider value={{ openCopilot, closeCopilot }}>
      {children}
      <CopilotCenterModal open={isOpen} initialTaskId={initialTaskId} onClose={closeCopilot} />
    </CopilotModalContext.Provider>
  );
}

export function useCopilotModal() {
  const ctx = useContext(CopilotModalContext);
  if (!ctx) throw new Error("useCopilotModal must be used within CopilotModalProvider");
  return ctx;
}
