"use client";

import React, { createContext, useContext, useState } from "react";
import CpmEngineConsole from "./CpmEngineConsole";
import type { CpmTaskInput } from "@/lib/cpm";

interface CpmConsoleContextValue {
  openConsole: (tasks?: CpmTaskInput[], title?: string) => void;
  closeConsole: () => void;
}

const CpmConsoleContext = createContext<CpmConsoleContextValue | null>(null);

export function CpmConsoleProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<CpmTaskInput[] | undefined>(undefined);
  const [title, setTitle] = useState<string | undefined>(undefined);

  const openConsole = (t?: CpmTaskInput[], ti?: string) => {
    setTasks(t);
    setTitle(ti);
    setIsOpen(true);
  };
  const closeConsole = () => setIsOpen(false);

  return (
    <CpmConsoleContext.Provider value={{ openConsole, closeConsole }}>
      {children}
      <CpmEngineConsole open={isOpen} onClose={closeConsole} tasks={tasks} title={title} />
    </CpmConsoleContext.Provider>
  );
}

export function useCpmConsole() {
  const ctx = useContext(CpmConsoleContext);
  if (!ctx) throw new Error("useCpmConsole must be used within CpmConsoleProvider");
  return ctx;
}
