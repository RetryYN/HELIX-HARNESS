import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const requirementPath = "docs/design/helix/L3-requirements/helix-bench-evaluation.md";
const acceptancePath = "docs/test-design/helix/helix-bench-evaluation-acceptance.md";
const planPath = "docs/plans/PLAN-L3-49-helix-bench-evaluation.md";

const requirement = readFileSync(requirementPath, "utf8");
const acceptance = readFileSync(acceptancePath, "utf8");
const plan = readFileSync(planPath, "utf8");

const categories = [
  "Requirement Binding",
  "Design Trace",
  "Controlled Implementation",
  "Review Convergence",
  "Cost & Capacity",
];

const metrics = [
  "Task Success Rate",
  "Scope Violation Rate",
  "Requirement Drift Rate",
  "Design Trace Completeness",
  "Test Adequacy",
  "Review Blocker Count",
  "Review Rounds",
  "CI Rerun Count",
  "Time to Lane Ready",
  "Parent Token Reduction",
  "Cost per Accepted Change",
  "Merge Acceptance Rate",
];

describe("HELIX-Bench L3/L10 evaluation contract", () => {
  it("HELIX-BENCH-U-001: exposes the exact five categories and twelve metrics", () => {
    const categoryBlock = requirement.match(/benchmark_categories:\n((?: {2}- [^\n]+\n)+)/)?.[1];
    const metricBlock = requirement.match(/benchmark_metrics:\n((?: {2}- [^\n]+\n)+)/)?.[1];
    expect(categoryBlock?.match(/(?<= {2}- ).+/g)).toEqual(categories);
    expect(metricBlock?.match(/(?<= {2}- ).+/g)).toEqual(metrics);
  });

  it("HELIX-BENCH-U-002: keeps comparison and workflow axes independent", () => {
    expect(requirement).toContain("`team_composition`と`harness_profile`を直交させる");
    for (const marker of [
      "development style",
      "case-driven model",
      "specialist capability",
      "runtime mode",
      "team composition",
      "harness profile",
    ]) {
      expect(requirement).toContain(marker);
    }
    expect(acceptance).toContain(
      "ScrumへPoCを内包、Design HARNESSをstyle化、team構成をruntime mode化したらfail",
    );
  });

  it("HELIX-BENCH-U-003: binds the exact reproducibility snapshot", () => {
    const block = requirement.match(/required_task_snapshot:\n((?: {2}- [a-z_]+\n)+)/)?.[1];
    expect(block?.match(/(?<= {2}- ).+/g)).toEqual([
      "task_id",
      "task_version",
      "fixture_digest",
      "requirement_ids",
      "acceptance_ids",
      "base_head",
      "allowed_paths",
      "forbidden_paths",
      "hidden_oracle_digest",
      "seed",
      "toolchain_versions",
      "timeout_policy",
      "retry_policy",
      "cache_policy",
      "hardware_class",
    ]);
  });

  it("HELIX-BENCH-U-004: fails closed on bias, leakage, missing cost, and hidden failures", () => {
    for (const marker of [
      "固定加点・減点に使わない",
      "hidden oracleをworker contextへ渡さない",
      "費用欠測を0円にしない",
      "平均点で相殺しない",
      "historical result",
    ]) {
      expect(requirement).toContain(marker);
    }
  });

  it("HELIX-BENCH-U-005: derives scores from evidence instead of self claims", () => {
    expect(requirement).toContain(
      "artifact、diff、test、negative oracle、independent review、CI、DB、",
    );
    expect(requirement).toContain("raw receiptから再計算可能");
    expect(acceptance).toContain("model自己申告またはprose verdictだけでsuccessにしたらfail");
  });

  it("HELIX-BENCH-U-006: keeps worker admission as a lower-level reusable receipt", () => {
    expect(requirement).toContain("`HR-FR-HIL-22`／`WCC-FR-07`〜`WCC-FR-08`");
    expect(requirement).toContain("下位bench");
    expect(requirement).toContain("重複実装せず");
    expect(acceptance).toContain("system/team benchと責務分離");
  });

  it("HELIX-BENCH-U-007: exposes fourteen paired acceptance oracles", () => {
    expect(
      [...acceptance.matchAll(/\| `(HELIX-BENCH-AC-\d{3})` \|/g)].map((row) => row[1]),
    ).toEqual(
      Array.from(
        { length: 14 },
        (_, index) => `HELIX-BENCH-AC-${String(index + 1).padStart(3, "0")}`,
      ),
    );
  });

  it("HELIX-BENCH-U-008: binds one atomic behavior contract without implementation", () => {
    expect(plan).toContain("behavior_contract_id: HELIX-BENCH-FR-001");
    expect(plan).toContain("responsibility_owner: helix-benchmark-evaluation-authority");
    expect(plan).toContain("github_issue_id: 251");
    expect(plan).toContain("runner、dataset、dashboard、provider接続を実装しない");
  });
});
