import { createHash } from "node:crypto";

export type Digest = `sha256:${string}`;
export type RequiredReviewContextKindV1 =
  | "authority_l0"
  | "prototype_l2"
  | "requirements_l3"
  | "basic_design_l4"
  | "issue_plan"
  | "diff"
  | "trace_consumers"
  | "security_blast_radius";

const REQUIRED_CONTEXT_KINDS: readonly RequiredReviewContextKindV1[] = [
  "authority_l0",
  "prototype_l2",
  "requirements_l3",
  "basic_design_l4",
  "issue_plan",
  "diff",
  "trace_consumers",
  "security_blast_radius",
];
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

function sha256(value: unknown): Digest {
  return `sha256:${createHash("sha256").update(canonicalJson(value)).digest("hex")}`;
}

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validDigest(value: unknown): value is Digest {
  return typeof value === "string" && DIGEST.test(value);
}

export interface ReviewContextMaterialV1 {
  kind: RequiredReviewContextKindV1;
  locator: string;
  content_digest: string;
  decision: "required" | "not_applicable";
  authority_digest: string;
}

export interface ContextualPrReviewPacketInputV1 {
  repository_id: string;
  pr_number: number;
  head_sha: string;
  head_tree_digest: string;
  base_sha: string;
  policy_digest: string;
  author_identity: string;
  author_session_id: string;
  worker_context_digest: string;
  materials: readonly ReviewContextMaterialV1[];
}

export interface ContextualPrReviewPacketV1 extends ContextualPrReviewPacketInputV1 {
  schema_version: "helix-contextual-pr-review-packet.v1";
  packet_digest: Digest;
}

export interface ContextualPrReviewReceiptV1 {
  schema_version: "helix-contextual-pr-review-receipt.v1";
  packet_digest: string;
  head_sha: string;
  reviewer_identity: string;
  reviewer_session_id: string;
  reviewer_context_digest: string;
  verdict: "approve" | "request_changes";
  findings_digest: string;
  reviewed_at: string;
  receipt_digest: string;
}

export interface MergeAdmissionFailureV1 {
  code:
    | "HIL_CONTEXT_REVIEW_INCOMPLETE"
    | "HIL_PR_DATABASE_NOT_CONVERGED"
    | "HIL_AUDIT_FIX_SELF_APPROVED"
    | "HIL_CI_PERFORMANCE_RECOVERY_MISSING"
    | "HIL_REQUIREMENT_USER_APPROVAL_MISSING"
    | "HIL_MAIN_RECOVERY_INCOMPLETE"
    | "HIL_PRODUCTION_PROMOTION_UNSAFE"
    | "HIL_UPDATE_BACKLOG_CLASSIFICATION_INVALID";
  fields: readonly string[];
  evidence_digest: Digest;
}

export type MergeAdmissionResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; failures: readonly MergeAdmissionFailureV1[] };

function failure(
  code: MergeAdmissionFailureV1["code"],
  fields: readonly string[],
): { ok: false; failures: readonly MergeAdmissionFailureV1[] } {
  const stableFields = [...new Set(fields)].sort();
  return {
    ok: false,
    failures: [
      { code, fields: stableFields, evidence_digest: sha256({ code, fields: stableFields }) },
    ],
  };
}

export function buildContextualPrReviewPacket(
  input: ContextualPrReviewPacketInputV1,
): MergeAdmissionResultV1<ContextualPrReviewPacketV1> {
  const invalid: string[] = [];
  if (!nonEmpty(input.repository_id)) invalid.push("repository_id");
  if (!Number.isInteger(input.pr_number) || input.pr_number <= 0) invalid.push("pr_number");
  if (!SHA.test(input.head_sha)) invalid.push("head_sha");
  if (!SHA.test(input.base_sha)) invalid.push("base_sha");
  for (const [field, value] of [
    ["head_tree_digest", input.head_tree_digest],
    ["policy_digest", input.policy_digest],
    ["worker_context_digest", input.worker_context_digest],
  ] as const) {
    if (!validDigest(value)) invalid.push(field);
  }
  for (const [field, value] of [
    ["author_identity", input.author_identity],
    ["author_session_id", input.author_session_id],
  ] as const) {
    if (!nonEmpty(value)) invalid.push(field);
  }
  const counts = new Map<RequiredReviewContextKindV1, number>();
  for (const [index, material] of input.materials.entries()) {
    counts.set(material.kind, (counts.get(material.kind) ?? 0) + 1);
    if (!REQUIRED_CONTEXT_KINDS.includes(material.kind)) invalid.push(`materials.${index}.kind`);
    if (!nonEmpty(material.locator)) invalid.push(`materials.${index}.locator`);
    if (!validDigest(material.content_digest)) invalid.push(`materials.${index}.content_digest`);
    if (!validDigest(material.authority_digest))
      invalid.push(`materials.${index}.authority_digest`);
    if (material.decision !== "required" && material.decision !== "not_applicable") {
      invalid.push(`materials.${index}.decision`);
    }
  }
  for (const kind of REQUIRED_CONTEXT_KINDS) {
    if (counts.get(kind) !== 1) invalid.push(`materials.${kind}`);
  }
  if (input.materials.length !== REQUIRED_CONTEXT_KINDS.length) invalid.push("materials.length");
  if (invalid.length > 0) return failure("HIL_CONTEXT_REVIEW_INCOMPLETE", invalid);
  const body = {
    schema_version: "helix-contextual-pr-review-packet.v1" as const,
    ...input,
    materials: input.materials.map((material) => ({ ...material })),
  };
  return { ok: true, value: { ...body, packet_digest: sha256(body) } };
}

export function validateContextualPrReviewReceipt(
  packet: ContextualPrReviewPacketV1,
  receipt: ContextualPrReviewReceiptV1,
  currentHead: string,
  fixer?: { identity: string; session_id: string; context_digest?: string },
): MergeAdmissionResultV1<ContextualPrReviewReceiptV1> {
  const invalid: string[] = [];
  if (receipt.packet_digest !== packet.packet_digest) invalid.push("packet_digest");
  if (receipt.head_sha !== packet.head_sha || currentHead !== packet.head_sha)
    invalid.push("head_sha");
  if (receipt.reviewer_identity === packet.author_identity) invalid.push("reviewer_identity");
  if (receipt.reviewer_session_id === packet.author_session_id) invalid.push("reviewer_session_id");
  if (receipt.reviewer_context_digest === packet.worker_context_digest) {
    invalid.push("reviewer_context_digest");
  }
  if (fixer?.identity === receipt.reviewer_identity) invalid.push("fixer_identity");
  if (fixer?.session_id === receipt.reviewer_session_id) invalid.push("fixer_session_id");
  if (fixer?.context_digest === receipt.reviewer_context_digest)
    invalid.push("fixer_context_digest");
  if (receipt.verdict !== "approve") invalid.push("verdict");
  if (!validDigest(receipt.findings_digest)) invalid.push("findings_digest");
  if (!nonEmpty(receipt.reviewed_at)) invalid.push("reviewed_at");
  if (invalid.length > 0) return failure("HIL_CONTEXT_REVIEW_INCOMPLETE", invalid);
  return { ok: true, value: { ...receipt } };
}

export interface PrDatabaseConvergenceProbeInputV1 {
  repository_id: string;
  pr_number: number;
  head_sha: string;
  event_head_digest: string;
  checkpoint_locator_digest: string;
  expected_schema_revision: number;
  rebuild_policy_digest: string;
}

export interface PrDatabaseConvergenceProbeV1 extends PrDatabaseConvergenceProbeInputV1 {
  schema_version: "helix-pr-db-convergence-probe.v1";
  probe_digest: Digest;
}

export function buildPrDatabaseConvergenceProbe(
  input: PrDatabaseConvergenceProbeInputV1,
): MergeAdmissionResultV1<PrDatabaseConvergenceProbeV1> {
  const invalid: string[] = [];
  if (!nonEmpty(input.repository_id)) invalid.push("repository_id");
  if (!Number.isInteger(input.pr_number) || input.pr_number <= 0) invalid.push("pr_number");
  if (!SHA.test(input.head_sha)) invalid.push("head_sha");
  if (!validDigest(input.event_head_digest)) invalid.push("event_head_digest");
  if (!validDigest(input.checkpoint_locator_digest)) invalid.push("checkpoint_locator_digest");
  if (!Number.isInteger(input.expected_schema_revision) || input.expected_schema_revision < 1) {
    invalid.push("expected_schema_revision");
  }
  if (!validDigest(input.rebuild_policy_digest)) invalid.push("rebuild_policy_digest");
  if (invalid.length > 0) return failure("HIL_PR_DATABASE_NOT_CONVERGED", invalid);
  const body = { schema_version: "helix-pr-db-convergence-probe.v1" as const, ...input };
  return { ok: true, value: { ...body, probe_digest: sha256(body) } };
}

export interface PrDatabaseConvergenceObservationV1 {
  schema_version: "helix-pr-db-convergence-observation.v1";
  source_head: string;
  event_head_digest: string;
  projection_digest: string;
  replay_projection_digest: string;
  checkpoint_digest: string;
  replay_checkpoint_digest: string;
  schema_revision: number;
  stale_count: number;
  orphan_count: number;
  rebuild_finding_count: number;
  observation_digest: string;
}

export interface PrDatabaseConvergenceReceiptV1 {
  schema_version: "helix-pr-db-convergence-receipt.v1";
  probe_digest: Digest;
  head_sha: string;
  projection_digest: string;
  checkpoint_digest: string;
  schema_revision: number;
  stale_count: 0;
  orphan_count: 0;
  rebuild_finding_count: 0;
  receipt_digest: Digest;
}

export interface MergeAdmissionCommitBundleV1 {
  operation_id: string;
  expected_head: string;
  contextual_review: ContextualPrReviewReceiptV1;
  database_convergence: PrDatabaseConvergenceReceiptV1;
}

export interface MergeAdmissionCommitReceiptV1 {
  schema_version: "helix-merge-admission-commit-receipt.v1";
  operation_id: string;
  head_sha: string;
  bundle_digest: Digest;
  outcome: "committed" | "replayed";
  commit_digest: Digest;
}

export interface MergeAdmissionTransactionV1 {
  currentHead(): Promise<string>;
  findCommitted(operationId: string): Promise<MergeAdmissionCommitReceiptV1 | undefined>;
  appendEvent(bundle: MergeAdmissionCommitBundleV1, bundleDigest: Digest): Promise<void>;
  insertMemberReceipts(bundle: MergeAdmissionCommitBundleV1): Promise<void>;
  upsertProjection(bundle: MergeAdmissionCommitBundleV1, bundleDigest: Digest): Promise<void>;
  writeCheckpoint(bundle: MergeAdmissionCommitBundleV1, bundleDigest: Digest): Promise<void>;
  publishReceipt(receipt: MergeAdmissionCommitReceiptV1): Promise<void>;
}

export interface MergeAdmissionCommitPortV1 {
  transaction<T>(work: (tx: MergeAdmissionTransactionV1) => Promise<T>): Promise<T>;
}

export function evaluatePrDatabaseConvergence(
  probe: PrDatabaseConvergenceProbeV1,
  observation: PrDatabaseConvergenceObservationV1,
): MergeAdmissionResultV1<PrDatabaseConvergenceReceiptV1> {
  const invalid: string[] = [];
  if (observation.source_head !== probe.head_sha) invalid.push("source_head");
  if (observation.event_head_digest !== probe.event_head_digest) invalid.push("event_head_digest");
  if (observation.projection_digest !== observation.replay_projection_digest) {
    invalid.push("projection_digest");
  }
  if (observation.checkpoint_digest !== observation.replay_checkpoint_digest) {
    invalid.push("checkpoint_digest");
  }
  if (observation.schema_revision !== probe.expected_schema_revision)
    invalid.push("schema_revision");
  if (observation.stale_count !== 0) invalid.push("stale_count");
  if (observation.orphan_count !== 0) invalid.push("orphan_count");
  if (observation.rebuild_finding_count !== 0) invalid.push("rebuild_finding_count");
  if (invalid.length > 0) return failure("HIL_PR_DATABASE_NOT_CONVERGED", invalid);
  const body = {
    schema_version: "helix-pr-db-convergence-receipt.v1" as const,
    probe_digest: probe.probe_digest,
    head_sha: probe.head_sha,
    projection_digest: observation.projection_digest,
    checkpoint_digest: observation.checkpoint_digest,
    schema_revision: observation.schema_revision,
    stale_count: 0 as const,
    orphan_count: 0 as const,
    rebuild_finding_count: 0 as const,
  };
  return { ok: true, value: { ...body, receipt_digest: sha256(body) } };
}

export async function commitPrMergeAdmissionReceipts(
  bundle: MergeAdmissionCommitBundleV1,
  port: MergeAdmissionCommitPortV1,
): Promise<MergeAdmissionResultV1<MergeAdmissionCommitReceiptV1>> {
  const invalid: string[] = [];
  if (!nonEmpty(bundle.operation_id)) invalid.push("operation_id");
  if (!SHA.test(bundle.expected_head)) invalid.push("expected_head");
  if (bundle.contextual_review.head_sha !== bundle.expected_head) {
    invalid.push("contextual_review.head_sha");
  }
  if (bundle.database_convergence.head_sha !== bundle.expected_head) {
    invalid.push("database_convergence.head_sha");
  }
  if (!validDigest(bundle.contextual_review.receipt_digest)) {
    invalid.push("contextual_review.receipt_digest");
  }
  if (!validDigest(bundle.database_convergence.receipt_digest)) {
    invalid.push("database_convergence.receipt_digest");
  }
  if (invalid.length > 0) return failure("HIL_PR_DATABASE_NOT_CONVERGED", invalid);

  const bundleDigest = sha256(bundle);
  try {
    return await port.transaction(async (tx) => {
      if ((await tx.currentHead()) !== bundle.expected_head) {
        return failure("HIL_PR_DATABASE_NOT_CONVERGED", ["current_head"]);
      }
      const existing = await tx.findCommitted(bundle.operation_id);
      if (existing) {
        if (existing.bundle_digest !== bundleDigest || existing.head_sha !== bundle.expected_head) {
          return failure("HIL_PR_DATABASE_NOT_CONVERGED", ["operation_replay"]);
        }
        return { ok: true, value: { ...existing, outcome: "replayed" as const } };
      }
      const body = {
        schema_version: "helix-merge-admission-commit-receipt.v1" as const,
        operation_id: bundle.operation_id,
        head_sha: bundle.expected_head,
        bundle_digest: bundleDigest,
        outcome: "committed" as const,
      };
      const receipt = { ...body, commit_digest: sha256(body) };
      await tx.appendEvent(bundle, bundleDigest);
      await tx.insertMemberReceipts(bundle);
      await tx.upsertProjection(bundle, bundleDigest);
      await tx.writeCheckpoint(bundle, bundleDigest);
      await tx.publishReceipt(receipt);
      return { ok: true, value: receipt };
    });
  } catch {
    return failure("HIL_PR_DATABASE_NOT_CONVERGED", ["transaction"]);
  }
}

export interface CiRunReceiptV1 {
  kind: "internal" | "github" | "full";
  head_sha: string;
  correctness: "pass" | "fail";
  duration_seconds: number;
  environment_digest: string;
  cache_digest: string;
  test_scope_digest: string;
  excluded_required_checks: readonly string[];
}

export interface CiPerformanceDecisionV1 {
  schema_version: "helix-ci-performance-decision.v1";
  head_sha: string;
  merge_correctness_green: true;
  performance_recovery_required: boolean;
  over_budget_kinds: readonly CiRunReceiptV1["kind"][];
  decision_digest: Digest;
}

export function evaluateCiPerformanceRecovery(
  runs: readonly CiRunReceiptV1[],
  budget: { internal_seconds: number; github_seconds: number; full_seconds: number },
): MergeAdmissionResultV1<CiPerformanceDecisionV1> {
  const invalid: string[] = [];
  const byKind = new Map<CiRunReceiptV1["kind"], CiRunReceiptV1>();
  for (const [index, run] of runs.entries()) {
    if (byKind.has(run.kind)) invalid.push(`runs.${run.kind}.duplicate`);
    byKind.set(run.kind, run);
    if (!SHA.test(run.head_sha)) invalid.push(`runs.${index}.head_sha`);
    if (run.correctness !== "pass") invalid.push(`runs.${index}.correctness`);
    if (!Number.isFinite(run.duration_seconds) || run.duration_seconds < 0)
      invalid.push(`runs.${index}.duration_seconds`);
    for (const [field, value] of [
      ["environment_digest", run.environment_digest],
      ["cache_digest", run.cache_digest],
      ["test_scope_digest", run.test_scope_digest],
    ] as const) {
      if (!validDigest(value)) invalid.push(`runs.${index}.${field}`);
    }
    if (run.excluded_required_checks.length > 0)
      invalid.push(`runs.${index}.excluded_required_checks`);
  }
  for (const kind of ["internal", "github", "full"] as const) {
    if (!byKind.has(kind)) invalid.push(`runs.${kind}`);
  }
  const heads = new Set(runs.map((run) => run.head_sha));
  if (heads.size !== 1) invalid.push("head_sha");
  if (
    budget.internal_seconds !== 60 ||
    budget.github_seconds !== 60 ||
    budget.full_seconds !== 180
  ) {
    invalid.push("budget");
  }
  if (invalid.length > 0) return failure("HIL_CI_PERFORMANCE_RECOVERY_MISSING", invalid);
  const limits = { internal: 60, github: 60, full: 180 } as const;
  const overBudgetKinds = (["internal", "github", "full"] as const).filter((kind) => {
    const run = byKind.get(kind);
    return run !== undefined && run.duration_seconds > limits[kind];
  });
  const body = {
    schema_version: "helix-ci-performance-decision.v1" as const,
    head_sha: runs[0]?.head_sha ?? "",
    merge_correctness_green: true as const,
    performance_recovery_required: overBudgetKinds.length > 0,
    over_budget_kinds: overBudgetKinds,
  };
  return { ok: true, value: { ...body, decision_digest: sha256(body) } };
}

export interface RequirementApprovalInputV1 {
  revision_id: string;
  head_sha: string;
  answer_source_digest: string;
  question_batches: readonly {
    batch_id: string;
    question_count: number;
    reflected_revision_id: string;
  }[];
  mock_roundtrip_complete: boolean;
  unresolved_count: number;
  approval: {
    approver_kind: "human" | "ai";
    approver_identity: string;
    revision_id: string;
    head_sha: string;
    receipt_digest: string;
  };
}

export interface RequirementApprovalDecisionV1 {
  schema_version: "helix-requirement-approval-decision.v1";
  revision_id: string;
  head_sha: string;
  approved: true;
  decision_digest: Digest;
}

export function evaluateRequirementApproval(
  input: RequirementApprovalInputV1,
): MergeAdmissionResultV1<RequirementApprovalDecisionV1> {
  const invalid: string[] = [];
  if (!nonEmpty(input.revision_id)) invalid.push("revision_id");
  if (!SHA.test(input.head_sha)) invalid.push("head_sha");
  if (!validDigest(input.answer_source_digest)) invalid.push("answer_source_digest");
  if (input.question_batches.length === 0) invalid.push("question_batches");
  for (const [index, batch] of input.question_batches.entries()) {
    if (!nonEmpty(batch.batch_id)) invalid.push(`question_batches.${index}.batch_id`);
    if (batch.question_count < 1 || batch.question_count > 5)
      invalid.push(`question_batches.${index}.question_count`);
    if (batch.reflected_revision_id !== input.revision_id)
      invalid.push(`question_batches.${index}.reflected_revision_id`);
  }
  if (!input.mock_roundtrip_complete) invalid.push("mock_roundtrip_complete");
  if (input.unresolved_count !== 0) invalid.push("unresolved_count");
  if (input.approval.approver_kind !== "human") invalid.push("approval.approver_kind");
  if (!nonEmpty(input.approval.approver_identity)) invalid.push("approval.approver_identity");
  if (input.approval.revision_id !== input.revision_id) invalid.push("approval.revision_id");
  if (input.approval.head_sha !== input.head_sha) invalid.push("approval.head_sha");
  if (!validDigest(input.approval.receipt_digest)) invalid.push("approval.receipt_digest");
  if (invalid.length > 0) return failure("HIL_REQUIREMENT_USER_APPROVAL_MISSING", invalid);
  const body = {
    schema_version: "helix-requirement-approval-decision.v1" as const,
    revision_id: input.revision_id,
    head_sha: input.head_sha,
    approved: true as const,
  };
  return { ok: true, value: { ...body, decision_digest: sha256(body) } };
}

export interface MainRecoveryEvidenceV1 {
  failed_main_head: string;
  fix_head: string;
  recovery_issue_head: string;
  recovery_pr_head: string;
  independent_review_head: string;
  doctor_head: string;
  github_ci_head: string;
  closure_receipt_head: string;
  reviewer_identity: string;
  fixer_identity: string;
}

export interface MainRecoveryReleaseDecisionV1 {
  schema_version: "helix-main-recovery-release-decision.v1";
  failed_main_head: string;
  fix_head: string;
  release_merge_stop: true;
  decision_digest: Digest;
}

export function evaluateMainRecoveryRelease(
  evidence: MainRecoveryEvidenceV1,
): MergeAdmissionResultV1<MainRecoveryReleaseDecisionV1> {
  const invalid: string[] = [];
  if (!SHA.test(evidence.failed_main_head)) invalid.push("failed_main_head");
  if (!SHA.test(evidence.fix_head) || evidence.fix_head === evidence.failed_main_head)
    invalid.push("fix_head");
  for (const field of [
    "recovery_issue_head",
    "recovery_pr_head",
    "independent_review_head",
    "doctor_head",
    "github_ci_head",
    "closure_receipt_head",
  ] as const) {
    if (evidence[field] !== evidence.fix_head) invalid.push(field);
  }
  if (
    !nonEmpty(evidence.reviewer_identity) ||
    evidence.reviewer_identity === evidence.fixer_identity
  )
    invalid.push("reviewer_identity");
  if (!nonEmpty(evidence.fixer_identity)) invalid.push("fixer_identity");
  if (invalid.length > 0) return failure("HIL_MAIN_RECOVERY_INCOMPLETE", invalid);
  const body = {
    schema_version: "helix-main-recovery-release-decision.v1" as const,
    failed_main_head: evidence.failed_main_head,
    fix_head: evidence.fix_head,
    release_merge_stop: true as const,
  };
  return { ok: true, value: { ...body, decision_digest: sha256(body) } };
}

export interface AuditQueueItemV1 {
  item_id: string;
  kind: "main_recovery" | "performance_recovery" | "feature" | "maintenance";
  active: boolean;
  priority: number;
}

export function prioritizeRecoveryAudit(
  items: readonly AuditQueueItemV1[],
): MergeAdmissionResultV1<readonly AuditQueueItemV1[]> {
  const invalid: string[] = [];
  const ids = new Set<string>();
  for (const [index, item] of items.entries()) {
    if (!nonEmpty(item.item_id) || ids.has(item.item_id)) invalid.push(`items.${index}.item_id`);
    ids.add(item.item_id);
    if (!Number.isFinite(item.priority)) invalid.push(`items.${index}.priority`);
  }
  if (invalid.length > 0) return failure("HIL_MAIN_RECOVERY_INCOMPLETE", invalid);
  const rank = (item: AuditQueueItemV1) => {
    if (item.active && item.kind === "main_recovery") return 0;
    if (item.active && item.kind === "performance_recovery") return 1;
    if (item.active) return 2;
    return 3;
  };
  return {
    ok: true,
    value: items
      .map((item, index) => ({ item, index }))
      .sort(
        (left, right) =>
          rank(left.item) - rank(right.item) ||
          right.item.priority - left.item.priority ||
          left.index - right.index,
      )
      .map(({ item }) => ({ ...item })),
  };
}

export interface LayerAuditGraphV1 {
  schema_version: "helix-layer-audit-graph.v1";
  nodes: readonly string[];
  edges: readonly {
    from: string;
    to: string;
    kind: "vertical" | "v_pair" | "consumer";
  }[];
  graph_digest: string;
}

export interface LayerAuditPlanV1 {
  schema_version: "helix-layer-audit-plan.v1";
  changed_nodes: readonly string[];
  affected_nodes: readonly string[];
  ordered_checks: readonly string[];
  reviewer_identity_must_differ: true;
  plan_digest: Digest;
}

export function planLayerAwareAudit(
  changedNodes: readonly string[],
  graph: LayerAuditGraphV1,
  registry: readonly string[],
): MergeAdmissionResultV1<LayerAuditPlanV1> {
  const invalid: string[] = [];
  const nodes = new Set(graph.nodes);
  if (nodes.size !== graph.nodes.length) invalid.push("nodes.duplicate");
  for (const changed of changedNodes) if (!nodes.has(changed)) invalid.push(`changed.${changed}`);
  const adjacency = new Map<string, Set<string>>();
  for (const node of nodes) adjacency.set(node, new Set());
  for (const [index, edge] of graph.edges.entries()) {
    if (!nodes.has(edge.from) || !nodes.has(edge.to)) invalid.push(`edges.${index}.orphan`);
    adjacency.get(edge.from)?.add(edge.to);
    adjacency.get(edge.to)?.add(edge.from);
  }
  if (!validDigest(graph.graph_digest)) invalid.push("graph_digest");
  if (registry.length === 0 || registry.some((check) => !nonEmpty(check))) invalid.push("registry");
  if (invalid.length > 0) return failure("HIL_AUDIT_FIX_SELF_APPROVED", invalid);
  const visited = new Set<string>();
  const queue = [...new Set(changedNodes)].sort();
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;
    visited.add(node);
    for (const next of [...(adjacency.get(node) ?? [])].sort())
      if (!visited.has(next)) queue.push(next);
  }
  const body = {
    schema_version: "helix-layer-audit-plan.v1" as const,
    changed_nodes: [...new Set(changedNodes)].sort(),
    affected_nodes: [...visited].sort(),
    ordered_checks: [...new Set(registry)].sort(),
    reviewer_identity_must_differ: true as const,
  };
  return { ok: true, value: { ...body, plan_digest: sha256(body) } };
}

export function validateAuditFixReview(
  plan: LayerAuditPlanV1,
  receipt: ContextualPrReviewReceiptV1,
  fixerIdentity: string,
  fixerSession: string,
  currentHead: string,
): MergeAdmissionResultV1<ContextualPrReviewReceiptV1> {
  const invalid: string[] = [];
  if (receipt.reviewer_identity === fixerIdentity) invalid.push("fixer_identity");
  if (receipt.reviewer_session_id === fixerSession) invalid.push("fixer_session_id");
  if (receipt.head_sha !== currentHead) invalid.push("head_sha");
  if (receipt.verdict !== "approve") invalid.push("verdict");
  if (!validDigest(plan.plan_digest)) invalid.push("plan_digest");
  if (invalid.length > 0) return failure("HIL_AUDIT_FIX_SELF_APPROVED", invalid);
  return { ok: true, value: { ...receipt } };
}
