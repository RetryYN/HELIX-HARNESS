import type { Sha256Digest } from "./digest";

export interface ProjectHookChildProcessIdentityV1 {
  pid: number;
  spawned_at: string;
  command_digest: Sha256Digest;
}

export interface ProjectHookProcessAdapterDeps {
  signal(pid: number, signal: NodeJS.Signals): void;
  isAlive(pid: number): boolean;
  wait(ms: number): Promise<void>;
}

export type ProjectHookProcessTerminationResult =
  | { ok: true; child_terminal: true; escalation: "none" | "sigkill" }
  | {
      ok: false;
      code:
        | "hook_process_identity_invalid"
        | "hook_process_signal_failed"
        | "hook_child_not_terminal";
      child_terminal: false;
      escalation: "none" | "sigkill";
    };

export const nodeProjectHookProcessAdapterDeps: ProjectHookProcessAdapterDeps = {
  signal: (pid, signal) => process.kill(pid, signal),
  isAlive: (pid) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return (error as NodeJS.ErrnoException).code === "EPERM";
    }
  },
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

function validIdentity(identity: ProjectHookChildProcessIdentityV1): boolean {
  return (
    Number.isSafeInteger(identity.pid) &&
    identity.pid > 1 &&
    Number.isFinite(Date.parse(identity.spawned_at)) &&
    /^sha256:[0-9a-f]{64}$/.test(identity.command_digest)
  );
}

function signalChild(
  deps: ProjectHookProcessAdapterDeps,
  pid: number,
  signal: NodeJS.Signals,
): "sent" | "terminal" | "failed" {
  try {
    deps.signal(pid, signal);
    return "sent";
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "ESRCH" ? "terminal" : "failed";
  }
}

export async function terminateProjectHookChild(input: {
  child: ProjectHookChildProcessIdentityV1;
  grace_ms: number;
  deps?: ProjectHookProcessAdapterDeps;
}): Promise<ProjectHookProcessTerminationResult> {
  if (
    !validIdentity(input.child) ||
    !Number.isInteger(input.grace_ms) ||
    input.grace_ms < 0 ||
    input.grace_ms > 60_000
  ) {
    return {
      ok: false,
      code: "hook_process_identity_invalid",
      child_terminal: false,
      escalation: "none",
    };
  }
  const deps = input.deps ?? nodeProjectHookProcessAdapterDeps;
  if (!deps.isAlive(input.child.pid)) {
    return { ok: true, child_terminal: true, escalation: "none" };
  }
  const term = signalChild(deps, input.child.pid, "SIGTERM");
  if (term === "terminal") return { ok: true, child_terminal: true, escalation: "none" };
  if (term === "failed") {
    return {
      ok: false,
      code: "hook_process_signal_failed",
      child_terminal: false,
      escalation: "none",
    };
  }
  await deps.wait(input.grace_ms);
  if (!deps.isAlive(input.child.pid)) {
    return { ok: true, child_terminal: true, escalation: "none" };
  }
  const kill = signalChild(deps, input.child.pid, "SIGKILL");
  if (kill === "terminal") return { ok: true, child_terminal: true, escalation: "sigkill" };
  if (kill === "failed") {
    return {
      ok: false,
      code: "hook_process_signal_failed",
      child_terminal: false,
      escalation: "sigkill",
    };
  }
  if (!deps.isAlive(input.child.pid)) {
    return { ok: true, child_terminal: true, escalation: "sigkill" };
  }
  return {
    ok: false,
    code: "hook_child_not_terminal",
    child_terminal: false,
    escalation: "sigkill",
  };
}
