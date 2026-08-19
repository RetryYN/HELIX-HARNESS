import { describe, expect, it } from "vitest";
import {
  auditWorkflowClassificationTerminalFullback,
  type WorkflowClassificationTerminalFullbackEvidence,
} from "../src/lint/workflow-classification-terminal-fullback";
import { loadWorkflowClassificationCatalog } from "../src/schema/workflow-classification-catalog";
import { loadWorkflowClassificationRegistry } from "../src/schema/workflow-classification-registry";

const SHA = "a".repeat(40);
const MAIN_SHA = "b".repeat(40);
const DIGEST = `sha256:${"c".repeat(64)}`;

function validEvidence(): WorkflowClassificationTerminalFullbackEvidence {
  const registry = loadWorkflowClassificationRegistry();
  const catalog = loadWorkflowClassificationCatalog();
  return {
    issueNumber: 694,
    authority: {
      requirements: {
        version: registry.requirements_version,
        sourceDigest: registry.authority.source_digest,
      },
      registry: {
        version: registry.registry_version,
        requirementsVersion: registry.requirements_version,
        sourceDigest: catalog.source_registry.registry_source_digest,
        requirementsSourceDigest: registry.authority.source_digest,
      },
      catalog: {
        registryVersion: catalog.source_registry.registry_version,
        requirementsVersion: catalog.source_registry.requirements_version,
        registrySourceDigest: catalog.source_registry.registry_source_digest,
        requirementsSourceDigest: catalog.source_registry.requirements_source_digest,
      },
      consumers: [
        {
          name: "typed-runtime",
          registryVersion: catalog.source_registry.registry_version,
          registrySourceDigest: catalog.source_registry.registry_source_digest,
          targetAxis: "workflow_model",
          targetId: "REVERSE",
          legacyIdentityEmitted: false,
        },
      ],
    },
    forwardSlices: [
      {
        sliceId: "PLAN-L7-561",
        merged: true,
        headSha: SHA,
        ciRunId: 123,
        ciHeadSha: SHA,
        ciConclusion: "success",
        reviewHeadSha: SHA,
        reviewCiRunId: 123,
        reviewVerdict: "approve",
        reviewReceiptDigest: DIGEST,
        dbProjectionDigest: DIGEST,
        dbReplayProjectionDigest: DIGEST,
        checkpointDigest: DIGEST,
        replayCheckpointDigest: DIGEST,
        dbConverged: true,
      },
    ],
    currentMain: {
      mainHeadSha: MAIN_SHA,
      observedHeadSha: MAIN_SHA,
      requirementsVersion: registry.requirements_version,
      registryVersion: registry.registry_version,
      registrySourceDigest: catalog.source_registry.registry_source_digest,
      legacyIdentityEmitted: {
        currentOutput: false,
        database: false,
        generatedDocs: false,
      },
      databaseConverged: true,
    },
    dependencyIssues: [
      { number: 204, state: "open" },
      { number: 635, state: "open" },
      { number: 188, state: "open" },
    ],
  };
}

describe("workflow classification terminal fullback audit", () => {
  it("U-WFTERM-001: Forward receiptの欠落をfail-closeする", () => {
    const evidence = validEvidence();
    const slice = evidence.forwardSlices[0];
    if (!slice) throw new Error("missing forward slice fixture");
    slice.reviewVerdict = null;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "forward_review_missing" }),
    );
  });

  it("U-WFTERM-002: 旧mainの成功をcurrent-main read-afterへ昇格しない", () => {
    const evidence = validEvidence();
    evidence.currentMain.observedHeadSha = SHA;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "current_main_head_mismatch" }),
    );
  });

  it("U-WFTERM-003: requirementsからconsumerまでのtyped identity不一致を拒否する", () => {
    const evidence = validEvidence();
    evidence.authority.catalog.registryVersion = "1.1.3";
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "typed_identity_catalog_mismatch" }),
    );
  });

  it("U-WFTERM-004: legacy identityのcurrent再出力を拒否する", () => {
    const evidence = validEvidence();
    evidence.currentMain.legacyIdentityEmitted.currentOutput = true;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "legacy_identity_reemitted" }),
    );
  });

  it("U-WFTERM-005: #204/#635/#188の依存解放を先行させない", () => {
    const evidence = validEvidence();
    const dependency = evidence.dependencyIssues.find((issue) => issue.number === 635);
    if (!dependency) throw new Error("missing dependency fixture");
    dependency.state = "closed";
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "dependency_state_mismatch" }),
    );
  });

  it("全証拠が同じauthorityとcurrent-mainへ束縛される場合だけgreenになる", () => {
    const result = auditWorkflowClassificationTerminalFullback(validEvidence());

    expect(result).toMatchObject({
      ok: true,
      completionClaimAllowed: true,
      findings: [],
      forwardSliceCount: 1,
    });
  });
});
