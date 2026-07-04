import { describe, expect, it } from "vitest";
import {
  analyzeG9SystemWorkflow,
  g9SystemWorkflowMessages,
  loadG9SystemWorkflowInput,
} from "../src/lint/g9-system-workflow";

const workflowBlock = [
  "## G9-WORKFLOW",
  "system_test_strategy: L4 system contract と right-arm evidence profile を結び、selected system behavior を検査する。",
  "system_test_plan: ST family ごとに mandatory item と regression command を選ぶ。",
  "system_test_conditions: ST-* rows は L4 design / process / adapter / UI 境界と対応する。",
  "system_coverage_items: ST-DATA / ST-ARCH / ST-FUNC / ST-EXT / ST-UI / ST-ASSET を最低 family とする。",
  "system_test_procedures: mapped command を実行し、exit code と digest を manifest に記録する。",
  "system_execution_evidence: g9-system-evidence-v1 manifest が command、ST item、path、result を持つ。",
  "system_exit_criteria: mandatory ST は全 pass、stale defer は 0。",
  "system_defect_routing: failure は L9 修正、Reverse、Refactor、Incident へ route する。",
].join("\n");

const gateBlock = "G9 ST-* evidence roadmap span coverage regression routing";
const stRows = [
  "ST-DATA-01",
  "ST-ARCH-01",
  "ST-FUNC-01",
  "ST-EXT-01",
  "ST-UI-01",
  "ST-ASSET-01",
  "ST-DATA-02",
  "ST-ARCH-02",
  "ST-FUNC-02",
  "ST-UI-02",
].join("\n");

const validManifest = {
  manifest_path: ".ut-tdd/evidence/g9-system/test.json",
  schema_version: "g9-system-evidence-v1",
  gate: "G9",
  profile: "system-selected-regression",
  plan_id: "PLAN-L7-313-g9-g10-workflow-gate",
  selected_item_ids: ["ST-DATA-01", "ST-ARCH-01", "ST-FUNC-01", "ST-EXT-01", "ST-UI-01", "ST-ASSET-01"],
  mandatory_item_ids: ["ST-DATA-01", "ST-ARCH-01", "ST-FUNC-01", "ST-EXT-01", "ST-UI-01", "ST-ASSET-01"],
  deferred_item_ids: [],
  commands: [
    {
      command_id: "cmd-g9-selected",
      command: "bun test tests/g9-system-workflow.test.ts --timeout 180000",
      runner: "bun",
      scope: "targeted",
      exit_code: 0,
      evidence_path: "tests/g9-system-workflow.test.ts",
      output_digest: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      item_ids: ["ST-DATA-01", "ST-ARCH-01", "ST-FUNC-01", "ST-EXT-01", "ST-UI-01", "ST-ASSET-01"],
    },
  ],
  coverage: ["ST-DATA-01", "ST-ARCH-01", "ST-FUNC-01", "ST-EXT-01", "ST-UI-01", "ST-ASSET-01"].map((item_id) => ({
    item_id,
    status: "passed",
    evidence_paths: ["tests/g9-system-workflow.test.ts"],
    command_ids: ["cmd-g9-selected"],
  })),
  exit_criteria: {
    all_mandatory_passed: true,
    failed_mandatory_count: 0,
    stale_defer_count: 0,
    doctor_check: "g9-system-workflow",
  },
};

describe("g9-system-workflow lint", () => {
  it("fails without workflow markers and manifests", () => {
    const result = analyzeG9SystemWorkflow({
      repoRoot: process.cwd(),
      l9TestDesign: stRows,
      l9Boundary: "L9 boundary",
      gatesMd: "G9 concept",
      evidenceManifests: [],
    });

    expect(result.ok).toBe(false);
    expect(result.missingWorkflowMarkers).toContain("system_test_strategy");
    expect(g9SystemWorkflowMessages(result)[0]).toContain("violation");
  });

  it("fails when mandatory coverage is not passed", () => {
    const result = analyzeG9SystemWorkflow({
      repoRoot: process.cwd(),
      l9TestDesign: `${workflowBlock}\n${stRows}`,
      l9Boundary: workflowBlock,
      gatesMd: gateBlock,
      evidenceManifests: [
        {
          ...validManifest,
          coverage: validManifest.coverage.map((entry) =>
            entry.item_id === "ST-UI-01" ? { ...entry, status: "failed" } : entry,
          ),
          exit_criteria: { ...validManifest.exit_criteria, all_mandatory_passed: false, failed_mandatory_count: 1 },
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations.join("\n")).toContain("mandatory coverage ST-UI-01 is not passed");
  });

  it("passes when G9 markers and mandatory ST families are covered", () => {
    const result = analyzeG9SystemWorkflow({
      repoRoot: process.cwd(),
      l9TestDesign: `${workflowBlock}\n${stRows}`,
      l9Boundary: workflowBlock,
      gatesMd: gateBlock,
      evidenceManifests: [validManifest],
    });

    expect(result.ok).toBe(true);
    expect(result.selectedItemCount).toBe(6);
    expect(result.mandatoryItemCount).toBe(6);
  });

  it("live repo keeps the G9 workflow contract present", () => {
    const result = analyzeG9SystemWorkflow(loadG9SystemWorkflowInput());

    expect(result.ok).toBe(true);
    expect(result.stCaseCount).toBeGreaterThanOrEqual(10);
  });
});
