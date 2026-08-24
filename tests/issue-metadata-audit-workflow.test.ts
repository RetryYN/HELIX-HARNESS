import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse as parseYaml } from "yaml";

// PLAN-L7-663-issue-metadata-scheduled-audit / U-IMETA-WF-001
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
          "continue-on-error"?: boolean;
          steps?: Array<{
            run?: string;
            uses?: string;
            "continue-on-error"?: boolean;
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
    expect(job?.["continue-on-error"]).not.toBe(true);
    const auditStep = job?.steps?.find((step) => step.run?.includes("issue-metadata-audit"));
    expect(auditStep?.["continue-on-error"]).not.toBe(true);
    expect(auditStep?.run).toContain('--repository "$GITHUB_REPOSITORY"');
    expect(auditStep?.run).toContain("--stale-hours 48");
    expect(auditStep?.run).toContain("--json");
    expect(auditStep?.run).not.toContain("|| true");
    expect(auditStep?.env).toEqual({ GH_TOKEN: "${{ github.token }}" });
  });
});
