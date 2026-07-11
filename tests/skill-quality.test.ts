import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkSkillQuality } from "../src/doctor";
import {
  analyzeSkillQuality,
  loadSkillQualityInput,
  SKILL_QUALITY_MIN_BODY_CHARS,
  SKILL_QUALITY_MIN_SECTIONS,
  SKILL_QUALITY_NEAR_DUPLICATE_RATIO,
  type SkillQualityDoc,
  type SkillQualityInput,
} from "../src/lint/skill-quality";
import { scaffoldSkill } from "../src/skill-engine/scaffold";

const repoRoot = join(import.meta.dirname, "..");

const doc = (overrides: Partial<SkillQualityDoc>): SkillQualityDoc => ({
  path: "docs/skills/sample.md",
  slug: "sample",
  name: "sample",
  body: [
    "## §1 判断フレーム",
    "対象範囲の判断基準と迷ったときの自問を列挙する実質的な本文。".repeat(30),
    "## §2 手順と検証",
    "検証コマンドと証跡アンカーの要求を説明する実質的な本文。".repeat(30),
  ].join("\n"),
  ...overrides,
});

/** trigger table 形式の SKILL_MAP fixture (Pack 列 token 完全一致検査の前提を満たす)。 */
const mapFor = (packCells: string[]): string =>
  [
    "# SKILL_MAP",
    "",
    "## Trigger table（選択表）",
    "",
    "| タスク / signal | Pack |",
    "|---|---|",
    ...packCells.map((cell, i) => `| 作業 ${i} | ${cell} |`),
    "",
    "## Core operating rules",
  ].join("\n");

const input = (docs: SkillQualityDoc[], skillMapText?: string | null): SkillQualityInput => ({
  docs,
  skillMapText: skillMapText === undefined ? mapFor(docs.map((d) => d.slug)) : skillMapText,
});

describe("skill-quality lint (PLAN-L7-420)", () => {
  it("U-SKQUAL-006: passes a well-formed catalog", () => {
    const result = analyzeSkillQuality(input([doc({})]));
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("pins the measured thresholds (operator/threshold mutation fence)", () => {
    // 実測根拠 (PLAN-L7-420 §1): 近似重複 現行最大 0.107 / 本文最小 2098 字 / 節最小 4。
    expect(SKILL_QUALITY_NEAR_DUPLICATE_RATIO).toBe(0.35);
    expect(SKILL_QUALITY_MIN_BODY_CHARS).toBe(1200);
    expect(SKILL_QUALITY_MIN_SECTIONS).toBe(2);
  });

  it("U-SKQUAL-001: rejects duplicate names case-insensitively", () => {
    const original = doc({});
    const cased = doc({
      path: "docs/skills/sample-2.md",
      slug: "sample-2",
      name: "Sample",
      body: `## §1 別の内容\n${"別テーマの本文をここに書く。".repeat(60)}\n## §2 検証\n${"別の検証手順。".repeat(60)}`,
    });
    const result = analyzeSkillQuality(input([original, cased], mapFor(["sample", "sample-2"])));
    expect(result.violations.map((v) => v.kind)).toContain("duplicate-name");
  });

  it("U-SKQUAL-003: rejects near-duplicate bodies even after reflow and punctuation changes", () => {
    const original = doc({});
    // 改行位置変更 + 句読点差し替え + 見出し番号変更の複製 (行単位一致では 0 になる変異)。
    const mutated = doc({
      path: "docs/skills/sample-copy.md",
      slug: "sample-copy",
      name: "sample-copy",
      body: original.body
        .replace(/。/g, "．")
        .replace(/§1/g, "§9")
        .replace(/(.{25})/g, "$1\n"),
    });
    const result = analyzeSkillQuality(
      input([original, mutated], mapFor(["sample", "sample-copy"])),
    );
    expect(result.violations.map((v) => v.kind)).toContain("near-duplicate-content");
  });

  it("accepts distinct bodies below the near-duplicate threshold", () => {
    const a = doc({});
    const b = doc({
      path: "docs/skills/other.md",
      slug: "other",
      name: "other",
      body: `## §1 まったく別の関心事\n${"独自の判断基準を独自の語彙で述べる本文。".repeat(35)}\n## §2 別の検証\n${"固有の検証手順と固有の証跡要求。".repeat(35)}`,
    });
    const result = analyzeSkillQuality(input([a, b], mapFor(["sample", "other"])));
    expect(result.violations.filter((v) => v.kind === "near-duplicate-content")).toEqual([]);
  });

  it("U-SKQUAL-004: rejects stub bodies at the exact substance boundary", () => {
    // 節数境界: 1 節は stub、2 節は pass (本文長は十分に確保)。
    const oneSection = doc({ body: `## 手順\n${"あ".repeat(SKILL_QUALITY_MIN_BODY_CHARS)}` });
    expect(analyzeSkillQuality(input([oneSection])).violations.map((v) => v.kind)).toContain(
      "stub-body",
    );
    // 文字数境界を厳密に固定する: body.length がちょうど下限 = pass、下限 - 1 = stub。
    // (`< 1200` が `<= 1200` へ変異したら atFloor が fail し、比較演算子の変異を検出する)
    const prefix = "## 一\n## 二\n";
    const atFloor = doc({
      body: `${prefix}${"あ".repeat(SKILL_QUALITY_MIN_BODY_CHARS - prefix.length)}`,
    });
    expect(atFloor.body.length).toBe(SKILL_QUALITY_MIN_BODY_CHARS);
    expect(
      analyzeSkillQuality(input([atFloor])).violations.filter((v) => v.kind === "stub-body"),
    ).toEqual([]);
    const belowFloor = doc({
      body: `${prefix}${"あ".repeat(SKILL_QUALITY_MIN_BODY_CHARS - prefix.length - 1)}`,
    });
    expect(belowFloor.body.length).toBe(SKILL_QUALITY_MIN_BODY_CHARS - 1);
    expect(analyzeSkillQuality(input([belowFloor])).violations.map((v) => v.kind)).toContain(
      "stub-body",
    );
  });

  it("U-SKQUAL-005: rejects packs missing from the trigger table Pack column (unregistered mutation)", () => {
    // 全文には slug が現れる (説明文) が Pack 列に token が無い → unregistered。
    const map = `${mapFor(["other-pack"])}\n\nsample の説明が本文にだけある。`;
    const result = analyzeSkillQuality(
      input(
        [
          doc({}),
          doc({
            path: "docs/skills/other-pack.md",
            slug: "other-pack",
            name: "other-pack",
            body: `## §1 別内容\n${"独自本文。".repeat(80)}\n## §2 検証\n${"独自検証。".repeat(80)}`,
          }),
        ],
        map,
      ),
    );
    const kinds = result.violations.map((v) => v.kind);
    expect(kinds).toContain("unregistered-skill");
    expect(result.violations.find((v) => v.kind === "unregistered-skill")?.path).toBe(
      "docs/skills/sample.md",
    );
  });

  it("does not treat substring hits as registration (api vs api-contract)", () => {
    const api = doc({
      path: "docs/skills/api.md",
      slug: "api",
      name: "api",
    });
    // Pack 列には api-contract しか無い。substring 一致なら "api" が誤登録扱いになる。
    const result = analyzeSkillQuality(input([api], mapFor(["api-contract"])));
    const kinds = result.violations.map((v) => v.kind);
    expect(kinds).toContain("unregistered-skill");
    // api-contract は実在しない pack への参照なので dangling も立つ。
    expect(kinds).toContain("dangling-trigger");
  });

  it("rejects dangling trigger references but ignores tables outside the trigger section", () => {
    const map = [
      mapFor(["sample", "ghost-pack"]),
      "",
      "## 別の節の 2 列表 (trigger table ではない)",
      "",
      "| key | value |",
      "|---|---|",
      "| 説明 | not-a-pack |",
    ].join("\n");
    const result = analyzeSkillQuality(input([doc({})], map));
    const danglings = result.violations.filter((v) => v.kind === "dangling-trigger");
    expect(danglings.map((v) => v.detail).some((d) => d.includes("ghost-pack"))).toBe(true);
    expect(danglings.map((v) => v.detail).some((d) => d.includes("not-a-pack"))).toBe(false);
  });

  it("rejects unfilled scaffold markers and revived generic stubs", () => {
    const unfilled = doc({ body: `${doc({}).body}\n<!-- 記入: ここを埋める -->` });
    const generic = doc({
      path: "docs/skills/generic.md",
      slug: "generic",
      name: "generic",
      body: `## §1 別内容\n${"独自の本文。".repeat(80)}\n## §2 検証\n${"独自の検証。".repeat(80)}\nこの skill は HELIX-HARNESS の作業手順を補助するための初期 scaffold である。`,
    });
    const result = analyzeSkillQuality(input([unfilled, generic], mapFor(["sample", "generic"])));
    const kinds = result.violations.map((v) => v.kind);
    expect(kinds).toContain("unfilled-scaffold");
    expect(kinds).toContain("generic-stub");
  });

  it("fails closed when SKILL_MAP.md is unreadable", () => {
    const result = analyzeSkillQuality(input([doc({})], null));
    expect(result.violations.map((v) => v.kind)).toContain("missing-skill-map");
  });

  it("keeps the real repository catalog green (regression fence)", () => {
    const result = analyzeSkillQuality(loadSkillQualityInput(repoRoot));
    expect(result.checked).toBeGreaterThan(50);
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("is wired into the production doctor surface", () => {
    const result = checkSkillQuality(repoRoot);
    expect(result.ok).toBe(true);
    expect(result.messages[0]).toMatch(
      /^skill-quality - OK \(packs=\d+, duplicate=0, skill-map-sync=0, stub=0\)$/,
    );
  });

  it("U-SKQUAL-002: accepts a freshly filled scaffold end-to-end, including the default description path", () => {
    // description 省略の既定経路でも禁止句 (generic stub 文言) を生成しないこと。
    const scaffold = scaffoldSkill({
      name: "incident-drill",
      category: "process",
      layers: ["L12"],
      driveModels: ["Incident"],
      existingSlugs: [],
    });
    expect(scaffold.ok).toBe(true);
    expect(scaffold.content).not.toContain("初期 scaffold である");

    const body = scaffold.content.replace(/^---[\s\S]*?\n---\n/, "");
    const unfilledResult = analyzeSkillQuality({
      docs: [{ path: scaffold.path, slug: "incident-drill", name: "incident-drill", body }],
      skillMapText: mapFor(["incident-drill"]),
    });
    // 未記入 scaffold は gate が fail-close にする (stub 再流入防止の契約)。
    expect(unfilledResult.violations.map((v) => v.kind)).toContain("unfilled-scaffold");
    expect(unfilledResult.violations.map((v) => v.kind)).not.toContain("generic-stub");

    const filledBody = `${body.replace(/<!-- 記入:[\s\S]*?-->/g, "")}\n## 追加節\n${"実質のある判断規約本文。".repeat(80)}`;
    expect(filledBody.length).toBeGreaterThan(SKILL_QUALITY_MIN_BODY_CHARS);
    const filledResult = analyzeSkillQuality({
      docs: [
        { path: scaffold.path, slug: "incident-drill", name: "incident-drill", body: filledBody },
      ],
      skillMapText: mapFor(["incident-drill"]),
    });
    expect(filledResult.violations).toEqual([]);
    expect(filledResult.ok).toBe(true);
  });
});
