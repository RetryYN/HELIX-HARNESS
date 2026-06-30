export type WorkflowDecisionPacketCommand =
  | "ut-tdd s4 decision-packet --json"
  | "ut-tdd version-up activation-packet --json"
  | "ut-tdd rename plan --json"
  | "ut-tdd action-binding approval-packet --json"
  | "ut-tdd completion decision-packet --json";

export interface RelatedDecisionPacket {
  command: WorkflowDecisionPacketCommand;
  role: "primary" | "supporting";
  reason: string;
  route: string;
}

export const S4_DECISION_PACKET_COMMAND = "ut-tdd s4 decision-packet --json";
export const VERSION_UP_ACTIVATION_PACKET_COMMAND = "ut-tdd version-up activation-packet --json";
export const RENAME_PLAN_PACKET_COMMAND = "ut-tdd rename plan --json";
export const ACTION_BINDING_APPROVAL_PACKET_COMMAND =
  "ut-tdd action-binding approval-packet --json";

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
