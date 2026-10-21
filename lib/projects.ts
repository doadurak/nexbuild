import type { CpmTaskInput } from "./cpm";
import { CPM_TASKS } from "./taskData";

export const RESORT_TASKS: CpmTaskInput[] = [
  { id: "R1", name: "Site Clearing & Grading", duration: 4, dependsOn: [] },
  { id: "R2", name: "Utility Infrastructure (Water & Power)", duration: 6, dependsOn: ["R1"] },
  { id: "R3", name: "Villa Cluster — Foundations", duration: 6, dependsOn: ["R2"] },
  { id: "R4", name: "Villa Cluster — Structure & Roofing", duration: 10, dependsOn: ["R3"] },
  { id: "R5", name: "Central Clubhouse — Structure", duration: 12, dependsOn: ["R2"] },
  { id: "R6", name: "Swimming Pool Construction", duration: 8, dependsOn: ["R2"] },
  { id: "R7", name: "Landscaping & Pathways", duration: 5, dependsOn: ["R4", "R5", "R6"] },
];

export const PLAZA_TASKS: CpmTaskInput[] = [
  { id: "P1", name: "Excavation & Piling", duration: 5, dependsOn: [] },
  { id: "P2", name: "Podium Structure", duration: 8, dependsOn: ["P1"] },
  { id: "P3", name: "Tower Superstructure", duration: 14, dependsOn: ["P2"] },
  { id: "P4", name: "Curtain Wall Glazing", duration: 10, dependsOn: ["P3"] },
  { id: "P5", name: "MEP Fit-out", duration: 9, dependsOn: ["P2"] },
  { id: "P6", name: "Plaza Hardscape & Landscaping", duration: 4, dependsOn: ["P1"] },
];

export interface Project {
  id: "riverside" | "resort" | "plaza";
  name: string;
  subtitle: string;
  tasks: CpmTaskInput[];
}

export const PROJECTS: Project[] = [
  { id: "riverside", name: "Riverside Tower B", subtitle: "Section A-A — mixed-use tower", tasks: CPM_TASKS },
  { id: "resort", name: "Sunset Bay Resort", subtitle: "Villa clusters, clubhouse & pool", tasks: RESORT_TASKS },
  { id: "plaza", name: "Meridian Plaza", subtitle: "Podium & office tower", tasks: PLAZA_TASKS },
];
