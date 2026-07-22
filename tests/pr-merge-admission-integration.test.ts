import { describe, expect, it } from "vitest";
import {
  buildContextualPrReviewPacket,
  type ContextualPrReviewPacketInputV1,
  classifyUpdateBacklogItem,
  commitPrMergeAdmissionReceipts,
  evaluateCiPerformanceRecovery,
  evaluateDeploymentCapability,
  evaluateEnvironmentPromotion,
  evaluateMainRecoveryRelease,
  evaluatePrDatabaseConvergence,
  evaluateProductionMigration,
  evaluateRequirementApproval,
  type MergeAdmissionCommitReceiptV1,
  planLayerAwareAudit,
  prioritizeRecoveryAudit,
  resolveDeploymentProfile,
  validateAuditFixReview,
  validateContextualPrReviewReceipt,
} from "../src/github/pr-merge-admission";
import {
  collectContextualPrReviewPacket,
  collectPrDatabaseConvergenceProbe,
  observePrDatabaseConvergence,
} from "../src/github/pr-merge-admission-runtime";
import { SCHEMA_VERSION } from "../src/schema/harness-db";

const d = (char: string): `sha256:${string}` => `sha256:${char.repeat(64)}`;
const head = "a".repeat(40);

function packetInput(): ContextualPrReviewPacketInputV1 {
  const kinds = [
    "authority_l0",
    "prototype_l2",
    "requirements_l3",
    "basic_design_l4",
    "issue_plan",
    "diff",
    "trace_consumers",
    "security_blast_radius",
  ] as const;
  return {
    repository_id: "RetryYN/HELIX-HARNESS",
    pr_number: 90,
    head_sha: head,
    head_tree_digest: d("1"),
    base_sha: "b".repeat(40),
    policy_digest: d("2"),
    author_identity: "worker",
    author_session_id: "worker-session",
    worker_context_digest: d("3"),
    materials: kinds.map((kind) => ({
      kind,
      locator: `locator:${kind}`,
      content_digest: d("4"),
      decision: "required",
      authority_digest: d("5"),
    })),
  };
}

function packetAndReceipt() {
  const packet = buildContextualPrReviewPacket(packetInput());
  if (!packet.ok) throw new Error("packet fixture invalid");
  return {
    packet: packet.value,
    receipt: {
      schema_version: "helix-contextual-pr-review-receipt.v1" as const,
      packet_digest: packet.value.packet_digest,
      head_sha: packet.value.head_sha,
      reviewer_identity: "reviewer",
      reviewer_session_id: "reviewer-session",
      reviewer_context_digest: d("6"),
      verdict: "approve" as const,
      findings_digest: d("7"),
      reviewed_at: "2026-07-22T15:00:00Z",
      receipt_digest: d("8"),
    },
  };
}

describe("current HEAD merge admission integration", () => {
  it("IT-GPAP-018: tracked repositoryから8 context packetを生成する", () => {
    const result = collectContextualPrReviewPacket({
      repoRoot: process.cwd(),
      repositoryId: "RetryYN/HELIX-HARNESS",
      prNumber: 90,
      baseRef: "origin/main",
      authorIdentity: "integration-worker",
      authorSessionId: "integration-session",
      workerContextDigest: d("1"),
    });
    expect(result).toMatchObject({ ok: true });
    if (result.ok) expect(result.value.materials).toHaveLength(8);
  });

  it("IT-GPAP-019: packetと独立review receiptを同じHEADへ束縛する", () => {
    const { packet, receipt } = packetAndReceipt();
    expect(
      validateContextualPrReviewReceipt({ packet, receipt, current_head: packet.head_sha }),
    ).toMatchObject({
      ok: true,
    });
    expect(
      validateContextualPrReviewReceipt({ packet, receipt, current_head: "c".repeat(40) }),
    ).toMatchObject({
      ok: false,
    });
  });

  it("IT-GPAP-020: tracked HEAD/treeから既存DB非依存probeを生成する", () => {
    const result = collectPrDatabaseConvergenceProbe({
      repoRoot: process.cwd(),
      repositoryId: "RetryYN/HELIX-HARNESS",
      prNumber: 90,
      expectedSchemaRevision: SCHEMA_VERSION,
    });
    expect(result).toMatchObject({ ok: true });
    expect(JSON.stringify(result)).not.toMatch(/database_path|absolute|sql/i);
  });

  it("IT-GPAP-021: isolated rebuild二回を7条件で収束判定する", () => {
    const probe = collectPrDatabaseConvergenceProbe({
      repoRoot: process.cwd(),
      repositoryId: "RetryYN/HELIX-HARNESS",
      prNumber: 90,
      expectedSchemaRevision: SCHEMA_VERSION,
    });
    if (!probe.ok) throw new Error("probe fixture invalid");
    const isolatedRoot = mkdtempSync(join(tmpdir(), "helix-it-gpap-021-"));
    try {
      const observation = observePrDatabaseConvergence({
        repoRoot: isolatedRoot,
        sourceHead: probe.value.head_sha,
        eventHeadDigest: probe.value.event_head_digest,
      });
      expect(evaluatePrDatabaseConvergence(probe.value, observation)).toMatchObject({ ok: true });
    } finally {
      rmSync(isolatedRoot, { recursive: true, force: true });
    }
  });

  it("IT-GPAP-022: receipt bundleをtransaction portへ一回だけcommitする", async () => {
    const { receipt } = packetAndReceipt();
    const dbReceipt = {
      schema_version: "helix-pr-db-convergence-receipt.v1" as const,
      probe_digest: d("1"),
      head_sha: head,
      projection_digest: d("2"),
      checkpoint_digest: d("3"),
      schema_revision: SCHEMA_VERSION,
      stale_count: 0 as const,
      orphan_count: 0 as const,
      rebuild_finding_count: 0 as const,
      receipt_digest: d("4"),
    };
    const committed = new Map<string, MergeAdmissionCommitReceiptV1>();
    const writes: string[] = [];
    const result = await commitPrMergeAdmissionReceipts(
      {
        operation_id: "operation-it-22",
        expected_head: head,
        contextual_review: receipt,
        database_convergence: dbReceipt,
      },
      {
        transaction: async (work) =>
          work({
            currentHead: async () => head,
            findCommitted: async (id) => committed.get(id),
            appendEvent: async () => writes.push("event") as never,
            insertMemberReceipts: async () => writes.push("members") as never,
            upsertProjection: async () => writes.push("projection") as never,
            writeCheckpoint: async () => writes.push("checkpoint") as never,
            publishReceipt: async (value) => {
              writes.push("publication");
              committed.set(value.operation_id, value);
            },
          }),
      },
    );
    expect(result).toMatchObject({ ok: true });
    expect(writes).toEqual(["event", "members", "projection", "checkpoint", "publication"]);
  });

  it("IT-GPAP-023: changed layerから上下/V-pair/consumer閉包を導出する", () => {
    const result = planLayerAwareAudit(
      ["L4"],
      {
        schema_version: "helix-layer-audit-graph.v1",
        nodes: ["L3", "L4", "L5", "L9", "consumer"],
        edges: [
          { from: "L3", to: "L4", kind: "vertical" },
          { from: "L4", to: "L5", kind: "vertical" },
          { from: "L4", to: "L9", kind: "v_pair" },
          { from: "L5", to: "consumer", kind: "consumer" },
        ],
        graph_digest: d("1"),
      },
      ["trace", "pair"],
    );
    expect(result).toMatchObject({ ok: true });
    if (result.ok)
      expect(result.value.affected_nodes).toEqual(["L3", "L4", "L5", "L9", "consumer"]);
  });

  it("IT-GPAP-024: audit fixer自身のreview receiptを拒否する", () => {
    const { receipt } = packetAndReceipt();
    const plan = planLayerAwareAudit(
      ["L4"],
      {
        schema_version: "helix-layer-audit-graph.v1",
        nodes: ["L4"],
        edges: [],
        graph_digest: d("1"),
      },
      ["check"],
    );
    if (!plan.ok) throw new Error("plan fixture invalid");
    expect(
      validateAuditFixReview({
        plan: plan.value,
        receipt,
        fixer_identity: receipt.reviewer_identity,
        fixer_session: "fix-session",
        current_head: head,
      }),
    ).toMatchObject({ ok: false });
  });

  it("IT-GPAP-025: correctness greenと性能Recoveryを分離する", () => {
    const runs = (["internal", "github", "full"] as const).map((kind) => ({
      kind,
      head_sha: head,
      correctness: "pass" as const,
      duration_seconds: kind === "github" ? 61 : 10,
      environment_digest: d("1"),
      cache_digest: d("2"),
      test_scope_digest: d("3"),
      excluded_required_checks: [],
    }));
    expect(
      evaluateCiPerformanceRecovery(runs, {
        internal_seconds: 60,
        github_seconds: 60,
        full_seconds: 180,
      }),
    ).toMatchObject({
      ok: true,
      value: { performance_recovery_required: true, over_budget_kinds: ["github"] },
    });
  });

  it("IT-GPAP-026: current revisionの回答/mock/人間承認を結合する", () => {
    expect(
      evaluateRequirementApproval({
        revision_id: "revision-1",
        head_sha: head,
        answer_source_digest: d("1"),
        question_batches: [
          { batch_id: "batch-1", question_count: 5, reflected_revision_id: "revision-1" },
        ],
        mock_roundtrip_complete: true,
        unresolved_count: 0,
        approval: {
          approver_kind: "human",
          approver_identity: "po",
          revision_id: "revision-1",
          head_sha: head,
          receipt_digest: d("2"),
        },
      }),
    ).toMatchObject({ ok: true });
  });

  it("IT-GPAP-027: main Recoveryの全証拠をfix HEADへ収束させる", () => {
    const fix = "b".repeat(40);
    expect(
      evaluateMainRecoveryRelease({
        failed_main_head: head,
        fix_head: fix,
        recovery_issue_head: fix,
        recovery_pr_head: fix,
        independent_review_head: fix,
        doctor_head: fix,
        github_ci_head: fix,
        closure_receipt_head: fix,
        reviewer_identity: "reviewer",
        fixer_identity: "fixer",
      }),
    ).toMatchObject({ ok: true, value: { release_merge_stop: true } });
  });

  it("IT-GPAP-028: main Recoveryを通常Featureより先にscheduleする", () => {
    const result = prioritizeRecoveryAudit([
      { item_id: "feature", kind: "feature", active: true, priority: 100 },
      { item_id: "recovery", kind: "main_recovery", active: true, priority: 0 },
    ]);
    expect(result).toMatchObject({ ok: true });
    if (result.ok) expect(result.value[0]?.item_id).toBe("recovery");
  });

  it("IT-GPAP-029: 標準deployment profileをriskから解決する", () => {
    expect(
      resolveDeploymentProfile(
        {
          database_required: true,
          relational_transactions_required: true,
          disposable_poc: false,
          production_data: true,
          external_use: true,
          authentication: true,
          pii: false,
        },
        "high",
      ),
    ).toMatchObject({
      ok: true,
      value: { database: "rds_postgresql", account_separation: "separate_accounts" },
    });
  });

  it("IT-GPAP-030: production capability preflightを全件結合する", () => {
    expect(
      evaluateDeploymentCapability({
        github_plan_supported: true,
        environments_separated: true,
        environment_concurrency_one: true,
        self_review_blocked: true,
        oidc_short_lived: true,
        trust_scoped_to_repository_environment_ref: true,
        staging_production_roles_separated: true,
        long_lived_access_keys_absent: true,
      }),
    ).toMatchObject({ ok: true });
  });

  it("IT-GPAP-031: stagingからproductionへの同一artifact proposalだけを返す", () => {
    const result = evaluateEnvironmentPromotion({
      artifact_digest: d("1"),
      production_artifact_digest: d("1"),
      schema_digest: d("2"),
      staging_schema_digest: d("2"),
      staging_receipt_digest: d("3"),
      staging_green: true,
      approval: {
        approver_kind: "human",
        artifact_digest: d("1"),
        environment: "cloud_production",
        operation_digest: d("4"),
        window: "window",
        receipt_digest: d("5"),
      },
      backup_receipt_digest: d("6"),
      rollback_receipt_digest: d("7"),
      health_receipt_digest: d("8"),
      monitoring_receipt_digest: d("9"),
    });
    expect(result).toMatchObject({ ok: true, value: { action: "proposal_only" } });
    expect(JSON.stringify(result)).not.toMatch(/credential|command/i);
  });

  it("IT-GPAP-032: migration evidenceを順序付きproposalへ結合する", () => {
    const result = evaluateProductionMigration({
      stages: ["expand", "deploy", "contract"],
      zero_downtime: true,
      backup_receipt_digest: d("1"),
      restore_rehearsal_receipt_digest: d("2"),
      compatibility_window: "two releases",
      migration_oracle_digest: d("3"),
      rollback_oracle_digest: d("4"),
      approval_receipt_digest: d("5"),
      downtime_required: false,
    });
    expect(result).toMatchObject({ ok: true, value: { action: "proposal_only" } });
    expect(JSON.stringify(result)).not.toMatch(/sql|command/i);
  });

  it("IT-GPAP-033: future Updateをactive分母外へ投影する", () => {
    expect(
      classifyUpdateBacklogItem({
        issue_id: "issue-91",
        issue_type: "Update",
        state: "open",
        labels: ["update", "state:backlog", "priority:future", "area:operations"],
        trace_ids: ["GH-FR-022"],
        now: "2026-07-22T00:00:00Z",
      }),
    ).toMatchObject({ ok: true, value: { projection: "future_backlog", active_blocker: false } });
  });
});

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
