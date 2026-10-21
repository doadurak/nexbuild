import { computeCPM, type CpmResult, type CpmTaskInput } from "./cpm";
import { CPM_TASKS } from "./taskData";

export interface Scenario {
  id: string;
  title: string;
  description: string;
  color: string;
  tasks: CpmTaskInput[];
  costMultiplier: number;
}

export interface ScenarioPoint {
  scenarioId: string;
  x: number;
  y: number;
  recommended: boolean;
}

export interface ScenarioResult extends Scenario {
  cpm: CpmResult;
  days: number;
  cost: number;
  points: ScenarioPoint[];
}

/** Rough blended daily burn rate (crew + equipment + overhead) used to turn a computed
 *  duration into an illustrative cost figure. Not a real estimate — a consistent,
 *  deterministic function of the real CPM output, same spirit as the rest of the demo. */
const DAILY_RATE = 34000;

function withDurations(overrides: Record<string, number>): CpmTaskInput[] {
  return CPM_TASKS.map((t) => ({ ...t, duration: overrides[t.id] ?? t.duration }));
}

export const SCENARIOS: Scenario[] = [
  {
    id: "baseline",
    title: "Original Project Baseline",
    description: "Imported schedule, no optimization applied yet.",
    color: "#64748b",
    tasks: CPM_TASKS,
    costMultiplier: 1,
  },
  {
    id: "crash-critical",
    title: "Add another crew to the critical path",
    description: "Crash every critical-path task after permitting with a second crew.",
    color: "#8b5cf6",
    tasks: withDurations({ T2: 2, T3: 3, T4: 3, T5: 4, T7: 3 }),
    costMultiplier: 1.21,
  },
  {
    id: "overtime",
    title: "Adjust crew schedule to overtime",
    description: "Switch every crew to a 5-day, 12-hour overtime calendar.",
    color: "#a855f7",
    tasks: withDurations(Object.fromEntries(CPM_TASKS.map((t) => [t.id, Math.max(1, Math.round(t.duration * 0.8))]))),
    costMultiplier: 1.12,
  },
  {
    id: "max-resource",
    title: "Maximize resource availability",
    description: "Increase MEP and rebar crews to maximum capacity to cut parallel contention.",
    color: "#2563eb",
    tasks: withDurations({ T5: 5, T6: 9 }),
    costMultiplier: 1.08,
  },
  {
    id: "permit-delay",
    title: "What if the permits are delayed?",
    description: "Site mobilization and permitting slips due to a municipal backlog.",
    color: "#f59e0b",
    tasks: withDurations({ T1: 5 }),
    costMultiplier: 1.0,
  },
  {
    id: "limited-crew",
    title: "What if MEP only has a limited crew?",
    description: "Riser work slows down with a smaller crew, but saves on labor cost.",
    color: "#e11d48",
    tasks: withDurations({ T6: 20 }),
    costMultiplier: 0.9,
  },
];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Runs the real CPM engine for every scenario's task graph. The "recommended"
 * point per scenario is the actual computed duration/cost; a couple of nearby
 * candidate points are added from a seeded PRNG purely so the scatter reads as
 * an explored solution cloud, the same shape ALICE Optimize's scatter uses.
 */
export function computeScenarios(regenToken = 0): ScenarioResult[] {
  return SCENARIOS.map((s, idx) => {
    const cpm = computeCPM(s.tasks);
    const days = cpm.projectDuration;
    const cost = Math.round(days * DAILY_RATE * s.costMultiplier);
    const rand = mulberry32(idx * 97 + 13 + regenToken * 1009);
    const cloudSize = idx === 0 ? 1 : 2 + Math.floor(rand() * 2);
    const points: ScenarioPoint[] = [{ scenarioId: s.id, x: days, y: cost, recommended: true }];
    for (let i = 1; i < cloudSize; i++) {
      points.push({
        scenarioId: s.id,
        x: Math.max(1, days + Math.round((rand() - 0.5) * 6)),
        y: Math.max(0, Math.round(cost + (rand() - 0.5) * cost * 0.06)),
        recommended: false,
      });
    }
    return { ...s, cpm, days, cost, points };
  });
}
