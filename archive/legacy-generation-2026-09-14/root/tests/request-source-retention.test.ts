import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// PLAN-RECOVERY-1372-intake-source-cleanup
const root = resolve(import.meta.dirname, "..");
const retained = [
  [
    "design-grounding-human-convergence",
    ["6bb6b429f32833368a20c72f358cdfadec82992c4f9ec4729685f8a906c5b839"],
  ],
  [
    "requirement-formation-scoped-admission",
    [
      "b43789be1b09335b23fee40da87aba87d5d6f851ea31c0d1445f253d8816028d",
      "fd999154df042f810b4c738fa9b8391498d3883b2da003ae65183de4f47d57f5",
    ],
  ],
  [
    "world-governance",
    [
      "0e6804d20731581ccd20877e1a3ebaa9954d835d4cc8fef597e5f4da25885c08",
      "96e3abeeb175413e00bf544a561c02655c627b30e4c79e7d00109dbe8ac91137",
    ],
  ],
] as const;

function digest(source: string): string {
  const normalized = `${source
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd()}\n`;
  return createHash("sha256").update(normalized).digest("hex");
}

describe("要求原稿の保全", () => {
  it("U-RSC-001: 削除済み5原稿の全文・順序を保全し欠損や改変を許さない", () => {
    let count = 0;
    for (const [name, expected] of retained) {
      const source = readFileSync(
        resolve(root, `docs/governance/candidates/${name}-intake.md`),
        "utf8",
      );
      const blocks = [
        ...source.matchAll(/^(````|~~~~)(?:markdown|text)\r?\n([\s\S]*?)^\1[ \t]*$/gm),
      ].map((match) => match[2]);
      expect(blocks.map(digest)).toEqual([...expected]);
      count += blocks.length;
    }
    expect(count).toBe(5);
  });

  it("U-RSC-002: 台帳と削除記録の相互参照が実在する保全先へ解決する", () => {
    const report = resolve(root, "docs/governance/request-source-cleanup-2026-09-06.md");
    const source = readFileSync(report, "utf8");
    for (const [name] of retained) {
      const relative = `candidates/${name}-intake.md`;
      expect(source).toContain(`](${relative})`);
      const target = resolve(dirname(report), relative);
      expect(existsSync(target)).toBe(true);
      expect(readFileSync(target, "utf8")).toContain("](../request-source-cleanup-2026-09-06.md)");
    }
  });
});
