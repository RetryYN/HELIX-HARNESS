import { describe, expect, it } from "vitest";
import {
  auditWorkflowClassificationTerminalFullback,
  checkWorkflowClassificationTerminalFullbackOracle,
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

  it("U-WFTERM-006: live evidence未接続時も空snapshotをfail-closeするoracleをdoctorへ配線する", () => {
    expect(checkWorkflowClassificationTerminalFullbackOracle()).toEqual({
      ok: true,
      messages: [
        "workflow-classification-terminal-fullback - OK (oracle fail-close wired; live evidence pending)",
      ],
    });
  });

  it("U-WFTERM-007: #694以外のIssueへfullback証拠を束縛しない", () => {
    const evidence = validEvidence();
    evidence.issueNumber = 693;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "issue_identity_mismatch" }),
    );
  });

  it("U-WFTERM-008: mergeされていないForward sliceを終端証拠へ昇格しない", () => {
    const evidence = validEvidence();
    const slice = evidence.forwardSlices[0];
    if (!slice) throw new Error("missing forward slice fixture");
    slice.merged = false;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: "forward_not_merged" }));
  });

  it("U-WFTERM-009: Forward sliceのHEAD欠落をfail-closeする", () => {
    const evidence = validEvidence();
    const slice = evidence.forwardSlices[0];
    if (!slice) throw new Error("missing forward slice fixture");
    slice.headSha = null;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "forward_head_missing" }),
    );
  });

  it("U-WFTERM-010: required CI run欠落をfail-closeする", () => {
    const evidence = validEvidence();
    const slice = evidence.forwardSlices[0];
    if (!slice) throw new Error("missing forward slice fixture");
    slice.ciRunId = null;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: "forward_ci_missing" }));
  });

  it("U-WFTERM-011: CI成功とForward HEADの不一致をfail-closeする", () => {
    const evidence = validEvidence();
    const slice = evidence.forwardSlices[0];
    if (!slice) throw new Error("missing forward slice fixture");
    slice.ciHeadSha = MAIN_SHA;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "forward_ci_mismatch" }),
    );
  });

  it("U-WFTERM-012: independent reviewのHEAD不一致をfail-closeする", () => {
    const evidence = validEvidence();
    const slice = evidence.forwardSlices[0];
    if (!slice) throw new Error("missing forward slice fixture");
    slice.reviewHeadSha = MAIN_SHA;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "forward_review_mismatch" }),
    );
  });

  it("U-WFTERM-013: Forward DB projectionの未収束をfail-closeする", () => {
    const evidence = validEvidence();
    const slice = evidence.forwardSlices[0];
    if (!slice) throw new Error("missing forward slice fixture");
    slice.dbConverged = false;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "forward_db_not_converged" }),
    );
  });

  it("U-WFTERM-014: requirements authorityとregistryの不一致をfail-closeする", () => {
    const evidence = validEvidence();
    evidence.authority.requirements.version = "1.3.11";
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "typed_identity_requirements_mismatch" }),
    );
  });

  it("U-WFTERM-015: consumerのtyped identity欠落をfail-closeする", () => {
    const evidence = validEvidence();
    const consumer = evidence.authority.consumers[0];
    if (!consumer) throw new Error("missing consumer fixture");
    consumer.targetAxis = "";
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "typed_identity_consumer_mismatch" }),
    );
  });

  it("U-WFTERM-016: current-main authorityの不一致をfail-closeする", () => {
    const evidence = validEvidence();
    evidence.currentMain.registryVersion = "1.1.3";
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "current_main_authority_mismatch" }),
    );
  });

  it("U-WFTERM-017: current-main DB未収束をfail-closeする", () => {
    const evidence = validEvidence();
    evidence.currentMain.databaseConverged = false;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "current_main_db_not_converged" }),
    );
  });

  it("U-WFTERM-018: consumer側のlegacy identity再出力をfail-closeする", () => {
    const evidence = validEvidence();
    const consumer = evidence.authority.consumers[0];
    if (!consumer) throw new Error("missing consumer fixture");
    consumer.legacyIdentityEmitted = true;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "legacy_identity_reemitted", subject: consumer.name }),
    );
  });

  it("U-WFTERM-019: 重複依存Issueをexact state setとして受理しない", () => {
    const evidence = validEvidence();
    evidence.dependencyIssues.push({ number: 204, state: "open" });
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "dependency_state_mismatch", subject: "dependency issues" }),
    );
  });

  it("U-WFTERM-020: Forward HEAD一致でもCI failureを成功証拠へ昇格しない", () => {
    const evidence = validEvidence();
    const slice = evidence.forwardSlices[0];
    if (!slice) throw new Error("missing forward slice fixture");
    slice.ciConclusion = "failure";
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "forward_ci_mismatch" }),
    );
  });

  it("U-WFTERM-021: valid digest同士のcheckpoint/replay不一致を収束扱いしない", () => {
    const evidence = validEvidence();
    const slice = evidence.forwardSlices[0];
    if (!slice) throw new Error("missing forward slice fixture");
    slice.replayCheckpointDigest = `sha256:${"d".repeat(64)}`;
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "forward_db_not_converged" }),
    );
  });

  it("U-WFTERM-022: registry sourceDigestの不正形式をrequirements identityとして受理しない", () => {
    const evidence = validEvidence();
    evidence.authority.registry.sourceDigest = "not-a-digest";
    const result = auditWorkflowClassificationTerminalFullback(evidence);

    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "typed_identity_requirements_mismatch" }),
    );
  });
});
