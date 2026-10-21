"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Dices,
  FileText,
  HardHat,
  MessageSquare,
  Users,
  UserCircle,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  type LucideIcon,
} from "lucide-react";

export type SidebarKey = "home" | "gantt" | "montecarlo" | "profile" | "construction";

interface SidebarProps {
  active: SidebarKey;
  onNavigate?: (key: Exclude<SidebarKey, "profile" | "construction">) => void;
}

const navItems: { key: SidebarKey; label: string; icon: LucideIcon; href?: string; badge?: string }[] = [
  { key: "home", label: "Dashboard", icon: LayoutDashboard },
  { key: "gantt", label: "Gantt Chart", icon: BarChart3 },
  { key: "montecarlo", label: "Monte Carlo", icon: Dices },
  { key: "construction", label: "Construction", icon: HardHat, href: "/construction", badge: "NEW" },
  { key: "profile", label: "Profile", icon: UserCircle, href: "/profile" },
];

const stubItems: { label: string; icon: LucideIcon; badge?: string; chevron?: boolean }[] = [
  { label: "Documents", icon: FileText },
  { label: "Comments", icon: MessageSquare, chevron: true },
  { label: "Community", icon: Users, chevron: true },
  { label: "Settings", icon: Settings },
];

/**
 * Logo-triggered dropdown nav, like a hamburger menu — hover (or click) the
 * wordmark and the full navigation drops down below it. Replaces a
 * persistent side rail so every page gets the full viewport width.
 */
export default function Sidebar({ active, onNavigate }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="relative shrink-0" onMouseEnter={show} onMouseLeave={hide}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 pl-1 pr-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
      >
        <span className="font-black text-lg tracking-tight text-slate-950 dark:text-white whitespace-nowrap">
          NexBuild<span className="text-indigo-600 dark:text-indigo-500">.ai</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="nb-popover-pop absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-[#0E141F] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          <nav className="py-2 px-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              const className = `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
              }`;

              if (item.href) {
                return (
                  <Link key={item.key} href={item.href} className={className} onClick={() => setOpen(false)}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && !isActive && (
                      <span className="text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full leading-none shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              }
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onNavigate?.(item.key as Exclude<SidebarKey, "profile" | "construction">);
                    setOpen(false);
                  }}
                  className={className}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
              {stubItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    title="Coming soon"
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-slate-400 dark:text-slate-600 cursor-not-allowed select-none"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full leading-none shrink-0">
                        {item.badge}
                      </span>
                    )}
                    {item.chevron && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </nav>

          {/* workspace switcher */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-2">
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
              <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                M
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">Meridian Group</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 truncate">Workspace</div>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
