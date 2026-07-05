import {
  HELIX_REQUIREMENTS_BINDING_DEFAULTS,
  type L1L2GapCheckPolicy,
  loadRequirementsBindingConfig,
} from "../config/requirements-binding";
import {
  analyzeL1L2Consistency,
  type L1L2ConsistencyInput,
  l1L2ConsistencyMessages,
  loadL1L2ConsistencyInput,
} from "./l1-l2-consistency";

export const L1_L2_GAP_CHECK_SCHEMA_VERSION = "l1-l2-gap-check.v1";
export const L1_L2_GAP_CHECK_MAX_ROUNDS =
  HELIX_REQUIREMENTS_BINDING_DEFAULTS.l1L2GapCheck.maxRounds;

export interface L1L2GapCheckViewpoint {
  id: string;
  label: string;
  check: string;
  authority: "human_decides_ai_surfaces";
}

export interface L1L2GapCandidate {
  code: string;
  viewpointId: string;
  route: "a40_change_log";
  requiredAction: string;
}

export interface L1L2GapCheckPacket {
  schemaVersion: typeof L1_L2_GAP_CHECK_SCHEMA_VERSION;
  planOnly: true;
  writePolicy: "no-write";
  mustNotMutate: true;
  sourcePlan: "PLAN-DISCOVERY-11-l1-l2-elicitation-cycle";
  reversePlan: "PLAN-REVERSE-329-l1-l2-elicitation-cycle-fullback";
  maxRounds: number;
  escalationRule: string;
  authorityBoundary: string;
  a40Route: string;
  consistency: {
    ok: boolean;
    checked: number;
    violations: string[];
    messages: string[];
  };
  gapCandidates: L1L2GapCandidate[];
  viewpoints: L1L2GapCheckViewpoint[];
  contentReviewRequired: true;
  completionClaimAllowed: false;
}

export const L1_L2_GAP_CHECK_VIEWPOINTS =
  HELIX_REQUIREMENTS_BINDING_DEFAULTS.l1L2GapCheck.viewpoints;

function viewpointForViolation(code: string): string {
  if (code.includes("flow")) return "state_transition";
  if (code.includes("pair")) return "state_transition";
  if (code.includes("ui-element") || code.includes("screen")) return "output_display";
  return "output_display";
}

export function buildL1L2GapCheckPacket(
  input: L1L2ConsistencyInput,
  policy: L1L2GapCheckPolicy = HELIX_REQUIREMENTS_BINDING_DEFAULTS.l1L2GapCheck,
): L1L2GapCheckPacket {
  const consistency = analyzeL1L2Consistency(input);
  return {
    schemaVersion: L1_L2_GAP_CHECK_SCHEMA_VERSION,
    planOnly: true,
    writePolicy: "no-write",
    mustNotMutate: true,
    sourcePlan: "PLAN-DISCOVERY-11-l1-l2-elicitation-cycle",
    reversePlan: "PLAN-REVERSE-329-l1-l2-elicitation-cycle-fullback",
    maxRounds: policy.maxRounds,
    escalationRule:
      "3 round 以内に green へ至らない場合は PO が scope 分割または要求凍結を判断する。",
    authorityBoundary:
      "AI は read-only gap-check で欠落候補を surface するだけで、L1/L2 の起草、受入、freeze、scope 分割を決めない。",
    a40Route:
      "収束後の L1/L2 変更は silent edit せず、A-40 change-log と G1-trace 再検証を経由する。",
    consistency: {
      ok: consistency.ok,
      checked: consistency.checked,
      violations: consistency.violations,
      messages: l1L2ConsistencyMessages(consistency),
    },
    gapCandidates: consistency.violations.map((code) => ({
      code,
      viewpointId: viewpointForViolation(code),
      route: "a40_change_log",
      requiredAction:
        "L1/L2 の新ラウンドを起票し、人が採否判断してから要求または mock を更新する。",
    })),
    viewpoints: [...policy.viewpoints],
    contentReviewRequired: true,
    completionClaimAllowed: false,
  };
}

export function loadL1L2GapCheckPacket(repoRoot: string = process.cwd()): L1L2GapCheckPacket {
  const configResult = loadRequirementsBindingConfig(repoRoot);
  if (!configResult.ok) {
    throw new Error(configResult.messages.join("; "));
  }
  return buildL1L2GapCheckPacket(
    loadL1L2ConsistencyInput(repoRoot),
    configResult.config.l1L2GapCheck,
  );
}

export function l1L2GapCheckMessages(packet: L1L2GapCheckPacket): string[] {
  const status = packet.consistency.ok ? "OK" : "violation";
  return [
    `l1-l2 gap-check - ${status} (schema=${packet.schemaVersion}, writePolicy=${packet.writePolicy}, viewpoints=${packet.viewpoints.length}, maxRounds=${packet.maxRounds}, gaps=${packet.gapCandidates.length})`,
    `authority-boundary: ${packet.authorityBoundary}`,
    `a40-route: ${packet.a40Route}`,
  ];
}
