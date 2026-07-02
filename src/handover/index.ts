/**
 * handover — session-log PLAN digest → handover 生成。
 *   ① 機械ポインタ `.ut-tdd/handover/CURRENT.json` (今どこ、機械可読 SSoT)
 *   ② チーム記録 `docs/handover/session-handover-<date>.md` (次どう、人間判断 scaffold)
 *
 * 設計 (①): docs/design/harness/L6-function-design/handover-mechanism.md (PLAN-L6-06 add-design)。
 * テスト設計 (③): docs/test-design/harness/L7-unit-test-design.md §1.8 U-HOVER-001〜007。
 * PLAN: PLAN-L7-04-handover-mechanism (add-impl)。
 *
 * 設計判断: 機械が答えられる「今どこ」(CURRENT.json) と 人間が書く「次どう」(markdown ③-⑥) を
 * 型で分離し、AI が Next Action を捏造しない。current-plan 活性化 (Gap B) の writer は循環 import
 * 回避のため session-log.ts に置き、本 module は import 再利用する (PLAN §1.1)。
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { analyzeCompletionDecisionPacket } from "../lint/completion-decision-packet";
import {
  completionDecisionPacketForOutstanding,
  computeOutstandingWork,
  outstandingSummaryLine,
  workflowNextActionsForOutstanding,
} from "../lint/outstanding";
import {
  activePlanStale,
  inferPlanFromCommit,
  nodeDeps,
  resolveActivePlan,
  type SessionLogDeps,
  sanitize,
  setActivePlan,
} from "../runtime/session-log";
import {
  CURRENT_PLAN_REL,
  GENERATED_BY,
  HANDOVER_NEXT_ACTION_MARKER,
  HANDOVER_OUTSTANDING_MARKER,
  MAX_SAME_DAY_ENTRIES,
  MAX_SUMMARY_PLANS,
  PLAN_DIGEST_DIR,
  POINTER_PATH,
} from "./handover-constants";
import type {
  BuildPointerInput,
  CapRender,
  HandoverArgs,
  HandoverDeps,
  HandoverDoc,
  HandoverPointer,
  HandoverRenderOpts,
  HandoverResult,
  HandoverScope,
  HandoverScopeOpts,
  HandoverStatus,
  PlanDigestRef,
  PlanMeta,
} from "./handover-types";

export {
  GENERATED_BY,
  HANDOVER_NEXT_ACTION_MARKER,
  HANDOVER_OUTSTANDING_MARKER,
  MAX_SAME_DAY_ENTRIES,
  MAX_SUMMARY_PLANS,
} from "./handover-constants";
export type {
  BuildPointerInput,
  CapRender,
  HandoverArgs,
  HandoverDeps,
  HandoverDoc,
  HandoverPointer,
  HandoverRenderOpts,
  HandoverResult,
  HandoverScope,
  HandoverScopeOpts,
  HandoverStatus,
  PlanDigestRef,
  PlanMeta,
} from "./handover-types";
// Gap B 活性化 API を handover 表層からも再 export (CLI が import するため)。
export { inferPlanFromCommit, resolveActivePlan, setActivePlan };

export function countHandoverEntries(md: string | null): number {
  if (!md) return 0;
  return (md.match(/^#\s+(?:Session Handover\b|セッション引き継ぎ)/gm) ?? []).length;
}

/** markdown 1 entry の論理内容 (③-⑥ は human placeholder)。 */
export function latestSessionId(deps: HandoverDeps): string | null {
  try {
    const dir = join(deps.repoRoot, ".ut-tdd", "logs", "session");
    let best: { sid: string; ts: string } | null = null;
    for (const name of deps.listDir(dir)) {
      if (!name.endsWith(".jsonl")) continue;
      const text = deps.readText(join(dir, name));
      if (!text) continue;
      const lines = text.split("\n").filter((l) => l.trim());
      const last = lines[lines.length - 1];
      if (!last) continue;
      try {
        // ts は ISO8601 (nodeDeps.now が常に ISO 出力) = 辞書順比較が時系列順と一致。
        const ev = JSON.parse(last) as { ts?: string; session_id?: string };
        if (ev.ts && ev.session_id && (!best || ev.ts > best.ts)) {
          best = { sid: ev.session_id, ts: ev.ts };
        }
      } catch {
        // 壊れ行 skip
      }
    }
    return best?.sid ?? null;
  } catch {
    return null;
  }
}

/**
 * IMP-048: bare plan_id (`PLAN-L7-04`) を slug 付き正本 (`PLAN-L7-04-handover-mechanism`) へ畳む。
 * `a` が `b` の `-` 境界 prefix なら同一 family。bare は inferPlanFromCommit が commit から拾う変種で、
 * 同じ PLAN を `unknown` ゴーストとして二重計上していた (session-2 handover で実証)。
 * 対称 (sameFamilyPlan(a,b) === sameFamilyPlan(b,a))。呼び出し側は引数順を意識しなくてよい。
 */
export function sameFamilyPlan(a: string, b: string): boolean {
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return long.startsWith(`${short}-`);
}

/** family ごとに最長 (= 最も具体的な slug) を正本 id とし digest を union 集約する。 */
export function dedupeDigests(raw: PlanDigestRef[]): PlanDigestRef[] {
  const groups: PlanDigestRef[][] = [];
  for (const d of raw) {
    const g = groups.find((grp) => grp.some((x) => sameFamilyPlan(x.plan_id, d.plan_id)));
    if (g) g.push(d);
    else groups.push([d]);
  }
  // 推移的マージ (I-1): bare 無しで slug 2 種が来ると初回 grouping では別 group になりうる
  // (例 `-a` と `-b` は family 否定)。listDir の順序非依存にするため group 同士を収束まで結合。
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        if (groups[i].some((x) => groups[j].some((y) => sameFamilyPlan(x.plan_id, y.plan_id)))) {
          groups[i].push(...groups[j]);
          groups.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }
  // string はそのまま、failures (object) は固定順フィールド列挙でキー化 (M-1: プロパティ順非依存)。
  const keyOf = (x: unknown): string =>
    typeof x === "string"
      ? x
      : JSON.stringify([(x as { ts?: string }).ts, (x as { summary?: string }).summary]);
  const uniq = <T>(xs: T[]): T[] => {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const x of xs) {
      const k = keyOf(x);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(x);
    }
    return out;
  };
  return groups.map((grp) => {
    const canonical = grp.reduce((a, b) => (b.plan_id.length > a.plan_id.length ? b : a));
    return {
      plan_id: canonical.plan_id,
      sessions: uniq(grp.flatMap((d) => d.sessions ?? [])),
      commits: uniq(grp.flatMap((d) => d.commits ?? [])),
      files_touched: uniq(grp.flatMap((d) => d.files_touched ?? [])),
      failures: uniq(grp.flatMap((d) => d.failures ?? [])),
      updated_at: grp.reduce((a, b) => (b.updated_at > a.updated_at ? b : a)).updated_at,
    };
  });
}

/**
 * U-HOVER-001: current-plan + 直近 digest 群から対象 PLAN・digest を集める。never throws。
 * resolveActivePlan (session-log) を current-plan 解決に再利用 (state→branch→null)。
 * IMP-048: 収集後は常に dedup (bare/slug ゴースト除去)。opts.scopeToActive で active family へ絞る。
 */
export function resolveHandoverScope(
  deps: HandoverDeps,
  opts: HandoverScopeOpts = {},
): HandoverScope {
  let active_plan: string | null = null;
  try {
    // resolveActivePlan は SessionLogDeps を要求するが readText/repoRoot のみ使う経路。
    active_plan = resolveActivePlan(toSessionDeps(deps));
  } catch {
    active_plan = null;
  }
  const raw: PlanDigestRef[] = [];
  try {
    const dir = join(deps.repoRoot, PLAN_DIGEST_DIR);
    for (const name of deps.listDir(dir)) {
      if (!name.endsWith(".digest.json")) continue;
      const text = deps.readText(join(dir, name));
      if (!text) continue;
      try {
        const d = JSON.parse(text) as PlanDigestRef;
        if (d?.plan_id) raw.push(d);
      } catch {
        // 壊れ JSON は skip (fail-open)
      }
    }
  } catch {
    // listDir 失敗等 → digests は空のまま
  }
  let digests = dedupeDigests(raw);
  // IMP-078 gap④: session scope を最優先 (前 session の PLAN 混入を排除)。
  // 当該 session が触れた digest が無ければ全件 fallback (空 handover を避ける)。
  if (opts.scopeToSession) {
    const sid = opts.scopeToSession;
    const scoped = digests.filter((d) => d.sessions?.includes(sid));
    if (scoped.length > 0) digests = scoped;
  }
  if (opts.scopeToActive && active_plan) {
    const ap = active_plan;
    const scoped = digests.filter((d) => sameFamilyPlan(d.plan_id, ap));
    // active family が digest に無い場合は全件にフォールバック (空 handover を避ける)。
    if (scoped.length > 0) digests = scoped;
  }
  return { active_plan, digests };
}

/**
 * U-HOVER-002: 純関数。digest_summary は digests 非空なら active_plan の null/非 null に関わらず集計、
 * 空のときのみ null。digest_summary=null は「digest 不在」を意味し active_plan 未設定とは独立。
 */
export function buildPointer(input: BuildPointerInput): HandoverPointer {
  const { scope, latestDoc, status, now } = input;
  const digest_summary =
    scope.digests.length > 0
      ? {
          commits: scope.digests.reduce((n, d) => n + (d.commits?.length ?? 0), 0),
          files: scope.digests.reduce((n, d) => n + (d.files_touched?.length ?? 0), 0),
          failures: scope.digests.reduce((n, d) => n + (d.failures?.length ?? 0), 0),
        }
      : null;
  return {
    active_plan: scope.active_plan,
    status,
    latest_doc: latestDoc,
    digest_summary,
    updated_at: now,
  };
}

/**
 * PLAN-L7-145 (handover #1): files_touched entry の絶対パスを repo-relative へ変換。
 * entry は "Verb <path>" 形 (例 `Write <abspath>` / `Edit <relpath>`) か bare path。
 * Claude hook は絶対パスを、Codex hook は相対パスを記録するため混在する。RENDER 時に正規化
 * すれば既存の汚染 digest も含めて一掃できる。
 *
 * Windows の casing 差を吸収する: process.cwd() は大文字ドライブ `C:\...` を返すが、ディスク上の
 * 記録は小文字 `c:\...` が支配的 (実測 421 件小文字 vs 36 件大文字)。よって prefix 一致判定は
 * **case-insensitive** にし、出力は元 casing を保持する (sliced original)。repo 外の path
 * (`~/.codex` 等) は無改変、sibling-prefix 誤一致は `${root}/` 境界で防ぐ。fail-open (never throws)。
 */
// repo 外の絶対パスから user-home prefix (drive + ユーザー名セグメント) を `~/` にマスクする。
// (パターン literal は runtime-portability の local-absolute-path lint を自己発火させないよう
//  コメントに素書きしない — LEGACY_RUNTIME_NAME と同方針。)
const HOME_PREFIX_RE = /^([A-Za-z]:)?\/(?:Users|home)\/[^/]+\//i;

export function relativizeTouchedFile(entry: string, repoRoot: string): string {
  try {
    const sp = entry.indexOf(" ");
    const hasVerb = sp > 0 && !/[\\/]/.test(entry.slice(0, sp));
    const verb = hasVerb ? entry.slice(0, sp) : "";
    const rawPath = hasVerb ? entry.slice(sp + 1) : entry;
    const normPath = rawPath.replace(/\\/g, "/");
    const withVerb = (p: string): string => (verb ? `${verb} ${p}` : p);
    // 1. repo 配下の絶対パス → repo-relative (case-insensitive prefix で Windows casing 吸収、元 casing 保持)。
    if (repoRoot) {
      const normRoot = repoRoot.replace(/\\/g, "/").replace(/\/+$/, "");
      if (normRoot && normPath.toLowerCase().startsWith(`${normRoot.toLowerCase()}/`)) {
        const rel = normPath.slice(normRoot.length + 1);
        if (rel) return withVerb(rel);
      }
    }
    // 2. repo 外の絶対パス (Temp / ~/.codex 等) は user-home prefix を ~ にマスク (username 漏洩防止)。
    const masked = normPath.replace(HOME_PREFIX_RE, "~/");
    if (masked !== normPath) return withVerb(masked);
    return entry;
  } catch {
    return entry;
  }
}

/**
 * PLAN-L7-145 (handover #1): doc.deliverables[].files を repo-relative 化 + 重複除去 (in-place)。
 * runHandover が scaffold 後に呼ぶ (個人絶対パス漏洩防止)。scaffoldFromDigests を 3 引数のまま
 * 保つため (max-source-params)、relativize は本 post-step に分離。
 */
export function relativizeDeliverableFiles(doc: HandoverDoc, repoRoot: string): void {
  for (const d of doc.deliverables) {
    d.files = [...new Set(d.files.map((f) => relativizeTouchedFile(f, repoRoot)))];
  }
}

/**
 * U-HOVER-003: 純関数。digest → deliverables / planMeta → plans.summary。
 * ③-⑥ (next_actions/carry/po_decisions/do_not_break) は空配列 = human 記入のため scaffold しない。
 */
export function scaffoldFromDigests(
  digests: PlanDigestRef[],
  planMeta: PlanMeta[],
  date: string,
): HandoverDoc {
  const metaById = new Map(planMeta.map((m) => [m.plan_id, m]));
  return {
    date,
    plans: digests.map((d) => {
      const m = metaById.get(d.plan_id);
      return {
        plan_id: d.plan_id,
        kind: m?.kind ?? "unknown",
        summary: m?.title ?? d.plan_id,
      };
    }),
    deliverables: digests.map((d) => ({
      plan_id: d.plan_id,
      commits: d.commits ?? [],
      files: d.files_touched ?? [],
    })),
    next_actions: [],
    carry: [],
    po_decisions: [],
    do_not_break: [],
  };
}

const TODO = (s: string): string => `<!-- TODO(human): ${s} -->`;

function handoverActionText(action: string): string {
  switch (action) {
    case "record the PO/S4 decision before promotion, rejection, or Forward merge":
      return "PO/S4 判断を記録してから昇格・却下・Forward merge へ進める";
    case "keep parked until a future version-up activation decision is recorded; do not count this as active frontier completion":
      return "将来 version-up activation 判断が記録されるまで parked のまま保持し、active frontier 完了として数えない";
    case "obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work":
      return "不可逆 migration/cutover 前に明示的な PO signoff を取得し、通常作業として state move を実装しない";
    case "record required human/action-binding approval before executing the high-impact action":
      return "高影響 action の実行前に human/action-binding approval を記録する";
    case "continue the applicable workflow phase or mark terminal only after generated artifacts and review evidence are present":
      return "該当 workflow phase を継続し、生成成果物と review evidence が揃った後だけ terminal にする";
    default:
      return action;
  }
}

function handoverRouteText(route: string): string {
  switch (route) {
    case "S4 decide -> Reverse/Forward merge only after decision_outcome is recorded":
      return "S4 decide -> decision_outcome 記録後にのみ Reverse / Forward merge へ進む";
    case "version-up activation -> add-feature/rejection path, with approval boundary preserved":
      return "version-up activation -> approval 境界を保持して add-feature / rejection route へ進む";
    case "L14 cutover -> cutover_decision_record + dry-run/rollback/state backup/audit before apply":
      return "L14 cutover -> apply 前に cutover_decision_record / dry-run / rollback / state backup / audit を揃える";
    case "human/action-binding approval -> bind actor/tool/target/params before execution":
      return "human/action-binding approval -> 実行前に actor / tool / target / params を固定する";
    default:
      return route;
  }
}

function handoverReviewRouteText(route: string): string {
  switch (route) {
    case "review S4 decision evidence, outcome routes, and verification commands":
      return "S4 decision evidence / outcome route / verification command を確認する";
    case "review activation readiness, current snapshot id, reapproval triggers, and verification commands":
      return "activation readiness / current snapshot id / reapproval trigger / verification command を確認する";
    case "review cutover snapshot, snapshot drift review, blast-radius checklist, and verification commands":
      return "cutover snapshot / snapshot drift review / blast-radius checklist / verification command を確認する";
    case "review actor/tool/target/params binding, semantic frontier, related packets, and verification commands":
      return "actor / tool / target / params binding、semantic frontier、related packet、verification command を確認する";
    case "review completion decision records and route to dedicated packets":
      return "completion decision record を確認し、必要な dedicated packet へ接続する";
    default:
      return route;
  }
}

/** render オプション (A-138 ITEM-4: 同日累積の slim 化、cross_agent TL 裏取り済)。 */
export function capWithBreadcrumb<T>(items: readonly T[], max: number, r: CapRender<T>): string[] {
  if (max <= 0 || items.length <= max) return items.flatMap((item) => r.renderItem(item));
  const kept = items.slice(0, max).flatMap((item) => r.renderItem(item));
  kept.push(r.breadcrumb(items.length - max));
  return kept;
}

/**
 * U-HOVER-004: 純関数。§6.8.5 の 6 セクション markdown を render。③-⑥ は TODO placeholder。
 * 自由テキスト (summary / deliverables) に sanitize を再適用 (defense-in-depth、tracked md への流出ゼロ)。
 * slimSummary=true のとき §1/§2 を参照 stub に縮約する (同日累積の肥大抑制、A-138 ITEM-4)。
 */
export function renderHandoverScaffold(doc: HandoverDoc, opts: HandoverRenderOpts = {}): string {
  const cap = opts.maxSummaryPlans ?? MAX_SUMMARY_PLANS;
  const lines: string[] = [];
  lines.push(`# セッション引き継ぎ — ${doc.date}`, "");
  lines.push("## §1 PLAN サマリ", "");
  if (opts.slimSummary) {
    lines.push(
      "- (同日 first entry 参照 — 全 PLAN registry は本ファイル冒頭エントリ §1 に記載、本セッション固有の進捗は §3 へ)",
    );
  } else if (doc.plans.length === 0) {
    lines.push("- (digest なし)");
  } else {
    // PLAN-L7-88: 上限超 (= scope fallback で全 registry 化) は先頭 N + breadcrumb へ畳む。
    lines.push(
      ...capWithBreadcrumb(doc.plans, cap, {
        renderItem: (p) => [
          `- \`${sanitize(p.plan_id)}\` (${sanitize(p.kind)}): ${sanitize(p.summary)}`,
        ],
        breadcrumb: (n) =>
          `- (+ ${n} more PLAN — 全 registry は \`ut-tdd status\` / harness.db を参照)`,
      }),
    );
  }
  lines.push("", "## §2 成果物 (commit / files)", "");
  if (opts.slimSummary) {
    lines.push("- (同日 first entry 参照 — 本セッションの commit/file は §3 次アクションに記載)");
  } else if (doc.deliverables.length === 0) {
    lines.push("- (なし)");
  } else {
    lines.push(
      ...capWithBreadcrumb(doc.deliverables, cap, {
        renderItem: (d) => [
          `- \`${sanitize(d.plan_id)}\``,
          ...d.commits.map((c) => `  - commit: ${sanitize(c)}`),
          ...d.files.map((f) => `  - file: ${sanitize(f)}`),
        ],
        breadcrumb: (n) =>
          `- (+ ${n} more PLAN の成果物 — 全 registry は \`ut-tdd status\` / harness.db を参照)`,
      }),
    );
  }
  lines.push("", "## §3 次アクション", "");
  if (opts.outstanding) {
    const workflowActions = workflowNextActionsForOutstanding(opts.outstanding);
    if (workflowActions.length === 0) {
      lines.push(
        `> ${HANDOVER_NEXT_ACTION_MARKER}: completion-ready（完了判断監査へ進める）`,
        "- completion-ready: 目標全体を完了扱いにする前に completion claim audit を実行する",
        "",
      );
    } else {
      lines.push(
        `> ${HANDOVER_NEXT_ACTION_MARKER}: ${workflowActions.length} 件; 正本=\`workflowNextActionsForOutstanding\``,
        "",
        ...workflowActions.flatMap((a) => [
          `- ${a.order}. \`${sanitize(a.planId)}\` (${sanitize(a.reason)}): 必要作業=${sanitize(handoverActionText(a.requiredAction))}`,
          `  - 判断経路: ${sanitize(handoverRouteText(a.nextWorkflowRoute))}`,
          `  - 主 packet: \`${sanitize(a.decisionPacketCommand)}\``,
          `  - packet一覧: ${a.packetCommands.map((c) => `\`${sanitize(c)}\``).join(", ")}`,
          ...a.supportingPacketSummaries.map(
            (summary) =>
              `  - packet要約: \`${sanitize(summary.command)}\` schema=${sanitize(summary.schemaVersion)} 検証matrix=${sanitize(summary.matrixField)} 件数=${summary.expectedMatrixCount} 確認field=${sanitize(summary.requiredReviewFields.join(","))} matrix必須field=${sanitize(summary.requiredMatrixFields.join(",") || "none")} 確認観点=${sanitize(handoverReviewRouteText(summary.reviewRoute))}`,
          ),
        ]),
        "",
      );
    }
  } else {
    lines.push(TODO("順序付き次手"), "");
  }
  lines.push("## §4 carry (未了・先送り)", "", TODO("carry"), "");
  lines.push("## §5 未了 PO 判断", "");
  if (opts.outstanding) {
    // PLAN-L7-98 (Q1): 機械事実で §5 を seed。前任 prose の転記でなく state から導出した行を常駐させ、
    // terminal な PLAN / implemented な IMP を「待ち」と書く false-state を可視化・上書きする。
    lines.push(
      `> ${HANDOVER_OUTSTANDING_MARKER}: ${sanitize(outstandingSummaryLine(opts.outstanding).replace(/^outstanding:\s*/, ""))}`,
      "> ↑ `ut-tdd status` / CURRENT.json と同一の機械事実。これに反する「待ち/未了」記述は false-state。",
      "> 実在する未了 = 非終端 PLAN + open defer のみ。terminal な PLAN / implemented な IMP を pending に書かない。",
      "",
      TODO("上記機械集計に対する PO 判断の補足 (実在する未了のみ)"),
      "",
    );
  } else {
    lines.push(TODO("escalation"), "");
  }
  lines.push("## §6 壊さない / 再発させない", "", TODO("壊さない注意"), "");
  return lines.join("\n");
}

/**
 * U-HOVER-005: 純関数。updated_at が maxHours を超えたら stale。
 * precondition: ISO8601 (Date.parse 可)。数値差分判定 (辞書順比較でない)。境界 (=maxHours) は stale でない。
 */
export function handoverStale(updated_at: string | null, now: string, maxHours = 24): boolean {
  if (!updated_at) return true;
  const u = Date.parse(updated_at);
  const n = Date.parse(now);
  if (Number.isNaN(u) || Number.isNaN(n)) return true;
  return (n - u) / 3_600_000 > maxHours;
}

/** CURRENT.json を読む (不在/壊れ → null、never throws)。 */
export function readPointer(deps: {
  repoRoot: string;
  readText: (p: string) => string | null;
}): HandoverPointer | null {
  try {
    const raw = deps.readText(join(deps.repoRoot, POINTER_PATH));
    if (!raw) return null;
    return JSON.parse(raw) as HandoverPointer;
  } catch {
    return null;
  }
}

const NON_CLOSED_RESIDUAL_STATUSES = new Set(["gap", "scheduled", "parked", "po decision"]);
const NO_NEXT_ACTION_PATTERNS = [
  /\bno\s+next\s+action\b/i,
  /次に着手する作業はなし/,
  /次.*作業.*なし/,
  /未了.*なし/,
  /残(?:件|り|る)?.*なし/,
];

function normalizeStatus(raw: string): string {
  return raw.replace(/`/g, "").trim().toLowerCase();
}

function residualStatusesFromAudit(md: string | null): string[] {
  if (!md) return [];
  const statuses: string[] = [];
  let inResidualTable = false;
  for (const line of md.split(/\r?\n/)) {
    if (/^##\s+Residual Feature Buckets\b/.test(line)) {
      inResidualTable = true;
      continue;
    }
    if (inResidualTable && /^##\s+/.test(line)) break;
    if (!inResidualTable) continue;
    if (!/^\|\s*R\d+\s*\|/.test(line)) continue;
    const cells = line.split("|").map((cell) => cell.trim());
    const status = normalizeStatus(cells[cells.length - 2] ?? "");
    if (status) statuses.push(status);
  }
  return statuses;
}

function noNextActionLines(md: string): string[] {
  return md
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNo: index + 1 }))
    .filter(({ line }) => line && NO_NEXT_ACTION_PATTERNS.some((pattern) => pattern.test(line)))
    .map(({ line, lineNo }) => `${lineNo}: ${line}`);
}

/**
 * PLAN-L3-04: residual rows が非 closed の間は、handover の広域な
 * "no next action" 完了表現を警告する。CURRENT.json の latest_doc だけを対象にし、
 * 過去 handover の無関係な文言までは拾わない。
 */
export function checkHandoverCompletionWording(deps: HandoverDeps): string[] {
  const pointer = readPointer(deps);
  if (!pointer?.latest_doc) return [];

  const audit = deps.readText(
    join(deps.repoRoot, ".ut-tdd", "audit", "A-133-upstream-vmodel-coverage-audit.md"),
  );
  const nonClosed = residualStatusesFromAudit(audit).filter((status) =>
    NON_CLOSED_RESIDUAL_STATUSES.has(status),
  );
  if (nonClosed.length === 0) return [];

  const md = deps.readText(join(deps.repoRoot, pointer.latest_doc));
  if (!md) return [];
  const lines = noNextActionLines(md);
  if (lines.length === 0) return [];

  const summary = [...new Set(nonClosed)].sort().join(", ");
  return [
    `handover completion wording: residual rows remain non-closed (${summary}) but ${pointer.latest_doc} says no next action (${lines.join("; ")})`,
  ];
}

/**
 * IMP-047: handover-on-completion 規律の機械 surface (fail-open, 純判定)。
 * PLAN 活動 (active_plan + digest あり) があるのに CURRENT.json が未生成/stale/別 plan を指す場合に
 * warning を返す。Stop-hook / plan lint / doctor が共有する。空配列 = 規律 OK。
 * 「PLAN 完了/節目なのに handover 追記なし」を agent 記憶でなく機械が surface する (§6.8.5)。
 */
export function checkHandoverDiscipline(deps: HandoverDeps, maxHours = 24): string[] {
  const warnings: string[] = [];
  const scope = resolveHandoverScope(deps);
  // 活動が無ければ規律対象外 (digest 不在 = まだ何もしていない)。
  if (!scope.active_plan || scope.digests.length === 0) return warnings;
  // IMP-078 gap②: current-plan marker が古い → 解決した active_plan が最新作業を指していない恐れ。
  if (activePlanStale(toSessionDeps(deps), deps.now(), maxHours)) {
    warnings.push(
      `active-plan marker stale: current-plan が ${maxHours}h 以上未更新 (解決値 ${scope.active_plan} が最新作業と乖離の恐れ) → \`ut-tdd plan use <id>\` で更新`,
    );
  }
  const pointer = readPointer(deps);
  if (!pointer) {
    warnings.push(
      `handover 未生成: active plan ${scope.active_plan} の活動があるが CURRENT.json が無い → \`ut-tdd handover\` を実行`,
    );
    return warnings;
  }
  if (handoverStale(pointer.updated_at, deps.now(), maxHours)) {
    warnings.push(
      `handover stale: CURRENT.json が ${maxHours}h 以上未更新 (active=${scope.active_plan}) → \`ut-tdd handover\` で更新`,
    );
  }
  // I-2: pointer.active_plan=null は complete=true + planId 省略時の正常形 (完了済で active 無し)。
  // drift は「別 PLAN を指している」ケースのみ問題なので非 null 時だけ判定する (null は無音で正常)。
  if (pointer.active_plan !== null && !sameFamilyPlan(pointer.active_plan, scope.active_plan)) {
    warnings.push(
      `handover ポインタ drift: CURRENT.json は ${pointer.active_plan} を指すが現 active は ${scope.active_plan} → \`ut-tdd handover\` で同期`,
    );
  }
  return warnings;
}

/**
 * PLAN-L7-98 (Q1): 複数 entry md の「最後の handover entry」内の `## ... <token> ...`
 * セクション本文を返す (純関数)。token 不在は null。
 */
export function latestEntrySection(md: string, token: string): string | null {
  const headers = [...md.matchAll(/^#\s+(?:Session Handover\b|セッション引き継ぎ).*$/gm)];
  const entry = headers.length > 0 ? md.slice(headers[headers.length - 1].index ?? 0) : md;
  const m = entry.match(new RegExp(`^##\\s*[^\\n]*${token}[^\\n]*$`, "m"));
  if (!m || m.index === undefined) return null;
  const rest = entry.slice(m.index + m[0].length);
  const next = rest.search(/^##\s/m);
  return next < 0 ? rest : rest.slice(0, next);
}

/**
 * PLAN-L7-98 (Q1): 最新 handover の §5 未了 PO 判断 が機械集計行 (HANDOVER_OUTSTANDING_MARKER) を
 * 持つかを fail-close 検証する。§5 は handover で唯一機械裏付け不在のセクションで、前任 prose の
 * 転記で「実在しない PO 判断」が累積した根因 ([[feedback_verify_carry_status_against_code]])。
 * machine 行の常駐を強制し、terminal な PLAN を「待ち」と書く false-state が機械事実に矛盾して
 * 残れないようにする。pointer/doc 不在は対象外 (handover-discipline が担う)。I/O 失敗は fail-close。
 */
export function checkHandoverOutstandingAnchor(deps: HandoverDeps): {
  messages: string[];
  ok: boolean;
} {
  const pointer = readPointer(deps);
  if (!pointer?.latest_doc) {
    return { messages: ["handover-outstanding — skipped (handover 未生成)"], ok: true };
  }
  const md = deps.readText(join(deps.repoRoot, pointer.latest_doc));
  if (md == null) {
    return {
      messages: [`handover-outstanding — violation: ${pointer.latest_doc} を読めない`],
      ok: false,
    };
  }
  const section = latestEntrySection(md, "§5");
  if (section == null) {
    return {
      messages: [
        `handover-outstanding — violation: 最新 entry に §5 未了 PO 判断 が無い (${pointer.latest_doc})`,
      ],
      ok: false,
    };
  }
  if (!section.includes(HANDOVER_OUTSTANDING_MARKER)) {
    return {
      messages: [
        `handover-outstanding — violation: 最新 handover §5 に機械集計行 (${HANDOVER_OUTSTANDING_MARKER}) が無い → \`ut-tdd handover\` で再生成し machine 事実で §5 を seed (前任 prose 転記の false-state 防止)`,
      ],
      ok: false,
    };
  }
  return { messages: ["handover-outstanding — OK (§5 が機械集計行で anchor 済)"], ok: true };
}

/**
 * PLAN-L7-94 continuation: 最新 handover の §3 Next Action を `workflowNextActions` 由来の
 * 機械次手で anchor する。CURRENT.json / status JSON に正しい blocker queue があっても、markdown §3 が
 * TODO のままだと再開者が workflow を外すため、latest entry の §3 marker を fail-close で強制する。
 * blocked route では packet 要約も必須にし、S4/version-up/cutover/action-binding の matrix/review
 * 導線が markdown handover で消える旧 entry を通さない。packet 要約は matrix の必須 source-delta
 * field まで含め、判断材料の意味差分が handover prose で落ちないようにする。
 */
export function checkHandoverNextActionAnchor(deps: HandoverDeps): {
  messages: string[];
  ok: boolean;
} {
  const pointer = readPointer(deps);
  if (!pointer?.latest_doc) {
    return { messages: ["handover-next-action — skipped (handover 未生成)"], ok: true };
  }
  const md = deps.readText(join(deps.repoRoot, pointer.latest_doc));
  if (md == null) {
    return {
      messages: [`handover-next-action — violation: ${pointer.latest_doc} を読めない`],
      ok: false,
    };
  }
  const section = latestEntrySection(md, "§3");
  if (section == null) {
    return {
      messages: [
        `handover-next-action — violation: 最新 entry に §3 次アクションが無い (${pointer.latest_doc})`,
      ],
      ok: false,
    };
  }
  if (!section.includes(HANDOVER_NEXT_ACTION_MARKER)) {
    return {
      messages: [
        `handover-next-action — violation: 最新 handover §3 に機械次手 (${HANDOVER_NEXT_ACTION_MARKER}) が無い → \`ut-tdd handover\` で再生成し workflowNextActions 由来の次手を seed`,
      ],
      ok: false,
    };
  }
  if (!section.includes("completion-ready") && !section.includes("packet要約:")) {
    return {
      messages: [
        "handover-next-action — violation: 最新 handover §3 に packet 要約が無い → `ut-tdd handover` で再生成し packet matrix/review 導線を seed",
      ],
      ok: false,
    };
  }
  if (
    !section.includes("completion-ready") &&
    (!section.includes("確認field=") || !section.includes("matrix必須field="))
  ) {
    return {
      messages: [
        "handover-next-action — violation: 最新 handover §3 の packet 要約に確認field/matrix必須field が無い → `ut-tdd handover` で再生成し source-delta review 導線を seed",
      ],
      ok: false,
    };
  }
  return { messages: ["handover-next-action — OK (§3 が機械次手で anchor 済)"], ok: true };
}

/**
 * PLAN-L7-94 continuation: blocked outstanding を持つ CURRENT.json は、同じ resume surface に
 * completionDecisionPacket を必ず保持する。standalone `completion decision-packet` が green でも、
 * handover pointer が古い形なら再開時に PO/S4・version-up・cutover・action-binding の record template を
 * 失うため fail-close する。
 */
export function checkHandoverCompletionDecisionPacket(deps: HandoverDeps): {
  messages: string[];
  ok: boolean;
} {
  const pointer = readPointer(deps);
  if (!pointer) {
    return { messages: ["handover-decision-packet — skipped (handover 未生成)"], ok: true };
  }
  const readiness = pointer.outstanding?.completionReadiness;
  if (!readiness || readiness.ok) {
    return {
      messages: ["handover-decision-packet — OK (blocked outstanding なし)"],
      ok: true,
    };
  }
  if (!pointer.completionDecisionPacket) {
    return {
      messages: [
        "handover-decision-packet — violation: blocked outstanding だが CURRENT.json に completionDecisionPacket が無い → `ut-tdd handover` で再生成",
      ],
      ok: false,
    };
  }

  const outstanding = pointer.outstanding;
  if (!outstanding) {
    return {
      messages: ["handover-decision-packet — violation: blocked readiness だが outstanding が無い"],
      ok: false,
    };
  }
  const pointerPacket = pointer.completionDecisionPacket;
  const packet =
    pointerPacket.sourceCommand === "ut-tdd handover" &&
    pointerPacket.decisions.some((decision) => decision.supportingPacketSummaries === undefined)
      ? completionDecisionPacketForOutstanding(outstanding, {
          generatedAt: pointerPacket.generatedAt,
          now: deps.now(),
          validForMinutes: pointerPacket.freshness.validForMinutes,
          sourceCommand: "ut-tdd handover",
        })
      : pointerPacket;
  const lint = analyzeCompletionDecisionPacket(packet, deps.now(), {
    sourcePathExists: (sourcePath) => deps.readText(join(deps.repoRoot, sourcePath)) !== null,
    sourceText: (sourcePath) => deps.readText(join(deps.repoRoot, sourcePath)),
  });
  const messages = lint.violations.map(
    (v) => `handover-decision-packet — violation: ${v.reason} (${v.detail})`,
  );
  if (packet.sourceCommand !== "ut-tdd handover") {
    messages.push(
      `handover-decision-packet — violation: sourceCommand=${packet.sourceCommand} expected=ut-tdd handover`,
    );
  }
  if (packet.status !== readiness.status || packet.ok !== readiness.ok) {
    messages.push(
      `handover-decision-packet — violation: readiness mismatch (pointer=${readiness.status}/${String(
        readiness.ok,
      )}, packet=${packet.status}/${String(packet.ok)})`,
    );
  }
  const outstandingItemCount = pointer.outstanding?.items.length ?? 0;
  if (
    packet.decisionCount !== outstandingItemCount ||
    packet.decisions.length !== outstandingItemCount
  ) {
    messages.push(
      `handover-decision-packet — violation: decision count mismatch (outstanding=${outstandingItemCount}, decisionCount=${packet.decisionCount}, decisions=${packet.decisions.length})`,
    );
  }
  if (messages.length > 0) {
    return { messages, ok: false };
  }

  return {
    messages: [
      `handover-decision-packet — OK (status=${packet.status}, decisions=${packet.decisionCount}, freshness=${packet.freshness.validForMinutes}m stale=${String(
        packet.freshness.stale,
      )})`,
    ],
    ok: true,
  };
}

/** CURRENT.json を JSON 上書き (単一機械ポインタ、append しない)。 */
export function writePointer(
  pointer: HandoverPointer,
  deps: { repoRoot: string; writeText: (p: string, c: string) => void },
): void {
  deps.writeText(join(deps.repoRoot, POINTER_PATH), `${JSON.stringify(pointer, null, 2)}\n`);
}

/**
 * docs/plans/<plan_id>.md の frontmatter から kind/title を軽量抽出 (無ければ plan_id fallback)。
 * IMP-078 gap⑤: 完全一致が無い bare id (`PLAN-L7-04`) は同 family の slug 付き正本
 * (`PLAN-L7-04-handover-mechanism.md`) を listDir で family 解決し、`(unknown)` ゴーストを防ぐ。
 */
function readPlanMeta(planId: string, deps: HandoverDeps): PlanMeta {
  const plansDir = join(deps.repoRoot, "docs", "plans");
  let raw = deps.readText(join(plansDir, `${planId}.md`));
  if (!raw) {
    const match = deps
      .listDir(plansDir)
      // basename のみ対象 (archive/ 等サブディレクトリ配下の同名 PLAN を誤解決しない、review Important)。
      .filter(
        (n) =>
          n.endsWith(".md") &&
          !n.includes("/") &&
          !n.includes("\\") &&
          sameFamilyPlan(planId, n.replace(/\.md$/, "")),
      )
      .sort((a, b) => b.length - a.length)[0]; // 最も具体的な slug を正本
    if (match) raw = deps.readText(join(plansDir, match));
  }
  if (!raw) return { plan_id: planId, kind: "unknown", title: planId };
  const kind = raw.match(/^kind:\s*(.+)$/m)?.[1]?.trim() ?? "unknown";
  const title = raw.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1]?.trim() ?? planId;
  return { plan_id: planId, kind, title };
}

/**
 * IMP-078 gap①: handover が `ut-tdd handover` 機構を経ず手書き bypass されたかを検知 (fail-open, 純判定)。
 * checkHandoverDiscipline (presence/stale/drift) と責務分離し、bypass のみを surface する。
 * ① CURRENT.json が generated_by 署名を持たない = 手書き pointer / ② latest_doc の entry 数が
 * pointer.doc_entry_count を超える = 機構を経ない手書き追記。pointer 不在は対象外 (discipline が担う)。
 * **検知範囲 (意図的な部分検知)**: entry **数**の増加のみを見る。既存 entry の §3-§6 **内容書換え**は
 * 検知対象外 (md hash 化は durable noise が大きいため不採用)。完全検知でない点は将来拡張の余地。
 */
export function checkHandoverBypass(deps: HandoverDeps): string[] {
  const warnings: string[] = [];
  const pointer = readPointer(deps);
  if (!pointer) return warnings; // 不在は checkHandoverDiscipline の「未生成」が担当
  if (pointer.generated_by !== GENERATED_BY) {
    warnings.push(
      "handover bypass: CURRENT.json が ut-tdd handover 由来でない (手書き) → `ut-tdd handover` で生成し直す",
    );
    return warnings; // 手書き pointer の doc_entry_count は信頼できないので entry 照合は skip
  }
  if (pointer.latest_doc) {
    const md = deps.readText(join(deps.repoRoot, pointer.latest_doc));
    if (md && countHandoverEntries(md) > (pointer.doc_entry_count ?? 0)) {
      warnings.push(
        `handover bypass: ${pointer.latest_doc} が手書き追記されている (entry 数 mismatch) → \`ut-tdd handover\` で再生成`,
      );
    }
  }
  return warnings;
}

/**
 * U-HOVER-014: 同日 markdown の累積上限化 (純関数、PLAN-L7-83)。
 * runHandover が 1 件 append する前提で、append 後に handover entry 数が
 * `maxEntries` を超えないよう既存を `(maxEntries-1)` まで圧縮する。A-138 の「1 ファイル 1
 * registry anchor」を尊重し、**anchor (entry[0]、full §1) + 直近 (maxEntries-2) entry を残し、
 * 中間 entry を 1 行 breadcrumb へ畳む** (剪定分は git 履歴に全保全 = no silent cap)。
 * breadcrumb は handover 見出しに一致しないので `countHandoverEntries`/`doc_entry_count`
 * の bypass 検知契約は不変。圧縮不要 (entry 数 ≤ maxEntries-1 / header 不在) は入力をそのまま返す。
 * **idempotent**: 過去の prune で挿入した breadcrumb は再 prune 前に除去する。さもないと breadcrumb が
 * 保持 anchor (entry[0]) の slice 末尾へ吸収され、同日反復 handover で breadcrumb が線形累積する
 * (cross_agent review 指摘、PLAN-L7-83)。
 */
export function boundSameDayEntries(md: string, maxEntries: number): string {
  // entry 数 (= header 数) が上限内なら圧縮不要 = 入力不変 (breadcrumb 除去もしない)。
  if (countHandoverEntries(md) <= maxEntries - 1) return md;
  // 既存 breadcrumb (+ その直前 separator) を除去してから再 prune (idempotent、累積防止)。
  const stripped = md.replace(/\n+---\n+<!-- ut-tdd handover:[^\n]*-->/g, "");
  const positions: number[] = [];
  const re = /^#\s+(?:Session Handover\b|セッション引き継ぎ)/gm;
  let m: RegExpExecArray | null = re.exec(stripped);
  while (m !== null) {
    positions.push(m.index);
    m = re.exec(stripped);
  }
  const count = positions.length;
  const entries = positions.map((p, i) =>
    stripped
      .slice(p, i + 1 < positions.length ? positions[i + 1] : stripped.length)
      .replace(/\s*$/, ""),
  );
  const keepRecent = Math.max(0, maxEntries - 2);
  const retain = new Set<number>([0]);
  for (let i = count - keepRecent; i < count; i++) if (i > 0) retain.add(i);
  const preamble = positions[0] > 0 ? stripped.slice(0, positions[0]).replace(/\s*$/, "") : "";
  const prunedCount = count - retain.size;
  const parts: string[] = [];
  if (preamble) parts.push(preamble);
  let breadcrumbInserted = false;
  for (let i = 0; i < count; i++) {
    if (retain.has(i)) {
      parts.push(entries[i]);
    } else if (!breadcrumbInserted) {
      parts.push(
        `<!-- ut-tdd handover: ${prunedCount} 件の同日中間エントリを累積抑制のため剪定 (git 履歴に保全) -->`,
      );
      breadcrumbInserted = true;
    }
  }
  return `${parts.join("\n\n---\n\n")}\n`;
}

/**
 * U-HOVER-007: orchestration。scope → scaffold → md 追記/新規 (dry-run は書かない) → CURRENT.json 更新。
 * complete=true → status=completed + active_plan = args.planId ?? scope.active_plan。
 * dry-run 非破壊 (written=[]) / 既存 md は追記 (上書きしない) / CURRENT.json は単一上書き。
 * PLAN-L7-83: append 前に boundSameDayEntries で同日 entry を上限へ圧縮し、書込後に current-plan
 * marker を pointer へ reconcile する (complete→clear / --plan→sync) ので drift は構造的に残らない。
 */
export function runHandover(args: HandoverArgs, deps: HandoverDeps): HandoverResult {
  const scope = resolveHandoverScope(deps, {
    scopeToActive: args.scopeToActive,
    scopeToSession: args.sessionId,
  });
  const planMeta = scope.digests.map((d) => readPlanMeta(d.plan_id, deps));
  const doc = scaffoldFromDigests(scope.digests, planMeta, args.date);
  // PLAN-L7-145: deliverables の絶対パスを repo-relative 化 + home-mask (個人パス漏洩防止)。
  relativizeDeliverableFiles(doc, deps.repoRoot);

  const docRel = join("docs", "handover", `session-handover-${args.date}.md`);
  const docAbs = join(deps.repoRoot, docRel);
  const status: HandoverStatus = args.complete ? "completed" : "in_progress";
  const effectiveScope: HandoverScope = {
    active_plan: args.planId ?? scope.active_plan,
    digests: scope.digests,
  };
  // 追記後の最終 md (dryRun でも would-be 内容で entry 数を算出 = bypass 照合基準)。docAbs read は非破壊。
  // 同日 2 件目以降 (existing 非 null) は §1/§2 を slim 化して累積肥大を抑える (A-138 ITEM-4、header 数不変)。
  // PLAN-L7-83: さらに append 前に entry 数を上限へ圧縮し、同日 doc の無制限肥大を防ぐ。
  const existing = deps.readText(docAbs);
  const bounded = existing != null ? boundSameDayEntries(existing, MAX_SAME_DAY_ENTRIES) : existing;
  // PLAN-L7-98 (Q1): 未了の正の集計を 1 回計算し、§5 seed と CURRENT.json の両方で共有する。
  // §5 を機械事実 (outstanding) で seed することで「前任 prose の転記」由来の false-state を機械が
  // 上書きする (§5 は handover で唯一機械裏付け不在だった = 実在しない PO 判断が残る根因)。
  const outstanding = computeOutstandingWork(deps.repoRoot);
  const now = deps.now();
  const completionDecisionPacket = completionDecisionPacketForOutstanding(outstanding, {
    generatedAt: now,
    now,
    sourceCommand: "ut-tdd handover",
  });
  const content = renderHandoverScaffold(doc, { slimSummary: bounded != null, outstanding });
  const next = bounded ? `${bounded.replace(/\s*$/, "")}\n\n---\n\n${content}\n` : `${content}\n`;
  // IMP-078 gap①: generated_by 署名 + entry 数を刻む (手書き bypass を checkHandoverBypass が検知できる)。
  const pointer: HandoverPointer = {
    ...buildPointer({ scope: effectiveScope, latestDoc: docRel, status, now }),
    generated_by: GENERATED_BY,
    doc_entry_count: countHandoverEntries(next),
    // IMP-139: 未了の正の集計を CURRENT.json へ additive 記録 (session 再開時に「完了主張」を機械照合可能に)。
    outstanding,
    completionDecisionPacket,
  };

  const written: string[] = [];
  if (!args.dryRun) {
    deps.writeText(docAbs, next);
    written.push(docRel);
    writePointer(pointer, deps);
    written.push(POINTER_PATH);
    // PLAN-L7-83: drift 恒久解消。CURRENT.json を書いたら current-plan marker も coherent に保つ。
    // complete → marker clear (完了 = active plan 無し → resolveActivePlan→null → drift 判定対象外)。
    // --plan 明示の in_progress → marker をその plan へ同期 (override 由来の drift を防ぐ)。
    // plain in_progress (--plan 無し) は marker=scope source なので無変更 (無駄書き回避)。
    const sdeps = toSessionDeps(deps);
    if (status === "completed") {
      setActivePlan(null, sdeps);
      written.push(CURRENT_PLAN_REL);
    } else if (args.planId) {
      setActivePlan(args.planId, sdeps);
      written.push(CURRENT_PLAN_REL);
    }
  }
  return { content, pointer, written };
}

/**
 * resolveActivePlan/setActivePlan が要求する SessionLogDeps 形へ橋渡し (readText/writeText/repoRoot のみ使用)。
 * currentBranch は null 固定 — handover scope は current-plan state のみを正本とし、branch fallback は使わない
 * (handover は branch=main の solo/main 直で動くのが主用途で branch から PLAN は読めないため、意図的)。
 */
function toSessionDeps(deps: HandoverDeps): SessionLogDeps {
  return {
    repoRoot: deps.repoRoot,
    now: deps.now,
    appendLine: () => {},
    readText: deps.readText,
    writeText: deps.writeText,
    currentBranch: () => null,
    listDir: deps.listDir,
  };
}

export function nodeHandoverDeps(repoRoot: string): HandoverDeps {
  return {
    repoRoot,
    now: () => new Date().toISOString(),
    readText: (p) => (existsSync(p) ? readFileSync(p, "utf8") : null),
    writeText: (p, c) => {
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, c);
    },
    listDir: (dir) => (existsSync(dir) ? readdirSync(dir) : []),
  };
}

/** CLI `ut-tdd plan use` 用: current-plan を session-log の nodeDeps 経由で書く/clear。 */
export function setActivePlanCli(
  repoRoot: string,
  planId: string | null,
  gitBranch: () => string | null,
): void {
  setActivePlan(planId, nodeDeps(repoRoot, gitBranch));
}
