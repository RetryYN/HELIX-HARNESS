import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeDesignCoverage,
  computeBaselineFingerprint,
  DESIGN_BASELINE_FINGERPRINT,
  DESIGN_CATALOG_EXPECTED_SOURCE_COUNT,
  DESIGN_CATALOG_SCHEMA_VERSION,
  DESIGN_NA_REASON_MIN_CHARS,
  type DesignCatalog,
  type DesignCatalogItem,
  designCoverageMessages,
  expectedZipSources,
  loadDesignCoverageInput,
} from "../src/lint/design-coverage";

const repoRoot = join(import.meta.dirname, "..");

const item = (overrides: Partial<DesignCatalogItem>): DesignCatalogItem => ({
  id: "sample-doc",
  name: "サンプル設計書",
  category: "basic",
  source: "zip-04",
  status: "todo",
  ...overrides,
});

const catalog = (items: DesignCatalogItem[]): DesignCatalog => ({
  schema_version: DESIGN_CATALOG_SCHEMA_VERSION,
  project: "HELIX-HARNESS",
  profile: "cli-harness",
  categories: [
    { id: "basic", name: "基本設計" },
    { id: "test", name: "テスト・検証" },
  ],
  items,
});

const analyze = (items: DesignCatalogItem[], existing: string[] = [], designDocs: string[] = []) =>
  analyzeDesignCoverage({
    catalog: catalog(items),
    artifactExists: (p) => existing.includes(p),
    designDocs,
  });

describe("design-coverage lint (PLAN-L7-421)", () => {
  it("U-DESIGNCOV-001: passes a well-formed catalog and computes ZIP-style coverage", () => {
    const result = analyze(
      [
        item({ id: "a", source: "zip-01", status: "done", artifact: "docs/design/a.md" }),
        item({ id: "b", source: "zip-02", status: "todo" }),
        item({ id: "c", source: "zip-03", status: "na", na_reason: "CLI 製品に画面が無い" }),
      ],
      ["docs/design/a.md"],
    );
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
    // done/(done+todo) = 1/2。na は分母に入れない (ZIP coverage と同一式)。
    expect(result.coveragePercent).toBe(50);
    expect(result.counts).toEqual({ done: 1, todo: 1, na: 1 });
  });

  it("U-DESIGNCOV-002: reports per-category coverage and remaining todo in result and messages (round 3-①)", () => {
    const result = analyze(
      [
        item({ id: "a", source: "zip-01", status: "done", artifact: "docs/design/a.md" }),
        item({ id: "b", source: "zip-02", status: "todo" }),
        item({
          id: "c",
          source: "zip-03",
          status: "done",
          category: "test",
          artifact: "docs/design/c.md",
        }),
        item({
          id: "d",
          source: "zip-04",
          status: "na",
          category: "test",
          na_reason: "構造的に関心事が存在しないため",
        }),
      ],
      ["docs/design/a.md", "docs/design/c.md"],
    );
    expect(result.categories).toEqual([
      { category: "basic", done: 1, todo: 1, na: 0, coveragePercent: 50 },
      { category: "test", done: 1, todo: 0, na: 1, coveragePercent: 100 },
    ]);
    const messages = designCoverageMessages(result);
    // PLAN §2 の message 要求: 総合 % / カテゴリ別 / todo 残。行全体を exact 固定し、
    // 採用カテゴリの部分列挙 (例: adopted.slice(0, 1)) の green mutant を検出する。
    expect(messages.some((m) => m.includes("総合 66.7%"))).toBe(true);
    expect(messages).toContain("design-coverage - カテゴリ別: basic 50%, test 100%");
    // todo 残が無いカテゴリ (test) は todo 残行に現れない。
    expect(messages).toContain("design-coverage - todo 残: basic=1");

    // 複数カテゴリに todo が残る場合は全カテゴリが列挙される (部分列挙 mutant の fence)。
    const multiTodo = analyze(
      [
        item({ id: "a", source: "zip-01", status: "todo" }),
        item({ id: "b", source: "zip-02", status: "todo", category: "test" }),
        item({ id: "c", source: "zip-03", status: "todo", category: "test" }),
      ],
      [],
    );
    expect(designCoverageMessages(multiTodo)).toContain(
      "design-coverage - todo 残: basic=1, test=2",
    );
    expect(designCoverageMessages(multiTodo)).toContain(
      "design-coverage - カテゴリ別: basic 0%, test 0%",
    );
  });

  it("U-DESIGNCOV-003: rejects na without a reason (silent tailoring ban)", () => {
    const result = analyze([item({ status: "na" })]);
    expect(result.violations.map((v) => v.kind)).toContain("na-without-reason");
    expect(result.ok).toBe(false);
  });

  it("U-DESIGNCOV-004: rejects done without an existing artifact (declaration vs reality drift)", () => {
    const noArtifact = analyze([item({ status: "done" })]);
    expect(noArtifact.violations.map((v) => v.kind)).toContain("done-without-artifact");

    const missingFile = analyze([item({ status: "done", artifact: "docs/design/ghost.md" })]);
    expect(missingFile.violations.map((v) => v.kind)).toContain("artifact-not-found");
  });

  it("U-DESIGNCOV-005: rejects broken traces: missing/duplicate zip source, duplicate id, unknown enum", () => {
    const result = analyze([
      item({ id: "x", source: "not-a-zip-ref" }),
      item({ id: "y", source: "zip-05" }),
      item({ id: "y", source: "zip-05" }),
      item({ id: "z", source: "zip-06", status: "unknown" }),
      item({ id: "w", source: "zip-07", category: "ghost-category" }),
    ]);
    const kinds = result.violations.map((v) => v.kind);
    expect(kinds).toContain("missing-source");
    expect(kinds).toContain("duplicate-source");
    expect(kinds).toContain("duplicate-id");
    expect(kinds).toContain("unknown-status");
    expect(kinds).toContain("unknown-category");
  });

  it("U-DESIGNCOV-006: fails closed when the catalog is missing or malformed", () => {
    const missing = analyzeDesignCoverage({
      catalog: null,
      artifactExists: () => true,
      designDocs: [],
    });
    expect(missing.ok).toBe(false);
    expect(missing.violations.map((v) => v.kind)).toContain("missing-catalog");

    const badSchema = analyzeDesignCoverage({
      catalog: { ...catalog([]), schema_version: "design-catalog.v0" },
      artifactExists: () => true,
      designDocs: [],
    });
    expect(badSchema.violations.map((v) => v.kind)).toContain("invalid-schema");
  });

  it("U-DESIGNCOV-007: rejects design docs outside the catalog and stale baseline entries (unauthorized-doc ban)", () => {
    const items = [
      item({ id: "a", source: "zip-01", status: "done", artifact: "docs/design/a.md" }),
    ];
    // artifact でも baseline でも無い docs/design 配下の doc → untracked (「勝手に作る」検出)。
    const untracked = analyzeDesignCoverage({
      catalog: { ...catalog(items), baseline: ["docs/design/frozen.md"] },
      artifactExists: () => true,
      designDocs: ["docs/design/a.md", "docs/design/frozen.md", "docs/design/rogue.md"],
    });
    expect(untracked.violations.map((v) => v.kind)).toContain("untracked-design-doc");
    expect(untracked.violations.find((v) => v.kind === "untracked-design-doc")?.item).toBe(
      "docs/design/rogue.md",
    );

    // artifact / baseline に載っていれば green。baseline の実在しない doc は stale として red。
    const clean = analyzeDesignCoverage({
      catalog: { ...catalog(items), baseline: ["docs/design/frozen.md"] },
      artifactExists: () => true,
      designDocs: ["docs/design/a.md", "docs/design/frozen.md"],
    });
    expect(clean.violations).toEqual([]);

    const stale = analyzeDesignCoverage({
      catalog: { ...catalog(items), baseline: ["docs/design/frozen.md"] },
      artifactExists: () => true,
      designDocs: ["docs/design/a.md"],
    });
    expect(stale.violations.map((v) => v.kind)).toContain("stale-baseline-entry");
  });

  it("U-DESIGNCOV-008: rejects baseline growth without updating the src-side fingerprint pin (round 1-①)", () => {
    const items = [
      item({ id: "a", source: "zip-01", status: "done", artifact: "docs/design/a.md" }),
    ];
    const frozen = ["docs/design/frozen.md"];
    // rogue doc + baseline 追記を catalog.yaml だけで行う攻撃 → fingerprint drift で red。
    const attacked = analyzeDesignCoverage({
      catalog: { ...catalog(items), baseline: [...frozen, "docs/design/rogue.md"] },
      artifactExists: () => true,
      designDocs: ["docs/design/a.md", "docs/design/frozen.md", "docs/design/rogue.md"],
      expectedBaselineFingerprint: computeBaselineFingerprint(frozen),
    });
    expect(attacked.violations.map((v) => v.kind)).toContain("baseline-fingerprint-drift");

    // pin と一致する baseline は green (意図的更新の正規手順)。
    const legit = analyzeDesignCoverage({
      catalog: { ...catalog(items), baseline: frozen },
      artifactExists: () => true,
      designDocs: ["docs/design/a.md", "docs/design/frozen.md"],
      expectedBaselineFingerprint: computeBaselineFingerprint(frozen),
    });
    expect(legit.violations).toEqual([]);
  });

  it("U-DESIGNCOV-009: rejects done artifacts pointing at unrelated repo files (round 1-②)", () => {
    const result = analyze([item({ status: "done", artifact: "package.json" })], ["package.json"]);
    expect(result.violations.map((v) => v.kind)).toContain("artifact-outside-scope");
    expect(result.ok).toBe(false);

    const traversal = analyze(
      [item({ status: "done", artifact: "docs/../package.json" })],
      ["docs/../package.json"],
    );
    expect(traversal.violations.map((v) => v.kind)).toContain("artifact-outside-scope");
  });

  it("U-DESIGNCOV-010: rejects path traversal that escapes the allowed roots (round 2-①)", () => {
    // 許可 root を startsWith で通過させる traversal 変異はすべて red。
    const traversals = [
      "docs/../package.json",
      "docs/design/../../../package.json",
      "docs/./secret.md",
      "/etc/passwd",
      "docs\\design\\a.md",
      "docs//design/a.md",
    ];
    for (const artifact of traversals) {
      const result = analyze([item({ status: "done", artifact })], [artifact]);
      expect(
        result.violations.map((v) => v.kind),
        `traversal artifact "${artifact}" は red になる`,
      ).toContain("artifact-outside-scope");
    }
    // 正規形の許可 root 内 path は従来どおり green。
    const canonical = analyze(
      [item({ status: "done", artifact: "docs/design/a.md" })],
      ["docs/design/a.md"],
      ["docs/design/a.md"],
    );
    expect(canonical.violations).toEqual([]);
  });

  it("U-DESIGNCOV-011: rejects out-of-range and missing zip sources against the expected full set (round 1-③)", () => {
    // 範囲外 (zip-123 / zip-999 / zip-00) は形式適合でも unknown-source。
    const outOfRange = analyzeDesignCoverage({
      catalog: catalog([
        item({ id: "a", source: "zip-123" }),
        item({ id: "b", source: "zip-999" }),
        item({ id: "c", source: "zip-00" }),
      ]),
      artifactExists: () => true,
      designDocs: [],
      expectedSources: expectedZipSources(),
    });
    expect(outOfRange.violations.filter((v) => v.kind === "unknown-source")).toHaveLength(3);

    // 期待集合に対する欠番は missing-zip-trace (件数偽装・黙殺の禁止)。
    const partial = analyzeDesignCoverage({
      catalog: catalog([item({ id: "a", source: "zip-01" })]),
      artifactExists: () => true,
      designDocs: [],
      expectedSources: ["zip-01", "zip-02"],
    });
    expect(partial.violations.map((v) => v.kind)).toContain("missing-zip-trace");
    expect(partial.violations.find((v) => v.kind === "missing-zip-trace")?.item).toBe("zip-02");
    expect(expectedZipSources()).toHaveLength(DESIGN_CATALOG_EXPECTED_SOURCE_COUNT);
    expect(expectedZipSources()[0]).toBe("zip-01");
    expect(expectedZipSources()[99]).toBe("zip-100");
  });

  it("U-DESIGNCOV-012: rejects trivial na reasons and all-na hollowed catalogs (round 1-④)", () => {
    const trivial = analyze([item({ status: "na", na_reason: "N/A" })]);
    expect(trivial.violations.map((v) => v.kind)).toContain("trivial-na-reason");
    const short = analyze([
      item({ status: "na", na_reason: "あ".repeat(DESIGN_NA_REASON_MIN_CHARS - 1) }),
    ]);
    expect(short.violations.map((v) => v.kind)).toContain("trivial-na-reason");

    // 全件 na → 採用集合が空 → empty-adoption で red (coverage 空洞化の禁止)。
    const hollow = analyze([
      item({
        id: "a",
        source: "zip-01",
        status: "na",
        na_reason: "構造的に関心事が存在しないため",
      }),
      item({
        id: "b",
        source: "zip-02",
        status: "na",
        na_reason: "構造的に関心事が存在しないため対象外",
      }),
    ]);
    expect(hollow.violations.map((v) => v.kind)).toContain("empty-adoption");
  });

  it("U-DESIGNCOV-013: keeps the real repository catalog green with full zip trace (regression fence)", () => {
    const input = loadDesignCoverageInput(repoRoot);
    const result = analyzeDesignCoverage(input);
    expect(input.catalog, "docs/design/design-catalog.yaml が存在する").not.toBeNull();
    // 実運用 input は期待集合と fingerprint pin を必ず供給する (省略経路の攻撃を塞ぐ)。
    expect(input.expectedSources).toHaveLength(DESIGN_CATALOG_EXPECTED_SOURCE_COUNT);
    expect(input.expectedBaselineFingerprint).toBe(DESIGN_BASELINE_FINGERPRINT);
    // ZIP 122 文書種の全件 trace (PLAN-L7-421 受入条件)。欠番は missing-zip-trace が担保。
    expect(result.checked).toBe(122);
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
    // PLAN-L7-425再監査: current canonical 3件だけdone。systemのlegacy shimはtodoを維持する。
    expect(result.counts).toEqual({ done: 46, todo: 54, na: 22 });
  });
});
