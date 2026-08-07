// PLAN-L7-510-screen-applicability-core / U-SAP-001
import { describe, expect, it } from "vitest";
import type { ScreenPolicyV1 } from "../src/design/screen-applicability";
import { canonicalizeScreenScope } from "../src/design/screen-applicability";

const policy: ScreenPolicyV1 = {
  policy_id: "policy-1",
  revision: 1,
  capability_ids: ["cap-a", "cap-b"],
  rule_set_digest: "sha256:rule",
};

const rawScope = {
  snapshot_id: "snap-1",
  revision: 1,
  capability_ids: ["cap-b", "cap-a"],
  phase: "L2",
  public_surface_digest: "sha256:surface",
};

describe("U-SAP-001 canonicalizeScreenScope", () => {
  it("U-SAP-001: 同義入力（capability順序違い）は同一scope_digestへ正規化する", () => {
    const first = canonicalizeScreenScope(rawScope, policy);
    const second = canonicalizeScreenScope(
      { ...rawScope, capability_ids: ["cap-a", "cap-b"] },
      policy,
    );
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (first.ok && second.ok) {
      expect(first.value.scope_digest).toBe(second.value.scope_digest);
      expect(first.value.capability_ids).toEqual(["cap-a", "cap-b"]);
    }
  });

  it("重複capability IDはdedupしてstable sortする", () => {
    const result = canonicalizeScreenScope(
      { ...rawScope, capability_ids: ["cap-b", "cap-a", "cap-b"] },
      policy,
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.capability_ids).toEqual(["cap-a", "cap-b"]);
  });

  it.each([
    ["field欠落", { ...rawScope, capability_ids: undefined }],
    ["snapshot_id欠落", { ...rawScope, snapshot_id: undefined }],
    ["revision非整数", { ...rawScope, revision: 1.5 }],
    ["capability_ids空配列", { ...rawScope, capability_ids: [] }],
    ["capability_ids内空文字列", { ...rawScope, capability_ids: ["cap-a", ""] }],
    ["capability_idカンマ含有", { ...rawScope, capability_ids: ["cap-a,cap-b"] }],
    ["unknown capability", { ...rawScope, capability_ids: ["cap-a", "cap-zzz"] }],
    ["absolute locator", { ...rawScope, public_surface_digest: "/home/user/surface.md" }],
    ["phase不正", { ...rawScope, phase: "L4" }],
    ["非object入力", "not-an-object"],
  ])("%s をtyped failureで拒否する", (_label, raw) => {
    const result = canonicalizeScreenScope(raw, policy);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.length).toBeGreaterThan(0);
      expect(result.failures[0]?.code).toBe("HIL_SCREEN_APPLICABILITY_INVALID");
      expect(result.failures[0]?.evidence_digest).toMatch(/^sha256:/);
    }
  });
});
