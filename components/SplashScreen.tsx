"use client";

import React, { useEffect, useState } from "react";
import SplashSkyline from "./SplashSkyline";

export default function SplashScreen({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadingOut(true), 2900);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 3300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white dark:bg-[#0B0F17] transition-opacity duration-400 ${
        fadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* City skyline rising behind the wordmark */}
      <div className="absolute inset-x-0 bottom-[8%] flex justify-center pointer-events-none opacity-80 dark:opacity-90">
        <SplashSkyline />
      </div>

      <div className="relative flex items-baseline text-7xl md:text-9xl font-black tracking-tight">
        <span className="inline-block text-slate-950 dark:text-white nb-n-roll">N</span>
        <span className="text-slate-950 dark:text-white nb-rest-in" style={{ animationDelay: "100ms" }}>
          ex
        </span>
        <span className="text-slate-950 dark:text-white nb-rest-in" style={{ animationDelay: "170ms" }}>
          Build
        </span>
        <span className="text-indigo-500 nb-rest-in" style={{ animationDelay: "240ms" }}>
          .ai
        </span>
      </div>
    </div>
  );
}
