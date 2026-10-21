"use client";

import React, { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Sparkles, RefreshCw, Waypoints, Info } from "lucide-react";
import { computeScenarios, type ScenarioResult } from "@/lib/scenarios";
import { useCpmConsole } from "./CpmConsoleProvider";

const CHART_W = 640;
const CHART_H = 260;
const PAD = { top: 16, right: 16, bottom: 32, left: 56 };

export default function ScenarioExplorer() {
  const [regenToken, setRegenToken] = useState(0);
  const [selectedId, setSelectedId] = useState<string>("baseline");
  const { openConsole } = useCpmConsole();

  const scenarios = useMemo(() => computeScenarios(regenToken), [regenToken]);
  const selected = scenarios.find((s) => s.id === selectedId) ?? scenarios[0];

  const allPoints = scenarios.flatMap((s) => s.points);
  const xMin = Math.min(...allPoints.map((p) => p.x));
  const xMax = Math.max(...allPoints.map((p) => p.x));
  const yMin = Math.min(...allPoints.map((p) => p.y));
  const yMax = Math.max(...allPoints.map((p) => p.y));
  const xPad = Math.max(1, (xMax - xMin) * 0.15);
  const yPad = Math.max(1, (yMax - yMin) * 0.15);
  const xDomain: [number, number] = [xMin - xPad, xMax + xPad];
  const yDomain: [number, number] = [yMin - yPad, yMax + yPad];

  const plotW = CHART_W - PAD.left - PAD.right;
  const plotH = CHART_H - PAD.top - PAD.bottom;

  const sx = (v: number) => PAD.left + ((v - xDomain[0]) / (xDomain[1] - xDomain[0])) * plotW;
  const sy = (v: number) => PAD.top + plotH - ((v - yDomain[0]) / (yDomain[1] - yDomain[0])) * plotH;

  const xTicks = 5;
  const yTicks = 4;

  const fmtCost = (v: number) => `€${(v / 1000).toFixed(0)}K`;

  const analyse = (s: ScenarioResult) => {
    openConsole(s.tasks, `CPM Engine Console — ${s.title}`);
  };

  return (
    <section className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Scenario Explorer</h2>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {scenarios.length} scenarios · every point is a real run of the CPM engine
            </p>
          </div>
        </div>
        <button
          onClick={() => setRegenToken((v) => v + 1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Generate scenarios
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* SCENARIO LIST */}
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {scenarios.map((s) => {
            const active = s.id === selectedId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                  active
                    ? "bg-blue-500/5 border-blue-500"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{s.title}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 pl-[18px] leading-relaxed line-clamp-2">
                  {s.description}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 pl-[18px] font-mono">
                  {s.days}d · {fmtCost(s.cost)}
                </div>
              </button>
            );
          })}
        </div>

        {/* SCATTER PLOT */}
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-[260px] min-w-[480px]">
            <text x={PAD.left} y={12} fontSize={10} className="fill-slate-400 dark:fill-slate-600 font-semibold">
              TOTAL COST
            </text>
            <text x={CHART_W - PAD.right} y={CHART_H - 4} textAnchor="end" fontSize={10} className="fill-slate-400 dark:fill-slate-600 font-semibold">
              CALENDAR DAYS →
            </text>

            {Array.from({ length: yTicks + 1 }).map((_, i) => {
              const v = yDomain[0] + (i / yTicks) * (yDomain[1] - yDomain[0]);
              const y = sy(v);
              return (
                <g key={i}>
                  <line x1={PAD.left} y1={y} x2={CHART_W - PAD.right} y2={y} className="stroke-slate-100 dark:stroke-slate-800" strokeWidth={1} />
                  <text x={PAD.left - 8} y={y + 3} textAnchor="end" fontSize={9} className="fill-slate-400 dark:fill-slate-600">
                    {fmtCost(v)}
                  </text>
                </g>
              );
            })}
            {Array.from({ length: xTicks + 1 }).map((_, i) => {
              const v = xDomain[0] + (i / xTicks) * (xDomain[1] - xDomain[0]);
              const x = sx(v);
              return (
                <g key={i}>
                  <line x1={x} y1={PAD.top} x2={x} y2={CHART_H - PAD.bottom} className="stroke-slate-100 dark:stroke-slate-800" strokeWidth={1} />
                  <text x={x} y={CHART_H - PAD.bottom + 16} textAnchor="middle" fontSize={9} className="fill-slate-400 dark:fill-slate-600">
                    {Math.round(v)}d
                  </text>
                </g>
              );
            })}

            <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={CHART_H - PAD.bottom} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />
            <line x1={PAD.left} y1={CHART_H - PAD.bottom} x2={CHART_W - PAD.right} y2={CHART_H - PAD.bottom} className="stroke-slate-300 dark:stroke-slate-700" strokeWidth={1} />

            {scenarios.map((s) =>
              s.points.map((p, i) => {
                const active = s.id === selectedId;
                const r = p.recommended ? 7 : 4;
                if (!p.recommended) {
                  return (
                    <circle
                      key={`${s.id}-${i}`}
                      cx={sx(p.x)}
                      cy={sy(p.y)}
                      r={r}
                      fill={s.color}
                      fillOpacity={active ? 0.55 : 0.28}
                      className="transition-opacity cursor-pointer"
                      onClick={() => setSelectedId(s.id)}
                    />
                  );
                }
                return (
                  <Popover.Root key={`${s.id}-${i}`}>
                    <Popover.Trigger asChild>
                      <circle
                        cx={sx(p.x)}
                        cy={sy(p.y)}
                        r={r}
                        fill={s.color}
                        fillOpacity={active ? 1 : 0.85}
                        stroke="white"
                        strokeWidth={active ? 2.5 : 1.5}
                        className="cursor-pointer transition-all hover:brightness-110"
                        onClick={() => setSelectedId(s.id)}
                      />
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        side="top"
                        sideOffset={10}
                        className="nb-popover-pop z-50 w-64 bg-white dark:bg-[#0E141F] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-3.5"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{s.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed mb-2">{s.description}</p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5">
                            <div className="text-[9px] uppercase tracking-wide text-slate-400 dark:text-slate-600 font-semibold">Duration</div>
                            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{s.days}d</div>
                          </div>
                          <div className="bg-slate-50 dark:bg-[#0B0F17] border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5">
                            <div className="text-[9px] uppercase tracking-wide text-slate-400 dark:text-slate-600 font-semibold">Est. Cost</div>
                            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{fmtCost(s.cost)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => analyse(s)}
                          className="w-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                        >
                          <Waypoints className="w-3.5 h-3.5" /> Analyse Solution
                        </button>
                        <Popover.Arrow className="fill-white dark:fill-[#0E141F]" />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                );
              })
            )}
          </svg>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-600 mt-1 pl-1">
            <Info className="w-3 h-3" /> Click a scenario or a dot to inspect it — large dots are the engine&apos;s recommended run, small dots are nearby candidate solutions.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-500">
          Selected: <span className="font-semibold text-slate-700 dark:text-slate-300">{selected.title}</span> · Critical path {selected.cpm.criticalPath.join(" → ")}
        </div>
        <button
          onClick={() => analyse(selected)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Waypoints className="w-3.5 h-3.5" /> Open in CPM Engine Console
        </button>
      </div>
    </section>
  );
}
