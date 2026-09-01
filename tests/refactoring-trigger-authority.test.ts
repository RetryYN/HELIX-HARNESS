import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const l3 = readFileSync(
  "docs/design/helix/L3-requirements/refactoring-trigger-admission-requirements.md",
  "utf8",
);
const l10 = readFileSync(
  "docs/test-design/helix/refactoring-trigger-admission-acceptance.md",
  "utf8",
);

describe("REFACTORING trigger authority", () => {
  it("binds Trigger Policy and RF0 admission to exact L3/L10 identities", () => {
    for (let index = 1; index <= 6; index += 1) {
      expect(l3).toContain(`RTG-R-${String(index).padStart(2, "0")}`);
    }
    for (let index = 1; index <= 12; index += 1) {
      const id = `RTG-AC-${String(index).padStart(3, "0")}`;
      expect(l10).toContain(id);
    }
    expect(l3.match(/^### RTG-R-\d{2}/gm)).toHaveLength(6);
    expect(l10.match(/^\| RTG-AC-\d{3}/gm)).toHaveLength(12);
  });

  it("rejects metric-only, safety-net-only, and semantic-change shortcuts", () => {
    expect(l3).toContain("LOC、file size、Issue数、AI評価、単一瞬間値だけでは候補を");
    expect(l3).toContain("scheduled safety-net単独ではsubstantive findingを作らず");
    expect(l3).toContain("意味変更はREFACTORINGへadmitせずREDESIGN／Requirement Re-entryへ");
    expect(l10).toContain("unknown scopeを`code_clean`へfallbackしない");
  });

  it("keeps requirement and definition scopes authority-pending", () => {
    expect(l3).toContain("Issue #1170のL3/L10が");
    expect(l3).toContain("`authority_pending`");
  });
});
