import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { type AnalyzerRule, analyzeSnapshot, type DeepReadonly } from "../src/lint/effect-intent";

// PLAN-L7-451-lint-effect-port-separation
describe("lint effect intent", () => {
  it("U-SBOUND-004: immutable snapshotだけを決定的に解析しeffect authorityを持たない", () => {
    type Snapshot = { files: string[]; threshold: number };
    const snapshot = Object.freeze({
      files: Object.freeze(["src/a.ts", "src/b.ts"]),
      threshold: 1,
    }) as DeepReadonly<Snapshot>;
    const effect = vi.fn();
    const rules: readonly AnalyzerRule<Snapshot>[] = [
      {
        id: "file-count",
        evaluate: (input) => [
          {
            code: "too-many-files",
            severity: "warn",
            detail: `${input.files.length}>${input.threshold}`,
          },
        ],
      },
      {
        id: "effect-free",
        evaluate: (input) =>
          input.files.includes("src/a.ts")
            ? [{ code: "observed", severity: "info", detail: "snapshot only" }]
            : [],
      },
    ];

    const first = analyzeSnapshot(snapshot, rules);
    const second = analyzeSnapshot(snapshot, rules);

    expect(first).toStrictEqual(second);
    expect(first).toStrictEqual([
      {
        rule_id: "file-count",
        code: "too-many-files",
        severity: "warn",
        detail: "2>1",
      },
      {
        rule_id: "effect-free",
        code: "observed",
        severity: "info",
        detail: "snapshot only",
      },
    ]);
    expect(effect).not.toHaveBeenCalled();

    const source = readFileSync("src/lint/effect-intent.ts", "utf8");
    for (const forbidden of [
      "node:fs",
      "node:child_process",
      "../runtime",
      "ProbePort",
      "WritePort",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
