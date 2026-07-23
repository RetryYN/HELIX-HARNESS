import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const manifest = JSON.parse(
  readFileSync("docs/governance/feedback-test-owner-disposition-recognition.json", "utf8"),
) as {
  schema_version: string;
  issue_id: number;
  disposition_plan_id: string;
  disposition: string;
  activation_phase: string;
  bindings: Array<{
    test_path: string;
    test_file_sha256: string;
    expected_catalog_case_count: number;
    semantic_source_path: string;
    semantic_source_sha256: string;
    semantic_predecessor_plan_id: string;
    rejected_cochange_candidate_plan_id: string;
    required_closure: string;
  }>;
};

function digest(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function binding() {
  const row = manifest.bindings[0];
  if (!row) throw new Error("recognition disposition binding is missing");
  return row;
}

describe("PLAN-L3-29 recognition test owner disposition", () => {
  it("pins one successor disposition and current source bytes", () => {
    expect(manifest.schema_version).toBe("feedback-test-owner-disposition.v1");
    expect(manifest.issue_id).toBe(74);
    expect(manifest.disposition).toBe("successor_backprop");
    expect(manifest.bindings).toHaveLength(1);
    const row = binding();
    const testSource = readFileSync(row.test_path, "utf8");
    const semanticSource = readFileSync(row.semantic_source_path, "utf8");
    expect(digest(testSource)).toBe(row.test_file_sha256);
    expect(digest(semanticSource)).toBe(row.semantic_source_sha256);
    expect([...testSource.matchAll(/\b(?:it|test)\s*\(\s*["'`]([^"'`]+)["'`]/g)]).toHaveLength(
      row.expected_catalog_case_count,
    );
  });

  it("selects the source-generating L3 predecessor and rejects co-change ownership", () => {
    const row = binding();
    const predecessor = readFileSync("docs/plans/PLAN-L3-13-vmodel-docgen-fit.md", "utf8");
    const rejected = readFileSync("docs/plans/PLAN-L7-461-requirements-doc-registry.md", "utf8");
    expect(row.semantic_predecessor_plan_id).toBe("PLAN-L3-13-vmodel-docgen-fit");
    expect(predecessor).toContain(`artifact_path: ${row.semantic_source_path}`);
    expect(row.rejected_cochange_candidate_plan_id).toBe("PLAN-L7-461-requirements-doc-registry");
    expect(rejected).not.toContain(`artifact_path: ${row.semantic_source_path}`);
    expect(row.required_closure).toContain("L5/L8 recognition oracle");
    expect(row.required_closure).toContain("L6/L7 test ownership binding");
  });
});
