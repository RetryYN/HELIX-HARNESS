import { describe, expect, it } from "vitest";
import {
  type AuthorityIndexEntryV1,
  buildFindingPromotion,
  commitFindingPromotionAtomically,
  type DispositionProposalV1,
  evaluateFindingDisposition,
} from "../src/audit/finding-promotion";
import {
  type AuditFindingV1,
  buildClaudeAuditTask,
  commitPrAuditJobExactlyOnce,
  decidePrDeliveryIdempotency,
  type PrAuditJobPlanV1,
  type PrAuditJobV1,
  type VerifiedPrDeliveryV1,
  validateAuditFinding,
} from "../src/github/pr-audit";

const d = (char: string): `sha256:${string}` => `sha256:${char.repeat(64)}`;

function finding(): AuditFindingV1 {
  return {
    schema_version: "helix-audit-finding.v1",
    audit_job_id: "job-1",
    head_identity_digest: d("1"),
    policy_digest: d("2"),
    category: "bug",
    severity: "major",
    affected_layer: "L6",
    subject_spans: [
      {
        artifact_id: "src/file.ts",
        artifact_digest: d("3"),
        start_line: 1,
        end_line: 2,
        span_digest: d("4"),
      },
    ],
    evidence_digest: d("5"),
    db_query_digest: d("6"),
    diff_digest: d("7"),
    recommended_route: "implementation",
    producer_identity_digest: d("8"),
    producer_role: "auditor",
    producer_provider_family: "anthropic",
    proposal_digest: d("9"),
    finding_id: "finding-1",
    finding_fingerprint: d("a"),
    state: "finding_open",
    finding_digest: d("b"),
  };
}

function dispositionProposal(
  disposition: DispositionProposalV1["disposition"] = "actionable",
): DispositionProposalV1 {
  const value = finding();
  return {
    finding_id: value.finding_id,
    expected_finding_digest: value.finding_digest,
    disposition,
    target_id: disposition === "actionable" || disposition === "duplicate" ? "issue-1" : null,
    target_digest: disposition === "actionable" || disposition === "duplicate" ? d("c") : null,
    evidence_digests: [d("d")],
    reviewer_receipt_digest: disposition === "false_positive" ? d("e") : null,
    approval_receipt_digest: disposition === "accepted_risk" ? d("f") : null,
    observation_owner: disposition === "telemetry" ? "owner" : null,
    expires_at: disposition === "telemetry" ? "2026-08-01T00:00:00Z" : null,
    appeal_route_digest: d("0"),
  };
}

function authority(proposal: DispositionProposalV1): AuthorityIndexEntryV1[] {
  const kind =
    proposal.disposition === "false_positive"
      ? "independent_review"
      : proposal.disposition === "accepted_risk"
        ? "po_approval"
        : proposal.disposition === "telemetry"
          ? "telemetry_owner"
          : "target_acceptance";
  return [
    {
      authority_kind: kind,
      authority_id: "authority-1",
      subject_digest: proposal.target_digest ?? finding().finding_digest,
      receipt_digest: d("1"),
      status: "current",
    },
  ];
}

function actionableReceipt() {
  const proposal = dispositionProposal();
  const result = evaluateFindingDisposition(finding(), proposal, authority(proposal));
  if (!result.ok) throw new Error("disposition fixture invalid");
  return result.value;
}

function bundleInputs() {
  const value = finding();
  const cause = value.finding_id;
  return {
    finding: value,
    disposition: actionableReceipt(),
    issue: {
      issue_id: "issue-1",
      issue_revision: 1,
      contract_digest: d("2"),
      finding_id: cause,
      cause_id: cause,
    },
    reverse: {
      reverse_run_id: "reverse-1",
      phase: "R0" as const,
      issue_id: "issue-1",
      issue_revision: 1,
      finding_id: cause,
      cause_id: cause,
      reverse_digest: d("3"),
    },
    memory: {
      summary_id: "summary-1",
      issue_id: "issue-1",
      issue_revision: 1,
      finding_id: cause,
      cause_id: cause,
      sanitized_summary_digest: d("4"),
      raw_finding_included: false as const,
      summary_digest: d("5"),
    },
    queue: {
      queue_item_id: "queue-1",
      issue_id: "issue-1",
      issue_revision: 1,
      reverse_run_id: "reverse-1",
      gate_reference_digest: d("6"),
      finding_id: cause,
      cause_id: cause,
      state: "blocked_on_reverse" as const,
      queue_digest: d("7"),
    },
  };
}

function bundle() {
  const input = bundleInputs();
  const result = buildFindingPromotion(input);
  if (!result.ok) throw new Error("promotion fixture invalid");
  return result.value;
}

describe("PR audit promotion and composition", () => {
  it("U-GPAP-008: exact 4 memberを同じcause/head/digestへ束縛する", () => {
    const result = bundle();
    expect(result.members.map((member) => member.member_kind)).toEqual([
      "issue",
      "reverse",
      "memory_summary",
      "codex_queue",
    ]);
    const input = bundleInputs();
    expect(
      buildFindingPromotion({
        ...input,
        reverse: { ...input.reverse, cause_id: "other" },
      }),
    ).toMatchObject({ ok: false, failures: [{ code: "HIL_FINDING_DROPPED" }] });
  });

  it("U-GPAP-009: promotion transactionのreceipt/rollbackをport境界で保持する", async () => {
    const value = bundle();
    expect(
      commitFindingPromotionAtomically(value, {
        commitPromotion: async () => ({
          ok: true,
          value: {
            promotion_id: value.promotion_id,
            operation_id: value.operation_id,
            finding_id: value.finding.finding_id,
            member_set_digest: value.member_set_digest,
            status: "queue_ready",
            authoritative_increment: 1,
            receipt_digest: d("8"),
          },
        }),
      }),
    ).resolves.toMatchObject({ ok: true, value: { status: "queue_ready" } });
    expect(
      commitFindingPromotionAtomically(value, {
        commitPromotion: async () => {
          throw new Error("fault");
        },
      }),
    ).resolves.toMatchObject({ ok: false, failures: [{ code: "HIL_FINDING_PROMOTION_PARTIAL" }] });
  });

  it("U-GPAP-010: 5 dispositionのauthorityとappeal routeをfail-closeする", () => {
    for (const kind of [
      "actionable",
      "duplicate",
      "false_positive",
      "accepted_risk",
      "telemetry",
    ] as const) {
      const proposal = dispositionProposal(kind);
      expect(evaluateFindingDisposition(finding(), proposal, authority(proposal))).toMatchObject({
        ok: true,
      });
      expect(evaluateFindingDisposition(finding(), proposal, [])).toMatchObject({ ok: false });
      expect(
        evaluateFindingDisposition(
          finding(),
          { ...proposal, appeal_route_digest: "" },
          authority(proposal),
        ),
      ).toMatchObject({ ok: false });
    }
  });

  it("U-GPAP-011: delivery decisionからjob commitまで同じoperationを維持する", async () => {
    const delivery = {
      delivery_id: "delivery-1",
      delivery_digest: d("1"),
    } as VerifiedPrDeliveryV1;
    expect(decidePrDeliveryIdempotency(delivery, null)).toMatchObject({ ok: true });
    const plan = {
      operation_id: "operation-1",
      delivery: { delivery_id: delivery.delivery_id },
      audit_job_id: "job-1",
    } as PrAuditJobPlanV1;
    expect(
      commitPrAuditJobExactlyOnce(plan, {
        commitJob: async (received) => ({
          ok: true,
          value: {
            operation_id: received.operation_id,
            delivery_id: received.delivery.delivery_id,
            audit_job_id: received.audit_job_id,
            authoritative_increment: 1,
            receipt_digest: d("2"),
          },
        }),
      }),
    ).resolves.toMatchObject({ ok: true, value: { operation_id: "operation-1" } });
  });

  it("U-GPAP-012: duplicate deliveryはcommit増分0のまま保持する", () => {
    const delivery = { delivery_id: "delivery-1", delivery_digest: d("1") } as VerifiedPrDeliveryV1;
    expect(
      decidePrDeliveryIdempotency(delivery, {
        delivery_id: delivery.delivery_id,
        delivery_digest: delivery.delivery_digest,
        idempotency_receipt_digest: d("2"),
      }),
    ).toMatchObject({ ok: true, value: { authoritative_increment: 0 } });
  });

  it("U-GPAP-013: read-only taskから同じjob/head/policyのfindingだけを受理する", () => {
    const job = {
      audit_job_id: "job-1",
      head_identity_digest: d("1"),
      policy_digest: d("2"),
      input_view_set_digest: d("3"),
      diff_artifact_digest: d("4"),
      auditor_identity_digest: d("8"),
      implementer_identity_digest: d("9"),
      state: "queued",
    } as PrAuditJobV1;
    const views = {
      view_set_digest: d("3"),
      views: (["issue", "contract", "design", "test", "ci", "coverage"] as const).map(
        (view_kind) => ({
          view_kind,
          subject_id: view_kind,
          subject_digest: d("a"),
          status: "current" as const,
        }),
      ),
    };
    expect(
      buildClaudeAuditTask(job, views, {
        repository_id: "repo",
        pr_number: 90,
        head_identity_digest: job.head_identity_digest,
        artifact_digest: job.diff_artifact_digest,
      }),
    ).toMatchObject({ ok: true, value: { read_only: true } });
    const proposal = finding();
    expect(
      validateAuditFinding(proposal, job, {
        entries: [
          { evidence_digest: proposal.evidence_digest, subject_digest: d("3"), status: "current" },
        ],
      }),
    ).toMatchObject({ ok: true });
  });

  it("U-GPAP-014: auditor/implementer identity衝突ではtaskを生成しない", () => {
    const job = {
      audit_job_id: "job-1",
      head_identity_digest: d("1"),
      policy_digest: d("2"),
      input_view_set_digest: d("3"),
      diff_artifact_digest: d("4"),
      auditor_identity_digest: d("8"),
      implementer_identity_digest: d("8"),
      state: "queued",
    } as PrAuditJobV1;
    expect(
      buildClaudeAuditTask(
        job,
        {
          view_set_digest: d("3"),
          views: (["issue", "contract", "design", "test", "ci", "coverage"] as const).map(
            (view_kind) => ({
              view_kind,
              subject_id: view_kind,
              subject_digest: d("a"),
              status: "current",
            }),
          ),
        },
        {
          repository_id: "repo",
          pr_number: 90,
          head_identity_digest: d("1"),
          artifact_digest: d("4"),
        },
      ),
    ).toMatchObject({ ok: false });
  });

  it("U-GPAP-015: audit job port faultをsuccessへ変換しない", async () => {
    expect(
      commitPrAuditJobExactlyOnce({} as PrAuditJobPlanV1, {
        commitJob: async () => {
          throw new Error("write fault");
        },
      }),
    ).resolves.toMatchObject({ ok: false });
  });

  it("U-GPAP-016: same promotion operation replayは増分0を保持する", async () => {
    const value = bundle();
    expect(
      commitFindingPromotionAtomically(value, {
        commitPromotion: async () => ({
          ok: true,
          value: {
            promotion_id: value.promotion_id,
            operation_id: value.operation_id,
            finding_id: value.finding.finding_id,
            member_set_digest: value.member_set_digest,
            status: "queue_ready",
            authoritative_increment: 0,
            receipt_digest: d("9"),
          },
        }),
      }),
    ).resolves.toMatchObject({ ok: true, value: { authoritative_increment: 0 } });
  });
});
