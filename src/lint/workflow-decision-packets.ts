export type WorkflowDecisionPacketCommand =
  | "ut-tdd s4 decision-packet --json"
  | "ut-tdd version-up activation-packet --json"
  | "ut-tdd rename plan --json"
  | "ut-tdd action-binding approval-packet --json"
  | "ut-tdd completion decision-packet --json";

export type DecisionPacketSourceCommand =
  | WorkflowDecisionPacketCommand
  | "ut-tdd handover"
  | "ut-tdd status --json";

export interface RelatedDecisionPacket {
  command: WorkflowDecisionPacketCommand;
  scopedCommand?: string;
  role: "primary" | "supporting";
  reason: string;
  route: string;
}

export type HighImpactApprovalReason =
  | "structured_action_binding_record"
  | "high_impact_action_binding_required"
  | "not_required";

export interface HighImpactApprovalClassification {
  required: boolean;
  reason: HighImpactApprovalReason;
  hasStructuredRecord: boolean;
  hasApprovalBoundary: boolean;
  hasExecutionObligation: boolean;
  hasHighImpactTarget: boolean;
}

export interface DecisionPacketFreshness {
  validForMinutes: number;
  expiresAt: string;
  stale: boolean;
  policy: "decision-packet-freshness.v1";
}

export interface DecisionPacketProvenance {
  generatedAt: string;
  sourceCommand: DecisionPacketSourceCommand;
  freshness: DecisionPacketFreshness;
}

export interface DecisionPacketProvenanceOptions {
  generatedAt?: string;
  now?: string;
  validForMinutes?: number;
  sourceCommand: DecisionPacketSourceCommand;
}

export const S4_DECISION_PACKET_COMMAND = "ut-tdd s4 decision-packet --json";
export const VERSION_UP_ACTIVATION_PACKET_COMMAND = "ut-tdd version-up activation-packet --json";
export const RENAME_PLAN_PACKET_COMMAND = "ut-tdd rename plan --json";
export const ACTION_BINDING_APPROVAL_PACKET_COMMAND =
  "ut-tdd action-binding approval-packet --json";
export const COMPLETION_DECISION_PACKET_COMMAND = "ut-tdd completion decision-packet --json";

export function buildDecisionPacketProvenance(
  opts: DecisionPacketProvenanceOptions,
): DecisionPacketProvenance {
  const generatedAt = normalizeIsoTimestamp(opts.generatedAt ?? new Date().toISOString());
  const now = normalizeIsoTimestamp(opts.now ?? generatedAt);
  const validForMinutes = opts.validForMinutes ?? 24 * 60;
  const expiresAt = addMinutesIso(generatedAt, validForMinutes);
  return {
    generatedAt,
    sourceCommand: opts.sourceCommand,
    freshness: {
      validForMinutes,
      expiresAt,
      stale: Date.parse(now) > Date.parse(expiresAt),
      policy: "decision-packet-freshness.v1",
    },
  };
}

export function relatedDecisionPacket(packet: RelatedDecisionPacket): RelatedDecisionPacket {
  return packet;
}

export function uniqueRelatedDecisionPackets(
  packets: RelatedDecisionPacket[],
): RelatedDecisionPacket[] {
  const seen = new Set<string>();
  return packets.filter((packet) => {
    const key = `${packet.command}:${packet.scopedCommand ?? ""}:${packet.role}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const STRUCTURED_ACTION_BINDING_RECORD = /^\s*action_binding_approval_record:\s*$/im;
const APPROVAL_BOUNDARY =
  /action-binding|human\/action-binding approval|requires_human_approval=true|human signoff|human approval|po signoff|po approval|required reviewers?|approval gate|人間サインオフ|人間承認|PO\s*サインオフ|PO\s*承認|承認/i;
const EXECUTION_APPROVAL_OBLIGATION =
  /(?:requires?|needs?|obtain)\b.{0,120}(?:action-binding approval|human\/action-binding approval|human approval|human signoff|po signoff|po approval|approval|承認|サインオフ).{0,120}(?:before|prior to|事前|前に|実行前|実適用前)|(?:action-binding approval|human\/action-binding approval|human approval|human signoff|po signoff|po approval|approval|承認|サインオフ).{0,120}(?:required|needed|mandatory|必須|必要).{0,120}(?:before|prior to|事前|前に|実行前|実適用前)|(?:activation|deployment|deploy|cutover|migration|external execution|high-impact action|高影響\s+action|実行|実適用|本番|外部).{0,120}(?:requires?|needs?)\b.{0,120}(?:action-binding approval|human\/action-binding approval|human approval|human signoff|po signoff|po approval|approval|承認|サインオフ)|(?:action-binding approval|human\/action-binding approval|human approval|human signoff|po signoff|po approval|approval|承認|サインオフ)\s*なしに.{0,120}(?:apply|execute|execution|deploy|deployment|activation|cutover|migration|実行|実適用)|高影響\s+action\s+の実行前に\s+human\/action-binding approval\s+を記録する/i;
const HIGH_IMPACT_ACTION_TARGET =
  /high-impact action|high-impact execution|高影響\s+action|external|infra|infrastructure|secret|auth|authorization|authentication|destructive|state dir|migration|cutover|activation|deploy|deployment|release|environment|cloudflare|hmac|webhook|access control|production|api|apply|execution|本番|外部|認証|認可|破壊|不可逆|設定変更|実行|実適用|デプロイ|配布/i;
const META_ONLY_APPROVAL_CONTEXT =
  /out of scope|does not authorize|not authorize|no .*authorized|planonly|mustnotapply|applycommandavailable=false|does not activate|does not execute|no production cutover|no production write|証跡|説明|サンプル/i;

export function classifyHighImpactApprovalRequirement(
  text: string,
): HighImpactApprovalClassification {
  const hasStructuredRecord = STRUCTURED_ACTION_BINDING_RECORD.test(text);
  const hasApprovalBoundary = APPROVAL_BOUNDARY.test(text);
  const hasExecutionObligation = EXECUTION_APPROVAL_OBLIGATION.test(text);
  const hasHighImpactTarget = HIGH_IMPACT_ACTION_TARGET.test(text);
  const hasActionBindingRequirementContext = hasHighImpactApprovalRequirementContext(text);
  const required = hasStructuredRecord || hasActionBindingRequirementContext;
  return {
    required,
    reason: hasStructuredRecord
      ? "structured_action_binding_record"
      : required
        ? "high_impact_action_binding_required"
        : "not_required",
    hasStructuredRecord,
    hasApprovalBoundary,
    hasExecutionObligation,
    hasHighImpactTarget,
  };
}

function hasHighImpactApprovalRequirementContext(text: string): boolean {
  return approvalRequirementChunks(text).some(
    (chunk) =>
      !META_ONLY_APPROVAL_CONTEXT.test(chunk) &&
      APPROVAL_BOUNDARY.test(chunk) &&
      EXECUTION_APPROVAL_OBLIGATION.test(chunk) &&
      HIGH_IMPACT_ACTION_TARGET.test(chunk),
  );
}

function approvalRequirementChunks(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[。.!?])\s+/))
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export function planTextRequiresActionBindingApproval(text: string): boolean {
  return classifyHighImpactApprovalRequirement(text).required;
}

function normalizeIsoTimestamp(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return new Date(0).toISOString();
  return new Date(parsed).toISOString();
}

function addMinutesIso(value: string, minutes: number): string {
  const parsed = Date.parse(value);
  const safeMinutes = Number.isFinite(minutes) ? minutes : 0;
  return new Date(parsed + safeMinutes * 60_000).toISOString();
}
