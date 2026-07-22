import { describe, expect, it } from "vitest";
import {
  buildContextualPrReviewPacket,
  buildPrDatabaseConvergenceProbe,
  type ContextualPrReviewPacketInputV1,
  commitPrMergeAdmissionReceipts,
  evaluatePrDatabaseConvergence,
  type MergeAdmissionCommitPortV1,
  type MergeAdmissionCommitReceiptV1,
  planLayerAwareAudit,
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
    expect(validateContextualPrReviewReceipt(built.value, receipt, built.value.head_sha).ok).toBe(
      true,
    );
    expect(
      validateContextualPrReviewReceipt(
        built.value,
        { ...receipt, reviewer_identity: built.value.author_identity },
        built.value.head_sha,
      ),
    ).toMatchObject({ ok: false });
    expect(validateContextualPrReviewReceipt(built.value, receipt, "c".repeat(40))).toMatchObject({
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
      validateAuditFixReview(plan.value, receipt, "fixer", "fix-session", packet.value.head_sha).ok,
    ).toBe(true);
    expect(
      validateAuditFixReview(
        plan.value,
        { ...receipt, reviewer_identity: "fixer" },
        "fixer",
        "fix-session",
        packet.value.head_sha,
      ),
    ).toMatchObject({ ok: false, failures: [{ code: "HIL_AUDIT_FIX_SELF_APPROVED" }] });
  });
});
