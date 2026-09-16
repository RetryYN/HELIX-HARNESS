import type { LintResult } from "../plan/lint";

export type DoctorScope = "full" | "toolchain";

export interface DoctorOptions {
  scope?: DoctorScope;
  setupSmoke?: boolean;
  timing?: boolean;
}

export interface DoctorTiming {
  id: string;
  duration_ms: number;
  ok: boolean;
  message_count: number;
}

export interface DoctorCheckRun {
  scope: DoctorScope;
  setupSmoke: boolean;
  checks: Array<{ id: string; result: LintResult }>;
  timings: DoctorTiming[];
}

export interface DoctorResult extends LintResult {
  scope?: DoctorScope;
  setupSmoke?: boolean;
  timings?: DoctorTiming[];
}
