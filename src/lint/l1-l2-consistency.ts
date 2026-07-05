/**
 * l1-l2-consistency gate — 「L1 画面要求 ⇔ L2 画面設計の双方向被覆」を fail-close で機械判定する。
 *
 * 背景 (なぜ要るか): PLAN-DISCOVERY-11 (S4 confirmed) の L1⟷L2 要求洗い出しサイクルは、収束条件を
 * 「L1↔L2 の被覆一致・宙に浮いた要求ゼロ・L2⟷L10 mock ペア存在」の機械 green + 人サインオフと定義した
 * (A-40 back-propagation の精緻化)。本 lint はその機械判定部の ID レベル構造被覆を実装する。
 * 観点表 8 項目の prose 内容充足は人 + gap-check の領域であり、本 lint の対象外。
 *
 * ルール:
 * - L1 `screen-requirements.md` の画面 ID と L2 `screen-list.md` の画面 ID は双方向一致する
 *   (L1→L2 欠落 = mock 未整備、L2→L1 欠落 = dangling mock)。
 * - screen-list の全画面は `ui-element.md` の固有コンポーネント行を持つ。
 * - `ui-element.md` / `wireframe.md` / `screen-flow.md` が参照する画面 ID は screen-list に実在する。
 *   wireframe は G2 PASS 済み設計が意図的に主要画面のみ Low-Fi のため、per-screen セクションを
 *   必須にしない (必須化は IMP-039 系設計への false-positive)。
 * - `wireframe.md` frontmatter の `pair_artifact` は必須。**`self` は充足扱い** (IMP-039 self-pair)。
 *
 * screen-impl-pair-freeze.ts (段階順序検査) とは別ロジック (双方向被覆検査)。共有は
 * 純関数 (analyzeL1L2Consistency) + I/O loader (loadL1L2ConsistencyInput) の lint 共通様式のみ
 * (architecture §3.2)。
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface L1L2ConsistencyInput {
  /** L2 screen 設計 (screen-list.md) が存在したか (不在 = scope 0、OK)。 */
  screenDesignPresent: boolean;
  /** L1 screen-requirements §1 一覧で定義された画面 ID。 */
  l1ScreenIds: string[];
  /** L2 screen-list に登録された画面 ID。 */
  screenListIds: string[];
  /** ui-element の固有コンポーネント行を持つ画面 ID。 */
  uiElementIds: string[];
  /** wireframe の画面セクション見出しに現れる画面 ID (主要画面のみで可)。 */
  wireframeIds: string[];
  /** screen-flow が参照する画面 ID。 */
  flowReferencedIds: string[];
  /** wireframe frontmatter の pair_artifact (未宣言なら null)。`self` = IMP-039 充足。 */
  mockPairArtifact: string | null;
}

export interface L1L2ConsistencyResult {
  ok: boolean;
  /** 判定対象になった画面数 (L1 ∪ screen-list)。 */
  checked: number;
  /** ASCII violation code 一覧 (例 "missing-l2-screen:PM-06")。 */
  violations: string[];
  /** IMP-039 self-pair (または明示ペア) が宣言済みか。 */
  selfPairSatisfied: boolean;
}

const SCREEN_ID_PATTERN = /\b(?:PM|HM|GD)-\d{2}\b/g;
const L1_SCREEN_REQUIREMENTS_PATH = join(
  "docs",
  "design",
  "harness",
  "L1-requirements",
  "screen-requirements.md",
);
const L2_SCREEN_DIR = join("docs", "design", "harness", "L2-screen");

/** L1↔L2 の ID レベル双方向被覆を判定する。設計不在は scope 0 で OK (greenfield 前段は正常)。 */
export function analyzeL1L2Consistency(input: L1L2ConsistencyInput): L1L2ConsistencyResult {
  const l1 = new Set(input.l1ScreenIds);
  const list = new Set(input.screenListIds);
  const checked = new Set([...l1, ...list]).size;
  const selfPairSatisfied = (input.mockPairArtifact ?? "").trim().length > 0;
  if (!input.screenDesignPresent) {
    return { ok: true, checked: 0, violations: [], selfPairSatisfied };
  }

  const violations: string[] = [];
  for (const id of [...l1].sort()) {
    if (!list.has(id)) violations.push(`missing-l2-screen:${id}`);
  }
  for (const id of [...list].sort()) {
    if (!l1.has(id)) violations.push(`missing-l1-requirement:${id}`);
    if (!input.uiElementIds.includes(id)) violations.push(`missing-ui-element:${id}`);
  }
  for (const id of [...new Set(input.uiElementIds)].sort()) {
    if (!list.has(id)) violations.push(`dangling-ui-element-screen:${id}`);
  }
  for (const id of [...new Set(input.wireframeIds)].sort()) {
    if (!list.has(id)) violations.push(`dangling-wireframe-screen:${id}`);
  }
  for (const id of [...new Set(input.flowReferencedIds)].sort()) {
    if (!list.has(id)) violations.push(`dangling-flow-screen:${id}`);
  }
  if (!selfPairSatisfied) violations.push("missing-mock-pair");

  return { ok: violations.length === 0, checked, violations, selfPairSatisfied };
}

function readTextIfExists(absPath: string): string | null {
  if (!existsSync(absPath)) return null;
  return readFileSync(absPath, "utf8");
}

/** `| **PM-01** | ...` 形式 (一覧/コンポーネント表の行頭 bold ID) から画面 ID を抽出する。 */
function extractBoldRowIds(text: string): string[] {
  const ids = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const match = /^\|\s*\*\*((?:PM|HM|GD)-\d{2})\*\*\s*\|/.exec(line);
    if (match) ids.add(match[1]);
  }
  return [...ids];
}

/** `| PM-01 | ...` 形式 (screen-list の行頭 plain ID) から画面 ID を抽出する。 */
function extractPlainRowIds(text: string): string[] {
  const ids = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const match = /^\|\s*((?:PM|HM|GD)-\d{2})\s*\|/.exec(line);
    if (match) ids.add(match[1]);
  }
  return [...ids];
}

/** 見出し行 (`### PM-06 ...`、複数 ID 併記可) から画面 ID を抽出する。 */
function extractHeadingIds(text: string): string[] {
  const ids = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    if (!/^#{2,5}\s/.test(line)) continue;
    for (const id of line.match(SCREEN_ID_PATTERN) ?? []) ids.add(id);
  }
  return [...ids];
}

/** 本文全体から画面 ID 参照を抽出する (screen-flow の遷移表・注記向け)。 */
function extractAllIds(text: string): string[] {
  return [...new Set(text.match(SCREEN_ID_PATTERN) ?? [])];
}

/** frontmatter の `pair_artifact:` 値を抽出する (行内コメントは除去)。 */
function extractPairArtifact(text: string): string | null {
  const match = /^pair_artifact:\s*([^\n#]+)/m.exec(text);
  const value = match?.[1]?.trim() ?? "";
  return value.length > 0 ? value : null;
}

/** 実 repo の L1/L2 設計 docs から判定入力を読み込む。 */
export function loadL1L2ConsistencyInput(repoRoot: string = process.cwd()): L1L2ConsistencyInput {
  const screenList = readTextIfExists(join(repoRoot, L2_SCREEN_DIR, "screen-list.md"));
  const l1Text = readTextIfExists(join(repoRoot, L1_SCREEN_REQUIREMENTS_PATH)) ?? "";
  const uiElementText = readTextIfExists(join(repoRoot, L2_SCREEN_DIR, "ui-element.md")) ?? "";
  const wireframeText = readTextIfExists(join(repoRoot, L2_SCREEN_DIR, "wireframe.md")) ?? "";
  const flowText = readTextIfExists(join(repoRoot, L2_SCREEN_DIR, "screen-flow.md")) ?? "";
  return {
    screenDesignPresent: screenList !== null,
    l1ScreenIds: extractBoldRowIds(l1Text),
    screenListIds: extractPlainRowIds(screenList ?? ""),
    uiElementIds: extractBoldRowIds(uiElementText),
    wireframeIds: extractHeadingIds(wireframeText),
    flowReferencedIds: extractAllIds(flowText),
    mockPairArtifact: extractPairArtifact(wireframeText),
  };
}

/** doctor 向け表示行を組み立てる (ASCII decision token: OK / violation)。 */
export function l1L2ConsistencyMessages(result: L1L2ConsistencyResult): string[] {
  if (result.ok) {
    return [
      `l1-l2-consistency - OK (screens=${result.checked}, bidirectional coverage green, mock pair=${result.selfPairSatisfied ? "declared" : "n/a"})`,
    ];
  }
  const sample = result.violations.slice(0, 8).join(", ");
  return [
    `l1-l2-consistency - violation ${result.violations.length} 件 (${sample})。L1 画面要求と L2 画面設計の双方向被覆を回復するか、新ラウンド起票 (A-40 change-log) で要求を更新する`,
  ];
}
