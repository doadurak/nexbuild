"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { computeCPM } from "@/lib/cpm";
import { RESORT_TASKS } from "@/lib/projects";
import { CRITICAL_COLOR, ACTIVE_COLOR, NEUTRAL_COLOR, PinMarker, PendingMarker, LabelTag, Legend, ModeHint, type Pin3D } from "./Scene3DKit";

export type { Pin3D };

function HipRoof({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  return (
    <mesh scale={[w, 1, d]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[0.72, h, 4]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Clickable({
  children,
  placing,
  onPlace,
}: {
  children: React.ReactNode;
  placing: boolean;
  onPlace: (point: THREE.Vector3) => void;
}) {
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!placing) return;
    e.stopPropagation();
    onPlace(e.point);
  };
  return <group onClick={handleClick}>{children}</group>;
}

function Clubhouse({ color, placing, onPlace }: { color: string; placing: boolean; onPlace: (p: THREE.Vector3) => void }) {
  return (
    <Clickable placing={placing} onPlace={onPlace}>
      <group position={[0, 0, 2.2]}>
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 2, 3]} />
          <meshStandardMaterial color={color} transparent opacity={0.9} />
        </mesh>
        <lineSegments position={[0, 1, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(4, 2, 3)]} />
          <lineBasicMaterial color="#1e293b" transparent opacity={0.3} />
        </lineSegments>
        <HipRoof w={4.3} d={3.3} h={1.1} color="#8b5e34" />
        <LabelTag position={[2.4, 1.6, 0]} text="Central Clubhouse" />
      </group>
    </Clickable>
  );
}

function Villa({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.1, 1.4]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <lineSegments position={[0, 0.55, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.4, 1.1, 1.4)]} />
        <lineBasicMaterial color="#1e293b" transparent opacity={0.3} />
      </lineSegments>
      <group position={[0, 1.1, 0]}>
        <HipRoof w={1.6} d={1.6} h={0.65} color="#a3663f" />
      </group>
    </group>
  );
}

const VILLA_POSITIONS: [number, number, number][] = [
  [-3.6, 0, -1.6],
  [-3.6, 0, -3.4],
  [-1.6, 0, -4.4],
  [0.6, 0, -4.4],
  [2.8, 0, -3.6],
  [4.2, 0, -1.8],
];

function PalmTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 1.2, 6]} />
        <meshStandardMaterial color="#6b4a2f" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.25, 1.25, Math.sin((i / 5) * Math.PI * 2) * 0.25]} rotation={[0.9, 0, (i / 5) * Math.PI * 2]} castShadow>
          <coneGeometry args={[0.12, 0.65, 4]} />
          <meshStandardMaterial color="#4d7c3f" />
        </mesh>
      ))}
    </group>
  );
}

const PALM_POSITIONS: [number, number, number][] = [
  [-1.8, 0, -0.4],
  [1.9, 0, -0.5],
  [-4.6, 0, 0.6],
  [5, 0, 0.4],
  [0, 0, -5.4],
];

function Pool({ color, placing, onPlace }: { color: string; placing: boolean; onPlace: (p: THREE.Vector3) => void }) {
  return (
    <Clickable placing={placing} onPlace={onPlace}>
      <group position={[0.6, 0, -1.6]}>
        <mesh position={[0, 0.015, 0]} receiveShadow>
          <boxGeometry args={[4.4, 0.03, 3]} />
          <meshStandardMaterial color="#d6c9a8" />
        </mesh>
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[3.2, 0.08, 1.8]} />
          <meshStandardMaterial color={color} transparent opacity={0.75} metalness={0.2} roughness={0.15} />
        </mesh>
        <lineSegments position={[0, 0.08, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(3.2, 0.01, 1.8)]} />
          <lineBasicMaterial color="#0c4a6e" />
        </lineSegments>
        <LabelTag position={[1.8, 0.3, 0]} text="Swimming Pool" />
      </group>
    </Clickable>
  );
}

function Pathways({ color, placing, onPlace }: { color: string; placing: boolean; onPlace: (p: THREE.Vector3) => void }) {
  const segments: { pos: [number, number, number]; size: [number, number]; rot?: number }[] = [
    { pos: [-1.2, 0, -0.2], size: [2.6, 0.5], rot: 0.5 },
    { pos: [2.2, 0, -0.9], size: [2.2, 0.5], rot: -0.6 },
    { pos: [-0.3, 0, -3.4], size: [4.2, 0.5], rot: 1.45 },
  ];
  return (
    <Clickable placing={placing} onPlace={onPlace}>
      <group>
        {segments.map((s, i) => (
          <mesh key={i} position={[s.pos[0], 0.015, s.pos[2]]} rotation={[-Math.PI / 2, 0, s.rot ?? 0]} receiveShadow>
            <planeGeometry args={s.size} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
      </group>
    </Clickable>
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
  const cpm = useMemo(() => computeCPM(RESORT_TASKS), []);
  const isCritical = (id: string) => cpm.tasks.find((t) => t.id === id)?.isCritical ?? false;
  const colorFor = (taskId: string) => (isCritical(taskId) ? CRITICAL_COLOR : ACTIVE_COLOR);
  const villaColor = colorFor("R4");

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[8, 10, 6]} intensity={1.15} castShadow />
      <directionalLight position={[-6, 4, -4]} intensity={0.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#86a66b" />
      </mesh>

      <Clubhouse color={colorFor("R5")} placing={placing} onPlace={onPlace} />
      {VILLA_POSITIONS.map((p, i) => (
        <Clickable key={i} placing={placing} onPlace={onPlace}>
          <Villa position={p} color={villaColor} />
        </Clickable>
      ))}
      <Pool color={colorFor("R6")} placing={placing} onPlace={onPlace} />
      <Pathways color={isCritical("R7") ? CRITICAL_COLOR : NEUTRAL_COLOR} placing={placing} onPlace={onPlace} />

      {PALM_POSITIONS.map((p, i) => (
        <PalmTree key={i} position={p} />
      ))}

      {pins.map((p) => {
        const task = RESORT_TASKS.find((t) => t.id === p.taskId);
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

      <gridHelper args={[24, 24, "#5f7a4c", "#45603a"]} position={[0, -0.01, 0]} />
    </>
  );
}

export default function ResortVillage3D({
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
      <Canvas shadows camera={{ position: [11, 8, 12], fov: 42 }}>
        <color attach="background" args={["#0b1324"]} />
        <Scene
          placing={placing}
          onPlace={onPlace ?? (() => {})}
          pins={pins}
          selectedTaskId={selectedTaskId}
          onSelectPin={onSelectPin ?? (() => {})}
          pendingPoint={pendingPoint}
        />
        <OrbitControls enableDamping dampingFactor={0.08} minDistance={6} maxDistance={30} target={[0, 1, -1]} />
      </Canvas>
      <Legend />
      <ModeHint placing={placing} />
    </div>
  );
}
