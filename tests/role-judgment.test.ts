import { describe, expect, it } from "vitest";
import {
  ROLE_JUDGMENT_HEADER,
  roleArchetypeFor,
  roleJudgmentBrief,
} from "../src/runtime/role-judgment";
import { ROLE_ARCHETYPE } from "../src/task/tier-router-policy";

describe("U-ROLEJUDG: role 判断ブリーフ (PLAN-L7-337)", () => {
  it("U-ROLEJUDG-001: ROLE_ARCHETYPE の正規 role と review/advisor alias を archetype へ解決する", () => {
    expect(roleArchetypeFor("se")).toBe("worker");
    expect(roleArchetypeFor("docs")).toBe("worker");
    expect(roleArchetypeFor("qa")).toBe("verify");
    expect(roleArchetypeFor("tl")).toBe("consult");
    expect(roleArchetypeFor("uiux")).toBe("consult");
    expect(roleArchetypeFor("code-reviewer")).toBe("verify");
    expect(roleArchetypeFor("security")).toBe("verify");
    expect(roleArchetypeFor("tl-advisor")).toBe("consult");
    expect(roleArchetypeFor(" QA ")).toBe("verify"); // trim + 大小無視
  });

  it("U-ROLEJUDG-002: 未知 role / 空 role は null (ただしブリーフは共通規律を返す)", () => {
    expect(roleArchetypeFor("unknown-role")).toBeNull();
    expect(roleArchetypeFor("")).toBeNull();
    expect(roleArchetypeFor(undefined)).toBeNull();
    const brief = roleJudgmentBrief("unknown-role");
    expect(brief).toContain(ROLE_JUDGMENT_HEADER);
    expect(brief).toContain("docs/skills/judgment-core.md");
  });

  it("U-ROLEJUDG-003: worker ブリーフは green 実測裏付けとスコープ規律を要求する", () => {
    const brief = roleJudgmentBrief("se");
    expect(brief).toContain("role archetype: worker");
    expect(brief).toContain("green な test / command の実測で裏付ける");
    expect(brief).toContain("スコープ規律");
  });

  it("U-ROLEJUDG-004: verify ブリーフは adversarial framing / severity-first / false positive 抑制を含む", () => {
    const brief = roleJudgmentBrief("reviewer");
    expect(brief).toContain("role archetype: verify");
    expect(brief).toContain("adversarial framing");
    expect(brief).toContain("severity-first");
    expect(brief).toContain("false positive 抑制");
  });

  it("U-ROLEJUDG-005: consult ブリーフは 4 点出力契約と対案必須・advisory-only を含む", () => {
    const brief = roleJudgmentBrief("tl");
    expect(brief).toContain("role archetype: consult");
    expect(brief).toContain("結論 / 根拠 / 残リスク / 次の一手");
    expect(brief).toContain("対案");
    expect(brief).toContain("実装・編集はしない");
  });

  it("U-ROLEJUDG-007: runtime 側 role→archetype 写しは tier-router ROLE_ARCHETYPE (正本) と全 role 一致する", () => {
    // runtime module は import 境界配慮で mapping を局所化しているため、正本との drift をここで機械固定する。
    for (const [role, archetype] of Object.entries(ROLE_ARCHETYPE)) {
      expect(roleArchetypeFor(role)).toBe(archetype);
    }
  });

  it("U-ROLEJUDG-006: 全ブリーフが escalation 境界 (正本参照) を必ず含む", () => {
    for (const role of ["se", "qa", "tl", "unknown"]) {
      const brief = roleJudgmentBrief(role);
      expect(brief).toContain("escalate");
      expect(brief).toContain("docs/skills/judgment-core.md");
    }
  });
});
