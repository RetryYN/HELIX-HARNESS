import type { LoopState } from "./loop-state";

export function canResume(s: LoopState, now: string): boolean {
  const currentTime = Date.parse(now);
  const opensAt = Date.parse(s.windowOpensAt);
  const closesAt = Date.parse(s.windowClosesAt);
  const withinTimeWindow = currentTime >= opensAt && currentTime <= closesAt;
  const shouldSchedule = s.lastVerdict !== "pass" && s.iteration < s.maxIterations;

  return s.status === "running" && withinTimeWindow && shouldSchedule;
}
