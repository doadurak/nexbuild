"use client";

import React, { useMemo, useState } from "react";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Euro,
  Search,
  ArrowUpRight,
  CloudRain,
  SlidersHorizontal,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import DonutRing from "./DonutRing";
import ScenarioExplorer from "./ScenarioExplorer";

interface Kpi {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
}

const kpis: Kpi[] = [
  { label: "Active Construction Projects", value: "24", trend: "+3 vs last quarter", trendUp: true, icon: Building2 },
  { label: "Avg. Schedule Variance", value: "4.2%", trend: "-1.8% vs last month", trendUp: false, icon: TrendingDown },
  { label: "Total Portfolio Value", value: "€48.7M", trend: "+6.1% YoY", trendUp: true, icon: Euro },
];

const weatherRisk = [
  { month: "Apr", risk: 18 },
  { month: "May", risk: 22 },
  { month: "Jun", risk: 30 },
  { month: "Jul", risk: 26 },
  { month: "Aug", risk: 34 },
  { month: "Sep", risk: 52 },
  { month: "Oct", risk: 61 },
  { month: "Nov", risk: 40 },
];

interface SiteRow {
  id: string;
  initials: string;
  color: string;
  name: string;
  dateRange: string;
  status: "Active" | "At Risk" | "On Hold";
  budget: string;
  progress: number;
  rate: string;
}

const sites: SiteRow[] = [
  { id: "SITE-01", initials: "TB", color: "bg-blue-500", name: "Tower B — Riverside Complex", dateRange: "Mar 10 2025 · 14 months", status: "At Risk", budget: "€12.4M", progress: 62, rate: "+5.03%" },
  { id: "SITE-02", initials: "MB", color: "bg-indigo-500", name: "Meridian Business Park — Block C", dateRange: "Jun 1 2025 · 20 months", status: "Active", budget: "€18.1M", progress: 38, rate: "+0.65%" },
  { id: "SITE-03", initials: "SR", color: "bg-amber-500", name: "Seaside Residences — Phase 2", dateRange: "Jan 20 2025 · 18 months", status: "On Hold", budget: "€9.6M", progress: 21, rate: "-2.87%" },
  { id: "SITE-04", initials: "NL", color: "bg-emerald-500", name: "Northgate Logistics Hub", dateRange: "Sep 20 2026 · 11 months", status: "Active", budget: "€8.6M", progress: 8, rate: "+1.42%" },
];

const statusStyles: Record<SiteRow["status"], string> = {
  Active: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
  "At Risk": "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60",
  "On Hold": "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
};

export default function DashboardHome() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"budget" | "progress">("budget");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = sites.filter((s) => s.name.toLowerCase().includes(q));
    return [...rows].sort((a, b) =>
      sortBy === "progress" ? b.progress - a.progress : parseFloat(b.budget.replace(/[^\d.]/g, "")) - parseFloat(a.budget.replace(/[^\d.]/g, ""))
    );
  }, [query, sortBy]);

  // simple smoothed area chart path from the weatherRisk series
  const chart = useMemo(() => {
    const w = 560;
    const h = 160;
    const max = 70;
    const step = w / (weatherRisk.length - 1);
    const points = weatherRisk.map((d, i) => [i * step, h - (d.risk / max) * h] as const);
    const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `${line} L${w},${h} L0,${h} Z`;
    return { w, h, line, area, points };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
    <div className="max-w-[1440px] mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Construction Schedule Assistant</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Real-time visibility across your active portfolio — schedule, budget and weather risk in one place.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          const TrendIcon = k.trendUp ? TrendingUp : TrendingDown;
          return (
            <div key={k.label} className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wide">{k.label}</div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">{k.value}</div>
              <div className="flex items-center gap-1 mt-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendIcon className="w-3.5 h-3.5" />
                {k.trend}
              </div>
            </div>
          );
        })}
      </div>

      {/* SCENARIO EXPLORER */}
      <ScenarioExplorer />

      {/* CONSTRUCTION PROJECTS + SEASONAL DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">Construction Projects</h2>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 mb-4">Portfolio-wide, weighted by active budget</p>
          <div className="flex items-center justify-around">
            <DonutRing value={55} label="On Schedule" color="#6366f1" />
            <DonutRing value={78} label="On Budget" color="#3b82f6" />
            <DonutRing value={6} label="Overrun Risk" color="#8b5cf6" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Seasonal Details
            </h2>
            <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 hover:underline">
              View More <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">Predicted weather-driven delay risk, next 8 months</p>
          <svg viewBox={`0 0 ${chart.w} ${chart.h + 24}`} className="w-full h-36">
            <defs>
              <linearGradient id="dh-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={chart.area} fill="url(#dh-area)" />
            <path d={chart.line} fill="none" stroke="#3b82f6" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
            {chart.points.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={3} fill="#3b82f6" />
            ))}
            {weatherRisk.map((d, i) => (
              <text
                key={d.month}
                x={chart.points[i][0]}
                y={chart.h + 18}
                textAnchor="middle"
                fontSize={11}
                className="fill-slate-500 dark:fill-slate-500"
              >
                {d.month}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* PROJECT TABLE */}
      <div className="bg-white dark:bg-[#111826] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Project by</h2>
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setSortBy("budget")}
                className={`px-2.5 py-1 rounded-md transition-colors ${sortBy === "budget" ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400"}`}
              >
                Budget
              </button>
              <button
                onClick={() => setSortBy("progress")}
                className={`px-2.5 py-1 rounded-md transition-colors ${sortBy === "progress" ? "bg-blue-600 text-white" : "text-slate-500 dark:text-slate-400"}`}
              >
                Progress
              </button>
            </div>
          </div>
          <button className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Settings
          </button>
        </div>

        <div className="relative mb-4 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wide">
                <th className="font-semibold pb-2 pr-3">Name</th>
                <th className="font-semibold pb-2 pr-3">Status</th>
                <th className="font-semibold pb-2 pr-3">Budget</th>
                <th className="font-semibold pb-2 pr-3">Progress</th>
                <th className="font-semibold pb-2 pr-3">Rate</th>
                <th className="font-semibold pb-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${s.color} flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-white dark:ring-[#111826] shadow-sm`}>
                        {s.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{s.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 truncate">{s.dateRange}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${statusStyles[s.status]}`}>{s.status}</span>
                  </td>
                  <td className="py-3 pr-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{s.budget}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2 w-28">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${s.progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 w-8 text-right">{s.progress}%</span>
                    </div>
                  </td>
                  <td className={`py-3 pr-3 font-semibold whitespace-nowrap ${s.rate.startsWith("-") ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {s.rate}
                  </td>
                  <td className="py-3">
                    <button className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No projects match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
}
