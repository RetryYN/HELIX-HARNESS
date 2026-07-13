import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeL6Completion,
  l6CompletionMessages,
  loadL6CompletionInputs,
} from "../src/lint/l6-completion";
import { hasDbcTable } from "../src/lint/shared";

const gatePass = `
| Gate | Status | Evidence |
|---|---|---|
| G6 | PASS | A-200 |
`;

const gateNotReached = `
| Gate | Status | Evidence |
|---|---|---|
| G6 | not reached | - |
`;

describe("L6 completion readiness", () => {
  it("日本語のcanonical DbC tableを英語見出しと同じunit-contract substanceとして認識する", () => {
    expect(
      hasDbcTable(
        "| 関数 / シグネチャ | 事前条件 | 事後条件 | 不変条件 | oracle |\n|---|---|---|---|---|",
      ),
    ).toBe(true);
    expect(hasDbcTable("| 関数 | 説明 |\n|---|---|")).toBe(false);
  });

  it("requires confirmed L6 docs, owning PLAN refs, unit-test-design doc refs, confirmed PLANs, confirmed unit design, and G6 PASS", () => {
    const result = analyzeL6Completion({
      l6Docs: [
        {
          path: "docs/design/harness/L6-function-design/function-spec.md",
          text: "status: draft\n",
        },
        {
          path: "docs/design/harness/L6-function-design/edge-case.md",
          text: "status: confirmed\n",
        },
      ],
      l6Plans: [
        {
          path: "docs/plans/PLAN-L6-01-function-spec.md",
          text: "plan_id: PLAN-L6-01-function-spec\nkind: design\nstatus: draft\n",
        },
      ],
      l7Text: "status: draft\n",
      unitTestDesignStatuses: {},
      gateText: gateNotReached,
    });

    expect(result.ready).toBe(false);
    expect(result.freezeInputReady).toBe(false);
    expect(result.draftDocs).toEqual(["docs/design/harness/L6-function-design/function-spec.md"]);
    expect(result.missingDocPlans).toEqual([
      "docs/design/harness/L6-function-design/edge-case.md",
      "docs/design/harness/L6-function-design/function-spec.md",
    ]);
    expect(result.missingDocPairArtifacts).toEqual([
      "docs/design/harness/L6-function-design/edge-case.md",
      "docs/design/harness/L6-function-design/function-spec.md",
    ]);
    expect(result.missingL7DocRefs).toEqual([
      "docs/design/harness/L6-function-design/edge-case.md",
      "docs/design/harness/L6-function-design/function-spec.md",
    ]);
    expect(result.weakContractDocs).toEqual([
      "docs/design/harness/L6-function-design/edge-case.md",
      "docs/design/harness/L6-function-design/function-spec.md",
    ]);
    expect(result.draftPlans).toEqual(["PLAN-L6-01-function-spec"]);
    expect(result.l7Status).toBe("draft");
    expect(result.g6Status).toBe("not reached");
    expect(l6CompletionMessages(result)[0]).toContain("not ready");
  });

  it("reports ready when all G6 readiness inputs are closed", () => {
    const result = analyzeL6Completion({
      l6Docs: [
        {
          path: "docs/design/harness/L6-function-design/function-spec.md",
          text: [
            "status: confirmed",
            "pair_artifact: docs/test-design/harness/closure-authority-production-route.md",
            "plan: docs/plans/PLAN-L6-01-function-spec.md",
            "L6 contract marker: planDraft(input: PlanDraftInput) => PlanDraftResult. DbC pre/post. L7 oracle family: U-FUNC-001.",
          ].join("\n"),
        },
      ],
      l6Plans: [
        {
          path: "docs/plans/PLAN-L6-01-function-spec.md",
          text: [
            "plan_id: PLAN-L6-01-function-spec",
            "kind: design",
            "status: confirmed",
            "review_evidence:",
            "  - reviewer: pmo-sonnet",
          ].join("\n"),
        },
      ],
      l7Text:
        "PAIR_PATH:docs/test-design/harness/closure-authority-production-route.md\nstatus: confirmed\nfunction-spec.md\n",
      unitTestDesignStatuses: {
        "docs/test-design/harness/closure-authority-production-route.md": "confirmed",
      },
      gateText: gatePass,
    });

    expect(result.ready).toBe(true);
    expect(result.freezeInputReady).toBe(true);
    expect(l6CompletionMessages(result)[0]).toContain("OK");
  });

  it("reports freeze-input readiness separately from final G6 completion", () => {
    const result = analyzeL6Completion({
      l6Docs: [
        {
          path: "docs/design/harness/L6-function-design/function-spec.md",
          text: [
            "status: draft",
            "pair_artifact: docs/test-design/harness/L8-unit-test-design.md",
            "plan: docs/plans/PLAN-L6-01-function-spec.md",
            "L6 contract marker: planDraft(input: PlanDraftInput) => PlanDraftResult. DbC pre/post. L7 oracle family: U-FUNC-001.",
          ].join("\n"),
        },
      ],
      l6Plans: [
        {
          path: "docs/plans/PLAN-L6-01-function-spec.md",
          text: "plan_id: PLAN-L6-01-function-spec\nkind: design\nstatus: draft\n",
        },
      ],
      l7Text:
        "PAIR_PATH:docs/test-design/harness/L8-unit-test-design.md\nstatus: draft\nfunction-spec.md\n",
      unitTestDesignStatuses: {
        "docs/test-design/harness/L8-unit-test-design.md": "confirmed",
      },
      gateText: gateNotReached,
    });

    expect(result.freezeInputReady).toBe(true);
    expect(result.ready).toBe(false);
    expect(l6CompletionMessages(result)).toContain(
      "l6-completion — freeze-inputs OK (trace/substance before status flip)",
    );
  });

  it("does not reopen base G6 completion for post-G6 add-design draft PLANs", () => {
    const result = analyzeL6Completion({
      l6Docs: [
        {
          path: "docs/design/harness/L6-function-design/function-spec.md",
          text: [
            "status: confirmed",
            "pair_artifact: docs/test-design/harness/L8-unit-test-design.md",
            "plan: docs/plans/PLAN-L6-01-function-spec.md",
            "L6 contract marker: planDraft(input: PlanDraftInput) => PlanDraftResult. DbC pre/post. L7 oracle family: U-FUNC-001.",
          ].join("\n"),
        },
      ],
      l6Plans: [
        {
          path: "docs/plans/PLAN-L6-01-function-spec.md",
          text: [
            "plan_id: PLAN-L6-01-function-spec",
            "kind: design",
            "status: confirmed",
            "review_evidence:",
            "  - reviewer: pmo-sonnet",
          ].join("\n"),
        },
        {
          path: "docs/plans/PLAN-L6-24-structured-error-handling.md",
          text: "plan_id: PLAN-L6-24-structured-error-handling\nkind: add-design\nstatus: draft\n",
        },
      ],
      l7Text:
        "PAIR_PATH:docs/test-design/harness/L8-unit-test-design.md\nstatus: confirmed\nfunction-spec.md\n",
      unitTestDesignStatuses: {
        "docs/test-design/harness/L8-unit-test-design.md": "confirmed",
      },
      gateText: gatePass,
    });

    expect(result.ready).toBe(true);
    expect(result.draftPlans).toEqual([]);
  });

  it("dedicated L8 pairはloaderがpath単位statusを保持し、draftでもtrace inputとして読める", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-l6-pair-status-"));
    const designDir = join(root, "docs/design/harness/L6-function-design");
    const testDir = join(root, "docs/test-design/harness");
    const planDir = join(root, "docs/plans");
    const governanceDir = join(root, "docs/governance");
    for (const dir of [designDir, testDir, planDir, governanceDir])
      mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(testDir, "dedicated.md"),
      "---\nlayer: L8\nsub_doc: unit-test-design\nstatus: draft\n---\nfunction-spec.md\n",
    );
    writeFileSync(
      join(testDir, "spoof.md"),
      "---\nlayer: L7\nsub_doc: unit-test-design\nstatus: confirmed\n---\nfunction-spec.md\n",
    );
    writeFileSync(join(governanceDir, "gate-design.md"), gatePass);
    const loaded = loadL6CompletionInputs(root);
    expect(loaded.unitTestDesignStatuses).toEqual({
      "docs/test-design/harness/dedicated.md": "draft",
    });
    expect(loaded.l7Text).not.toContain("spoof.md");
    const result = analyzeL6Completion({
      ...loaded,
      l6Docs: [
        {
          path: "docs/design/harness/L6-function-design/function-spec.md",
          text: "status: confirmed\npair_artifact: docs/test-design/harness/dedicated.md\n",
        },
      ],
    });
    expect(result.missingDocPairArtifacts).toEqual([]);
    expect(result.freezeInputReady).toBe(false); // contract本文が無く、traceだけで凍結可能にはしない
  });
});
