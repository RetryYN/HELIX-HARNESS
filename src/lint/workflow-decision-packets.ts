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
  role: "primary" | "supporting";
  reason: string;
  route: string;
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
    const key = `${packet.command}:${packet.role}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const HIGH_IMPACT_APPROVAL = /approval|承認|action-binding|human signoff|人間サインオフ|人間承認/i;

export function planTextRequiresActionBindingApproval(text: string): boolean {
  return HIGH_IMPACT_APPROVAL.test(text);
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
