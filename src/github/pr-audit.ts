import { createHash } from "node:crypto";

type Digest = `sha256:${string}`;
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const SHA = /^[0-9a-f]{40,64}$/;

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}

function digest(value: unknown): Digest {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

function present(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validDigest(value: unknown): value is Digest {
  return typeof value === "string" && DIGEST.test(value);
}

export type GithubPrActionV1 =
  | "opened"
  | "reopened"
  | "synchronize"
  | "ready_for_review"
  | "closed"
  | "completed";

export interface RawPrDeliveryV1 {
  schema_version: "helix-github-pr-delivery-input.v1";
  provider: "github";
  delivery_id: string;
  event_name: "pull_request" | "workflow_run";
  action: GithubPrActionV1;
  repository_id: string;
  pr_number: number;
  base_ref: string;
  base_sha: string;
  base_tree_digest: string;
  head_ref: string;
  head_sha: string;
  head_tree_digest: string;
  payload_digest: string;
  received_at: string;
}

export interface DeliverySchemaV1 {
  schema_version: "helix-github-pr-delivery-schema.v1";
  schema_revision: number;
  allowed_events: readonly ("pull_request" | "workflow_run")[];
  allowed_actions: readonly GithubPrActionV1[];
  required_field_ids: readonly string[];
  schema_digest: string;
}

export interface TransportReceiptV1 {
  schema_version: "helix-github-transport-receipt.v1";
  provider: "github";
  delivery_id: string;
  signature_algorithm: "sha256";
  signature_verified: true;
  body_digest: string;
  transport_metadata_digest: string;
  received_at: string;
  receipt_digest: string;
}

export interface VerifiedPrDeliveryV1 {
  schema_version: "helix-verified-pr-delivery.v1";
  pr_delivery_id: string;
  provider: "github";
  delivery_id: string;
  action: GithubPrActionV1;
  repository_id: string;
  pr_number: number;
  base_ref: string;
  base_sha: string;
  base_tree_digest: string;
  head_ref: string;
  payload_head_sha: string;
  payload_head_tree_digest: string;
  payload_digest: string;
  transport_receipt_digest: string;
  delivery_digest: Digest;
}

export interface PrAuditFailureV1 {
  code:
    | "HIL_GITHUB_DELIVERY_DUPLICATE"
    | "HIL_PR_DELIVERY_DUPLICATED"
    | "HIL_GITHUB_HEAD_MISMATCH"
    | "HIL_PR_AUDIT_HOOK_MISSED"
    | "HIL_FORWARD_LOOP_NOT_CONVERGED"
    | "HIL_GITHUB_DELIVERY_CONFLICT"
    | "HIL_AUDIT_ROLE_NOT_SEPARATED"
    | "HIL_AUDIT_FINDING_STALE"
    | "HIL_FINDING_DUPLICATE_TARGET_MISSING"
    | "HIL_FINDING_DISPOSITION_INVALID"
    | "HIL_FINDING_DROPPED"
    | "HIL_FINDING_PROMOTION_PARTIAL";
  fields: readonly string[];
  evidence_digest: Digest;
}

export type PrAuditResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; failures: readonly PrAuditFailureV1[] };

function failure(
  code: PrAuditFailureV1["code"],
  fields: readonly string[],
): PrAuditResultV1<never> {
  const stable = [...new Set(fields)].sort();
  return {
    ok: false,
    failures: [{ code, fields: stable, evidence_digest: digest({ code, fields: stable }) }],
  };
}

export function verifyGithubPrDelivery(
  raw: RawPrDeliveryV1,
  schema: DeliverySchemaV1,
  transport: TransportReceiptV1,
): PrAuditResultV1<VerifiedPrDeliveryV1> {
  const invalid: string[] = [];
  if (!schema.allowed_events.includes(raw.event_name)) invalid.push("event_name");
  if (!schema.allowed_actions.includes(raw.action)) invalid.push("action");
  for (const field of schema.required_field_ids) {
    if (!present((raw as unknown as Record<string, unknown>)[field]))
      invalid.push(`required.${field}`);
  }
  if (transport.provider !== raw.provider) invalid.push("transport.provider");
  if (transport.delivery_id !== raw.delivery_id) invalid.push("transport.delivery_id");
  if (transport.body_digest !== raw.payload_digest) invalid.push("transport.body_digest");
  for (const [field, value] of [
    ["schema.schema_digest", schema.schema_digest],
    ["payload_digest", raw.payload_digest],
    ["base_tree_digest", raw.base_tree_digest],
    ["head_tree_digest", raw.head_tree_digest],
    ["transport.transport_metadata_digest", transport.transport_metadata_digest],
    ["transport.receipt_digest", transport.receipt_digest],
  ] as const)
    if (!validDigest(value)) invalid.push(field);
  if (!SHA.test(raw.base_sha)) invalid.push("base_sha");
  if (!SHA.test(raw.head_sha)) invalid.push("head_sha");
  if (!Number.isInteger(raw.pr_number) || raw.pr_number <= 0) invalid.push("pr_number");
  if (invalid.length > 0) return failure("HIL_PR_AUDIT_HOOK_MISSED", invalid);
  const body = {
    schema_version: "helix-verified-pr-delivery.v1" as const,
    pr_delivery_id: `pr-delivery:${raw.repository_id}:${raw.pr_number}:${raw.delivery_id}`,
    provider: "github" as const,
    delivery_id: raw.delivery_id,
    action: raw.action,
    repository_id: raw.repository_id,
    pr_number: raw.pr_number,
    base_ref: raw.base_ref,
    base_sha: raw.base_sha,
    base_tree_digest: raw.base_tree_digest,
    head_ref: raw.head_ref,
    payload_head_sha: raw.head_sha,
    payload_head_tree_digest: raw.head_tree_digest,
    payload_digest: raw.payload_digest,
    transport_receipt_digest: transport.receipt_digest,
  };
  return { ok: true, value: { ...body, delivery_digest: digest(body) } };
}

export interface PriorDeliveryV1 {
  delivery_id: string;
  delivery_digest: string;
  idempotency_receipt_digest: string;
}

export interface DeliveryDecisionV1 {
  schema_version: "helix-pr-delivery-decision.v1";
  delivery_id: string;
  delivery_digest: string;
  verdict: "accept" | "duplicate_noop";
  prior_receipt_digest: string | null;
  authoritative_increment: 0 | 1;
  decision_digest: Digest;
}

export function decidePrDeliveryIdempotency(
  delivery: VerifiedPrDeliveryV1,
  prior: PriorDeliveryV1 | null,
): PrAuditResultV1<DeliveryDecisionV1> {
  if (
    prior &&
    prior.delivery_id === delivery.delivery_id &&
    prior.delivery_digest !== delivery.delivery_digest
  )
    return failure("HIL_GITHUB_DELIVERY_CONFLICT", ["delivery_digest"]);
  if (prior && prior.delivery_id === delivery.delivery_id) {
    const body = {
      schema_version: "helix-pr-delivery-decision.v1" as const,
      delivery_id: delivery.delivery_id,
      delivery_digest: delivery.delivery_digest,
      verdict: "duplicate_noop" as const,
      prior_receipt_digest: prior.idempotency_receipt_digest,
      authoritative_increment: 0 as const,
    };
    return { ok: true, value: { ...body, decision_digest: digest(body) } };
  }
  const body = {
    schema_version: "helix-pr-delivery-decision.v1" as const,
    delivery_id: delivery.delivery_id,
    delivery_digest: delivery.delivery_digest,
    verdict: "accept" as const,
    prior_receipt_digest: null,
    authoritative_increment: 1 as const,
  };
  return { ok: true, value: { ...body, decision_digest: digest(body) } };
}

export interface PrHeadObservationV1 {
  repository_id: string;
  pr_number: number;
  base_ref: string;
  base_sha: string;
  base_tree_digest: string;
  head_ref: string;
  head_sha: string;
  head_tree_digest: string;
  merge_base_sha: string;
  merge_base_tree_digest: string;
  diff_base_digest: string;
  provider_receipt_digest: string;
}

export interface PrComparisonIdentityV1 extends PrHeadObservationV1 {
  schema_version: "helix-pr-comparison-identity.v1";
  identity_digest: Digest;
}

export type CurrentPrHeadV1 = Omit<PrComparisonIdentityV1, "schema_version"> & {
  schema_version: "helix-current-pr-head.v1";
  pr_head_id: string;
  delivery_digest: string;
  status: "current";
  head_identity_digest: Digest;
};

export function resolveCurrentPrHead(
  delivery: VerifiedPrDeliveryV1,
  observed: PrHeadObservationV1,
): PrAuditResultV1<CurrentPrHeadV1> {
  const invalid: string[] = [];
  for (const field of [
    "repository_id",
    "pr_number",
    "base_ref",
    "base_sha",
    "base_tree_digest",
    "head_ref",
  ] as const)
    if (observed[field] !== delivery[field]) invalid.push(field);
  if (observed.head_sha !== delivery.payload_head_sha) invalid.push("head_sha");
  if (observed.head_tree_digest !== delivery.payload_head_tree_digest)
    invalid.push("head_tree_digest");
  for (const field of [
    "merge_base_sha",
    "merge_base_tree_digest",
    "diff_base_digest",
    "provider_receipt_digest",
  ] as const)
    if (!present(observed[field])) invalid.push(field);
  if (invalid.length > 0) return failure("HIL_GITHUB_HEAD_MISMATCH", invalid);
  const comparisonBody = {
    ...observed,
    schema_version: "helix-pr-comparison-identity.v1" as const,
  };
  const identityDigest = digest(comparisonBody);
  return {
    ok: true,
    value: {
      ...comparisonBody,
      schema_version: "helix-current-pr-head.v1",
      identity_digest: identityDigest,
      pr_head_id: `pr-head:${delivery.repository_id}:${delivery.pr_number}:${observed.head_sha}`,
      delivery_digest: delivery.delivery_digest,
      status: "current",
      head_identity_digest: identityDigest,
    },
  };
}

export interface AuditPolicyV1 {
  policy_id: string;
  policy_version: string;
  include_all_base_branches: true;
  required_view_kinds: readonly ("issue" | "contract" | "design" | "test" | "ci" | "coverage")[];
  policy_digest: string;
}

export interface AuditRoleIdentityV1 {
  runtime: "claude" | "codex";
  identity_id: string;
  role: "auditor" | "implementer";
  provider_family: string;
  model_family: string;
  identity_digest: string;
}

export interface AuditRoleSetV1 {
  claude: AuditRoleIdentityV1;
  codex: AuditRoleIdentityV1;
  separation_policy_digest: string;
  role_set_digest: string;
}

export interface PrAuditJobPlanV1 {
  schema_version: "helix-pr-audit-job-plan.v1";
  audit_job_id: string;
  delivery: VerifiedPrDeliveryV1;
  head: CurrentPrHeadV1;
  policy: AuditPolicyV1;
  roles: AuditRoleSetV1;
  cause_id: string;
  input_view_set_digest: Digest;
  diff_artifact_digest: Digest;
  operation_id: string;
  expected_event_head: Digest;
  job_key_digest: Digest;
  plan_digest: Digest;
}

export function planPrAuditJob(
  delivery: VerifiedPrDeliveryV1,
  head: CurrentPrHeadV1,
  policy: AuditPolicyV1,
  roles: AuditRoleSetV1,
): PrAuditResultV1<PrAuditJobPlanV1> {
  const invalid: string[] = [];
  if (!policy.include_all_base_branches) invalid.push("include_all_base_branches");
  const required = ["issue", "contract", "design", "test", "ci", "coverage"];
  if (required.some((kind) => !policy.required_view_kinds.includes(kind as never)))
    invalid.push("required_view_kinds");
  if (roles.claude.role !== "auditor" || roles.codex.role !== "implementer") invalid.push("roles");
  if (
    roles.claude.identity_id === roles.codex.identity_id ||
    roles.claude.identity_digest === roles.codex.identity_digest
  )
    invalid.push("role_identity");
  if (head.delivery_digest !== delivery.delivery_digest) invalid.push("delivery_digest");
  for (const [field, value] of [
    ["policy_digest", policy.policy_digest],
    ["role_set_digest", roles.role_set_digest],
  ] as const)
    if (!validDigest(value)) invalid.push(field);
  if (invalid.length > 0) return failure("HIL_AUDIT_ROLE_NOT_SEPARATED", invalid);
  const identity = {
    delivery: delivery.delivery_digest,
    head: head.head_identity_digest,
    policy: policy.policy_digest,
    roles: roles.role_set_digest,
  };
  const jobKey = digest(identity);
  const body = {
    schema_version: "helix-pr-audit-job-plan.v1" as const,
    audit_job_id: `pr-audit:${delivery.repository_id}:${delivery.pr_number}:${jobKey.slice(7, 23)}`,
    delivery,
    head,
    policy,
    roles,
    cause_id: delivery.pr_delivery_id,
    input_view_set_digest: digest({
      policy: policy.policy_digest,
      head: head.head_identity_digest,
      kind: "views",
    }),
    diff_artifact_digest: digest({ head: head.head_identity_digest, diff: head.diff_base_digest }),
    operation_id: `operation:${jobKey.slice(7)}`,
    expected_event_head: digest({ repository: delivery.repository_id, pr: delivery.pr_number }),
    job_key_digest: jobKey,
  };
  return { ok: true, value: { ...body, plan_digest: digest(body) } };
}

export interface AuditJobReceiptV1 {
  operation_id: string;
  delivery_id: string;
  audit_job_id: string;
  authoritative_increment: 0 | 1;
  receipt_digest: Digest;
}

export interface PrAuditStorePortV1 {
  commitJob(plan: PrAuditJobPlanV1): Promise<PrAuditResultV1<AuditJobReceiptV1>>;
}

export async function commitPrAuditJobExactlyOnce(
  plan: PrAuditJobPlanV1,
  port: PrAuditStorePortV1,
): Promise<PrAuditResultV1<AuditJobReceiptV1>> {
  try {
    return await port.commitJob(plan);
  } catch {
    return failure("HIL_PR_DELIVERY_DUPLICATED", ["transaction"]);
  }
}

export interface PrAuditJobV1 {
  audit_job_id: string;
  head_identity_digest: string;
  policy_digest: string;
  input_view_set_digest: string;
  diff_artifact_digest: string;
  auditor_identity_digest: string;
  implementer_identity_digest: string;
  comparison: PrComparisonIdentityV1;
  state: "queued" | "running" | "completed" | "failed" | "stale";
}

export interface AuditViewV1 {
  view_kind: "issue" | "contract" | "design" | "test" | "ci" | "coverage";
  subject_id: string;
  subject_digest: string;
  status: "current" | "stale";
}

export interface AuditViewSetV1 {
  views: readonly AuditViewV1[];
  view_set_digest: string;
}

export interface PrDiffArtifactV1 {
  repository_id: string;
  pr_number: number;
  head_identity_digest: string;
  artifact_digest: string;
}

export interface ClaudeAuditTaskV1 {
  schema_version: "helix-claude-audit-task.v1";
  task_id: string;
  audit_job_id: string;
  head_identity_digest: string;
  policy_digest: string;
  view_set_digest: string;
  diff_artifact_digest: string;
  auditor_identity_digest: string;
  implementer_identity_digest: string;
  role_brief_digest: Digest;
  authority_scope: "finding_proposal_only";
  read_only: true;
  task_digest: Digest;
}

export function buildClaudeAuditTask(
  job: PrAuditJobV1,
  views: AuditViewSetV1,
  diff: PrDiffArtifactV1,
): PrAuditResultV1<ClaudeAuditTaskV1> {
  const invalid: string[] = [];
  if (job.state !== "queued" && job.state !== "running") invalid.push("job.state");
  if (views.view_set_digest !== job.input_view_set_digest) invalid.push("view_set_digest");
  if (diff.artifact_digest !== job.diff_artifact_digest) invalid.push("diff_artifact_digest");
  if (diff.head_identity_digest !== job.head_identity_digest) invalid.push("head_identity_digest");
  if (views.views.some((view) => view.status !== "current")) invalid.push("views.status");
  const required = ["issue", "contract", "design", "test", "ci", "coverage"];
  if (required.some((kind) => !views.views.some((view) => view.view_kind === kind)))
    invalid.push("views.required");
  if (job.auditor_identity_digest === job.implementer_identity_digest)
    invalid.push("role_identity");
  if (invalid.length > 0) return failure("HIL_FORWARD_LOOP_NOT_CONVERGED", invalid);
  const body = {
    schema_version: "helix-claude-audit-task.v1" as const,
    task_id: `claude-audit-task:${job.audit_job_id}`,
    audit_job_id: job.audit_job_id,
    head_identity_digest: job.head_identity_digest,
    policy_digest: job.policy_digest,
    view_set_digest: views.view_set_digest,
    diff_artifact_digest: diff.artifact_digest,
    auditor_identity_digest: job.auditor_identity_digest,
    implementer_identity_digest: job.implementer_identity_digest,
    role_brief_digest: digest({ role: "auditor", scope: "finding_proposal_only", read_only: true }),
    authority_scope: "finding_proposal_only" as const,
    read_only: true as const,
  };
  return { ok: true, value: { ...body, task_digest: digest(body) } };
}

export interface FindingSubjectSpanV1 {
  artifact_id: string;
  artifact_digest: string;
  start_line: number;
  end_line: number;
  span_digest: string;
}

export interface AuditFindingProposalV1 {
  audit_job_id: string;
  head_identity_digest: string;
  policy_digest: string;
  category: "bug" | "risk" | "behavior_regression" | "missing_test" | "design_gap" | "telemetry";
  severity: "blocker" | "critical" | "major" | "minor" | "suggestion";
  affected_layer: string;
  subject_spans: readonly FindingSubjectSpanV1[];
  evidence_digest: string;
  db_query_digest: string;
  diff_digest: string;
  recommended_route: "redesign" | "reverse" | "implementation" | "risk_decision" | "telemetry";
  producer_identity_digest: string;
  producer_role: "auditor";
  producer_provider_family: string;
  proposal_digest: string;
}

export interface EvidenceIndexV1 {
  entries: readonly {
    evidence_digest: string;
    subject_digest: string;
    status: "current" | "stale";
  }[];
}

export interface AuditFindingV1 extends AuditFindingProposalV1 {
  schema_version: "helix-audit-finding.v1";
  finding_id: string;
  finding_fingerprint: Digest;
  state: "finding_open";
  finding_digest: Digest;
}

export function validateAuditFinding(
  proposal: AuditFindingProposalV1,
  job: PrAuditJobV1,
  evidence: EvidenceIndexV1,
): PrAuditResultV1<AuditFindingV1> {
  const invalid: string[] = [];
  if (job.state === "stale" || proposal.audit_job_id !== job.audit_job_id)
    invalid.push("audit_job_id");
  if (proposal.head_identity_digest !== job.head_identity_digest)
    invalid.push("head_identity_digest");
  if (proposal.policy_digest !== job.policy_digest) invalid.push("policy_digest");
  if (
    proposal.producer_role !== "auditor" ||
    proposal.producer_identity_digest !== job.auditor_identity_digest
  )
    invalid.push("producer_identity");
  if (proposal.producer_identity_digest === job.implementer_identity_digest)
    invalid.push("producer_separation");
  if (proposal.subject_spans.length === 0) invalid.push("subject_spans");
  for (const [index, span] of proposal.subject_spans.entries()) {
    if (!present(span.artifact_id) || span.start_line < 1 || span.end_line < span.start_line)
      invalid.push(`subject_spans.${index}`);
    const matched = evidence.entries.some(
      (entry) => entry.status === "current" && entry.subject_digest === span.artifact_digest,
    );
    if (!matched) invalid.push(`subject_spans.${index}.evidence`);
  }
  for (const [field, value] of [
    ["evidence_digest", proposal.evidence_digest],
    ["db_query_digest", proposal.db_query_digest],
    ["diff_digest", proposal.diff_digest],
    ["proposal_digest", proposal.proposal_digest],
  ] as const)
    if (!validDigest(value)) invalid.push(field);
  if (
    !evidence.entries.some(
      (entry) => entry.status === "current" && entry.evidence_digest === proposal.evidence_digest,
    )
  )
    invalid.push("evidence_digest.unresolved");
  if (invalid.length > 0) return failure("HIL_AUDIT_FINDING_STALE", invalid);
  const fingerprint = digest({
    head: proposal.head_identity_digest,
    category: proposal.category,
    layer: proposal.affected_layer,
    spans: proposal.subject_spans,
    evidence: proposal.evidence_digest,
  });
  const body = {
    ...proposal,
    schema_version: "helix-audit-finding.v1" as const,
    finding_id: `audit-finding:${fingerprint.slice(7, 23)}`,
    finding_fingerprint: fingerprint,
    state: "finding_open" as const,
  };
  return { ok: true, value: { ...body, finding_digest: digest(body) } };
}

export interface AuditJobInvalidationDecisionV1 {
  schema_version: "helix-audit-job-invalidation-decision.v1";
  audit_job_id: string;
  stale_required: boolean;
  changed_fields: readonly (
    | "base_sha"
    | "base_tree"
    | "merge_base_sha"
    | "merge_base_tree"
    | "diff_base"
  )[];
  superseding_job_required: boolean;
  invalidation_digest: Digest;
}

export function invalidateAuditJobForBaseChange(
  current: PrAuditJobV1,
  observed: PrComparisonIdentityV1,
): PrAuditResultV1<AuditJobInvalidationDecisionV1> {
  if (
    current.comparison.repository_id !== observed.repository_id ||
    current.comparison.pr_number !== observed.pr_number ||
    current.comparison.head_sha !== observed.head_sha
  )
    return failure("HIL_AUDIT_FINDING_STALE", ["comparison_identity"]);
  const pairs = [
    ["base_sha", "base_sha"],
    ["base_tree", "base_tree_digest"],
    ["merge_base_sha", "merge_base_sha"],
    ["merge_base_tree", "merge_base_tree_digest"],
    ["diff_base", "diff_base_digest"],
  ] as const;
  const changed = pairs
    .filter(([, field]) => current.comparison[field] !== observed[field])
    .map(([label]) => label);
  const body = {
    schema_version: "helix-audit-job-invalidation-decision.v1" as const,
    audit_job_id: current.audit_job_id,
    stale_required: changed.length > 0,
    changed_fields: changed,
    superseding_job_required: changed.length > 0,
  };
  return { ok: true, value: { ...body, invalidation_digest: digest(body) } };
}
