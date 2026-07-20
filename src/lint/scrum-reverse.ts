/**
 * scrum-reverse lint — PoC (Discovery/Scrum) confirmed と Reverse 合流の整合検証 (IMP-064)。
 *
 * 背景: requirements §1.2「`decision_outcome=confirmed` の poc → reverse kind PLAN を新規起票」/
 * §3.3 scrum_reverse_lint。本 harness 開発で「DISCOVERY-01 を confirmed にし concept §2.5 を
 * inline promote しただけで対応 Reverse を起こさず §1.2 違反」を犯した (IMP-064)。agent 記憶依存では漏れる。
 *
 * 4 検査を行う:
 *  1. pocOrphans  — confirmed poc で promotion_strategy が redesign 以外 (= 成果を Forward/governance へ
 *     Reverse 経由で運ぶ) なのに、それを requires/references する reverse PLAN が無い。
 *     redesign は spike 破棄→Forward 再実装のため Reverse 不要 (concept §10.2、例 DISCOVERY-02)。
 *  2. badReverseRefs — reverse PLAN が指す poc が rejected/pivot (confirmed でない)。§1.2 line 139/809。
 *  3. emptyReverseFullbacks — terminal reverse なのに正本 artifact を generates に持たない = 完遂が空
 *     (PLAN-L7-331、EMPTY_FULLBACK_ENFORCEMENT_DATE 以降起票分から fail-close)。
 *  4. unresolvedSeedMarkers — 対応 reverse が terminal 後も上位正本に残る trace seed (PoC 段階) の変換漏れ。
 *
 * 純関数 (analyze) + I/O loader 分離 (backfill-pairing / fr-registry-audit と同方針)。
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fmValue, isTerminalPlanStatus } from "./shared";
import { loadRequirementsDocRegistry } from "./requirements-doc-registry";

/** promotion_strategy が redesign のとき Reverse 不要 (throwaway 再設計 → Forward 再実装)。 */
export const REVERSE_EXEMPT_PROMOTION = new Set(["redesign"]);

export interface ParsedSrPlan {
  file: string;
  plan_id: string;
  kind: string;
  status: string;
  decision_outcome: string | null;
  promotion_strategy: string | null;
  /** requires + references の path 群 (reverse が poc を指す向きを辿る、§1.2「requires または references」)。 */
  links: string[];
  /** generates の artifact_path 群 (reverse 完遂 = 正本反映 artifact の有無を検査する、PLAN-L7-331)。 */
  generates: string[];
  /** frontmatter created (空 fullback 検査の grandfather 境界判定に使う)。 */
  created: string | null;
}

/**
 * 空 fullback 検査の enforcement 境界。これより前に起票された legacy reverse (25 件、generates =
 * 自 doc のみの旧規約) は grandfather し、以降に起票する reverse から fail-close する
 * (plan lint の KIND_LAYER_ENFORCEMENT_DATE と同型の日付 ratchet)。
 */
export const EMPTY_FULLBACK_ENFORCEMENT_DATE = "2026-07-06";

/** 上位正本に残る trace seed marker (「PoC 段階、confirmed 昇格時に正式追補」注記)。 */
export interface ReverseSeedMarker {
  docPath: string;
  line: number;
  planId: string;
}

export interface ScrumReverseResult {
  /** confirmed poc (promotion_strategy≠redesign) なのに requires/references する reverse が無い。 */
  pocOrphans: { plan_id: string; promotion_strategy: string | null }[];
  /** reverse が指す poc が confirmed でない (rejected/pivot/未確定)。 */
  badReverseRefs: { reverse_id: string; poc_id: string; outcome: string | null }[];
  /** terminal (confirmed/completed) なのに generates が docs/plans/ 内のみ = 正本反映ゼロの reverse。 */
  emptyReverseFullbacks: string[];
  /** 対応 reverse が terminal になった後も上位正本に残る trace seed (`doc:line:planId`)。 */
  unresolvedSeedMarkers: string[];
  ok: boolean;
}

/** dependencies.requires / references の YAML list を抽出 (両方を 1 集合へ)。 */
export function parseLinks(content: string): string[] {
  const links: string[] = [];
  for (const key of ["requires", "references"]) {
    const m = content.match(new RegExp(`^\\s*${key}:\\s*\\n((?:\\s+-\\s+.+\\n?)*)`, "m"));
    if (!m) continue;
    for (const x of m[1].matchAll(/-\s+(.+?)\s*$/gm)) {
      if (x[1] && x[1] !== "[]") links.push(x[1]);
    }
  }
  return links;
}

/** generates block の artifact_path 値を抽出する。 */
export function parseGenerates(content: string): string[] {
  const block = content.match(/^generates:\s*\n((?:\s+.+\n?)*)/m);
  if (!block) return [];
  const paths: string[] = [];
  for (const m of block[1].matchAll(/artifact_path:\s*([^\s#]+)/g)) {
    paths.push(m[1]);
  }
  return paths;
}

export function parseSrPlan(file: string, content: string): ParsedSrPlan {
  return {
    file,
    plan_id: fmValue(content, "plan_id") ?? file.replace(/\.md$/, ""),
    kind: fmValue(content, "kind") ?? "unknown",
    status: fmValue(content, "status") ?? "unknown",
    decision_outcome: fmValue(content, "decision_outcome") ?? null,
    promotion_strategy: fmValue(content, "promotion_strategy") ?? null,
    links: parseLinks(content),
    generates: parseGenerates(content),
    created: fmValue(content, "created") ?? null,
  };
}

/** ある PLAN を指す reverse が存在するか (path 末尾 `/id.md` or 完全一致で固定、別 id の suffix 誤マッチ防止)。 */
function isReferencedByReverse(planId: string, reversePlans: ParsedSrPlan[]): boolean {
  return reversePlans.some((rev) =>
    rev.links.some((l) => l.endsWith(`/${planId}.md`) || l === `${planId}.md` || l === planId),
  );
}

export function analyzeScrumReverse(
  plans: ParsedSrPlan[],
  seedMarkers: ReverseSeedMarker[] = [],
): ScrumReverseResult {
  const active = plans.filter((p) => p.status !== "archived");
  const reverses = active.filter((p) => p.kind === "reverse");
  const byId = new Map(active.map((p) => [p.plan_id, p]));

  // 1. confirmed poc (promotion_strategy≠redesign) で reverse 合流が無い。
  const pocOrphans: { plan_id: string; promotion_strategy: string | null }[] = [];
  for (const p of active) {
    if (p.kind !== "poc" || p.decision_outcome !== "confirmed") continue;
    if (p.promotion_strategy && REVERSE_EXEMPT_PROMOTION.has(p.promotion_strategy)) continue;
    if (isReferencedByReverse(p.plan_id, reverses)) continue;
    pocOrphans.push({ plan_id: p.plan_id, promotion_strategy: p.promotion_strategy });
  }

  // 2. reverse が指す poc が confirmed でない (§1.2 line 139/809)。
  const badReverseRefs: { reverse_id: string; poc_id: string; outcome: string | null }[] = [];
  for (const rev of reverses) {
    for (const l of rev.links) {
      const id = l.replace(/^.*\//, "").replace(/\.md$/, "");
      const target = byId.get(id);
      if (!target || target.kind !== "poc") continue;
      if (target.decision_outcome !== "confirmed") {
        badReverseRefs.push({
          reverse_id: rev.plan_id,
          poc_id: target.plan_id,
          outcome: target.decision_outcome,
        });
      }
    }
  }

  // 3. 空 fullback — terminal reverse なのに正本 (docs/plans/ 外) artifact を 1 つも生成していない。
  //    存在だけ台帳に載って完遂が空、という台帳漏れを fail-close する (PLAN-L7-331)。
  const emptyReverseFullbacks: string[] = [];
  for (const rev of reverses) {
    if (!isTerminalPlanStatus(rev.status)) continue;
    // 日付 ratchet: 境界前に起票された legacy reverse (旧 generates 規約) だけを grandfather。
    // created 欠落を legacy 扱いにすると、新規 reverse が frontmatter 欠落で検査をすり抜けるため
    // 欠落時は enforcement 対象として fail-close する。
    if (rev.created && rev.created < EMPTY_FULLBACK_ENFORCEMENT_DATE) continue;
    const hasCanonicalArtifact = rev.generates.some(
      (p) => !p.replaceAll("\\", "/").startsWith("docs/plans/"),
    );
    if (!hasCanonicalArtifact) emptyReverseFullbacks.push(rev.plan_id);
  }

  // 4. seed 変換漏れ — 上位正本の trace seed (PoC 段階) は、参照 poc を指す reverse が terminal に
  //    なった時点で正式追補へ変換されていなければならない。draft reverse の間は変換作業中で正当。
  const unresolvedSeedMarkers: string[] = [];
  for (const marker of seedMarkers) {
    const terminalReverseExists = reverses.some(
      (rev) =>
        isTerminalPlanStatus(rev.status) &&
        rev.links.some(
          (l) =>
            l.endsWith(`/${marker.planId}.md`) ||
            l === `${marker.planId}.md` ||
            l === marker.planId,
        ),
    );
    if (terminalReverseExists) {
      unresolvedSeedMarkers.push(`${marker.docPath}:${marker.line}:${marker.planId}`);
    }
  }

  return {
    pocOrphans,
    badReverseRefs,
    emptyReverseFullbacks,
    unresolvedSeedMarkers,
    ok:
      pocOrphans.length === 0 &&
      badReverseRefs.length === 0 &&
      emptyReverseFullbacks.length === 0 &&
      unresolvedSeedMarkers.length === 0,
  };
}

/** docs/plans/*.md (archive/template 除く) を読み込む。 */
export function loadSrPlans(repoRoot: string = process.cwd()): ParsedSrPlan[] {
  const plansDir = join(repoRoot, "docs", "plans");
  const plans: ParsedSrPlan[] = [];
  for (const f of readdirSync(plansDir)) {
    if (!f.endsWith(".md")) continue;
    plans.push(parseSrPlan(f, readFileSync(join(plansDir, f), "utf8")));
  }
  return plans;
}

/** 上位正本 2 doc から trace seed marker (「trace seed」+「PoC 段階」行) を抽出する。 */
export function loadReverseSeedMarkers(repoRoot: string = process.cwd()): ReverseSeedMarker[] {
  const canonicalDocs = [
    join("docs", "governance", "helix-harness-concept_v3.1.md"),
    loadRequirementsDocRegistry(repoRoot).compatibility,
  ];
  const markers: ReverseSeedMarker[] = [];
  for (const rel of canonicalDocs) {
    const abs = join(repoRoot, rel);
    if (!existsSync(abs)) continue;
    const lines = readFileSync(abs, "utf8").split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (!line.includes("trace seed") || !line.includes("PoC 段階")) continue;
      const planId = /PLAN-[A-Za-z0-9-]+/.exec(line)?.[0]?.replace(/\.md$/, "") ?? null;
      if (!planId) continue;
      markers.push({ docPath: rel.replaceAll("\\", "/"), line: i + 1, planId });
    }
  }
  return markers;
}

/** doctor / CLI 向けの 1 行サマリ群 (fail-close、ok は呼び出し側で参照)。 */
export function scrumReverseMessages(result: ScrumReverseResult): string[] {
  const msgs: string[] = [];
  if (result.pocOrphans.length > 0) {
    const ids = result.pocOrphans.map((o) => o.plan_id).join(", ");
    msgs.push(
      `scrum-reverse — ⚠ confirmed poc に Reverse 合流が無い ${result.pocOrphans.length} 件 (${ids}): §1.2 = confirmed poc は reverse PLAN を起こす (redesign を除く、IMP-064)`,
    );
  }
  if (result.badReverseRefs.length > 0) {
    const refs = result.badReverseRefs
      .map((b) => `${b.reverse_id}→${b.poc_id}(${b.outcome})`)
      .join(", ");
    msgs.push(
      `scrum-reverse — ⚠ reverse が confirmed でない poc を参照 ${result.badReverseRefs.length} 件 (${refs}): rejected/pivot への接続は不可 (§1.2 line 139)`,
    );
  }
  if (result.emptyReverseFullbacks.length > 0) {
    msgs.push(
      `scrum-reverse — ⚠ 空 fullback ${result.emptyReverseFullbacks.length} 件 (${result.emptyReverseFullbacks.join(", ")}): terminal reverse は正本 (docs/plans/ 外) artifact を generates に持たなければならない (PLAN-L7-331)`,
    );
  }
  if (result.unresolvedSeedMarkers.length > 0) {
    msgs.push(
      `scrum-reverse — ⚠ trace seed 変換漏れ ${result.unresolvedSeedMarkers.length} 件 (${result.unresolvedSeedMarkers.join(", ")}): 対応 reverse が terminal のため、上位正本の PoC 段階 seed を正式追補へ変換する (PLAN-L7-331)`,
    );
  }
  if (msgs.length === 0)
    msgs.push(
      "scrum-reverse — OK (confirmed poc は Reverse 合流済 / reverse 参照は confirmed のみ / fullback 実質・seed 変換済)",
    );
  return msgs;
}
