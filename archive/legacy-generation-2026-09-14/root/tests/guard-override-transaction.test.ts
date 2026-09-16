import { describe, expect, it, vi } from "vitest";
import { createGuardOverrideAuditPort } from "../src/runtime/git-command-guard-hook";
import { commitOverrideUse } from "../src/runtime/guard-override-transaction";
import type { HarnessDb } from "../src/state-db";

const classification = {
  guardKind: "git" as const,
  operationClass: "git clean --force",
  subjectDigest: `sha256:${"0".repeat(64)}`,
};

describe("guard override transaction", () => {
  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-006/008] bounds busy retry and does not retry non-busy failures", () => {
    const fakeDb = (failures: Error[]): { db: HarnessDb; begins: () => number } => {
      let beginCount = 0;
      return {
        begins: () => beginCount,
        db: {
          path: ":memory:",
          driver: "node",
          exec: (sql) => {
            if (sql === "BEGIN IMMEDIATE") {
              beginCount += 1;
              const failure = failures.shift();
              if (failure) throw failure;
            }
          },
          prepare: () => ({
            run: () => ({ changes: 1 }),
            get: () => undefined,
            all: () => [],
          }),
          userVersion: () => 38,
          setUserVersion: () => undefined,
          close: () => undefined,
        },
      };
    };
    const input = { nonce: "n-retry", reason: "reviewed", classification };
    const recovered = fakeDb([new Error("database is locked"), new Error("SQLITE_BUSY")]);
    expect(createGuardOverrideAuditPort(recovered.db).commit(input)).toEqual({
      status: "committed",
    });
    expect(recovered.begins()).toBe(3);

    const exhausted = fakeDb(Array.from({ length: 5 }, () => new Error("database is locked")));
    expect(() => createGuardOverrideAuditPort(exhausted.db).commit(input)).toThrow("locked");
    expect(exhausted.begins()).toBe(5);

    const nonBusy = fakeDb([new Error("disk I/O error")]);
    expect(() => createGuardOverrideAuditPort(nonBusy.db).commit(input)).toThrow("disk I/O error");
    expect(nonBusy.begins()).toBe(1);
  });

  it("[PLAN-L7-443-destructive-command-guard-transaction/U-GITGUARD-005] commits audit before one-shot consume", () => {
    const order: string[] = [];
    const result = commitOverrideUse({
      nonce: "n-1",
      reason: "reviewed recovery",
      classification,
      audit: {
        commit: () => {
          order.push("audit");
          return { status: "committed" };
        },
        abort: () => order.push("abort"),
      },
      marker: {
        consume: () => {
          order.push("consume");
          return true;
        },
      },
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
        audit: {
          commit: () => {
            throw new Error("disk full");
          },
          abort: () => undefined,
        },
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
        marker: {
          consume: () => {
            throw new Error("readonly");
          },
        },
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
        nonce: "n-1",
        reason,
        classification,
        audit: { commit: () => ({ status: "committed" }), abort: () => undefined },
        marker: { consume: () => true },
      });
      expect(result, reason).toEqual({ status: "blocked_invalid_authorization" });
    }
  });
});
