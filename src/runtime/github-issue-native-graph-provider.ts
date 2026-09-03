import type { IssueNativeGraphSnapshot } from "./issue-hierarchy";

export type GitHubIssueNativeGraphRunner = (args: readonly string[]) => {
  status: number | null;
  stdout: string;
  stderr: string;
};

const ISSUE_NATIVE_GRAPH_QUERY = `
query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    issue(number: $number) {
      id
      number
      parent { number }
      subIssues(first: 100) { nodes { number } pageInfo { hasNextPage } }
      blockedBy(first: 100) { nodes { number } pageInfo { hasNextPage } }
      blocking(first: 100) { nodes { number } pageInfo { hasNextPage } }
    }
  }
}`.trim();

function parseRepository(repository: string): { owner: string; name: string } {
  const match = repository.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/u);
  if (!match?.[1] || !match[2]) throw new Error("github_repository_identity_invalid");
  return { owner: match[1], name: match[2] };
}

function assertIssueNumber(number: number): void {
  if (!Number.isSafeInteger(number) || number <= 0) throw new Error("github_issue_number_invalid");
}

export function githubIssueNativeGraphQueryArgs(repository: string, issueNumber: number): string[] {
  const { owner, name } = parseRepository(repository);
  assertIssueNumber(issueNumber);
  return [
    "api",
    "graphql",
    "-f",
    ISSUE_NATIVE_GRAPH_QUERY,
    "-F",
    `owner=${owner}`,
    "-F",
    `name=${name}`,
    "-F",
    `number=${issueNumber}`,
  ];
}

function record(value: unknown, code: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(code);
  return value as Record<string, unknown>;
}

function positiveNumber(value: unknown, code: string): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) throw new Error(code);
  return value as number;
}

function connection(value: unknown): { numbers: number[]; complete: boolean } {
  const parsed = record(value, "github_issue_native_graph_connection_invalid");
  if (!Array.isArray(parsed.nodes)) throw new Error("github_issue_native_graph_connection_invalid");
  const numbers = parsed.nodes.map((node) =>
    positiveNumber(
      record(node, "github_issue_native_graph_node_invalid").number,
      "github_issue_native_graph_node_invalid",
    ),
  );
  const pageInfo = record(parsed.pageInfo, "github_issue_native_graph_page_info_invalid");
  if (typeof pageInfo.hasNextPage !== "boolean") {
    throw new Error("github_issue_native_graph_page_info_invalid");
  }
  return {
    numbers: [...new Set(numbers)].sort((left, right) => left - right),
    complete: !pageInfo.hasNextPage,
  };
}

function parseGitHubIssueNativeGraphResponse(
  stdout: string,
): { ok: true; payload: unknown } | { ok: false } {
  try {
    return { ok: true, payload: JSON.parse(stdout) };
  } catch {
    return { ok: false };
  }
}

export function loadGitHubIssueNativeGraphSnapshot(
  repository: string,
  issueNumber: number,
  runner: GitHubIssueNativeGraphRunner,
): IssueNativeGraphSnapshot {
  const result = runner(githubIssueNativeGraphQueryArgs(repository, issueNumber));
  if (result.status !== 0) throw new Error("github_issue_native_graph_unavailable");
  const parsedResponse = parseGitHubIssueNativeGraphResponse(result.stdout);
  if (!parsedResponse.ok) throw new Error("github_issue_native_graph_response_invalid");
  const payload = parsedResponse.payload;
  const data = record(
    record(payload, "github_issue_native_graph_response_invalid").data,
    "github_issue_native_graph_response_invalid",
  );
  const repositoryValue = record(data.repository, "github_issue_native_graph_repository_missing");
  if (repositoryValue.issue === null) throw new Error("github_issue_native_graph_missing");
  const issue = record(repositoryValue.issue, "github_issue_native_graph_missing");
  const observedNumber = positiveNumber(issue.number, "github_issue_native_graph_identity_invalid");
  if (observedNumber !== issueNumber)
    throw new Error("github_issue_native_graph_identity_mismatch");
  if (typeof issue.id !== "string" || issue.id.trim() === "") {
    throw new Error("github_issue_native_graph_identity_invalid");
  }
  const parent =
    issue.parent === null
      ? null
      : positiveNumber(
          record(issue.parent, "github_issue_native_graph_parent_invalid").number,
          "github_issue_native_graph_parent_invalid",
        );
  const subIssues = connection(issue.subIssues);
  const blockedBy = connection(issue.blockedBy);
  const blocking = connection(issue.blocking);
  return {
    issueId: issue.id,
    number: observedNumber,
    parentIssue: parent,
    subIssues: subIssues.numbers,
    blockedBy: blockedBy.numbers,
    blocks: blocking.numbers,
    subIssuesComplete: subIssues.complete,
    blockedByComplete: blockedBy.complete,
    blocksComplete: blocking.complete,
  };
}
