import { describe, expect, it } from "vitest";
import {
  buildContextualPrReviewPacket,
  buildPrDatabaseConvergenceProbe,
  classifyUpdateBacklogItem,
  evaluateCiPerformanceRecovery,
  evaluateDeploymentCapability,
  evaluateEnvironmentPromotion,
  evaluateMainRecoveryRelease,
  evaluatePrDatabaseConvergence,
  evaluateProductionMigration,
  evaluateRequirementApproval,
  planLayerAwareAudit,
  prioritizeRecoveryAudit,
  resolveDeploymentProfile,
  validateAuditFixReview,
  validateContextualPrReviewReceipt,
} from "../src/github/pr-merge-admission";

const digest = (char: string): `sha256:${string}` =>
  `sha256:${char.repeat(64)}`;
const head = "a".repeat(40);
const fixHead = "b".repeat(40);

function contextFixture() {
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
  const packet = buildContextualPrReviewPacket({
    repository_id: "RetryYN/HELIX-HARNESS",
    pr_number: 90,
    head_sha: head,
    head_tree_digest: digest("1"),
    base_sha: "c".repeat(40),
    policy_digest: digest("2"),
    author_identity: "codex-author",
    author_session_id: "author-session",
    worker_context_digest: digest("3"),
    materials: kinds.map((kind) => ({
      kind,
      locator: `fixture:${kind}`,
      content_digest: digest("4"),
      decision: "required" as const,
      authority_digest: digest("5"),
    })),
  });
  if (!packet.ok) throw new Error("context fixture invalid");
  const receipt = {
    schema_version: "helix-contextual-pr-review-receipt.v1" as const,
    packet_digest: packet.value.packet_digest,
    head_sha: head,
    reviewer_identity: "codex-reviewer",
    reviewer_session_id: "reviewer-session",
    reviewer_context_digest: digest("6"),
    verdict: "approve" as const,
    findings_digest: digest("7"),
    reviewed_at: "2026-07-22T00:00:00Z",
    receipt_digest: digest("8"),
  };
  return { packet: packet.value, receipt };
}

describe("PR merge admission system assertions", () => {
  it("SYS-GPAP-034: current HEADの8文脈と独立identity/session/contextを束縛する", () => {
    const { packet, receipt } = contextFixture();
    expect(
      validateContextualPrReviewReceipt(packet, receipt, head),
    ).toMatchObject({ ok: true });
    expect(
      validateContextualPrReviewReceipt(packet, receipt, fixHead),
    ).toMatchObject({ ok: false });
    expect(
      validateContextualPrReviewReceipt(
        packet,
        {
          ...receipt,
          reviewer_identity: packet.author_identity,
        },
        head,
      ),
    ).toMatchObject({ ok: false });
    expect(
      buildContextualPrReviewPacket({
        ...packet,
        materials: packet.materials.slice(1),
      }),
    ).toMatchObject({ ok: false });
  });

  it("SYS-GPAP-035: DB追従の7条件を同一HEADへ収束させる", () => {
    const probe = buildPrDatabaseConvergenceProbe({
      repository_id: "RetryYN/HELIX-HARNESS",
      pr_number: 90,
      head_sha: head,
      event_head_digest: digest("1"),
      checkpoint_locator_digest: digest("2"),
      expected_schema_revision: 51,
      rebuild_policy_digest: digest("3"),
    });
    if (!probe.ok) throw new Error("probe fixture invalid");
    const observation = {
      schema_version: "helix-pr-db-convergence-observation.v1" as const,
      source_head: head,
      event_head_digest: digest("1"),
      projection_digest: digest("4"),
      replay_projection_digest: digest("4"),
      checkpoint_digest: digest("5"),
      replay_checkpoint_digest: digest("5"),
      schema_revision: 51,
      stale_count: 0,
      orphan_count: 0,
      rebuild_finding_count: 0,
      observation_digest: digest("6"),
    };
    expect(
      evaluatePrDatabaseConvergence(probe.value, observation),
    ).toMatchObject({ ok: true });
    for (const mutation of [
      { source_head: fixHead },
      { event_head_digest: digest("9") },
      { replay_projection_digest: digest("9") },
      { replay_checkpoint_digest: digest("9") },
      { schema_revision: 50 },
      { stale_count: 1 },
      { orphan_count: 1 },
      { rebuild_finding_count: 1 },
    ]) {
      expect(
        evaluatePrDatabaseConvergence(probe.value, {
          ...observation,
          ...mutation,
        }),
      ).toMatchObject({ ok: false });
    }
  });

  it("SYS-GPAP-036: 影響L/V-pair閉包と修正主体から独立したreviewを要求する", () => {
    const plan = planLayerAwareAudit(
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
        graph_digest: digest("1"),
      },
      ["trace", "pair"],
    );
    const { receipt } = contextFixture();
    if (!plan.ok) throw new Error("audit fixture invalid");
    expect(plan.value.affected_nodes).toEqual([
      "L3",
      "L4",
      "L5",
      "L9",
      "consumer",
    ]);
    expect(
      validateAuditFixReview(plan.value, receipt, "fixer", "fix-session", head),
    ).toMatchObject({ ok: true });
    expect(
      validateAuditFixReview(
        plan.value,
        receipt,
        receipt.reviewer_identity,
        "fix-session",
        head,
      ),
    ).toMatchObject({ ok: false });
  });

  it("SYS-GPAP-037: correctnessと性能Recoveryを分離し検査縮退を拒否する", () => {
    const runs = (["internal", "github", "full"] as const).map((kind) => ({
      kind,
      head_sha: head,
      correctness: "pass" as const,
      duration_seconds: kind === "github" ? 61 : 10,
      environment_digest: digest("1"),
      cache_digest: digest("2"),
      test_scope_digest: digest("3"),
      excluded_required_checks: [] as string[],
    }));
    expect(
      evaluateCiPerformanceRecovery(runs, {
        internal_seconds: 60,
        github_seconds: 60,
        full_seconds: 180,
      }),
    ).toMatchObject({
      ok: true,
      value: {
        merge_correctness_green: true,
        performance_recovery_required: true,
      },
    });
    expect(
      evaluateCiPerformanceRecovery(
        runs.map((run, index) =>
          index === 0
            ? { ...run, excluded_required_checks: ["typecheck"] }
            : run,
        ),
        { internal_seconds: 60, github_seconds: 60, full_seconds: 180 },
      ),
    ).toMatchObject({ ok: false });
  });

  it("SYS-GPAP-038: 人間要件承認とmain Recovery優先・同一HEAD閉鎖を強制する", () => {
    expect(
      evaluateRequirementApproval({
        revision_id: "revision-1",
        head_sha: head,
        answer_source_digest: digest("1"),
        question_batches: [
          {
            batch_id: "batch-1",
            question_count: 5,
            reflected_revision_id: "revision-1",
          },
        ],
        mock_roundtrip_complete: true,
        unresolved_count: 0,
        approval: {
          approver_kind: "human",
          approver_identity: "po",
          revision_id: "revision-1",
          head_sha: head,
          receipt_digest: digest("2"),
        },
      }),
    ).toMatchObject({ ok: true });
    const release = {
      failed_main_head: head,
      fix_head: fixHead,
      recovery_issue_head: fixHead,
      recovery_pr_head: fixHead,
      independent_review_head: fixHead,
      doctor_head: fixHead,
      github_ci_head: fixHead,
      closure_receipt_head: fixHead,
      reviewer_identity: "reviewer",
      fixer_identity: "fixer",
    };
    expect(evaluateMainRecoveryRelease(release)).toMatchObject({ ok: true });
    expect(
      evaluateMainRecoveryRelease({ ...release, github_ci_head: head }),
    ).toMatchObject({ ok: false });
    const queue = prioritizeRecoveryAudit([
      { item_id: "feature", kind: "feature", active: true, priority: 100 },
      { item_id: "recovery", kind: "main_recovery", active: true, priority: 0 },
    ]);
    expect(queue.ok && queue.value[0]?.item_id).toBe("recovery");
  });

  it("SYS-GPAP-039: deployment preflightからpromotion/migration proposalまで外部writeなしで閉じる", () => {
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
    ).toMatchObject({ ok: true });
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
    const promotion = evaluateEnvironmentPromotion({
      artifact_digest: digest("1"),
      production_artifact_digest: digest("1"),
      schema_digest: digest("2"),
      staging_schema_digest: digest("2"),
      staging_receipt_digest: digest("3"),
      staging_green: true,
      approval: {
        approver_kind: "human",
        artifact_digest: digest("1"),
        environment: "cloud_production",
        operation_digest: digest("4"),
        window: "window",
        receipt_digest: digest("5"),
      },
      backup_receipt_digest: digest("6"),
      rollback_receipt_digest: digest("7"),
      health_receipt_digest: digest("8"),
      monitoring_receipt_digest: digest("9"),
    });
    const migration = evaluateProductionMigration({
      stages: ["expand", "deploy", "contract"],
      zero_downtime: true,
      backup_receipt_digest: digest("1"),
      restore_rehearsal_receipt_digest: digest("2"),
      compatibility_window: "two releases",
      migration_oracle_digest: digest("3"),
      rollback_oracle_digest: digest("4"),
      approval_receipt_digest: digest("5"),
      downtime_required: false,
    });
    expect(promotion).toMatchObject({
      ok: true,
      value: { action: "proposal_only" },
    });
    expect(migration).toMatchObject({
      ok: true,
      value: { action: "proposal_only" },
    });
    expect(JSON.stringify({ promotion, migration })).not.toMatch(
      /credential|command|sql/i,
    );
  });

  it("SYS-GPAP-040: future Updateをactive blockerから分離し不正分類をfinding化する", () => {
    const issue = {
      issue_id: "issue-91",
      issue_type: "Update" as const,
      state: "open" as const,
      labels: ["update", "state:backlog", "priority:future", "area:operations"],
      trace_ids: ["GH-FR-022"],
      now: "2026-07-22T00:00:00Z",
    };
    expect(classifyUpdateBacklogItem(issue)).toMatchObject({
      ok: true,
      value: { projection: "future_backlog", active_blocker: false },
    });
    expect(
      classifyUpdateBacklogItem({ ...issue, trace_ids: [] }),
    ).toMatchObject({ ok: false });
  });
});
