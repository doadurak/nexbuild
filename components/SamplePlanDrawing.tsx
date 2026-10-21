"use client";

import React from "react";

/**
 * Hand-built blueprint-style cross-section used as the default "sample plan"
 * so a brand-new user has something to click pins onto before uploading
 * their own drawing. Floor bands line up with the CPM_TASKS floor labels
 * (Floor 3 / Floor 4 / MEP riser) so sample pins land somewhere meaningful.
 */
export default function SamplePlanDrawing() {
  return (
    <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="0" y="0" width="800" height="500" fill="#0B2A4A" />
      {Array.from({ length: 20 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="500" stroke="#1C4571" strokeWidth="1" />
      ))}
      {Array.from({ length: 13 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 40} x2="800" y2={i * 40} stroke="#1C4571" strokeWidth="1" />
      ))}

      {/* building outline */}
      <rect x="120" y="60" width="440" height="380" fill="none" stroke="#9FD4FF" strokeWidth="2.5" />

      {/* floor slabs */}
      {[60, 150, 240, 330, 420].map((y) => (
        <line key={y} x1="120" y1={y} x2="560" y2={y} stroke="#9FD4FF" strokeWidth="2" />
      ))}

      {/* columns */}
      {[160, 260, 360, 460, 520].map((x) => (
        <line key={x} x1={x} y1="60" x2={x} y2="440" stroke="#5A8FC2" strokeWidth="1.5" strokeDasharray="2 3" />
      ))}

      {/* MEP riser shaft */}
      <rect x="470" y="60" width="50" height="380" fill="#133A62" stroke="#67C3F3" strokeWidth="2" />
      <text x="495" y="250" fill="#67C3F3" fontSize="11" fontWeight="700" textAnchor="middle" transform="rotate(90 495 250)">
        MEP RISER — SECTION B
      </text>

      {/* roof */}
      <polygon points="120,60 340,20 560,60" fill="none" stroke="#9FD4FF" strokeWidth="2" />

      {/* floor labels */}
      <text x="96" y="420" fill="#D6ECFF" fontSize="13" fontWeight="700" textAnchor="end">GROUND</text>
      <text x="96" y="330" fill="#D6ECFF" fontSize="13" fontWeight="700" textAnchor="end">FLOOR 2</text>
      <text x="96" y="240" fill="#D6ECFF" fontSize="13" fontWeight="700" textAnchor="end">FLOOR 3</text>
      <text x="96" y="150" fill="#D6ECFF" fontSize="13" fontWeight="700" textAnchor="end">FLOOR 4</text>
      <text x="96" y="75" fill="#D6ECFF" fontSize="13" fontWeight="700" textAnchor="end">ROOF</text>

      {/* dimension strip */}
      <line x1="120" y1="460" x2="560" y2="460" stroke="#5A8FC2" strokeWidth="1" />
      <text x="340" y="480" fill="#7FA8CE" fontSize="11" textAnchor="middle">SITE MOBILIZATION &amp; PERIMETER — 44.0m</text>

      <text x="130" y="36" fill="#67C3F3" fontSize="14" fontWeight="800">RIVERSIDE TOWER B — SECTION A-A</text>
      <text x="630" y="40" fill="#5A8FC2" fontSize="10">SCALE 1:100</text>
      <text x="630" y="56" fill="#5A8FC2" fontSize="10">DWG. NO. S-204</text>
    </svg>
  );
}
