import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Binding = {
  test_path: string;
  test_file_sha256: string;
  expected_case_count: number;
  authority_paths: string[];
  required_closure: string;
};

const manifest = JSON.parse(
  readFileSync("docs/governance/feedback-test-owner-disposition-residual.json", "utf8"),
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

function caseCount(text: string): number {
  return [...text.matchAll(/\b(?:it|test)\s*\(\s*["'`]([^"'`]+)["'`]/g)].length;
}

describe("PLAN-L3-31 residual test owner disposition", () => {
  it("pins nine unique files and the 35-case denominator", () => {
    expect(manifest.schema_version).toBe("feedback-test-owner-disposition.v1");
    expect(manifest.issue_id).toBe(74);
    expect(manifest.disposition).toBe("successor_backprop");
    expect(manifest.bindings).toHaveLength(9);
    expect(new Set(manifest.bindings.map((row) => row.test_path)).size).toBe(9);
    expect(manifest.bindings.reduce((sum, row) => sum + row.expected_case_count, 0)).toBe(35);
  });

  it("matches every current digest, case count, and authority path", () => {
    for (const row of manifest.bindings) {
      const source = readFileSync(row.test_path, "utf8");
      expect(digest(source), row.test_path).toBe(row.test_file_sha256);
      expect(caseCount(source), row.test_path).toBe(row.expected_case_count);
      expect(row.authority_paths.length).toBeGreaterThan(0);
      for (const authorityPath of row.authority_paths) {
        expect(readFileSync(authorityPath, "utf8").length, authorityPath).toBeGreaterThan(0);
      }
    }
  });

  it("routes all rows to explicit post-G3 closure", () => {
    expect(manifest.activation_phase).toBe("post_g3_pre_l6_canonicalization");
    expect(
      manifest.bindings.every(
        (row) => row.required_closure.includes("L4/L9") || row.required_closure.includes("L5/L8"),
      ),
    ).toBe(true);
    expect(
      manifest.bindings
        .filter((row) => /ai-vision|universal-workflow/.test(row.test_path))
        .reduce((sum, row) => sum + row.expected_case_count, 0),
    ).toBe(12);
  });
});
