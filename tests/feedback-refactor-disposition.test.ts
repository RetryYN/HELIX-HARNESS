import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Family = {
  family: string;
  predecessor_plan_id: string;
  required_successor: string;
  expected_count: number;
};

type Binding = {
  signal_type: string;
  source_id: string;
  source_path: string;
  source_file_sha256: string;
  family: string;
};

const manifest = JSON.parse(
  readFileSync("docs/governance/feedback-refactor-disposition.json", "utf8"),
) as {
  schema_version: string;
  issue_id: number;
  disposition_plan_id: string;
  activation_phase: string;
  families: Family[];
  bindings: Binding[];
};

function digest(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

describe("PLAN-L3-32 refactor warning disposition", () => {
  it("pins twenty unique signals across the 9/6/5 successor partition", () => {
    expect(manifest.schema_version).toBe("feedback-refactor-disposition.v1");
    expect(manifest.issue_id).toBe(74);
    expect(manifest.bindings).toHaveLength(20);
    expect(new Set(manifest.bindings.map((row) => row.source_id)).size).toBe(20);

    const expectedCounts = new Map(
      manifest.families.map((row) => [row.family, row.expected_count]),
    );
    expect([...expectedCounts.values()].reduce((sum, count) => sum + count, 0)).toBe(20);
    for (const [family, expected] of expectedCounts) {
      expect(
        manifest.bindings.filter((row) => row.family === family),
        family,
      ).toHaveLength(expected);
    }
  });

  it("matches every current source digest", () => {
    for (const row of manifest.bindings) {
      expect(digest(readFileSync(row.source_path, "utf8")), row.source_path).toBe(
        row.source_file_sha256,
      );
      expect(row.source_id.startsWith(`refactor-candidate:${row.signal_type.split(":")[1]}:`)).toBe(
        true,
      );
    }
  });

  it("requires additive successors instead of claiming predecessor completion", () => {
    expect(manifest.activation_phase).toBe("post_g3_refactor_queue");
    expect(manifest.families).toHaveLength(3);
    expect(manifest.families.every((row) => row.required_successor.includes("new additive"))).toBe(
      true,
    );
    expect(new Set(manifest.families.map((row) => row.predecessor_plan_id)).size).toBe(3);
    expect(new Set(manifest.families.map((row) => row.required_successor)).size).toBe(3);
    for (const family of manifest.families) {
      expect(
        readFileSync(`docs/plans/${family.predecessor_plan_id}.md`, "utf8"),
        family.predecessor_plan_id,
      ).toContain("status: confirmed");
    }
  });

  it("keeps L3 disposition closure separate from downstream implementation and freeze", () => {
    const plan = readFileSync("docs/plans/PLAN-L3-32-feedback-refactor-disposition.md", "utf8");
    expect(plan).toContain("status: draft");
    expect(plan).toContain("L7 refactor PLAN起票");
    expect(plan).toContain("behavior fence");
    expect(plan).toContain("G1/G3 freeze済みを意味しない");
    expect(plan).toContain("refactor実施完了を主張しない");
  });
});
