import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Binding = {
  test_path: string;
  test_file_sha256: string;
  expected_catalog_case_count: number;
  semantic_authority_paths: string[];
  activation_phase: string;
  required_closure: string;
};

const manifest = JSON.parse(
  readFileSync("docs/governance/feedback-test-owner-disposition-direct.json", "utf8"),
) as {
  schema_version: string;
  issue_id: number;
  disposition_plan_id: string;
  disposition: string;
  bindings: Binding[];
};

function digest(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function caseCount(text: string): number {
  return [...text.matchAll(/\b(?:it|test)\s*\(\s*["'`]([^"'`]+)["'`]/g)].length;
}

describe("PLAN-L3-30 direct test owner disposition", () => {
  it("pins three unique files and the 27-case denominator", () => {
    expect(manifest.schema_version).toBe("feedback-test-owner-disposition.v1");
    expect(manifest.issue_id).toBe(74);
    expect(manifest.disposition).toBe("successor_backprop");
    expect(manifest.bindings).toHaveLength(3);
    expect(new Set(manifest.bindings.map((row) => row.test_path)).size).toBe(3);
    expect(manifest.bindings.reduce((sum, row) => sum + row.expected_catalog_case_count, 0)).toBe(
      27,
    );
  });

  it("matches current bytes, case counts, and direct authority paths", () => {
    for (const row of manifest.bindings) {
      const source = readFileSync(row.test_path, "utf8");
      expect(digest(source), row.test_path).toBe(row.test_file_sha256);
      expect(caseCount(source), row.test_path).toBe(row.expected_catalog_case_count);
      for (const authorityPath of row.semantic_authority_paths) {
        expect(readFileSync(authorityPath, "utf8").length, authorityPath).toBeGreaterThan(0);
      }
    }
  });

  it("routes only the headless integration case through L4/L9", () => {
    const integration = manifest.bindings.filter(
      (row) => row.activation_phase === "post_g3_l4_l9_pair_closure",
    );
    const detail = manifest.bindings.filter(
      (row) => row.activation_phase === "post_g3_pre_l6_canonicalization",
    );
    expect(integration.map((row) => row.test_path)).toEqual([
      "tests/slow/source-boundary-headless.test.ts",
    ]);
    expect(integration[0]?.required_closure).toContain("L4/L9 integration ownership");
    expect(detail.reduce((sum, row) => sum + row.expected_catalog_case_count, 0)).toBe(26);
    expect(detail.every((row) => row.required_closure.includes("L5/L8 oracle backprop"))).toBe(
      true,
    );
  });
});
