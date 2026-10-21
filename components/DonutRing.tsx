"use client";

import React from "react";

interface DonutRingProps {
  value: number;
  label: string;
  color: string;
  trackClassName?: string;
  size?: number;
}

export default function DonutRing({ value, label, color, trackClassName = "text-slate-200 dark:text-slate-800", size = 88 }: DonutRingProps) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" className={trackClassName} stroke="currentColor" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text
          x={size / 2}
          y={size / 2}
          fill={color}
          fontSize={size * 0.22}
          fontWeight={800}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
        >
          {value}%
        </text>
      </svg>
      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-center">{label}</span>
    </div>
  );
}
