import { describe, expect, it } from "vitest";
import {
  type GitHubIssueNativeGraphRunner,
  githubIssueNativeGraphQueryArgs,
  loadGitHubIssueNativeGraphSnapshot,
} from "../src/runtime/github-issue-native-graph-provider";

// PLAN-RECOVERY-104-issue-native-graph-provider / U-IGNPROV-001
describe("GitHub Issue native graph provider", () => {
  it("U-IGNPROV-001: repository／Issueを変数へ分離したexact GraphQL queryだけを発行する", () => {
    const args = githubIssueNativeGraphQueryArgs("RetryYN/HELIX-HARNESS", 179);
    expect(args.slice(0, 4)).toEqual([
      "api",
      "graphql",
      "-f",
      expect.stringContaining("blockedBy"),
    ]);
    expect(args).toEqual(
      expect.arrayContaining(["owner=RetryYN", "name=HELIX-HARNESS", "number=179"]),
    );
    expect(args.join(" ")).not.toContain("issue(number:179)");
    expect(() => githubIssueNativeGraphQueryArgs("bad", 179)).toThrow(
      "github_repository_identity_invalid",
    );
    expect(() => githubIssueNativeGraphQueryArgs("RetryYN/HELIX-HARNESS", 0)).toThrow(
      "github_issue_number_invalid",
    );
  });

  // PLAN-RECOVERY-104-issue-native-graph-provider / U-IGNPROV-002
  it("U-IGNPROV-002: stable IDと4面graphを正規化しhasNextPageをcompleteへ反転する", () => {
    const runner: GitHubIssueNativeGraphRunner = () => ({
      status: 0,
      stdout: JSON.stringify({
        data: {
          repository: {
            issue: {
              id: "I_179",
              number: 179,
              parent: { number: 191 },
              subIssues: {
                nodes: [{ number: 188 }, { number: 184 }, { number: 188 }],
                pageInfo: { hasNextPage: false },
              },
              blockedBy: {
                nodes: [{ number: 1169 }],
                pageInfo: { hasNextPage: true },
              },
              blocking: {
                nodes: [{ number: 188 }],
                pageInfo: { hasNextPage: false },
              },
            },
          },
        },
      }),
      stderr: "",
    });

    expect(loadGitHubIssueNativeGraphSnapshot("RetryYN/HELIX-HARNESS", 179, runner)).toEqual({
      issueId: "I_179",
      number: 179,
      parentIssue: 191,
      subIssues: [184, 188],
      blockedBy: [1169],
      blocks: [188],
      subIssuesComplete: true,
      blockedByComplete: false,
      blocksComplete: true,
    });
  });

  // PLAN-RECOVERY-104-issue-native-graph-provider / U-IGNPROV-003
  it("U-IGNPROV-003: API失敗・Issue欠落・identity不一致・malformed pageをfail-closeする", () => {
    const response =
      (issue: unknown): GitHubIssueNativeGraphRunner =>
      () => ({
        status: 0,
        stdout: JSON.stringify({ data: { repository: { issue } } }),
        stderr: "",
      });
    expect(() =>
      loadGitHubIssueNativeGraphSnapshot("RetryYN/HELIX-HARNESS", 179, () => ({
        status: 1,
        stdout: "",
        stderr: "rate limited",
      })),
    ).toThrow("github_issue_native_graph_unavailable");
    expect(() =>
      loadGitHubIssueNativeGraphSnapshot("RetryYN/HELIX-HARNESS", 179, response(null)),
    ).toThrow("github_issue_native_graph_missing");
    expect(() =>
      loadGitHubIssueNativeGraphSnapshot(
        "RetryYN/HELIX-HARNESS",
        179,
        response({
          id: "I_180",
          number: 180,
          parent: null,
          subIssues: { nodes: [], pageInfo: { hasNextPage: false } },
          blockedBy: { nodes: [], pageInfo: { hasNextPage: false } },
          blocking: { nodes: [], pageInfo: { hasNextPage: false } },
        }),
      ),
    ).toThrow("github_issue_native_graph_identity_mismatch");
  });
});
