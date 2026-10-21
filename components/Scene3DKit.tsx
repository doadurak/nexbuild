"use client";

import React from "react";
import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";

export const CRITICAL_COLOR = "#f43f5e";
export const ACTIVE_COLOR = "#3b82f6";
export const NEUTRAL_COLOR = "#94a3b8";

export interface Pin3D {
  id: string;
  taskId: string;
  point: [number, number, number];
}

/** A placed, task-linked pin — colored by the real CPM critical-path status. */
export function PinMarker({
  pin,
  critical,
  active,
  label,
  onSelect,
}: {
  pin: Pin3D;
  critical: boolean;
  active: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <group position={pin.point}>
      <mesh
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect();
        }}
        scale={active ? 1.4 : 1}
      >
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial
          color={critical ? CRITICAL_COLOR : ACTIVE_COLOR}
          emissive={critical ? CRITICAL_COLOR : ACTIVE_COLOR}
          emissiveIntensity={0.4}
        />
      </mesh>
      <Html distanceFactor={9} occlude={false} position={[0, 0.25, 0]}>
        <div className="whitespace-nowrap text-[10px] font-bold bg-slate-900/90 text-white px-1.5 py-0.5 rounded shadow-sm pointer-events-none">
          {label}
        </div>
      </Html>
    </group>
  );
}

/** Ghost marker shown at a just-clicked point, before the user confirms which task it links to. */
export function PendingMarker({ point }: { point: [number, number, number] }) {
  return (
    <mesh position={point}>
      <sphereGeometry args={[0.16, 16, 16]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
    </mesh>
  );
}

/** Small text tag floating above a building/zone, labelling what it is. */
export function LabelTag({ position, text }: { position: [number, number, number]; text: string }) {
  return (
    <Html position={position} center={false} distanceFactor={9} occlude={false}>
      <div className="whitespace-nowrap text-[10px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 shadow-sm pointer-events-none">
        {text}
      </div>
    </Html>
  );
}

export function Legend() {
  return (
    <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[10px] font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ background: CRITICAL_COLOR }} /> Critical
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ background: ACTIVE_COLOR }} /> On track
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full" style={{ background: NEUTRAL_COLOR }} /> No linked task
      </span>
    </div>
  );
}

export function ModeHint({ placing }: { placing: boolean }) {
  return (
    <div className="absolute top-2 right-2 text-[10px] font-semibold text-slate-300 bg-slate-900/70 px-2 py-1 rounded-lg">
      {placing ? "Click a surface to drop a pin" : "Drag to orbit · scroll to zoom"}
    </div>
  );
}
