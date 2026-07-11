/**
 * outstanding-work surface — 「未了の正の集計シグナル」を status / completion packet が additive に出すための
 * 純関数 + loader (IMP-139)。
 *
 * 動機 (PO 指摘 2026-06-19 self-audit): 旧 `helix status` (mode + next のみ) は
 * 「層内の非終端 (draft 等) PLAN 数 / open な explicit-defer 数」を出さなかった。結果
 * 「doctor green = 完了」と誤読され得る (PLAN 完了 ≠ 層完了)。
 * merged-plan-status ([[plan-merged-plan-status]]) / plan-completion-drift ([[plan-completion-drift]]) は
 * drift を fail-close 検出するが、それは「異常」の検出であって「未了の総量」を可視化しない。本 surface は
 * 「完了主張」を機械照合可能にする informational additive サーフェス (gate ではない、非 fail-close)。
 *
 * 集計 2 軸 (IMP-139 a/b):
 *  (a) 非終端 (terminal/archived 以外) PLAN を layer 別に集計。
 *  (b) open な spec-backfill placeholder_deps carry 数 (= placeholder-deps の specBackfillWaits、
 *      上位仕様確定待ちで対テスト設計を書けない正当な carry。threshold は descent-obligation が担当)。
 *
 * 公開契約は additive のみ (status --json は nextAction を additive 付加した A-138 ITEM-1 / PLAN-L7-84
 * の前例に倣う)。既存フィールドは不変。
 *
 * placeholder-deps / shared を再利用するため解析層 (src/lint) に置く (runtime→lint は coding-rules の
 * module-boundary 違反ゆえ、消費側 CLI が lint を import する形にする)。
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { frontmatterSchema } from "../schema/frontmatter";
import { analyzePlaceholderDeps, loadPlaceholderDepsDocs } from "./placeholder-deps";
import { fmValue, isTerminalPlanStatus } from "./shared";
import {
  buildDecisionPacketProvenance,
  COMPLETION_DECISION_PACKET_COMMAND,
  COMPLETION_REVIEW_BUNDLE_COMMAND,
  type DecisionPacketFreshness,
  type DecisionPacketSourceCommand,
  planTextRequiresActionBindingApproval,
} from "./workflow-decision-packets";

/** 終端 (= 完了とみなす) status。これ以外 (archived を除く) が非終端 = 未了。 */
const SOURCE_LEDGER_MEANING_REVIEW_FIELDS = [
  "source_ledger_freshness",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
] as const;

const SOURCE_LEDGER_MEANING_REVIEW_EVIDENCE = [
  "source_ledger_freshness records the fresh checked ledger label before terminal decision use",
  "source_status_delta records none/changed official source status impact before terminal decision use",
  "adoption_decision_delta records none/changed adoption decision impact before terminal decision use",
  "workflow_route_impact records none or the named workflow reroute before terminal decision use",
] as const;

export const REQUIRED_DECISION_PACKET_MATRIX_FIELDS = [
  "sourceCheckedAt",
  "latestOfficialStatus",
  "sourceStatusDelta",
  "adoptionDecision",
  "adoptionDecisionDelta",
  "workflowRouteImpact",
] as const;

const EXTERNAL_REHEARSAL_RECORD_FIELDS = [
  "official_source_basis",
  "free_tier_budget_check",
  "webhook_signature_check",
  "access_control_check",
  "no_secret_pii_check",
  "no_prod_write_check",
  "rollback_rehearsal",
] as const;

const COST_GUARDRAIL_RECORD_FIELDS = [
  "pages_limit",
  "workers_limit",
  "d1_limit",
  "kv_limit",
  "exceed_action",
] as const;

const ACTIVATION_PROVENANCE_RECORD_FIELDS = [
  "source_ledger",
  "dry_run_evidence",
  "approval_evidence",
  "audit_record",
] as const;

export interface OutstandingWork {
  /** 非終端 PLAN を layer 別に集計 (key 昇順、IMP-139 a)。 */
  nonTerminalPlansByLayer: Record<string, number>;
  /** 非終端 PLAN 総数。 */
  nonTerminalPlansTotal: number;
  /** 非終端のうち version-up parked (version_target 付き draft) 数 (PLAN-DISCOVERY-09)。
   *  「将来版へ保全」を active draft (WIP) と分離して surface する (green に埋めない)。 */
  versionUpParked: number;
  /** active draft (= 非終端 − version-up parked)。WIP の実数。 */
  activeDraftTotal: number;
  /** open な spec-backfill placeholder_deps carry 数 (IMP-139 b)。 */
  openDefers: number;
  /** 非終端 PLAN の主要 blocker / wait reason 別集計。完了扱いしない理由を status surface に出す。 */
  blockersByKind: Record<string, number>;
  /** 非終端 PLAN の明細。status --json / handover で完了主張を計画単位に照合する。 */
  items: OutstandingItem[];
  /** 要求修正 / parked / cutover を「意味単位」で閉じないための G-SF record。 */
  semanticFeatureFrontierRecords?: SemanticFeatureFrontierRecord[];
  /**
   * L3 confirmed 46 件を意味単位で束ねた live catalog。
   * frontier ではないため semanticFeatureFrontierRecords には混ぜず、L3/L12 trace の
   * 機械照合用に status/handover JSON へ出す。
   */
  confirmedCurrentMeaningRecords?: ConfirmedCurrentMeaningRecord[];
  /** 全プログラム完了 claim の可否。doctor green とは別の completion-readiness 判定。 */
  completionReadiness: CompletionReadiness;
}

export interface OutstandingPlanRow {
  planId?: string;
  layer: string;
  kind?: string;
  status: string;
  workflowPhase?: string | null;
  /** version-up parked マーカー (PLAN-DISCOVERY-09)。null = 通常。 */
  versionTarget?: string | null;
  /** 不可逆影響の機械判定。本文の境界語はこの宣言を上書きしない。 */
  irreversibleImpact?: "none" | "cutover" | "migration" | null;
  irreversibleImpactDeclared?: boolean;
  /** frontmatter/body の軽量分類用テキスト。 */
  text?: string;
}

export interface OutstandingItem {
  planId: string;
  layer: string;
  kind: string;
  status: string;
  workflowPhase: string | null;
  versionTarget: string | null;
  reason: string;
  blockers: string[];
  /** この PLAN を完了/合流へ進める前に必要な次アクション。 */
  requiredAction: string;
  /** requiredAction の PO 向け日本語表示。machine field は requiredAction を正本として残す。 */
  requiredActionJa: string;
  /** 複数 blocker を持つ PLAN で、補助 blocker の action-binding 要求を落とさないための全アクション。 */
  requiredActions: string[];
  /** requiredActions の PO 向け日本語表示。 */
  requiredActionsJa: string[];
  /** requiredAction を満たしたと機械照合するために残すべき証跡。 */
  requiredEvidence: string[];
  /** requiredEvidence の PO 向け日本語表示。machine field は requiredEvidence を正本として残す。 */
  requiredEvidenceJa: string[];
}

export type SemanticFeatureFrontierClassification =
  | "frontier_pending_decision"
  | "parked_future_version"
  | "approval_gated_cutover";

export interface SemanticFeatureFrontierRecord {
  recordName: "semantic_feature_frontier_record";
  planId: string;
  featureId: string;
  classification: SemanticFeatureFrontierClassification;
  completionClaimAllowed: false;
  blockers: string[];
  requiredRoute: string;
  reason: string;
  sourcePaths: string[];
}

export interface ConfirmedCurrentMeaningRecord {
  recordName: "confirmed_current_meaning_record";
  featureId: string;
  classification: "confirmed_current";
  meaning: string;
  l1Parents: string[];
  l3RequirementIds: string[];
  l12AcceptanceIds: string[];
  completionBoundary: "downstream_evidence_required";
  sourcePaths: string[];
}

export interface CompletionReadiness {
  ok: boolean;
  status: "ready" | "blocked";
  reason: string;
  blockers: string[];
  authorityBoundary: CompletionAuthorityBoundary;
  humanDecisionRequired: boolean;
  humanDecisionBlockers: string[];
  workflowStateBlockers: string[];
  autonomousWorkBlockers: string[];
  nextAuthority: CompletionNextAuthority;
  requiredActions: string[];
  requiredActionsJa: string[];
}

export type CompletionAuthorityBoundary =
  | "none"
  | "automation_work_required"
  | "human_decision_required";

export type CompletionNextAuthority = "none" | "automation" | "human";

export type CompletionDecisionKind =
  | "po_s4_decision"
  | "version_up_activation"
  | "irreversible_migration_signoff"
  | "human_action_approval"
  | "workflow_continuation";

export type WorkflowDecisionPacketCommand =
  | "helix s4 decision-packet --json"
  | "helix version-up activation-packet --json"
  | "helix rename plan --json"
  | "helix rename approval-draft --json"
  | "helix action-binding approval-packet --json"
  | "helix completion decision-packet --json";

export interface CompletionDecisionItem {
  planId: string;
  layer: string;
  kind: string;
  status: string;
  workflowPhase: string | null;
  blockerReason: string;
  blockers: string[];
  decisionKind: CompletionDecisionKind;
  requiredAction: string;
  requiredActionJa: string;
  requiredActions: string[];
  requiredActionsJa: string[];
  requiredEvidence: string[];
  requiredEvidenceJa: string[];
  requiredRecords: CompletionDecisionRecordRequirement[];
  recordTemplates: CompletionDecisionRecordTemplate[];
  allowedOutcomes: string[];
  allowedOutcomesByRecord: CompletionDecisionRecordOutcome[];
  nextWorkflowRoutesByRecord: CompletionDecisionRecordRoute[];
  nextWorkflowRoute: string;
  nextWorkflowRouteJa: string;
  /** Primary non-destructive packet command for the top blocker on this decision. */
  decisionPacketCommand: WorkflowDecisionPacketCommand;
  /** Repo-local package-script command that can regenerate the primary packet without relying on PATH. */
  runnableDecisionPacketCommand: string;
  /** Primary + supporting non-destructive packet commands for every blocker on this decision. */
  packetCommands: WorkflowDecisionPacketCommand[];
  /** Repo-local package-script commands for every primary + supporting packet. */
  runnablePacketCommands: string[];
  /** PLAN に絞り込んだ primary packet command。rename plan は singleton のため base command と同じ。 */
  scopedDecisionPacketCommand: string;
  /** Repo-local package-script command for the scoped primary packet. */
  runnableScopedDecisionPacketCommand: string;
  /** PLAN に絞り込んだ primary + supporting packet commands。複数 pending 時の人間判断導線。 */
  scopedPacketCommands: string[];
  /** Repo-local package-script commands for scoped primary + supporting packets. */
  runnableScopedPacketCommands: string[];
  supportingPacketSummaries: CompletionDecisionSupportingPacketSummary[];
}

export interface CompletionDecisionSupportingPacketSummary {
  command: WorkflowDecisionPacketCommand;
  runnableCommand: string;
  scopedCommand?: string;
  runnableScopedCommand?: string;
  schemaVersion:
    | "s4-decision-packet.v1"
    | "version-up-activation-packet.v1"
    | "identifier-rename-cutover-plan.v1"
    | "identifier-rename-approval-draft.v1"
    | "action-binding-approval-packet.v1"
    | "completion-decision-packet.v1";
  matrixField:
    | "decisionVerificationCommandMatrix"
    | "activationVerificationCommandMatrix"
    | "verificationCommandMatrix"
    | "approvalVerificationCommandMatrix"
    | "none";
  expectedMatrixCount: number;
  requiredReviewFields: string[];
  requiredMatrixFields: string[];
  reviewRoute: string;
  reviewRouteJa: string;
}

export interface CompletionDecisionRecordRequirement {
  recordName: string;
  fields: string[];
  sourcePaths: string[];
  sourceLedgerChecks?: CompletionDecisionSourceLedgerCheck[];
}

export interface CompletionDecisionSourceLedgerCheck {
  sourcePath: string;
  ledgerLabel: string;
}

export interface CompletionDecisionRecordOutcome {
  recordName: string;
  allowedOutcomes: string[];
}

export interface CompletionDecisionRecordRoute {
  recordName: string;
  nextWorkflowRoute: string;
}

export interface CompletionDecisionRecordTemplate {
  recordName: string;
  insertionHint: string;
  insertionHintJa?: string;
  yamlLines: string[];
  yamlLinesJa?: string[];
}

export interface CompletionDecisionPacket {
  schemaVersion: "completion-decision-packet.v1";
  ok: boolean;
  status: "ready" | "blocked";
  generatedFrom: "outstanding.completionReadiness";
  generatedAt: string;
  sourceCommand: string;
  freshness: DecisionPacketFreshness;
  authorityBoundary: CompletionAuthorityBoundary;
  humanDecisionRequired: boolean;
  humanDecisionBlockers: string[];
  workflowStateBlockers: string[];
  autonomousWorkBlockers: string[];
  nextAuthority: CompletionNextAuthority;
  semanticMeaningSummary: CompletionDecisionSemanticMeaningSummary;
  semanticFeatureFrontierRecords: SemanticFeatureFrontierRecord[];
  confirmedCurrentMeaningRecords: ConfirmedCurrentMeaningRecord[];
  decisionCount: number;
  blockers: string[];
  humanReviewBundle: CompletionDecisionHumanReviewBundle;
  decisions: CompletionDecisionItem[];
}

export interface CompletionReviewBundle {
  schemaVersion: "completion-review-bundle.v1";
  generatedAt: string;
  sourceCommand: typeof COMPLETION_REVIEW_BUNDLE_COMMAND;
  runnableSourceCommand: string;
  freshness: DecisionPacketFreshness;
  planOnly: true;
  mustNotDecide: true;
  mustNotApply: true;
  completionClaimAllowed: boolean;
  humanDecisionRequired: boolean;
  nextAuthority: CompletionNextAuthority;
  status: CompletionDecisionPacket["status"];
  decisionCount: number;
  reviewPacketCount: number;
  completionDecisionPacketCommand: typeof COMPLETION_DECISION_PACKET_COMMAND;
  runnableCompletionDecisionPacketCommand: string;
  completionDecisionPacketDigest: string;
  humanReviewBundleDigest: string;
  reviewPacketsDigest: string;
  semanticBundleDigest: string;
  bundleDigest: string;
  requiredOperatorActionsJa: string[];
  blockedUntil: string[];
  reviewCoveredBlockers: string[];
  nonPacketBlockers: string[];
  reviewPackets: CompletionReviewBundlePacket[];
}

export interface CompletionReviewBundlePacket {
  order: number;
  planId: string;
  decisionKind: CompletionDecisionKind;
  blockerReason: string;
  command: WorkflowDecisionPacketCommand;
  scopedCommand: string;
  runnableScopedCommand: string;
  schemaVersion: CompletionDecisionSupportingPacketSummary["schemaVersion"];
  matrixField: CompletionDecisionSupportingPacketSummary["matrixField"];
  expectedMatrixCount: number;
  writePolicy: "no-write" | "see-packet-matrix";
  reviewPolicy: "non_destructive_review_only";
  requiredReviewFields: string[];
  requiredReviewFieldsDigest: string;
  requiredMatrixFields: string[];
  requiredSafetyFields: string[];
  reviewRoute: string;
  reviewRouteJa: string;
}

export interface CompletionDecisionHumanReviewBundle {
  schemaVersion: "completion-decision-human-review-bundle.v1";
  status: CompletionDecisionPacket["status"];
  sourceCommand: string;
  generatedAt: string;
  decisionCount: number;
  nextAuthority: CompletionNextAuthority;
  completionClaimAllowed: boolean;
  items: CompletionDecisionHumanReviewItem[];
}

export interface CompletionDecisionHumanReviewItem {
  order: number;
  planId: string;
  decisionKind: CompletionDecisionKind;
  blockerReason: string;
  blockers: string[];
  requiredActionsJa: string[];
  requiredRecords: string[];
  ownerReviewFields: string[];
  timingReviewFields: string[];
  freshnessReviewFields: string[];
  safetyReviewFields: string[];
  scopedPrimaryPacketCommand: string;
  runnableScopedPrimaryPacketCommand: string;
  scopedSupportingPacketCommands: string[];
  runnableScopedSupportingPacketCommands: string[];
  reviewRoutesJa: string[];
  reviewRouteIds: string[];
}

export interface CompletionDecisionSemanticMeaningSummary {
  frontierRecordCount: number;
  confirmedCurrentMeaningRecordCount: number;
  completionClaimAllowed: boolean;
  sourcePaths: string[];
}

export interface CompletionDecisionPacketOptions {
  generatedAt?: string;
  now?: string;
  validForMinutes?: number;
  sourceCommand?: DecisionPacketSourceCommand;
}

export interface WorkflowNextActionItem {
  order: number;
  planId: string;
  reason: string;
  blockers: string[];
  decisionKind: CompletionDecisionKind;
  requiredAction: string;
  requiredActionJa: string;
  requiredActions: string[];
  requiredActionsJa: string[];
  requiredEvidence: string[];
  requiredEvidenceJa: string[];
  nextWorkflowRoute: string;
  nextWorkflowRouteJa: string;
  /** Primary non-destructive packet for this PLAN's top blocker. */
  decisionPacketCommand: WorkflowDecisionPacketCommand;
  /** Repo-local package-script command for the primary packet. */
  runnableDecisionPacketCommand: string;
  /** Primary + supporting non-destructive packets for every blocker on this PLAN. */
  packetCommands: WorkflowDecisionPacketCommand[];
  /** Repo-local package-script commands for primary + supporting packets. */
  runnablePacketCommands: string[];
  /** PLAN に絞り込んだ primary packet command。rename plan は singleton のため base command と同じ。 */
  scopedDecisionPacketCommand: string;
  /** Repo-local package-script command for the scoped primary packet. */
  runnableScopedDecisionPacketCommand: string;
  /** PLAN に絞り込んだ primary + supporting packet commands。複数 pending 時の人間判断導線。 */
  scopedPacketCommands: string[];
  /** Repo-local package-script commands for scoped primary + supporting packets. */
  runnableScopedPacketCommands: string[];
  /**
   * Matrix/review summary for each packet command, so status surfaces can route
   * L14/S4/version-up review without forcing a separate completion packet first.
   */
  supportingPacketSummaries: CompletionDecisionSupportingPacketSummary[];
}

/**
 * 非終端 PLAN の layer 別集計 + version-up parked 分離 + open defer 数を組む純関数。
 * archived と終端 status は未了から除外する。version-up parked は非終端に含めるが別途分離計上する。
 */
export function analyzeOutstandingWork(
  plans: OutstandingPlanRow[],
  openDefers: number,
): OutstandingWork {
  const byLayer: Record<string, number> = {};
  const blockersByKind: Record<string, number> = {};
  const items: OutstandingItem[] = [];
  let versionUpParked = 0;
  for (const p of plans) {
    const s = p.status.toLowerCase();
    if (s === "archived" || isTerminalPlanStatus(s)) continue;
    const layer = p.layer.trim() || "unknown";
    byLayer[layer] = (byLayer[layer] ?? 0) + 1;
    // version-up parked = draft + version_target。本文だけが parked を示す場合も frontier に出し、
    // version-up-readiness 側で frontmatter 欠落を hard violation にする。
    if (
      s === "draft" &&
      ((p.versionTarget ?? "").trim().length > 0 || planTextHasVersionUpParkingIntent(p.text ?? ""))
    ) {
      versionUpParked++;
    }
    const blockers = classifyOutstandingBlockers(p);
    const reason = primaryOutstandingReason(blockers);
    const action = requiredOutstandingAction(reason);
    const requiredActions = requiredActionsForBlockers(blockers);
    const requiredActionsJa = requiredActions.map(workflowActionTextJa);
    const requiredEvidence = requiredEvidenceForBlockers(blockers);
    const requiredEvidenceJa = requiredEvidenceJaForEvidenceList(requiredEvidence);
    for (const blocker of blockers) blockersByKind[blocker] = (blockersByKind[blocker] ?? 0) + 1;
    items.push({
      planId: (p.planId ?? "unknown").trim() || "unknown",
      layer,
      kind: (p.kind ?? "unknown").trim() || "unknown",
      status: p.status,
      workflowPhase: p.workflowPhase ?? null,
      versionTarget: p.versionTarget ?? null,
      reason,
      blockers,
      requiredAction: action.requiredAction,
      requiredActionJa: workflowActionTextJa(action.requiredAction),
      requiredActions,
      requiredActionsJa,
      requiredEvidence,
      requiredEvidenceJa,
    });
  }
  // 決定論順 (layer key 昇順) で再構築する (出力安定性)。
  const ordered: Record<string, number> = {};
  for (const key of Object.keys(byLayer).sort()) ordered[key] = byLayer[key];
  const orderedBlockers: Record<string, number> = {};
  for (const key of Object.keys(blockersByKind).sort()) orderedBlockers[key] = blockersByKind[key];
  items.sort((a, b) => a.planId.localeCompare(b.planId));
  const total = Object.values(ordered).reduce((acc, n) => acc + n, 0);
  const base = {
    nonTerminalPlansByLayer: ordered,
    nonTerminalPlansTotal: total,
    versionUpParked,
    activeDraftTotal: Math.max(0, total - versionUpParked),
    openDefers: Math.max(0, openDefers),
    blockersByKind: orderedBlockers,
    items,
    semanticFeatureFrontierRecords: semanticFeatureFrontierRecordsForItems(items),
    confirmedCurrentMeaningRecords: confirmedCurrentMeaningRecords(),
  };
  return {
    ...base,
    completionReadiness: completionReadinessForOutstanding(base),
  };
}

function confirmedCurrentMeaningRecords(): ConfirmedCurrentMeaningRecord[] {
  return [
    {
      featureId: "forward_convergence",
      meaning: "逸脱受け止めと Forward 収束",
      l1Parents: ["HBR-P0"],
      l3RequirementIds: ["HR-FR-P0-01", "HR-FR-P0-02"],
      l12AcceptanceIds: ["HAT-P0-01", "HAT-P0-02"],
    },
    {
      featureId: "continuous_autonomy_version_up",
      meaning: "連続自律走行 / Scrum 分割 / version-up",
      l1Parents: ["HBR-P1"],
      l3RequirementIds: ["HR-FR-P1-01", "HR-FR-P1-02", "HR-FR-P1-03", "HR-FR-P1-04"],
      l12AcceptanceIds: ["HAT-P1-01", "HAT-P1-02", "HAT-P1-03", "HAT-P1-04"],
    },
    {
      featureId: "pair_agent_tdd_route",
      meaning: "agent/tool/runtime guardrail + pair-agent TDD route",
      l1Parents: ["HBR-P2", "HBR-P3", "HBR-P4"],
      l3RequirementIds: ["HR-FR-P2-01", "HR-FR-P2-02", "HR-FR-P2-03", "HR-FR-P2-04"],
      l12AcceptanceIds: ["HAT-P2-01", "HAT-P2-02", "HAT-P2-03", "HAT-P2-04"],
    },
    {
      featureId: "strong_verification",
      meaning: "強い検証 / test-first / 実装精度",
      l1Parents: ["HBR-P3", "HNFR-P3"],
      l3RequirementIds: [
        "HR-FR-P3-01",
        "HR-FR-P3-02",
        "HR-NFR-P3-01",
        "HR-NFR-P3-02",
        "HR-NFR-P3-03",
        "HR-NFR-P3-04",
      ],
      l12AcceptanceIds: [
        "HAT-P3-01",
        "HAT-P3-02",
        "HAT-N3-01",
        "HAT-N3-02",
        "HAT-N3-03",
        "HAT-N3-04",
      ],
    },
    {
      featureId: "auto_repair_metrics",
      meaning: "自動修復 / 計測改善",
      l1Parents: ["HBR-P4"],
      l3RequirementIds: ["HR-FR-P4-01", "HR-FR-P4-02", "HR-FR-P4-03"],
      l12AcceptanceIds: ["HAT-P4-01", "HAT-P4-02", "HAT-P4-03"],
    },
    {
      featureId: "github_setup_release_rename",
      meaning: "GitHub 自動化 / setup / release / rename",
      l1Parents: ["HBR-P6"],
      l3RequirementIds: ["HR-FR-P6-01", "HR-FR-P6-02", "HR-FR-P6-03", "HR-FR-P6-04", "HR-FR-P6-05"],
      l12AcceptanceIds: ["HAT-P6-01", "HAT-P6-02", "HAT-P6-03", "HAT-P6-04", "HAT-P6-05"],
    },
    {
      featureId: "shared_memory_ddd",
      meaning: "共有 memory / Glossary / DDD context",
      l1Parents: ["HBR-P7"],
      l3RequirementIds: ["HR-FR-P7-01", "HR-FR-P7-02", "HR-FR-P7-03"],
      l12AcceptanceIds: ["HAT-P7-01", "HAT-P7-02", "HAT-P7-03"],
    },
    {
      featureId: "external_grounding_security",
      meaning: "外部検索 / skillify / security boundary",
      l1Parents: ["HBR-P8", "HNFR-P8"],
      l3RequirementIds: [
        "HR-FR-P8-01",
        "HR-FR-P8-02",
        "HR-FR-P8-03",
        "HR-FR-P8-04",
        "HR-NFR-P8-01",
        "HR-NFR-P8-02",
        "HR-NFR-P8-03",
      ],
      l12AcceptanceIds: [
        "HAT-P8-01",
        "HAT-P8-02",
        "HAT-P8-03",
        "HAT-P8-04",
        "HAT-N8-01",
        "HAT-N8-02",
        "HAT-N8-03",
      ],
    },
    {
      featureId: "db_convergence_contract",
      meaning: "DB 収束 / relation graph / contract ledger",
      l1Parents: ["HBR-P9"],
      l3RequirementIds: [
        "HR-FR-P9-01",
        "HR-FR-P9-02",
        "HR-FR-P9-03",
        "HR-FR-P9-04",
        "HR-FR-P9-05",
        "HR-FR-P9-06",
      ],
      l12AcceptanceIds: [
        "HAT-P9-01",
        "HAT-P9-02",
        "HAT-P9-03",
        "HAT-P9-04",
        "HAT-P9-05",
        "HAT-P9-06",
      ],
    },
    {
      featureId: "context_efficiency",
      meaning: "context efficiency",
      l1Parents: ["HNFR-P5"],
      l3RequirementIds: ["HR-NFR-P5-01", "HR-NFR-P5-02", "HR-NFR-P5-03"],
      l12AcceptanceIds: ["HAT-N5-01", "HAT-N5-02", "HAT-N5-03"],
    },
    {
      featureId: "adapter_rule_memory_consistency",
      meaning: "adapter/rule/memory 一貫性",
      l1Parents: ["HNFR-AC"],
      l3RequirementIds: ["HR-NFR-AC-01", "HR-NFR-AC-02", "HR-NFR-AC-03"],
      l12AcceptanceIds: ["HAT-NAC-01", "HAT-NAC-02", "HAT-NAC-03"],
    },
  ].map((record) => ({
    recordName: "confirmed_current_meaning_record" as const,
    classification: "confirmed_current" as const,
    completionBoundary: "downstream_evidence_required" as const,
    sourcePaths: [
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
    ],
    ...record,
  }));
}

function semanticFeatureFrontierRecordsForItems(
  items: OutstandingItem[],
): SemanticFeatureFrontierRecord[] {
  return items
    .map(semanticFeatureFrontierRecordForItem)
    .filter((record): record is SemanticFeatureFrontierRecord => record !== null);
}

function semanticFeatureFrontierRecordForItem(
  item: OutstandingItem,
): SemanticFeatureFrontierRecord | null {
  const classification = semanticFeatureFrontierClassificationForItem(item);
  if (!classification) return null;
  return {
    recordName: "semantic_feature_frontier_record",
    planId: item.planId,
    featureId: semanticFeatureIdForPlan(item.planId),
    classification,
    completionClaimAllowed: false,
    blockers: item.blockers,
    requiredRoute: nextWorkflowRouteForOutstandingReason(item.reason),
    reason: item.reason,
    sourcePaths: semanticFeatureSourcePathsForClassification(classification),
  };
}

function semanticFeatureFrontierClassificationForItem(
  item: OutstandingItem,
): SemanticFeatureFrontierClassification | null {
  if (item.blockers.includes("irreversible_migration_pending")) {
    return "approval_gated_cutover";
  }
  if (item.blockers.includes("version_up_parked")) {
    return "parked_future_version";
  }
  if (item.blockers.includes("po_decision_pending")) {
    return "frontier_pending_decision";
  }
  return null;
}

function semanticFeatureIdForPlan(planId: string): string {
  if (planId === "PLAN-M-02" || planId.startsWith("PLAN-M-02-")) return "name_cutover";
  switch (planId) {
    case "PLAN-DISCOVERY-10":
    case "PLAN-DISCOVERY-10-helix-asset-visualization":
      return "asset_progress_visualization";
    case "PLAN-DISCOVERY-07":
    case "PLAN-DISCOVERY-07-design-bottomup-mode":
      return "design_bottomup_mode";
    case "PLAN-L7-146":
    case "PLAN-L7-146-serverless-readonly-share":
      return "serverless_readonly_share";
    default:
      return planId
        .toLowerCase()
        .replace(/^plan-/, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
  }
}

function semanticFeatureSourcePathsForClassification(
  classification: SemanticFeatureFrontierClassification,
): string[] {
  switch (classification) {
    case "frontier_pending_decision":
      return [
        "docs/process/modes/discovery.md",
        "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
        "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
      ];
    case "parked_future_version":
      return [
        "docs/process/modes/version-up.md",
        "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      ];
    case "approval_gated_cutover":
      return [
        "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
        "docs/process/forward/L08-L14-verification-phase.md",
        "docs/plans/PLAN-M-02-helix-identifier-rename.md",
      ];
  }
}

function classifyOutstandingBlockers(p: OutstandingPlanRow): string[] {
  const text = [p.planId, p.layer, p.kind, p.status, p.workflowPhase, p.versionTarget, p.text]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
  const blockers = new Set<string>();
  if (
    p.planId === "CONSUMER-SETUP-BOUNDARY" ||
    /consumer_setup_readiness_not_whole_program_completion|completionclaimallowed=false/i.test(text)
  ) {
    blockers.add("consumer_setup_boundary");
  }
  if ((p.versionTarget ?? "").trim()) {
    blockers.add("version_up_parked");
  } else if (planTextHasVersionUpParkingIntent(p.text ?? "")) {
    blockers.add("version_up_frontmatter_missing");
    blockers.add("version_up_parked");
  }
  if (
    p.kind === "poc" &&
    (/\bS[34]\b/i.test(p.workflowPhase ?? "") ||
      (!(p.workflowPhase ?? "").trim() &&
        /s4 decision|s4 decide|decision_outcome|po\/s4|s4 判断|s4 判定/i.test(text)))
  ) {
    blockers.add("po_decision_pending");
  }
  if (planTextRequiresActionBindingApproval(text)) {
    blockers.add("human_approval_pending");
  }
  if (hasIrreversibleMigrationContext(p, text)) {
    blockers.add("irreversible_migration_pending");
  }
  if (blockers.size === 0) blockers.add("active_draft");
  return [...blockers].sort();
}

function hasIrreversibleMigrationContext(p: OutstandingPlanRow, text: string): boolean {
  if (p.irreversibleImpact === "none") return false;
  if (p.irreversibleImpact === "cutover" || p.irreversibleImpact === "migration") return true;
  // fieldが存在するがschema不適合ならplan lintがrejectする。本文fallbackで別分類へ化けさせない。
  if (p.irreversibleImpactDeclared) return false;
  const planId = (p.planId ?? "").trim();
  if (p.layer === "L14" || planId === "PLAN-M-02" || planId.startsWith("PLAN-M-02-")) {
    return /irreversible|不可逆|state dir|cutover|\.helix\/.*\.helix|atomic migration/i.test(text);
  }
  if ((p.versionTarget ?? "").trim()) {
    return /cutover_decision_record|state dir|\.helix\/.*\.helix|atomic migration/i.test(text);
  }
  if (/cutover_decision_record|state dir|\.helix\/.*\.helix|atomic migration/i.test(text)) {
    return true;
  }
  return /irreversible|不可逆/i.test(text) && /cutover|migration|state dir|rename/i.test(text);
}

export function planTextHasVersionUpParkingIntent(text: string): boolean {
  const value = text.toLowerCase();
  if (/activation_decision_record/i.test(text) && /parked_review_record/i.test(text)) return true;
  if (/version-up parked/i.test(text)) return true;
  return /mode=version-up/i.test(text) && /version_target/i.test(value);
}

function primaryOutstandingReason(blockers: string[]): string {
  const priority = [
    "irreversible_migration_pending",
    "version_up_frontmatter_missing",
    "version_up_parked",
    "po_decision_pending",
    "human_approval_pending",
    "consumer_setup_boundary",
    "active_draft",
  ];
  return priority.find((p) => blockers.includes(p)) ?? blockers[0] ?? "active_draft";
}

function requiredOutstandingAction(reason: string): {
  requiredAction: string;
  requiredEvidence: string[];
} {
  switch (reason) {
    case "irreversible_migration_pending":
      return {
        requiredAction:
          "obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
        requiredEvidence: [
          "cutover_decision_record with allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes",
          "decision_owner and approval_scope recorded before irreversible migration",
          "cutover_snapshot_id from the current cutoverSnapshot.snapshotId recorded before irreversible migration approval",
          "trigger_condition and blast_radius_baseline recorded before irreversible migration",
          "dry_run_plan, rollback_plan, state_backup_plan, and audit_record recorded before apply",
          "execution_window_or_freeze_policy recorded before irreversible apply",
          "post_cutover_monitoring and legacy_alias_policy recorded before terminal status",
          ...SOURCE_LEDGER_MEANING_REVIEW_EVIDENCE,
        ],
      };
    case "version_up_parked":
      return {
        requiredAction:
          "keep parked until a future version-up activation decision is recorded; do not count this as active frontier completion",
        requiredEvidence: [
          "activation_decision_record with allowed_outcome activate_future_version / reject_or_archive / keep_parked_with_review_date, target_version_or_release_trigger, and activation_route",
          "activation_snapshot_id from the current activationSnapshot.snapshotId recorded before activation approval",
          "parked_review_record with review_owner, review_trigger, review_by_policy, stale_action, activation_dependency, and decision_packet_route",
          "review_by date/owner recorded when keep_parked_with_review_date is chosen",
          "approval_scope, dry_run_plan, and rollback_plan recorded before external infra/auth/secret activation",
          "required action-binding approval evidence when activation touches infra/auth/secrets",
          "external_rehearsal_plan records official source basis, budget, signature, access, no-secret/PII, no-prod-write, and rollback rehearsal evidence",
          "cost_guardrails records provider free-tier limits and exceed_action before activation",
          "activation_provenance_requirements records source ledger, dry-run evidence, approval evidence, and audit record before activation",
          ...SOURCE_LEDGER_MEANING_REVIEW_EVIDENCE,
        ],
      };
    case "version_up_frontmatter_missing":
      return {
        requiredAction:
          "record version_target frontmatter before treating version-up parked work as a valid future-version frontier",
        requiredEvidence: [
          "version_target frontmatter records the future release target before status/outstanding can classify the PLAN as parked",
          "activation_decision_record and parked_review_record remain plan-only until version-up activation is approved",
          ...SOURCE_LEDGER_MEANING_REVIEW_EVIDENCE,
        ],
      };
    case "po_decision_pending":
      return {
        requiredAction: "record the PO/S4 decision before promotion, rejection, or Forward merge",
        requiredEvidence: [
          "s4_decision_record with allowed_outcome confirmed / rejected / pivot",
          "decision_owner and decision_basis recorded before terminal status",
          "verified_evidence, stakeholder_review_or_proxy, acceptance_gap, unresolved_risk, external_source_basis, and route_impact recorded before S4 decision",
          "forward_route / reverse_fullback_required recorded when confirmed",
          "decision_outcome recorded in the PLAN at S4",
          "promotion_strategy_or_rejection_pivot_rationale recorded before terminal status",
          ...SOURCE_LEDGER_MEANING_REVIEW_EVIDENCE,
        ],
      };
    case "human_approval_pending":
      return {
        requiredAction:
          "record required human/action-binding approval before executing the high-impact action",
        requiredEvidence: [
          "action_binding_approval_record with allowed_outcome, approval_policy_or_named_approver, approval_scope, approved_actor, approved_tool, approved_target, approved_params, review_approval_evidence, reviewed_snapshot_binding, expires_at_or_trigger, and audit_record",
          "approval scope binds approved_actor/approved_tool/approved_target/approved_params before activation",
          "review/approval evidence, reviewed snapshot binding, and expiry or trigger condition recorded before activation",
        ],
      };
    case "consumer_setup_boundary":
      return {
        requiredAction:
          "start or select the project PLAN and record real project acceptance evidence before claiming whole-program completion",
        requiredEvidence: [
          "project_setup_state with objectiveBoundary.scope=consumer_setup_readiness_not_whole_program_completion and completionClaimAllowed=false",
          "first project PLAN or handover route selected before implementation starts",
          "completion decision packet saved as first-run evidence before claiming L14 or whole-program completion",
        ],
      };
    default:
      return {
        requiredAction:
          "continue the applicable workflow phase or mark terminal only after generated artifacts and review evidence are present",
        requiredEvidence: [
          "required generated artifacts are present",
          "review_evidence and green_commands are recorded before terminal status",
        ],
      };
  }
}

function requiredActionsForBlockers(blockers: string[]): string[] {
  return uniqueInOrder(
    blockers.map((blocker) => requiredOutstandingAction(blocker).requiredAction),
  );
}

function requiredEvidenceForBlockers(blockers: string[]): string[] {
  return uniqueInOrder(
    blockers.flatMap((blocker) => requiredOutstandingAction(blocker).requiredEvidence),
  );
}

function requiredEvidenceJaForEvidenceList(requiredEvidence: string[]): string[] {
  return requiredEvidence.map(workflowEvidenceTextJa);
}

export function workflowEvidenceTextJa(evidence: string): string {
  switch (evidence) {
    case "cutover_decision_record with allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes":
      return "cutover_decision_record に allowed_outcome approve_cutover / reject_or_defer / request_runbook_changes のいずれかを記録する";
    case "decision_owner and approval_scope recorded before irreversible migration":
      return "不可逆 migration 前に decision_owner と approval_scope を記録する";
    case "cutover_snapshot_id from the current cutoverSnapshot.snapshotId recorded before irreversible migration approval":
      return "不可逆 migration approval 前に current cutoverSnapshot.snapshotId 由来の cutover_snapshot_id を記録する";
    case "trigger_condition and blast_radius_baseline recorded before irreversible migration":
      return "不可逆 migration 前に trigger_condition と blast_radius_baseline を記録する";
    case "dry_run_plan, rollback_plan, state_backup_plan, and audit_record recorded before apply":
      return "apply 前に dry_run_plan / rollback_plan / state_backup_plan / audit_record を記録する";
    case "execution_window_or_freeze_policy recorded before irreversible apply":
      return "不可逆 apply 前に execution_window_or_freeze_policy を記録する";
    case "post_cutover_monitoring and legacy_alias_policy recorded before terminal status":
      return "terminal status 前に post_cutover_monitoring と legacy_alias_policy を記録する";
    case "activation_decision_record with allowed_outcome activate_future_version / reject_or_archive / keep_parked_with_review_date, target_version_or_release_trigger, and activation_route":
      return "activation_decision_record に allowed_outcome / target_version_or_release_trigger / activation_route を記録する";
    case "activation_snapshot_id from the current activationSnapshot.snapshotId recorded before activation approval":
      return "activation approval 前に current activationSnapshot.snapshotId 由来の activation_snapshot_id を記録する";
    case "parked_review_record with review_owner, review_trigger, review_by_policy, stale_action, activation_dependency, and decision_packet_route":
      return "parked_review_record に review_owner / review_trigger / review_by_policy / stale_action / activation_dependency / decision_packet_route を記録する";
    case "review_by date/owner recorded when keep_parked_with_review_date is chosen":
      return "keep_parked_with_review_date を選ぶ場合は review_by の日付と owner を記録する";
    case "approval_scope, dry_run_plan, and rollback_plan recorded before external infra/auth/secret activation":
      return "外部 infra/auth/secret activation 前に approval_scope / dry_run_plan / rollback_plan を記録する";
    case "required action-binding approval evidence when activation touches infra/auth/secrets":
      return "activation が infra/auth/secrets に触れる場合は action-binding approval evidence を記録する";
    case "external_rehearsal_plan records official source basis, budget, signature, access, no-secret/PII, no-prod-write, and rollback rehearsal evidence":
      return "external_rehearsal_plan に公式 source basis / budget / signature / access / no-secret・PII / no-prod-write / rollback rehearsal evidence を記録する";
    case "cost_guardrails records provider free-tier limits and exceed_action before activation":
      return "activation 前に cost_guardrails へ provider free-tier limit と exceed_action を記録する";
    case "activation_provenance_requirements records source ledger, dry-run evidence, approval evidence, and audit record before activation":
      return "activation 前に activation_provenance_requirements へ source ledger / dry-run evidence / approval evidence / audit record を記録する";
    case "version_target frontmatter records the future release target before status/outstanding can classify the PLAN as parked":
      return "status/outstanding が PLAN を parked と分類する前に version_target frontmatter で将来 release target を記録する";
    case "activation_decision_record and parked_review_record remain plan-only until version-up activation is approved":
      return "note: version-up activation が approved になるまで activation_decision_record と parked_review_record は plan-only のまま保持する";
    case "s4_decision_record with allowed_outcome confirmed / rejected / pivot":
      return "s4_decision_record に allowed_outcome confirmed / rejected / pivot のいずれかを記録する";
    case "decision_owner and decision_basis recorded before terminal status":
      return "terminal status 前に decision_owner と decision_basis を記録する";
    case "verified_evidence, stakeholder_review_or_proxy, acceptance_gap, unresolved_risk, external_source_basis, and route_impact recorded before S4 decision":
      return "S4 decision 前に verified_evidence / stakeholder_review_or_proxy / acceptance_gap / unresolved_risk / external_source_basis / route_impact を記録する";
    case "forward_route / reverse_fullback_required recorded when confirmed":
      return "confirmed の場合は forward_route / reverse_fullback_required を記録する";
    case "decision_outcome recorded in the PLAN at S4":
      return "S4 で PLAN に decision_outcome を記録する";
    case "promotion_strategy_or_rejection_pivot_rationale recorded before terminal status":
      return "terminal status 前に promotion_strategy_or_rejection_pivot_rationale を記録する";
    case "action_binding_approval_record with allowed_outcome, approval_policy_or_named_approver, approval_scope, approved_actor, approved_tool, approved_target, approved_params, review_approval_evidence, reviewed_snapshot_binding, expires_at_or_trigger, and audit_record":
      return "action_binding_approval_record に allowed_outcome / approver / scope / actor / tool / target / params / review evidence / snapshot binding / expiry / audit を記録する";
    case "approval scope binds approved_actor/approved_tool/approved_target/approved_params before activation":
      return "activation 前に approval scope が approved_actor / approved_tool / approved_target / approved_params を拘束する";
    case "review/approval evidence, reviewed snapshot binding, and expiry or trigger condition recorded before activation":
      return "activation 前に review/approval evidence / reviewed snapshot binding / expiry または trigger condition を記録する";
    case "project_setup_state with objectiveBoundary.scope=consumer_setup_readiness_not_whole_program_completion and completionClaimAllowed=false":
      return "project_setup_state に objectiveBoundary.scope=consumer_setup_readiness_not_whole_program_completion と completionClaimAllowed=false を記録する";
    case "first project PLAN or handover route selected before implementation starts":
      return "実装開始前に最初の project PLAN または handover route を選択する";
    case "completion decision packet saved as first-run evidence before claiming L14 or whole-program completion":
      return "L14 または whole-program completion を主張する前に completion decision packet を first-run evidence として保存する";
    case "required generated artifacts are present":
      return "必要な generated artifact が存在する";
    case "review_evidence and green_commands are recorded before terminal status":
      return "terminal status 前に review_evidence と green_commands を記録する";
    case "source_ledger_freshness records the fresh checked ledger label before terminal decision use":
      return "terminal decision に使う前に source_ledger_freshness へ fresh checked ledger label を記録する";
    case "source_status_delta records none/changed official source status impact before terminal decision use":
      return "terminal decision に使う前に source_status_delta へ none/changed の official source status impact を記録する";
    case "adoption_decision_delta records none/changed adoption decision impact before terminal decision use":
      return "terminal decision に使う前に adoption_decision_delta へ none/changed の adoption decision impact を記録する";
    case "workflow_route_impact records none or the named workflow reroute before terminal decision use":
      return "terminal decision に使う前に workflow_route_impact へ none または named workflow reroute を記録する";
    default:
      return evidence;
  }
}

function uniqueInOrder<T extends string>(values: T[]): T[] {
  return [...new Set(values)];
}

/** docs/plans/*.md の layer / status を frontmatter から読む (PLAN registry を介さず最新値)。 */
export function loadOutstandingPlanRows(repoRoot: string): OutstandingPlanRow[] {
  const dir = join(repoRoot, "docs", "plans");
  const rows: OutstandingPlanRow[] = [];
  const consumerSetupBoundary = consumerSetupBoundaryPlanRow(repoRoot);
  if (consumerSetupBoundary) rows.push(consumerSetupBoundary);
  if (!existsSync(dir)) return rows;
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    let content = "";
    try {
      content = readFileSync(join(dir, f), "utf8");
    } catch {
      continue;
    }
    const rawFrontmatter = parseYaml(
      content.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? "",
    ) as Record<string, unknown> | null;
    const parsedFrontmatter = frontmatterSchema.safeParse(rawFrontmatter);
    const irreversibleImpactDeclared = Object.hasOwn(rawFrontmatter ?? {}, "irreversible_impact");
    rows.push({
      planId: fmValue(content, "plan_id") ?? f.replace(/\.md$/, ""),
      layer: fmValue(content, "layer") ?? "unknown",
      kind: fmValue(content, "kind") ?? "unknown",
      status: fmValue(content, "status") ?? "unknown",
      workflowPhase: fmValue(content, "workflow_phase") ?? null,
      versionTarget: fmValue(content, "version_target") ?? null,
      irreversibleImpact: parsedFrontmatter.success
        ? (parsedFrontmatter.data.irreversible_impact ?? null)
        : null,
      irreversibleImpactDeclared,
      text: content,
    });
  }
  return rows;
}

function consumerSetupBoundaryPlanRow(repoRoot: string): OutstandingPlanRow | null {
  const statePath = join(repoRoot, ".helix", "state", "project-setup.json");
  if (!existsSync(statePath)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(statePath, "utf8"));
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;
  const objectiveBoundary = parsed.objectiveBoundary;
  if (!isRecord(objectiveBoundary)) return null;
  if (objectiveBoundary.scope !== "consumer_setup_readiness_not_whole_program_completion") {
    return null;
  }
  if (objectiveBoundary.completionClaimAllowed !== false) return null;
  return {
    planId: "CONSUMER-SETUP-BOUNDARY",
    layer: "L14",
    kind: "setup",
    status: "in_progress",
    workflowPhase: "post_setup",
    versionTarget: null,
    text: [
      "consumer_setup_readiness_not_whole_program_completion",
      "completionClaimAllowed=false",
      "setup readiness is first-run evidence, not L14 or whole-program completion",
    ].join("\n"),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** repo から outstanding work を集計する (I/O 失敗は fail-open でゼロ寄せ、informational surface)。 */
export function computeOutstandingWork(repoRoot: string): OutstandingWork {
  const plans = loadOutstandingPlanRows(repoRoot);
  let openDefers = 0;
  try {
    openDefers = analyzePlaceholderDeps(loadPlaceholderDepsDocs(repoRoot)).specBackfillWaits;
  } catch {
    openDefers = 0;
  }
  return analyzeOutstandingWork(plans, openDefers);
}

/** status text / doctor 向け 1 行サマリ。 */
export function outstandingSummaryLine(o: OutstandingWork): string {
  const byLayer =
    Object.entries(o.nonTerminalPlansByLayer)
      .map(([layer, n]) => `${layer}:${n}`)
      .join(", ") || "none";
  const versionUp =
    o.versionUpParked > 0
      ? `; version-up parked=${o.versionUpParked} (active draft=${o.activeDraftTotal})`
      : "";
  const blockers =
    Object.entries(o.blockersByKind)
      .map(([kind, n]) => `${kind}:${n}`)
      .join(", ") || "none";
  return `outstanding: non-terminal PLANs=${o.nonTerminalPlansTotal} (${byLayer})${versionUp}; blockers=${blockers}; open defers=${o.openDefers}`;
}

type OutstandingWorkBase = Omit<OutstandingWork, "completionReadiness">;

const HUMAN_DECISION_BLOCKERS = new Set([
  "human_approval_pending",
  "irreversible_migration_pending",
  "po_decision_pending",
  "version_up_parked",
]);

const WORKFLOW_STATE_BLOCKERS = new Set(["non_terminal_plans"]);

function completionAuthorityBoundaryForBlockers(blockers: string[]): {
  authorityBoundary: CompletionAuthorityBoundary;
  humanDecisionRequired: boolean;
  humanDecisionBlockers: string[];
  workflowStateBlockers: string[];
  autonomousWorkBlockers: string[];
  nextAuthority: CompletionNextAuthority;
} {
  const humanDecisionBlockers = blockers
    .filter((blocker) => HUMAN_DECISION_BLOCKERS.has(blocker))
    .sort();
  const workflowStateBlockers = blockers
    .filter((blocker) => WORKFLOW_STATE_BLOCKERS.has(blocker))
    .sort();
  const autonomousWorkBlockers = blockers
    .filter(
      (blocker) => !HUMAN_DECISION_BLOCKERS.has(blocker) && !WORKFLOW_STATE_BLOCKERS.has(blocker),
    )
    .sort();
  const humanDecisionRequired = humanDecisionBlockers.length > 0;
  const authorityBoundary: CompletionAuthorityBoundary =
    blockers.length === 0
      ? "none"
      : humanDecisionRequired
        ? "human_decision_required"
        : "automation_work_required";
  const nextAuthority: CompletionNextAuthority =
    authorityBoundary === "none"
      ? "none"
      : authorityBoundary === "human_decision_required"
        ? "human"
        : "automation";
  return {
    authorityBoundary,
    humanDecisionRequired,
    humanDecisionBlockers,
    workflowStateBlockers,
    autonomousWorkBlockers,
    nextAuthority,
  };
}

export function completionReadinessForOutstanding(o: OutstandingWorkBase): CompletionReadiness {
  const blockers = new Set<string>();
  if (o.nonTerminalPlansTotal > 0) blockers.add("non_terminal_plans");
  if (o.openDefers > 0) blockers.add("open_defers");
  for (const blocker of Object.keys(o.blockersByKind)) blockers.add(blocker);
  const blockedFrontierRecords = (o.semanticFeatureFrontierRecords ?? []).filter(
    (record) => record.completionClaimAllowed === false,
  );
  if (blockedFrontierRecords.length > 0) {
    blockers.add("semantic_frontier_blocked");
    for (const record of blockedFrontierRecords) {
      for (const blocker of record.blockers) blockers.add(blocker);
    }
  }

  const requiredActions = [...new Set(o.items.flatMap((item) => item.requiredActions))].sort();
  const requiredActionsJa = requiredActions.map(workflowActionTextJa);
  if (o.openDefers > 0) {
    requiredActions.push(
      "resolve open placeholder/spec-backfill defers before claiming whole-program completion",
    );
    requiredActionsJa.push(
      "whole-program completion を主張する前に placeholder/spec-backfill defer を解消する",
    );
  }
  if (blockedFrontierRecords.length > 0) {
    requiredActions.push(
      "resolve semantic feature frontier records before claiming whole-program completion",
    );
    requiredActionsJa.push(
      "whole-program completion を主張する前に semantic feature frontier record を解消する",
    );
  }

  if (blockers.size === 0) {
    const authority = completionAuthorityBoundaryForBlockers([]);
    return {
      ok: true,
      status: "ready",
      reason: "no non-terminal PLANs or open defers remain",
      blockers: [],
      ...authority,
      requiredActions: [],
      requiredActionsJa: [],
    };
  }

  const blockerList = [...blockers].sort();
  const authority = completionAuthorityBoundaryForBlockers(blockerList);
  return {
    ok: false,
    status: "blocked",
    reason:
      "whole-program completion is blocked; doctor green is not a substitute for closing outstanding work",
    blockers: blockerList,
    ...authority,
    requiredActions,
    requiredActionsJa,
  };
}

export function completionReadinessLine(o: OutstandingWork): string {
  const readiness = o.completionReadiness;
  if (readiness.ok) return "completion: ready (no outstanding work)";
  return `completion: blocked (${readiness.blockers.join(", ")}); authority=${readiness.authorityBoundary}; next-authority=${readiness.nextAuthority}; authority-blockers=human:${readiness.humanDecisionBlockers.join(",") || "none"} workflow-state:${readiness.workflowStateBlockers.join(",") || "none"} automation:${readiness.autonomousWorkBlockers.join(",") || "none"}; required actions=${readiness.requiredActions.length}`;
}

export function workflowNextActionForOutstanding(o: OutstandingWork): string {
  const readiness = o.completionReadiness;
  if (readiness.ok) {
    return "completion-ready: run completion claim audit before marking the whole objective complete";
  }
  const prioritizedItem = workflowNextActionsForOutstanding(o)[0];
  const action =
    prioritizedItem?.requiredAction ??
    readiness.requiredActions[0] ??
    "resolve outstanding blockers before claiming completion";
  return `completion-blocked: ${action}`;
}

export function workflowNextActionsForOutstanding(o: OutstandingWork): WorkflowNextActionItem[] {
  if (o.completionReadiness.ok) return [];
  return [...o.items]
    .sort(
      (a, b) =>
        workflowActionRank(a.reason) - workflowActionRank(b.reason) ||
        a.planId.localeCompare(b.planId),
    )
    .map((item, index) => {
      const packetCommands = packetCommandsForOutstandingBlockers(item.reason, item.blockers);
      const scopedPacketCommands = scopedPacketCommandsForPlan(item.planId, packetCommands);
      const decisionPacketCommand = decisionPacketCommandForOutstandingReason(item.reason);
      const scopedDecisionPacketCommand = scopedPacketCommandForPlan(
        item.planId,
        decisionPacketCommand,
      );
      return {
        order: index + 1,
        planId: item.planId,
        reason: item.reason,
        blockers: item.blockers,
        decisionKind: decisionKindForOutstandingReason(item.reason),
        requiredAction: item.requiredAction,
        requiredActionJa: item.requiredActionJa,
        requiredActions: item.requiredActions,
        requiredActionsJa: item.requiredActionsJa,
        requiredEvidence: item.requiredEvidence,
        requiredEvidenceJa: item.requiredEvidenceJa,
        nextWorkflowRoute: nextWorkflowRouteForOutstandingReason(item.reason),
        nextWorkflowRouteJa: workflowRouteTextJa(
          nextWorkflowRouteForOutstandingReason(item.reason),
        ),
        decisionPacketCommand,
        runnableDecisionPacketCommand: runnablePacketCommand(decisionPacketCommand),
        packetCommands,
        runnablePacketCommands: packetCommands.map(runnablePacketCommand),
        scopedDecisionPacketCommand,
        runnableScopedDecisionPacketCommand: runnablePacketCommand(scopedDecisionPacketCommand),
        scopedPacketCommands,
        runnableScopedPacketCommands: scopedPacketCommands.map(runnablePacketCommand),
        supportingPacketSummaries: packetCommands.map((command) =>
          supportingPacketSummaryForCommand(command, item.planId),
        ),
      };
    });
}

function workflowActionRank(reason: string): number {
  const priority = [
    "po_decision_pending",
    "version_up_frontmatter_missing",
    "version_up_parked",
    "irreversible_migration_pending",
    "human_approval_pending",
    "consumer_setup_boundary",
    "active_draft",
  ];
  const rank = priority.indexOf(reason);
  return rank === -1 ? Number.MAX_SAFE_INTEGER : rank;
}

export function completionDecisionPacketForOutstanding(
  outstanding: OutstandingWork,
  opts: CompletionDecisionPacketOptions = {},
): CompletionDecisionPacket {
  const provenance = buildDecisionPacketProvenance({
    generatedAt: opts.generatedAt,
    now: opts.now,
    validForMinutes: opts.validForMinutes,
    sourceCommand: opts.sourceCommand ?? COMPLETION_DECISION_PACKET_COMMAND,
  });
  const decisions = outstanding.items.map((item) => {
    const requiredRecords = requiredRecordsForBlockers(item.blockers);
    const packetCommands = packetCommandsForOutstandingBlockers(item.reason, item.blockers);
    const decisionPacketCommand = decisionPacketCommandForOutstandingReason(item.reason);
    return {
      planId: item.planId,
      layer: item.layer,
      kind: item.kind,
      status: item.status,
      workflowPhase: item.workflowPhase,
      blockerReason: item.reason,
      blockers: item.blockers,
      decisionKind: decisionKindForOutstandingReason(item.reason),
      requiredAction: item.requiredAction,
      requiredActionJa: item.requiredActionJa,
      requiredActions: item.requiredActions,
      requiredActionsJa: item.requiredActionsJa,
      requiredEvidence: item.requiredEvidence,
      requiredEvidenceJa: item.requiredEvidenceJa,
      requiredRecords,
      recordTemplates: recordTemplatesForRecords(requiredRecords),
      allowedOutcomes: allowedOutcomesForOutstandingReason(item.reason),
      allowedOutcomesByRecord: allowedOutcomesForRecords(requiredRecords),
      nextWorkflowRoutesByRecord: nextWorkflowRoutesForRecords(requiredRecords),
      nextWorkflowRoute: nextWorkflowRouteForOutstandingReason(item.reason),
      nextWorkflowRouteJa: workflowRouteTextJa(nextWorkflowRouteForOutstandingReason(item.reason)),
      decisionPacketCommand,
      runnableDecisionPacketCommand: runnablePacketCommand(decisionPacketCommand),
      packetCommands,
      runnablePacketCommands: packetCommands.map(runnablePacketCommand),
      scopedDecisionPacketCommand: scopedPacketCommandForPlan(item.planId, decisionPacketCommand),
      runnableScopedDecisionPacketCommand: runnablePacketCommand(
        scopedPacketCommandForPlan(item.planId, decisionPacketCommand),
      ),
      scopedPacketCommands: scopedPacketCommandsForPlan(item.planId, packetCommands),
      runnableScopedPacketCommands: scopedPacketCommandsForPlan(item.planId, packetCommands).map(
        runnablePacketCommand,
      ),
      supportingPacketSummaries: packetCommands.map((command) =>
        supportingPacketSummaryForCommand(command, item.planId),
      ),
    };
  });
  return {
    schemaVersion: "completion-decision-packet.v1",
    ok: outstanding.completionReadiness.ok,
    status: outstanding.completionReadiness.status,
    generatedFrom: "outstanding.completionReadiness",
    generatedAt: provenance.generatedAt,
    sourceCommand: provenance.sourceCommand,
    freshness: provenance.freshness,
    authorityBoundary: outstanding.completionReadiness.authorityBoundary,
    humanDecisionRequired: outstanding.completionReadiness.humanDecisionRequired,
    humanDecisionBlockers: outstanding.completionReadiness.humanDecisionBlockers,
    workflowStateBlockers: outstanding.completionReadiness.workflowStateBlockers,
    autonomousWorkBlockers: outstanding.completionReadiness.autonomousWorkBlockers,
    nextAuthority: outstanding.completionReadiness.nextAuthority,
    semanticMeaningSummary: {
      frontierRecordCount: outstanding.semanticFeatureFrontierRecords?.length ?? 0,
      confirmedCurrentMeaningRecordCount: outstanding.confirmedCurrentMeaningRecords?.length ?? 0,
      completionClaimAllowed: outstanding.completionReadiness.ok,
      sourcePaths: [
        "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
        "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
      ],
    },
    semanticFeatureFrontierRecords: outstanding.semanticFeatureFrontierRecords ?? [],
    confirmedCurrentMeaningRecords: outstanding.confirmedCurrentMeaningRecords ?? [],
    decisionCount: outstanding.items.length,
    blockers: outstanding.completionReadiness.blockers,
    humanReviewBundle: buildCompletionDecisionHumanReviewBundle({
      status: outstanding.completionReadiness.status,
      sourceCommand: provenance.sourceCommand,
      generatedAt: provenance.generatedAt,
      decisionCount: outstanding.items.length,
      nextAuthority: outstanding.completionReadiness.nextAuthority,
      completionClaimAllowed: outstanding.completionReadiness.ok,
      decisions,
    }),
    decisions,
  };
}

export function completionReviewBundleForOutstanding(
  outstanding: OutstandingWork,
  opts: CompletionDecisionPacketOptions = {},
): CompletionReviewBundle {
  const provenance = buildDecisionPacketProvenance({
    generatedAt: opts.generatedAt,
    now: opts.now,
    validForMinutes: opts.validForMinutes,
    sourceCommand: COMPLETION_REVIEW_BUNDLE_COMMAND,
  });
  const completionDecisionPacket = completionDecisionPacketForOutstanding(outstanding, {
    generatedAt: provenance.generatedAt,
    now: opts.now ?? provenance.generatedAt,
    validForMinutes: provenance.freshness.validForMinutes,
    sourceCommand: COMPLETION_DECISION_PACKET_COMMAND,
  });
  const reviewPackets = completionDecisionPacket.decisions.flatMap((decision) =>
    decision.supportingPacketSummaries.map((summary, index) => ({
      order: index + 1,
      planId: decision.planId,
      decisionKind: decision.decisionKind,
      blockerReason: decision.blockerReason,
      command: summary.command,
      scopedCommand: summary.scopedCommand ?? summary.command,
      runnableScopedCommand:
        summary.runnableScopedCommand ??
        runnablePacketCommand(summary.scopedCommand ?? summary.command),
      schemaVersion: summary.schemaVersion,
      matrixField: summary.matrixField,
      expectedMatrixCount: summary.expectedMatrixCount,
      writePolicy:
        summary.matrixField === "none" ? ("no-write" as const) : ("see-packet-matrix" as const),
      reviewPolicy: "non_destructive_review_only" as const,
      requiredReviewFields: summary.requiredReviewFields,
      requiredReviewFieldsDigest: sha256Json(summary.requiredReviewFields),
      requiredMatrixFields: summary.requiredMatrixFields,
      requiredSafetyFields: summary.requiredReviewFields.filter(isSafetyReviewField),
      reviewRoute: summary.reviewRoute,
      reviewRouteJa: summary.reviewRouteJa,
    })),
  );
  const completionDecisionPacketDigest = sha256Json(completionDecisionPacket);
  const humanReviewBundleDigest = sha256Json(completionDecisionPacket.humanReviewBundle);
  const reviewPacketsDigest = sha256Json(reviewPackets);
  const blockedUntil = outstanding.completionReadiness.blockers;
  const decisionBlockers = new Set(
    completionDecisionPacket.decisions.flatMap((decision) => decision.blockers),
  );
  const reviewCoveredBlockers = blockedUntil.filter((blocker) => decisionBlockers.has(blocker));
  const nonPacketBlockers = blockedUntil.filter((blocker) => !decisionBlockers.has(blocker));
  const bundleWithoutDigests = {
    schemaVersion: "completion-review-bundle.v1" as const,
    generatedAt: provenance.generatedAt,
    sourceCommand: COMPLETION_REVIEW_BUNDLE_COMMAND as typeof COMPLETION_REVIEW_BUNDLE_COMMAND,
    runnableSourceCommand: runnablePacketCommand(COMPLETION_REVIEW_BUNDLE_COMMAND),
    freshness: provenance.freshness,
    planOnly: true as const,
    mustNotDecide: true as const,
    mustNotApply: true as const,
    completionClaimAllowed: completionDecisionPacket.ok,
    humanDecisionRequired: completionDecisionPacket.humanDecisionRequired,
    nextAuthority: completionDecisionPacket.nextAuthority,
    status: completionDecisionPacket.status,
    decisionCount: completionDecisionPacket.decisionCount,
    reviewPacketCount: reviewPackets.length,
    completionDecisionPacketCommand: COMPLETION_DECISION_PACKET_COMMAND,
    runnableCompletionDecisionPacketCommand: runnablePacketCommand(
      COMPLETION_DECISION_PACKET_COMMAND,
    ),
    completionDecisionPacketDigest,
    humanReviewBundleDigest,
    reviewPacketsDigest,
    requiredOperatorActionsJa: outstanding.completionReadiness.requiredActionsJa,
    blockedUntil,
    reviewCoveredBlockers,
    nonPacketBlockers,
    reviewPackets,
  } satisfies Omit<CompletionReviewBundle, "bundleDigest" | "semanticBundleDigest">;
  const bundleWithoutDigest = {
    ...bundleWithoutDigests,
    semanticBundleDigest: completionReviewBundleSemanticDigest(
      bundleWithoutDigests,
      completionDecisionPacket,
    ),
  } satisfies Omit<CompletionReviewBundle, "bundleDigest">;
  return {
    ...bundleWithoutDigest,
    bundleDigest: sha256Json(bundleWithoutDigest),
  };
}

export function completionReviewBundleSemanticDigest(
  bundle: Omit<CompletionReviewBundle, "bundleDigest" | "semanticBundleDigest">,
  decisionPacket: CompletionDecisionPacket,
): string {
  return sha256Json({
    ...bundle,
    generatedAt: "<volatile-generated-at>",
    freshness: semanticFreshness(bundle.freshness),
    completionDecisionPacketDigest: completionDecisionPacketSemanticDigest(decisionPacket),
    humanReviewBundleDigest: completionHumanReviewBundleSemanticDigest(
      decisionPacket.humanReviewBundle,
    ),
  });
}

function completionDecisionPacketSemanticDigest(packet: CompletionDecisionPacket): string {
  return sha256Json({
    ...packet,
    generatedAt: "<volatile-generated-at>",
    freshness: semanticFreshness(packet.freshness),
    humanReviewBundle: {
      ...packet.humanReviewBundle,
      generatedAt: "<volatile-generated-at>",
    },
  });
}

function completionHumanReviewBundleSemanticDigest(
  bundle: CompletionDecisionHumanReviewBundle,
): string {
  return sha256Json({
    ...bundle,
    generatedAt: "<volatile-generated-at>",
  });
}

function semanticFreshness(freshness: DecisionPacketFreshness): DecisionPacketFreshness {
  return {
    ...freshness,
    expiresAt: "<volatile-expires-at>",
    stale: false,
  };
}

function buildCompletionDecisionHumanReviewBundle(input: {
  status: CompletionDecisionPacket["status"];
  sourceCommand: string;
  generatedAt: string;
  decisionCount: number;
  nextAuthority: CompletionNextAuthority;
  completionClaimAllowed: boolean;
  decisions: CompletionDecisionItem[];
}): CompletionDecisionHumanReviewBundle {
  return {
    schemaVersion: "completion-decision-human-review-bundle.v1",
    status: input.status,
    sourceCommand: input.sourceCommand,
    generatedAt: input.generatedAt,
    decisionCount: input.decisionCount,
    nextAuthority: input.nextAuthority,
    completionClaimAllowed: input.completionClaimAllowed,
    items: input.decisions.map((decision, index) => ({
      order: index + 1,
      planId: decision.planId,
      decisionKind: decision.decisionKind,
      blockerReason: decision.blockerReason,
      blockers: decision.blockers,
      requiredActionsJa: decision.requiredActionsJa,
      requiredRecords: decision.requiredRecords.map((record) => record.recordName),
      ownerReviewFields: humanReviewRecordFields(
        decision.requiredRecords,
        HUMAN_REVIEW_OWNER_FIELDS,
      ),
      timingReviewFields: humanReviewRecordFields(
        decision.requiredRecords,
        HUMAN_REVIEW_TIMING_FIELDS,
      ),
      freshnessReviewFields: humanReviewRecordFields(
        decision.requiredRecords,
        HUMAN_REVIEW_FRESHNESS_FIELDS,
      ),
      safetyReviewFields: humanReviewSafetyFields(decision.supportingPacketSummaries),
      scopedPrimaryPacketCommand: decision.scopedDecisionPacketCommand,
      runnableScopedPrimaryPacketCommand: decision.runnableScopedDecisionPacketCommand,
      scopedSupportingPacketCommands: decision.scopedPacketCommands,
      runnableScopedSupportingPacketCommands: decision.runnableScopedPacketCommands,
      reviewRoutesJa: decision.supportingPacketSummaries.map(
        (summary) => summary.reviewRouteJa ?? summary.reviewRoute,
      ),
      reviewRouteIds: decision.supportingPacketSummaries.map((summary) => summary.reviewRoute),
    })),
  };
}

const HUMAN_REVIEW_OWNER_FIELDS = new Set([
  "decision_owner",
  "review_owner",
  "approval_policy_or_named_approver",
  "approved_actor",
]);

const HUMAN_REVIEW_TIMING_FIELDS = new Set([
  "target_version_or_release_trigger",
  "review_trigger",
  "review_by_policy",
  "stale_action",
  "trigger_condition",
  "execution_window_or_freeze_policy",
  "expires_at_or_trigger",
]);

const HUMAN_REVIEW_FRESHNESS_FIELDS = new Set([
  "activation_snapshot_id",
  "cutover_snapshot_id",
  "reviewed_snapshot_binding",
  "source_ledger_freshness",
  "source_status_delta",
  "adoption_decision_delta",
  "workflow_route_impact",
]);

const HUMAN_REVIEW_SAFETY_FIELD_SUFFIXES = [
  "planOnly",
  "mustNotDecide",
  "mustNotApply",
  "decisionCommandAvailable",
  "decisionAllowed",
  "applyAuthorized",
  "mustNotApprove",
  "approvalCommandAvailable",
  "approvalAllowed",
  "activationReadinessSummary.activationAllowed",
  "approvalGate.requiredDecision",
  "approvalGate.requiredActionBinding",
  "approvalGate.approvedActorRequired",
  "approvalGate.approvedToolRequired",
  "approvalGate.approvedTargetRequired",
  "approvalGate.approvedParamsRequired",
  "approvalGate.reviewedSnapshotBindingRequired",
];

function humanReviewRecordFields(
  records: CompletionDecisionRecordRequirement[],
  targetFields: ReadonlySet<string>,
): string[] {
  return records.flatMap((record) =>
    record.fields
      .filter((field) => targetFields.has(field))
      .map((field) => `${record.recordName}.${field}`),
  );
}

function humanReviewSafetyFields(summaries: CompletionDecisionSupportingPacketSummary[]): string[] {
  return summaries.flatMap((summary) =>
    summary.requiredReviewFields
      .filter((field) => HUMAN_REVIEW_SAFETY_FIELD_SUFFIXES.includes(field))
      .map((field) => `${summary.schemaVersion}.${field}`),
  );
}

function isSafetyReviewField(field: string): boolean {
  return (
    field === "planOnly" ||
    field.startsWith("mustNot") ||
    field.endsWith("Allowed") ||
    field.endsWith("Available") ||
    field === "applyAuthorized" ||
    field === "activationAllowed" ||
    field === "decisionAllowed" ||
    field === "approvalAllowed"
  );
}

function sha256Json(value: unknown): string {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

export function runnablePacketCommand(command: string): string {
  return command.startsWith("helix ") ? `bun run ${command}` : command;
}

function scopedPacketCommandsForPlan(
  planId: string,
  commands: WorkflowDecisionPacketCommand[],
): string[] {
  return commands.map((command) => scopedPacketCommandForPlan(planId, command));
}

function scopedPacketCommandForPlan(
  planId: string,
  command: WorkflowDecisionPacketCommand,
): string {
  switch (command) {
    case "helix s4 decision-packet --json":
    case "helix version-up activation-packet --json":
    case "helix action-binding approval-packet --json":
      return `${command} --plan ${planId}`;
    case "helix rename plan --json":
    case "helix rename approval-draft --json":
    case "helix completion decision-packet --json":
      return command;
  }
}

function supportingPacketSummaryForCommand(
  command: WorkflowDecisionPacketCommand,
  planId?: string,
): CompletionDecisionSupportingPacketSummary {
  const scopedCommand = planId ? scopedPacketCommandForPlan(planId, command) : undefined;
  const base = {
    command,
    runnableCommand: runnablePacketCommand(command),
    ...(scopedCommand
      ? { scopedCommand, runnableScopedCommand: runnablePacketCommand(scopedCommand) }
      : {}),
  };
  switch (command) {
    case "helix s4 decision-packet --json":
      return {
        ...base,
        schemaVersion: "s4-decision-packet.v1",
        matrixField: "decisionVerificationCommandMatrix",
        expectedMatrixCount: 8,
        requiredReviewFields: [
          "planOnly",
          "mustNotDecide",
          "decisionCommandAvailable",
          "decisionAllowed",
          "allowedOutcomes",
          "decisionRecord",
          "decisionRecord.allowed_outcome",
          "decisionRecord.decision_owner",
          "decisionRecord.decision_basis",
          "decisionRecord.verified_evidence",
          "decisionRecord.stakeholder_review_or_proxy",
          "decisionRecord.acceptance_gap",
          "decisionRecord.unresolved_risk",
          "decisionRecord.external_source_basis",
          "decisionRecord.route_impact",
          "decisionRecord.forward_route",
          "decisionRecord.reverse_fullback_required",
          "decisionRecord.promotion_strategy_or_rejection_pivot_rationale",
          "decisionRecord.source_ledger_freshness",
          "decisionRecord.source_status_delta",
          "decisionRecord.adoption_decision_delta",
          "decisionRecord.workflow_route_impact",
          "recordTemplates",
          "decisionEvidenceChecklist",
          "decisionEvidenceChecklist.verified_evidence",
          "decisionEvidenceChecklist.stakeholder_review_or_proxy",
          "decisionEvidenceChecklist.acceptance_gap",
          "decisionEvidenceChecklist.unresolved_risk",
          "decisionEvidenceChecklist.external_source_basis",
          "decisionEvidenceChecklist.route_impact",
          "outcomeRouteMatrix",
          "outcomeRouteMatrix.outcome",
          "outcomeRouteMatrix.terminalStatus",
          "outcomeRouteMatrix.routePolicy",
          "outcomeRouteMatrix.requiredEvidence",
          "semanticFeatureFrontierRecord",
          "provenanceRequirements",
          "provenanceRequirements.item",
          "provenanceRequirements.evidence",
          "decisionVerificationCommandMatrix",
          "decisionVerificationCommandMatrix.phase",
          "decisionVerificationCommandMatrix.command",
          "decisionVerificationCommandMatrix.writePolicy",
          "decisionVerificationCommandMatrix.expected",
          "decisionVerificationCommandMatrix.evidence",
          "relatedDecisionPackets",
          "relatedDecisionPackets.scopedCommand",
          "nextWorkflowRoutes",
          "nextWorkflowRoutes.outcome",
          "nextWorkflowRoutes.route",
          "blockedReasons",
        ],
        requiredMatrixFields: [...REQUIRED_DECISION_PACKET_MATRIX_FIELDS],
        reviewRoute: "review S4 decision evidence, outcome routes, and verification commands",
        reviewRouteJa: workflowReviewRouteTextJa(
          "review S4 decision evidence, outcome routes, and verification commands",
        ),
      };
    case "helix version-up activation-packet --json":
      return {
        ...base,
        schemaVersion: "version-up-activation-packet.v1",
        matrixField: "activationVerificationCommandMatrix",
        expectedMatrixCount: 11,
        requiredReviewFields: [
          "planOnly",
          "mustNotApply",
          "semanticFeatureFrontierRecord",
          "activationDecision",
          "activationDecision.allowed_outcome",
          "activationDecision.target_version_or_release_trigger",
          "activationDecision.activation_snapshot_id",
          "activationDecision.activation_route",
          "activationDecision.review_by",
          "activationDecision.approval_scope",
          "activationDecision.dry_run_plan",
          "activationDecision.rollback_plan",
          "activationDecision.source_ledger_freshness",
          "activationDecision.source_status_delta",
          "activationDecision.adoption_decision_delta",
          "activationDecision.workflow_route_impact",
          "parkedReview",
          "parkedReview.review_owner",
          "parkedReview.review_trigger",
          "parkedReview.review_by_policy",
          "parkedReview.stale_action",
          "parkedReview.activation_dependency",
          "parkedReview.decision_packet_route",
          "actionBindingApproval",
          "recordTemplates",
          "activationReadinessSummary",
          "activationReadinessSummary.status",
          "activationReadinessSummary.pendingChecks",
          "activationReadinessSummary.pendingCheckNames",
          "activationReadinessSummary.sourceLedgerFresh",
          "activationReadinessSummary.activationAllowed",
          "activationReadinessChecks",
          "activationReadinessChecks.check",
          "activationReadinessChecks.status",
          "activationReadinessChecks.evidence",
          "activationReadinessChecks.reason",
          "activationSnapshot",
          "activationSnapshot.snapshotId",
          "activationSnapshot.headBound",
          "activationSnapshot.materialBound",
          "activationSnapshot.validationStatus",
          "activationSnapshot.planTextDigest",
          "activationSnapshot.sourceLedgerRowsDigest",
          "activationSnapshot.approvalScopeDigest",
          "activationSnapshot.versionDryRunDigest",
          "activationSnapshot.evidenceDigest",
          "activationSnapshot.invalidatedBy",
          "externalRehearsalPlan",
          "externalRehearsalPlan.check",
          "externalRehearsalPlan.evidence",
          "externalRehearsalPlan.source",
          "costGuardrails",
          "costGuardrails.surface",
          "costGuardrails.freeLimit",
          "costGuardrails.activationImpact",
          "costGuardrails.source",
          "provenanceRequirements",
          "provenanceRequirements.item",
          "provenanceRequirements.evidence",
          "sourceLedgerFreshness",
          "sourceLedgerFreshness.checkedDate",
          "sourceLedgerFreshness.stale",
          "sourceLedgerFreshness.violation",
          "sourceLedgerFreshness.missingRows",
          "sourceLedgerFreshness.rowsDigest",
          "versionDryRunEvidence",
          "versionDryRunEvidence.command",
          "versionDryRunEvidence.planCommand",
          "versionDryRunEvidence.digest",
          "versionDryRunEvidence.ok",
          "versionDryRunEvidence.semverChange",
          "versionDryRunEvidence.releaseTagRef",
          "versionDryRunEvidence.releaseTagSource",
          "versionDryRunEvidence.releaseTagExists",
          "versionDryRunEvidence.releaseTriggerResolved",
          "versionDryRunEvidence.blockedReasons",
          "securityChecklistPacket.securityChecks",
          "securityChecklistPacket.securityChecks.check",
          "securityChecklistPacket.securityChecks.status",
          "securityChecklistPacket.securityChecks.evidence",
          "securityChecklistPacket.securityChecks.reason",
          "securityChecklistPacket.securityChecks.requiredEvidence",
          "securityChecklistPacket.securityChecks.sourceCheckedAt",
          "securityChecklistPacket.securityChecks.latestOfficialStatus",
          "securityChecklistPacket.securityChecks.sourceStatusDelta",
          "securityChecklistPacket.securityChecks.adoptionDecision",
          "securityChecklistPacket.securityChecks.adoptionDecisionDelta",
          "securityChecklistPacket.securityChecks.workflowRouteImpact",
          "reapprovalTriggers",
          "reapprovalTriggers.trigger",
          "reapprovalTriggers.invalidates",
          "reapprovalTriggers.requiredAction",
          "reapprovalTriggers.source",
          "relatedDecisionPackets",
          "nextWorkflowRoutes",
          "blockedReasons",
        ],
        requiredMatrixFields: [...REQUIRED_DECISION_PACKET_MATRIX_FIELDS],
        reviewRoute:
          "review activation readiness, current snapshot id, external rehearsal, cost guardrails, security checklist packet, reapproval triggers, and verification commands",
        reviewRouteJa: workflowReviewRouteTextJa(
          "review activation readiness, current snapshot id, external rehearsal, cost guardrails, security checklist packet, reapproval triggers, and verification commands",
        ),
      };
    case "helix rename plan --json":
      return {
        ...base,
        schemaVersion: "identifier-rename-cutover-plan.v1",
        matrixField: "verificationCommandMatrix",
        expectedMatrixCount: 10,
        requiredReviewFields: [
          "planOnly",
          "mustNotApply",
          "applyAuthorized",
          "semanticFeatureFrontierRecord",
          "recordTemplates",
          "cutoverSnapshot",
          "cutoverSnapshot.snapshotId",
          "cutoverSnapshot.repoHeadSha",
          "cutoverSnapshot.headDigest",
          "cutoverSnapshot.worktreeStatusReadable",
          "cutoverSnapshot.worktreeClean",
          "cutoverSnapshot.worktreeStatusDigest",
          "cutoverSnapshot.worktreeDirtyPathCount",
          "cutoverSnapshot.worktreeDirtyPaths",
          "cutoverSnapshot.blastRadiusDigest",
          "cutoverSnapshot.approvalScopeDigest",
          "cutoverSnapshot.evidenceDigest",
          "cutoverSnapshot.evidenceArtifactsDigest",
          "cutoverSnapshot.evidenceArtifactsRequired",
          "cutoverSnapshot.evidenceArtifactsPresent",
          "cutoverSnapshot.missingEvidenceArtifacts",
          "cutoverSnapshot.evidenceArtifacts",
          "cutoverSnapshot.evidenceArtifacts.path",
          "cutoverSnapshot.evidenceArtifacts.sha256",
          "cutoverSnapshot.sourceLedgerCheckedDate",
          "cutoverSnapshot.sourceLedgerRowsDigest",
          "cutoverSnapshot.invalidatedBy",
          "snapshotReview",
          "snapshotReview.recordedCutoverSnapshotId",
          "snapshotReview.recordedActionBindingSnapshotId",
          "snapshotReview.currentSnapshotId",
          "snapshotReview.cutoverSnapshotMatchesCurrent",
          "snapshotReview.actionBindingSnapshotMatchesCurrent",
          "snapshotReview.driftWarning",
          "snapshotReview.requiredAction",
          "cutoverCategoryChecklist",
          "cutoverCategoryChecklist.category",
          "cutoverCategoryChecklist.samplePaths",
          "cutoverCategoryChecklist.cutoverAction",
          "cutoverCategoryChecklist.verificationCommand",
          "sourceLedgerFreshness",
          "sourceLedgerFreshness.checkedDate",
          "sourceLedgerFreshness.stale",
          "sourceLedgerFreshness.violation",
          "sourceLedgerFreshness.missingRows",
          "sourceLedgerFreshness.rowsDigest",
          "cutoverRunbook",
          "cutoverRunbook.phase",
          "cutoverRunbook.command",
          "cutoverRunbook.writePolicy",
          "cutoverRunbook.evidencePath",
          "cutoverRunbook.passCriteria",
          "cutoverRunbook.rollbackCheck",
          "cutoverRunbook.source",
          "cutoverRunbook.sourceUrl",
          "dryRunPlan",
          "rollbackPlan",
          "monitoringPlan",
          "stateBackupManifest",
          "stateBackupManifest.path",
          "stateBackupManifest.backupTargetPattern",
          "stateBackupManifest.restoreEvidencePath",
          "stateBackupManifest.checksumRequired",
          "stateBackupManifest.restoreDrillRequired",
          "stateBackupManifest.restoreRequired",
          "freezePolicy",
          "freezePolicy.requiresFrozenHead",
          "freezePolicy.requiresQuietWindow",
          "freezePolicy.concurrencyPolicy",
          "freezePolicy.reapprovalTriggers",
          "provenanceRequirements",
          "provenanceRequirements.item",
          "provenanceRequirements.evidence",
          "relatedDecisionPackets",
          "approvalGate",
          "approvalGate.requiredRecords",
          "approvalGate.requiredDecision",
          "approvalGate.requiredActionBinding",
          "approvalGate.approvedActorRequired",
          "approvalGate.approvedToolRequired",
          "approvalGate.approvedTargetRequired",
          "approvalGate.approvedParamsRequired",
          "approvalGate.reviewedSnapshotBindingRequired",
          "blockedReasons",
        ],
        requiredMatrixFields: [...REQUIRED_DECISION_PACKET_MATRIX_FIELDS],
        reviewRoute:
          "review cutover snapshot, snapshot drift review, blast-radius checklist, and verification commands",
        reviewRouteJa: workflowReviewRouteTextJa(
          "review cutover snapshot, snapshot drift review, blast-radius checklist, and verification commands",
        ),
      };
    case "helix rename approval-draft --json":
      return {
        ...base,
        schemaVersion: "identifier-rename-approval-draft.v1",
        matrixField: "none",
        expectedMatrixCount: 0,
        requiredReviewFields: [
          "planOnly",
          "mustNotApply",
          "approvalCommandAvailable",
          "approvalAllowed",
          "applyAuthorized",
          "targetPlanId",
          "targetCli",
          "targetStateDir",
          "recommendedOutcome",
          "readiness",
          "readiness.evidenceComplete",
          "readiness.worktreeClean",
          "readiness.sourceLedgerFresh",
          "readiness.sourceLedgerComplete",
          "readiness.approvalRecordsConcrete",
          "readiness.blockedReasonCount",
          "currentSnapshot",
          "currentSnapshot.cutoverSnapshotId",
          "currentSnapshot.repoHeadSha",
          "currentSnapshot.worktreeClean",
          "currentSnapshot.worktreeDirtyPathCount",
          "currentSnapshot.worktreeDirtyPaths",
          "currentSnapshot.evidenceArtifactsRequired",
          "currentSnapshot.evidenceArtifactsPresent",
          "currentSnapshot.missingEvidenceArtifacts",
          "currentSnapshot.blastRadiusDigest",
          "currentSnapshot.approvalScopeDigest",
          "currentSnapshot.evidenceDigest",
          "currentSnapshot.evidenceArtifactsDigest",
          "currentSnapshot.sourceLedgerCheckedDate",
          "currentSnapshot.sourceLedgerRowsDigest",
          "draftRecords",
          "draftRecords.recordName",
          "draftRecords.pasteReady",
          "draftRecords.unsafeToTreatAsApproval",
          "draftRecords.insertionHintJa",
          "draftRecords.yamlLines",
          "blockedUntil",
          "relatedDecisionPackets",
          "relatedDecisionPackets.scopedCommand",
        ],
        requiredMatrixFields: [],
        reviewRoute:
          "review non-authorizing approval draft records, current snapshot binding, and safety flags before any human approval copy",
        reviewRouteJa: workflowReviewRouteTextJa(
          "review non-authorizing approval draft records, current snapshot binding, and safety flags before any human approval copy",
        ),
      };
    case "helix action-binding approval-packet --json":
      return {
        ...base,
        schemaVersion: "action-binding-approval-packet.v1",
        matrixField: "approvalVerificationCommandMatrix",
        expectedMatrixCount: 11,
        requiredReviewFields: [
          "planOnly",
          "mustNotApprove",
          "approvalCommandAvailable",
          "approvalAllowed",
          "allowedOutcomes",
          "approvalRecord",
          "approvalRecord.allowed_outcome",
          "approvalRecord.approval_policy_or_named_approver",
          "approvalRecord.approval_scope",
          "approvalRecord.approved_actor",
          "approvalRecord.approved_tool",
          "approvalRecord.approved_target",
          "approvalRecord.approved_params",
          "approvalRecord.review_approval_evidence",
          "approvalRecord.reviewed_snapshot_binding",
          "approvalRecord.expires_at_or_trigger",
          "approvalRecord.audit_record",
          "approvalSnapshot",
          "approvalSnapshot.snapshotId",
          "approvalSnapshot.planTextDigest",
          "approvalSnapshot.approvalScopeDigest",
          "approvalSnapshot.reviewEvidenceDigest",
          "approvalSnapshot.auditDigest",
          "approvalSnapshot.siblingDecisionPacketDigest",
          "approvalSnapshot.reviewedSnapshotId",
          "approvalSnapshot.reviewedSnapshotKind",
          "approvalSnapshot.headSha",
          "approvalSnapshot.invalidatedBy",
          "recordTemplates",
          "approvalBindingChecks",
          "approvalBindingChecks.allowed_outcome",
          "approvalBindingChecks.approval_scope",
          "approvalBindingChecks.approved_actor",
          "approvalBindingChecks.approved_tool",
          "approvalBindingChecks.approved_target",
          "approvalBindingChecks.approved_params",
          "approvalBindingChecks.review_approval_evidence",
          "approvalBindingChecks.reviewed_snapshot_binding",
          "approvalBindingChecks.expires_at_or_trigger",
          "approvalBindingChecks.audit_record",
          "approvalBindingChecks.field",
          "approvalBindingChecks.status",
          "approvalBindingChecks.value",
          "approvalBindingChecks.reason",
          "approvalBindingChecks.requiredAction",
          "approvalVerificationCommandMatrix",
          "approvalVerificationCommandMatrix.phase",
          "approvalVerificationCommandMatrix.command",
          "approvalVerificationCommandMatrix.writePolicy",
          "approvalVerificationCommandMatrix.expected",
          "approvalVerificationCommandMatrix.evidence",
          "semanticFeatureFrontierRecords",
          "relatedDecisionPackets",
          "relatedDecisionPackets.scopedCommand",
          "nextWorkflowRoutes",
          "nextWorkflowRoutes.outcome",
          "nextWorkflowRoutes.route",
          "blockedReasons",
        ],
        requiredMatrixFields: [...REQUIRED_DECISION_PACKET_MATRIX_FIELDS],
        reviewRoute:
          "review actor/tool/target/params binding, semantic frontier, related packets, and verification commands",
        reviewRouteJa: workflowReviewRouteTextJa(
          "review actor/tool/target/params binding, semantic frontier, related packets, and verification commands",
        ),
      };
    case "helix completion decision-packet --json":
      return {
        ...base,
        schemaVersion: "completion-decision-packet.v1",
        matrixField: "none",
        expectedMatrixCount: 0,
        requiredReviewFields: ["requiredRecords", "recordTemplates", "packetCommands"],
        requiredMatrixFields: [],
        reviewRoute: "review completion decision records and route to dedicated packets",
        reviewRouteJa: workflowReviewRouteTextJa(
          "review completion decision records and route to dedicated packets",
        ),
      };
  }
}

export function workflowActionTextJa(action: string): string {
  switch (action) {
    case "record the PO/S4 decision before promotion, rejection, or Forward merge":
      return "PO/S4 判断を記録してから昇格・却下・Forward merge へ進める";
    case "keep parked until a future version-up activation decision is recorded; do not count this as active frontier completion":
      return "将来 version-up activation 判断が記録されるまで parked のまま保持し、active frontier 完了として数えない";
    case "record version_target frontmatter before treating version-up parked work as a valid future-version frontier":
      return "version-up parked work を有効な将来版 frontier として扱う前に version_target frontmatter を記録する";
    case "obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work":
      return "不可逆 migration/cutover 前に明示的な PO signoff を取得し、通常作業として state move を実装しない";
    case "record required human/action-binding approval before executing the high-impact action":
      return "高影響 action の実行前に human/action-binding approval を記録する";
    case "start or select the project PLAN and record real project acceptance evidence before claiming whole-program completion":
      return "全体完了を主張する前に project PLAN を開始または選択し、実プロジェクトの acceptance evidence を記録する";
    case "continue the applicable workflow phase or mark terminal only after generated artifacts and review evidence are present":
      return "該当 workflow phase を継続し、生成成果物と review evidence が揃った後だけ terminal にする";
    default:
      return action;
  }
}

export function workflowRouteTextJa(route: string): string {
  switch (route) {
    case "S4 decide -> Reverse/Forward merge only after decision_outcome is recorded":
      return "S4 decide -> decision_outcome 記録後にのみ Reverse / Forward merge へ進む";
    case "version-up activation -> add-feature/rejection path, with approval boundary preserved":
      return "version-up activation -> approval 境界を保持して add-feature / rejection route へ進む";
    case "L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply":
      return "L14 cutover -> apply 前に cutover_decision_record / dry-run / rollback / state backup / audit を揃える";
    case "approval gate -> action-binding approval audit before high-impact action":
      return "approval gate -> 高影響 action 前に action-binding approval audit を通す";
    case "consumer setup -> first project PLAN before completion claim":
      return "consumer setup -> completion claim 前に最初の project PLAN へ進む";
    case "continue current workflow phase until terminal evidence exists":
      return "terminal evidence が揃うまで現在の workflow phase を継続する";
    default:
      return route;
  }
}

export function workflowReviewRouteTextJa(route: string): string {
  switch (route) {
    case "review S4 decision evidence, outcome routes, and verification commands":
      return "S4 decision evidence / outcome route / verification command を確認する";
    case "review activation readiness, current snapshot id, reapproval triggers, and verification commands":
      return "activation readiness / current snapshot id / reapproval trigger / verification command を確認する";
    case "review activation readiness, current snapshot id, external rehearsal, cost guardrails, security checklist packet, reapproval triggers, and verification commands":
      return "activation readiness / current snapshot id / external rehearsal / cost guardrails / security checklist packet / reapproval trigger / verification command を確認する";
    case "review cutover snapshot, snapshot drift review, blast-radius checklist, and verification commands":
      return "cutover snapshot / snapshot drift review / blast-radius checklist / verification command を確認する";
    case "review non-authorizing approval draft records, current snapshot binding, and safety flags before any human approval copy":
      return "非承認の approval draft record / current snapshot binding / safety flag を確認してから人間承認へ進む";
    case "review actor/tool/target/params binding, semantic frontier, related packets, and verification commands":
      return "actor / tool / target / params binding、semantic frontier、related packet、verification command を確認する";
    case "review completion decision records and route to dedicated packets":
      return "completion decision record を確認し、必要な dedicated packet へ接続する";
    default:
      return route;
  }
}

function decisionKindForOutstandingReason(reason: string): CompletionDecisionKind {
  switch (reason) {
    case "po_decision_pending":
      return "po_s4_decision";
    case "version_up_parked":
    case "version_up_frontmatter_missing":
      return "version_up_activation";
    case "irreversible_migration_pending":
      return "irreversible_migration_signoff";
    case "human_approval_pending":
      return "human_action_approval";
    default:
      return "workflow_continuation";
  }
}

function decisionPacketCommandForOutstandingReason(reason: string): WorkflowDecisionPacketCommand {
  switch (reason) {
    case "po_decision_pending":
      return "helix s4 decision-packet --json";
    case "version_up_parked":
    case "version_up_frontmatter_missing":
      return "helix version-up activation-packet --json";
    case "irreversible_migration_pending":
      return "helix rename plan --json";
    case "human_approval_pending":
      return "helix action-binding approval-packet --json";
    default:
      return "helix completion decision-packet --json";
  }
}

function packetCommandsForOutstandingBlockers(
  primaryReason: string,
  blockers: string[],
): WorkflowDecisionPacketCommand[] {
  const commands = uniqueInOrder([
    decisionPacketCommandForOutstandingReason(primaryReason),
    ...blockers.map((blocker) => decisionPacketCommandForOutstandingReason(blocker)),
  ]);
  if (
    primaryReason === "irreversible_migration_pending" ||
    blockers.includes("irreversible_migration_pending")
  ) {
    const renamePlanIndex = commands.indexOf("helix rename plan --json");
    const insertIndex = renamePlanIndex >= 0 ? renamePlanIndex + 1 : commands.length;
    commands.splice(insertIndex, 0, "helix rename approval-draft --json");
  }
  return uniqueInOrder(commands);
}

function allowedOutcomesForOutstandingReason(reason: string): string[] {
  switch (reason) {
    case "po_decision_pending":
      return ["confirmed", "rejected", "pivot"];
    case "version_up_frontmatter_missing":
    case "version_up_parked":
      return ["activate_future_version", "reject_or_archive", "keep_parked_with_review_date"];
    case "irreversible_migration_pending":
      return ["approve_cutover", "reject_or_defer", "request_runbook_changes"];
    case "human_approval_pending":
      return ["approve_action_binding", "deny_action", "request_scope_reduction"];
    case "consumer_setup_boundary":
      return ["start_project_plan", "keep_setup_only", "record_first_run_evidence"];
    default:
      return ["continue_workflow", "mark_terminal_after_required_evidence"];
  }
}

function allowedOutcomesForRecords(
  records: CompletionDecisionRecordRequirement[],
): CompletionDecisionRecordOutcome[] {
  return records.map((record) => ({
    recordName: record.recordName,
    allowedOutcomes: allowedOutcomesForRecordName(record.recordName),
  }));
}

function allowedOutcomesForRecordName(recordName: string): string[] {
  switch (recordName) {
    case "s4_decision_record":
      return ["confirmed", "rejected", "pivot"];
    case "activation_decision_record":
      return ["activate_future_version", "reject_or_archive", "keep_parked_with_review_date"];
    case "parked_review_record":
      return ["review_scheduled", "mark_stale", "route_to_activation_decision"];
    case "external_rehearsal_plan":
      return ["evidence_present", "pending_evidence", "request_scope_reduction"];
    case "cost_guardrails":
      return ["within_guardrails", "pending_limits", "request_scope_reduction"];
    case "activation_provenance_requirements":
      return ["provenance_complete", "pending_evidence", "deny_activation"];
    case "cutover_decision_record":
      return ["approve_cutover", "reject_or_defer", "request_runbook_changes"];
    case "action_binding_approval_record":
      return ["approve_action_binding", "deny_action", "request_scope_reduction"];
    case "consumer_setup_boundary_record":
      return ["start_project_plan", "keep_setup_only", "record_first_run_evidence"];
    case "terminal_evidence_record":
      return ["continue_workflow", "mark_terminal_after_required_evidence"];
    default:
      return ["record_decision", "request_schema_update"];
  }
}

function nextWorkflowRoutesForRecords(
  records: CompletionDecisionRecordRequirement[],
): CompletionDecisionRecordRoute[] {
  return records.map((record) => ({
    recordName: record.recordName,
    nextWorkflowRoute: nextWorkflowRouteForRecordName(record.recordName),
  }));
}

function nextWorkflowRouteForRecordName(recordName: string): string {
  switch (recordName) {
    case "s4_decision_record":
      return "S4 decide -> record decision_outcome, then route to Forward L1/L3-L6, rejected backlog exclusion, or pivot sprint";
    case "activation_decision_record":
      return "version-up activation -> bind activationSnapshot.snapshotId, then activate via add-feature Forward route with concrete PLAN/L2-L7/docs target, reject/archive, or keep parked with review_by";
    case "parked_review_record":
      return "version-up parked review -> schedule review, mark stale, or route to activation_decision_record";
    case "external_rehearsal_plan":
      return "version-up external rehearsal -> record official source basis, no-prod-write, rollback rehearsal, or keep activation pending / reduce scope";
    case "cost_guardrails":
      return "version-up cost guardrails -> confirm provider limits and exceed_action, or keep activation pending / reduce scope";
    case "activation_provenance_requirements":
      return "version-up provenance -> bind source ledger, dry-run, approval, and audit evidence before activation or deny activation";
    case "cutover_decision_record":
      return "L14 cutover decision -> bind cutoverSnapshot.snapshotId, then approve_cutover, reject/defer, or request runbook changes before any irreversible apply";
    case "action_binding_approval_record":
      return "action-binding approval gate -> approve scoped actor/tool/target/params only after reviewed_snapshot_binding cites the sibling snapshot packet, deny action, or reduce scope before execution";
    case "consumer_setup_boundary_record":
      return "consumer setup boundary -> save first-run status/completion/doctor evidence, then start or select the real project PLAN before any completion claim";
    case "terminal_evidence_record":
      return "workflow continuation -> keep current phase open until terminal evidence and green commands exist";
    default:
      return "record-specific workflow route is undefined; update completion decision schema before completion claim";
  }
}

export function recordTemplatesForRecords(
  records: CompletionDecisionRecordRequirement[],
): CompletionDecisionRecordTemplate[] {
  return records.map((record) => ({
    recordName: record.recordName,
    insertionHint: insertionHintForRecordName(record.recordName),
    insertionHintJa: insertionHintJaForRecordName(record.recordName),
    yamlLines: [
      `${record.recordName}:`,
      ...record.fields.map(
        (field) => `  - ${field}: "${placeholderForRecordField(record, field)}"`,
      ),
    ],
    yamlLinesJa: [
      `${record.recordName}:`,
      ...record.fields.map(
        (field) => `  - ${field}: "${placeholderJaForRecordField(record, field)}"`,
      ),
    ],
  }));
}

function insertionHintJaForRecordName(recordName: string): string {
  switch (recordName) {
    case "s4_decision_record":
      return "S4 判断前に PLAN へ追加する。confirmed / rejected / pivot のどれかを選び、route_impact と Forward / Reverse / archive / backlog の進路を記録する。";
    case "activation_decision_record":
      return "version-up activation 前に PLAN へ追加する。activationSnapshot.snapshotId、add-feature Forward 進路、reject/archive 進路、review_by、dry-run、rollback を束縛する。";
    case "parked_review_record":
      return "将来版として parked のまま保持する間に PLAN へ追加する。review_owner、review_trigger、stale_action、completion/status decision packet route を記録する。";
    case "external_rehearsal_plan":
      return "外部 activation 前に PLAN へ追加する。公式 source basis、free-tier budget、webhook signature、access control、secret/PII 無し、本番 write 無し、rollback rehearsal evidence を記録する。";
    case "cost_guardrails":
      return "外部 activation 前に PLAN へ追加する。Pages / Workers / D1 / KV の上限と exceed_action または scope reduction route を記録する。";
    case "activation_provenance_requirements":
      return "外部 activation 前に PLAN へ追加する。source ledger、dry-run evidence、approval evidence、audit record を束縛し、activation を追跡可能にする。";
    case "cutover_decision_record":
      return "L14 cutover の不可逆 apply / migration 前に PLAN へ追加する。cutoverSnapshot.snapshotId、frozen HEAD、quiet window、single-run、再承認 trigger、dry-run、branch/tag rollback、state backup、smoke/doctor/status monitoring を束縛する。";
    case "action_binding_approval_record":
      return "高影響 action 実行前に PLAN へ追加する。actor/tool/target/params を最小権限に限定し、dry-run/risk evidence、reviewed snapshot binding、expiry、approver/action/result/incident audit を記録する。";
    case "consumer_setup_boundary_record":
      return "新規 consumer repository の bootstrap だけで whole-program completion を主張する前に、最初の project PLAN または handover evidence へ追加する。";
    case "terminal_evidence_record":
      return "PLAN を terminal status にする前に追加する。artifact、review_evidence、green_commands が実在することを記録する。";
    default:
      return "blocker 解消を主張する前に、この record block を PLAN へ追加する。";
  }
}

function insertionHintForRecordName(recordName: string): string {
  switch (recordName) {
    case "s4_decision_record":
      return "Add this block to the PLAN S4 decision evidence before setting decision_outcome or terminal status; distinguish confirmed/rejected/pivot, record route_impact, and bind the Forward/Reverse route or archive/backlog path.";
    case "activation_decision_record":
      return "Add this block to the version-up PLAN before activating, rejecting, or keeping parked; bind activationSnapshot.snapshotId, the add-feature Forward route with concrete PLAN/L2-L7/docs target, reject/archive route, review_by policy, dry-run, and rollback.";
    case "parked_review_record":
      return "Add this block to the version-up PLAN while the work remains parked for a future release; include review_owner, review_trigger, stale_action, and completion/status decision packet route.";
    case "external_rehearsal_plan":
      return "Add this block to the version-up PLAN before external activation; cite official source basis, free-tier budget, webhook signature, access control, no-secret/PII, no-production-write, and rollback rehearsal evidence.";
    case "cost_guardrails":
      return "Add this block to the version-up PLAN before external activation; record provider free-tier limits for Pages/Workers/D1/KV and the exceed_action or scope reduction route.";
    case "activation_provenance_requirements":
      return "Add this block to the version-up PLAN before external activation; bind source ledger, dry-run evidence, approval evidence, and audit record so activation is traceable.";
    case "cutover_decision_record":
      return "Add this block to the L14 cutover PLAN before any irreversible apply or migration; bind cutoverSnapshot.snapshotId, frozen HEAD, quiet window, single-run, drift re-approval, dry-run, branch/tag rollback, state backup, and smoke/doctor/status monitoring.";
    case "action_binding_approval_record":
      return "Add this block to the PLAN before executing the high-impact action; approval must be limited to actor/tool/target/params, cite dry-run and risk evidence plus reviewed snapshot binding, set expiry, and capture approver/action/result/incident audit.";
    case "consumer_setup_boundary_record":
      return "Add this record to the first project PLAN or handover evidence before claiming whole-program completion from a newly bootstrapped consumer repository.";
    case "terminal_evidence_record":
      return "Add this block before marking the PLAN terminal after artifacts, review_evidence, and green_commands exist.";
    default:
      return "Add this record block to the PLAN before claiming the blocker is resolved.";
  }
}

function placeholderJaForRecordField(
  record: CompletionDecisionRecordRequirement,
  field: string,
): string {
  if (field === "allowed_outcome") {
    return `<${allowedOutcomesForRecordName(record.recordName).join("|")} のどれか>`;
  }
  if (field === "reverse_fullback_required") return "<true|false と route 根拠>";
  if (field === "activation_snapshot_id") return "<activationSnapshot.snapshotId>";
  if (field === "cutover_snapshot_id") return "<cutoverSnapshot.snapshotId>";
  if (field === "dry_run_plan" || field === "rollback_plan" || field === "state_backup_plan") {
    return `<${field} の evidence path または runbook id>`;
  }
  if (field === "review_by" || field === "expires_at_or_trigger") {
    return "<ISO timestamp、日付、または trigger condition>";
  }
  if (field === "audit_record" || field === "review_approval_evidence") {
    return "<evidence path または audit id>";
  }
  if (field === "reviewed_snapshot_binding") {
    return "<activationSnapshot.snapshotId|cutoverSnapshot.snapshotId|snapshot 不要の根拠>";
  }
  if (field === "source_ledger_freshness") {
    return "<fresh|stale と checked date / ledger label>";
  }
  if (field === "source_status_delta" || field === "adoption_decision_delta") {
    return "<none|changed と公式 source evidence>";
  }
  if (field === "workflow_route_impact") {
    return "<none または S4/version-up/cutover/action-binding backfill route>";
  }
  if (field === "official_source_basis" || field === "source_ledger") {
    return "<公式 source 名、checked date、URL>";
  }
  if (field.endsWith("_check")) {
    return "<pass|fail と evidence path>";
  }
  if (field.endsWith("_limit")) {
    return "<provider limit、使用量、超過時 action>";
  }
  return `<${field} の具体値>`;
}

function placeholderForRecordField(
  record: CompletionDecisionRecordRequirement,
  field: string,
): string {
  if (field === "allowed_outcome") {
    return `<${allowedOutcomesForRecordName(record.recordName).join("|")}>`;
  }
  if (field === "reverse_fullback_required") return "<true|false plus route basis>";
  if (field === "activation_snapshot_id") return "<activationSnapshot.snapshotId>";
  if (field === "cutover_snapshot_id") return "<cutoverSnapshot.snapshotId>";
  if (field === "dry_run_plan" || field === "rollback_plan" || field === "state_backup_plan") {
    return `<${field} evidence path or runbook id>`;
  }
  if (field === "review_by" || field === "expires_at_or_trigger") {
    return "<ISO timestamp, date, or trigger condition>";
  }
  if (field === "audit_record" || field === "review_approval_evidence") {
    return "<evidence path or audit id>";
  }
  if (field === "reviewed_snapshot_binding") {
    return "<activationSnapshot.snapshotId|cutoverSnapshot.snapshotId|no-snapshot basis>";
  }
  if (field === "source_ledger_freshness") {
    return "<fresh|stale plus checked date and ledger label>";
  }
  if (field === "source_status_delta" || field === "adoption_decision_delta") {
    return "<none|changed plus official source evidence>";
  }
  if (field === "workflow_route_impact") {
    return "<none|route to S4/version-up/cutover/action-binding backfill>";
  }
  if (field === "official_source_basis" || field === "source_ledger") {
    return `<${field} URL or source ledger reference>`;
  }
  if (field.endsWith("_check") || field === "rollback_rehearsal") {
    return `<${field} evidence path or rehearsal result>`;
  }
  if (field.endsWith("_limit")) {
    return `<${field} provider limit and measured usage>`;
  }
  if (field === "exceed_action") {
    return "<deny activation|request scope reduction|new approval route>";
  }
  if (field === "dry_run_evidence" || field === "approval_evidence") {
    return `<${field} evidence path or audit id>`;
  }
  return `<${field}>`;
}

export function requiredRecordsForBlockers(
  blockers: string[],
): CompletionDecisionRecordRequirement[] {
  const records = [...blockers]
    .sort((a, b) => outstandingReasonRank(a) - outstandingReasonRank(b) || a.localeCompare(b))
    .flatMap((blocker) => requiredRecordsForOutstandingReason(blocker));
  const seen = new Set<string>();
  return records.filter((record) => {
    if (seen.has(record.recordName)) return false;
    seen.add(record.recordName);
    return true;
  });
}

function outstandingReasonRank(reason: string): number {
  const priority = [
    "irreversible_migration_pending",
    "version_up_frontmatter_missing",
    "version_up_parked",
    "po_decision_pending",
    "human_approval_pending",
    "active_draft",
  ];
  const rank = priority.indexOf(reason);
  return rank === -1 ? Number.MAX_SAFE_INTEGER : rank;
}

function requiredRecordsForOutstandingReason(
  reason: string,
): CompletionDecisionRecordRequirement[] {
  switch (reason) {
    case "po_decision_pending":
      return [
        {
          recordName: "s4_decision_record",
          fields: [
            "allowed_outcome",
            "decision_owner",
            "decision_basis",
            "verified_evidence",
            "stakeholder_review_or_proxy",
            "acceptance_gap",
            "unresolved_risk",
            "external_source_basis",
            ...SOURCE_LEDGER_MEANING_REVIEW_FIELDS,
            "route_impact",
            "forward_route",
            "reverse_fullback_required",
            "promotion_strategy_or_rejection_pivot_rationale",
          ],
          sourcePaths: ["docs/process/modes/discovery.md", "docs/process/modes/scrum.md"],
          sourceLedgerChecks: [
            {
              sourcePath: "docs/process/modes/discovery.md",
              ledgerLabel: "S4 decision source ledger",
            },
            {
              sourcePath: "docs/process/modes/scrum.md",
              ledgerLabel: "S4 decision source ledger",
            },
          ],
        },
      ];
    case "version_up_frontmatter_missing":
    case "version_up_parked":
      return [
        {
          recordName: "activation_decision_record",
          fields: [
            "allowed_outcome",
            "target_version_or_release_trigger",
            "activation_snapshot_id",
            "activation_route",
            "review_by",
            "approval_scope",
            "dry_run_plan",
            "rollback_plan",
            ...SOURCE_LEDGER_MEANING_REVIEW_FIELDS,
          ],
          sourcePaths: ["docs/process/modes/version-up.md"],
          sourceLedgerChecks: [
            {
              sourcePath: "docs/process/modes/version-up.md",
              ledgerLabel: "Version-up source ledger",
            },
          ],
        },
        {
          recordName: "parked_review_record",
          fields: [
            "review_owner",
            "review_trigger",
            "review_by_policy",
            "stale_action",
            "activation_dependency",
            "decision_packet_route",
          ],
          sourcePaths: ["docs/process/modes/version-up.md"],
        },
        {
          recordName: "external_rehearsal_plan",
          fields: [...EXTERNAL_REHEARSAL_RECORD_FIELDS],
          sourcePaths: ["docs/process/modes/version-up.md"],
        },
        {
          recordName: "cost_guardrails",
          fields: [...COST_GUARDRAIL_RECORD_FIELDS],
          sourcePaths: ["docs/process/modes/version-up.md"],
        },
        {
          recordName: "activation_provenance_requirements",
          fields: [...ACTIVATION_PROVENANCE_RECORD_FIELDS],
          sourcePaths: ["docs/process/modes/version-up.md"],
        },
      ];
    case "irreversible_migration_pending":
      return [
        {
          recordName: "cutover_decision_record",
          fields: [
            "allowed_outcome",
            "decision_owner",
            "cutover_snapshot_id",
            "trigger_condition",
            "blast_radius_baseline",
            "dry_run_plan",
            "rollback_plan",
            "state_backup_plan",
            "execution_window_or_freeze_policy",
            "approval_scope",
            "audit_record",
            "post_cutover_monitoring",
            "legacy_alias_policy",
            ...SOURCE_LEDGER_MEANING_REVIEW_FIELDS,
          ],
          sourcePaths: ["docs/process/forward/L08-L14-verification-phase.md"],
          sourceLedgerChecks: [
            {
              sourcePath: "docs/process/forward/L08-L14-verification-phase.md",
              ledgerLabel: "Cutover source ledger",
            },
          ],
        },
      ];
    case "human_approval_pending":
      return [
        {
          recordName: "action_binding_approval_record",
          fields: [
            "allowed_outcome",
            "approval_policy_or_named_approver",
            "approval_scope",
            "approved_actor",
            "approved_tool",
            "approved_target",
            "approved_params",
            "review_approval_evidence",
            "reviewed_snapshot_binding",
            "expires_at_or_trigger",
            "audit_record",
          ],
          sourcePaths: ["docs/process/forward/L08-L14-verification-phase.md"],
        },
      ];
    case "consumer_setup_boundary":
      return [
        {
          recordName: "consumer_setup_boundary_record",
          fields: [
            "allowed_outcome",
            "project_setup_state",
            "objective_boundary_scope",
            "completion_claim_allowed",
            "first_run_completion_packet",
            "first_project_plan_or_handover_route",
            "acceptance_evidence_plan",
          ],
          sourcePaths: [
            ".helix/state/project-setup.json",
            "docs/design/harness/L6-function-design/setup-solo-team.md",
            "docs/design/harness/L6-function-design/function-spec.md",
          ],
        },
      ];
    default:
      return [
        {
          recordName: "terminal_evidence_record",
          fields: ["generated_artifacts", "review_evidence", "green_commands"],
          sourcePaths: ["docs/process/modes/README.md"],
        },
      ];
  }
}

function nextWorkflowRouteForOutstandingReason(reason: string): string {
  switch (reason) {
    case "po_decision_pending":
      return "S4 decide -> Reverse/Forward merge only after decision_outcome is recorded";
    case "version_up_frontmatter_missing":
    case "version_up_parked":
      return "version-up activation -> add-feature/rejection path, with approval boundary preserved";
    case "irreversible_migration_pending":
      return "L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply";
    case "human_approval_pending":
      return "approval gate -> action-binding approval audit before high-impact action";
    case "consumer_setup_boundary":
      return "consumer setup -> first project PLAN before completion claim";
    default:
      return "continue current workflow phase until terminal evidence exists";
  }
}
