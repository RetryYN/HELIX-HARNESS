import { execFileSync } from "node:child_process";

export type GithubProjectStatus = "Todo" | "In Progress" | "Done";

export interface GithubProjectContent {
  number: number;
  type: "Issue" | "PullRequest";
  title: string;
  url: string;
  closedByPullRequests?: number[];
  linkedOpenPullRequests?: number[];
}

export interface GithubProjectItem extends GithubProjectContent {
  itemId: string;
  status: string | null;
}

export interface GithubProjectField {
  id: string;
  name: string;
  options: Array<{ id: string; name: string }>;
}

export interface GithubProjectSnapshot {
  projectId: string;
  statusField: GithubProjectField;
  contents: GithubProjectContent[];
  items: GithubProjectItem[];
}

export interface GithubProjectFinding {
  code: "missing_item" | "status_mismatch" | "unexpected_item" | "readback_mismatch";
  severity: "error" | "warning";
  url: string;
  expectedStatus?: GithubProjectStatus;
  actualStatus?: string | null;
}

export interface GithubProjectMutation {
  kind: "add" | "set_status";
  url: string;
  itemId?: string;
  status: GithubProjectStatus;
}

export interface GithubProjectProjectionResult {
  schemaVersion: "helix-github-project-projection.v1";
  ok: boolean;
  dryRun: boolean;
  applied: boolean;
  findings: GithubProjectFinding[];
  mutations: GithubProjectMutation[];
}

export interface GithubProjectProjectionDeps {
  load(): GithubProjectSnapshot;
  add(url: string): string;
  setStatus(itemId: string, fieldId: string, optionId: string): void;
}

function expectedStatus(content: GithubProjectContent): GithubProjectStatus {
  if (content.type === "PullRequest") return "In Progress";
  return (content.closedByPullRequests?.length ?? 0) > 0 ||
    (content.linkedOpenPullRequests?.length ?? 0) > 0
    ? "In Progress"
    : "Todo";
}

export function analyzeGithubProjectProjection(
  snapshot: GithubProjectSnapshot,
): GithubProjectProjectionResult {
  const findings: GithubProjectFinding[] = [];
  const mutations: GithubProjectMutation[] = [];
  const desiredUrls = new Set(snapshot.contents.map((content) => content.url));
  const itemsByUrl = new Map(snapshot.items.map((item) => [item.url, item]));

  for (const content of [...snapshot.contents].sort((a, b) => a.url.localeCompare(b.url))) {
    const status = expectedStatus(content);
    const item = itemsByUrl.get(content.url);
    if (!item) {
      findings.push({ code: "missing_item", severity: "error", url: content.url, expectedStatus: status });
      mutations.push({ kind: "add", url: content.url, status });
      continue;
    }
    if (item.status !== status) {
      findings.push({
        code: "status_mismatch",
        severity: "error",
        url: content.url,
        expectedStatus: status,
        actualStatus: item.status,
      });
      mutations.push({ kind: "set_status", url: content.url, itemId: item.itemId, status });
    }
  }
  for (const item of snapshot.items) {
    if (!desiredUrls.has(item.url)) {
      findings.push({ code: "unexpected_item", severity: "warning", url: item.url, actualStatus: item.status });
    }
  }
  return {
    schemaVersion: "helix-github-project-projection.v1",
    ok: findings.every((finding) => finding.severity !== "error"),
    dryRun: true,
    applied: false,
    findings,
    mutations,
  };
}

export function runGithubProjectProjection(
  deps: GithubProjectProjectionDeps,
  options: { apply?: boolean } = {},
): GithubProjectProjectionResult {
  const before = deps.load();
  const plan = analyzeGithubProjectProjection(before);
  if (!options.apply) return plan;
  const optionIds = new Map(before.statusField.options.map((option) => [option.name, option.id]));
  for (const mutation of plan.mutations) {
    const itemId = mutation.kind === "add" ? deps.add(mutation.url) : mutation.itemId;
    const optionId = optionIds.get(mutation.status);
    if (!itemId || !optionId) throw new Error(`Project status mapping unavailable: ${mutation.status}`);
    deps.setStatus(itemId, before.statusField.id, optionId);
  }
  const readback = analyzeGithubProjectProjection(deps.load());
  if (!readback.ok) {
    return {
      ...readback,
      dryRun: false,
      applied: true,
      findings: readback.findings.map((finding) =>
        finding.severity === "error" ? { ...finding, code: "readback_mismatch" as const } : finding,
      ),
    };
  }
  return { ...readback, dryRun: false, applied: true };
}

function ghJson(args: string[]): unknown {
  return JSON.parse(execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
}

function validateOwner(value: string): string {
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(value)) throw new Error("invalid GitHub owner");
  return value;
}

function validateRepo(value: string): string {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value)) throw new Error("invalid GitHub repository");
  return value;
}

export function nodeGithubProjectProjectionDeps(input: {
  owner: string;
  repo: string;
  projectNumber: number;
}): GithubProjectProjectionDeps {
  const owner = validateOwner(input.owner);
  const repo = validateRepo(input.repo);
  if (!Number.isInteger(input.projectNumber) || input.projectNumber < 1) throw new Error("invalid project number");
  const project = String(input.projectNumber);
  let activeProjectId: string | null = null;

  const load = (): GithubProjectSnapshot => {
    const projectView = ghJson(["project", "view", project, "--owner", owner, "--format", "json"]) as { id: string };
    activeProjectId = projectView.id;
    const fields = ghJson(["project", "field-list", project, "--owner", owner, "--format", "json"]) as {
      fields: GithubProjectField[];
    };
    const itemPayload = ghJson(["project", "item-list", project, "--owner", owner, "--format", "json", "--limit", "1000"]) as {
      items: Array<{ id: string; status?: string; content?: GithubProjectContent }>;
    };
    const query = `query($owner:String!,$name:String!){repository(owner:$owner,name:$name){issues(first:100,states:OPEN){pageInfo{hasNextPage} nodes{number title url closedByPullRequestsReferences(first:20){nodes{number}} timelineItems(first:100,itemTypes:[CROSS_REFERENCED_EVENT]){pageInfo{hasNextPage} nodes{... on CrossReferencedEvent{source{... on PullRequest{number state}}}}}}} pullRequests(first:100,states:OPEN){pageInfo{hasNextPage} nodes{number title url}}}}`;
    const [repoOwner, repoName] = repo.split("/");
    const graph = ghJson(["api", "graphql", "-f", `query=${query}`, "-F", `owner=${repoOwner}`, "-F", `name=${repoName}`]) as {
      data: { repository: { issues: { pageInfo: { hasNextPage: boolean }; nodes: Array<{ number: number; title: string; url: string; closedByPullRequestsReferences: { nodes: Array<{ number: number }> }; timelineItems: { pageInfo: { hasNextPage: boolean }; nodes: Array<{ source?: { number: number; state: string } }> } }> }; pullRequests: { pageInfo: { hasNextPage: boolean }; nodes: Array<{ number: number; title: string; url: string }> } } };
    };
    if (
      graph.data.repository.issues.pageInfo.hasNextPage ||
      graph.data.repository.pullRequests.pageInfo.hasNextPage ||
      graph.data.repository.issues.nodes.some((issue) => issue.timelineItems.pageInfo.hasNextPage)
    ) {
      throw new Error("GitHub projection pagination limit exceeded; refusing partial snapshot");
    }
    const statusField = fields.fields.find((field) => field.name === "Status");
    if (!statusField) throw new Error("Project Status field unavailable");
    const contents: GithubProjectContent[] = [
      ...graph.data.repository.issues.nodes.map((issue) => ({
        number: issue.number,
        title: issue.title,
        url: issue.url,
        type: "Issue" as const,
        closedByPullRequests: issue.closedByPullRequestsReferences.nodes.map((pr) => pr.number),
        linkedOpenPullRequests: issue.timelineItems.nodes
          .filter((event) => event.source?.state === "OPEN")
          .map((event) => event.source?.number)
          .filter((number): number is number => number !== undefined),
      })),
      ...graph.data.repository.pullRequests.nodes.map((pr) => ({ ...pr, type: "PullRequest" as const })),
    ];
    const items = itemPayload.items.flatMap((item): GithubProjectItem[] => {
      const content = item.content;
      if (!content?.url || (content.type !== "Issue" && content.type !== "PullRequest")) return [];
      return [{ ...content, itemId: item.id, status: item.status ?? null }];
    });
    return { projectId: projectView.id, statusField, contents, items };
  };

  return {
    load,
    add(url) {
      const payload = ghJson(["project", "item-add", project, "--owner", owner, "--url", url, "--format", "json"]) as { id: string };
      return payload.id;
    },
    setStatus(itemId, fieldId, optionId) {
      if (!activeProjectId) throw new Error("Project snapshot must be loaded before mutation");
      execFileSync("gh", ["project", "item-edit", "--id", itemId, "--project-id", activeProjectId, "--field-id", fieldId, "--single-select-option-id", optionId], { stdio: "pipe" });
    },
  };
}
