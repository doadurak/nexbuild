"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, RefreshCw, Cpu, GitBranch, TableProperties, Waypoints } from "lucide-react";
import { computeCPM, type CpmResult, type CpmTaskInput } from "@/lib/cpm";
import { CPM_TASKS } from "@/lib/taskData";
import CpmNetworkDiagram from "./CpmNetworkDiagram";

interface CpmEngineConsoleProps {
  open: boolean;
  onClose: () => void;
  tasks?: CpmTaskInput[];
  title?: string;
}

export default function CpmEngineConsole({ open, onClose, tasks, title }: CpmEngineConsoleProps) {
  const [result, setResult] = useState<CpmResult | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [resultView, setResultView] = useState<"table" | "diagram">("diagram");
  const logEndRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const activeTasks = tasks ?? CPM_TASKS;

  const runEngine = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsRunning(true);
    setLog([]);
    setResult(null);

    const cpm = computeCPM(activeTasks);

    const lines: string[] = [
      `> Loading task graph — ${cpm.tasks.length} nodes, ${cpm.tasks.reduce((n, t) => n + t.dependsOn.length, 0)} edges`,
      `> Forward pass: computing Early Start / Early Finish...`,
      ...cpm.tasks.map((t) => `  ${t.id.padEnd(3)} ${t.name.padEnd(36)} ES=${t.es}d  EF=${t.ef}d`),
      `> Backward pass: computing Late Start / Late Finish...`,
      ...[...cpm.tasks].reverse().map((t) => `  ${t.id.padEnd(3)} ${t.name.padEnd(36)} LS=${t.ls}d  LF=${t.lf}d`),
      `> Calculating total float and critical path...`,
      `> Critical path: ${cpm.criticalPath.join(" → ")}`,
      `> Project duration: ${cpm.projectDuration} days`,
      `> Engine cycle complete in ${cpm.computeMs < 0.01 ? "<0.01" : cpm.computeMs.toFixed(2)}ms`,
    ];

    lines.forEach((line, i) => {
      const t = setTimeout(() => {
        setLog((prev) => [...prev, line]);
        if (i === lines.length - 1) {
          setResult(cpm);
          setIsRunning(false);
        }
      }, i * 70);
      timeoutsRef.current.push(t);
    });
  };

  useEffect(() => {
    if (!open) return;
    const kickoff = setTimeout(runEngine, 0);
    return () => {
      clearTimeout(kickoff);
      timeoutsRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, tasks]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0E141F] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">{title ?? "CPM Engine Console"}</h2>
            <span className="text-[11px] font-mono bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
              live computation
            </span>
          </div>
          <button onClick={onClose} className="text-slate-500 dark:text-slate-500 hover:text-slate-700 hover:dark:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* LIVE LOG */}
          <div className="border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto bg-slate-50 dark:bg-[#0B0F17] font-mono text-xs leading-relaxed max-h-[50vh] md:max-h-none">
            {log.map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith(">")
                    ? "text-blue-600 dark:text-blue-400 font-semibold mt-2 first:mt-0"
                    : "text-slate-600 dark:text-slate-400 whitespace-pre"
                }
              >
                {line}
              </div>
            ))}
            {isRunning && <div className="text-slate-400 dark:text-slate-600 mt-2 animate-pulse">▌</div>}
            <div ref={logEndRef} />
          </div>

          {/* RESULTS TABLE */}
          <div className="p-4 overflow-y-auto max-h-[50vh] md:max-h-none">
            {!result ? (
              <div className="text-sm text-slate-500 dark:text-slate-500 font-mono">Waiting for engine output...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-500 font-semibold">Project Duration</div>
                    <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{result.projectDuration}d</div>
                  </div>
                  <div className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                    <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-500 font-semibold">Critical Tasks</div>
                    <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                      {result.criticalPath.length}/{result.tasks.length}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300 flex-wrap">
                    <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    {result.criticalPath.map((id, i) => (
                      <React.Fragment key={id}>
                        <span className="font-mono bg-blue-500/15 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded">{id}</span>
                        {i < result.criticalPath.length - 1 && <span className="text-slate-400 dark:text-slate-600">→</span>}
                      </React.Fragment>
                    ))}
                  </div>

                  <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
                    <button
                      onClick={() => setResultView("diagram")}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        resultView === "diagram" ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <Waypoints className="w-3 h-3" /> Diagram
                    </button>
                    <button
                      onClick={() => setResultView("table")}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        resultView === "table" ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <TableProperties className="w-3 h-3" /> Table
                    </button>
                  </div>
                </div>

                {resultView === "diagram" ? (
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 overflow-x-auto">
                    <CpmNetworkDiagram tasks={result.tasks} />
                  </div>
                ) : (
                  <table className="w-full text-xs font-mono border-separate border-spacing-y-1">
                    <thead>
                      <tr className="text-slate-500 dark:text-slate-500 text-left uppercase tracking-wider text-[10px]">
                        <th className="font-semibold pb-1">Task</th>
                        <th className="font-semibold pb-1 text-right">ES</th>
                        <th className="font-semibold pb-1 text-right">EF</th>
                        <th className="font-semibold pb-1 text-right">LS</th>
                        <th className="font-semibold pb-1 text-right">LF</th>
                        <th className="font-semibold pb-1 text-right">Float</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.tasks.map((t) => (
                        <tr
                          key={t.id}
                          className={`${t.isCritical ? "bg-rose-50 dark:bg-rose-950/20" : "bg-slate-100/50 dark:bg-slate-900/50"} rounded`}
                        >
                          <td className="py-1.5 pl-2 rounded-l text-slate-800 dark:text-slate-200 truncate max-w-[140px]" title={t.name}>
                            {t.id} <span className="text-slate-500 dark:text-slate-500">· {t.name}</span>
                          </td>
                          <td className="text-right text-slate-700 dark:text-slate-300">{t.es}</td>
                          <td className="text-right text-slate-700 dark:text-slate-300">{t.ef}</td>
                          <td className="text-right text-slate-700 dark:text-slate-300">{t.ls}</td>
                          <td className="text-right text-slate-700 dark:text-slate-300">{t.lf}</td>
                          <td className={`text-right pr-2 rounded-r font-semibold ${t.isCritical ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                            {t.float}d
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#0E141F]">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Forward/backward pass computed client-side from task durations and dependencies.
          </p>
          <button
            onClick={runEngine}
            disabled={isRunning}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            Re-run Engine
          </button>
        </div>
      </div>
    </div>
  );
}
