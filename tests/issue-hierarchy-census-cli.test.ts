// PLAN-RECOVERY-1736-issue-census-consumer
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function runCensus(input: unknown, extraArgs: string[] = []) {
  return spawnSync(
    process.execPath,
    [
      "--import",
      "tsx",
      "src/cli.ts",
      "github",
      "issue-hierarchy-census",
      "--input-json",
      JSON.stringify(input),
      ...extraArgs,
      "--json",
    ],
    { cwd: process.cwd(), encoding: "utf8", env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" } },
  );
}

describe("Issue hierarchy contract census CLI", () => {
  it("U-IHIER-022: 全入力Issueをtyped censusへ公開し入力境界をfail-closeする", () => {
    const mixedRun = runCensus([
      {
        number: 10,
        state: "open",
        body: `\`\`\`yaml
issue_role: task
parent_issue: 1
blocks: []
blocked_by: []
duplicate_search: completed
disposition: active
duplicate_of: null
\`\`\``,
      },
      { number: 11, state: "closed", body: "契約なし" },
    ]);

    expect(mixedRun.status).toBe(1);
    const report = JSON.parse(mixedRun.stdout) as Record<string, unknown>;
    expect(report).toMatchObject({
      schemaVersion: "helix-github-issue-hierarchy-contract-census.v1",
      ok: false,
      checkedIssues: 2,
    });
    expect(report.nodes).toEqual([expect.objectContaining({ number: 10, state: "open" })]);
    expect(report.findings).toEqual([
      expect.objectContaining({
        issueNumber: 11,
        code: "issue_hierarchy_contract_missing",
      }),
    ]);
    const validRun = runCensus([
      {
        number: 10,
        state: "open",
        body: `\`\`\`yaml
issue_role: root
parent_issue: null
blocks: []
blocked_by: []
duplicate_search: completed
disposition: active
duplicate_of: null
\`\`\``,
      },
    ]);

    expect(validRun.status).toBe(0);
    expect(JSON.parse(validRun.stdout)).toMatchObject({
      ok: true,
      checkedIssues: 1,
      findings: [],
    });
    const both = runCensus([], ["--repository", "RetryYN/HELIX-HARNESS"]);
    expect(both.status).toBe(1);
    expect(both.stderr).toContain("exactly one of --input-json or --repository is required");

    const invalid = runCensus([{ number: 0, state: "unknown", body: null }]);
    expect(invalid.status).toBe(1);
    expect(invalid.stderr).toContain("issue_hierarchy_census_source_invalid");
  });
});
