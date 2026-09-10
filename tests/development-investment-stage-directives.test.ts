import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// PLAN-RECOVERY-1727-stage-directive-intake
const root = resolve(import.meta.dirname, "..");
const intakePath = resolve(
  root,
  "docs/governance/candidates/development-investment-stage-directives-intake_v1.0.md",
);
const cleanupPath = resolve(
  root,
  "docs/governance/development-investment-stage-directives-source-cleanup-2026-09-11.md",
);
const readmePath = resolve(root, "docs/governance/candidates/README.md");
const expectedIntakeDigest = "7b7d0600bccd9045aa1c11f9762886c982b38e9446197f9dcf00637116833b04";
const retiredRootSources = [
  "HELIX_STAGE_DIRECTIVES_COMPLETE.md",
  "00_COMMON_DIRECTIVE.md",
  "01_P0_IMMEDIATE_DIRECTIVE.md",
  "02_P1_EARLY_AUTOMATION_DIRECTIVE.md",
  "03_P2_INCREMENTAL_CONVERGENCE_DIRECTIVE.md",
  "04_P3_KNOWLEDGE_INVESTMENT_DIRECTIVE.md",
  "05_P4_INTELLIGENCE_RESEARCH_DIRECTIVE.md",
] as const;

function digest(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}

describe("開発投資段階指示書の取込み", () => {
  it("U-DIS-001: 統合原稿のbytesを候補入力として欠損なく保全する", () => {
    const source = readFileSync(intakePath, "utf8");
    expect(digest(source)).toBe(expectedIntakeDigest);
    expect(source).toContain("# HELIX 開発コスト削減・知能化：段階指示書 統合版");
    expect(source).toContain("# 共通受入・採否・段階引継ぎ");
    expect(source).toContain("# 原資料・版・参照の扱い");
  });

  it("U-DIS-002: INV-001〜072の個別カードと主段階割当をexact setで保持する", () => {
    const source = readFileSync(intakePath, "utf8");
    const headings = [...source.matchAll(/^## INV-(\d{3}) — /gm)].map((match) => match[1]);
    const expected = Array.from({ length: 72 }, (_, index) => String(index + 1).padStart(3, "0"));
    expect(headings).toEqual(expected);

    const tableStart = source.indexOf("## 全件対応表");
    const tableEnd = source.indexOf("## 既存の導入束との対応", tableStart);
    const table = source.slice(tableStart, tableEnd);
    const assignments = [...table.matchAll(/^\| INV-(\d{3}) \| (P[0-4]) \|/gm)];
    expect(assignments.map((match) => match[1])).toEqual(expected);
    expect(new Set(assignments.map((match) => match[2]))).toEqual(
      new Set(["P0", "P1", "P2", "P3", "P4"]),
    );
  });

  it("U-DIS-003: candidate境界・退役hash・root不存在を相互に拘束する", () => {
    const readme = readFileSync(readmePath, "utf8");
    const cleanup = readFileSync(cleanupPath, "utf8");
    expect(readme).toContain(
      "候補文書だけで72件を承認・v1必須化・一括Issue化・実装済み扱いにしない",
    );
    expect(readme).toContain("「INV-001〜072 個別実施カード」");
    expect(cleanup).toContain(expectedIntakeDigest);
    expect(cleanup).toContain(
      "](candidates/development-investment-stage-directives-intake_v1.0.md)",
    );
    for (const source of retiredRootSources) {
      expect(cleanup).toContain(`\`${source}\``);
      expect(existsSync(resolve(root, source))).toBe(false);
    }
  });
});
