import { describe, expect, it } from "vitest";
import { validateUiProfile } from "../src/design/ui-domain-pattern-profile";
import { validProfile } from "./tools/ui-domain-fixture";

// PLAN-L7-520-ui-domain-core: UI Domain slice1。L8テスト設計 U-UDP-004 行を機械検査する。

describe("ui-domain profile validation (PLAN-L7-520)", () => {
  it("U-UDP-004: profile必須要素の欠落を全列挙fail-closeし、完備profileはgreen", () => {
    const green = validateUiProfile(validProfile());
    expect(green.ok, JSON.stringify(green)).toBe(true);
    if (green.ok) {
      expect(green.value.profile_id).toBe("PRF-helix-central");
      expect(green.value.profile_digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    }

    // 欠落を全列挙（mutation: 必須判定の各枝を外すと red）
    const broken = validProfile();
    broken.information_priority = [];
    broken.motion = { budget_ms: 0, reduced_motion_alternative: "" };
    broken.accessibility = { focus_order: [], contrast_class: "", aria_required: [] };
    const failed = validateUiProfile(broken);
    expect(failed.ok).toBe(false);
    if (!failed.ok) {
      expect(failed.failures.length).toBeGreaterThanOrEqual(4);
      expect(failed.failures.every((f) => f.code === "UDP_PROFILE_INCOMPLETE")).toBe(true);
    }

    // 個別欠落: reduced-motion 代替のみ欠落しても fail-close
    const noReduced = validProfile();
    noReduced.motion = { budget_ms: 200, reduced_motion_alternative: "" };
    expect(validateUiProfile(noReduced).ok).toBe(false);

    // surface 分類逸脱・PRF- prefix 逸脱・schema 不一致
    expect(validateUiProfile({ ...validProfile(), surface_class: "decorative" as never }).ok).toBe(
      false,
    );
    expect(validateUiProfile({ ...validProfile(), profile_id: "PROFILE-x" }).ok).toBe(false);
    const badSchema = validateUiProfile({
      ...validProfile(),
      schema_version: "ui-profile.v0" as never,
    });
    expect(badSchema.ok).toBe(false);
    if (!badSchema.ok) expect(badSchema.failures[0]?.code).toBe("UDP_STALE_INPUT");
  });
});
