"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { computeCPM } from "@/lib/cpm";
import { CPM_TASKS } from "@/lib/taskData";
import { CRITICAL_COLOR, ACTIVE_COLOR, NEUTRAL_COLOR, PinMarker, PendingMarker, LabelTag, Legend, ModeHint, type Pin3D } from "./Scene3DKit";

export type { Pin3D };

const W = 6;
const D = 4;
const FLOOR_H = 1;

interface Level {
  key: string;
  label: string;
  taskIds: string[];
}

const LEVELS: Level[] = [
  { key: "ground", label: "Ground — Site Mobilization & Permits", taskIds: ["T1"] },
  { key: "f2", label: "Floor 2", taskIds: [] },
  { key: "f3", label: "Floor 3 — Rebar, Concrete, Formwork", taskIds: ["T2", "T3", "T4"] },
  { key: "f4", label: "Floor 4 — Rebar & Concrete Pour", taskIds: ["T5", "T7"] },
];

function GableRoof({ color }: { color: string }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-W / 2 - 0.2, 0);
    shape.lineTo(0, 1.3);
    shape.lineTo(W / 2 + 0.2, 0);
    shape.lineTo(-W / 2 - 0.2, 0);
    return new THREE.ExtrudeGeometry(shape, { depth: D + 0.4, bevelEnabled: false });
  }, []);
  return (
    <mesh position={[0, LEVELS.length * FLOOR_H, -D / 2 - 0.2]} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function FloorSlab({
  index,
  color,
  label,
  placing,
  onPlace,
}: {
  index: number;
  color: string;
  label: string;
  placing: boolean;
  onPlace: (point: THREE.Vector3) => void;
}) {
  const y = index * FLOOR_H + FLOOR_H / 2;
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!placing) return;
    e.stopPropagation();
    onPlace(e.point);
  };
  return (
    <group>
      <mesh position={[0, y, 0]} castShadow receiveShadow onClick={handleClick}>
        <boxGeometry args={[W, FLOOR_H * 0.94, D]} />
        <meshStandardMaterial color={color} transparent opacity={0.88} />
      </mesh>
      <lineSegments position={[0, y, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(W, FLOOR_H * 0.94, D)]} />
        <lineBasicMaterial color="#1e293b" transparent opacity={0.35} />
      </lineSegments>
      <LabelTag position={[W / 2 + 0.3, y, 0]} text={label} />
    </group>
  );
}

function MepRiser({ color, placing, onPlace }: { color: string; placing: boolean; onPlace: (point: THREE.Vector3) => void }) {
  const h = LEVELS.length * FLOOR_H;
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!placing) return;
    e.stopPropagation();
    onPlace(e.point);
  };
  return (
    <mesh position={[W / 2 - 0.4, h / 2, D / 2 - 0.4]} castShadow receiveShadow onClick={handleClick}>
      <boxGeometry args={[0.6, h, 0.6]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Scene({
  placing,
  onPlace,
  pins,
  selectedTaskId,
  onSelectPin,
  pendingPoint,
}: {
  placing: boolean;
  onPlace: (point: THREE.Vector3) => void;
  pins: Pin3D[];
  selectedTaskId: string | null;
  onSelectPin: (taskId: string) => void;
  pendingPoint: [number, number, number] | null;
}) {
  const cpm = useMemo(() => computeCPM(CPM_TASKS), []);
  const isCritical = (id: string) => cpm.tasks.find((t) => t.id === id)?.isCritical ?? false;

  const levelColor = (level: Level) => {
    if (level.taskIds.length === 0) return NEUTRAL_COLOR;
    return level.taskIds.some(isCritical) ? CRITICAL_COLOR : ACTIVE_COLOR;
  };
  const mepCritical = isCritical("T6");

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[8, 10, 6]} intensity={1.1} castShadow />
      <directionalLight position={[-6, 4, -4]} intensity={0.3} />

      {LEVELS.map((level, i) => (
        <FloorSlab key={level.key} index={i} color={levelColor(level)} label={level.label} placing={placing} onPlace={onPlace} />
      ))}
      <GableRoof color="#475569" />
      <MepRiser color={mepCritical ? CRITICAL_COLOR : "#10b981"} placing={placing} onPlace={onPlace} />

      {pins.map((p) => {
        const task = CPM_TASKS.find((t) => t.id === p.taskId);
        return (
          <PinMarker
            key={p.id}
            pin={p}
            critical={isCritical(p.taskId)}
            active={selectedTaskId === p.taskId}
            label={task?.id ?? p.taskId}
            onSelect={() => onSelectPin(p.taskId)}
          />
        );
      })}
      {pendingPoint && <PendingMarker point={pendingPoint} />}

      <gridHelper args={[20, 20, "#64748b", "#334155"]} position={[0, -0.01, 0]} />
    </>
  );
}

export default function Building3D({
  pins = [],
  placing = false,
  selectedTaskId = null,
  pendingPoint = null,
  onPlace,
  onSelectPin,
}: {
  pins?: Pin3D[];
  placing?: boolean;
  selectedTaskId?: string | null;
  pendingPoint?: [number, number, number] | null;
  onPlace?: (point: THREE.Vector3) => void;
  onSelectPin?: (taskId: string) => void;
}) {
  return (
    <div className="relative w-full h-full">
      <Canvas shadows camera={{ position: [9, 7, 10], fov: 42 }}>
        <color attach="background" args={["#0f172a"]} />
        <Scene
          placing={placing}
          onPlace={onPlace ?? (() => {})}
          pins={pins}
          selectedTaskId={selectedTaskId}
          onSelectPin={onSelectPin ?? (() => {})}
          pendingPoint={pendingPoint}
        />
        <OrbitControls enableDamping dampingFactor={0.08} minDistance={5} maxDistance={24} target={[0, 2, 0]} />
      </Canvas>
      <Legend />
      <ModeHint placing={placing} />
    </div>
  );
}
