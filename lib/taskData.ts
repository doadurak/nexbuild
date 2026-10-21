import type { CpmTaskInput } from "./cpm";

/**
 * Canonical task graph for the Riverside Tower B schedule. Shared by the CPM
 * Engine Console, the Digital Twin plan pins and the Scenario Explorer so
 * every view of "the schedule" stays in sync with one real dependency graph.
 */
export const CPM_TASKS: CpmTaskInput[] = [
  { id: "T1", name: "Site Mobilization & Permits", duration: 3, dependsOn: [] },
  { id: "T2", name: "Floor 3 Rebar Inspection", duration: 4, dependsOn: ["T1"] },
  { id: "T3", name: "Floor 3 Concrete Pour", duration: 6, dependsOn: ["T2"] },
  { id: "T4", name: "Floor 3 Formwork Stripping & Curing", duration: 5, dependsOn: ["T3"] },
  { id: "T5", name: "Floor 4 Rebar Installation", duration: 8, dependsOn: ["T4"] },
  { id: "T6", name: "MEP Vertical Riser - Section B", duration: 14, dependsOn: ["T2"] },
  { id: "T7", name: "Floor 4 Concrete Pour", duration: 6, dependsOn: ["T5", "T6"] },
];

export interface CriticalPathTask {
  id: string;
  name: string;
  duration: string;
  float: string;
  status: string;
  delay: string;
  assignee: string;
}

/** Ongoing-work summaries shown in the Copilot — same activities as CPM_TASKS,
 *  with the human-readable float/delay framing used across the dashboard. */
export const CRITICAL_PATH_TASKS: CriticalPathTask[] = [
  { id: "ACT-108", name: "Floor 3 Concrete Pour", duration: "12d", float: "-8d", status: "CRITICAL", delay: "+8d", assignee: "Kaya Concrete Co." },
  { id: "ACT-114", name: "Floor 3 Stripping & Curing", duration: "5d", float: "0d", status: "RISK", delay: "0d", assignee: "Structural Crew A" },
  { id: "ACT-120", name: "Floor 4 Rebar Installation", duration: "8d", float: "0d", status: "PENDING", delay: "0d", assignee: "SteelCorp" },
  { id: "ACT-132", name: "MEP Vertical Riser - Sec B", duration: "14d", float: "2d", status: "BUFFER", delay: "0d", assignee: "ElectroTech" },
];
