/**
 * outstanding-work surface — 「未了の正の集計シグナル」を status / handover が additive に出すための
 * 純関数 + loader (IMP-139)。
 *
 * 動機 (PO 指摘 2026-06-19 self-audit): `ut-tdd status` (mode + next のみ) も handover digest
 * (commits/files/failures のみ) も CURRENT.json も「層内の非終端 (draft 等) PLAN 数 / open な
 * explicit-defer 数」を出さない。結果「doctor green = 完了」と誤読され得る (PLAN 完了 ≠ 層完了)。
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
 * module-boundary 違反ゆえ、消費側 cli / handover が lint を import する形にする)。
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { analyzePlaceholderDeps, loadPlaceholderDepsDocs } from "./placeholder-deps";
import { fmValue } from "./shared";

/** 終端 (= 完了とみなす) status。これ以外 (archived を除く) が非終端 = 未了。 */
const TERMINAL_STATUSES: ReadonlySet<string> = new Set(["confirmed", "completed", "accepted"]);

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
  /** 複数 blocker を持つ PLAN で、補助 blocker の action-binding 要求を落とさないための全アクション。 */
  requiredActions: string[];
  /** requiredAction を満たしたと機械照合するために残すべき証跡。 */
  requiredEvidence: string[];
}

export interface CompletionReadiness {
  ok: boolean;
  status: "ready" | "blocked";
  reason: string;
  blockers: string[];
  requiredActions: string[];
}

export type CompletionDecisionKind =
  | "po_s4_decision"
  | "version_up_activation"
  | "irreversible_migration_signoff"
  | "human_action_approval"
  | "workflow_continuation";

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
  requiredActions: string[];
  requiredEvidence: string[];
  allowedOutcomes: string[];
  nextWorkflowRoute: string;
}

export interface CompletionDecisionPacket {
  ok: boolean;
  status: "ready" | "blocked";
  generatedFrom: "outstanding.completionReadiness";
  generatedAt: string;
  sourceCommand: string;
  freshness: DecisionPacketFreshness;
  decisionCount: number;
  blockers: string[];
  decisions: CompletionDecisionItem[];
}

export interface DecisionPacketFreshness {
  validForMinutes: number;
  expiresAt: string;
  stale: boolean;
  policy: "decision-packet-freshness.v1";
}

export interface CompletionDecisionPacketOptions {
  generatedAt?: string;
  now?: string;
  validForMinutes?: number;
  sourceCommand?: string;
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
    if (s === "archived" || TERMINAL_STATUSES.has(s)) continue;
    const layer = p.layer.trim() || "unknown";
    byLayer[layer] = (byLayer[layer] ?? 0) + 1;
    // version-up parked = draft + version_target (landed には schema が付与を禁ずる)。
    if (s === "draft" && (p.versionTarget ?? "").trim().length > 0) versionUpParked++;
    const blockers = classifyOutstandingBlockers(p);
    const reason = primaryOutstandingReason(blockers);
    const action = requiredOutstandingAction(reason);
    const requiredActions = requiredActionsForBlockers(blockers);
    const requiredEvidence = requiredEvidenceForBlockers(blockers);
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
      requiredActions,
      requiredEvidence,
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
  };
  return {
    ...base,
    completionReadiness: completionReadinessForOutstanding(base),
  };
}

function classifyOutstandingBlockers(p: OutstandingPlanRow): string[] {
  const text = [p.planId, p.layer, p.kind, p.status, p.workflowPhase, p.versionTarget, p.text]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
  const blockers = new Set<string>();
  if ((p.versionTarget ?? "").trim()) blockers.add("version_up_parked");
  if (
    p.kind === "poc" &&
    (/\bS[34]\b/i.test(p.workflowPhase ?? "") ||
      /s4 decision|s4 decide|decision_outcome|po\/s4|s4 判断|s4 判定/i.test(text))
  ) {
    blockers.add("po_decision_pending");
  }
  if (/approval|承認|action-binding|human signoff|人間サインオフ|人間承認/i.test(text)) {
    blockers.add("human_approval_pending");
  }
  if (/irreversible|不可逆|state dir|cutover|\.ut-tdd\/.*\.helix|atomic migration/i.test(text)) {
    blockers.add("irreversible_migration_pending");
  }
  if (blockers.size === 0) blockers.add("active_draft");
  return [...blockers].sort();
}

function primaryOutstandingReason(blockers: string[]): string {
  const priority = [
    "irreversible_migration_pending",
    "version_up_parked",
    "po_decision_pending",
    "human_approval_pending",
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
          "trigger_condition and blast_radius_baseline recorded before irreversible migration",
          "dry_run_plan, rollback_plan, state_backup_plan, and audit_record recorded before apply",
          "post_cutover_monitoring and legacy_alias_policy recorded before terminal status",
        ],
      };
    case "version_up_parked":
      return {
        requiredAction:
          "keep parked until a future version-up activation decision is recorded; do not count this as active frontier completion",
        requiredEvidence: [
          "activation_decision_record with allowed_outcome activate_future_version / reject_or_archive / keep_parked_with_review_date",
          "parked_review_record with review_owner, review_trigger, review_by_policy, stale_action, activation_dependency, and decision_packet_route",
          "review_by date/owner recorded when keep_parked_with_review_date is chosen",
          "approval_scope, dry_run_plan, and rollback_plan recorded before external infra/auth/secret activation",
          "required action-binding approval evidence when activation touches infra/auth/secrets",
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
          "promotion_strategy or rejection/pivot rationale recorded before terminal status",
        ],
      };
    case "human_approval_pending":
      return {
        requiredAction:
          "record required human/action-binding approval before executing the high-impact action",
        requiredEvidence: [
          "approval policy or named approver evidence",
          "review/approval evidence recorded before activation",
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

function uniqueInOrder(values: string[]): string[] {
  return [...new Set(values)];
}

/** docs/plans/*.md の layer / status を frontmatter から読む (PLAN registry を介さず最新値)。 */
export function loadOutstandingPlanRows(repoRoot: string): OutstandingPlanRow[] {
  const dir = join(repoRoot, "docs", "plans");
  if (!existsSync(dir)) return [];
  const rows: OutstandingPlanRow[] = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".md")) continue;
    let content = "";
    try {
      content = readFileSync(join(dir, f), "utf8");
    } catch {
      continue;
    }
    rows.push({
      planId: fmValue(content, "plan_id") ?? f.replace(/\.md$/, ""),
      layer: fmValue(content, "layer") ?? "unknown",
      kind: fmValue(content, "kind") ?? "unknown",
      status: fmValue(content, "status") ?? "unknown",
      workflowPhase: fmValue(content, "workflow_phase") ?? null,
      versionTarget: fmValue(content, "version_target") ?? null,
      text: content,
    });
  }
  return rows;
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

export function completionReadinessForOutstanding(o: OutstandingWorkBase): CompletionReadiness {
  const blockers = new Set<string>();
  if (o.nonTerminalPlansTotal > 0) blockers.add("non_terminal_plans");
  if (o.openDefers > 0) blockers.add("open_defers");
  for (const blocker of Object.keys(o.blockersByKind)) blockers.add(blocker);

  const requiredActions = [...new Set(o.items.flatMap((item) => item.requiredActions))].sort();
  if (o.openDefers > 0) {
    requiredActions.push(
      "resolve open placeholder/spec-backfill defers before claiming whole-program completion",
    );
  }

  if (blockers.size === 0) {
    return {
      ok: true,
      status: "ready",
      reason: "no non-terminal PLANs or open defers remain",
      blockers: [],
      requiredActions: [],
    };
  }

  return {
    ok: false,
    status: "blocked",
    reason:
      "whole-program completion is blocked; doctor green is not a substitute for closing outstanding work",
    blockers: [...blockers].sort(),
    requiredActions,
  };
}

export function completionReadinessLine(o: OutstandingWork): string {
  const readiness = o.completionReadiness;
  if (readiness.ok) return "completion: ready (no outstanding work)";
  return `completion: blocked (${readiness.blockers.join(", ")}); required actions=${readiness.requiredActions.length}`;
}

export function workflowNextActionForOutstanding(o: OutstandingWork): string {
  const readiness = o.completionReadiness;
  if (readiness.ok) {
    return "completion-ready: run completion claim audit before marking the whole objective complete";
  }
  const prioritizedReasons = [
    "po_decision_pending",
    "version_up_parked",
    "irreversible_migration_pending",
    "human_approval_pending",
    "active_draft",
  ];
  const prioritizedItem = [...o.items].sort((a, b) => {
    const aRank = prioritizedReasons.indexOf(a.reason);
    const bRank = prioritizedReasons.indexOf(b.reason);
    return (
      (aRank === -1 ? Number.MAX_SAFE_INTEGER : aRank) -
        (bRank === -1 ? Number.MAX_SAFE_INTEGER : bRank) || a.planId.localeCompare(b.planId)
    );
  })[0];
  const action =
    prioritizedItem?.requiredAction ??
    readiness.requiredActions[0] ??
    "resolve outstanding blockers before claiming completion";
  return `completion-blocked: ${action}`;
}

export function completionDecisionPacketForOutstanding(
  outstanding: OutstandingWork,
  opts: CompletionDecisionPacketOptions = {},
): CompletionDecisionPacket {
  const generatedAt = normalizeIsoTimestamp(opts.generatedAt ?? new Date().toISOString());
  const now = normalizeIsoTimestamp(opts.now ?? generatedAt);
  const validForMinutes = opts.validForMinutes ?? 24 * 60;
  const expiresAt = addMinutesIso(generatedAt, validForMinutes);
  return {
    ok: outstanding.completionReadiness.ok,
    status: outstanding.completionReadiness.status,
    generatedFrom: "outstanding.completionReadiness",
    generatedAt,
    sourceCommand: opts.sourceCommand ?? "ut-tdd completion decision-packet --json",
    freshness: {
      validForMinutes,
      expiresAt,
      stale: Date.parse(now) > Date.parse(expiresAt),
      policy: "decision-packet-freshness.v1",
    },
    decisionCount: outstanding.items.length,
    blockers: outstanding.completionReadiness.blockers,
    decisions: outstanding.items.map((item) => ({
      planId: item.planId,
      layer: item.layer,
      kind: item.kind,
      status: item.status,
      workflowPhase: item.workflowPhase,
      blockerReason: item.reason,
      blockers: item.blockers,
      decisionKind: decisionKindForOutstandingReason(item.reason),
      requiredAction: item.requiredAction,
      requiredActions: item.requiredActions,
      requiredEvidence: item.requiredEvidence,
      allowedOutcomes: allowedOutcomesForOutstandingReason(item.reason),
      nextWorkflowRoute: nextWorkflowRouteForOutstandingReason(item.reason),
    })),
  };
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

function decisionKindForOutstandingReason(reason: string): CompletionDecisionKind {
  switch (reason) {
    case "po_decision_pending":
      return "po_s4_decision";
    case "version_up_parked":
      return "version_up_activation";
    case "irreversible_migration_pending":
      return "irreversible_migration_signoff";
    case "human_approval_pending":
      return "human_action_approval";
    default:
      return "workflow_continuation";
  }
}

function allowedOutcomesForOutstandingReason(reason: string): string[] {
  switch (reason) {
    case "po_decision_pending":
      return ["confirmed", "rejected", "pivot"];
    case "version_up_parked":
      return ["activate_future_version", "reject_or_archive", "keep_parked_with_review_date"];
    case "irreversible_migration_pending":
      return ["approve_cutover", "reject_or_defer", "request_runbook_changes"];
    case "human_approval_pending":
      return ["approve_action_binding", "deny_action", "request_scope_reduction"];
    default:
      return ["continue_workflow", "mark_terminal_after_required_evidence"];
  }
}

function nextWorkflowRouteForOutstandingReason(reason: string): string {
  switch (reason) {
    case "po_decision_pending":
      return "S4 decide -> Reverse/Forward merge only after decision_outcome is recorded";
    case "version_up_parked":
      return "version-up activation -> add-feature/rejection path, with approval boundary preserved";
    case "irreversible_migration_pending":
      return "L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply";
    case "human_approval_pending":
      return "approval gate -> action-binding approval audit before high-impact action";
    default:
      return "continue current workflow phase until terminal evidence exists";
  }
}
