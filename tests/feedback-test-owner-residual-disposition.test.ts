import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { scanL12HybridRecognitionCandidates } from "../src/lint/l12-hybrid-recognition";

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
    const plan = readFileSync(
      "docs/plans/PLAN-L3-31-feedback-test-owner-residual-disposition.md",
      "utf8",
    );
    expect(plan).toContain("2つの独立workstream");
    expect(plan).toContain("GitHub追加要件の残5責務へ混在させない");
  });

  it("does not self-register the authority manifest as a recognition-risk candidate", () => {
    expect(scanL12HybridRecognitionCandidates().map((candidate) => candidate.path)).not.toContain(
      "docs/governance/feedback-test-owner-disposition-residual.json",
    );
  });

  it("binds confirmed closure to the independent same-HEAD receipt without closing downstream work", () => {
    const plan = readFileSync(
      "docs/plans/PLAN-L3-31-feedback-test-owner-residual-disposition.md",
      "utf8",
    );
    expect(plan).toContain("status: confirmed");
    expect(plan).toContain("3a79000a54aed5f848487b6ca9c1c695f46fc26e");
    expect(plan).toContain("pull/104#issuecomment-5055992216");
    expect(plan).toContain("rows=48310");
    expect(plan).toContain("L4/L9・L5/L8 pair");
    expect(plan).toContain("requirements G1/G3 freeze");
  });
});
