import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compareBytewise, escapeRegExp } from "../src/shared/string-utils";

describe("string utility 単一正本 (PLAN-L7-433 Q8)", () => {
  it("U-STRUTIL-001: regex metacharacterだけをescapeしてliteral matchを保証する", () => {
    const literal = "a.b+c? [x] (y) {z} ^$ | \\";
    expect(new RegExp(`^${escapeRegExp(literal)}$`).test(literal)).toBe(true);
    expect(escapeRegExp("plain-id_1")).toBe("plain-id_1");
  });

  it("U-STRUTIL-002: production escapeRegExp定義はsharedの1件だけ", () => {
    const paths = [
      "src/shared/string-utils.ts",
      "src/lint/doc-consistency.ts",
      "src/lint/semantic-frontier-consistency.ts",
      "src/lint/source-ledger-freshness.ts",
      "src/schema/design-declarations.ts",
    ];
    const definitions = paths.flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(/function\s+escapeRegExp\b/g)].map(() => path),
    );
    expect(definitions).toEqual(["src/shared/string-utils.ts"]);
  });

  it("U-STRUTIL-003: compareBytewiseはlocaleCompareが誤る2条件をcode-point順で解決する", () => {
    const NUL = String.fromCharCode(0);

    // 1. 既定 locale ですら code-point 順と符号が逆になる (Issue #309)。
    expect("aCode".localeCompare("BCode")).toBeLessThan(0);
    expect(compareBytewise("aCode", "BCode")).toBeGreaterThan(0);

    // 2. U+0000 は completely-ignorable のため、複合キーの区切りとして機能しない。
    //    異なる (code, pointer, message) 分割が照合上は等価になり、comparator が 0 を返す。
    //    0 を返すと Array#sort の安定性で入力順が残り、整列が入力順依存になる。
    const left = `AB${NUL}z`;
    const right = `A${NUL}Bz`;
    expect(left.localeCompare(right)).toBe(0);
    expect(compareBytewise(left, right)).not.toBe(0);
  });

  it("U-STRUTIL-004: compareBytewiseは全順序として整合する", () => {
    const values = ["", "A", "B", "a", "ab", "a-b", `a${String.fromCharCode(0)}b`, "あ", "🐙"];
    for (const left of values) {
      expect(compareBytewise(left, left)).toBe(0);
      for (const right of values) {
        // Object.is が 0 と -0 を区別するため、=== で符号の反対称性だけを見る。
        expect(
          Math.sign(compareBytewise(left, right)) === -Math.sign(compareBytewise(right, left)),
        ).toBe(true);
      }
    }
    const sorted = [...values].sort(compareBytewise);
    expect([...values].reverse().sort(compareBytewise)).toEqual(sorted);
  });
});
