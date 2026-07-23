import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Binding = {
  test_path: string;
  test_file_sha256: string;
  expected_case_count: number;
  semantic_predecessor_plan_id: string;
  required_closure: string;
};

const manifest = JSON.parse(
  readFileSync("docs/governance/feedback-test-owner-disposition-closure.json", "utf8"),
) as {
  schema_version: string;
  issue_id: number;
  disposition_plan_id: string;
  disposition: string;
  activation_phase: string;
  bindings: Binding[];
};

function digest(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function testCaseCount(text: string): number {
  return [...text.matchAll(/\b(?:it|test)\s*\(\s*["'`]([^"'`]+)["'`]/g)].length;
}

describe("PLAN-L3-28 closure test owner disposition", () => {
  it("binds six unique files to one non-implemented successor disposition", () => {
    expect(manifest.schema_version).toBe("feedback-test-owner-disposition.v1");
    expect(manifest.issue_id).toBe(74);
    expect(manifest.disposition_plan_id).toBe("PLAN-L3-28-feedback-test-owner-closure-disposition");
    expect(manifest.disposition).toBe("successor_backprop");
    expect(manifest.activation_phase).toBe("post_g3_pre_l6_canonicalization");
    expect(manifest.bindings).toHaveLength(6);
    expect(new Set(manifest.bindings.map((row) => row.test_path)).size).toBe(6);
  });

  it("pins every source digest and case denominator", () => {
    for (const row of manifest.bindings) {
      const text = readFileSync(row.test_path, "utf8");
      expect(digest(text), row.test_path).toBe(row.test_file_sha256);
      expect(testCaseCount(text), row.test_path).toBe(row.expected_case_count);
      expect(row.semantic_predecessor_plan_id).toMatch(/^PLAN-L7-43[45]-/);
      expect(row.required_closure).toContain("L5/L8 oracle backprop");
      expect(row.required_closure).toContain("L6/L7 test ownership binding");
    }
    expect(manifest.bindings.reduce((sum, row) => sum + row.expected_case_count, 0)).toBe(21);
  });

  it("does not mutate predecessor PLAN or claim implemented closure", () => {
    const plan = readFileSync(
      "docs/plans/PLAN-L3-28-feedback-test-owner-closure-disposition.md",
      "utf8",
    );
    expect(plan).toContain("status: draft");
    expect(plan).toContain("空`plan_id`が0になった時点で本PLANを完了");
    expect(plan).not.toContain("status: completed");
  });
});
