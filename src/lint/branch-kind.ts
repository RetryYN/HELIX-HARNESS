import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { parse as parseYaml } from "yaml";
import { markdownFrontmatter, normalizePath } from "./shared";

export type BranchKind =
  | "feature"
  | "design"
  | "research"
  | "poc"
  | "reverse"
  | "add"
  | "hotfix"
  | "refactor"
  | "retrofit"
  | "recovery"
  | "version-up"
  | "verify"
  | "docs"
  | "chore"
  | "none";

export interface BranchPlanDoc {
  file: string;
  plan_id?: string;
  kind?: string;
  github_issue_id?: unknown;
  /** recovery branchが既存PLANへsuperseded_byだけを移行する場合のtyped判定。 */
  supersession_metadata_only?: boolean;
}

export interface BranchKindInput {
  branch: string | null;
  changedPaths: string[];
  plans: BranchPlanDoc[];
  strictUnknownPrefix?: boolean;
  authority?:
    | { status: "available"; baseHead: string; candidateHead: string; mergeBase: string }
    | { status: "not_applicable"; reason: "non_git_consumer" }
    | { status: "unavailable"; reason: string };
}

export interface BranchKindSnapshot {
  baseHead: string;
  candidateHead: string;
  branch: string;
  includeWorkingTree?: boolean;
}

function validLocalPrIdentity(local: {
  repository: string;
  head: string;
  branch: string;
}): boolean {
  return (
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(local.repository) &&
    /^[a-f0-9]{40}$/.test(local.head) &&
    typeof local.branch === "string" &&
    local.branch.length > 0 &&
    local.branch !== "HEAD"
  );
}

/** PR応答の必要fieldだけを検証する。取得・Git実在性検査は呼出し側の責務。 */
export function branchSnapshotFromPrContext(
  raw: unknown,
  local: { repository: string; head: string; branch: string },
): BranchKindSnapshot | null {
  const record = (value: unknown): Record<string, unknown> | null =>
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  const pr = record(raw);
  const base = record(pr?.base);
  const head = record(pr?.head);
  const sha = /^[a-f0-9]{40}$/;
  if (
    !validLocalPrIdentity(local) ||
    pr?.state !== "open" ||
    typeof base?.sha !== "string" ||
    !sha.test(base.sha) ||
    head?.sha !== local.head ||
    head?.ref !== local.branch ||
    record(base.repo)?.full_name !== local.repository ||
    record(head.repo)?.full_name !== local.repository
  )
    return null;
  return {
    baseHead: base.sha,
    candidateHead: local.head,
    branch: local.branch,
    includeWorkingTree: true,
  };
}

export type BranchPrProviderResult =
  | { status: "available"; snapshot: BranchKindSnapshot }
  | {
      status: "unavailable";
      reason:
        | "pr_local_identity_invalid"
        | "pr_context_invalid"
        | "pr_local_identity_changed"
        | "pr_provider_unavailable";
    };

export function inspectBranchSnapshotFromPrProvider(deps: {
  readLocal(): { repository: string; head: string; branch: string };
  readPr(local: { repository: string; head: string; branch: string }): unknown;
}): BranchPrProviderResult {
  try {
    const before = { ...deps.readLocal() };
    if (!validLocalPrIdentity(before))
      return { status: "unavailable", reason: "pr_local_identity_invalid" };
    const snapshot = branchSnapshotFromPrContext(deps.readPr({ ...before }), before);
    const after = deps.readLocal();
    if (
      before.repository !== after.repository ||
      before.head !== after.head ||
      before.branch !== after.branch
    )
      return { status: "unavailable", reason: "pr_local_identity_changed" };
    return snapshot
      ? { status: "available", snapshot }
      : { status: "unavailable", reason: "pr_context_invalid" };
  } catch {
    return { status: "unavailable", reason: "pr_provider_unavailable" };
  }
}

export function readBranchSnapshotFromPrProvider(
  deps: Parameters<typeof inspectBranchSnapshotFromPrProvider>[0],
): BranchKindSnapshot | null {
  const result = inspectBranchSnapshotFromPrProvider(deps);
  return result.status === "available" ? result.snapshot : null;
}

export interface BranchKindFinding {
  code:
    | "branch_authority_unavailable"
    | "branch_not_applicable"
    | "missing_plan"
    | "kind_mismatch"
    | "skill_doc_plan_missing"
    | "missing_github_issue_id"
    | "unknown_branch_prefix";
  severity: "error" | "warn";
  message: string;
  file?: string;
}

export interface BranchKindResult {
  branch: string | null;
  kind: BranchKind;
  findings: BranchKindFinding[];
  ok: boolean;
}

const REQUIRED_KIND_BY_BRANCH: Record<
  Exclude<BranchKind, "docs" | "chore" | "none">,
  readonly string[]
> = {
  feature: ["impl", "add-design", "add-impl"],
  design: ["design", "charter"],
  research: ["research"],
  poc: ["poc"],
  reverse: ["reverse"],
  add: ["add-design", "add-impl"],
  hotfix: ["recovery", "troubleshoot"],
  refactor: ["refactor", "retrofit"],
  retrofit: ["retrofit"],
  recovery: ["recovery"],
  "version-up": [
    "design",
    "impl",
    "add-design",
    "add-impl",
    "refactor",
    "retrofit",
    "research",
    "reverse",
    "recovery",
    "troubleshoot",
    "poc",
  ],
  verify: ["design", "impl", "add-design", "add-impl", "refactor", "retrofit"],
};

const GOVERNED_BRANCH_PREFIXES = new Set([
  "feature",
  "design",
  "research",
  "poc",
  "reverse",
  "add",
  "hotfix",
  "refactor",
  "retrofit",
  "recovery",
  "version-up",
  "verify",
  "docs",
  "chore",
]);

const AUTOMATION_BRANCH_PREFIXES = new Set(["codex", "dependabot", "renovate"]);

export function classifyBranchKind(branch: string | null): BranchKind {
  if (!branch) return "none";
  const prefix = branch.split("/", 1)[0];
  if (GOVERNED_BRANCH_PREFIXES.has(prefix)) {
    return prefix as BranchKind;
  }
  return "none";
}

export function allowedPlanKindsForBranch(branch: string | null): readonly string[] {
  const kind = classifyBranchKind(branch);
  return isRequiredKind(kind) ? REQUIRED_KIND_BY_BRANCH[kind] : [];
}

export function hasUnknownBranchPrefix(branch: string | null): boolean {
  if (!branch || branch === "main") return false;
  const prefix = branch.split("/", 1)[0];
  return (
    branch.includes("/") &&
    !GOVERNED_BRANCH_PREFIXES.has(prefix) &&
    !AUTOMATION_BRANCH_PREFIXES.has(prefix)
  );
}

function isRequiredKind(kind: BranchKind): kind is keyof typeof REQUIRED_KIND_BY_BRANCH {
  return Object.hasOwn(REQUIRED_KIND_BY_BRANCH, kind);
}

function hasGithubIssueId(plan: BranchPlanDoc): boolean {
  return typeof plan.github_issue_id === "number" && Number.isInteger(plan.github_issue_id);
}

export function analyzeBranchKind(input: BranchKindInput): BranchKindResult {
  const kind = classifyBranchKind(input.branch);
  const changedPaths = input.changedPaths.map(normalizePath);
  const plans = input.plans;
  const findings: BranchKindFinding[] = [];

  if (input.authority?.status === "not_applicable") {
    const valid = input.branch === null && changedPaths.length === 0 && plans.length === 0;
    return {
      branch: input.branch,
      kind,
      ok: valid,
      findings: [
        {
          code: valid ? "branch_not_applicable" : "branch_authority_unavailable",
          severity: valid ? "warn" : "error",
          message: valid ? "non_git_consumer" : "inconsistent_applicability",
        },
      ],
    };
  }

  if (input.authority?.status === "unavailable") {
    return {
      branch: input.branch,
      kind,
      findings: [
        {
          code: "branch_authority_unavailable",
          severity: "error",
          message: input.authority.reason,
        },
      ],
      ok: false,
    };
  }

  if (input.strictUnknownPrefix && hasUnknownBranchPrefix(input.branch)) {
    findings.push({
      code: "unknown_branch_prefix",
      severity: "error",
      message: `${input.branch ?? "(unknown)"} uses an ungoverned branch prefix`,
    });
  }

  if (kind === "docs" || kind === "chore") {
    const touchesSkillDocs = changedPaths.some((p) => /^docs\/skills\/.+\.md$/.test(p));
    if (touchesSkillDocs && plans.length === 0) {
      findings.push({
        code: "skill_doc_plan_missing",
        severity: "error",
        message: `${kind} branch changes docs/skills but no PLAN was touched`,
      });
    }
    return {
      branch: input.branch,
      kind,
      findings,
      ok: !findings.some((f) => f.severity === "error"),
    };
  }

  if (!isRequiredKind(kind)) {
    return {
      branch: input.branch,
      kind,
      findings,
      ok: !findings.some((f) => f.severity === "error"),
    };
  }

  const allowedKinds = REQUIRED_KIND_BY_BRANCH[kind];
  if (plans.length === 0) {
    findings.push({
      code: "missing_plan",
      severity: "error",
      message: `${kind} branch requires at least one touched PLAN`,
    });
  }

  for (const plan of plans) {
    const allowedRecoveryMetadataMigration =
      kind === "recovery" && plan.supersession_metadata_only === true;
    if ((!plan.kind || !allowedKinds.includes(plan.kind)) && !allowedRecoveryMetadataMigration) {
      findings.push({
        code: "kind_mismatch",
        severity: "error",
        file: plan.file,
        message: `${input.branch ?? "(unknown)"} expects PLAN kind ${allowedKinds.join("|")} but ${plan.file} has ${plan.kind ?? "(missing)"}`,
      });
    }
    if ((kind === "feature" || kind === "hotfix") && !hasGithubIssueId(plan)) {
      findings.push({
        code: "missing_github_issue_id",
        severity: "warn",
        file: plan.file,
        message: `${plan.file} should set github_issue_id for PR Closes # linkage`,
      });
    }
  }

  return {
    branch: input.branch,
    kind,
    findings,
    ok: !findings.some((f) => f.severity === "error"),
  };
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, canonicalValue(entry)]),
    );
  return value;
}

function planWithoutSupersededBy(source: string): string | null {
  const raw = markdownFrontmatter(source);
  if (!raw) return null;
  try {
    const frontmatter = parseYaml(raw) as Record<string, unknown>;
    if (!frontmatter || typeof frontmatter !== "object") return null;
    delete frontmatter.superseded_by;
    const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u, "");
    return JSON.stringify({ frontmatter: canonicalValue(frontmatter), body });
  } catch {
    return null;
  }
}

/** current/baseの差がnon-emptyなsuperseded_by fieldだけかをexact比較する。 */
export function isSupersessionMetadataOnly(currentSource: string, baseSource: string): boolean {
  const currentRaw = markdownFrontmatter(currentSource);
  if (!currentRaw) return false;
  try {
    const current = parseYaml(currentRaw) as Record<string, unknown>;
    if (
      !Array.isArray(current.superseded_by) ||
      current.superseded_by.length === 0 ||
      !current.superseded_by.every((value) => typeof value === "string")
    )
      return false;
  } catch {
    return false;
  }
  const currentWithout = planWithoutSupersededBy(currentSource);
  const baseWithout = planWithoutSupersededBy(baseSource);
  return currentWithout !== null && currentWithout === baseWithout;
}

type SnapshotFailureCode =
  | "branch_snapshot_incomplete"
  | "invalid_commit_identity"
  | "branch_identity_unavailable"
  | "commit_identity_mismatch"
  | "working_tree_candidate_mismatch"
  | "working_tree_branch_mismatch"
  | "merge_base_ambiguous"
  | "unsafe_changed_path"
  | "plan_frontmatter_missing"
  | "plan_frontmatter_invalid"
  | "head_changed_during_read"
  | "branch_changed_during_read";

// 内部で定義した失敗だけを公開する。外部プロセスのmessageは転送しない。
class SnapshotFailure extends Error {
  constructor(readonly code: SnapshotFailureCode) {
    super(code);
  }
}

function loadSnapshotInput(repoRoot: string, snapshot: BranchKindSnapshot): BranchKindInput {
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", repoRoot, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
  try {
    if (
      ![snapshot.baseHead, snapshot.candidateHead, snapshot.branch].every((value) => value?.trim())
    )
      throw new SnapshotFailure("branch_snapshot_incomplete");
    if (![snapshot.baseHead, snapshot.candidateHead].every((sha) => /^[a-f0-9]{40}$/.test(sha)))
      throw new SnapshotFailure("invalid_commit_identity");
    if (!snapshot.branch || snapshot.branch === "HEAD")
      throw new SnapshotFailure("branch_identity_unavailable");
    for (const sha of [snapshot.baseHead, snapshot.candidateHead]) {
      if (git("rev-parse", "--verify", `${sha}^{commit}`).trim() !== sha)
        throw new SnapshotFailure("commit_identity_mismatch");
    }
    const observedHead = git("rev-parse", "HEAD").trim();
    if (snapshot.includeWorkingTree && observedHead !== snapshot.candidateHead)
      throw new SnapshotFailure("working_tree_candidate_mismatch");
    const observedBranch = git("rev-parse", "--abbrev-ref", "HEAD").trim();
    if (
      snapshot.includeWorkingTree &&
      observedBranch !== "HEAD" &&
      observedBranch !== snapshot.branch
    )
      throw new SnapshotFailure("working_tree_branch_mismatch");
    const bases = git("merge-base", "--all", snapshot.baseHead, snapshot.candidateHead)
      .trim()
      .split(/\r?\n/);
    if (bases.length !== 1 || !/^[a-f0-9]{40}$/.test(bases[0]))
      throw new SnapshotFailure("merge_base_ambiguous");
    const mergeBase = bases[0];
    const paths = git(
      "diff",
      "--name-only",
      "--no-renames",
      "-z",
      mergeBase,
      snapshot.candidateHead,
      "--",
    ).split("\0");
    if (snapshot.includeWorkingTree) {
      paths.push(
        ...git(
          "diff",
          "--cached",
          "--name-only",
          "--no-renames",
          "-z",
          snapshot.candidateHead,
          "--",
        ).split("\0"),
        ...git("diff", "--name-only", "--no-renames", "-z", "--").split("\0"),
      );
      paths.push(...git("ls-files", "--others", "--exclude-standard", "-z").split("\0"));
    }
    const changedPaths = [...new Set(paths.filter(Boolean))].sort();
    if (
      changedPaths.some(
        (path) =>
          path.startsWith("/") ||
          /[\\\r\n]/.test(path) ||
          path.split("/").some((part) => part === ".." || part === "."),
      )
    )
      throw new SnapshotFailure("unsafe_changed_path");
    const readAt = (head: string, path: string): string | null => {
      if (!git("ls-tree", "-z", head, "--", path)) return null;
      return git("show", `${head}:${path}`);
    };
    const deletedPaths = new Set(
      snapshot.includeWorkingTree
        ? [
            git(
              "diff",
              "--name-only",
              "--no-renames",
              "--diff-filter=D",
              "-z",
              snapshot.candidateHead,
              "--",
            ),
            git("diff", "--name-only", "--no-renames", "--diff-filter=D", "-z", "--"),
          ]
            .join("\0")
            .split("\0")
            .filter(Boolean)
        : [],
    );
    const readWorkingPlan = (file: string): string | null => {
      try {
        return readFileSync(join(repoRoot, file), "utf8");
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        // Gitが示す削除、またはcandidateで既に削除済みのpathだけを欠落として扱う。
        if (
          deletedPaths.has(file) ||
          (readAt(mergeBase, file) !== null && readAt(snapshot.candidateHead, file) === null)
        )
          return null;
        throw error;
      }
    };
    const plans: BranchPlanDoc[] = [];
    for (const file of changedPaths.filter((path) => /^docs\/plans\/PLAN-.+\.md$/.test(path))) {
      const source = snapshot.includeWorkingTree
        ? readWorkingPlan(file)
        : readAt(snapshot.candidateHead, file);
      if (source === null) continue;
      const raw = markdownFrontmatter(source);
      if (!raw) throw new SnapshotFailure("plan_frontmatter_missing");
      const fm = parseYaml(raw) as Record<string, unknown>;
      if (!fm || typeof fm !== "object" || Array.isArray(fm))
        throw new SnapshotFailure("plan_frontmatter_invalid");
      const baseSource = readAt(mergeBase, file);
      plans.push({
        file,
        plan_id: typeof fm.plan_id === "string" ? fm.plan_id : undefined,
        kind: typeof fm.kind === "string" ? fm.kind : undefined,
        github_issue_id: fm.github_issue_id,
        supersession_metadata_only:
          baseSource !== null && isSupersessionMetadataOnly(source, baseSource),
      });
    }
    if (git("rev-parse", "HEAD").trim() !== observedHead)
      throw new SnapshotFailure("head_changed_during_read");
    if (
      snapshot.includeWorkingTree &&
      git("rev-parse", "--abbrev-ref", "HEAD").trim() !== observedBranch
    )
      throw new SnapshotFailure("branch_changed_during_read");
    return {
      branch: snapshot.branch,
      changedPaths,
      plans,
      authority: {
        status: "available",
        baseHead: snapshot.baseHead,
        candidateHead: snapshot.candidateHead,
        mergeBase,
      },
    };
  } catch (error) {
    return {
      branch: snapshot.branch,
      changedPaths: [],
      plans: [],
      authority: {
        status: "unavailable",
        reason: error instanceof SnapshotFailure ? error.code : "branch_snapshot_read_failed",
      },
    };
  }
}

function hasNoGitMetadata(repoRoot: string): boolean {
  try {
    let directory = realpathSync(repoRoot);
    for (;;) {
      try {
        lstatSync(join(directory, ".git"));
        return false;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") return false;
      }
      const parent = dirname(directory);
      if (parent === directory) return true;
      directory = parent;
    }
  } catch {
    return false;
  }
}

export function loadBranchKindInput(
  repoRoot: string = process.cwd(),
  snapshot?:
    | BranchKindSnapshot
    | Extract<BranchPrProviderResult, { status: "unavailable" }>
    | { applicability: "non_git_consumer" },
): BranchKindInput {
  if (snapshot && "status" in snapshot) {
    const reasons = [
      "pr_local_identity_invalid",
      "pr_context_invalid",
      "pr_local_identity_changed",
      "pr_provider_unavailable",
    ];
    return {
      branch: null,
      changedPaths: [],
      plans: [],
      authority: {
        status: "unavailable",
        reason: reasons.includes(snapshot.reason) ? snapshot.reason : "pr_provider_unavailable",
      },
    };
  }
  if (snapshot && "applicability" in snapshot) {
    try {
      if (snapshot.applicability !== "non_git_consumer" || Object.keys(snapshot).length !== 1)
        throw new Error("invalid_applicability_contract");
      execFileSync("git", ["-C", repoRoot, "rev-parse", "--git-dir"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, LC_ALL: "C" },
      });
    } catch (error) {
      const failure = error as { status?: number; stderr?: unknown };
      if (
        failure.status === 128 &&
        /^fatal: not a git repository(?: \(|:)/.test(String(failure.stderr)) &&
        hasNoGitMetadata(repoRoot)
      ) {
        return {
          branch: null,
          changedPaths: [],
          plans: [],
          authority: { status: "not_applicable", reason: "non_git_consumer" },
        };
      }
    }
    return {
      branch: null,
      changedPaths: [],
      plans: [],
      authority: { status: "unavailable", reason: "non_git_applicability_unverified" },
    };
  }
  if (snapshot) return loadSnapshotInput(repoRoot, snapshot);
  return {
    branch: null,
    changedPaths: [],
    plans: [],
    authority: { status: "unavailable", reason: "branch_snapshot_required" },
  };
}

export function branchKindMessages(result: BranchKindResult): string[] {
  const hard = result.findings.filter((f) => f.severity === "error");
  const warn = result.findings.filter((f) => f.severity === "warn");
  if (hard.length === 0) {
    return [
      `branch-kind-check - OK (branch=${result.branch ?? "-"}, kind=${result.kind}, warnings=${warn.length})`,
      ...warn.map((f) => `branch-kind-check - warn ${f.code}: ${f.message}`),
    ];
  }
  return [
    `branch-kind-check - violation: errors=${hard.length}, warnings=${warn.length}`,
    ...hard.map((f) => `branch-kind-check - block ${f.code}: ${f.message}`),
    ...(hard.some(
      (f) =>
        f.code === "branch_authority_unavailable" &&
        ["branch_snapshot_required", "branch_snapshot_incomplete"].includes(f.message),
    )
      ? [
          "branch-kind-check - recovery: 作業元のIssue／PLANまたはPRで比較baseを確認し、--base-head <完全SHA> --candidate-head <完全SHA> --branch <branch名> を一組で指定してください。guard／doctorで作業差分を含める場合は --include-working-tree を追加します（reviewは作業差分を含みます）。baseを推測して補わないでください。",
        ]
      : []),
    ...warn.map((f) => `branch-kind-check - warn ${f.code}: ${f.message}`),
  ];
}
