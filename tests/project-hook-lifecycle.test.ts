import { describe, expect, it } from "vitest";
import {
  type ProjectHookLifecycleDeps,
  sealProjectHookTerminalResult,
  superviseProjectHookLifecycle,
} from "../src/runtime/project-hook-lifecycle";

// PLAN-L7-653-project-hook-lifecycle-supervisor

const policy = () => ({
  timeout_ms: 15_000,
  hard_ceiling_ms: 60_000 as const,
  child_termination_grace_ms: 1_000,
  parent_terminal_required: true as const,
});
const terminal = () =>
  sealProjectHookTerminalResult({
    result_kind: "review",
    session_id: "session-895",
    candidate_head: "a".repeat(40),
    verdict: "approve",
    comment_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/933#issuecomment-1",
  });
function immediateTimeout(
  overrides: Partial<ProjectHookLifecycleDeps> = {},
): ProjectHookLifecycleDeps {
  return {
    schedule: (callback) => {
      queueMicrotask(callback);
      return "timer";
    },
    cancel: () => undefined,
    terminateChild: async () => true,
    isParentTerminal: async () => true,
    ...overrides,
  };
}

describe("project hook bounded lifecycle", () => {
  it("U-CNWHOOKLIFE-001: operation完了時はtimerをcancelしresultを返す", async () => {
    let cancelled = false;
    const result = await superviseProjectHookLifecycle({
      policy: policy(),
      terminal_result: terminal(),
      operation: async () => "green",
      deps: immediateTimeout({
        schedule: () => "timer",
        cancel: () => {
          cancelled = true;
        },
      }),
    });
    expect(result).toMatchObject({ ok: true, value: "green" });
    expect(cancelled).toBe(true);
  });

  it("U-CNWHOOKLIFE-002: timeoutでabortし子停止と親terminalを確認する", async () => {
    let aborted = false;
    let grace = -1;
    const result = await superviseProjectHookLifecycle({
      policy: policy(),
      terminal_result: terminal(),
      operation: (signal) =>
        new Promise(() => {
          signal.addEventListener("abort", () => (aborted = true));
        }),
      deps: immediateTimeout({
        terminateChild: async (value) => {
          grace = value;
          return true;
        },
      }),
    });
    expect(result).toMatchObject({
      ok: false,
      code: "project_hook_lifecycle_timeout",
      child_terminal: true,
      parent_terminal: true,
    });
    expect(aborted).toBe(true);
    expect(grace).toBe(1_000);
  });

  it("U-CNWHOOKLIFE-003: timeout後もterminal result bytesを保全する", async () => {
    const receipt = terminal();
    const result = await superviseProjectHookLifecycle({
      policy: policy(),
      terminal_result: receipt,
      operation: () => new Promise(() => undefined),
      deps: immediateTimeout(),
    });
    expect(result.ok).toBe(false);
    expect(result.preserved_terminal_result).toEqual(receipt);
    expect(result.preserved_terminal_result).not.toBe(receipt);
  });

  it("U-CNWHOOKLIFE-004: 60秒超過と改変receiptをfail-closeする", async () => {
    expect(
      await superviseProjectHookLifecycle({
        policy: { ...policy(), timeout_ms: 60_001 },
        terminal_result: null,
        operation: async () => "unreachable",
      }),
    ).toMatchObject({ ok: false, code: "hook_lifecycle_policy_invalid" });
    const changed = { ...terminal(), verdict: "reject" as const };
    expect(
      await superviseProjectHookLifecycle({
        policy: policy(),
        terminal_result: changed,
        operation: async () => "unreachable",
      }),
    ).toMatchObject({ ok: false, code: "terminal_result_mutation_detected" });
  });

  it("U-CNWHOOKLIFE-005: child／parent非terminalを成功へ降格しない", async () => {
    const result = await superviseProjectHookLifecycle({
      policy: policy(),
      terminal_result: null,
      operation: () => new Promise(() => undefined),
      deps: immediateTimeout({
        terminateChild: async () => false,
        isParentTerminal: async () => false,
      }),
    });
    expect(result).toMatchObject({
      ok: false,
      code: "project_hook_lifecycle_timeout",
      child_terminal: false,
      parent_terminal: false,
    });
  });
});
