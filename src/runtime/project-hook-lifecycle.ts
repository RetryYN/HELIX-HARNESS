import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";

export interface ProjectHookTerminalResultV1 {
  result_kind: "review" | "receipt" | "dispatch";
  session_id: string;
  candidate_head: string;
  verdict: "approve" | "reject" | "blocked" | "completed";
  comment_url: string | null;
  result_digest: Sha256Digest;
}

export interface ProjectHookLifecyclePolicyV1 {
  timeout_ms: number;
  hard_ceiling_ms: 60_000;
  child_termination_grace_ms: number;
  parent_terminal_required: true;
}

export interface ProjectHookLifecycleDeps {
  schedule(callback: () => void, timeoutMs: number): unknown;
  cancel(handle: unknown): void;
  terminateChild(graceMs: number): Promise<boolean>;
  isParentTerminal(): Promise<boolean>;
}

export type ProjectHookLifecycleResult<T> =
  | { ok: true; value: T; preserved_terminal_result: ProjectHookTerminalResultV1 | null }
  | {
      ok: false;
      code:
        | "hook_lifecycle_policy_invalid"
        | "project_hook_lifecycle_timeout"
        | "terminal_result_mutation_detected";
      child_terminal: boolean;
      parent_terminal: boolean;
      preserved_terminal_result: ProjectHookTerminalResultV1 | null;
    };

export const nodeProjectHookLifecycleDeps: ProjectHookLifecycleDeps = {
  schedule: (callback, timeoutMs) => setTimeout(callback, timeoutMs),
  cancel: (handle) => clearTimeout(handle as NodeJS.Timeout),
  terminateChild: async () => true,
  isParentTerminal: async () => true,
};

function terminalPayload(result: ProjectHookTerminalResultV1) {
  const { result_digest: _digest, ...payload } = result;
  return payload;
}

export function sealProjectHookTerminalResult(
  payload: Omit<ProjectHookTerminalResultV1, "result_digest">,
): ProjectHookTerminalResultV1 {
  return Object.freeze({
    ...structuredClone(payload),
    result_digest: sha256Digest(canonicalJson(payload)),
  });
}

function validTerminalResult(value: ProjectHookTerminalResultV1 | null): boolean {
  return (
    value === null || value.result_digest === sha256Digest(canonicalJson(terminalPayload(value)))
  );
}

function validPolicy(policy: ProjectHookLifecyclePolicyV1): boolean {
  return (
    Number.isInteger(policy.timeout_ms) &&
    policy.timeout_ms > 0 &&
    policy.timeout_ms <= 60_000 &&
    policy.hard_ceiling_ms === 60_000 &&
    Number.isInteger(policy.child_termination_grace_ms) &&
    policy.child_termination_grace_ms >= 0 &&
    policy.child_termination_grace_ms <= 60_000 &&
    policy.parent_terminal_required === true
  );
}

export async function superviseProjectHookLifecycle<T>(input: {
  policy: ProjectHookLifecyclePolicyV1;
  terminal_result: ProjectHookTerminalResultV1 | null;
  operation: (signal: AbortSignal) => Promise<T>;
  deps?: ProjectHookLifecycleDeps;
}): Promise<ProjectHookLifecycleResult<T>> {
  const preserved = input.terminal_result === null ? null : structuredClone(input.terminal_result);
  if (!validPolicy(input.policy)) {
    return {
      ok: false,
      code: "hook_lifecycle_policy_invalid",
      child_terminal: true,
      parent_terminal: true,
      preserved_terminal_result: preserved,
    };
  }
  if (!validTerminalResult(input.terminal_result)) {
    return {
      ok: false,
      code: "terminal_result_mutation_detected",
      child_terminal: true,
      parent_terminal: true,
      preserved_terminal_result: preserved,
    };
  }
  const deps = input.deps ?? nodeProjectHookLifecycleDeps;
  const abort = new AbortController();
  let timer: unknown;
  const timeout = new Promise<{ timedOut: true }>((resolve) => {
    timer = deps.schedule(() => resolve({ timedOut: true }), input.policy.timeout_ms);
  });
  const operation = input
    .operation(abort.signal)
    .then((value) => ({ timedOut: false as const, value }));
  const raced = await Promise.race([operation, timeout]);
  if (!raced.timedOut) {
    deps.cancel(timer);
    return { ok: true, value: raced.value, preserved_terminal_result: preserved };
  }
  abort.abort();
  const childTerminal = await deps.terminateChild(input.policy.child_termination_grace_ms);
  const parentTerminal = await deps.isParentTerminal();
  return {
    ok: false,
    code: "project_hook_lifecycle_timeout",
    child_terminal: childTerminal,
    parent_terminal: parentTerminal,
    preserved_terminal_result: preserved,
  };
}
