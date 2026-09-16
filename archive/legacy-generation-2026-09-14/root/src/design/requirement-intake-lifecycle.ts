/**
 * Design Registry — requirement intake の lifecycle fence（HR-FR-DHR-012、PLAN-L7-539）。
 *
 * L3 §2.1 は恒久 / 置換可能 / 撤去の 3 区分を prose で宣言している。prose のままだと
 * 「#257 到達後に旧 adapter を消し忘れた」ことも「恒久要素まで一緒に消した」ことも検知できない。
 * ここでは 3 区分を **exact inventory** として持ち、両方向を機械検査する。
 *
 * - `permanent`: L1 family を registry の requirement grammar として認識する方針
 *   （L1 authority が存続する限り維持。#257 到達後も残っていなければならない）
 * - `replaceable`: Markdown 由来の requirement catalog loader
 *   （#257 が同等の canonical catalog を供給したら置換。撤去そのものは要求しない）
 * - `retire`: `screens` / `screen_trace` reader とその adapter
 *   （#257 到達で撤去。到達後に残存していれば違反）
 *
 * `design-registry-screen-intake.ts` の export のうち inventory へ挙げるのは **台帳 schema に
 * 結合したもの**だけである。`buildScreenIntake` / `ScreenIntakeInputV1` / `ScreenIntakeV1` /
 * `UnmappedRequirementReasonV1` / `UnmappedRequirementV1` / `assertScreenIntakeComplete` は
 * 「intake の意味論」であって台帳の形に依存しない。#257 が canonical IR から同じ形の入力を
 * 供給すれば**そのまま生き残る**ため、撤去対象に含めない（含めると #257 到達時に
 * 「消してはいけないものを消せ」と要求する誤った gate になる）。この線引きは省略ではなく宣言である。
 *
 * `#257 到達` の判定は activation probe（canonical IR module の実在）で行う。プローブ経路を
 * inventory 側に持たせることで、判定条件そのものも宣言として読める。
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type LifecycleDispositionV1 = "permanent" | "replaceable" | "retire";

export interface LifecycleEntryV1 {
  /** 宣言対象の識別子（export 名、または module 内の const 名）。 */
  symbol: string;
  /** 実在確認に使う repo 相対 path。 */
  path: string;
  disposition: LifecycleDispositionV1;
  rationale: string;
}

export type LifecycleViolationReasonV1 =
  /** #257 到達後も撤去対象が残っている（撤去し忘れ）。 */
  | "retire_target_still_present"
  /** #257 未到達なのに撤去対象が消えている（予定外の撤去、または inventory の腐り）。 */
  | "retire_target_missing_early"
  /** 恒久要素が消えている（到達可否によらず違反）。 */
  | "permanent_target_missing";

export interface LifecycleViolationV1 {
  symbol: string;
  reason: LifecycleViolationReasonV1;
}

export interface LifecycleResultV1 {
  ok: boolean;
  canonicalIrActive: boolean;
  violations: LifecycleViolationV1[];
}

export interface LifecycleInputV1 {
  /** 実在が確認できた symbol 集合。 */
  present: Set<string>;
  canonicalIrActive: boolean;
}

/**
 * #257 到達判定に使う probe。canonical IR の intake module が実在したら到達とみなす。
 * 判定条件を inventory と同じ場所に置き、prose の「#257 が来たら」を機械が読める形にする。
 */
export const CANONICAL_IR_ACTIVATION_PROBE = "src/design/canonical-design-ir-intake.ts";

export const REQUIREMENT_INTAKE_LIFECYCLE: {
  readonly activation_probe: string;
  readonly entries: readonly LifecycleEntryV1[];
} = Object.freeze({
  activation_probe: CANONICAL_IR_ACTIVATION_PROBE,
  entries: Object.freeze([
    Object.freeze({
      symbol: "L1_REQUIREMENT_ID_PATTERNS",
      path: "src/design/design-registry.ts",
      disposition: "permanent" as const,
      rationale:
        "L1 family を registry の requirement grammar として認識する方針そのもの（L3 D-1）。L1 authority が存続する限り維持する",
    }),
    Object.freeze({
      symbol: "isRegistryNativeRequirementId",
      path: "src/design/design-registry.ts",
      disposition: "permanent" as const,
      rationale:
        "grammar と採用 bypass を分離する述語。これが消えると grammar 拡張がそのまま catalog gate の迂回になる（PLAN-L7-538 の境界）",
    }),
    Object.freeze({
      symbol: "loadRequirementCatalogSources",
      path: "src/design/requirement-catalog.ts",
      disposition: "replaceable" as const,
      rationale:
        "Markdown 由来の catalog loader。#257 が同等の canonical catalog を供給したら置換する（撤去そのものは要求しない）",
    }),
    Object.freeze({
      symbol: "loadScreenIntakeInputs",
      path: "src/design/design-registry-screen-intake.ts",
      disposition: "retire" as const,
      rationale:
        "screens / screen_trace 台帳の read-only reader。#257 が canonical IR から screen を供給したら撤去する",
    }),
    Object.freeze({
      symbol: "ScreenLedgerRowV1",
      path: "src/design/design-registry-screen-intake.ts",
      disposition: "retire" as const,
      rationale:
        "screens 台帳行の adapter 型。screen_trace 側と同じく台帳 schema への依存であり、#257 到達で不要になる",
    }),
    Object.freeze({
      symbol: "canonicalizeScreenEntityId",
      path: "src/design/design-registry-screen-intake.ts",
      disposition: "retire" as const,
      rationale:
        "台帳 screen_id（PM-01）から SCR- entity id への採番。#257 が canonical な screen id を供給したら写像そのものが不要になる",
    }),
    Object.freeze({
      symbol: "ScreenTraceRowV1",
      path: "src/design/design-registry-screen-intake.ts",
      disposition: "retire" as const,
      rationale:
        "screen_trace 行の adapter 型。台帳 schema への依存そのものであり、#257 到達で不要になる",
    }),
  ]),
});

/** U-DRG-016: inventory と実態の差分を両方向で検査する（pure）。 */
export function analyzeRequirementIntakeLifecycle(input: LifecycleInputV1): LifecycleResultV1 {
  const violations: LifecycleViolationV1[] = [];
  for (const entry of REQUIREMENT_INTAKE_LIFECYCLE.entries) {
    const present = input.present.has(entry.symbol);
    if (entry.disposition === "permanent") {
      // 恒久要素は #257 の到達可否によらず存在しなければならない。
      if (!present) violations.push({ symbol: entry.symbol, reason: "permanent_target_missing" });
      continue;
    }
    if (entry.disposition === "replaceable") {
      // 置換可能は存在も撤去も許す（判定しない）。宣言として残すことに意味がある。
      continue;
    }
    if (input.canonicalIrActive && present) {
      violations.push({ symbol: entry.symbol, reason: "retire_target_still_present" });
      continue;
    }
    if (!input.canonicalIrActive && !present) {
      // 片側だけの検査にしない。まだ消してはいけないものが消えている状態も違反とする。
      violations.push({ symbol: entry.symbol, reason: "retire_target_missing_early" });
    }
  }
  violations.sort((a, b) => a.symbol.localeCompare(b.symbol));
  return { ok: violations.length === 0, canonicalIrActive: input.canonicalIrActive, violations };
}

/**
 * 宣言箇所だけを実在とみなす（pure）。単なる言及—コメント・import・文字列—を実在に数えると、
 * 撤去済みの symbol を「まだある」と誤判定し、撤去し忘れ検査が空振りする。
 */
export function detectPresentSymbols(sourceByPath: ReadonlyMap<string, string>): Set<string> {
  const present = new Set<string>();
  for (const entry of REQUIREMENT_INTAKE_LIFECYCLE.entries) {
    const source = sourceByPath.get(entry.path) ?? "";
    const declared = new RegExp(
      `(?:^|\\n)\\s*(?:export\\s+)?(?:async\\s+)?(?:function\\*?|const|let|interface|type|class|enum)\\s+${entry.symbol}\\b`,
      "u",
    );
    if (declared.test(source)) present.add(entry.symbol);
  }
  return present;
}

/** inventory が指す symbol の実在を実ファイルから確認する（唯一の I/O 境界）。 */
export function loadRequirementIntakeLifecycleInput(
  repoRoot: string = process.cwd(),
): LifecycleInputV1 {
  const sourceByPath = new Map<string, string>();
  for (const entry of REQUIREMENT_INTAKE_LIFECYCLE.entries) {
    if (sourceByPath.has(entry.path)) continue;
    const absolute = join(repoRoot, entry.path);
    sourceByPath.set(entry.path, existsSync(absolute) ? readFileSync(absolute, "utf8") : "");
  }
  return {
    present: detectPresentSymbols(sourceByPath),
    canonicalIrActive: existsSync(join(repoRoot, REQUIREMENT_INTAKE_LIFECYCLE.activation_probe)),
  };
}

export function checkRequirementIntakeLifecycle(
  repoRoot: string = process.cwd(),
): LifecycleResultV1 {
  return analyzeRequirementIntakeLifecycle(loadRequirementIntakeLifecycleInput(repoRoot));
}

export function requirementIntakeLifecycleMessages(result: LifecycleResultV1): string[] {
  if (result.ok) {
    const counts = { permanent: 0, replaceable: 0, retire: 0 };
    for (const entry of REQUIREMENT_INTAKE_LIFECYCLE.entries) counts[entry.disposition] += 1;
    const stage = result.canonicalIrActive ? "#257 到達済み" : "#257 未到達";
    return [
      `requirement-intake-lifecycle — OK (${stage}、撤去対象 ${counts.retire} / 置換可能 ${counts.replaceable} / 恒久 ${counts.permanent} すべて宣言どおり)`,
    ];
  }
  const stillPresent = result.violations.filter((v) => v.reason === "retire_target_still_present");
  const messages: string[] = [];
  if (stillPresent.length > 0) {
    messages.push(
      `requirement-intake-lifecycle - violation: #257 到達済みなのに撤去対象が残存 ${stillPresent.length} 件 (${stillPresent
        .map((v) => v.symbol)
        .join(", ")}): screens / screen_trace adapter を撤去せよ`,
    );
  }
  for (const reason of ["permanent_target_missing", "retire_target_missing_early"] as const) {
    const hit = result.violations.filter((v) => v.reason === reason);
    if (hit.length === 0) continue;
    const label =
      reason === "permanent_target_missing"
        ? "恒久要素が欠落"
        : "#257 未到達なのに撤去対象が欠落（予定外の撤去または inventory の腐り）";
    messages.push(
      `requirement-intake-lifecycle - violation: ${label} ${hit.length} 件 (${hit
        .map((v) => v.symbol)
        .join(", ")})`,
    );
  }
  return messages;
}
