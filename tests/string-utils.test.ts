import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { escapeRegExp } from "../src/shared/string-utils";

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
});
