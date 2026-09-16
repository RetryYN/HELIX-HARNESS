import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { uniqueLocaleSorted, uniqueSorted } from "../src/shared/collection-utils";

describe("collection utility 単一正本 (PLAN-L7-433 Q8)", () => {
  it("U-COLUTIL-001: machine tokenを重複除去してcode-unit順へ固定する", () => {
    expect(uniqueSorted(["z", "A", "a", "A", "10", "2"])).toEqual(["10", "2", "A", "a", "z"]);
  });

  it("U-COLUTIL-002: locale順契約を別名で保持し定義重複を防ぐ", () => {
    const values = ["z", "a", "z", "b"];
    expect(uniqueLocaleSorted(values)).toEqual(
      [...new Set(values)].sort((a, b) => a.localeCompare(b)),
    );
    const paths = [
      "src/shared/collection-utils.ts",
      "src/lint/change-impact.ts",
      "src/lint/proposal-document-coverage.ts",
      "src/lint/verification-profile.ts",
      "src/workflow/design-elicitation.ts",
    ];
    const definitions = paths.flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(/function\s+uniqueSorted\b/g)].map(() => path),
    );
    expect(definitions).toEqual(["src/shared/collection-utils.ts"]);
  });
});
