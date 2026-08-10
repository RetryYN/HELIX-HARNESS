/**
 * Design Registry — L1 要求正本からの versioned requirement catalog（PLAN-L7-536、Issue #177）。
 *
 * L3 `design-registry-requirement-family-authority.md`（status=confirmed、PO 承認 2026-08-10）の
 * D-1「L1 の原 ID（BR / UX / FR-L1）を再採番せず registry の requirement family として認識する」を
 * 実装する基盤。
 *
 * **regex を広げるのではなく catalog を注入する**（HR-FR-DHR-007）。`REQUIREMENT_ID_PATTERNS` へ
 * family を足すだけだと、L1 に存在しない `BR-99` が有効な edge 端点になり trace を捏造できる。
 * そこで L1 正本から「定義行に実在する ID」だけを構造的に抽出し、consumer へ明示注入する。
 *
 * parser 健全性（HR-FR-DHR-010）: section 欠落・抽出 0 件・重複・非正準 ID・**本文中の言及の
 * 過剰受理**を、「ID 不存在」とは別の typed failure として区別する。parser が黙って空集合を
 * 返すと「catalog に無い＝全件不存在」となり、fail-close を装ったまま intake が止まるため
 * （偽の fail-close）、空集合そのものを失敗として扱う。
 *
 * 本 module は pure（file I/O は `loadRequirementCatalogSources` だけに隔離）。
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** catalog が認識する L1 family。registry 側の `HIL-*` / `VDH-FR-*` / `HR-FR-DHR-*` とは別空間。 */
export type RequirementKindV1 = "br" | "ux" | "fr";

export type RequirementCatalogFailureCodeV1 =
  /** 入力 source が 1 件も無い（doc 未提供）。抽出 0 件とは区別する。 */
  | "DRC_SOURCE_EMPTY"
  /** 対象 section（§1）が doc に無い。書式変更を空集合で吸収しない。 */
  | "DRC_SECTION_MISSING"
  /** section はあるが定義行が 1 件も無い。偽の fail-close を作らない。 */
  | "DRC_EMPTY_EXTRACTION"
  /** 同一 ID の定義行が複数ある。どちらが正本か機械では決められない。 */
  | "DRC_DUPLICATE_ID"
  /** 定義行の ID が正準形でない（`BR-9` のような 0 埋め欠落）。 */
  | "DRC_ID_NONCANONICAL";

export interface RequirementCatalogFailureV1 {
  code: RequirementCatalogFailureCodeV1;
  evidence_digest: string;
}

export type RequirementCatalogResultV1<T> =
  | { ok: true; value: T }
  | { ok: false; failures: readonly RequirementCatalogFailureV1[] };

export interface RequirementCatalogSourceV1 {
  /** 論理 doc 名（`business-requirements`）。source_pointer の前半に入る。 */
  doc_id: string;
  /** repo 相対 path（証跡用。抽出規則は doc_id で決める）。 */
  path: string;
  content: string;
}

export interface RequirementCatalogEntryV1 {
  requirement_id: string;
  requirement_kind: RequirementKindV1;
  /** 元の定義行へ戻る復元経路（`business-requirements:BR-01`）。 */
  source_pointer: string;
}

export interface RequirementCatalogV1 {
  entries: RequirementCatalogEntryV1[];
  /** entries から導く決定的 version。intake receipt へ束縛して stale green を防ぐ。 */
  catalog_version: string;
  /** 抽出元 doc の実内容 digest。doc が変われば必ず変わる。 */
  source_digest: string;
}

/**
 * doc ごとの抽出規則。**定義表が置かれている section だけ**を走査する。
 *
 * doc 全体や §1 全体を走査してはならない。実 `functional-requirements.md` は §1 の中に
 * `### §1.2 L3 back-propagation 由来 FR-L1 carry note` という**参照表**を持ち、そこにも
 * `| **FR-L1-45** | ... |` という同形の行がある。範囲を広く取ると定義行と参照行が区別できず、
 * Set で畳めば重複が silent に消え、畳まなければ偽の `DRC_DUPLICATE_ID` になる。
 * 定義表の位置を明示宣言することが、この曖昧さを機械的に解消する唯一の手段である。
 */
interface CatalogSourceRuleV1 {
  doc_id: string;
  kinds: readonly RequirementKindV1[];
  /** 定義表を含む section の開始見出し。 */
  section_start: RegExp;
  /** 走査を打ち切る次見出し。 */
  section_end: RegExp;
}

const CATALOG_SOURCE_RULES: readonly CatalogSourceRuleV1[] = Object.freeze([
  Object.freeze({
    doc_id: "business-requirements",
    kinds: ["br", "ux"] as const,
    // BR / UX の定義表は §1.2 WHAT にある。
    section_start: /^###\s*§1\.2\b[^\n]*$/mu,
    section_end: /^###\s/mu,
  }),
  Object.freeze({
    doc_id: "functional-requirements",
    kinds: ["fr"] as const,
    // FR-L1 の定義表は §1 直下（最初の `###` サブ見出しの手前）にある。
    section_start: /^##\s*§1\b[^\n]*$/mu,
    section_end: /^###?\s/mu,
  }),
]);

const L1_REQUIREMENTS_DIR = "docs/design/harness/L1-requirements";

/**
 * 定義行だけを認識する。`| **BR-01** |` のように **表セルの強調 ID** であることを要求し、
 * 本文中の `BR-77` のような言及は拾わない（過剰受理は存在検証そのものを無効化する）。
 */
const DEFINITION_ROW = /^\|\s*\*\*([A-Z][A-Z0-9-]*)\*\*\s*\|/u;

/** 正準形の判定。桁数まで固定し、`BR-9` のような 0 埋め欠落を非正準として弾く。 */
const CANONICAL_BY_KIND: Readonly<Record<RequirementKindV1, RegExp>> = Object.freeze({
  br: /^BR-\d{2}$/u,
  fr: /^FR-L1-\d{2}$/u,
  ux: /^UX-\d{2}$/u,
});

/**
 * prefix → kind の単一表。kind 判定と「非正準候補か」の判定を同じ表から導き、
 * family 追加時に片方だけ更新して非正準検査が抜ける経路を作らない。
 * `FR-L1-` は `BR-` より先に評価する必要はないが、順序依存を持たないよう prefix は互いに素にする。
 */
const PREFIX_BY_KIND: Readonly<Record<RequirementKindV1, string>> = Object.freeze({
  br: "BR-",
  fr: "FR-L1-",
  ux: "UX-",
});

/** 定義行の ID prefix から kind を引く。ここに無い prefix は catalog 対象外として無視する。 */
function kindOf(rawId: string): RequirementKindV1 | null {
  for (const [kind, prefix] of Object.entries(PREFIX_BY_KIND)) {
    if (rawId.startsWith(prefix)) return kind as RequirementKindV1;
  }
  return null;
}

function sha256(text: string): string {
  return `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;
}

function fail(
  code: RequirementCatalogFailureCodeV1,
  evidence: string,
): RequirementCatalogFailureV1 {
  return { code, evidence_digest: sha256(evidence) };
}

/**
 * 宣言された定義表 section を切り出す。開始見出しが無ければ null を返し、
 * 「見出しが消えた」を空集合として吸収しない（書式変更を検知するため）。
 */
function definitionSection(content: string, rule: CatalogSourceRuleV1): string | null {
  const start = content.match(rule.section_start);
  if (start?.index === undefined) return null;
  const after = content.slice(start.index + start[0].length);
  const next = after.match(rule.section_end);
  return next?.index === undefined ? after : after.slice(0, next.index);
}

/** U-DRC-001..005: L1 正本 source 群から決定的な requirement catalog を組む（pure）。 */
export function buildRequirementCatalog(
  sources: readonly RequirementCatalogSourceV1[],
): RequirementCatalogResultV1<RequirementCatalogV1> {
  if (sources.length === 0) {
    return { ok: false, failures: [fail("DRC_SOURCE_EMPTY", "requirement-catalog:no-source")] };
  }

  const found: RequirementCatalogFailureV1[] = [];
  const entries: RequirementCatalogEntryV1[] = [];
  const seen = new Set<string>();

  // 入力順に依存しないよう doc_id で正準化してから走査する。
  const ordered = [...sources].sort((a, b) => a.doc_id.localeCompare(b.doc_id));

  for (const src of ordered) {
    const rule = CATALOG_SOURCE_RULES.find((r) => r.doc_id === src.doc_id);
    if (rule === undefined) continue;

    const scope = definitionSection(src.content, rule);
    if (scope === null) {
      found.push(fail("DRC_SECTION_MISSING", `requirement-catalog:${src.doc_id}:section-1`));
      continue;
    }

    let extracted = 0;
    for (const line of scope.split("\n")) {
      const m = line.match(DEFINITION_ROW);
      if (m === null) continue;
      const rawId = m[1];
      const kind = kindOf(rawId);
      if (kind === null || !rule.kinds.includes(kind)) {
        // この doc の対象 family でない定義行（別表の見出し行など）は catalog 対象外。
        continue;
      }
      extracted += 1;
      if (!CANONICAL_BY_KIND[kind].test(rawId)) {
        // kindOf が prefix 一致で kind を決めている以上、ここへ来る時点で prefix は合っている。
        // 正準形でないのに prefix が合う = 0 埋め欠落などの書き損じであり、silent に落とさない。
        found.push(fail("DRC_ID_NONCANONICAL", `requirement-catalog:${src.doc_id}:${rawId}`));
        continue;
      }
      if (seen.has(rawId)) {
        found.push(fail("DRC_DUPLICATE_ID", `requirement-catalog:${src.doc_id}:${rawId}`));
        continue;
      }
      seen.add(rawId);
      entries.push({
        requirement_id: rawId,
        requirement_kind: kind,
        source_pointer: `${src.doc_id}:${rawId}`,
      });
    }

    if (extracted === 0) {
      // section はあるのに定義行が 0 件 = 書式変更か抽出漏れ。「全件不存在」を装わせない。
      found.push(fail("DRC_EMPTY_EXTRACTION", `requirement-catalog:${src.doc_id}:no-definition`));
    }
  }

  if (found.length > 0) return { ok: false, failures: found };
  if (entries.length === 0) {
    return {
      ok: false,
      failures: [fail("DRC_EMPTY_EXTRACTION", "requirement-catalog:no-known-source")],
    };
  }

  entries.sort((a, b) => a.requirement_id.localeCompare(b.requirement_id));
  return {
    ok: true,
    value: {
      entries,
      catalog_version: sha256(JSON.stringify(entries)),
      // doc 実内容へ束縛する（entries が同じでも本文が変われば digest は変わる）。
      source_digest: sha256(
        JSON.stringify(ordered.map((s) => ({ content: sha256(s.content), doc_id: s.doc_id }))),
      ),
    },
  };
}

/**
 * L1 正本 Markdown を読む唯一の I/O 境界。intake 側へ Markdown 解釈を持ち込まないため、
 * 読み取りと解釈をここで閉じる（HR-FR-DHR-008 の前提）。
 */
export function loadRequirementCatalogSources(
  repoRoot: string = process.cwd(),
): RequirementCatalogSourceV1[] {
  return CATALOG_SOURCE_RULES.map((rule) => {
    const path = `${L1_REQUIREMENTS_DIR}/${rule.doc_id}.md`;
    return {
      doc_id: rule.doc_id,
      path,
      content: readFileSync(join(repoRoot, path), "utf8"),
    };
  });
}
