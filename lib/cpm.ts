export interface CpmTaskInput {
  id: string;
  name: string;
  duration: number;
  dependsOn: string[];
}

export interface CpmTaskResult extends CpmTaskInput {
  es: number;
  ef: number;
  ls: number;
  lf: number;
  float: number;
  isCritical: boolean;
}

export interface CpmResult {
  tasks: CpmTaskResult[];
  projectDuration: number;
  criticalPath: string[];
  computeMs: number;
}

/**
 * Real forward/backward pass Critical Path Method calculation over a task
 * dependency graph. No mock numbers — ES/EF/LS/LF/float are derived from
 * `duration` and `dependsOn` at call time.
 */
export function computeCPM(tasks: CpmTaskInput[]): CpmResult {
  const start = performance.now();

  const byId = new Map(tasks.map((t) => [t.id, t]));
  const es = new Map<string, number>();
  const ef = new Map<string, number>();

  const computeEF = (id: string): number => {
    if (ef.has(id)) return ef.get(id)!;
    const task = byId.get(id);
    if (!task) throw new Error(`Unknown task dependency: ${id}`);
    const earliestStart = task.dependsOn.length
      ? Math.max(...task.dependsOn.map((dep) => computeEF(dep)))
      : 0;
    es.set(id, earliestStart);
    const earliestFinish = earliestStart + task.duration;
    ef.set(id, earliestFinish);
    return earliestFinish;
  };
  tasks.forEach((t) => computeEF(t.id));

  const projectDuration = Math.max(...tasks.map((t) => ef.get(t.id)!));

  const successors = new Map<string, string[]>();
  tasks.forEach((t) => successors.set(t.id, []));
  tasks.forEach((t) => t.dependsOn.forEach((dep) => successors.get(dep)!.push(t.id)));

  const ls = new Map<string, number>();
  const lf = new Map<string, number>();

  const computeLS = (id: string): number => {
    if (ls.has(id)) return ls.get(id)!;
    const task = byId.get(id)!;
    const succ = successors.get(id)!;
    const latestFinish = succ.length ? Math.min(...succ.map((s) => computeLS(s))) : projectDuration;
    lf.set(id, latestFinish);
    const latestStart = latestFinish - task.duration;
    ls.set(id, latestStart);
    return latestStart;
  };
  tasks.forEach((t) => computeLS(t.id));

  const results: CpmTaskResult[] = tasks.map((t) => {
    const float = ls.get(t.id)! - es.get(t.id)!;
    return {
      ...t,
      es: es.get(t.id)!,
      ef: ef.get(t.id)!,
      ls: ls.get(t.id)!,
      lf: lf.get(t.id)!,
      float,
      isCritical: float === 0,
    };
  });

  const criticalPath = results.filter((t) => t.isCritical).map((t) => t.id);
  const computeMs = performance.now() - start;

  return { tasks: results, projectDuration, criticalPath, computeMs };
}
