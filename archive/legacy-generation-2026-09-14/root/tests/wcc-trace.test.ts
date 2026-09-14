/**
 * WCC pair-authority exact-graph lint test (Issue #416 / PLAN-RECOVERY-32).
 *
 * Worker Common Contract の L3↔L10 pair を FR-01..09 / AC-01..07 / HAT-01..09 の
 * exact trace graph として固定し、欠落・重複・extra・mistrace を fail-close する。
 * U-WCC-PAIR-001。
 */
import { describe, expect, it } from "vitest";
import {
  analyzeWccTrace,
  extractAcToFr,
  extractHatEdges,
  extractWccAcIds,
  extractWccFrIds,
  extractWccHatIds,
  loadWccDocs,
  NO_FR_AC_ALLOWLIST,
  NO_FR_HAT_ALLOWLIST,
  wccTraceOk,
} from "../src/lint/wcc-trace";

describe("WCC pair-authority exact-graph (Issue #416)", () => {
  const docs = loadWccDocs();

  it("U-WCC-PAIR-001: current FR/AC/HAT の exact graph が orphan/mistrace 0 で閉じる", () => {
    const r = analyzeWccTrace(docs);
    expect(r.totals).toEqual({ fr: 9, ac: 7, hat: 9 });
    // 全 orphan/mistrace 配列が空
    expect(r.duplicateFr).toEqual([]);
    expect(r.duplicateAc).toEqual([]);
    expect(r.duplicateHat).toEqual([]);
    expect(r.acRefsUnknownFr).toEqual([]);
    expect(r.hatRefsUnknownFr).toEqual([]);
    expect(r.hatRefsUnknownAc).toEqual([]);
    expect(r.frWithoutAc).toEqual([]);
    expect(r.frWithoutHat).toEqual([]);
    expect(r.acWithoutHat).toEqual([]);
    expect(r.unexpectedNoFrAc).toEqual([]);
    expect(r.unexpectedNoFrHat).toEqual([]);
    expect(r.staleNoFrAcAllowlist).toEqual([]);
    expect(r.staleNoFrHatAllowlist).toEqual([]);
    expect(r.hatMistrace).toEqual([]);
    expect(r.hatOracleTraceMismatch).toEqual([]);
    expect(wccTraceOk(r)).toBe(true);
  });

  it("FR/AC/HAT の ID 集合が current 定義域に exact 一致する", () => {
    expect([...extractWccFrIds(docs.l3).keys()].sort()).toEqual(
      Array.from({ length: 9 }, (_, i) => `WCC-FR-${String(i + 1).padStart(2, "0")}`),
    );
    expect([...extractWccAcIds(docs.l3).keys()].sort()).toEqual(
      Array.from({ length: 7 }, (_, i) => `WCC-AC-${String(i + 1).padStart(2, "0")}`),
    );
    expect([...extractWccHatIds(docs.l10).keys()].sort()).toEqual(
      Array.from({ length: 9 }, (_, i) => `HAT-WCC-${String(i + 1).padStart(2, "0")}`),
    );
  });

  it("AC→FR / HAT→FR / HAT→AC の edge を exact に固定する", () => {
    const acToFr = extractAcToFr(docs.l3);
    expect(acToFr.get("WCC-AC-01")).toEqual(["WCC-FR-01", "WCC-FR-02"]);
    expect(acToFr.get("WCC-AC-02")).toEqual(["WCC-FR-03", "WCC-FR-04"]);
    expect(acToFr.get("WCC-AC-03")).toEqual(["WCC-FR-05", "WCC-FR-06"]);
    expect(acToFr.get("WCC-AC-04")).toEqual(["WCC-FR-07"]);
    expect(acToFr.get("WCC-AC-05")).toEqual(["WCC-FR-08"]);
    expect(acToFr.get("WCC-AC-06")).toEqual([]); // ガバナンスAC（FR無し）
    expect(acToFr.get("WCC-AC-07")).toEqual(["WCC-FR-09"]);

    const hat = extractHatEdges(docs.l10);
    expect(hat.get("HAT-WCC-04")).toEqual({ fr: ["WCC-FR-01", "WCC-FR-02"], ac: ["WCC-AC-01"] });
    expect(hat.get("HAT-WCC-05")).toEqual({ fr: [], ac: ["WCC-AC-06"] }); // ガバナンスHAT
    expect(hat.get("HAT-WCC-07")).toEqual({ fr: ["WCC-FR-05", "WCC-FR-06"], ac: ["WCC-AC-03"] });
    expect(hat.get("HAT-WCC-09")).toEqual({ fr: ["WCC-FR-09"], ac: ["WCC-AC-07"] });
  });

  it("FR無し allowlist は current 実体（AC-06 / HAT-05）と一致し stale でない", () => {
    expect(NO_FR_AC_ALLOWLIST).toEqual(["WCC-AC-06"]);
    expect(NO_FR_HAT_ALLOWLIST).toEqual(["HAT-WCC-05"]);
    const r = analyzeWccTrace(docs);
    expect(r.staleNoFrAcAllowlist).toEqual([]);
    expect(r.staleNoFrHatAllowlist).toEqual([]);
  });

  // --- mutation-oracle: seeded mutation で red 化することを実証 ---

  it("mutation: HAT が未定義FRを指すと hatRefsUnknownFr / hatMistrace が red 化する", () => {
    const mutated = {
      l3: docs.l3,
      l10: docs.l10.replace(
        "| `HAT-WCC-09` | `WCC-FR-09` | `WCC-AC-07` |",
        "| `HAT-WCC-09` | `WCC-FR-99` | `WCC-AC-07` |",
      ),
    };
    const r = analyzeWccTrace(mutated);
    expect(r.hatRefsUnknownFr).toContain("WCC-FR-99");
    // AC-07→FR-09 の和集合に FR-99 は無いため mistrace も立つ
    expect(r.hatMistrace.some((m) => m.startsWith("HAT-WCC-09:"))).toBe(true);
    expect(wccTraceOk(r)).toBe(false);
  });

  it("mutation: HAT trace 行を落とすと acWithoutHat / frWithoutHat が red 化する", () => {
    const mutated = {
      l3: docs.l3,
      l10: docs.l10.replace(/^\| `HAT-WCC-08` \| `WCC-FR-08` \| `WCC-AC-05` \|.*$/m, ""),
    };
    const r = analyzeWccTrace(mutated);
    expect(r.acWithoutHat).toContain("WCC-AC-05");
    expect(r.frWithoutHat).toContain("WCC-FR-08");
    expect(r.hatOracleTraceMismatch).toContain("oracle-only:HAT-WCC-08");
    expect(wccTraceOk(r)).toBe(false);
  });

  it("mutation: 想定外のFR無しHAT（allowlist外）は unexpectedNoFrHat で red 化する", () => {
    const mutated = {
      l3: docs.l3,
      l10: docs.l10.replace(
        "| `HAT-WCC-08` | `WCC-FR-08` | `WCC-AC-05` |",
        "| `HAT-WCC-08` | — | `WCC-AC-05` |",
      ),
    };
    const r = analyzeWccTrace(mutated);
    expect(r.unexpectedNoFrHat).toContain("HAT-WCC-08");
    expect(wccTraceOk(r)).toBe(false);
  });
});
