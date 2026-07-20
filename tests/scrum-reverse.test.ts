import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeScrumReverse,
  loadReverseSeedMarkers,
  loadSrPlans,
  type ParsedSrPlan,
  parseLinks,
  parseSrPlan,
  scrumReverseMessages,
} from "../src/lint/scrum-reverse";

function plan(over: Partial<ParsedSrPlan>): ParsedSrPlan {
  return {
    file: `${over.plan_id ?? "PLAN-X"}.md`,
    plan_id: over.plan_id ?? "PLAN-X",
    kind: "poc",
    status: "confirmed",
    decision_outcome: "confirmed",
    promotion_strategy: "reuse-with-hardening",
    links: [],
    generates: [],
    created: "2026-07-06",
    ...over,
  };
}

describe("U-SCRUMREV-001 parseLinks / parseSrPlan", () => {
  it("requires + references を 1 集合へ / frontmatter 抽出 (inline コメント除去)", () => {
    const content = `---
plan_id: PLAN-DISCOVERY-09-x
kind: poc
status: confirmed
decision_outcome: confirmed  # PO 授権
promotion_strategy: reuse-with-hardening
dependencies:
  requires:
    - docs/plans/PLAN-A.md
  references:
    - docs/plans/PLAN-B.md
---`;
    expect(parseLinks(content)).toEqual(["docs/plans/PLAN-A.md", "docs/plans/PLAN-B.md"]);
    const p = parseSrPlan("PLAN-DISCOVERY-09-x.md", content);
    expect(p.kind).toBe("poc");
    expect(p.decision_outcome).toBe("confirmed");
    expect(p.promotion_strategy).toBe("reuse-with-hardening");
  });
});

describe("U-SCRUMREV-002 pocOrphans", () => {
  it("confirmed poc (reuse-with-hardening) を指す reverse が無い → orphan + ok=false", () => {
    const r = analyzeScrumReverse([plan({ plan_id: "PLAN-DISCOVERY-09-x" })]);
    expect(r.pocOrphans).toHaveLength(1);
    expect(r.ok).toBe(false);
  });

  it("confirmed poc を requires/references する reverse が有る → 孤児なし", () => {
    const r = analyzeScrumReverse([
      plan({ plan_id: "PLAN-DISCOVERY-09-x" }),
      plan({
        plan_id: "PLAN-REVERSE-09-x",
        kind: "reverse",
        decision_outcome: null,
        promotion_strategy: null,
        links: ["docs/plans/PLAN-DISCOVERY-09-x.md"],
        // terminal reverse は正本 artifact 必須 (U-SCRUMREV-006) のため fixture にも持たせる。
        generates: [
          "docs/plans/PLAN-REVERSE-09-x.md",
          "docs/governance/helix-harness-concept_v3.1.md",
        ],
      }),
    ]);
    expect(r.pocOrphans).toHaveLength(0);
    expect(r.ok).toBe(true);
  });

  it("promotion_strategy=redesign の confirmed poc は Reverse 不要 → 孤児にしない", () => {
    const r = analyzeScrumReverse([
      plan({ plan_id: "PLAN-DISCOVERY-02-x", promotion_strategy: "redesign" }),
    ]);
    expect(r.pocOrphans).toHaveLength(0);
    expect(r.ok).toBe(true);
  });

  it("confirmed でない poc (pivot) は orphan 対象外", () => {
    const r = analyzeScrumReverse([
      plan({ plan_id: "PLAN-DISCOVERY-09-x", decision_outcome: "pivot" }),
    ]);
    expect(r.pocOrphans).toHaveLength(0);
  });
});

describe("U-SCRUMREV-003 badReverseRefs", () => {
  it("reverse が confirmed でない poc (pivot) を参照 → bad + ok=false", () => {
    const r = analyzeScrumReverse([
      plan({ plan_id: "PLAN-DISCOVERY-09-x", decision_outcome: "pivot" }),
      plan({
        plan_id: "PLAN-REVERSE-09-x",
        kind: "reverse",
        decision_outcome: null,
        promotion_strategy: null,
        links: ["docs/plans/PLAN-DISCOVERY-09-x.md"],
      }),
    ]);
    expect(r.badReverseRefs).toHaveLength(1);
    expect(r.badReverseRefs[0].outcome).toBe("pivot");
    expect(r.ok).toBe(false);
  });

  it("archived は対象外", () => {
    const r = analyzeScrumReverse([plan({ plan_id: "PLAN-DISCOVERY-09-x", status: "archived" })]);
    expect(r.ok).toBe(true);
  });
});

describe("U-SCRUMREV-004 messages", () => {
  it("孤児なし → OK / 孤児あり → warn 文言", () => {
    expect(scrumReverseMessages(analyzeScrumReverse([])).some((m) => m.includes("OK"))).toBe(true);
    expect(
      scrumReverseMessages(analyzeScrumReverse([plan({ plan_id: "PLAN-DISCOVERY-09-x" })])).some(
        (m) => m.includes("Reverse 合流が無い"),
      ),
    ).toBe(true);
  });
});

describe("U-SCRUMREV-005 実 repo の scrum-reverse 整合 (回帰ガード)", () => {
  it("confirmed poc は全て Reverse 合流済 (redesign 除く) / reverse 参照は confirmed poc のみ", () => {
    const r = analyzeScrumReverse(loadSrPlans());
    expect({ pocOrphans: r.pocOrphans, badReverseRefs: r.badReverseRefs }).toEqual({
      pocOrphans: [],
      badReverseRefs: [],
    });
  });
});

describe("U-SCRUMREV-006 emptyReverseFullbacks (空 fullback 禁止)", () => {
  const confirmedPoc = plan({ plan_id: "PLAN-DISCOVERY-09-x" });
  const reverseBase: Partial<ParsedSrPlan> = {
    kind: "reverse",
    decision_outcome: null,
    promotion_strategy: null,
    links: ["docs/plans/PLAN-DISCOVERY-09-x.md"],
  };

  it("terminal reverse が generates 自 doc のみ → 空 fullback violation + ok=false", () => {
    const r = analyzeScrumReverse([
      confirmedPoc,
      plan({
        ...reverseBase,
        plan_id: "PLAN-REVERSE-09-x",
        status: "confirmed",
        generates: ["docs/plans/PLAN-REVERSE-09-x.md"],
      }),
    ]);
    expect(r.emptyReverseFullbacks).toEqual(["PLAN-REVERSE-09-x"]);
    expect(r.ok).toBe(false);
  });

  it("正本 artifact を generates に持つ terminal reverse は OK / draft reverse は検査対象外", () => {
    const withCanonical = analyzeScrumReverse([
      confirmedPoc,
      plan({
        ...reverseBase,
        plan_id: "PLAN-REVERSE-09-x",
        status: "confirmed",
        generates: [
          "docs/plans/PLAN-REVERSE-09-x.md",
          "docs/governance/helix-harness-concept_v3.1.md",
        ],
      }),
    ]);
    expect(withCanonical.emptyReverseFullbacks).toEqual([]);
    expect(withCanonical.ok).toBe(true);

    const draft = analyzeScrumReverse([
      confirmedPoc,
      plan({
        ...reverseBase,
        plan_id: "PLAN-REVERSE-09-x",
        status: "draft",
        generates: ["docs/plans/PLAN-REVERSE-09-x.md"],
      }),
    ]);
    expect(draft.emptyReverseFullbacks).toEqual([]);
  });

  it("enforcement 境界より前に起票された legacy reverse は grandfather (日付 ratchet)", () => {
    const r = analyzeScrumReverse([
      confirmedPoc,
      plan({
        ...reverseBase,
        plan_id: "PLAN-REVERSE-02-legacy",
        status: "confirmed",
        created: "2026-06-01",
        generates: ["docs/plans/PLAN-REVERSE-02-legacy.md"],
      }),
    ]);
    expect(r.emptyReverseFullbacks).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("created 欠落の terminal reverse は legacy 扱いにせず fail-close する", () => {
    const r = analyzeScrumReverse([
      confirmedPoc,
      plan({
        ...reverseBase,
        plan_id: "PLAN-REVERSE-09-missing-created",
        status: "confirmed",
        created: null,
        generates: ["docs/plans/PLAN-REVERSE-09-missing-created.md"],
      }),
    ]);
    expect(r.emptyReverseFullbacks).toEqual(["PLAN-REVERSE-09-missing-created"]);
    expect(r.ok).toBe(false);
  });
});

describe("U-SCRUMREV-007 unresolvedSeedMarkers (trace seed 変換漏れ)", () => {
  const marker = {
    docPath: "docs/governance/helix-harness-concept_v3.1.md",
    line: 331,
    planId: "PLAN-DISCOVERY-09-x",
  };
  const confirmedPoc = plan({ plan_id: "PLAN-DISCOVERY-09-x" });
  const reverseOf = (status: string) =>
    plan({
      plan_id: "PLAN-REVERSE-09-x",
      kind: "reverse",
      status,
      decision_outcome: null,
      promotion_strategy: null,
      links: ["docs/plans/PLAN-DISCOVERY-09-x.md"],
      generates: [
        "docs/plans/PLAN-REVERSE-09-x.md",
        "docs/governance/helix-harness-concept_v3.1.md",
      ],
    });

  it("参照 poc の reverse が terminal なのに seed marker が残る → violation", () => {
    const r = analyzeScrumReverse([confirmedPoc, reverseOf("confirmed")], [marker]);
    expect(r.unresolvedSeedMarkers).toEqual([
      "docs/governance/helix-harness-concept_v3.1.md:331:PLAN-DISCOVERY-09-x",
    ]);
    expect(r.ok).toBe(false);
  });

  it("reverse が draft の間 (変換作業中) は violation にしない", () => {
    const r = analyzeScrumReverse([confirmedPoc, reverseOf("draft")], [marker]);
    expect(r.unresolvedSeedMarkers).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("loader: PoC 段階 seed 行から planId/行番号を抽出する (合成 fixture)", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-seed-"));
    try {
      mkdirSync(join(root, "docs", "governance"), { recursive: true });
      writeFileSync(
        join(root, "docs", "governance", "requirements-doc-registry.json"),
        JSON.stringify({
          schema: "requirements-doc-registry.v1",
          canonical: "docs/governance/helix-harness-requirements_v1.3.md",
          compatibility: "docs/governance/helix-harness-requirements_v1.2.md",
        }),
        "utf8",
      );
      writeFileSync(
        join(root, "docs", "governance", "helix-harness-concept_v3.1.md"),
        "# t\n\n> **trace seed (PO 承認、PoC 段階)**: `docs/plans/PLAN-DISCOVERY-09-x.md` が PoC 中。\n",
        "utf8",
      );
      const markers = loadReverseSeedMarkers(root);
      expect(markers).toEqual([
        {
          docPath: "docs/governance/helix-harness-concept_v3.1.md",
          line: 3,
          planId: "PLAN-DISCOVERY-09-x",
        },
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("live repo: seed marker は fullback で変換済み、legacy 空 fullback は日付 ratchet で grandfather", () => {
    const r = analyzeScrumReverse(loadSrPlans(), loadReverseSeedMarkers());
    expect(r.unresolvedSeedMarkers).toEqual([]);
    // EMPTY_FULLBACK_ENFORCEMENT_DATE 前に起票された legacy reverse (25 件) は grandfather され、
    // 境界以降に起票する terminal reverse から fail-close する (CI green を壊さない段階移行)。
    expect(r.emptyReverseFullbacks).toEqual([]);
    expect(r.ok).toBe(true);
  });
});
