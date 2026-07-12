import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nowIso } from "../src/shared/time-utils";

describe("time utility 単一正本 (PLAN-L7-433 Q8)", () => {
  it("U-TIMEUTIL-001: UTC ISO-8601を返しproduction定義を1件にする", () => {
    expect(nowIso()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    const paths = [
      "src/shared/time-utils.ts",
      "src/feedback/engine.ts",
      "src/guardrail/ledger.ts",
      "src/skills/recommend.ts",
      "src/state-db/projection-writer.ts",
      "src/workflow/readiness.ts",
    ];
    const definitions = paths.flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(/function\s+nowIso\b/g)].map(() => path),
    );
    expect(definitions).toEqual(["src/shared/time-utils.ts"]);
  });
});
