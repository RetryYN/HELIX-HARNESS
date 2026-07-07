import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  analyzePlanDescent,
  buildPlanDescentBaseline,
  loadPlanDescentBaseline,
  loadPlanDescentDocs,
  type PlanDescentBaseline,
} from "../src/lint/plan-descent";

// PLAN-L7-347 / L6 設計 plan-descent-gate.md §4 の U-PDESC-001..010 oracle (1:1)。

const EMPTY_BASELINE: PlanDescentBaseline = { recorded: null, grandfathered: [] };

const roots: string[] = [];

function makeRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "plan-descent-"));
  roots.push(root);
  mkdirSync(join(root, "docs", "plans"), { recursive: true });
  mkdirSync(join(root, "docs", "design", "harness", "L6-function-design"), { recursive: true });
  mkdirSync(join(root, "docs", "test-design", "harness"), { recursive: true });
  mkdirSync(join(root, "docs", "governance"), { recursive: true });
  writeFileSync(
    join(root, "docs", "design", "harness", "L6-function-design", "sample.md"),
    "---\nlayer: L6\nstatus: confirmed\n---\n# sample\n",
  );
  writeFileSync(
    join(root, "docs", "design", "harness", "L6-function-design", "draft-sample.md"),
    "---\nlayer: L6\nstatus: draft\n---\n# draft sample\n",
  );
  writeFileSync(
    join(root, "docs", "test-design", "harness", "L7-unit-test-design.md"),
    "# unit test design\n",
  );
  writeFileSync(
    join(root, "docs", "test-design", "harness", "L8-unit-test-design.md"),
    "# L8 unit test design\n",
  );
  return root;
}

interface PlanSpec {
  planId: string;
  kind?: string;
  status?: string;
  parentDesign?: string | null;
  pairArtifact?: string | null;
  generatesTestCode?: boolean;
  created?: string;
}

function writePlan(root: string, spec: PlanSpec): void {
  const lines = [
    "---",
    `plan_id: ${spec.planId}`,
    `kind: ${spec.kind ?? "impl"}`,
    "layer: L7",
    `status: ${spec.status ?? "draft"}`,
    `created: ${spec.created ?? "2026-07-08"}`,
  ];
  if (spec.parentDesign !== null) {
    lines.push(
      `parent_design: ${spec.parentDesign ?? "docs/design/harness/L6-function-design/sample.md"}`,
    );
  }
  if (spec.pairArtifact !== null) {
    lines.push(
      `pair_artifact: ${spec.pairArtifact ?? "docs/test-design/harness/L8-unit-test-design.md"}`,
    );
  }
  lines.push("generates:");
  lines.push(`  - artifact_path: docs/plans/${spec.planId}.md`);
  lines.push("    artifact_type: markdown_doc");
  if (spec.generatesTestCode !== false) {
    lines.push(`  - artifact_path: tests/${spec.planId}.test.ts`);
    lines.push("    artifact_type: test_code");
  }
  lines.push("---", `# ${spec.planId}`, "");
  writeFileSync(join(root, "docs", "plans", `${spec.planId}.md`), lines.join("\n"));
}

function analyze(root: string, baseline: PlanDescentBaseline = EMPTY_BASELINE) {
  return analyzePlanDescent(loadPlanDescentDocs(root), baseline);
}

afterAll(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
});

describe("plan-descent gate (U-PDESC-001..010)", () => {
  it("U-PDESC-001: L6 設計親 + test-design pair の impl PLAN は ok", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L7-900-good" });
    const result = analyze(root);
    expect(result.checked).toBe(1);
    expect(result.newViolations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("U-PDESC-002: parent_design 省略 (baseline 外) は parent_design_absent", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L7-901-absent", parentDesign: null });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("parent_design_absent");
    expect(result.ok).toBe(false);
  });

  it("U-PDESC-003: PLAN や L6 以外の doc への親付けは parent_design_not_l6_design_doc", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-L7-902-plan-parent",
      parentDesign: "docs/plans/PLAN-L7-900-good.md",
    });
    writePlan(root, { planId: "PLAN-L7-900-good" });
    const result = analyze(root);
    const bad = result.newViolations.filter((v) => v.planId === "PLAN-L7-902-plan-parent");
    expect(bad.map((v) => v.reason)).toContain("parent_design_not_l6_design_doc");
  });

  it("U-PDESC-004: baseline 記載の既存違反は grandfathered として ok を保つ", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L7-903-legacy", parentDesign: null });
    const baseline: PlanDescentBaseline = {
      recorded: "2026-07-06",
      grandfathered: ["PLAN-L7-903-legacy"],
    };
    const result = analyze(root, baseline);
    expect(result.newViolations).toEqual([]);
    expect(result.grandfathered.length).toBeGreaterThan(0);
    expect(result.ok).toBe(true);
  });

  it("U-PDESC-005: baseline 外の追加違反があれば ok=false (ratchet)", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L7-903-legacy", parentDesign: null });
    writePlan(root, { planId: "PLAN-L7-904-new", parentDesign: null });
    const baseline: PlanDescentBaseline = {
      recorded: "2026-07-06",
      grandfathered: ["PLAN-L7-903-legacy"],
    };
    const result = analyze(root, baseline);
    expect(result.newViolations.map((v) => v.planId)).toContain("PLAN-L7-904-new");
    expect(result.ok).toBe(false);
  });

  it("U-PDESC-006: design / reverse / refactor / PLAN-DISCOVERY-* は対象外", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L6-905-design", kind: "design", parentDesign: null });
    writePlan(root, { planId: "PLAN-REVERSE-906", kind: "reverse", parentDesign: null });
    writePlan(root, { planId: "PLAN-L7-907-refactor", kind: "refactor", parentDesign: null });
    writePlan(root, { planId: "PLAN-DISCOVERY-99-bottomup", kind: "impl", parentDesign: null });
    const result = analyze(root);
    expect(result.checked).toBe(0);
    expect(result.newViolations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("U-PDESC-007: pair_artifact が test-design 配下でなければ pair_artifact_not_test_design", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-L7-908-badpair",
      pairArtifact: "docs/design/harness/L6-function-design/sample.md",
    });
    const result = analyze(root);
    const bad = result.newViolations.filter((v) => v.planId === "PLAN-L7-908-badpair");
    expect(bad.map((v) => v.reason)).toContain("pair_artifact_not_test_design");
  });

  it("U-PDESC-007a: 2026-07-08 以降の L7 impl は L8 unit test design pair を必須にする", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-L7-908-l7-pair",
      pairArtifact: "docs/test-design/harness/L7-unit-test-design.md",
      created: "2026-07-08",
    });
    const result = analyze(root);
    const bad = result.newViolations.filter((v) => v.planId === "PLAN-L7-908-l7-pair");
    expect(bad.map((v) => v.reason)).toContain("pair_artifact_not_l8_unit_test_design");
  });

  it("U-PDESC-007b: 2026-07-08 より前の legacy L7 unit pair は date grandfather する", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-L7-908-legacy-l7-pair",
      pairArtifact: "docs/test-design/harness/L7-unit-test-design.md",
      created: "2026-07-07",
    });
    const result = analyze(root);
    expect(result.newViolations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("U-PDESC-008: kind=add-impl も impl と同一検査", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L7-909-addimpl", kind: "add-impl", parentDesign: null });
    const result = analyze(root);
    expect(result.checked).toBe(1);
    expect(result.newViolations.map((v) => v.reason)).toContain("parent_design_absent");
  });

  it("U-PDESC-009: confirmed impl の親 L6 doc が draft なら parent_design_not_confirmed (draft impl は対象外)", () => {
    const root = makeRepo();
    writePlan(root, {
      planId: "PLAN-L7-910-confirmed",
      status: "confirmed",
      parentDesign: "docs/design/harness/L6-function-design/draft-sample.md",
    });
    writePlan(root, {
      planId: "PLAN-L7-911-draft",
      status: "draft",
      parentDesign: "docs/design/harness/L6-function-design/draft-sample.md",
    });
    const result = analyze(root);
    const confirmed = result.newViolations.filter((v) => v.planId === "PLAN-L7-910-confirmed");
    const draft = result.newViolations.filter((v) => v.planId === "PLAN-L7-911-draft");
    expect(confirmed.map((v) => v.reason)).toContain("parent_design_not_confirmed");
    expect(draft.map((v) => v.reason)).not.toContain("parent_design_not_confirmed");
  });

  it("U-PDESC-010: generates に test_code が無い impl は generates_missing_test_code", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L7-912-notest", generatesTestCode: false });
    const result = analyze(root);
    expect(result.newViolations.map((v) => v.reason)).toContain("generates_missing_test_code");
  });

  it("baseline 機械生成: buildPlanDescentBaseline は違反 plan_id を昇順で固定し、生成後 ok になる", () => {
    const root = makeRepo();
    writePlan(root, { planId: "PLAN-L7-913-b", parentDesign: null });
    writePlan(root, { planId: "PLAN-L7-912-a", parentDesign: null });
    const docs = loadPlanDescentDocs(root);
    const baseline = buildPlanDescentBaseline(docs, "2026-07-06");
    expect(baseline.grandfathered).toEqual(["PLAN-L7-912-a", "PLAN-L7-913-b"]);
    expect(analyzePlanDescent(docs, baseline).ok).toBe(true);
  });

  it("baseline loader: 不在時は空 baseline を返す", () => {
    const root = makeRepo();
    expect(loadPlanDescentBaseline(root)).toEqual({ recorded: null, grandfathered: [] });
  });
});
