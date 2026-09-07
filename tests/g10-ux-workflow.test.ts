import { createHash } from "node:crypto";
// PLAN-RECOVERY-1430-evidence-substance
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { observeEvidenceFiles } from "../src/lint/evidence-file-substance";
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

// 合成fixtureのみ。保存済み実測manifestのdigestは変更しない。
const fixturePath = ".helix/evidence/g10-ux/20260906-browser-evidence.vitest.log";
const fixtureDigest = `sha256:${createHash("sha256").update(readFileSync(fixturePath)).digest("hex")}`;
const validManifest = {
  manifest_path: ".helix/evidence/g10-ux/test.json",
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
      command: `vitest run tests/g10-browser-evidence.test.ts --reporter=json --outputFile=${fixturePath}`,
      runner: "node",
      scope: "targeted",
      exit_code: 0,
      evidence_path: fixturePath,
      output_digest: fixtureDigest,
      item_ids: mandatory,
    },
  ],
  coverage: mandatory.map((item_id) => ({
    item_id,
    status: "passed",
    evidence_paths: [fixturePath, "tests/g10-ux-workflow.test.ts"],
    command_ids: ["cmd-g10-selected"],
    advisor_evidence: item_id.startsWith("UXV-RENDER-")
      ? `browser-render-receipt:${fixtureDigest}`
      : item_id.startsWith("UXV-A11Y-")
        ? `browser-a11y-receipt:${fixtureDigest}`
        : `completion-blocker-receipt:${fixtureDigest}`,
  })),
  exit_criteria: {
    all_mandatory_passed: true,
    failed_mandatory_count: 0,
    stale_defer_count: 0,
    doctor_check: "g10-ux-workflow",
  },
};

describe("g10-ux-workflow lint", () => {
  it("U-GES-010: 固定観測と再観測を区別し、観測欠落は拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-g10-ux-workflow-"));
    try {
      const path = ".helix/evidence/g10-ux/output.vitest.log";
      mkdirSync(join(root, ".helix/evidence/g10-ux"), { recursive: true });
      const report = JSON.stringify({
        success: true,
        numPassedTests: 1,
        numFailedTests: 0,
        testResults: [{ name: "repo://tests/g10-ux-workflow.test.ts" }],
      });
      writeFileSync(join(root, path), report);
      const manifest = structuredClone(validManifest);
      manifest.commands[0].evidence_path = path;
      manifest.commands[0].command = `vitest run tests/g10-ux-workflow.test.ts --reporter=json --outputFile=${path}`;
      manifest.commands[0].output_digest = `sha256:${createHash("sha256").update(report).digest("hex")}`;
      for (const entry of manifest.coverage) {
        entry.evidence_paths = [path];
        const prefix = entry.item_id.startsWith("UXV-RENDER-")
          ? "browser-render-receipt:"
          : entry.item_id.startsWith("UXV-A11Y-")
            ? "browser-a11y-receipt:"
            : "completion-blocker-receipt:";
        entry.advisor_evidence = `${prefix}${manifest.commands[0].output_digest}`;
      }
      const input = {
        repoRoot: root,
        evidenceObservations: observeEvidenceFiles(root, [path]),
        l10VisualDesign: `${workflowBlock}\n${uxvRows}`,
        gatesMd: gateBlock,
        evidenceManifests: [manifest],
      };
      const before = analyzeG10UxWorkflow(input);
      expect(before.ok).toBe(true);
      writeFileSync(join(root, path), "changed");
      expect(analyzeG10UxWorkflow(input)).toEqual(before);
      const refreshed = analyzeG10UxWorkflow({
        ...input,
        evidenceObservations: observeEvidenceFiles(root, [path]),
      });
      expect(refreshed.ok).toBe(false);
      expect(refreshed.violations.join("\n")).toContain(
        "output_digest does not match evidence bytes",
      );
      expect(analyzeG10UxWorkflow({ ...input, evidenceObservations: {} }).ok).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("fails without workflow markers and manifests", () => {
    const result = analyzeG10UxWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations: observeEvidenceFiles(process.cwd(), [
        fixturePath,
        "tests/g10-ux-workflow.test.ts",
      ]),
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
      evidenceObservations: observeEvidenceFiles(process.cwd(), [
        fixturePath,
        "tests/g10-ux-workflow.test.ts",
      ]),
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

  it("実browser/a11y receiptを否定するadvisor文でmandatory passにしない", () => {
    const manifest = structuredClone(validManifest);
    manifest.coverage[0].advisor_evidence = "not a real browser render receipt";
    manifest.coverage[1].advisor_evidence = "not a browser accessibility receipt";
    const result = analyzeG10UxWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations: observeEvidenceFiles(process.cwd(), [
        fixturePath,
        "tests/g10-ux-workflow.test.ts",
      ]),
      l10VisualDesign: `${workflowBlock}\n${uxvRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [manifest],
    });
    expect(result.ok).toBe(false);
    expect(result.violations.join("\n")).toContain("requires browser-render-receipt:");
    expect(result.violations.join("\n")).toContain("requires browser-a11y-receipt:");
  });

  it("passes when G10 UXV coverage and advisor evidence are present", () => {
    const result = analyzeG10UxWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations: observeEvidenceFiles(process.cwd(), [
        fixturePath,
        "tests/g10-ux-workflow.test.ts",
      ]),
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
