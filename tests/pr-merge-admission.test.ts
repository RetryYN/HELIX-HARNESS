import { describe, expect, it } from "vitest";
import {
  buildContextualPrReviewPacket,
  buildPrDatabaseConvergenceProbe,
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
  type MergeAdmissionCommitPortV1,
  type MergeAdmissionCommitReceiptV1,
  planLayerAwareAudit,
  prioritizeRecoveryAudit,
  resolveDeploymentProfile,
  validateAuditFixReview,
  validateContextualPrReviewReceipt,
} from "../src/github/pr-merge-admission";

const digest = (char: string): `sha256:${string}` => `sha256:${char.repeat(64)}`;
const contextKinds = [
  "authority_l0",
  "prototype_l2",
  "requirements_l3",
  "basic_design_l4",
  "issue_plan",
  "diff",
  "trace_consumers",
  "security_blast_radius",
] as const;

function packetInput(): ContextualPrReviewPacketInputV1 {
  return {
    repository_id: "RetryYN/HELIX-HARNESS",
    pr_number: 90,
    head_sha: "a".repeat(40),
    head_tree_digest: digest("1"),
    base_sha: "b".repeat(40),
    policy_digest: digest("2"),
    author_identity: "codex-worker",
    author_session_id: "session-worker",
    worker_context_digest: digest("3"),
    materials: contextKinds.map((kind, index) => ({
      kind,
      locator: `docs/${kind}.md`,
      content_digest: digest(String((index + 4) % 10)),
      decision: "required" as const,
      authority_digest: digest(String((index + 5) % 10)),
    })),
  };
}

describe("current HEAD merge admission", () => {
  it("U-GPAP-018: 8 context kindをexactに束縛し決定的packetを作る", () => {
    const first = buildContextualPrReviewPacket(packetInput());
    const second = buildContextualPrReviewPacket(packetInput());
    expect(first).toEqual(second);
    expect(first.ok).toBe(true);
    if (first.ok) expect(first.value.materials).toHaveLength(8);

    const missing = packetInput();
    missing.materials = missing.materials.slice(1);
    expect(buildContextualPrReviewPacket(missing)).toMatchObject({
      ok: false,
      failures: [{ code: "HIL_CONTEXT_REVIEW_INCOMPLETE" }],
    });

    const duplicate = packetInput();
    duplicate.materials = [...duplicate.materials, duplicate.materials[0]!];
    expect(buildContextualPrReviewPacket(duplicate)).toMatchObject({ ok: false });
  });

  it("U-GPAP-019: reviewer identity/session/contextとcurrent HEADを分離する", () => {
    const built = buildContextualPrReviewPacket(packetInput());
    expect(built.ok).toBe(true);
    if (!built.ok) return;
    const receipt = {
      schema_version: "helix-contextual-pr-review-receipt.v1" as const,
      packet_digest: built.value.packet_digest,
      head_sha: built.value.head_sha,
      reviewer_identity: "claude-reviewer",
      reviewer_session_id: "session-reviewer",
      reviewer_context_digest: digest("f"),
      verdict: "approve" as const,
      findings_digest: digest("0"),
      reviewed_at: "2026-07-22T15:00:00Z",
      receipt_digest: digest("e"),
    };
    expect(
      validateContextualPrReviewReceipt({
        packet: built.value,
        receipt,
        current_head: built.value.head_sha,
      }).ok,
    ).toBe(true);
    expect(
      validateContextualPrReviewReceipt({
        packet: built.value,
        receipt: { ...receipt, reviewer_identity: built.value.author_identity },
        current_head: built.value.head_sha,
      }),
    ).toMatchObject({ ok: false });
    expect(
      validateContextualPrReviewReceipt({
        packet: built.value,
        receipt,
        current_head: "c".repeat(40),
      }),
    ).toMatchObject({
      ok: false,
    });
  });

  it("U-GPAP-020: DB probeはpath/SQLを持たない決定的descriptorになる", () => {
    const result = buildPrDatabaseConvergenceProbe({
      repository_id: "RetryYN/HELIX-HARNESS",
      pr_number: 90,
      head_sha: "a".repeat(40),
      event_head_digest: digest("1"),
      checkpoint_locator_digest: digest("2"),
      expected_schema_revision: 7,
      rebuild_policy_digest: digest("3"),
    });
    expect(result.ok).toBe(true);
    expect(JSON.stringify(result)).not.toMatch(/absolute|sql|database_path/i);
  });

  it("U-GPAP-021: 7つのDB収束条件を個別にfail-closeする", () => {
    const probe = buildPrDatabaseConvergenceProbe({
      repository_id: "RetryYN/HELIX-HARNESS",
      pr_number: 90,
      head_sha: "a".repeat(40),
      event_head_digest: digest("1"),
      checkpoint_locator_digest: digest("2"),
      expected_schema_revision: 7,
      rebuild_policy_digest: digest("3"),
    });
    expect(probe.ok).toBe(true);
    if (!probe.ok) return;
    const observation = {
      schema_version: "helix-pr-db-convergence-observation.v1" as const,
      source_head: probe.value.head_sha,
      event_head_digest: probe.value.event_head_digest,
      projection_digest: digest("4"),
      replay_projection_digest: digest("4"),
      checkpoint_digest: digest("5"),
      replay_checkpoint_digest: digest("5"),
      schema_revision: 7,
      stale_count: 0,
      orphan_count: 0,
      rebuild_finding_count: 0,
      observation_digest: digest("6"),
    };
    expect(evaluatePrDatabaseConvergence(probe.value, observation).ok).toBe(true);
    for (const mutation of [
      { source_head: "b".repeat(40) },
      { event_head_digest: digest("9") },
      { replay_projection_digest: digest("8") },
      { replay_checkpoint_digest: digest("8") },
      { schema_revision: 8 },
      { stale_count: 1 },
      { orphan_count: 1 },
      { rebuild_finding_count: 1 },
    ]) {
      expect(
        evaluatePrDatabaseConvergence(probe.value, { ...observation, ...mutation }),
      ).toMatchObject({
        ok: false,
        failures: [{ code: "HIL_PR_DATABASE_NOT_CONVERGED" }],
      });
    }
  });

  it("U-GPAP-022: 5段writeを単一transaction化しfault/CAS/replayを閉じる", async () => {
    const head = "a".repeat(40);
    const bundle = {
      operation_id: "operation-90",
      expected_head: head,
      contextual_review: {
        schema_version: "helix-contextual-pr-review-receipt.v1" as const,
        packet_digest: digest("1"),
        head_sha: head,
        reviewer_identity: "reviewer",
        reviewer_session_id: "review-session",
        reviewer_context_digest: digest("2"),
        verdict: "approve" as const,
        findings_digest: digest("3"),
        reviewed_at: "2026-07-22T15:00:00Z",
        receipt_digest: digest("4"),
      },
      database_convergence: {
        schema_version: "helix-pr-db-convergence-receipt.v1" as const,
        probe_digest: digest("5"),
        head_sha: head,
        projection_digest: digest("6"),
        checkpoint_digest: digest("7"),
        schema_revision: 39,
        stale_count: 0 as const,
        orphan_count: 0 as const,
        rebuild_finding_count: 0 as const,
        receipt_digest: digest("8"),
      },
    };

    function transactionalPort(faultAt?: number, currentHead = head) {
      const committed = new Map<string, MergeAdmissionCommitReceiptV1>();
      const durableWrites: string[] = [];
      let transactionCalls = 0;
      const port: MergeAdmissionCommitPortV1 = {
        async transaction(work) {
          transactionCalls += 1;
          const pending: string[] = [];
          let published: MergeAdmissionCommitReceiptV1 | undefined;
          let write = 0;
          const step = (name: string) => {
            write += 1;
            if (write === faultAt) throw new Error(`fault:${name}`);
            pending.push(name);
          };
          const result = await work({
            currentHead: async () => currentHead,
            findCommitted: async (operationId) => committed.get(operationId),
            appendEvent: async () => step("event"),
            insertMemberReceipts: async () => step("members"),
            upsertProjection: async () => step("projection"),
            writeCheckpoint: async () => step("checkpoint"),
            publishReceipt: async (receipt) => {
              step("publication");
              published = receipt;
            },
          });
          durableWrites.push(...pending);
          if (published) committed.set(published.operation_id, published);
          return result;
        },
      };
      return { port, committed, durableWrites, transactionCalls: () => transactionCalls };
    }

    const success = transactionalPort();
    const first = await commitPrMergeAdmissionReceipts(bundle, success.port);
    expect(first).toMatchObject({ ok: true, value: { outcome: "committed" } });
    expect(success.durableWrites).toEqual([
      "event",
      "members",
      "projection",
      "checkpoint",
      "publication",
    ]);
    const replay = await commitPrMergeAdmissionReceipts(bundle, success.port);
    expect(replay).toMatchObject({ ok: true, value: { outcome: "replayed" } });
    expect(success.durableWrites).toHaveLength(5);
    expect(success.transactionCalls()).toBe(2);

    for (let faultAt = 1; faultAt <= 5; faultAt += 1) {
      const fault = transactionalPort(faultAt);
      expect(await commitPrMergeAdmissionReceipts(bundle, fault.port)).toMatchObject({ ok: false });
      expect(fault.durableWrites).toEqual([]);
      expect(fault.committed.size).toBe(0);
    }
    const stale = transactionalPort(undefined, "b".repeat(40));
    expect(await commitPrMergeAdmissionReceipts(bundle, stale.port)).toMatchObject({
      ok: false,
      failures: [{ fields: ["current_head"] }],
    });

    const collision = transactionalPort();
    const committed = await commitPrMergeAdmissionReceipts(bundle, collision.port);
    expect(committed.ok).toBe(true);
    expect(
      await commitPrMergeAdmissionReceipts(
        {
          ...bundle,
          contextual_review: { ...bundle.contextual_review, findings_digest: digest("9") },
        },
        collision.port,
      ),
    ).toMatchObject({ ok: false, failures: [{ fields: ["operation_replay"] }] });
  });

  it("U-GPAP-023: layer graphの上下・V-pair・consumer閉包をstableに導出する", () => {
    const graph = {
      schema_version: "helix-layer-audit-graph.v1" as const,
      nodes: ["L3", "L4", "L5", "L8", "L9", "consumer:cli"],
      edges: [
        { from: "L3", to: "L4", kind: "vertical" as const },
        { from: "L4", to: "L5", kind: "vertical" as const },
        { from: "L4", to: "L9", kind: "v_pair" as const },
        { from: "L5", to: "L8", kind: "v_pair" as const },
        { from: "L5", to: "consumer:cli", kind: "consumer" as const },
      ],
      graph_digest: digest("7"),
    };
    const result = planLayerAwareAudit(["L4"], graph, ["check:l4", "check:l5"]);
    expect(result).toMatchObject({ ok: true });
    if (result.ok) {
      expect(result.value.affected_nodes).toEqual(["L3", "L4", "L5", "L8", "L9", "consumer:cli"]);
    }
    expect(planLayerAwareAudit(["unknown"], graph, ["check"])).toMatchObject({ ok: false });
  });

  it("U-GPAP-024: fixer自身と修正前HEADのreviewを拒否する", () => {
    const packet = buildContextualPrReviewPacket(packetInput());
    expect(packet.ok).toBe(true);
    if (!packet.ok) return;
    const plan = planLayerAwareAudit(
      ["L4"],
      {
        schema_version: "helix-layer-audit-graph.v1",
        nodes: ["L4", "L9"],
        edges: [{ from: "L4", to: "L9", kind: "v_pair" }],
        graph_digest: digest("7"),
      },
      ["check"],
    );
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    const receipt = {
      schema_version: "helix-contextual-pr-review-receipt.v1" as const,
      packet_digest: packet.value.packet_digest,
      head_sha: packet.value.head_sha,
      reviewer_identity: "reviewer",
      reviewer_session_id: "review-session",
      reviewer_context_digest: digest("f"),
      verdict: "approve" as const,
      findings_digest: digest("0"),
      reviewed_at: "2026-07-22T15:00:00Z",
      receipt_digest: digest("e"),
    };
    expect(
      validateAuditFixReview({
        plan: plan.value,
        receipt,
        fixer_identity: "fixer",
        fixer_session: "fix-session",
        current_head: packet.value.head_sha,
      }).ok,
    ).toBe(true);
    expect(
      validateAuditFixReview({
        plan: plan.value,
        receipt: { ...receipt, reviewer_identity: "fixer" },
        fixer_identity: "fixer",
        fixer_session: "fix-session",
        current_head: packet.value.head_sha,
      }),
    ).toMatchObject({ ok: false, failures: [{ code: "HIL_AUDIT_FIX_SELF_APPROVED" }] });
  });

  it("U-GPAP-025: correctnessと性能超過を分離し検査縮退を拒否する", () => {
    const head = "a".repeat(40);
    const runs = (["internal", "github", "full"] as const).map((kind) => ({
      kind,
      head_sha: head,
      correctness: "pass" as const,
      duration_seconds: kind === "full" ? 181 : 30,
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
        over_budget_kinds: ["full"],
      },
    });
    for (const mutation of [
      { runs: runs.slice(1) },
      {
        runs: runs.map((run, index) =>
          index === 0 ? { ...run, correctness: "fail" as const } : run,
        ),
      },
      { runs: runs.map((run, index) => (index === 0 ? { ...run, cache_digest: "" } : run)) },
      {
        runs: runs.map((run, index) =>
          index === 0 ? { ...run, excluded_required_checks: ["test"] } : run,
        ),
      },
    ]) {
      expect(
        evaluateCiPerformanceRecovery(mutation.runs, {
          internal_seconds: 60,
          github_seconds: 60,
          full_seconds: 180,
        }),
      ).toMatchObject({ ok: false });
    }
  });

  it("U-GPAP-026: 5問履歴・mock往復・current revision・人間承認を要求する", () => {
    const input = {
      revision_id: "revision-3",
      head_sha: "a".repeat(40),
      answer_source_digest: digest("1"),
      question_batches: [
        { batch_id: "batch-1", question_count: 5, reflected_revision_id: "revision-3" },
      ],
      mock_roundtrip_complete: true,
      unresolved_count: 0,
      approval: {
        approver_kind: "human" as const,
        approver_identity: "po-user",
        revision_id: "revision-3",
        head_sha: "a".repeat(40),
        receipt_digest: digest("2"),
      },
    };
    expect(evaluateRequirementApproval(input)).toMatchObject({
      ok: true,
      value: { approved: true },
    });
    for (const mutation of [
      { answer_source_digest: "" },
      { question_batches: [] },
      { mock_roundtrip_complete: false },
      { unresolved_count: 1 },
      { approval: { ...input.approval, approver_kind: "ai" as const } },
      { approval: { ...input.approval, revision_id: "revision-2" } },
    ])
      expect(evaluateRequirementApproval({ ...input, ...mutation })).toMatchObject({ ok: false });
  });

  it("U-GPAP-027: main Recoveryの6 receiptを同一fix HEADへ束縛する", () => {
    const fixHead = "b".repeat(40);
    const evidence = {
      failed_main_head: "a".repeat(40),
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
    expect(evaluateMainRecoveryRelease(evidence)).toMatchObject({
      ok: true,
      value: { release_merge_stop: true },
    });
    for (const field of [
      "recovery_issue_head",
      "recovery_pr_head",
      "independent_review_head",
      "doctor_head",
      "github_ci_head",
      "closure_receipt_head",
    ] as const) {
      expect(evaluateMainRecoveryRelease({ ...evidence, [field]: "c".repeat(40) })).toMatchObject({
        ok: false,
      });
    }
    expect(
      evaluateMainRecoveryRelease({ ...evidence, reviewer_identity: evidence.fixer_identity }),
    ).toMatchObject({ ok: false });
  });

  it("U-GPAP-028: active main/performance Recoveryを通常itemより先に安定整列する", () => {
    const result = prioritizeRecoveryAudit([
      { item_id: "feature", kind: "feature", active: true, priority: 100 },
      { item_id: "perf-a", kind: "performance_recovery", active: true, priority: 1 },
      { item_id: "main", kind: "main_recovery", active: true, priority: 0 },
      { item_id: "perf-b", kind: "performance_recovery", active: true, priority: 1 },
      { item_id: "parked", kind: "main_recovery", active: false, priority: 999 },
    ]);
    expect(result).toMatchObject({ ok: true });
    if (result.ok)
      expect(result.value.map((item) => item.item_id)).toEqual([
        "main",
        "perf-a",
        "perf-b",
        "feature",
        "parked",
      ]);
    expect(
      prioritizeRecoveryAudit([
        { item_id: "duplicate", kind: "feature", active: true, priority: 1 },
        { item_id: "duplicate", kind: "feature", active: true, priority: 2 },
      ]),
    ).toMatchObject({ ok: false });
  });

  it("U-GPAP-029: AWS標準profileを要件・riskから停止なしで決定する", () => {
    expect(
      resolveDeploymentProfile(
        {
          database_required: false,
          relational_transactions_required: false,
          disposable_poc: true,
          production_data: false,
          external_use: false,
          authentication: false,
          pii: false,
        },
        "low",
      ),
    ).toMatchObject({
      ok: true,
      value: {
        compute: "ecs_fargate",
        infrastructure_as_code: "aws_cdk_typescript",
        database: "none",
        account_separation: "same_account_disposable_poc",
        searchable_audit_days: 90,
        immutable_archive_days: 365,
      },
    });
    expect(
      resolveDeploymentProfile(
        {
          database_required: true,
          relational_transactions_required: true,
          disposable_poc: false,
          production_data: true,
          external_use: true,
          authentication: true,
          pii: true,
        },
        "high",
      ),
    ).toMatchObject({
      ok: true,
      value: { database: "rds_postgresql", account_separation: "separate_accounts" },
    });
    expect(
      resolveDeploymentProfile(
        {
          database_required: false,
          relational_transactions_required: false,
          disposable_poc: false,
          production_data: false,
          external_use: false,
          authentication: false,
          pii: false,
        },
        "unknown",
      ),
    ).toMatchObject({ ok: false });
  });

  it("U-GPAP-030: GitHub Environment/OIDC/role分離preflightを全件要求する", () => {
    const evidence = {
      github_plan_supported: true,
      environments_separated: true,
      environment_concurrency_one: true,
      self_review_blocked: true,
      oidc_short_lived: true,
      trust_scoped_to_repository_environment_ref: true,
      staging_production_roles_separated: true,
      long_lived_access_keys_absent: true,
    };
    expect(evaluateDeploymentCapability(evidence)).toMatchObject({
      ok: true,
      value: { production_environment_enabled: true },
    });
    for (const field of Object.keys(evidence) as (keyof typeof evidence)[]) {
      expect(evaluateDeploymentCapability({ ...evidence, [field]: false })).toMatchObject({
        ok: false,
      });
    }
  });

  it("U-GPAP-031: 同一artifactとstaging/approval/recovery証拠だけをproposal化する", () => {
    const candidate = {
      artifact_digest: digest("1"),
      production_artifact_digest: digest("1"),
      schema_digest: digest("2"),
      staging_schema_digest: digest("2"),
      staging_receipt_digest: digest("3"),
      staging_green: true,
      approval: {
        approver_kind: "human" as const,
        artifact_digest: digest("1"),
        environment: "cloud_production" as const,
        operation_digest: digest("4"),
        window: "2026-07-23T00:00:00Z/2026-07-23T01:00:00Z",
        receipt_digest: digest("5"),
      },
      backup_receipt_digest: digest("6"),
      rollback_receipt_digest: digest("7"),
      health_receipt_digest: digest("8"),
      monitoring_receipt_digest: digest("9"),
    };
    const result = evaluateEnvironmentPromotion(candidate);
    expect(result).toMatchObject({ ok: true, value: { action: "proposal_only" } });
    expect(JSON.stringify(result)).not.toMatch(/command|credential|secret/i);
    for (const mutation of [
      { production_artifact_digest: digest("0") },
      { staging_green: false },
      { backup_receipt_digest: "" },
      { approval: { ...candidate.approval, approver_kind: "ai" as const } },
    ])
      expect(evaluateEnvironmentPromotion({ ...candidate, ...mutation })).toMatchObject({
        ok: false,
      });
  });

  it("U-GPAP-032: expand→deploy→contractとrestore/compatibility/oracle/承認を要求する", () => {
    const candidate = {
      stages: ["expand", "deploy", "contract"] as const,
      zero_downtime: true,
      backup_receipt_digest: digest("1"),
      restore_rehearsal_receipt_digest: digest("2"),
      compatibility_window: "two releases",
      migration_oracle_digest: digest("3"),
      rollback_oracle_digest: digest("4"),
      approval_receipt_digest: digest("5"),
      downtime_required: false,
    };
    const result = evaluateProductionMigration(candidate);
    expect(result).toMatchObject({ ok: true, value: { action: "proposal_only" } });
    expect(JSON.stringify(result)).not.toMatch(/sql|command/i);
    for (const mutation of [
      { stages: ["deploy", "expand", "contract"] as const },
      { restore_rehearsal_receipt_digest: "" },
      { compatibility_window: "" },
      { downtime_required: true, zero_downtime: false },
    ])
      expect(evaluateProductionMigration({ ...candidate, ...mutation })).toMatchObject({
        ok: false,
      });
  });

  it("U-GPAP-033: 正常なfuture Updateをactive blocker外へ分類する", () => {
    const issue = {
      issue_id: "issue-91",
      issue_type: "Update" as const,
      state: "open" as const,
      labels: ["update", "state:backlog", "priority:future", "area:operations"],
      trace_ids: ["GH-FR-022"],
      defer_until: "2026-12-01T00:00:00Z",
      now: "2026-07-22T00:00:00Z",
    };
    expect(classifyUpdateBacklogItem(issue)).toMatchObject({
      ok: true,
      value: { projection: "future_backlog", active_blocker: false, finding: false },
    });
    for (const mutation of [
      { issue_type: "Feature" as const },
      { state: "closed" as const },
      { labels: issue.labels.filter((label) => label !== "update") },
      { trace_ids: [] },
      { defer_until: "2026-01-01T00:00:00Z" },
    ])
      expect(classifyUpdateBacklogItem({ ...issue, ...mutation })).toMatchObject({ ok: false });
  });
});
