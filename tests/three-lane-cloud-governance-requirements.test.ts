import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const l1Path = "docs/design/helix/L1-requirements/three-lane-cloud-governance-requests.md";
const l3Path =
  "docs/design/helix/L3-requirements/three-lane-cloud-governance-requirements.md";
const l10Path = "docs/test-design/helix/three-lane-cloud-governance-acceptance.md";
const planPath = "docs/plans/PLAN-L3-78-three-lane-cloud-governance-authority.md";

const read = (path: string): string => readFileSync(path, "utf8");
const ids = (text: string, pattern: RegExp): string[] => [...text.matchAll(pattern)].map((m) => m[1]);

describe("three-lane cloud governance candidate authority", () => {
  it("U-3LANE-001: keeps exact L1/L3/L10 identity sets", () => {
    const l1 = read(l1Path);
    const l3 = read(l3Path);
    const l10 = read(l10Path);

    expect(ids(l1, /^### (3L-BR-\d{3})\s/gmu)).toEqual(
      Array.from({ length: 9 }, (_, i) => `3L-BR-${String(i + 1).padStart(3, "0")}`),
    );
    expect(ids(l3, /^### (3L-FR-\d{3})\s/gmu)).toEqual(
      Array.from({ length: 8 }, (_, i) => `3L-FR-${String(i + 1).padStart(3, "0")}`),
    );
    expect(ids(l3, /`(3L-R-\d{2}) [^`]+`/gmu)).toEqual(
      Array.from({ length: 22 }, (_, i) => `3L-R-${String(i + 1).padStart(2, "0")}`),
    );
    expect(ids(l10, /\| `(3L-AC-\d{3})` \|/gmu)).toEqual(
      Array.from({ length: 24 }, (_, i) => `3L-AC-${String(i + 1).padStart(3, "0")}`),
    );
  });

  it("U-3LANE-002: fixes first-class lanes to Codex, Cursor Cloud, and Claude", () => {
    const l3 = read(l3Path);
    expect(l3).toContain("`codex_control`、`cursor_cloud_execution`、`claude_independent_review`");
    expect(l3).toContain("Grok、Kimi、Composerをrequested／effective model候補");
    expect(l3).not.toContain("Grok Build       Cursor     Codex Worker");
  });

  it("U-3LANE-003: separates budget, deterministic audit, and model qualification", () => {
    const l3 = read(l3Path);
    expect(l3).toContain("Cursor ModelsとOther Modelsのpool");
    expect(l3).toContain("モデル結果で上書きしない");
    expect(l3).toContain("称号、task qualification、GitHub authority、assignment roleを別field");
    expect(l3).toContain("GH-AUTHORITY/GH-BRANCH/GH-PR-SCOPE/GH-REVIEW-CI/GH-MERGE-CLOSURE/GH-GRAPH/GH-SECURITY");
  });

  it("U-3LANE-004: keeps the meaning-changing successor draft and does not reuse v0.3 approval", () => {
    const plan = read(planPath);
    expect(plan).toContain("status: draft");
    expect(plan).not.toContain("l3_human_approval:");
    expect(plan).toContain("本candidateへapprovalを流用しない");
  });

  it("U-3LANE-005: raw directives are not repository authority", () => {
    expect(existsSync("HELIX_THREE_LANE_CURSOR_CLOUD_RESOURCE_DISTRIBUTION_DIRECTIVE_v0.2.md")).toBe(
      false,
    );
    expect(existsSync("HELIX_THREE_LANE_GITHUB_AUDITOR_BENCHMARK_POLICY_v0.1.md")).toBe(false);
  });
});
