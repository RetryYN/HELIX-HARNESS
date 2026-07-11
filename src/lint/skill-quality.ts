import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * skill-quality (PLAN-L7-420)。
 *
 * `skill-assignment` (frontmatter enum) が見ない skill pack の実質を fail-close で検査する:
 * 重複名 / 近似重複本文 / SKILL_MAP trigger table との同期 / 実質下限 (stub 検出) /
 * 未記入 scaffold marker。PLAN-L7-70 が手作業で一掃した generic stub と重複 pack の
 * 再流入を、取込側で機械的に塞ぐ。閾値の根拠は PLAN-L7-420 §1 の実測
 * (近似重複 shingle 共有率: 現行最大 0.107 に対し 0.35、実質下限: 現行最小 2098 字/4 節に
 * 対し 1200 字/2 節)。
 */

export const SKILL_QUALITY_NEAR_DUPLICATE_RATIO = 0.35;
export const SKILL_QUALITY_MIN_BODY_CHARS = 1200;
export const SKILL_QUALITY_MIN_SECTIONS = 2;
export const SKILL_SCAFFOLD_FILL_MARKER = "<!-- 記入:";
/** PLAN-L7-70 で一掃した generic stub の定型句 (再流入検出用)。 */
export const SKILL_GENERIC_STUB_PHRASES = [
  "初期 scaffold である",
  "This is a HELIX-HARNESS skill document",
] as const;

const SKILL_MAP_FILENAME = "SKILL_MAP.md";
/** 近似重複の shingle 長 (正規化文字 n-gram)。改行位置・句読点・見出し番号の変更に頑健。 */
const NEAR_DUPLICATE_SHINGLE_LENGTH = 16;

export interface SkillQualityDoc {
  /** repo-relative path (メッセージ用)。 */
  path: string;
  /** file slug (拡張子なし basename)。 */
  slug: string;
  /** frontmatter `name` (無ければ null)。 */
  name: string | null;
  /** frontmatter 除去後の本文。 */
  body: string;
}

export interface SkillQualityInput {
  docs: SkillQualityDoc[];
  /** SKILL_MAP.md の全文 (無ければ null → fail-close)。 */
  skillMapText: string | null;
}

export type SkillQualityViolationKind =
  | "missing-skill-map"
  | "duplicate-name"
  | "near-duplicate-content"
  | "unregistered-skill"
  | "dangling-trigger"
  | "stub-body"
  | "unfilled-scaffold"
  | "generic-stub";

export interface SkillQualityViolation {
  kind: SkillQualityViolationKind;
  path: string;
  detail: string;
}

export interface SkillQualityResult {
  ok: boolean;
  checked: number;
  violations: SkillQualityViolation[];
}

function stripFrontmatter(text: string): string {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

function frontmatterName(text: string): string | null {
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return null;
  const match = text.slice(3, end).match(/^name:\s*"?([^"\r\n]+)"?\s*$/m);
  return match ? match[1].trim() : null;
}

export function loadSkillQualityInput(repoRoot: string = process.cwd()): SkillQualityInput {
  const dir = join(repoRoot, "docs", "skills");
  const docs: SkillQualityDoc[] = [];
  let skillMapText: string | null = null;
  if (existsSync(dir)) {
    for (const entry of readdirSync(dir).sort()) {
      if (!entry.endsWith(".md")) continue;
      const text = readFileSync(join(dir, entry), "utf8");
      if (entry === SKILL_MAP_FILENAME) {
        skillMapText = text;
        continue;
      }
      docs.push({
        path: `docs/skills/${entry}`,
        slug: entry.replace(/\.md$/, ""),
        name: frontmatterName(text),
        body: stripFrontmatter(text),
      });
    }
  }
  return { docs, skillMapText };
}

/**
 * 近似重複用の正規化: 空白・改行・markdown 記号・句読点・数字を除去した文字列にする。
 * 改行位置の変更・見出し番号の付け替え・句読点の差し替えでは shingle 集合が変わらない。
 */
function normalizeForShingles(body: string): string {
  return body.toLowerCase().replace(/[\s`*_~>|#\-:[\](){}.,;、。・「」『』〜！？!?0-9０-９§]/g, "");
}

function shingles(body: string): Set<string> {
  const text = normalizeForShingles(body);
  const out = new Set<string>();
  for (let i = 0; i + NEAR_DUPLICATE_SHINGLE_LENGTH <= text.length; i++) {
    out.add(text.slice(i, i + NEAR_DUPLICATE_SHINGLE_LENGTH));
  }
  return out;
}

function sharedRatio(a: Set<string>, b: Set<string>): number {
  const min = Math.min(a.size, b.size);
  if (min === 0) return 0;
  let shared = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const item of small) if (large.has(item)) shared++;
  return shared / min;
}

/** SKILL_MAP の trigger table 節だけを取り出す (他の 2 列表を誤検知しないため)。 */
function triggerTableSection(mapText: string): string {
  const start = mapText.search(/^## Trigger table/m);
  if (start < 0) return "";
  const rest = mapText.slice(start);
  const next = rest.slice(2).search(/^## /m);
  return next < 0 ? rest : rest.slice(0, next + 2);
}

/** trigger table の Pack 列 (2 列目) を token 集合として取り出す。 */
function packColumnTokens(mapText: string): Set<string> {
  const tokens = new Set<string>();
  for (const row of triggerTableSection(mapText).matchAll(/^\|[^|]+\|([^|]+)\|\s*$/gm)) {
    const cell = row[1].trim();
    if (!cell || cell === "Pack" || /^-+$/.test(cell)) continue;
    for (const token of cell
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)) {
      tokens.add(token);
    }
  }
  return tokens;
}

export function analyzeSkillQuality(input: SkillQualityInput): SkillQualityResult {
  const violations: SkillQualityViolation[] = [];

  if (input.skillMapText === null) {
    violations.push({
      kind: "missing-skill-map",
      path: `docs/skills/${SKILL_MAP_FILENAME}`,
      detail: "SKILL_MAP.md が読めない (catalog index 不在は fail-close)",
    });
  }

  // 重複名 (frontmatter name / slug)。scaffold 側の slug lowercase 化と契約を揃えるため
  // 大小文字を正規化して比較する。
  const byName = new Map<string, string[]>();
  for (const doc of input.docs) {
    for (const key of new Set(
      [doc.slug, ...(doc.name ? [doc.name] : [])].map((k) => k.toLowerCase()),
    )) {
      const paths = byName.get(key) ?? [];
      paths.push(doc.path);
      byName.set(key, paths);
    }
  }
  for (const [key, paths] of byName) {
    if (paths.length > 1) {
      violations.push({
        kind: "duplicate-name",
        path: paths[1],
        detail: `name/slug "${key}" が重複: ${paths.join(", ")}`,
      });
    }
  }

  // 近似重複本文 (正規化文字 shingle の共有率)。
  const shingleSets = input.docs.map((doc) => shingles(doc.body));
  for (let i = 0; i < input.docs.length; i++) {
    for (let j = i + 1; j < input.docs.length; j++) {
      const ratio = sharedRatio(shingleSets[i], shingleSets[j]);
      if (ratio > SKILL_QUALITY_NEAR_DUPLICATE_RATIO) {
        violations.push({
          kind: "near-duplicate-content",
          path: input.docs[j].path,
          detail: `${input.docs[i].path} と本文共有率 ${ratio.toFixed(2)} > ${SKILL_QUALITY_NEAR_DUPLICATE_RATIO} (既存 pack の拡張か統合を検討)`,
        });
      }
    }
  }

  // SKILL_MAP 同期 (登録漏れ / 宙吊り参照)。判定は trigger table の Pack 列 token の
  // 完全一致に限定する (全文 substring 一致では "api" が "api-contract" で誤登録扱いになる)。
  if (input.skillMapText !== null) {
    const packTokens = packColumnTokens(input.skillMapText);
    const known = new Set(input.docs.flatMap((doc) => [doc.slug, ...(doc.name ? [doc.name] : [])]));
    for (const doc of input.docs) {
      const registered =
        packTokens.has(doc.slug) || (doc.name !== null && packTokens.has(doc.name));
      if (!registered) {
        violations.push({
          kind: "unregistered-skill",
          path: doc.path,
          detail:
            "SKILL_MAP trigger table の Pack 列に token が無い (発見不能な pack は catalog 債務)",
        });
      }
    }
    for (const candidate of packTokens) {
      if (!known.has(candidate)) {
        violations.push({
          kind: "dangling-trigger",
          path: `docs/skills/${SKILL_MAP_FILENAME}`,
          detail: `trigger table が実在しない pack "${candidate}" を参照`,
        });
      }
    }
  }

  // 実質下限 / 未記入 scaffold / generic stub。
  for (const doc of input.docs) {
    const sections = (doc.body.match(/^## /gm) ?? []).length;
    if (doc.body.length < SKILL_QUALITY_MIN_BODY_CHARS || sections < SKILL_QUALITY_MIN_SECTIONS) {
      violations.push({
        kind: "stub-body",
        path: doc.path,
        detail: `本文 ${doc.body.length} 字 / ${sections} 節 (下限 ${SKILL_QUALITY_MIN_BODY_CHARS} 字 / ${SKILL_QUALITY_MIN_SECTIONS} 節)`,
      });
    }
    if (doc.body.includes(SKILL_SCAFFOLD_FILL_MARKER)) {
      violations.push({
        kind: "unfilled-scaffold",
        path: doc.path,
        detail: `未記入の scaffold marker "${SKILL_SCAFFOLD_FILL_MARKER} ...→" が残存 (記入完了まで landing 不可)`,
      });
    }
    for (const phrase of SKILL_GENERIC_STUB_PHRASES) {
      if (doc.body.includes(phrase)) {
        violations.push({
          kind: "generic-stub",
          path: doc.path,
          detail: `generic stub 定型句 "${phrase}" が残存 (PLAN-L7-70 で一掃済みの antipattern)`,
        });
      }
    }
  }

  return { ok: violations.length === 0, checked: input.docs.length, violations };
}

export function skillQualityMessages(result: SkillQualityResult): string[] {
  if (result.ok) {
    return [`skill-quality - OK (packs=${result.checked}, duplicate=0, skill-map-sync=0, stub=0)`];
  }
  const sample = result.violations
    .slice(0, 5)
    .map((v) => `${v.path}:${v.kind}(${v.detail})`)
    .join(", ");
  return [
    `skill-quality - violation ${result.violations.length} 件 (packs=${result.checked})。重複・SKILL_MAP 同期・実質下限を確認 (PLAN-L7-420)`,
    `skill-quality - sample: ${sample}`,
  ];
}
