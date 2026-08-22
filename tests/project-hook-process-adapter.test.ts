import { describe, expect, it } from "vitest";
import {
  type ProjectHookProcessAdapterDeps,
  terminateProjectHookChild,
} from "../src/runtime/project-hook-process-adapter";

const CHILD = {
  pid: 4242,
  spawned_at: "2026-08-22T09:00:00.000Z",
  command_digest: `sha256:${"a".repeat(64)}` as const,
};

// PLAN-L7-654-project-hook-process-adapter

function fake(sequence: boolean[]) {
  const signals: NodeJS.Signals[] = [];
  const waits: number[] = [];
  const deps: ProjectHookProcessAdapterDeps = {
    signal: (_pid, signal) => signals.push(signal),
    isAlive: () => sequence.shift() ?? false,
    wait: async (ms) => {
      waits.push(ms);
    },
  };
  return { deps, signals, waits };
}

describe("project hook process adapter", () => {
  it("U-CNWHOOKPROC-001: 既にterminalのchildへsignalを送らない", async () => {
    const observed = fake([false]);
    await expect(
      terminateProjectHookChild({ child: CHILD, grace_ms: 250, deps: observed.deps }),
    ).resolves.toEqual({ ok: true, child_terminal: true, escalation: "none" });
    expect(observed.signals).toEqual([]);
    expect(observed.waits).toEqual([]);
  });

  it("U-CNWHOOKPROC-002: SIGTERM後のgrace内terminalを確認する", async () => {
    const observed = fake([true, false]);
    await expect(
      terminateProjectHookChild({ child: CHILD, grace_ms: 250, deps: observed.deps }),
    ).resolves.toEqual({ ok: true, child_terminal: true, escalation: "none" });
    expect(observed.signals).toEqual(["SIGTERM"]);
    expect(observed.waits).toEqual([250]);
  });

  it("U-CNWHOOKPROC-003: grace後もaliveならSIGKILLしてterminalを再確認する", async () => {
    const observed = fake([true, true, false]);
    await expect(
      terminateProjectHookChild({ child: CHILD, grace_ms: 250, deps: observed.deps }),
    ).resolves.toEqual({ ok: true, child_terminal: true, escalation: "sigkill" });
    expect(observed.signals).toEqual(["SIGTERM", "SIGKILL"]);
  });

  it("U-CNWHOOKPROC-004: SIGKILL後もaliveなら成功へ降格しない", async () => {
    const observed = fake([true, true, true]);
    await expect(
      terminateProjectHookChild({ child: CHILD, grace_ms: 250, deps: observed.deps }),
    ).resolves.toEqual({
      ok: false,
      code: "hook_child_not_terminal",
      child_terminal: false,
      escalation: "sigkill",
    });
  });

  it("U-CNWHOOKPROC-005: PID・時刻・digest・graceの不正値では副作用を起こさない", async () => {
    const observed = fake([true]);
    const invalid = { ...CHILD, pid: 1 };
    await expect(
      terminateProjectHookChild({ child: invalid, grace_ms: 60_001, deps: observed.deps }),
    ).resolves.toMatchObject({ ok: false, code: "hook_process_identity_invalid" });
    expect(observed.signals).toEqual([]);
    expect(observed.waits).toEqual([]);
  });
});
