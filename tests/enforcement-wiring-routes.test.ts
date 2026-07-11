import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function run(args: string[]) {
  return spawnSync("bun", ["run", "src/cli.ts", ...args], { encoding: "utf8" });
}

describe("PLAN-L7-428 enforcement routes", () => {
  // U-WIRING-001
  it("PR route circuit breaker is reached by the real CLI", () => {
    const result = run([
      "github",
      "review-route",
      "--input-json",
      JSON.stringify({
        workerId: "same",
        workerRuntime: "codex",
        workerModel: "gpt",
        reviewEvidence: [
          {
            kind: "cross_agent",
            reviewerId: "same",
            reviewerRuntime: "codex",
            reviewerModel: "gpt",
            evidencePath: "",
          },
        ],
      }),
    ]);
    expect(result.status).toBe(1);
    expect(JSON.parse(result.stdout).findings.map((f: { code: string }) => f.code)).toContain(
      "worker_reviewer_same_identity",
    );
  });

  it("CI auto-fix threshold and release ADR decision are reached by real CLI routes", () => {
    const ci = run([
      "github",
      "ci-auto-fix-gate",
      "--input-json",
      JSON.stringify({ ciStatus: "red", confidence: 0.5, attempt: 0, failureKind: "test_failure" }),
    ]);
    expect(ci.status).toBe(1);
    expect(JSON.parse(ci.stdout).route).toBe("issue_escalation");

    const release = run([
      "github",
      "release-automation-decision",
      "--input-json",
      JSON.stringify({
        adrStatus: "missing",
        conventionalCommits: true,
        requiresPrReviewGate: true,
        requiresDryRun: true,
        mergeQueueEnabled: true,
      }),
    ]);
    expect(release.status).toBe(1);
    expect(JSON.parse(release.stdout).decision).toBe("blocked");
  });

  it("profile safety and generated config functions are reached by real CLI routes", () => {
    const safety = run(["mcp", "profile", "safety", "github-mcp-readonly", "--json"]);
    expect(safety.stdout).toContain("github-mcp-readonly");
    const config = run(["mcp", "profile", "config", "bun-unit", "--json"]);
    expect(config.status).toBe(0);
    expect(JSON.parse(config.stdout).content).toContain('"mcpServers"');
  });
});
