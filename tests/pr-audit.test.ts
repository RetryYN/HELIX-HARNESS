import { describe, expect, it } from "vitest";
import {
  type AuditPolicyV1,
  type AuditRoleSetV1,
  buildClaudeAuditTask,
  commitPrAuditJobExactlyOnce,
  decidePrDeliveryIdempotency,
  invalidateAuditJobForBaseChange,
  type PrAuditJobV1,
  type PrComparisonIdentityV1,
  planPrAuditJob,
  type RawPrDeliveryV1,
  resolveCurrentPrHead,
  validateAuditFinding,
  verifyGithubPrDelivery,
} from "../src/github/pr-audit";

const d = (char: string): `sha256:${string}` => `sha256:${char.repeat(64)}`;
const head = "a".repeat(40);
const base = "b".repeat(40);

function raw(): RawPrDeliveryV1 {
  return {
    schema_version: "helix-github-pr-delivery-input.v1",
    provider: "github",
    delivery_id: "delivery-1",
    event_name: "pull_request",
    action: "opened",
    repository_id: "RetryYN/HELIX-HARNESS",
    pr_number: 90,
    base_ref: "main",
    base_sha: base,
    base_tree_digest: d("1"),
    head_ref: "feature",
    head_sha: head,
    head_tree_digest: d("2"),
    payload_digest: d("3"),
    received_at: "2026-07-22T15:00:00Z",
  };
}

function verified() {
  const input = raw();
  const result = verifyGithubPrDelivery(
    input,
    {
      schema_version: "helix-github-pr-delivery-schema.v1",
      schema_revision: 1,
      allowed_events: ["pull_request", "workflow_run"],
      allowed_actions: [
        "opened",
        "reopened",
        "synchronize",
        "ready_for_review",
        "closed",
        "completed",
      ],
      required_field_ids: ["delivery_id", "repository_id", "base_ref", "head_ref", "received_at"],
      schema_digest: d("4"),
    },
    {
      schema_version: "helix-github-transport-receipt.v1",
      provider: "github",
      delivery_id: input.delivery_id,
      signature_algorithm: "sha256",
      signature_verified: true,
      body_digest: input.payload_digest,
      transport_metadata_digest: d("5"),
      received_at: input.received_at,
      receipt_digest: d("6"),
    },
  );
  if (!result.ok) throw new Error("fixture delivery invalid");
  return result.value;
}

function currentHead() {
  const delivery = verified();
  const result = resolveCurrentPrHead(delivery, {
    repository_id: delivery.repository_id,
    pr_number: delivery.pr_number,
    base_ref: delivery.base_ref,
    base_sha: delivery.base_sha,
    base_tree_digest: delivery.base_tree_digest,
    head_ref: delivery.head_ref,
    head_sha: delivery.payload_head_sha,
    head_tree_digest: delivery.payload_head_tree_digest,
    merge_base_sha: base,
    merge_base_tree_digest: d("7"),
    diff_base_digest: d("8"),
    provider_receipt_digest: d("9"),
  });
  if (!result.ok) throw new Error("fixture head invalid");
  return result.value;
}

const policy: AuditPolicyV1 = {
  policy_id: "policy-1",
  policy_version: "1",
  include_all_base_branches: true,
  required_view_kinds: ["issue", "contract", "design", "test", "ci", "coverage"],
  policy_digest: d("a"),
};
const roles: AuditRoleSetV1 = {
  claude: {
    runtime: "claude",
    identity_id: "claude-reviewer",
    role: "auditor",
    provider_family: "anthropic",
    model_family: "claude",
    identity_digest: d("b"),
  },
  codex: {
    runtime: "codex",
    identity_id: "codex-worker",
    role: "implementer",
    provider_family: "openai",
    model_family: "gpt",
    identity_digest: d("c"),
  },
  separation_policy_digest: d("d"),
  role_set_digest: d("e"),
};

function jobFixture(): PrAuditJobV1 {
  const comparison = currentHead();
  return {
    audit_job_id: "audit-job-1",
    head_identity_digest: comparison.head_identity_digest,
    policy_digest: policy.policy_digest,
    input_view_set_digest: d("1"),
    diff_artifact_digest: d("2"),
    auditor_identity_digest: roles.claude.identity_digest,
    implementer_identity_digest: roles.codex.identity_digest,
    comparison: { ...comparison, schema_version: "helix-pr-comparison-identity.v1" },
    state: "queued",
  };
}

describe("GitHub PR audit core", () => {
  it("U-GPAP-001: transport/schema/action/payloadを検証する", () => {
    const delivery = verified();
    expect(delivery.delivery_digest).toMatch(/^sha256:/);
    const input = raw();
    expect(
      verifyGithubPrDelivery(
        { ...input, action: "opened" },
        {
          schema_version: "helix-github-pr-delivery-schema.v1",
          schema_revision: 1,
          allowed_events: ["pull_request"],
          allowed_actions: [],
          required_field_ids: ["delivery_id"],
          schema_digest: d("4"),
        },
        {
          schema_version: "helix-github-transport-receipt.v1",
          provider: "github",
          delivery_id: input.delivery_id,
          signature_algorithm: "sha256",
          signature_verified: true,
          body_digest: input.payload_digest,
          transport_metadata_digest: d("5"),
          received_at: input.received_at,
          receipt_digest: d("6"),
        },
      ),
    ).toMatchObject({ ok: false });
  });

  it("U-GPAP-002: same digestをno-op、異digestをconflictにする", () => {
    const delivery = verified();
    expect(decidePrDeliveryIdempotency(delivery, null)).toMatchObject({
      ok: true,
      value: { verdict: "accept", authoritative_increment: 1 },
    });
    expect(
      decidePrDeliveryIdempotency(delivery, {
        delivery_id: delivery.delivery_id,
        delivery_digest: delivery.delivery_digest,
        idempotency_receipt_digest: d("f"),
      }),
    ).toMatchObject({ ok: true, value: { verdict: "duplicate_noop", authoritative_increment: 0 } });
    expect(
      decidePrDeliveryIdempotency(delivery, {
        delivery_id: delivery.delivery_id,
        delivery_digest: d("0"),
        idempotency_receipt_digest: d("f"),
      }),
    ).toMatchObject({ ok: false, failures: [{ code: "HIL_GITHUB_DELIVERY_CONFLICT" }] });
  });

  it("U-GPAP-003: repository/PR/SHA/treeをexact照合する", () => {
    const delivery = verified();
    expect(currentHead().status).toBe("current");
    const observation = currentHead();
    expect(
      resolveCurrentPrHead(delivery, { ...observation, head_tree_digest: d("0") }),
    ).toMatchObject({ ok: false, failures: [{ code: "HIL_GITHUB_HEAD_MISMATCH" }] });
  });

  it("U-GPAP-004: 全baseを対象にjob keyとrole separationを拘束する", () => {
    const result = planPrAuditJob({ delivery: verified(), head: currentHead(), policy, roles });
    expect(result).toMatchObject({ ok: true });
    expect(
      planPrAuditJob({
        delivery: verified(),
        head: currentHead(),
        policy,
        roles: {
          ...roles,
          codex: { ...roles.codex, identity_id: roles.claude.identity_id },
        },
      }),
    ).toMatchObject({ ok: false });
    expect(
      planPrAuditJob({
        delivery: verified(),
        head: currentHead(),
        policy: { ...policy, required_view_kinds: ["issue"] },
        roles,
      }),
    ).toMatchObject({ ok: false });
  });

  it("U-GPAP-005: current views/diffとread-only role briefへtaskを束縛する", () => {
    const job = jobFixture();
    const views = {
      view_set_digest: job.input_view_set_digest,
      views: (["issue", "contract", "design", "test", "ci", "coverage"] as const).map(
        (view_kind) => ({
          view_kind,
          subject_id: view_kind,
          subject_digest: d("3"),
          status: "current" as const,
        }),
      ),
    };
    const diff = {
      repository_id: "repo",
      pr_number: 90,
      head_identity_digest: job.head_identity_digest,
      artifact_digest: job.diff_artifact_digest,
    };
    expect(buildClaudeAuditTask(job, views, diff)).toMatchObject({
      ok: true,
      value: { read_only: true, authority_scope: "finding_proposal_only" },
    });
    expect(
      buildClaudeAuditTask(job, { ...views, views: views.views.slice(1) }, diff),
    ).toMatchObject({ ok: false });
  });

  it("U-GPAP-006: findingをjob/head/policy/span/evidence/producerへ束縛する", () => {
    const job = jobFixture();
    const proposal = {
      audit_job_id: job.audit_job_id,
      head_identity_digest: job.head_identity_digest,
      policy_digest: job.policy_digest,
      category: "bug" as const,
      severity: "major" as const,
      affected_layer: "L6",
      subject_spans: [
        {
          artifact_id: "src/file.ts",
          artifact_digest: d("4"),
          start_line: 1,
          end_line: 2,
          span_digest: d("5"),
        },
      ],
      evidence_digest: d("6"),
      db_query_digest: d("7"),
      diff_digest: d("8"),
      recommended_route: "implementation" as const,
      producer_identity_digest: job.auditor_identity_digest,
      producer_role: "auditor" as const,
      producer_provider_family: "anthropic",
      proposal_digest: d("9"),
    };
    const evidence = {
      entries: [
        {
          evidence_digest: proposal.evidence_digest,
          subject_digest: d("4"),
          status: "current" as const,
        },
      ],
    };
    expect(validateAuditFinding(proposal, job, evidence)).toMatchObject({
      ok: true,
      value: { state: "finding_open" },
    });
    expect(
      validateAuditFinding(
        { ...proposal, producer_identity_digest: job.implementer_identity_digest },
        job,
        evidence,
      ),
    ).toMatchObject({ ok: false });
    expect(validateAuditFinding(proposal, job, { entries: [] })).toMatchObject({ ok: false });
  });

  it("U-GPAP-007: store portのexactly-once receiptを返し例外をfail-closeする", async () => {
    const plan = planPrAuditJob({ delivery: verified(), head: currentHead(), policy, roles });
    if (!plan.ok) throw new Error("plan fixture invalid");
    let calls = 0;
    const result = await commitPrAuditJobExactlyOnce(plan.value, {
      commitJob: async () => {
        calls += 1;
        return {
          ok: true,
          value: {
            operation_id: plan.value.operation_id,
            delivery_id: plan.value.delivery.delivery_id,
            audit_job_id: plan.value.audit_job_id,
            authoritative_increment: 1,
            receipt_digest: d("1"),
          },
        };
      },
    });
    expect(result).toMatchObject({ ok: true, value: { authoritative_increment: 1 } });
    expect(calls).toBe(1);
    expect(
      commitPrAuditJobExactlyOnce(plan.value, {
        commitJob: async () => {
          throw new Error("fault");
        },
      }),
    ).resolves.toMatchObject({ ok: false });
  });

  it("U-GPAP-017: head固定でもbase/merge-base/diff-base変化をstale化する", () => {
    const job = jobFixture();
    const same = invalidateAuditJobForBaseChange(job, job.comparison);
    expect(same).toMatchObject({ ok: true, value: { stale_required: false } });
    const mutations: [keyof PrComparisonIdentityV1, string][] = [
      ["base_sha", "c".repeat(40)],
      ["base_tree_digest", d("0")],
      ["merge_base_sha", "d".repeat(40)],
      ["merge_base_tree_digest", d("0")],
      ["diff_base_digest", d("0")],
    ];
    for (const [field, value] of mutations) {
      expect(
        invalidateAuditJobForBaseChange(job, { ...job.comparison, [field]: value }),
      ).toMatchObject({
        ok: true,
        value: { stale_required: true, superseding_job_required: true },
      });
    }
  });
});
