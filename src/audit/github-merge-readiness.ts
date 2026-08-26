import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  inspectOutstandingSnapshot,
  OUTSTANDING_SNAPSHOT_REPAIR_COMMAND,
} from "../lint/outstanding-snapshot";
import { parseMarkdownFrontmatter } from "../lint/shared";
import { shellQuote } from "../shared/shell-quote";

export interface GithubMergeReadinessInput {
  baseBranch: string;
  currentBranch: string;
  headSha: string;
  originUrl: string | null;
  worktreeClean: boolean;
  ahead: number;
  behind: number;
  /** branch sync後のcommitted outstanding snapshotとlive projectionのsemantic guard。 */
  outstandingSnapshotViolations?: readonly string[];
  ghInstalled: boolean;
  ghAuthenticated: boolean;
  viewerPermission?: GithubViewerPermission | null;
}

export interface GithubMergeReadinessResult {
  schemaVersion: "helix-github-merge-readiness.v1";
  ok: boolean;
  localReady: boolean;
  canOpenPullRequest: boolean;
  delegatedAuthRequired: boolean;
  externalPermissionBlocked: boolean;
  githubAccessState: GithubAccessState;
  baseBranch: string;
  currentBranch: string;
  headSha: string;
  originUrl: string | null;
  viewerPermission: GithubViewerPermission | null;
  ahead: number;
  behind: number;
  findings: GithubMergeReadinessFinding[];
  commands: {
    push: string;
    createDraftPullRequest: string;
    inspectAuth: string;
    inspectRepositoryPermission: string;
    repairOutstandingSnapshot: string;
  };
}

export interface GithubMergeReadinessFinding {
  code:
    | "worktree_dirty"
    | "on_base_branch"
    | "base_not_ancestor"
    | "no_branch_delta"
    | "outstanding_snapshot_semantic_drift"
    | "gh_missing"
    | "gh_auth_required"
    | "repo_write_permission_required";
  severity: "error" | "info";
  message: string;
}

export type GithubViewerPermission = "ADMIN" | "MAINTAIN" | "WRITE" | "TRIAGE" | "READ" | "NONE";

export type GithubAccessState =
  | "ready"
  | "delegated_auth_required"
  | "repo_write_permission_required"
  | "gh_cli_missing"
  | "local_not_ready";

export interface GithubPrBodyDraftResult {
  schemaVersion: "helix-github-pr-body-draft.v1";
  baseBranch: string;
  headBranch: string;
  headSha: string;
  title: string;
  templatePath: string;
  commitSubjects: string[];
  changedPaths: string[];
  omittedCommitCount: number;
  omittedChangedPathCount: number;
  markdown: string;
  commands: {
    createDraftPullRequest: string;
  };
}

export type GithubCiStatusKind = "green" | "red" | "pending" | "no_runs" | "unavailable";

export interface GithubCiRun {
  name: string;
  workflowName: string;
  status: string;
  conclusion: string | null;
  headSha: string;
  url: string | null;
}

export interface GithubCiStatusInput {
  ref: string;
  ghInstalled: boolean;
  ghAuthenticated: boolean;
  runs: GithubCiRun[];
  queryError?: string;
}

export interface GithubCiStatusResult {
  schemaVersion: "helix-github-ci-status.v1";
  ok: boolean;
  status: GithubCiStatusKind;
  ref: string;
  ghInstalled: boolean;
  ghAuthenticated: boolean;
  delegatedAuthRequired: boolean;
  externalPermissionBlocked: boolean;
  githubAccessState: GithubAccessState;
  runs: GithubCiRun[];
  queryError?: string;
  commands: {
    inspectAuth: string;
    listRuns: string;
  };
}

export interface GithubPrCreateResult {
  schemaVersion: "helix-github-pr-create.v1";
  ok: boolean;
  dryRun: boolean;
  attempted: boolean;
  localReady: boolean;
  readyToApply: boolean;
  ghInstalled: boolean;
  ghAuthenticated: boolean;
  delegatedAuthRequired: boolean;
  externalPermissionBlocked: boolean;
  githubAccessState: GithubAccessState;
  baseBranch: string;
  headBranch: string;
  headSha: string;
  title: string;
  command: string;
  pullRequestUrl: string | null;
  exitCode: number | null;
  stderr?: string;
  findings: GithubMergeReadinessFinding[];
}

function normalizeViewerPermission(
  value: string | null | undefined,
): GithubViewerPermission | null {
  const upper = value?.trim().toUpperCase();
  if (
    upper === "ADMIN" ||
    upper === "MAINTAIN" ||
    upper === "WRITE" ||
    upper === "TRIAGE" ||
    upper === "READ" ||
    upper === "NONE"
  ) {
    return upper;
  }
  return null;
}

function canWriteWithViewerPermission(permission: GithubViewerPermission | null): boolean {
  return permission === "ADMIN" || permission === "MAINTAIN" || permission === "WRITE";
}

export function analyzeGithubMergeReadiness(
  input: GithubMergeReadinessInput,
): GithubMergeReadinessResult {
  const findings: GithubMergeReadinessFinding[] = [];
  const viewerPermission = normalizeViewerPermission(input.viewerPermission);
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
  const outstandingSnapshotViolations = input.outstandingSnapshotViolations ?? [];
  if (outstandingSnapshotViolations.length > 0) {
    findings.push({
      code: "outstanding_snapshot_semantic_drift",
      severity: "error",
      message: `committed outstanding snapshotとlive projectionのsemantic guardに失敗。${OUTSTANDING_SNAPSHOT_REPAIR_COMMAND} 実行後に再確認: ${outstandingSnapshotViolations.slice(0, 4).join("; ")}`,
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
  if (
    input.ghInstalled &&
    input.ghAuthenticated &&
    !canWriteWithViewerPermission(viewerPermission)
  ) {
    findings.push({
      code: "repo_write_permission_required",
      severity: "info",
      message:
        "GitHub repo の viewerPermission が未確認または WRITE/MAINTAIN/ADMIN ではないため PR 作成は write 権限付与後に実行する",
    });
  }

  const localReady = !findings.some((finding) => finding.severity === "error");
  const hasRepoWritePermission =
    !input.ghInstalled || !input.ghAuthenticated || canWriteWithViewerPermission(viewerPermission);
  const canOpenPullRequest =
    localReady && input.ghInstalled && input.ghAuthenticated && hasRepoWritePermission;
  const delegatedAuthRequired = localReady && input.ghInstalled && !input.ghAuthenticated;
  const githubAccessState: GithubAccessState = !localReady
    ? "local_not_ready"
    : !input.ghInstalled
      ? "gh_cli_missing"
      : !input.ghAuthenticated
        ? "delegated_auth_required"
        : !hasRepoWritePermission
          ? "repo_write_permission_required"
          : "ready";
  const externalPermissionBlocked = githubAccessState === "repo_write_permission_required";
  return {
    schemaVersion: "helix-github-merge-readiness.v1",
    ok: localReady,
    localReady,
    canOpenPullRequest,
    delegatedAuthRequired,
    externalPermissionBlocked,
    githubAccessState,
    baseBranch: input.baseBranch,
    currentBranch: input.currentBranch,
    headSha: input.headSha,
    originUrl: input.originUrl,
    viewerPermission,
    ahead: input.ahead,
    behind: input.behind,
    findings,
    commands: {
      push: `git push -u origin ${shellQuote(input.currentBranch)}`,
      createDraftPullRequest: `gh pr create --draft --base ${shellQuote(input.baseBranch)} --head ${shellQuote(input.currentBranch)} --title <title>`,
      inspectAuth: "gh auth status",
      inspectRepositoryPermission: "gh repo view --json viewerPermission --jq .viewerPermission",
      repairOutstandingSnapshot: OUTSTANDING_SNAPSHOT_REPAIR_COMMAND,
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

function gitLines(repoRoot: string, args: string[]): string[] {
  return git(repoRoot, args, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
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
  const viewerPermission =
    ghInstalled && ghAuth?.status === 0
      ? normalizeViewerPermission(
          spawnSync(
            "gh",
            ["repo", "view", "--json", "viewerPermission", "--jq", ".viewerPermission"],
            {
              cwd: repoRoot,
              encoding: "utf8",
              stdio: ["ignore", "pipe", "ignore"],
            },
          ).stdout,
        )
      : null;
  const aheadBehind = parseAheadBehind(
    git(repoRoot, ["rev-list", "--left-right", "--count", `origin/${baseBranch}...HEAD`], "0 0"),
  );
  const outstandingSnapshot = inspectOutstandingSnapshot(repoRoot);
  return analyzeGithubMergeReadiness({
    baseBranch,
    currentBranch,
    headSha,
    originUrl,
    worktreeClean: status.length === 0,
    ahead: aheadBehind.ahead,
    behind: aheadBehind.behind,
    outstandingSnapshotViolations: outstandingSnapshot.violations,
    ghInstalled,
    ghAuthenticated: ghAuth?.status === 0,
    viewerPermission,
  });
}

export function buildGithubPrBodyDraft(input: {
  baseBranch: string;
  headBranch: string;
  headSha: string;
  title?: string;
  templateText: string;
  commitSubjects: string[];
  changedPaths: string[];
  atomicScope?: {
    behaviorContract: string;
    responsibilityOwner: string;
    requiredCompanionPaths: string[];
  };
  commitLimit?: number;
  changedPathLimit?: number;
}): GithubPrBodyDraftResult {
  const commitLimit = input.commitLimit ?? 30;
  const changedPathLimit = input.changedPathLimit ?? 80;
  const commitSubjects = input.commitSubjects.slice(0, commitLimit);
  const changedPaths = input.changedPaths.slice(0, changedPathLimit);
  const omittedCommitCount = Math.max(0, input.commitSubjects.length - commitSubjects.length);
  const omittedChangedPathCount = Math.max(0, input.changedPaths.length - changedPaths.length);
  const title =
    input.title?.trim() || input.commitSubjects[0] || `HELIX update: ${input.headBranch}`;
  const changedPreview =
    changedPaths.length > 0
      ? changedPaths.map((path) => `- \`${path}\``).join("\n")
      : "- 差分ファイルなし";
  const commitPreview =
    commitSubjects.length > 0
      ? commitSubjects.map((subject) => `- ${subject}`).join("\n")
      : "- commit subject なし";
  const scopeManifest = input.atomicScope
    ? [
        `Behavior contract: ${input.atomicScope.behaviorContract}`,
        `Responsibility owner: ${input.atomicScope.responsibilityOwner}`,
        `Allowed path families: ${input.changedPaths.join(", ")}`,
        `Expected changed paths: ${input.changedPaths.join(", ")}`,
        `Required companion paths: ${input.atomicScope.requiredCompanionPaths.join(", ")}`,
        "Scope expansion: none",
      ]
    : [];
  const templateText = input.atomicScope
    ? /^Behavior contract:/m.test(input.templateText)
      ? scopeManifest.reduce(
          (body, field) => body.replace(new RegExp(`^${field.split(":")[0]}:.*$`, "m"), field),
          input.templateText,
        )
      : `${input.templateText.trimEnd()}\n\n## 原子契約scope\n${scopeManifest.join("\n")}\n`
    : input.templateText;
  const markdown = [
    templateText.trimEnd(),
    "",
    "## HELIX マージ準備状況",
    "",
    `- base: \`${input.baseBranch}\``,
    `- head: \`${input.headBranch}\``,
    `- headSha: \`${input.headSha}\``,
    "- merge route: PR 経由。main 直 merge ではない。",
    "",
    "## Commit summary",
    commitPreview,
    omittedCommitCount > 0 ? `- 他 ${omittedCommitCount} 件は JSON packet で確認` : "",
    "",
    "## Changed paths",
    changedPreview,
    omittedChangedPathCount > 0 ? `- 他 ${omittedChangedPathCount} 件は JSON packet で確認` : "",
    "",
    "## Required local verification",
    "- [ ] `helix github merge-readiness --json`",
    "- [ ] `helix github ci-status --json`",
    "- [ ] `helix doctor`",
  ].join("\n");
  return {
    schemaVersion: "helix-github-pr-body-draft.v1",
    baseBranch: input.baseBranch,
    headBranch: input.headBranch,
    headSha: input.headSha,
    title,
    templatePath: ".github/PULL_REQUEST_TEMPLATE.md",
    commitSubjects,
    changedPaths,
    omittedCommitCount,
    omittedChangedPathCount,
    markdown,
    commands: {
      createDraftPullRequest: `gh pr create --draft --base ${shellQuote(input.baseBranch)} --head ${shellQuote(input.headBranch)} --title ${shellQuote(title)} --body-file <body.md>`,
    },
  };
}

export function loadGithubPrBodyDraft(
  repoRoot: string,
  opts: { baseBranch?: string; title?: string } = {},
): GithubPrBodyDraftResult {
  const baseBranch = opts.baseBranch ?? "main";
  const headBranch = git(repoRoot, ["rev-parse", "--abbrev-ref", "HEAD"], "HEAD");
  const headSha = git(repoRoot, ["rev-parse", "HEAD"], "");
  const templatePath = join(repoRoot, ".github", "PULL_REQUEST_TEMPLATE.md");
  const templateText = existsSync(templatePath)
    ? readFileSync(templatePath, "utf8")
    : "## 概要\n\n## 検証\n";
  const changedPaths = gitLines(repoRoot, ["diff", "--name-only", `origin/${baseBranch}...HEAD`]);
  const changedPlans = changedPaths.filter((path) => path.startsWith("docs/plans/PLAN-"));
  let atomicScope:
    | {
        behaviorContract: string;
        responsibilityOwner: string;
        requiredCompanionPaths: string[];
      }
    | undefined;
  if (changedPlans.length === 1) {
    const plan = parseMarkdownFrontmatter(
      readFileSync(join(repoRoot, changedPlans[0] ?? ""), "utf8"),
    );
    const behaviorContract = plan?.behavior_contract_id;
    const responsibilityOwner = plan?.responsibility_owner;
    if (typeof behaviorContract === "string" && typeof responsibilityOwner === "string") {
      atomicScope = {
        behaviorContract,
        responsibilityOwner,
        requiredCompanionPaths: changedPaths.filter(
          (path) => path.startsWith("docs/plans/") || path.startsWith("tests/"),
        ),
      };
    }
  }
  return buildGithubPrBodyDraft({
    baseBranch,
    headBranch,
    headSha,
    title: opts.title,
    templateText,
    commitSubjects: gitLines(repoRoot, ["log", "--format=%s", `origin/${baseBranch}..HEAD`]),
    changedPaths,
    atomicScope,
  });
}

export function analyzeGithubCiStatus(input: GithubCiStatusInput): GithubCiStatusResult {
  let status: GithubCiStatusKind = "unavailable";
  if (input.ghInstalled && input.ghAuthenticated && input.queryError === undefined) {
    if (input.runs.length === 0) {
      status = "no_runs";
    } else if (
      input.runs.some((run) => run.conclusion === "failure" || run.conclusion === "cancelled")
    ) {
      status = "red";
    } else if (input.runs.some((run) => run.status !== "completed" || run.conclusion === null)) {
      status = "pending";
    } else if (
      input.runs.every((run) => run.conclusion === "success" || run.conclusion === "skipped")
    ) {
      status = "green";
    } else {
      status = "red";
    }
  }
  const delegatedAuthRequired = input.ghInstalled && !input.ghAuthenticated;
  const githubAccessState: GithubAccessState = !input.ghInstalled
    ? "gh_cli_missing"
    : !input.ghAuthenticated
      ? "delegated_auth_required"
      : "ready";
  return {
    schemaVersion: "helix-github-ci-status.v1",
    ok: status === "green",
    status,
    ref: input.ref,
    ghInstalled: input.ghInstalled,
    ghAuthenticated: input.ghAuthenticated,
    delegatedAuthRequired,
    externalPermissionBlocked: false,
    githubAccessState,
    runs: input.runs,
    queryError: input.queryError,
    commands: {
      inspectAuth: "gh auth status",
      listRuns: `gh run list --branch ${shellQuote(input.ref)} --limit 10 --json databaseId,status,conclusion,headSha,name,workflowName,url`,
    },
  };
}

function parsePrUrl(stdout: string): string | null {
  const trimmed = stdout.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/https:\/\/github\.com\/[^\s]+\/pull\/\d+/);
  return match?.[0] ?? null;
}

// Issue #381: pr-create --applyは原子契約placeholderを残したままPRを作らない。
// placeholder残存・空フィールド・行欠落・Expected changed pathsのexact set不一致・
// bare "Closes #"をfail-closeし、最初のrequired CIを無駄なredにしない。
const ATOMIC_CONTRACT_FIELDS = [
  "Behavior contract",
  "Responsibility owner",
  "Allowed path families",
  "Expected changed paths",
  "Required companion paths",
] as const;

export function validateAtomicContractBody(markdown: string, changedPaths: string[]): string[] {
  const violations: string[] = [];
  // CI側 analyzePrContext と同じく、同一フィールドの重複行も不正として扱う (exact 1 行)。
  const fieldValue = (label: string): string | null => {
    const matches = [...markdown.matchAll(new RegExp(`^${label}: ?(.*)$`, "gm"))];
    if (matches.length !== 1) return matches.length === 0 ? null : "__duplicate__";
    return matches[0]?.[1] ?? "";
  };
  for (const field of ATOMIC_CONTRACT_FIELDS) {
    const value = fieldValue(field);
    if (value === null) {
      violations.push(`${field}: contract line missing`);
      continue;
    }
    if (value === "__duplicate__") {
      violations.push(`${field}: contract line appears more than once`);
      continue;
    }
    if (value.includes("<!--") || value.trim() === "") {
      violations.push(`${field}: template placeholder remains`);
    }
  }
  const expected = fieldValue("Expected changed paths");
  if (
    expected !== null &&
    expected !== "__duplicate__" &&
    !expected.includes("<!--") &&
    expected.trim() !== ""
  ) {
    const declared = [...new Set(expected.split(",").map((path) => path.trim()))]
      .filter(Boolean)
      .sort();
    const actual = [...new Set(changedPaths)].sort();
    if (JSON.stringify(declared) !== JSON.stringify(actual)) {
      violations.push(
        `Expected changed paths: exact set mismatch (declared=${declared.length}, actual=${actual.length})`,
      );
    }
  }
  if (/^Closes #\s*$/m.test(markdown)) {
    violations.push("Closes #: issue number placeholder remains");
  }
  return violations;
}

// Issue #381: 作成済みPR bodyのread-after-GitHub検証。読み戻し不能とdriftを分類して返す。
// undefined = 検証合格。呼び出し側はいずれの失敗でも ok=false にする (fail-close)。
// 失敗事由は GithubPrCreateResult schema 不変制約のため stderr へ載せる。専用フィールド
// (例: contractError) は次の schema 版で検討する。
export function verifyCreatedPrBody(
  viewed: { status: number | null; stdout: string },
  changedPaths: string[],
): string | undefined {
  if (viewed.status !== 0) {
    return "pr_body_contract_unverified: created PR body could not be read back";
  }
  const violations = validateAtomicContractBody(viewed.stdout, changedPaths);
  if (violations.length > 0) {
    return `pr_body_contract_drift_after_create: ${violations.join("; ")}`;
  }
  return undefined;
}

export function runGithubPrCreate(
  repoRoot: string,
  opts: { baseBranch?: string; title?: string; dryRun?: boolean } = {},
): GithubPrCreateResult {
  const dryRun = opts.dryRun !== false;
  const readiness = loadGithubMergeReadiness(repoRoot, { baseBranch: opts.baseBranch });
  const draft = loadGithubPrBodyDraft(repoRoot, {
    baseBranch: opts.baseBranch,
    title: opts.title,
  });
  const readyToApply = readiness.localReady && readiness.canOpenPullRequest;
  const command = `gh pr create --draft --base ${shellQuote(draft.baseBranch)} --head ${shellQuote(draft.headBranch)} --title ${shellQuote(draft.title)} --body <generated>`;
  if (dryRun || !readyToApply) {
    return {
      schemaVersion: "helix-github-pr-create.v1",
      ok: dryRun ? readiness.localReady : false,
      dryRun,
      attempted: false,
      localReady: readiness.localReady,
      readyToApply,
      ghInstalled: readiness.findings.every((finding) => finding.code !== "gh_missing"),
      ghAuthenticated:
        readiness.githubAccessState === "ready" ||
        readiness.githubAccessState === "repo_write_permission_required",
      delegatedAuthRequired: readiness.delegatedAuthRequired,
      externalPermissionBlocked: readiness.externalPermissionBlocked,
      githubAccessState: readiness.githubAccessState,
      baseBranch: draft.baseBranch,
      headBranch: draft.headBranch,
      headSha: draft.headSha,
      title: draft.title,
      command,
      pullRequestUrl: null,
      exitCode: null,
      findings: readiness.findings,
    };
  }
  // Issue #381: apply直前に原子契約bodyをfail-closeで検証する。
  const fullChangedPaths = gitLines(repoRoot, [
    "diff",
    "--name-only",
    `origin/${draft.baseBranch}...HEAD`,
  ]);
  const contractViolations = validateAtomicContractBody(draft.markdown, fullChangedPaths);
  if (contractViolations.length > 0) {
    return {
      schemaVersion: "helix-github-pr-create.v1",
      ok: false,
      dryRun: false,
      attempted: false,
      localReady: readiness.localReady,
      readyToApply: false,
      ghInstalled: true,
      ghAuthenticated: true,
      delegatedAuthRequired: readiness.delegatedAuthRequired,
      externalPermissionBlocked: false,
      githubAccessState: readiness.githubAccessState,
      baseBranch: draft.baseBranch,
      headBranch: draft.headBranch,
      headSha: draft.headSha,
      title: draft.title,
      command,
      pullRequestUrl: null,
      exitCode: null,
      stderr: `pr_body_contract_incomplete: ${contractViolations.join("; ")}`,
      findings: readiness.findings,
    };
  }
  const created = spawnSync(
    "gh",
    [
      "pr",
      "create",
      "--draft",
      "--base",
      draft.baseBranch,
      "--head",
      draft.headBranch,
      "--title",
      draft.title,
      "--body",
      draft.markdown,
    ],
    { cwd: repoRoot, encoding: "utf8" },
  );
  const externalPermissionBlocked =
    created.status !== 0 &&
    /permission|forbidden|403|resource not accessible/i.test(created.stderr);
  // Issue #381: read-after-GitHubで作成済みPRの現物bodyにもplaceholder 0とexact manifestを要求する。
  let postCreateContractError: string | undefined;
  const createdUrl = parsePrUrl(created.stdout);
  if (created.status === 0 && createdUrl) {
    const viewed = spawnSync("gh", ["pr", "view", createdUrl, "--json", "body", "--jq", ".body"], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    postCreateContractError = verifyCreatedPrBody(
      { status: viewed.status, stdout: viewed.stdout ?? "" },
      fullChangedPaths,
    );
  }
  return {
    schemaVersion: "helix-github-pr-create.v1",
    ok: created.status === 0 && postCreateContractError === undefined,
    dryRun: false,
    attempted: true,
    localReady: readiness.localReady,
    readyToApply,
    ghInstalled: true,
    ghAuthenticated: true,
    delegatedAuthRequired: false,
    externalPermissionBlocked,
    githubAccessState: externalPermissionBlocked ? "repo_write_permission_required" : "ready",
    baseBranch: draft.baseBranch,
    headBranch: draft.headBranch,
    headSha: draft.headSha,
    title: draft.title,
    command,
    pullRequestUrl: createdUrl,
    exitCode: created.status,
    stderr: created.status === 0 ? postCreateContractError : created.stderr.trim() || undefined,
    findings: readiness.findings,
  };
}

function parseGhRuns(stdout: string): GithubCiRun[] {
  try {
    const parsed = JSON.parse(stdout) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((row): GithubCiRun => {
      const record = row && typeof row === "object" ? (row as Record<string, unknown>) : {};
      return {
        name: typeof record.name === "string" ? record.name : "",
        workflowName: typeof record.workflowName === "string" ? record.workflowName : "",
        status: typeof record.status === "string" ? record.status : "",
        conclusion: typeof record.conclusion === "string" ? record.conclusion : null,
        headSha: typeof record.headSha === "string" ? record.headSha : "",
        url: typeof record.url === "string" ? record.url : null,
      };
    });
  } catch {
    return [];
  }
}

export function loadGithubCiStatus(
  repoRoot: string,
  opts: { ref?: string } = {},
): GithubCiStatusResult {
  const ref = opts.ref ?? git(repoRoot, ["rev-parse", "--abbrev-ref", "HEAD"], "HEAD");
  const ghVersion = spawnSync("gh", ["--version"], { stdio: "ignore" });
  const ghInstalled = ghVersion.status === 0;
  const ghAuth = ghInstalled ? spawnSync("gh", ["auth", "status"], { stdio: "ignore" }) : null;
  if (!ghInstalled || ghAuth?.status !== 0) {
    return analyzeGithubCiStatus({
      ref,
      ghInstalled,
      ghAuthenticated: ghAuth?.status === 0,
      runs: [],
    });
  }
  const query = spawnSync(
    "gh",
    [
      "run",
      "list",
      "--branch",
      ref,
      "--limit",
      "10",
      "--json",
      "databaseId,status,conclusion,headSha,name,workflowName,url",
    ],
    { cwd: repoRoot, encoding: "utf8" },
  );
  return analyzeGithubCiStatus({
    ref,
    ghInstalled,
    ghAuthenticated: true,
    runs: query.status === 0 ? parseGhRuns(query.stdout) : [],
    queryError: query.status === 0 ? undefined : query.stderr.trim() || "gh run list failed",
  });
}

export function renderGithubMergeReadiness(result: GithubMergeReadinessResult): string {
  const lines = [
    `github merge-readiness: ${result.ok ? "local-ready" : "blocked"} branch=${result.currentBranch} base=${result.baseBranch} ahead=${result.ahead} behind=${result.behind}`,
    `  - access=${result.githubAccessState} viewerPermission=${result.viewerPermission ?? "unknown"} canOpenPullRequest=${result.canOpenPullRequest} delegatedAuthRequired=${result.delegatedAuthRequired}`,
    `  - push: ${result.commands.push}`,
    `  - draft-pr: ${result.commands.createDraftPullRequest}`,
    `  - repair-outstanding-snapshot: ${result.commands.repairOutstandingSnapshot}`,
    `  - inspect-permission: ${result.commands.inspectRepositoryPermission}`,
  ];
  for (const finding of result.findings) {
    lines.push(`  - ${finding.severity} ${finding.code}: ${finding.message}`);
  }
  return `${lines.join("\n")}\n`;
}

export function renderGithubCiStatus(result: GithubCiStatusResult): string {
  const lines = [
    `github ci-status: status=${result.status} ref=${result.ref} runs=${result.runs.length}`,
    `  - access=${result.githubAccessState} delegatedAuthRequired=${result.delegatedAuthRequired}`,
    `  - inspect-auth: ${result.commands.inspectAuth}`,
    `  - list-runs: ${result.commands.listRuns}`,
  ];
  if (result.queryError) lines.push(`  - query-error: ${result.queryError}`);
  for (const run of result.runs) {
    lines.push(
      `  - ${run.workflowName || run.name || "-"} status=${run.status || "-"} conclusion=${run.conclusion ?? "-"}`,
    );
  }
  return `${lines.join("\n")}\n`;
}
