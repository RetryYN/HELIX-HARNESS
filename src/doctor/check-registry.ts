import { performance } from "node:perf_hooks";
import type { LintResult } from "../plan/lint";
import type { DoctorCheckRun, DoctorOptions, DoctorScope, DoctorTiming } from "./result";

export interface DoctorCheckDefinition {
  id: string;
  profiles: readonly DoctorScope[];
  run: () => LintResult;
}

export interface DoctorCheckRuntime {
  deps: { repoRoot: string };
  fullDoctor: () => LintResult;
  toolchain: () => LintResult;
  setupSmoke: () => LintResult;
}

export function buildDoctorCheckDefinitions(runtime: DoctorCheckRuntime): DoctorCheckDefinition[] {
  return [
    {
      id: "full-doctor",
      profiles: ["full"],
      run: runtime.fullDoctor,
    },
    {
      id: "toolchain-pin",
      profiles: ["toolchain"],
      run: runtime.toolchain,
    },
  ];
}

export function collectDoctorCheckRun(
  runtime: DoctorCheckRuntime,
  options: DoctorOptions = {},
): DoctorCheckRun {
  const scope = options.scope ?? "full";
  const timings: DoctorTiming[] = [];
  const record = (id: string, run: () => LintResult): LintResult => {
    if (options.timing !== true) return run();
    const started = performance.now();
    const result = run();
    timings.push({
      id,
      duration_ms: Number((performance.now() - started).toFixed(3)),
      ok: result.ok,
      message_count: result.messages.length,
    });
    return result;
  };

  if (options.setupSmoke === true) {
    return {
      scope,
      setupSmoke: true,
      checks: [{ id: "setup-smoke", result: record("setup-smoke", runtime.setupSmoke) }],
      timings,
    };
  }

  const definitions = buildDoctorCheckDefinitions(runtime).filter((definition) =>
    definition.profiles.includes(scope),
  );
  return {
    scope,
    setupSmoke: false,
    checks: definitions.map((definition) => ({
      id: definition.id,
      result: record(definition.id, definition.run),
    })),
    timings,
  };
}
