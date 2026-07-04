import { describe, expect, it } from "vitest";
import {
  analyzeG10UxWorkflow,
  g10UxWorkflowMessages,
  loadG10UxWorkflowInput,
} from "../src/lint/g10-ux-workflow";

const workflowBlock = [
  "## G10-WORKFLOW",
  "ux_test_strategy: L2 mock と実装済み UI の差分を実データで検証する。",
  "ux_test_plan: render / screenshot / a11y / blocker 表示の UXV item を選ぶ。",
  "ux_test_conditions: UXV-* rows は real-data render、screenshot、a11y evidence、frontend coverage に対応する。",
  "ux_coverage_items: UXV-RENDER / UXV-A11Y / UXV-BLOCKER を最低 family とする。",
  "ux_test_procedures: browser profile または read-model smoke を実行し、advisor-fable evidence を紐付ける。",
  "ux_execution_evidence: g10-ux-evidence-v1 manifest が command、UXV item、path、advisor evidence を持つ。",
  "ux_exit_criteria: mandatory UXV は全 pass、stale defer は 0。",
  "ux_defect_routing: failure は L10 修正、L2/L4/L6 backprop、または PO decision へ route する。",
].join("\n");

const gateBlock = "G10 real-data render screenshot a11y evidence frontend coverage";
const uxvRows = "UXV-RENDER-01\nUXV-A11Y-01\nUXV-BLOCKER-01";
const mandatory = ["UXV-RENDER-01", "UXV-A11Y-01", "UXV-BLOCKER-01"];

const validManifest = {
  manifest_path: ".ut-tdd/evidence/g10-ux/test.json",
  schema_version: "g10-ux-evidence-v1",
  gate: "G10",
  profile: "ux-boundary-read-model",
  plan_id: "PLAN-L7-313-g9-g10-workflow-gate",
  selected_item_ids: mandatory,
  mandatory_item_ids: mandatory,
  deferred_item_ids: [],
  commands: [
    {
      command_id: "cmd-g10-selected",
      command: "bun test tests/g10-ux-workflow.test.ts --timeout 180000",
      runner: "bun",
      scope: "targeted",
      exit_code: 0,
      evidence_path: "tests/g10-ux-workflow.test.ts",
      output_digest: "sha256:1111111111111111111111111111111111111111111111111111111111111111",
      item_ids: mandatory,
    },
  ],
  coverage: mandatory.map((item_id) => ({
    item_id,
    status: "passed",
    evidence_paths: ["tests/g10-ux-workflow.test.ts"],
    command_ids: ["cmd-g10-selected"],
    advisor_evidence: "advisor-fable:ux-boundary-read-model",
  })),
  exit_criteria: {
    all_mandatory_passed: true,
    failed_mandatory_count: 0,
    stale_defer_count: 0,
    doctor_check: "g10-ux-workflow",
  },
};

describe("g10-ux-workflow lint", () => {
  it("fails without workflow markers and manifests", () => {
    const result = analyzeG10UxWorkflow({
      repoRoot: process.cwd(),
      l10VisualDesign: uxvRows,
      gatesMd: "G10 concept",
      evidenceManifests: [],
    });

    expect(result.ok).toBe(false);
    expect(result.missingWorkflowMarkers).toContain("ux_test_strategy");
    expect(g10UxWorkflowMessages(result)[0]).toContain("violation");
  });

  it("fails when advisor-fable evidence is missing", () => {
    const result = analyzeG10UxWorkflow({
      repoRoot: process.cwd(),
      l10VisualDesign: `${workflowBlock}\n${uxvRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [
        {
          ...validManifest,
          coverage: validManifest.coverage.map(({ advisor_evidence, ...entry }) => entry),
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations.join("\n")).toContain("requires advisor_evidence");
  });

  it("passes when G10 UXV coverage and advisor evidence are present", () => {
    const result = analyzeG10UxWorkflow({
      repoRoot: process.cwd(),
      l10VisualDesign: `${workflowBlock}\n${uxvRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [validManifest],
    });

    expect(result.ok).toBe(true);
    expect(result.selectedItemCount).toBe(3);
    expect(result.mandatoryItemCount).toBe(3);
  });

  it("live repo keeps the G10 workflow contract present", () => {
    const result = analyzeG10UxWorkflow(loadG10UxWorkflowInput());

    expect(result.ok).toBe(true);
    expect(result.uxvCaseCount).toBeGreaterThanOrEqual(3);
  });
});
