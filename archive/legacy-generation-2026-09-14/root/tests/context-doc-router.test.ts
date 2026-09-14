import { describe, expect, it } from "vitest";
import { buildDocIndex, routeDocContext } from "../src/context/doc-router";

const docs = [
  {
    path: "CLAUDE.md",
    text: [
      "# Read Order",
      "",
      "必ず正本 docs を読む。",
      "",
      "## 設計 trace",
      "",
      "要件、design、pair-freeze を確認する。",
      "",
      "## 実装 workflow",
      "",
      "feature implementation は targeted test と doctor を通す。",
      "",
      "## Recovery",
      "",
      "debug / error / doctor の失敗時は recovery 証跡を残す。",
      "",
    ].join("\n"),
  },
  {
    path: "docs/process/modes/discovery.md",
    text: [
      "# Discovery",
      "",
      "PoC spike は S4 判断へ進める。",
      "",
      "## Reverse audit",
      "",
      "reverse / audit / backfill は既存挙動を突合する。",
      "",
    ].join("\n"),
  },
];

describe("context doc router (PLAN-L7-315)", () => {
  it("builds a deterministic section index without rewriting canonical docs", () => {
    const index = buildDocIndex(docs);

    expect(index.sections.map((section) => `${section.doc_path}#${section.anchor}`)).toEqual([
      "CLAUDE.md#read-order",
      "CLAUDE.md#設計-trace",
      "CLAUDE.md#実装-workflow",
      "CLAUDE.md#recovery",
      "docs/process/modes/discovery.md#discovery",
      "docs/process/modes/discovery.md#reverse-audit",
    ]);
    expect(index.docs[0].text).toBe(docs[0].text);
  });

  it("selects relevant sections for the classified task kind", () => {
    const routed = routeDocContext({
      taskText: "add a new telemetry feature and implementation test",
      docs,
      maxSections: 2,
    });

    expect(routed.fail_open).toBe(false);
    expect(routed.task_kind).toBe("add-feature");
    expect(routed.sections.map((section) => section.heading)).toEqual(["実装 workflow"]);
    expect(routed.sections[0].text).toContain("targeted test");
  });

  it("fails open to whole canonical docs when no section matches", () => {
    const routed = routeDocContext({
      taskText: "add a new endpoint",
      docs: [{ path: "CLAUDE.md", text: "# unrelated\n\nmanual prose only" }],
    });

    expect(routed.fail_open).toBe(true);
    expect(routed.reason).toBe("no-matching-section");
    expect(routed.sections).toEqual([
      {
        doc_path: "CLAUDE.md",
        heading: "CLAUDE.md",
        level: 0,
        anchor: "document",
        text: "# unrelated\n\nmanual prose only",
      },
    ]);
  });

  it("fails open for unknown task kinds before section matching", () => {
    const routed = routeDocContext({
      taskText: "ponder the universe",
      docs,
    });

    expect(routed.fail_open).toBe(true);
    expect(routed.task_kind).toBe("unknown");
    expect(routed.reason).toBe("unknown-task-kind");
    expect(routed.sections.map((section) => section.heading)).toEqual([
      "CLAUDE.md",
      "docs/process/modes/discovery.md",
    ]);
  });

  it("keeps heading-less docs as whole-doc sections", () => {
    const index = buildDocIndex([{ path: "README.md", text: "plain canonical prose" }]);

    expect(index.sections).toEqual([
      {
        doc_path: "README.md",
        heading: "README.md",
        level: 0,
        anchor: "document",
        text: "plain canonical prose",
      },
    ]);
  });

  it("keeps source order and caps selected sections by maxSections", () => {
    const routed = routeDocContext({
      taskText: "design the L4 architecture trace",
      docs: [
        {
          path: "design.md",
          text: [
            "# First design",
            "",
            "design trace の最初の候補。",
            "",
            "# Second design",
            "",
            "design requirements の次候補。",
            "",
          ].join("\n"),
        },
      ],
      maxSections: 1,
    });

    expect(routed.fail_open).toBe(false);
    expect(routed.task_kind).toBe("design");
    expect(routed.sections.map((section) => section.heading)).toEqual(["First design"]);
  });
});
