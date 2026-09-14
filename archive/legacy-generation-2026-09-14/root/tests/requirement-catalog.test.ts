import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildRequirementCatalog,
  loadRequirementCatalogSources,
  type RequirementCatalogSourceV1,
} from "../src/design/requirement-catalog";

/**
 * PLAN-L7-536-requirement-catalog / HR-FR-DHR-007・010
 * — L1 要求正本からの versioned requirement catalog 抽出。
 *
 * D-1（L1 の原 ID を再採番せず registry の family として認識する、PO 承認 2026-08-10）を
 * 「regex を広げる」ではなく「L1 正本に**実在する** ID だけを catalog として注入する」形で
 * 実装するための基盤。regex 緩和だと存在しない `BR-99` が有効 edge になり trace を捏造できる。
 */

function source(docId: string, body: string): RequirementCatalogSourceV1 {
  return { doc_id: docId, path: `docs/design/harness/L1-requirements/${docId}.md`, content: body };
}

/** BR / UX の定義表（実 business-requirements.md と同じ `### §1.2 WHAT` 配置）。 */
const BUSINESS_DOC = [
  "# L1 業務要求",
  "",
  "## §1 目的・背景",
  "",
  "### §1.1 WHY",
  "",
  "背景説明。",
  "",
  "### §1.2 WHAT",
  "",
  "| ID | 要求 | 出典 |",
  "|---|---|---|",
  "| **BR-01** | 設計⇔実装⇔テストの整合を機械強制する | concept P1 |",
  "| **BR-02** | AI agent roster の責務境界 | concept P2 |",
  "| **UX-02** | 工程表をリアルタイムに閲覧できる | ダッシュボード |",
  "",
  "### §1.3 WHO",
  "",
  "| **BR-90** | §1.3 は定義表ではない | 参照 |",
  "",
].join("\n");

/**
 * FR-L1 の定義表（実 functional-requirements.md と同じ `## §1` 直下配置）。
 * `### §1.2` の carry note は**参照表**であり、同形の行を持つが定義行ではない。
 */
const FUNCTIONAL_DOC = [
  "# L1 機能要求",
  "",
  "## §1 機能一覧",
  "",
  "| ID | 要求 | 優先度 |",
  "|---|---|---|",
  "| **FR-L1-01** | V字モデル全工程の PLAN 起票 | P0 |",
  "| **FR-L1-02** | TDD 強制フロー | P0 |",
  "",
  "### §1.2 L3 back-propagation 由来 carry note",
  "",
  "| 新 FR-L1-ID | 業務要求由来 | 優先度 |",
  "|---|---|---|",
  "| **FR-L1-01** | BR-08 | P0 |",
  "",
  "## §2 補足",
  "",
  "| **FR-L1-90** | §2 の参考記述であり定義行ではない | P2 |",
  "",
].join("\n");

function ok<T>(result: { ok: boolean } & Record<string, unknown>): T {
  if (!result.ok) throw new Error(`expected ok, got failures: ${JSON.stringify(result)}`);
  return (result as unknown as { value: T }).value;
}

function codes(result: Record<string, unknown>): string[] {
  if (result.ok) throw new Error("expected failure");
  return (result.failures as { code: string }[]).map((f) => f.code).sort();
}

describe("requirement catalog (HR-FR-DHR-007 / 010)", () => {
  it("U-DRC-001: L1 正本の定義行から kind つき catalog を決定的に抽出する", () => {
    const result = buildRequirementCatalog([
      source("business-requirements", BUSINESS_DOC),
      source("functional-requirements", FUNCTIONAL_DOC),
    ]);
    const catalog = ok<{
      entries: { requirement_id: string; requirement_kind: string; source_pointer: string }[];
      catalog_version: string;
      source_digest: string;
    }>(result);

    expect(catalog.entries.map((e) => e.requirement_id)).toEqual([
      "BR-01",
      "BR-02",
      "FR-L1-01",
      "FR-L1-02",
      "UX-02",
    ]);
    expect(catalog.entries.map((e) => e.requirement_kind)).toEqual(["br", "br", "fr", "fr", "ux"]);
    // source_pointer は元 doc と定義行へ復元できること（catalog が出所を失わない）。
    expect(catalog.entries[0].source_pointer).toBe("business-requirements:BR-01");
    // carry note（§1.2）と §1.3 / §2 の同形行は定義行ではないので入らない。
    // 範囲を広く取ると FR-L1-01 が 2 件になり偽の DRC_DUPLICATE_ID になる（実正本で実際に起きた）。
    expect(catalog.entries.some((e) => e.requirement_id === "BR-90")).toBe(false);
    expect(catalog.entries.some((e) => e.requirement_id === "FR-L1-90")).toBe(false);
    expect(catalog.catalog_version).toMatch(/^sha256:[0-9a-f]{64}$/u);
    expect(catalog.source_digest).toMatch(/^sha256:[0-9a-f]{64}$/u);

    // 決定的: 入力順を変えても同一 digest（順序に依存する catalog を作らない）。
    const swapped = ok<{ catalog_version: string; source_digest: string }>(
      buildRequirementCatalog([
        source("functional-requirements", FUNCTIONAL_DOC),
        source("business-requirements", BUSINESS_DOC),
      ]),
    );
    expect(swapped.catalog_version).toBe(catalog.catalog_version);
    expect(swapped.source_digest).toBe(catalog.source_digest);
  });

  it("U-DRC-002: 本文中の単なる言及を定義行として過剰受理しない", () => {
    // 過剰受理を許すと架空 ID が「実在」になり、存在検証そのものが無効化される
    // （L3 §3「誤って green になる経路」の 1 つ）。
    const prose = [
      "# L1 業務要求",
      "",
      "## §1 目的・背景",
      "",
      "### §1.2 WHAT",
      "",
      "BR-77 は BR-01 の派生として検討したが不採用（本文中の言及であり定義行ではない）。",
      "",
      "| ID | 要求 | 出典 |",
      "|---|---|---|",
      "| **BR-01** | 実在する定義行 | concept P1 |",
      "",
    ].join("\n");
    const catalog = ok<{ entries: { requirement_id: string }[] }>(
      buildRequirementCatalog([source("business-requirements", prose)]),
    );
    expect(catalog.entries.map((e) => e.requirement_id)).toEqual(["BR-01"]);
  });

  it("U-DRC-003: §1 section が無い doc は空集合ではなく DRC_SECTION_MISSING で fail-close する", () => {
    // parser が黙って空集合を返すと「catalog に無い＝全件不存在」となり、
    // fail-close を装ったまま intake 全体が停止する（空 catalog による偽の fail-close）。
    const noSection = ["# L1 機能要求", "", "## §9 別章", "", "| **FR-L1-01** | x | P0 |", ""].join(
      "\n",
    );
    expect(codes(buildRequirementCatalog([source("functional-requirements", noSection)]))).toEqual([
      "DRC_SECTION_MISSING",
    ]);
  });

  it("U-DRC-004: 定義行が 1 件も無い section は DRC_EMPTY_EXTRACTION で fail-close する", () => {
    const empty = [
      "# L1 業務要求",
      "",
      "## §1 目的・背景",
      "",
      "### §1.2 WHAT",
      "",
      "定義行はまだ無い。",
      "",
    ].join("\n");
    expect(codes(buildRequirementCatalog([source("business-requirements", empty)]))).toEqual([
      "DRC_EMPTY_EXTRACTION",
    ]);

    // **doc 単位**の検査であること。他 doc が抽出できていると全体は非空になるため、
    // 全体件数だけを見る実装では「片方の doc が丸ごと抽出漏れ」が silent に通る
    // （mutation 追試で実際に生存した経路）。
    expect(
      codes(
        buildRequirementCatalog([
          source("business-requirements", empty),
          source("functional-requirements", FUNCTIONAL_DOC),
        ]),
      ),
    ).toEqual(["DRC_EMPTY_EXTRACTION"]);
  });

  it("U-DRC-005: 重複定義と非正準 ID をそれぞれ別 code で fail-close する", () => {
    const duplicated = BUSINESS_DOC.replace(
      "| **BR-02** | AI agent roster の責務境界 | concept P2 |",
      "| **BR-01** | 重複した定義行 | concept P2 |",
    );
    expect(codes(buildRequirementCatalog([source("business-requirements", duplicated)]))).toEqual([
      "DRC_DUPLICATE_ID",
    ]);

    // `BR-9`（0 埋め欠落）は正準形でない。正準形だけを catalog へ入れる。
    const noncanonical = BUSINESS_DOC.replace("| **BR-02** |", "| **BR-9** |");
    expect(codes(buildRequirementCatalog([source("business-requirements", noncanonical)]))).toEqual(
      ["DRC_ID_NONCANONICAL"],
    );

    // 未知 family（`FR-99` は `FR-L1-` ではない）は **無視**であって非正準ではない。
    // prefix 判定を緩めると catalog 対象外の ID まで DRC_ID_NONCANONICAL として拾い、
    // 「registry が知らない family」と「書き損じ」が同じ失敗に潰れる（mutation 追試で生存した経路）。
    const foreign = FUNCTIONAL_DOC.replace("| **FR-L1-02** |", "| **FR-99** |");
    const kept = ok<{ entries: { requirement_id: string }[] }>(
      buildRequirementCatalog([source("functional-requirements", foreign)]),
    );
    expect(kept.entries.map((e) => e.requirement_id)).toEqual(["FR-L1-01"]);

    // 入力そのものが空（doc 未提供）は抽出 0 件と区別する。
    expect(codes(buildRequirementCatalog([]))).toEqual(["DRC_SOURCE_EMPTY"]);
  });

  it("U-DRC-006: 実 L1 正本を読み、既知の実在 ID を kind つきで含む", () => {
    // fixture だけで固定すると、正本の書式変更に気づけないまま green になる。
    const sources = loadRequirementCatalogSources(process.cwd());
    const catalog = ok<{
      entries: { requirement_id: string; requirement_kind: string }[];
      source_digest: string;
    }>(buildRequirementCatalog(sources));

    const byId = new Map(catalog.entries.map((e) => [e.requirement_id, e.requirement_kind]));
    // 実 screen_trace が参照する 3 ID（L3 §1 の inventory）が実在すること。
    expect(byId.get("BR-01")).toBe("br");
    expect(byId.get("UX-02")).toBe("ux");
    expect(byId.get("FR-L1-01")).toBe("fr");
    // 架空 ID は入らない（存在検証が効いている）。
    expect(byId.has("BR-99")).toBe(false);

    // source_digest は実ファイル内容に束縛される（stale catalog の再利用を検知できる）。
    const business = readFileSync(
      join(process.cwd(), "docs/design/harness/L1-requirements/business-requirements.md"),
      "utf8",
    );
    expect(business.length).toBeGreaterThan(0);
    const mutated = buildRequirementCatalog(
      sources.map((s) =>
        s.doc_id === "business-requirements" ? { ...s, content: `${s.content}\n<!-- x -->` } : s,
      ),
    );
    expect(ok<{ source_digest: string }>(mutated).source_digest).not.toBe(catalog.source_digest);
  });
});
