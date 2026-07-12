import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isRecord } from "../src/shared/value-guards";

describe("value guard 単一正本 (PLAN-L7-433 Q8)", () => {
  it("U-VGUARD-001: objectだけをrecordとして受理しarray/nullを拒否する", () => {
    expect(isRecord({ value: 1 })).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(["status", "passed"])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord("object")).toBe(false);
  });

  it("U-VGUARD-002: production isRecord定義はsharedの1件だけ", () => {
    const paths = [
      "src/shared/value-guards.ts",
      "src/schema/design-declarations.ts",
      "src/policy/feedback-lifecycle.ts",
      "src/memory/memory-compaction.ts",
      "src/memory/memory-store.ts",
      "src/memory/memory-v2.ts",
      "src/setup/index.ts",
      "src/lint/outstanding.ts",
      "src/lint/gn-evidence-manifest.ts",
      "src/lint/g8-integration-workflow.ts",
      "src/runtime/retirement-preserve.ts",
      "src/runtime/agent-observability-provenance.ts",
      "src/state-db/test-report-parser.ts",
    ];
    const definitions = paths.flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(/function\s+isRecord\b/g)].map(() => path),
    );
    expect(definitions).toEqual(["src/shared/value-guards.ts"]);
  });
});
