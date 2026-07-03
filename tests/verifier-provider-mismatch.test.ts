import { describe, expect, it } from "vitest";
import {
  analyzeVerifierProviderMismatch,
  verifierProviderMismatchMessages,
} from "../src/lint/verifier-provider-mismatch";

describe("verifier-provider-mismatch detector", () => {
  it("blocks hybrid self-evaluation rows without blockedReason", () => {
    const result = analyzeVerifierProviderMismatch([
      {
        path: ".ut-tdd/state/loop/PLAN-X.iterations.jsonl",
        content: JSON.stringify({
          planId: "PLAN-X",
          iteration: 2,
          workerProvider: "codex",
          verifierProvider: "codex",
        }),
      },
    ]);

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual([
      expect.objectContaining({
        planId: "PLAN-X",
        iteration: 2,
        provider: "codex",
      }),
    ]);
    expect(verifierProviderMismatchMessages(result).join("\n")).toContain(
      "hybrid self-evaluation rows=1",
    );
  });

  it("allows cross-provider rows and explicit fallback rows", () => {
    const result = analyzeVerifierProviderMismatch([
      {
        path: ".ut-tdd/state/loop/PLAN-X.iterations.jsonl",
        content: [
          JSON.stringify({
            planId: "PLAN-X",
            iteration: 1,
            workerProvider: "codex",
            verifierProvider: "claude",
          }),
          JSON.stringify({
            planId: "PLAN-X",
            iteration: 2,
            workerProvider: "codex",
            verifierProvider: "codex",
            blockedReason: "intra_runtime_fallback",
          }),
          "{invalid",
        ].join("\n"),
      },
    ]);

    expect(result.ok).toBe(true);
    expect(result.checkedIterations).toBe(2);
    expect(result.unparsableLines).toBe(1);
    expect(result.violations).toEqual([]);
  });
});
