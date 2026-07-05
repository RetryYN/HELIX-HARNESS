import { execFileSync, spawnSync } from "node:child_process";

export interface GithubMergeReadinessInput {
  baseBranch: string;
  currentBranch: string;
  headSha: string;
  originUrl: string | null;
  worktreeClean: boolean;
  ahead: number;
  behind: number;
  ghInstalled: boolean;
  ghAuthenticated: boolean;
}

export interface GithubMergeReadinessResult {
  schemaVersion: "helix-github-merge-readiness.v1";
  ok: boolean;
  localReady: boolean;
  canOpenPullRequest: boolean;
  externalPermissionBlocked: boolean;
  baseBranch: string;
  currentBranch: string;
  headSha: string;
  originUrl: string | null;
  ahead: number;
  behind: number;
  findings: GithubMergeReadinessFinding[];
  commands: {
    push: string;
    createDraftPullRequest: string;
    inspectAuth: string;
  };
}

export interface GithubMergeReadinessFinding {
  code:
    | "worktree_dirty"
    | "on_base_branch"
    | "base_not_ancestor"
    | "no_branch_delta"
    | "gh_missing"
    | "gh_auth_required";
  severity: "error" | "info";
  message: string;
}

function shellQuote(value: string): string {
  if (/^[A-Za-z0-9_./:@+=,-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export function analyzeGithubMergeReadiness(
  input: GithubMergeReadinessInput,
): GithubMergeReadinessResult {
  const findings: GithubMergeReadinessFinding[] = [];
  if (!input.worktreeClean) {
    findings.push({
      code: "worktree_dirty",
      severity: "error",
      message: "commit/push 前の作業ツリーが clean ではない",
    });
  }
  if (input.currentBranch === input.baseBranch) {
    findings.push({
      code: "on_base_branch",
      severity: "error",
      message: "base branch 上では PR merge readiness を作れない",
    });
  }
  if (input.behind > 0) {
    findings.push({
      code: "base_not_ancestor",
      severity: "error",
      message: "base branch の未取り込み commit がある",
    });
  }
  if (input.ahead === 0) {
    findings.push({
      code: "no_branch_delta",
      severity: "error",
      message: "base branch に対する差分 commit がない",
    });
  }
  if (!input.ghInstalled) {
    findings.push({
      code: "gh_missing",
      severity: "info",
      message: "GitHub CLI が見つからないため PR 作成は外部手順になる",
    });
  } else if (!input.ghAuthenticated) {
    findings.push({
      code: "gh_auth_required",
      severity: "info",
      message: "GitHub CLI が未認証のため PR 作成は gh auth login 後に実行する",
    });
  }

  const localReady = !findings.some((finding) => finding.severity === "error");
  const canOpenPullRequest = localReady && input.ghInstalled && input.ghAuthenticated;
  const externalPermissionBlocked = localReady && !canOpenPullRequest;
  return {
    schemaVersion: "helix-github-merge-readiness.v1",
    ok: localReady,
    localReady,
    canOpenPullRequest,
    externalPermissionBlocked,
    baseBranch: input.baseBranch,
    currentBranch: input.currentBranch,
    headSha: input.headSha,
    originUrl: input.originUrl,
    ahead: input.ahead,
    behind: input.behind,
    findings,
    commands: {
      push: `git push -u origin ${shellQuote(input.currentBranch)}`,
      createDraftPullRequest: `gh pr create --draft --base ${shellQuote(input.baseBranch)} --head ${shellQuote(input.currentBranch)} --title <title>`,
      inspectAuth: "gh auth status",
    },
  };
}

function git(repoRoot: string, args: string[], fallback = ""): string {
  try {
    return execFileSync("git", ["-C", repoRoot, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return fallback;
  }
}

function parseAheadBehind(value: string): { ahead: number; behind: number } {
  const [left = "0", right = "0"] = value.trim().split(/\s+/);
  return {
    behind: Number.parseInt(left, 10) || 0,
    ahead: Number.parseInt(right, 10) || 0,
  };
}

export function loadGithubMergeReadiness(
  repoRoot: string,
  opts: { baseBranch?: string } = {},
): GithubMergeReadinessResult {
  const baseBranch = opts.baseBranch ?? "main";
  const currentBranch = git(repoRoot, ["rev-parse", "--abbrev-ref", "HEAD"], "HEAD");
  const headSha = git(repoRoot, ["rev-parse", "HEAD"], "");
  const originUrl = git(repoRoot, ["remote", "get-url", "origin"], "") || null;
  const status = git(repoRoot, ["status", "--porcelain"], "");
  const ghVersion = spawnSync("gh", ["--version"], { stdio: "ignore" });
  const ghInstalled = ghVersion.status === 0;
  const ghAuth = ghInstalled ? spawnSync("gh", ["auth", "status"], { stdio: "ignore" }) : null;
  const aheadBehind = parseAheadBehind(
    git(repoRoot, ["rev-list", "--left-right", "--count", `origin/${baseBranch}...HEAD`], "0 0"),
  );
  return analyzeGithubMergeReadiness({
    baseBranch,
    currentBranch,
    headSha,
    originUrl,
    worktreeClean: status.length === 0,
    ahead: aheadBehind.ahead,
    behind: aheadBehind.behind,
    ghInstalled,
    ghAuthenticated: ghAuth?.status === 0,
  });
}

export function renderGithubMergeReadiness(result: GithubMergeReadinessResult): string {
  const lines = [
    `github merge-readiness: ${result.ok ? "local-ready" : "blocked"} branch=${result.currentBranch} base=${result.baseBranch} ahead=${result.ahead} behind=${result.behind}`,
    `  - canOpenPullRequest=${result.canOpenPullRequest} externalPermissionBlocked=${result.externalPermissionBlocked}`,
    `  - push: ${result.commands.push}`,
    `  - draft-pr: ${result.commands.createDraftPullRequest}`,
  ];
  for (const finding of result.findings) {
    lines.push(`  - ${finding.severity} ${finding.code}: ${finding.message}`);
  }
  return `${lines.join("\n")}\n`;
}
