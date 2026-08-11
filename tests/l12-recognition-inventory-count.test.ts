import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("L12 recognition inventory prose count", () => {
  it("pins every seed-count sentence to the inventoried entry count", () => {
    // 既存の canonical authority test は PLAN-L3-31 の確定済み residual manifest が
    // file digest と case 分母を固定している。単独 errata の oracle は専用 file に分離し、
    // その historical receipt を書き換えずに現在の prose drift を fail-close する。
    const inventory = readFileSync(
      "docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md",
      "utf8",
    );
    const inventoried = [...inventory.matchAll(/^- `([^`]+)`$/gm)].map((match) => match[1]);
    const seedCounts = [...inventory.matchAll(/(\d+)\s*(?:件のseed|件は全候補|文書。)/g)].map(
      (match) => Number(match[1]),
    );

    // 3 文の一部だけが語形変更で抽出対象から外れる場合も、黙って green にしない。
    expect(seedCounts).toHaveLength(3);
    expect(seedCounts).toEqual(seedCounts.map(() => inventoried.length));
  });
});
