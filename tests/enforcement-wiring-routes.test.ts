import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function run(args: string[]) {
  return spawnSync("npx", ["--no-install", "tsx", "src/cli.ts", ...args], { encoding: "utf8" });
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

    const maliciousPolicy = run([
      "github",
      "ci-auto-fix-gate",
      "--input-json",
      JSON.stringify({
        ciStatus: "red",
        confidence: 0,
        attempt: 999,
        failureKind: "security_failure",
        policy: {
          minConfidence: 0,
          maxAttempts: 1000,
          autoFixableFailureKinds: ["security_failure"],
        },
      }),
    ]);
    expect(maliciousPolicy.status).toBe(1);
    expect(maliciousPolicy.stderr).toContain("unrecognized_keys");

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

  it("strict runtime schemas reject unknown, missing, and mistyped route input", () => {
    const reviewUnknown = run([
      "github",
      "review-route",
      "--input-json",
      JSON.stringify({
        workerId: "w",
        workerRuntime: "codex",
        workerModel: "gpt",
        reviewEvidence: [],
        injected: true,
      }),
    ]);
    expect(reviewUnknown.status).toBe(1);
    expect(reviewUnknown.stderr).toContain("unrecognized_keys");

    const ciMissing = run([
      "github",
      "ci-auto-fix-gate",
      "--input-json",
      JSON.stringify({ ciStatus: "red", confidence: 0.9, attempt: 0 }),
    ]);
    expect(ciMissing.status).toBe(1);
    expect(ciMissing.stderr).toContain("failureKind");

    const releaseMistyped = run([
      "github",
      "release-automation-decision",
      "--input-json",
      JSON.stringify({
        adrStatus: "accepted",
        conventionalCommits: "yes",
        requiresPrReviewGate: true,
        requiresDryRun: true,
        mergeQueueEnabled: true,
      }),
    ]);
    expect(releaseMistyped.status).toBe(1);
    expect(releaseMistyped.stderr).toContain("conventionalCommits");
  });

  it("write-capable PR/release routes reject before external application without gate evidence", () => {
    const pr = run(["github", "pr-create", "--apply"]);
    expect(pr.status).toBe(1);
    expect(pr.stderr).toContain("valid cross-review evidence is required");

    const release = run(["github", "release-plan", "--tag", "v0.0.0", "--repo", "x/y", "--apply"]);
    expect(release.status).toBe(1);
    expect(release.stderr).toContain("accepted release automation decision evidence is required");
  });

  it("profile safety and generated config functions are reached by real CLI routes", () => {
    const safety = run(["mcp", "profile", "safety", "github-mcp-readonly", "--json"]);
    expect(safety.stdout).toContain("github-mcp-readonly");
    const config = run(["mcp", "profile", "config", "node-unit", "--json"]);
    expect(config.status).toBe(0);
    expect(JSON.parse(config.stdout).content).toContain('"mcpServers"');
  });
});
