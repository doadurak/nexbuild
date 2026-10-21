"use client";

import React, { useMemo } from "react";
import type { CpmTaskResult } from "@/lib/cpm";

const X_SCALE = 34;
const X_MARGIN = 50;
const LANE_HEIGHT = 92;
const Y_MARGIN = 40;
const NODE_R = 20;

interface LaneAssignment {
  task: CpmTaskResult;
  lane: number;
  x: number;
  y: number;
}

/** Packs tasks into vertical lanes so nodes with overlapping ES-EF windows
 * don't collide, purely from the already-computed CPM result (no hardcoded
 * positions). */
function assignLanes(tasks: CpmTaskResult[]): LaneAssignment[] {
  const sorted = [...tasks].sort((a, b) => a.es - b.es || a.id.localeCompare(b.id));
  const laneFreeAt: number[] = [];
  const placed: LaneAssignment[] = [];

  for (const task of sorted) {
    let lane = laneFreeAt.findIndex((freeAt) => freeAt <= task.es);
    if (lane === -1) {
      lane = laneFreeAt.length;
      laneFreeAt.push(0);
    }
    laneFreeAt[lane] = task.ef;
    placed.push({
      task,
      lane,
      x: X_MARGIN + task.es * X_SCALE,
      y: Y_MARGIN + lane * LANE_HEIGHT,
    });
  }
  return placed;
}

export default function CpmNetworkDiagram({ tasks }: { tasks: CpmTaskResult[] }) {
  const positions = useMemo(() => assignLanes(tasks), [tasks]);
  const byId = useMemo(() => new Map(positions.map((p) => [p.task.id, p])), [positions]);

  const maxX = Math.max(...positions.map((p) => p.x)) + X_MARGIN + NODE_R;
  const maxY = Math.max(...positions.map((p) => p.y)) + Y_MARGIN + NODE_R;

  return (
    <svg
      viewBox={`0 0 ${maxX} ${maxY}`}
      width="100%"
      style={{ minWidth: maxX }}
      className="text-slate-400 dark:text-slate-600"
    >
      <defs>
        <marker id="cpm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
        </marker>
        <marker id="cpm-arrow-critical" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="#f43f5e" />
        </marker>
      </defs>

      {/* edges */}
      {positions.map(({ task, x, y }) =>
        task.dependsOn.map((depId) => {
          const from = byId.get(depId);
          if (!from) return null;
          const critical = task.isCritical && from.task.isCritical;
          const x1 = from.x + NODE_R;
          const y1 = from.y;
          const x2 = x - NODE_R - 6;
          const y2 = y;
          const midX = (x1 + x2) / 2;
          return (
            <path
              key={`${depId}-${task.id}`}
              d={`M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`}
              fill="none"
              stroke={critical ? "#f43f5e" : "currentColor"}
              strokeWidth={critical ? 2 : 1.5}
              strokeOpacity={critical ? 0.9 : 0.5}
              markerEnd={critical ? "url(#cpm-arrow-critical)" : "url(#cpm-arrow)"}
            />
          );
        })
      )}

      {/* nodes */}
      {positions.map(({ task, x, y }) => (
        <g key={task.id}>
          <circle
            cx={x}
            cy={y}
            r={NODE_R}
            fill={task.isCritical ? "#f43f5e" : "#3b82f6"}
            fillOpacity={0.15}
            stroke={task.isCritical ? "#f43f5e" : "#3b82f6"}
            strokeWidth={2}
          />
          <text x={x} y={y + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill={task.isCritical ? "#f43f5e" : "#3b82f6"}>
            {task.id}
          </text>

          <text x={x} y={y + NODE_R + 16} textAnchor="middle" fontSize={10} fontWeight={600} fill="currentColor" className="fill-slate-700 dark:fill-slate-300">
            {task.duration}d · ES {task.es}
          </text>
          <text
            x={x}
            y={y + NODE_R + 30}
            textAnchor="middle"
            fontSize={9.5}
            fontWeight={600}
            fill={task.isCritical ? "#f43f5e" : "#10b981"}
          >
            {task.isCritical ? "critical · 0d float" : `${task.float}d float`}
          </text>
        </g>
      ))}
    </svg>
  );
}
