import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const paths = {
  l5: "docs/design/helix/L5-detail/layer-ledger-pair-gate.md",
  l6: "docs/design/helix/L6-function-design/layer-ledger-pair-gate.md",
  l8: "docs/test-design/helix/L5-layer-ledger-pair-gate-integration-test-design.md",
  l7: "docs/test-design/helix/L6-layer-ledger-pair-gate-unit-test-design.md",
  fixture: "docs/test-design/helix/fixtures/layer-ledger-pair-gate-case.manifest",
} as const;

const read = (path: string): string => readFileSync(path, "utf8");

const canonicalFailures = [
  "HIL_LAYER_VPAIR_L1_L12_MISSING",
  "HIL_LAYER_VPAIR_L2_L11_MISSING",
  "HIL_LAYER_VPAIR_L3_L10_MISSING",
  "HIL_LAYER_VPAIR_L4_L9_MISSING",
  "HIL_LAYER_VPAIR_L5_L8_MISSING",
  "HIL_LAYER_VPAIR_L6_L7_MISSING",
] as const;

describe("layer ledger canonical L1-L12 authority (PLAN-L7-713)", () => {
  it("U-LLPG-053: current設計・L8・fixtureを正規6 pairへ固定する", () => {
    const current = [paths.l5, paths.l6, paths.l8, paths.l7, paths.fixture].map(read).join("\n");

    for (const failure of canonicalFailures) {
      expect(current.match(new RegExp(failure, "g"))?.length ?? 0, failure).toBeGreaterThanOrEqual(
        5,
      );
    }
    for (const retired of [
      "HIL_LAYER_VPAIR_L0_L14_MISSING",
      "HIL_LAYER_VPAIR_L1_L14_MISSING",
      "HIL_LAYER_VPAIR_L2_L10_MISSING",
      "HIL_LAYER_VPAIR_L3_L12_MISSING",
    ]) {
      expect(current, retired).not.toContain(retired);
    }
  });

  it("U-LLPG-054: L0を層外anchor inputへ隔離しlegacy greenで相殺しない", () => {
    const l5 = read(paths.l5);
    const l6 = read(paths.l6);
    const fixture = read(paths.fixture);

    expect(l5).toContain("L0は層外authority anchor");
    expect(l6).toContain("compatibility input-only");
    expect(l6).toContain("canonical failureを相殺しない");
    expect(l6).toContain("HIL_LAYER_L0_ANCHOR_PROJECTION_INVALID");
    expect(fixture).toContain("HIL_LAYER_L0_ANCHOR_PROJECTION_INVALID");
  });

  it("U-LLPG-055: canonical pair fixtureのreceipt/case digestをbytesから再計算する", () => {
    const rows = read(paths.fixture)
      .split("\n")
      .filter((line) => /^\| `HST-CASE-032-0[2-8]`/.test(line));
    expect(rows).toHaveLength(7);

    for (const [index, row] of rows.entries()) {
      const cells = row.split("|").map((cell) => cell.trim());
      const canonicalBytes = cells[2]?.replace(/^`|`$/g, "") ?? "";
      const expectedCaseDigest = cells[3]?.replace(/^`|`$/g, "") ?? "";
      const value = JSON.parse(canonicalBytes) as {
        expected_receipt: unknown;
        expected_receipt_digest: string;
        expected_write_set: unknown[];
      };
      const receiptBytes = JSON.stringify(value.expected_receipt);

      expect(value.expected_write_set).toEqual([]);
      expect(createHash("sha256").update(receiptBytes).digest("hex")).toBe(
        value.expected_receipt_digest,
      );
      expect(createHash("sha256").update(canonicalBytes).digest("hex")).toBe(expectedCaseDigest);
      expect(canonicalBytes).toContain(
        index < 6 ? canonicalFailures[index] : "HIL_LAYER_L0_ANCHOR_PROJECTION_INVALID",
      );
    }
  });
});
