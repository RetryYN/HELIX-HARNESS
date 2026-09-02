import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkPlanSupersession } from "../src/doctor/index";
import {
  analyzePlanSupersession,
  type ParsedSupersedePlan,
  parseSupersedes,
  planCoreId,
} from "../src/lint/plan-supersession";

// PLAN-L7-89: 誤記対策 — confirmed PLAN の誤った主張を後継が直したとき、errata リンクが
// 双方向 (supersedes 宣言 + 原 PLAN の訂正 back-reference) であることを fail-close 強制する。

describe("planCoreId / parseSupersedes", () => {
  it("planCoreId は slug 付き plan_id を core 形へ畳む", () => {
    expect(planCoreId("PLAN-L7-87-merged-plan-status-kind-independent")).toBe("PLAN-L7-87");
    expect(planCoreId("PLAN-DISCOVERY-05-roadmap-registration")).toBe("PLAN-DISCOVERY-05");
    expect(planCoreId("PLAN-M-00")).toBe("PLAN-M-00");
  });

  it("U-SUPER-001: parseSupersedes は YAML list を抽出し path/.md を正規化、[] は無視", () => {
    const fm = [
      "---",
      "supersedes:",
      "  - docs/plans/PLAN-L7-86-x.md",
      "  - PLAN-L4-13",
      "---",
    ].join("\n");
    expect(parseSupersedes(fm)).toEqual(["PLAN-L7-86-x", "PLAN-L4-13"]);
    expect(parseSupersedes("---\nsupersedes: [PLAN-L7-86-x]\n---")).toEqual(["PLAN-L7-86-x"]);
    expect(parseSupersedes("---\nsupersedes: []\n---")).toEqual([]);
    expect(parseSupersedes("---\nkind: impl\n---")).toEqual([]);
  });
});

describe("analyzePlanSupersession", () => {
  function plan(over: Partial<ParsedSupersedePlan>): ParsedSupersedePlan {
    return {
      plan_id: "PLAN-X",
      frontmatter_valid: true,
      supersedes: [],
      superseded_by: [],
      content: "",
      ...over,
    };
  }

  it("U-SUPER-002: supersede 先が実在 + back-reference 有 → ok", () => {
    const r = analyzePlanSupersession([
      plan({ plan_id: "PLAN-L7-87-kind", supersedes: ["PLAN-L7-86-scope"] }),
      // 原 PLAN が後継の core-id (PLAN-L7-87) を訂正注記として含む。
      plan({ plan_id: "PLAN-L7-86-scope", superseded_by: ["PLAN-L7-87-kind"] }),
    ]);
    expect(r.ok).toBe(true);
  });

  it("supersede 先が実在しない → missingTargets violation", () => {
    const r = analyzePlanSupersession([
      plan({ plan_id: "PLAN-L7-87-kind", supersedes: ["PLAN-NOPE-99"] }),
    ]);
    expect(r.ok).toBe(false);
    expect(r.missingTargets[0]).toEqual({ plan_id: "PLAN-L7-87-kind", target: "PLAN-NOPE-99" });
  });

  it("supersede 先に back-reference が無い → missingBackrefs violation (片肺 errata)", () => {
    const r = analyzePlanSupersession([
      plan({ plan_id: "PLAN-L7-87-kind", supersedes: ["PLAN-L7-86-scope"] }),
      plan({ plan_id: "PLAN-L7-86-scope", content: "誤記のまま、後継への言及なし。" }),
    ]);
    expect(r.ok).toBe(false);
    expect(r.missingBackrefs[0]).toEqual({
      plan_id: "PLAN-L7-87-kind",
      target: "PLAN-L7-86-scope",
    });
  });

  it("supersedes 非宣言の PLAN は対象外 (prose 真偽は機械化しない)", () => {
    const r = analyzePlanSupersession([
      plan({ plan_id: "PLAN-A", content: "blast radius 0 と断定しているが supersede 宣言なし" }),
    ]);
    expect(r.ok).toBe(true);
  });

  it("U-SUPER-004: frontmatter parse失敗をsilent skipせずviolationにする", () => {
    const r = analyzePlanSupersession([plan({ plan_id: "PLAN-BROKEN", frontmatter_valid: false })]);
    expect(r.ok).toBe(false);
    expect(r.parseErrors).toEqual([{ plan_id: "PLAN-BROKEN" }]);
  });

  it("U-SUPER-003: 本文中の無関係なPLAN言及をback-referenceとして受理しない", () => {
    const r = analyzePlanSupersession([
      plan({ plan_id: "PLAN-L7-87-kind", supersedes: ["PLAN-L7-86-scope"] }),
      plan({ plan_id: "PLAN-L7-86-scope", content: "dependencies: PLAN-L7-87-kind" }),
    ]);
    expect(r.ok).toBe(false);
    expect(r.missingBackrefs).toHaveLength(1);
  });
});

describe("loadSupersedePlans + checkPlanSupersession", () => {
  function writePlan(
    root: string,
    name: string,
    body: string,
    supersedes?: string[],
    supersededBy?: string[],
  ): void {
    const fm = ["---", `plan_id: ${name.replace(/\.md$/, "")}`, "kind: troubleshoot"];
    if (supersedes) {
      fm.push("supersedes:");
      for (const s of supersedes) fm.push(`  - ${s}`);
    }
    if (supersededBy) {
      fm.push("superseded_by:");
      for (const successor of supersededBy) fm.push(`  - ${successor}`);
    }
    fm.push("---", "", body, "");
    writeFileSync(join(root, "docs", "plans", name), fm.join("\n"), "utf8");
  }

  it("双方向 errata は green / 片肺は violation", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-supersede-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      // 双方向 OK: 後継が supersedes 宣言、原が訂正 back-ref。
      writePlan(root, "PLAN-L7-87-kind.md", "kind 非依存化", ["PLAN-L7-86-scope"]);
      writePlan(root, "PLAN-L7-86-scope.md", "訂正済み。", undefined, ["PLAN-L7-87-kind"]);
      expect(checkPlanSupersession(root).ok).toBe(true);

      // 片肺: 原が後継へ言及しない → violation。
      writePlan(root, "PLAN-L7-86-scope.md", "誤記のまま。");
      const r = checkPlanSupersession(root);
      expect(r.ok).toBe(false);
      expect(r.messages.join("\n")).toContain("superseded_by");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("repo root が読めないと fail-close", () => {
    expect(checkPlanSupersession(join(tmpdir(), "helix-supersede-nope-zzz")).ok).toBe(false);
  });

  it("malformed YAMLをfail-closeする", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-supersede-malformed-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      writeFileSync(
        join(root, "docs", "plans", "PLAN-BROKEN.md"),
        "---\nplan_id: PLAN-BROKEN\nsupersedes: [\n---\n",
        "utf8",
      );
      const result = checkPlanSupersession(root);
      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("frontmatter構造解析失敗");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
