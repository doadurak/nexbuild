"use client";

import React, { createContext, useContext, useMemo } from "react";
import * as THREE from "three";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { computeCPM } from "@/lib/cpm";
import { PLAZA_TASKS } from "@/lib/projects";
import { CRITICAL_COLOR, ACTIVE_COLOR, NEUTRAL_COLOR, PinMarker, PendingMarker, LabelTag, Legend, ModeHint, type Pin3D } from "./Scene3DKit";

export type { Pin3D };

const HideChromeContext = createContext(false);

function SceneLabel(props: { position: [number, number, number]; text: string }) {
  const hideChrome = useContext(HideChromeContext);
  if (hideChrome) return null;
  return <LabelTag {...props} />;
}

const PODIUM_W = 7;
const PODIUM_D = 5.5;
const PODIUM_H = 1.6;
const TOWER_W = 4;
const TOWER_D = 4;
const TOWER_H = 9;

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

/** Thin mullion grid drawn on the tower faces to read as a glazed curtain wall. */
function CurtainWallGrid({ w, h, d }: { w: number; h: number; d: number }) {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const floors = Math.round(h / 0.75);
    const cols = Math.round(w / 0.8);
    const halfW = w / 2;
    const halfD = d / 2;
    for (let i = 0; i <= floors; i++) {
      const y = (i / floors) * h;
      positions.push(-halfW, y, halfD, halfW, y, halfD);
      positions.push(-halfW, y, -halfD, halfW, y, -halfD);
    }
    for (let i = 0; i <= cols; i++) {
      const x = -halfW + (i / cols) * w;
      positions.push(x, 0, halfD, x, h, halfD);
      positions.push(x, 0, -halfD, x, h, -halfD);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [w, h, d]);
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#e0f2fe" transparent opacity={0.35} />
    </lineSegments>
  );
}

function Podium({ color, placing, onPlace }: { color: string; placing: boolean; onPlace: (p: THREE.Vector3) => void }) {
  return (
    <Clickable placing={placing} onPlace={onPlace}>
      <mesh position={[0, PODIUM_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[PODIUM_W, PODIUM_H, PODIUM_D]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <lineSegments position={[0, PODIUM_H / 2, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(PODIUM_W, PODIUM_H, PODIUM_D)]} />
        <lineBasicMaterial color="#1e293b" transparent opacity={0.3} />
      </lineSegments>
      <SceneLabel position={[PODIUM_W / 2 + 0.3, PODIUM_H / 2, 0]} text="Podium Structure" />
    </Clickable>
  );
}

function Tower({ color, placing, onPlace }: { color: string; placing: boolean; onPlace: (p: THREE.Vector3) => void }) {
  return (
    <Clickable placing={placing} onPlace={onPlace}>
      <group position={[0, PODIUM_H, 0]}>
        <mesh position={[0, TOWER_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[TOWER_W, TOWER_H, TOWER_D]} />
          <meshStandardMaterial color={color} transparent opacity={0.55} metalness={0.3} roughness={0.2} />
        </mesh>
        <CurtainWallGrid w={TOWER_W} h={TOWER_H} d={TOWER_D} />
        <SceneLabel position={[TOWER_W / 2 + 0.3, TOWER_H - 0.5, 0]} text="Tower Superstructure" />
      </group>
    </Clickable>
  );
}

function EntranceCanopy({ color, placing, onPlace }: { color: string; placing: boolean; onPlace: (p: THREE.Vector3) => void }) {
  return (
    <Clickable placing={placing} onPlace={onPlace}>
      <group position={[0, PODIUM_H + 0.05, PODIUM_D / 2 + 0.9]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.08, 1.8]} />
          <meshStandardMaterial color={color} transparent opacity={0.5} metalness={0.4} roughness={0.1} />
        </mesh>
        {[-1.5, 1.5].map((x) => (
          <mesh key={x} position={[x, -0.9, 0.8]}>
            <cylinderGeometry args={[0.06, 0.06, 1.8, 8]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        ))}
        <SceneLabel position={[1.9, 0.2, 0]} text="Curtain Wall Glazing" />
      </group>
    </Clickable>
  );
}

function RooftopPlant({ color, placing, onPlace }: { color: string; placing: boolean; onPlace: (p: THREE.Vector3) => void }) {
  return (
    <Clickable placing={placing} onPlace={onPlace}>
      <group position={[0, PODIUM_H + TOWER_H + 0.35, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.7, 2.2]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <SceneLabel position={[1.4, 0.35, 0]} text="MEP Fit-out" />
      </group>
    </Clickable>
  );
}

function FormalTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.6, 6]} />
        <meshStandardMaterial color="#5c4631" />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color="#3f7a4d" />
      </mesh>
    </group>
  );
}

const TREE_POSITIONS: [number, number, number][] = [
  [-3.2, 0, 4],
  [3.2, 0, 4],
  [-4.2, 0, 6.2],
  [4.2, 0, 6.2],
];

function Plaza({ color, placing, onPlace }: { color: string; placing: boolean; onPlace: (p: THREE.Vector3) => void }) {
  return (
    <Clickable placing={placing} onPlace={onPlace}>
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 5]} receiveShadow>
          <planeGeometry args={[10, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.15, 5]} castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 0.9, 0.3, 24]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.3} roughness={0.1} />
        </mesh>
        <lineSegments position={[0, 0.3, 5]}>
          <edgesGeometry args={[new THREE.CylinderGeometry(0.9, 0.9, 0.3, 24)]} />
          <lineBasicMaterial color="#0c4a6e" transparent opacity={0.4} />
        </lineSegments>
        {TREE_POSITIONS.map((p, i) => (
          <FormalTree key={i} position={p} />
        ))}
        <SceneLabel position={[4.6, 0.3, 5]} text="Plaza Hardscape" />
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
  const cpm = useMemo(() => computeCPM(PLAZA_TASKS), []);
  const isCritical = (id: string) => cpm.tasks.find((t) => t.id === id)?.isCritical ?? false;
  const colorFor = (taskId: string) => (isCritical(taskId) ? CRITICAL_COLOR : ACTIVE_COLOR);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 14, 8]} intensity={1.2} castShadow />
      <directionalLight position={[-8, 6, -6]} intensity={0.3} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[26, 24]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      <Podium color={colorFor("P2")} placing={placing} onPlace={onPlace} />
      <Tower color={colorFor("P3")} placing={placing} onPlace={onPlace} />
      <EntranceCanopy color={colorFor("P4")} placing={placing} onPlace={onPlace} />
      <RooftopPlant color={colorFor("P5")} placing={placing} onPlace={onPlace} />
      <Plaza color={isCritical("P6") ? CRITICAL_COLOR : NEUTRAL_COLOR} placing={placing} onPlace={onPlace} />

      {pins.map((p) => {
        const task = PLAZA_TASKS.find((t) => t.id === p.taskId);
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

      <gridHelper args={[26, 26, "#94a3b8", "#64748b"]} position={[0, -0.01, 0]} />
    </>
  );
}

export default function PlazaTower3D({
  pins = [],
  placing = false,
  selectedTaskId = null,
  pendingPoint = null,
  onPlace,
  onSelectPin,
  autoRotate = false,
  hideChrome = false,
}: {
  pins?: Pin3D[];
  placing?: boolean;
  selectedTaskId?: string | null;
  pendingPoint?: [number, number, number] | null;
  onPlace?: (point: THREE.Vector3) => void;
  onSelectPin?: (taskId: string) => void;
  autoRotate?: boolean;
  hideChrome?: boolean;
}) {
  return (
    <div className="relative w-full h-full">
      <Canvas shadows camera={{ position: hideChrome ? [22, 15, 24] : [16, 12, 18], fov: hideChrome ? 38 : 42 }}>
        <color attach="background" args={["#0f172a"]} />
        <HideChromeContext.Provider value={hideChrome}>
          <Scene
            placing={placing}
            onPlace={onPlace ?? (() => {})}
            pins={pins}
            selectedTaskId={selectedTaskId}
            onSelectPin={onSelectPin ?? (() => {})}
            pendingPoint={pendingPoint}
          />
        </HideChromeContext.Provider>
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={8}
          maxDistance={40}
          target={hideChrome ? [0, 6, 1] : [0, 5, 2]}
          autoRotate={autoRotate}
          autoRotateSpeed={1.1}
          enabled
        />
      </Canvas>
      {!hideChrome && (
        <>
          <Legend />
          <ModeHint placing={placing} />
        </>
      )}
    </div>
  );
}
