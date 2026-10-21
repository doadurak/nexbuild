"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useCopilotModal } from "./CopilotModalProvider";

/**
 * Global floating launcher, present on every page. Opens the centered
 * Copilot modal instead of a side panel, so it never eats screen width.
 * Hidden on /promo — that page stages its own scripted copy of this bubble.
 */
export default function CopilotWidget() {
  const { openCopilot } = useCopilotModal();
  const pathname = usePathname();
  if (pathname === "/promo") return null;

  return (
    <button
      onClick={() => openCopilot()}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center transition-colors"
      title="Open Copilot"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
