import { createHash } from "node:crypto";
// PLAN-RECOVERY-1430-evidence-substance
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { observeEvidenceFiles } from "../src/lint/evidence-file-substance";
import {
  analyzeG8IntegrationWorkflow,
  g8IntegrationWorkflowMessages,
  loadG8IntegrationWorkflowInput,
} from "../src/lint/g8-integration-workflow";

const workflowBlock = [
  "## G8-WORKFLOW",
  "test_strategy: risk-based integration verification tied to L5 contracts.",
  "test_plan: select IT cases by changed boundary and required quality signal.",
  "test_conditions: each selected IT case has Given/When/Then and boundary fixture.",
  "coverage_items: IT-* coverage is mapped to module, state, adapter, asset, and DB boundaries.",
  "test_procedures: run the mapped vitest/doctor/profile commands and capture exit codes.",
  "execution_evidence: integration evidence manifest records command, IT IDs, paths, and result.",
  "exit_criteria: all mandatory selected IT cases pass or explicit defer exists.",
  "defect_routing: failed IT cases route to L8 correction, Reverse, Refactor, or Incident by scope.",
].join("\n");

const gateBlock = [
  "G8-WORKFLOW",
  "integration evidence manifest",
  "IT-* coverage",
  "exit blocks",
].join("\n");

const itRows = Array.from(
  { length: 10 },
  (_, i) => `| IT-MODULE-${String(i + 1).padStart(2, "0")} | Given | When | Then |`,
).join("\n");

// 合成fixtureのみ。保存済み実測manifestのdigestは変更しない。
const fixturePath = ".helix/evidence/g8-integration/20260906-module-state-evidence.vitest.log";
const fixtureDigest = `sha256:${createHash("sha256").update(readFileSync(fixturePath)).digest("hex")}`;
const assetFixturePath =
  ".helix/evidence/g8-integration/20260906-adapter-asset-evidence.vitest.log";
const assetFixtureDigest = `sha256:${createHash("sha256").update(readFileSync(assetFixturePath)).digest("hex")}`;
const validManifest = {
  manifest_path: ".helix/evidence/g8-integration/test.json",
  schema_version: "g8-integration-evidence-v1",
  gate: "G8",
  profile: "it-module-state-minimum",
  plan_id: "PLAN-L7-169-g8-integration-evidence-manifest",
  selected_it_ids: ["IT-MODULE-01", "IT-MODULE-02", "IT-STATE-01", "IT-STATE-02"],
  mandatory_it_ids: ["IT-MODULE-01", "IT-MODULE-02", "IT-STATE-01", "IT-STATE-02"],
  deferred_it_ids: [],
  commands: [
    {
      command_id: "cmd-module-state-targeted",
      command: `vitest run tests/dependency-drift.test.ts tests/lint-wiring.test.ts tests/agent-slots.test.ts tests/workflow-contracts.test.ts --reporter=json --outputFile=${fixturePath}`,
      runner: "node",
      scope: "targeted",
      exit_code: 0,
      evidence_path: fixturePath,
      output_digest: fixtureDigest,
      it_ids: ["IT-MODULE-01", "IT-MODULE-02", "IT-STATE-01", "IT-STATE-02"],
    },
  ],
  coverage: [
    {
      it_id: "IT-MODULE-01",
      status: "passed",
      evidence_paths: ["tests/dependency-drift.test.ts"],
      command_ids: ["cmd-module-state-targeted"],
    },
    {
      it_id: "IT-MODULE-02",
      status: "passed",
      evidence_paths: ["tests/lint-wiring.test.ts"],
      command_ids: ["cmd-module-state-targeted"],
    },
    {
      it_id: "IT-STATE-01",
      status: "passed",
      evidence_paths: ["tests/agent-slots.test.ts"],
      command_ids: ["cmd-module-state-targeted"],
    },
    {
      it_id: "IT-STATE-02",
      status: "passed",
      evidence_paths: ["tests/workflow-contracts.test.ts"],
      command_ids: ["cmd-module-state-targeted"],
    },
  ],
  exit_criteria: {
    all_mandatory_passed: true,
    failed_mandatory_count: 0,
    stale_defer_count: 0,
    doctor_check: "g8-integration-workflow",
  },
};

const assetManifest = {
  manifest_path: ".helix/evidence/g8-integration/asset.json",
  schema_version: "g8-integration-evidence-v1",
  gate: "G8",
  profile: "it-asset-expansion",
  plan_id: "PLAN-L7-171-g8-adapter-asset-evidence",
  selected_it_ids: ["IT-ASSET-05", "IT-ASSET-06"],
  mandatory_it_ids: ["IT-ASSET-05", "IT-ASSET-06"],
  deferred_it_ids: [],
  commands: [
    {
      command_id: "cmd-asset-targeted",
      command: `vitest run tests/skill-recommend.test.ts tests/asset-drift.test.ts --reporter=json --outputFile=${assetFixturePath}`,
      runner: "node",
      scope: "targeted",
      exit_code: 0,
      evidence_path: assetFixturePath,
      output_digest: assetFixtureDigest,
      it_ids: ["IT-ASSET-05", "IT-ASSET-06"],
    },
  ],
  coverage: [
    {
      it_id: "IT-ASSET-05",
      status: "passed",
      evidence_paths: ["tests/skill-recommend.test.ts"],
      command_ids: ["cmd-asset-targeted"],
    },
    {
      it_id: "IT-ASSET-06",
      status: "passed",
      evidence_paths: ["tests/asset-drift.test.ts"],
      command_ids: ["cmd-asset-targeted"],
    },
  ],
  exit_criteria: {
    all_mandatory_passed: true,
    failed_mandatory_count: 0,
    stale_defer_count: 0,
    doctor_check: "g8-integration-workflow",
  },
};

const evidenceObservations = observeEvidenceFiles(process.cwd(), [
  fixturePath,
  assetFixturePath,
  ...[validManifest, assetManifest].flatMap((manifest) =>
    manifest.coverage.flatMap((entry) => entry.evidence_paths),
  ),
]);

describe("g8-integration-workflow lint", () => {
  it("U-GES-011: 必須項目が空のmanifestを他manifestの必須familyで補えない", () => {
    const result = analyzeG8IntegrationWorkflow({
      evidenceObservations,
      l8TestDesign: `${workflowBlock}\n${itRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [validManifest, { ...assetManifest, mandatory_it_ids: [] }],
    });
    expect(result.violations).toContain(
      `${assetManifest.manifest_path}: mandatory_it_ids must not be empty`,
    );
  });
  it("U-GES-008: 固定観測では判定が安定し、再観測時に改変を拒否する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-g8-observation-"));
    try {
      const path = ".helix/evidence/g8-integration/output.vitest.log";
      mkdirSync(join(root, ".helix/evidence/g8-integration"), { recursive: true });
      const report = JSON.stringify({
        success: true,
        numPassedTests: 1,
        numFailedTests: 0,
        testResults: [{ name: "repo://tests/g8-integration-workflow.test.ts" }],
      });
      writeFileSync(join(root, path), report);
      const manifest = structuredClone(validManifest);
      manifest.commands[0].evidence_path = path;
      manifest.commands[0].command = `vitest run tests/g8-integration-workflow.test.ts --reporter=json --outputFile=${path}`;
      manifest.commands[0].output_digest = `sha256:${createHash("sha256").update(report).digest("hex")}`;
      for (const entry of manifest.coverage) entry.evidence_paths = [path];
      const input = {
        repoRoot: root,
        evidenceObservations: observeEvidenceFiles(root, [path]),
        l8TestDesign: `${workflowBlock}\n${itRows}`,
        gatesMd: gateBlock,
        evidenceManifests: [manifest],
      };
      const before = analyzeG8IntegrationWorkflow(input);
      expect(before.ok).toBe(true);
      writeFileSync(join(root, path), "changed");
      expect(analyzeG8IntegrationWorkflow(input)).toEqual(before);
      const refreshed = analyzeG8IntegrationWorkflow({
        ...input,
        evidenceObservations: observeEvidenceFiles(root, [path]),
      });
      expect(refreshed.ok).toBe(false);
      expect(refreshed.violations).toContain(
        `${manifest.manifest_path}: command cmd-module-state-targeted output_digest does not match evidence bytes`,
      );
      expect(analyzeG8IntegrationWorkflow({ ...input, evidenceObservations: {} }).ok).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
  it("U-GES-006: G8 coverageは対象IT不一致とcommand ID重複を拒否する", () => {
    const manifest = structuredClone(validManifest);
    manifest.commands[0].it_ids = ["IT-OTHER-01"];
    const result = analyzeG8IntegrationWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations,
      l8TestDesign: `${workflowBlock}\n${itRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [manifest],
    });
    expect(result.ok).toBe(false);
    expect(result.violations).toContain(
      `${manifest.manifest_path}: coverage IT-MODULE-01 references command cmd-module-state-targeted without matching item`,
    );
    manifest.commands[0].it_ids = [...validManifest.commands[0].it_ids];
    manifest.commands.push({ ...manifest.commands[0], it_ids: ["IT-OTHER-01"] });
    const duplicate = analyzeG8IntegrationWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations,
      l8TestDesign: `${workflowBlock}\n${itRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [manifest],
    });
    expect(duplicate.ok).toBe(false);
    expect(duplicate.violations).toContain(`${manifest.manifest_path}: duplicate command_id`);
    manifest.commands.pop();
    manifest.coverage[0].status = "failed";
    const falseSummary = analyzeG8IntegrationWorkflow({
      evidenceObservations,
      l8TestDesign: `${workflowBlock}\n${itRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [manifest],
    });
    expect(falseSummary.violations).toContain(
      `${manifest.manifest_path}: exit_criteria.all_mandatory_passed disagrees with coverage`,
    );
    expect(falseSummary.violations).toContain(
      `${manifest.manifest_path}: exit_criteria.failed_mandatory_count disagrees with coverage`,
    );
    manifest.coverage[0].status = "passed";
    manifest.coverage.unshift({ ...manifest.coverage[0], status: "failed" });
    const duplicateCoverage = analyzeG8IntegrationWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations,
      l8TestDesign: `${workflowBlock}\n${itRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [manifest],
    });
    expect(duplicateCoverage.ok).toBe(false);
    expect(duplicateCoverage.violations).toContain(
      `${manifest.manifest_path}: duplicate coverage it_id`,
    );
  });
  it("fails when L8 has IT rows but no executable G8 workflow granularity", () => {
    const result = analyzeG8IntegrationWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations,
      l8TestDesign: itRows,
      gatesMd: "G8 remains concept-only.",
      evidenceManifests: [],
    });

    expect(result.ok).toBe(false);
    expect(result.missingWorkflowMarkers).toContain("test_strategy");
    expect(result.missingGateMarkers).toContain("integration evidence manifest");
    expect(g8IntegrationWorkflowMessages(result)[0]).toContain("violation");
  });

  it("fails when workflow markers exist but the integration evidence manifest is missing", () => {
    const result = analyzeG8IntegrationWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations,
      l8TestDesign: `${workflowBlock}\n${itRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContain(
      "G8 integration evidence manifest is missing under .helix/evidence/g8-integration",
    );
  });

  it("fails when mandatory IT coverage is not passed", () => {
    const result = analyzeG8IntegrationWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations,
      l8TestDesign: `${workflowBlock}\n${itRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [
        {
          ...validManifest,
          coverage: validManifest.coverage.map((entry) =>
            entry.it_id === "IT-STATE-02" ? { ...entry, status: "failed" } : entry,
          ),
          exit_criteria: {
            ...validManifest.exit_criteria,
            all_mandatory_passed: false,
            failed_mandatory_count: 1,
          },
        },
      ],
    });

    expect(result.ok).toBe(false);
    expect(result.violations.join("\n")).toContain("mandatory coverage IT-STATE-02 is not passed");
  });

  it("passes when L8 workflow, G8 gate markers, and IT evidence manifest are explicit", () => {
    const result = analyzeG8IntegrationWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations,
      l8TestDesign: `${workflowBlock}\n${itRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [validManifest],
    });

    expect(result.ok).toBe(true);
    expect(result.itCaseCount).toBe(10);
    expect(result.manifestCount).toBe(1);
    expect(result.selectedItCount).toBe(4);
    expect(g8IntegrationWorkflowMessages(result)[0]).toContain("OK");
  });

  it("passes when required IT families are satisfied across split manifests", () => {
    const result = analyzeG8IntegrationWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations,
      l8TestDesign: `${workflowBlock}\n${itRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [validManifest, assetManifest],
    });

    expect(result.ok).toBe(true);
    expect(result.manifestCount).toBe(2);
    expect(result.selectedItCount).toBe(6);
    expect(result.mandatoryItCount).toBe(6);
  });

  it("fails when required IT families are missing across all manifests", () => {
    const result = analyzeG8IntegrationWorkflow({
      repoRoot: process.cwd(),
      evidenceObservations,
      l8TestDesign: `${workflowBlock}\n${itRows}`,
      gatesMd: gateBlock,
      evidenceManifests: [assetManifest],
    });

    expect(result.ok).toBe(false);
    expect(result.violations).toContain("G8 selected IT coverage missing IT-MODULE- family");
    expect(result.violations).toContain("G8 mandatory IT coverage missing IT-STATE- family");
  });

  it("live repo keeps the G8 workflow contract present", () => {
    const result = analyzeG8IntegrationWorkflow(loadG8IntegrationWorkflowInput());

    expect(result.ok).toBe(true);
    expect(result.itCaseCount).toBeGreaterThanOrEqual(10);
  });
});
