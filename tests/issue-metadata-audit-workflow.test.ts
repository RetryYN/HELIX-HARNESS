import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

// PLAN-L7-663-issue-metadata-scheduled-audit / PLAN-L7-670-issue-metadata-fail-close-oracle
// U-IMETA-WF-001 / U-IMETA-WF-003
const WORKFLOW_PATH = ".github/workflows/issue-metadata-audit.yml";

describe("Issue metadata scheduled audit workflow", () => {
  it("U-IMETA-WF-001: scheduled/workflow_dispatch専用のread-only監査をfail-closeで実行する", () => {
    const raw = readFileSync(WORKFLOW_PATH, "utf8");
    const workflow = parseYaml(raw) as {
      on?: {
        schedule?: Array<{ cron?: string }>;
        workflow_dispatch?: Record<string, unknown>;
        pull_request?: unknown;
        push?: unknown;
      };
      permissions?: Record<string, string>;
      jobs?: Record<
        string,
        {
          "timeout-minutes"?: number;
          "continue-on-error"?: boolean | string;
          steps?: Array<{
            run?: string;
            uses?: string;
            "continue-on-error"?: boolean | string;
            env?: Record<string, string>;
          }>;
        }
      >;
    };

    expect(workflow.on?.schedule).toEqual([{ cron: "23 3 * * *" }]);
    expect(workflow.on?.workflow_dispatch).toEqual({});
    expect(workflow.on?.pull_request).toBeUndefined();
    expect(workflow.on?.push).toBeUndefined();
    expect(workflow.permissions).toEqual({ contents: "read", issues: "read" });

    const job = workflow.jobs?.["issue-metadata-audit"];
    expect(job?.["timeout-minutes"]).toBe(10);
    expect(isFailOpenContinueOnError(job?.["continue-on-error"])).toBe(false);
    const auditStep = job?.steps?.find((step) => step.run?.includes("issue-metadata-audit"));
    expect(isFailOpenContinueOnError(auditStep?.["continue-on-error"])).toBe(false);
    expect(auditStep?.run).toContain('--repository "$GITHUB_REPOSITORY"');
    expect(auditStep?.run).toContain("--stale-hours 48");
    expect(auditStep?.run).toContain("--json");
    expect(hasFailOpenShellFallback(auditStep?.run)).toBe(false);
    expect(auditStep?.env).toEqual({ GH_TOKEN: "${" + "{ github.token }}" });
  });

  it("U-IMETA-WF-002: expression／whitespace fail-open mutationを拒否する", () => {
    const raw = readFileSync(WORKFLOW_PATH, "utf8");
    const trueExpression = "${" + "{ true }}";
    const expressionMutant = parseYaml(
      raw.replace(
        "    timeout-minutes: 10",
        `    timeout-minutes: 10\n    continue-on-error: ${trueExpression}`,
      ),
    ) as { jobs?: Record<string, { "continue-on-error"?: boolean | string }> };
    expect(
      isFailOpenContinueOnError(
        expressionMutant.jobs?.["issue-metadata-audit"]?.["continue-on-error"],
      ),
    ).toBe(true);

    const whitespaceMutant = parseYaml(raw.replace("--json", "--json ||    true")) as {
      jobs?: Record<string, { steps?: Array<{ run?: string }> }>;
    };
    const auditStep = whitespaceMutant.jobs?.["issue-metadata-audit"]?.steps?.find((step) =>
      step.run?.includes("issue-metadata-audit"),
    );
    expect(hasFailOpenShellFallback(auditStep?.run)).toBe(true);
  });

  it("U-IMETA-WF-003: shellの代表的な失敗握り潰し構文を個別に拒否する", () => {
    const mutants = [
      "--json || :",
      "--json; true",
      "set +e\n          npx --no-install tsx src/cli.ts github issue-metadata-audit --json",
    ];
    for (const mutant of mutants) expect(hasFailOpenShellFallback(mutant)).toBe(true);
  });
});

function isFailOpenContinueOnError(value: unknown): boolean {
  if (value === true) return true;
  return typeof value === "string" && /^\s*\$\{\{\s*true\s*\}\}\s*$/i.test(value);
}

function hasFailOpenShellFallback(value: unknown): boolean {
  return (
    typeof value === "string" &&
    /(?:\|\|\s*(?:true\b|:)(?=\s|$)|;\s*true\b|(?:^|\n)\s*set\s+\+e(?:\s|$))/i.test(value)
  );
}
