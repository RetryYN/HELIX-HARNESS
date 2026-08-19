import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const canonicalPlan = "PLAN-L7-636-event-projection-checkpoint-replay";

describe("event projection PLAN identity", () => {
  it("U-EPR-IDENTITY-001: uses the allocated canonical PLAN and keeps the colliding PSC identity intact", () => {
    expect(existsSync(join(root, "docs/plans", `${canonicalPlan}.md`))).toBe(true);
    expect(existsSync(join(root, "docs/plans/PLAN-L7-531-psc-l9-gate-system.md"))).toBe(true);
  });

  it("does not reintroduce the ambiguous event-projection PLAN reference", () => {
    const l8 = readFileSync(
      join(
        root,
        "docs/test-design/helix/L8-event-projection-checkpoint-replay-unit-test-design.md",
      ),
      "utf8",
    );
    expect(l8).toContain(canonicalPlan);
    expect(l8).not.toContain("PLAN-L7-531-event-projection-checkpoint-replay");
  });
});
