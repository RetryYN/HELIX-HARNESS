import { createHash } from "node:crypto";
import type { AuditFindingV1, PrAuditResultV1 } from "../github/pr-audit";

type Digest = `sha256:${string}`;
const DIGEST = /^sha256:[0-9a-f]{64}$/;

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

function validDigest(value: unknown): value is Digest {
  return typeof value === "string" && DIGEST.test(value);
}

function fail<T>(
  code:
    | "HIL_FINDING_DUPLICATE_TARGET_MISSING"
    | "HIL_FINDING_DISPOSITION_INVALID"
    | "HIL_FINDING_DROPPED"
    | "HIL_FINDING_PROMOTION_PARTIAL",
  fields: readonly string[],
): PrAuditResultV1<T> {
  const stable = [...new Set(fields)].sort();
  return {
    ok: false,
    failures: [{ code, fields: stable, evidence_digest: digest({ code, fields: stable }) }],
  };
}

export type FindingDispositionKindV1 =
  | "actionable"
  | "duplicate"
  | "false_positive"
  | "accepted_risk"
  | "telemetry";

export interface DispositionProposalV1 {
  finding_id: string;
  expected_finding_digest: string;
  disposition: FindingDispositionKindV1;
  target_id: string | null;
  target_digest: string | null;
  evidence_digests: readonly string[];
  reviewer_receipt_digest: string | null;
  approval_receipt_digest: string | null;
  observation_owner: string | null;
  expires_at: string | null;
  appeal_route_digest: string;
}

export interface AuthorityIndexEntryV1 {
  authority_kind: "independent_review" | "po_approval" | "target_acceptance" | "telemetry_owner";
  authority_id: string;
  subject_digest: string;
  receipt_digest: string;
  status: "current" | "stale";
}

export interface DispositionReceiptV1 {
  schema_version: "helix-finding-disposition-receipt.v1";
  receipt_id: string;
  finding_id: string;
  finding_digest: string;
  revision: number;
  disposition: FindingDispositionKindV1;
  status: "actionable" | "closed" | "disposition_pending";
  target_id: string | null;
  target_digest: string | null;
  evidence_set_digest: Digest;
  authority_receipt_digest: string | null;
  appeal_route_digest: string;
  receipt_digest: Digest;
}

export function evaluateFindingDisposition(
  finding: AuditFindingV1,
  proposal: DispositionProposalV1,
  authority: readonly AuthorityIndexEntryV1[],
): PrAuditResultV1<DispositionReceiptV1> {
  const invalid: string[] = [];
  if (proposal.finding_id !== finding.finding_id) invalid.push("finding_id");
  if (proposal.expected_finding_digest !== finding.finding_digest) invalid.push("finding_digest");
  if (!validDigest(proposal.appeal_route_digest)) invalid.push("appeal_route_digest");
  if (proposal.evidence_digests.some((value) => !validDigest(value)))
    invalid.push("evidence_digests");
  let requiredAuthority: AuthorityIndexEntryV1["authority_kind"] | undefined;
  if (proposal.disposition === "actionable") {
    if (!proposal.target_id || !validDigest(proposal.target_digest)) invalid.push("target");
    requiredAuthority = "target_acceptance";
  } else if (proposal.disposition === "duplicate") {
    if (!proposal.target_id || !validDigest(proposal.target_digest)) invalid.push("target");
    requiredAuthority = "target_acceptance";
  } else if (proposal.disposition === "false_positive") {
    if (!validDigest(proposal.reviewer_receipt_digest)) invalid.push("reviewer_receipt_digest");
    requiredAuthority = "independent_review";
  } else if (proposal.disposition === "accepted_risk") {
    if (!validDigest(proposal.approval_receipt_digest)) invalid.push("approval_receipt_digest");
    requiredAuthority = "po_approval";
  } else if (proposal.disposition === "telemetry") {
    if (!proposal.observation_owner || !proposal.expires_at) invalid.push("telemetry_observation");
    requiredAuthority = "telemetry_owner";
  }
  const authorityEntry = authority.find(
    (entry) =>
      entry.authority_kind === requiredAuthority &&
      entry.status === "current" &&
      (entry.subject_digest === finding.finding_digest ||
        entry.subject_digest === proposal.target_digest),
  );
  if (!authorityEntry || !validDigest(authorityEntry.receipt_digest)) invalid.push("authority");
  if (invalid.length > 0) {
    const code =
      proposal.disposition === "duplicate"
        ? "HIL_FINDING_DUPLICATE_TARGET_MISSING"
        : "HIL_FINDING_DISPOSITION_INVALID";
    return fail(code, invalid);
  }
  const status: DispositionReceiptV1["status"] =
    proposal.disposition === "actionable" ? "actionable" : "closed";
  const body = {
    schema_version: "helix-finding-disposition-receipt.v1" as const,
    receipt_id: `disposition:${finding.finding_id}:${proposal.disposition}`,
    finding_id: finding.finding_id,
    finding_digest: finding.finding_digest,
    revision: 1,
    disposition: proposal.disposition,
    status,
    target_id: proposal.target_id,
    target_digest: proposal.target_digest,
    evidence_set_digest: digest([...proposal.evidence_digests].sort()),
    authority_receipt_digest: authorityEntry?.receipt_digest ?? null,
    appeal_route_digest: proposal.appeal_route_digest,
  };
  return { ok: true, value: { ...body, receipt_digest: digest(body) } };
}

export interface IssueContractDraftV1 {
  issue_id: string;
  issue_revision: number;
  contract_digest: string;
  finding_id: string;
  cause_id: string;
}
export interface ReverseTaskDraftV1 {
  reverse_run_id: string;
  phase: "R0";
  issue_id: string;
  issue_revision: number;
  finding_id: string;
  cause_id: string;
  reverse_digest: string;
}
export interface MemoryIssueSummaryDraftV1 {
  summary_id: string;
  issue_id: string;
  issue_revision: number;
  finding_id: string;
  cause_id: string;
  sanitized_summary_digest: string;
  raw_finding_included: false;
  summary_digest: string;
}
export interface CodexQueueDraftV1 {
  queue_item_id: string;
  issue_id: string;
  issue_revision: number;
  reverse_run_id: string;
  gate_reference_digest: string;
  finding_id: string;
  cause_id: string;
  state: "blocked_on_reverse";
  queue_digest: string;
}

export type PromotionMemberKindV1 = "issue" | "reverse" | "memory_summary" | "codex_queue";
export interface FindingPromotionMemberV1 {
  member_kind: PromotionMemberKindV1;
  target_id: string;
  target_revision: number;
  target_digest: string;
  cause_id: string;
  state: "prepared";
}
export interface FindingPromotionBundleV1 {
  schema_version: "helix-finding-promotion-bundle.v1";
  promotion_id: string;
  cause_id: string;
  operation_id: string;
  operation_digest: Digest;
  finding: AuditFindingV1;
  disposition: DispositionReceiptV1;
  head_identity_digest: string;
  issue: IssueContractDraftV1;
  reverse: ReverseTaskDraftV1;
  memory: MemoryIssueSummaryDraftV1;
  queue: CodexQueueDraftV1;
  members: readonly [
    FindingPromotionMemberV1,
    FindingPromotionMemberV1,
    FindingPromotionMemberV1,
    FindingPromotionMemberV1,
  ];
  member_set_digest: Digest;
  expected_event_head: Digest;
  expected_projection_digest: Digest;
  bundle_digest: Digest;
}

export function buildFindingPromotion(
  finding: AuditFindingV1,
  disposition: DispositionReceiptV1,
  issue: IssueContractDraftV1,
  reverse: ReverseTaskDraftV1,
  memory: MemoryIssueSummaryDraftV1,
  queue: CodexQueueDraftV1,
): PrAuditResultV1<FindingPromotionBundleV1> {
  const invalid: string[] = [];
  if (finding.state !== "finding_open" || disposition.status !== "actionable")
    invalid.push("finding_state");
  const causeIds = [issue.cause_id, reverse.cause_id, memory.cause_id, queue.cause_id];
  if (new Set(causeIds).size !== 1 || causeIds[0] !== finding.finding_id) invalid.push("cause_id");
  if (
    [issue.finding_id, reverse.finding_id, memory.finding_id, queue.finding_id].some(
      (id) => id !== finding.finding_id,
    )
  )
    invalid.push("finding_id");
  if (
    reverse.issue_id !== issue.issue_id ||
    memory.issue_id !== issue.issue_id ||
    queue.issue_id !== issue.issue_id
  )
    invalid.push("issue_id");
  if (
    reverse.issue_revision !== issue.issue_revision ||
    memory.issue_revision !== issue.issue_revision
  )
    invalid.push("issue_revision");
  if (queue.reverse_run_id !== reverse.reverse_run_id) invalid.push("reverse_run_id");
  for (const [field, value] of [
    ["issue.contract_digest", issue.contract_digest],
    ["reverse.reverse_digest", reverse.reverse_digest],
    ["memory.summary_digest", memory.summary_digest],
    ["queue.queue_digest", queue.queue_digest],
  ] as const)
    if (!validDigest(value)) invalid.push(field);
  if (invalid.length > 0) return fail("HIL_FINDING_DROPPED", invalid);
  const causeId = finding.finding_id;
  const members = [
    {
      member_kind: "issue" as const,
      target_id: issue.issue_id,
      target_revision: issue.issue_revision,
      target_digest: issue.contract_digest,
      cause_id: causeId,
      state: "prepared" as const,
    },
    {
      member_kind: "reverse" as const,
      target_id: reverse.reverse_run_id,
      target_revision: 0,
      target_digest: reverse.reverse_digest,
      cause_id: causeId,
      state: "prepared" as const,
    },
    {
      member_kind: "memory_summary" as const,
      target_id: memory.summary_id,
      target_revision: issue.issue_revision,
      target_digest: memory.summary_digest,
      cause_id: causeId,
      state: "prepared" as const,
    },
    {
      member_kind: "codex_queue" as const,
      target_id: queue.queue_item_id,
      target_revision: issue.issue_revision,
      target_digest: queue.queue_digest,
      cause_id: causeId,
      state: "prepared" as const,
    },
  ] as const;
  const memberSetDigest = digest(members);
  const operationDigest = digest({
    finding: finding.finding_digest,
    disposition: disposition.receipt_digest,
    members: memberSetDigest,
  });
  const body = {
    schema_version: "helix-finding-promotion-bundle.v1" as const,
    promotion_id: `promotion:${finding.finding_id}`,
    cause_id: causeId,
    operation_id: `operation:${operationDigest.slice(7)}`,
    operation_digest: operationDigest,
    finding,
    disposition,
    head_identity_digest: finding.head_identity_digest,
    issue,
    reverse,
    memory,
    queue,
    members,
    member_set_digest: memberSetDigest,
    expected_event_head: digest({ finding: finding.finding_digest, kind: "event-head" }),
    expected_projection_digest: digest({ finding: finding.finding_digest, kind: "projection" }),
  };
  return { ok: true, value: { ...body, bundle_digest: digest(body) } };
}

export interface PromotionReceiptV1 {
  promotion_id: string;
  operation_id: string;
  finding_id: string;
  member_set_digest: string;
  status: "queue_ready";
  authoritative_increment: 0 | 1;
  receipt_digest: Digest;
}
export interface FindingPromotionStorePortV1 {
  commitPromotion(bundle: FindingPromotionBundleV1): Promise<PrAuditResultV1<PromotionReceiptV1>>;
}

export async function commitFindingPromotionAtomically(
  bundle: FindingPromotionBundleV1,
  port: FindingPromotionStorePortV1,
): Promise<PrAuditResultV1<PromotionReceiptV1>> {
  try {
    return await port.commitPromotion(bundle);
  } catch {
    return fail("HIL_FINDING_PROMOTION_PARTIAL", ["transaction"]);
  }
}
