import { describe, expect, it } from "vitest";
import {
  analyzeDualProjection,
  dualProjectionMessages,
  isLegacyLayerToken,
  LAYER_PROJECTION_MAP,
  loadDualProjectionInput,
  projectLegacyLayer,
} from "../src/vmodel/layer-projection";

describe("L12 canonical layer projection (PLAN-L7-460-l12-dual-projection / HR-FR-VMCUT-02/05)", () => {
  it("[PLAN-L7-460] remap SSoT が legacy L0-L14 の全 15 layer を漏れなく被覆する", () => {
    const legacies = LAYER_PROJECTION_MAP.map((entry) => entry.legacy);
    expect(legacies).toEqual([
      "L0",
      "L1",
      "L2",
      "L3",
      "L4",
      "L5",
      "L6",
      "L7",
      "L8",
      "L9",
      "L10",
      "L11",
      "L12",
      "L13",
      "L14",
    ]);
    for (const entry of LAYER_PROJECTION_MAP) {
      const canonicalNumber = Number(entry.canonical.slice(1));
      expect(canonicalNumber).toBeGreaterThanOrEqual(1);
      expect(canonicalNumber).toBeLessThanOrEqual(12);
    }
  });

  it("[PLAN-L7-460] 縮退 remap (L5/旧L6→L5, L13/L14→L12, L0→L1, L7→L6) を保持する", () => {
    expect(projectLegacyLayer("L0")?.canonical).toBe("L1");
    expect(projectLegacyLayer("L5")?.canonical).toBe("L5");
    expect(projectLegacyLayer("L6")?.canonical).toBe("L5");
    expect(projectLegacyLayer("L7")?.canonical).toBe("L6");
    expect(projectLegacyLayer("L13")?.canonical).toBe("L12");
    expect(projectLegacyLayer("l14")?.canonical).toBe("L12");
    expect(projectLegacyLayer("L15")).toBeNull();
  });

  it("U-VMCUT-001: remap に無い legacy L-token は fail-close で violation になる", () => {
    const result = analyzeDualProjection({
      observedLayers: [
        { token: "L7", source: "plan:a.md" },
        { token: "L99", source: "design-dir:L99-future" },
      ],
    });
    expect(result.ok).toBe(false);
    expect(result.unmapped).toEqual([{ token: "L99", source: "design-dir:L99-future" }]);
    const [message] = dualProjectionMessages(result);
    expect(message).toContain("violation");
    expect(message).toContain("L99@design-dir:L99-future");
  });

  it("[PLAN-L7-460] 非 L-token (cutover 等) は projection 対象外として無視する", () => {
    expect(isLegacyLayerToken("cutover")).toBe(false);
    expect(isLegacyLayerToken("L12")).toBe(true);
    const result = analyzeDualProjection({
      observedLayers: [
        { token: "cutover", source: "plan:PLAN-M-01.md" },
        { token: "L3", source: "plan:b.md" },
      ],
    });
    expect(result.ok).toBe(true);
    expect(result.rows).toEqual([
      { legacy: "L3", canonical: "L3", canonicalLabel: "要件freeze", count: 1 },
    ]);
  });

  it("[PLAN-L7-460] 実 repo の走査で unmapped 0 の二重表示 summary が出る", () => {
    const result = analyzeDualProjection(loadDualProjectionInput());
    expect(result.unmapped).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.rows.length).toBeGreaterThan(0);
    const [message] = dualProjectionMessages(result);
    expect(message).toContain("OK");
    expect(message).toContain("二重表示 legacy→canonical");
  });
});
