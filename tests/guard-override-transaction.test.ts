import { describe, expect, it, vi } from "vitest";
import { commitOverrideUse } from "../src/runtime/guard-override-transaction";

const classification = {
  guardKind: "git" as const,
  operationClass: "git clean --force",
  subjectDigest: `sha256:${"0".repeat(64)}`,
};

describe("guard override transaction", () => {
  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-005] commits audit before one-shot consume", () => {
    const order: string[] = [];
    const result = commitOverrideUse({
      nonce: "n-1",
      reason: "reviewed recovery",
      classification,
      audit: {
        commit: () => (order.push("audit"), { status: "committed" }),
        abort: () => order.push("abort"),
      },
      marker: { consume: () => (order.push("consume"), true) },
    });
    expect(result).toEqual({ status: "allowed" });
    expect(order).toEqual(["audit", "consume"]);
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-006] fails closed on audit and consume errors", () => {
    const consume = vi.fn(() => true);
    expect(
      commitOverrideUse({
        nonce: "n-1",
        reason: "reason",
        classification,
        audit: { commit: () => { throw new Error("disk full"); }, abort: () => undefined },
        marker: { consume },
      }),
    ).toEqual({ status: "blocked_audit_failure" });
    expect(consume).not.toHaveBeenCalled();
    const abort = vi.fn();
    expect(
      commitOverrideUse({
        nonce: "n-1",
        reason: "reason",
        classification,
        audit: { commit: () => ({ status: "committed" }), abort },
        marker: { consume: () => { throw new Error("readonly"); } },
      }),
    ).toEqual({ status: "blocked_consume_failure" });
    expect(abort).toHaveBeenCalledWith({ nonce: "n-1", reason: "consume_failed" });
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-008] maps atomic nonce reuse without consuming the marker", () => {
    const consume = vi.fn(() => true);
    const result = commitOverrideUse({
      nonce: "n-used",
      reason: "reason",
      classification,
      audit: { commit: () => ({ status: "reused" }), abort: () => undefined },
      marker: { consume },
    });
    expect(result).toEqual({ status: "blocked_reuse" });
    expect(consume).not.toHaveBeenCalled();
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-006] rejects unbounded or credential-bearing audit input", () => {
    for (const reason of ["", "x".repeat(257), "token=secret-value", "line1\nline2"]) {
      const result = commitOverrideUse({
        nonce: "n-1", reason, classification,
        audit: { commit: () => ({ status: "committed" }), abort: () => undefined },
        marker: { consume: () => true },
      });
      expect(result, reason).toEqual({ status: "blocked_invalid_authorization" });
    }
  });
});
