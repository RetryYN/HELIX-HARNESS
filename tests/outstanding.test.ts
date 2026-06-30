import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeOutstandingWork,
  completionReadinessForOutstanding,
  computeOutstandingWork,
  loadOutstandingPlanRows,
  type OutstandingPlanRow,
  outstandingSummaryLine,
} from "../src/lint/outstanding";

// IMP-139: 「未了の正の集計シグナル」(非終端 PLAN 層別 + open defer) の additive surface 回帰。

describe("analyzeOutstandingWork", () => {
  const rows: OutstandingPlanRow[] = [
    { layer: "L7", status: "draft" },
    { layer: "L7", status: "in_progress" },
    { layer: "cross", status: "draft" },
    { layer: "L4", status: "confirmed" }, // 終端 → 除外
    { layer: "L5", status: "completed" }, // 終端 → 除外
    { layer: "L6", status: "accepted" }, // 終端 → 除外
    { layer: "L3", status: "archived" }, // archived → 除外
  ];

  it("非終端のみを layer 別に集計し、終端/archived を除外する", () => {
    const o = analyzeOutstandingWork(rows, 2);
    expect(o.nonTerminalPlansByLayer).toEqual({ L7: 2, cross: 1 });
    expect(o.nonTerminalPlansTotal).toBe(3);
    expect(o.openDefers).toBe(2);
    expect(o.blockersByKind).toEqual({ active_draft: 3 });
    expect(o.items).toHaveLength(3);
    expect(o.completionReadiness).toMatchObject({
      ok: false,
      status: "blocked",
      blockers: ["active_draft", "non_terminal_plans", "open_defers"],
    });
  });

  it("layer key は昇順 (決定論順)", () => {
    const o = analyzeOutstandingWork(
      [
        { layer: "L9", status: "draft" },
        { layer: "L2", status: "draft" },
        { layer: "L5", status: "draft" },
      ],
      0,
    );
    expect(Object.keys(o.nonTerminalPlansByLayer)).toEqual(["L2", "L5", "L9"]);
  });

  it("layer 空は unknown へ寄せる", () => {
    const o = analyzeOutstandingWork([{ layer: "  ", status: "draft" }], 0);
    expect(o.nonTerminalPlansByLayer).toEqual({ unknown: 1 });
  });

  it("非終端 PLAN を意味別 blocker に分類する", () => {
    const o = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-M-02",
          layer: "L14",
          kind: "migration",
          status: "draft",
          text: "不可逆 state dir cutover は PO サインオフ後に実施する。",
        },
        {
          planId: "PLAN-L7-146",
          layer: "L7",
          kind: "impl",
          status: "draft",
          versionTarget: "future",
          text: "Cloudflare HMAC webhook access control activation requires human approval.",
        },
        {
          planId: "PLAN-DISCOVERY-10",
          layer: "cross",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          text: "S4 decision pending.",
        },
      ],
      0,
    );

    expect(o.blockersByKind).toEqual({
      human_approval_pending: 1,
      irreversible_migration_pending: 1,
      po_decision_pending: 2,
      version_up_parked: 1,
    });
    expect(o.items.map((item) => [item.planId, item.reason])).toEqual([
      ["PLAN-DISCOVERY-10", "po_decision_pending"],
      ["PLAN-L7-146", "version_up_parked"],
      ["PLAN-M-02", "irreversible_migration_pending"],
    ]);
    expect(o.items.map((item) => [item.planId, item.requiredAction])).toEqual([
      [
        "PLAN-DISCOVERY-10",
        "record the PO/S4 decision before promotion, rejection, or Forward merge",
      ],
      [
        "PLAN-L7-146",
        "keep parked until a future version-up activation decision is recorded; do not count this as active frontier completion",
      ],
      [
        "PLAN-M-02",
        "obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
      ],
    ]);
    expect(o.items.find((item) => item.planId === "PLAN-M-02")?.requiredEvidence).toContain(
      "PO signoff recorded on the migration PLAN",
    );
  });

  it("負の openDefers は 0 にクランプ / 全終端なら total=0", () => {
    const o = analyzeOutstandingWork([{ layer: "L7", status: "confirmed" }], -5);
    expect(o.nonTerminalPlansTotal).toBe(0);
    expect(o.nonTerminalPlansByLayer).toEqual({});
    expect(o.openDefers).toBe(0);
    expect(o.blockersByKind).toEqual({});
    expect(o.items).toEqual([]);
  });
});

describe("completionReadinessForOutstanding", () => {
  it("blocks whole-program completion while non-terminal PLANs or open defers remain", () => {
    const o = analyzeOutstandingWork(
      [
        {
          planId: "PLAN-M-02",
          layer: "L14",
          kind: "design",
          status: "draft",
          text: "irreversible cutover requires PO signoff and approval",
        },
      ],
      1,
    );

    expect(o.completionReadiness.ok).toBe(false);
    expect(o.completionReadiness.blockers).toEqual([
      "human_approval_pending",
      "irreversible_migration_pending",
      "non_terminal_plans",
      "open_defers",
    ]);
    expect(o.completionReadiness.reason).toContain("doctor green is not a substitute");
    expect(o.completionReadiness.requiredActions).toEqual(
      expect.arrayContaining([
        "obtain explicit PO signoff before irreversible migration/cutover; do not implement the state move as routine work",
        "resolve open placeholder/spec-backfill defers before claiming whole-program completion",
      ]),
    );
  });

  it("is ready only when non-terminal PLANs and open defers are zero", () => {
    expect(
      completionReadinessForOutstanding({
        nonTerminalPlansByLayer: {},
        nonTerminalPlansTotal: 0,
        versionUpParked: 0,
        activeDraftTotal: 0,
        openDefers: 0,
        blockersByKind: {},
        items: [],
      }),
    ).toEqual({
      ok: true,
      status: "ready",
      reason: "no non-terminal PLANs or open defers remain",
      blockers: [],
      requiredActions: [],
    });
  });
});

describe("outstandingSummaryLine", () => {
  it("非終端ありの 1 行サマリ", () => {
    expect(
      outstandingSummaryLine({
        nonTerminalPlansByLayer: { L7: 2, cross: 1 },
        nonTerminalPlansTotal: 3,
        versionUpParked: 0,
        activeDraftTotal: 3,
        openDefers: 1,
        blockersByKind: { active_draft: 3 },
        items: [],
        completionReadiness: {
          ok: false,
          status: "blocked",
          reason: "",
          blockers: [],
          requiredActions: [],
        },
      }),
    ).toBe(
      "outstanding: non-terminal PLANs=3 (L7:2, cross:1); blockers=active_draft:3; open defers=1",
    );
  });

  it("非終端ゼロは none 表記", () => {
    expect(
      outstandingSummaryLine({
        nonTerminalPlansByLayer: {},
        nonTerminalPlansTotal: 0,
        versionUpParked: 0,
        activeDraftTotal: 0,
        openDefers: 0,
        blockersByKind: {},
        items: [],
        completionReadiness: {
          ok: true,
          status: "ready",
          reason: "",
          blockers: [],
          requiredActions: [],
        },
      }),
    ).toBe("outstanding: non-terminal PLANs=0 (none); blockers=none; open defers=0");
  });
});

describe("loadOutstandingPlanRows + computeOutstandingWork", () => {
  function writePlan(
    root: string,
    name: string,
    layer: string,
    status: string,
    options: { body?: string; frontmatter?: Record<string, string> } = {},
  ): void {
    writeFileSync(
      join(root, "docs", "plans", name),
      [
        "---",
        `plan_id: ${name.replace(/\.md$/, "")}`,
        `layer: ${layer}`,
        `status: ${status}`,
        "kind: impl",
        ...Object.entries(options.frontmatter ?? {}).map(([key, value]) => `${key}: ${value}`),
        "---",
        "",
        `# ${name}`,
        options.body ?? "本文。",
      ].join("\n"),
      "utf8",
    );
  }

  it("docs/plans の frontmatter から layer/status を読み非終端を集計する", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-outstanding-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      writePlan(root, "PLAN-A.md", "L7", "draft");
      writePlan(root, "PLAN-B.md", "L7", "confirmed");
      writePlan(root, "PLAN-C.md", "cross", "in_progress");

      const rows = loadOutstandingPlanRows(root);
      expect(rows).toHaveLength(3);

      const o = computeOutstandingWork(root);
      expect(o.nonTerminalPlansByLayer).toEqual({ L7: 1, cross: 1 });
      expect(o.nonTerminalPlansTotal).toBe(2);
      expect(o.openDefers).toBe(0); // design/test-design 不在 → 0 (fail-open)
      expect(o.items.map((item) => item.planId)).toEqual(["PLAN-A", "PLAN-C"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("frontmatter/body から workflow blocker を分類する", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-outstanding-classify-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      writePlan(root, "PLAN-FUTURE.md", "L7", "draft", {
        frontmatter: { version_target: "future" },
        body: "Action-binding activation requires approval before external webhook use.",
      });
      writePlan(root, "PLAN-S3.md", "cross", "draft", {
        frontmatter: { workflow_phase: "S3" },
        body: "S4 decision pending.",
      });

      const o = computeOutstandingWork(root);
      expect(o.blockersByKind).toEqual({
        human_approval_pending: 1,
        po_decision_pending: 1,
        version_up_parked: 1,
      });
      expect(o.items.map((item) => [item.planId, item.reason])).toEqual([
        ["PLAN-FUTURE", "version_up_parked"],
        ["PLAN-S3", "po_decision_pending"],
      ]);
      expect(o.items[0]?.requiredEvidence).toContain(
        "version-up activation decision or rejection rationale",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("docs/plans 不在は空集計 (fail-open)", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-outstanding-empty-"));
    try {
      const o = computeOutstandingWork(root);
      expect(o.nonTerminalPlansTotal).toBe(0);
      expect(o.openDefers).toBe(0);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
