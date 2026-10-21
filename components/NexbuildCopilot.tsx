"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  Cpu,
  FileDown,
  RefreshCw,
  BarChart3,
  Dices,
  Printer,
  Bell,
  Sun,
  Moon,
  Search,
  CircleHelp,
  Sparkles,
} from "lucide-react";
import SplashScreen from "./SplashScreen";
import Sidebar from "./Sidebar";
import DashboardHome from "./DashboardHome";
import { useTheme } from "./ThemeProvider";
import { useCpmConsole } from "./CpmConsoleProvider";
import { useCopilotModal } from "./CopilotModalProvider";

type TabKey = "home" | "gantt" | "montecarlo";

interface GanttTask {
  id: string;
  name: string;
  start: number;
  duration: number;
  delayed: boolean;
  isCritical: boolean;
  delayDays?: number;
  delayShift?: number;
}

interface MonteCarloBucket {
  date: string;
  prob: number;
  label: string;
}

export default function NexbuildCopilot() {
  const { theme, toggleTheme } = useTheme();
  const { openConsole } = useCpmConsole();
  const { openCopilot } = useCopilotModal();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const ganttTasks: GanttTask[] = [
    { id: "ACT-102", name: "Floor 3 Rebar Inspection", start: 2, duration: 4, delayed: false, isCritical: false },
    { id: "ACT-108", name: "Floor 3 Concrete Pour", start: 6, duration: 6, delayed: true, delayDays: 8, isCritical: true },
    { id: "ACT-114", name: "Floor 3 Stripping & Curing", start: 20, duration: 5, delayed: true, delayShift: 8, isCritical: true },
    { id: "ACT-120", name: "Floor 4 Rebar Installation", start: 25, duration: 8, delayed: true, delayShift: 8, isCritical: true },
  ];

  const monteCarloBuckets: MonteCarloBucket[] = [
    { date: "Oct 10", prob: 5, label: "P10 (Optimistic)" },
    { date: "Oct 14", prob: 25, label: "Baseline Target" },
    { date: "Oct 18", prob: 50, label: "P50 (Expected)" },
    { date: "Oct 22", prob: 85, label: "Current Delay Impact" },
    { date: "Oct 28", prob: 95, label: "P90 (Conservative Commitment)" },
  ];

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const node = exportRef.current;
      if (!node) return;

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(node, {
        backgroundColor: theme === "dark" ? "#0B0F17" : "#f8fafc",
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a3",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = canvas.width / canvas.height;
      let renderWidth = pageWidth;
      let renderHeight = renderWidth / imgRatio;
      if (renderHeight > pageHeight) {
        renderHeight = pageHeight;
        renderWidth = renderHeight * imgRatio;
      }
      const offsetX = (pageWidth - renderWidth) / 2;
      const offsetY = (pageHeight - renderHeight) / 2;

      pdf.addImage(imgData, "PNG", offsetX, offsetY, renderWidth, renderHeight);
      pdf.save(`nexbuild-${activeTab}-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (!introDone) {
    return <SplashScreen onDone={() => setIntroDone(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-blue-500/30">
      {/* TOP NAVBAR */}
      <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0E141F]/95 backdrop-blur px-4 lg:px-6 flex items-center gap-4 shrink-0 z-20">
        <Sidebar active={activeTab} onNavigate={setActiveTab} />
        <div className="relative flex-1 min-w-0 max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, tasks or documents..."
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-400 dark:focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => openConsole()}
            className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200 hover:dark:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:dark:border-slate-700 px-2.5 md:px-3 py-1 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
            title="View live CPM engine computation"
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
            </span>
            <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="hidden lg:inline font-mono text-xs whitespace-nowrap">
              Deterministic CPM & Stochastic Engine Active
            </span>
            <span className="lg:hidden font-mono text-xs whitespace-nowrap">CPM Engine</span>
          </button>

          <button
            type="button"
            onClick={() => openCopilot()}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 px-2.5 md:px-3 py-1 rounded-full text-sm font-semibold text-white transition-colors shrink-0 cursor-pointer"
            title="Open Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Copilot</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center space-x-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 hover:dark:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? "Preparing PDF..." : "Export PDF"}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

          <button className="hidden md:flex p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-200 hover:bg-slate-200/60 hover:dark:bg-slate-800/60 rounded-lg transition-colors">
            <CircleHelp className="w-4 h-4" />
          </button>

          <button className="hidden md:flex relative p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-200 hover:bg-slate-200/60 hover:dark:bg-slate-800/60 rounded-lg transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0E141F]" />
          </button>

          <Link href="/profile" className="flex items-center space-x-2 pl-1" title="My Profile">
            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 border border-slate-400 dark:border-slate-600 flex items-center justify-center text-sm font-semibold text-slate-800 dark:text-slate-200 hover:border-blue-500 transition-colors">
              JD
            </div>
          </Link>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden">
          <div ref={exportRef} className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0B0F17]">
            {/* TAB 1: DASHBOARD HOME */}
            {activeTab === "home" && <DashboardHome />}

            {/* TAB 2: GANTT CHART VIEW */}
            {activeTab === "gantt" && (
              <div className="flex-1 p-6 overflow-hidden flex flex-col max-w-[1440px] mx-auto w-full">
                <div className="flex justify-between items-center mb-4 bg-white dark:bg-[#111826] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Interactive Schedule & Weather Delay View
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Critical path tasks with projected schedule deviation</p>
                  </div>
                  <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <FileDown className="w-3.5 h-3.5" /> {isExportingPdf ? "Preparing..." : "Export Schedule as PDF"}
                  </button>
                </div>

                <div className="flex-1 bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-4">
                  <div className="space-y-4">
                    {ganttTasks.map((t) => (
                      <div key={t.id} className="border-b border-slate-200/60 dark:border-slate-800/60 pb-3 flex items-center justify-between text-sm">
                        <div className="w-64 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {t.id} - {t.name}
                        </div>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-900 h-6 rounded relative overflow-hidden flex items-center px-2">
                          <div
                            style={{ left: `${t.start * 3}%`, width: `${t.duration * 4}%` }}
                            className="absolute h-4 bg-blue-600 rounded text-[11px] text-white flex items-center justify-center font-mono"
                          >
                            {t.duration}d
                          </div>
                          {t.delayed && (
                            <div
                              style={{ left: `${(t.start + t.duration) * 3}%`, width: `${(t.delayDays || 8) * 3}%` }}
                              className="absolute h-4 bg-rose-600/90 border border-rose-400 rounded text-[11px] text-white flex items-center justify-center font-bold"
                            >
                              +{t.delayDays}d
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MONTE CARLO RISK SIMULATION VIEW */}
            {activeTab === "montecarlo" && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6 max-w-[1440px] mx-auto w-full">
                <div className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
                        <Dices className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Monte Carlo Schedule Risk Simulation (1,000 Runs)
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                        Probability distribution of project completion date based on historical weather and supply risk.
                      </p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" /> Re-run Simulation
                    </button>
                  </div>

                  <div className="space-y-3 pt-3">
                    {monteCarloBuckets.map((bucket, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm font-mono">
                          <span className="text-slate-700 dark:text-slate-300">
                            {bucket.label} — <strong className="text-blue-600 dark:text-blue-400">{bucket.date}</strong>
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">{bucket.prob}% Confidence</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 h-3.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                          <div
                            style={{ width: `${bucket.prob}%` }}
                            className={`h-full rounded-full transition-all ${
                              bucket.prob >= 85 ? "bg-gradient-to-r from-blue-500 to-rose-500" : "bg-gradient-to-r from-blue-600 to-emerald-400"
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 font-mono flex items-center justify-between">
                    <span>
                      P90 Completion Target (Contractual Safety): <strong className="text-blue-600 dark:text-blue-400">Oct 28, 2026</strong>
                    </span>
                    <span className="text-rose-600 dark:text-rose-400">Current Schedule Exposure: +14 Days Buffer Required</span>
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
