"use client";

import React from "react";

interface WindowGridProps {
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
}

/** Small square "windows", punched out in the page background color so the
 * silhouette in front of them reads clearly as a building, not a bar. */
function WindowGrid({ x, y, w, h, cols, rows }: WindowGridProps) {
  const cellW = w / cols;
  const cellH = h / rows;
  const size = Math.min(cellW, cellH) * 0.42;
  const squares: React.ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x + cellW * (c + 0.5);
      const cy = y + cellH * (r + 0.5);
      squares.push(
        <rect
          key={`${r}-${c}`}
          x={cx - size / 2}
          y={cy - size / 2}
          width={size}
          height={size}
          className="fill-white dark:fill-[#0B0F17]"
        />
      );
    }
  }
  return <>{squares}</>;
}

const buildings = [
  { key: "a", delay: 1050, windows: { x: 20, y: 88, w: 52, h: 96, cols: 2, rows: 4 } as WindowGridProps, shape: <rect x={20} y={88} width={52} height={102} /> },
  { key: "b", delay: 1160, windows: { x: 46, y: 118, w: 54, h: 66, cols: 2, rows: 3 } as WindowGridProps, shape: <rect x={46} y={118} width={54} height={72} /> },
  { key: "d", delay: 1220, windows: { x: 158, y: 78, w: 52, h: 106, cols: 2, rows: 5 } as WindowGridProps, shape: <rect x={158} y={78} width={52} height={112} /> },
  {
    key: "hero",
    delay: 1350,
    shape: <polygon points="104,190 104,66 158,102 158,190" />,
    stripes: { x1: 108, x2: 154, yTop: 112, yBottom: 186, count: 6 },
  },
  { key: "e", delay: 1480, windows: { x: 196, y: 122, w: 58, h: 58, cols: 2, rows: 2 } as WindowGridProps, shape: <rect x={196} y={122} width={58} height={68} /> },
] as const;

export default function SplashSkyline() {
  return (
    <svg
      viewBox="0 0 320 200"
      className="w-[340px] md:w-[460px] h-auto text-slate-800 dark:text-white"
      aria-hidden
    >
      {buildings.map((b) => (
        <g key={b.key} className="nb-building" style={{ animationDelay: `${b.delay}ms` }}>
          <g fill="currentColor">{b.shape}</g>
          {"windows" in b && b.windows && <WindowGrid {...b.windows} />}
          {"stripes" in b && b.stripes && (
            <g stroke="currentColor" strokeOpacity={0} className="fill-white dark:fill-[#0B0F17]">
              {Array.from({ length: b.stripes.count }).map((_, i) => {
                const t = i / (b.stripes.count - 1);
                const y = b.stripes.yTop + t * (b.stripes.yBottom - b.stripes.yTop);
                return <rect key={i} x={b.stripes.x1} y={y - 1.4} width={b.stripes.x2 - b.stripes.x1} height={2.8} />;
              })}
            </g>
          )}
        </g>
      ))}
      <rect x={8} y={188} width={304} height={3} className="fill-slate-800 dark:fill-white" />
    </svg>
  );
}
