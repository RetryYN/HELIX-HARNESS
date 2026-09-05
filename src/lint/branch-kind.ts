import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { loadChangedFiles } from "./change-impact";
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
}

export interface BranchKindFinding {
  code:
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

export function loadPlanDoc(repoRoot: string, file: string): BranchPlanDoc | null {
  const raw = markdownFrontmatter(readFileSync(join(repoRoot, file), "utf8"));
  if (!raw) return { file };
  const fm = parseYaml(raw) as Record<string, unknown>;
  const baseSource = loadBasePlanSource(repoRoot, file);
  return {
    file,
    plan_id: typeof fm.plan_id === "string" ? fm.plan_id : undefined,
    kind: typeof fm.kind === "string" ? fm.kind : undefined,
    github_issue_id: fm.github_issue_id,
    supersession_metadata_only:
      baseSource !== null &&
      isSupersessionMetadataOnly(readFileSync(join(repoRoot, file), "utf8"), baseSource),
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

export function loadBasePlanSource(repoRoot: string, file: string): string | null {
  const candidates: string[] = [];
  if (process.env.GITHUB_BASE_SHA) candidates.push(process.env.GITHUB_BASE_SHA);
  if (process.env.PR_BASE_SHA) candidates.push(process.env.PR_BASE_SHA);
  try {
    const base = execFileSync("git", ["-C", repoRoot, "merge-base", "HEAD", "origin/main"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    candidates.push(base);
  } catch {
    // 明示candidateとfirst parentが後続に残るため、ここではfail-closeしない。
  }
  // pull_request merge checkoutではorigin/mainがfetchされていても、merge-baseが
  // candidate PLANを含むhead側を返す場合がある。first parentをbase authorityにする。
  if (process.env.GITHUB_ACTIONS === "true") candidates.push("HEAD^1");
  for (const base of [...new Set(candidates)]) {
    try {
      return execFileSync("git", ["-C", repoRoot, "show", `${base}:${file}`], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
    } catch {
      // 次の明示candidateへ進む。全candidate失敗時はfail-closeする。
    }
  }
  return null;
}

export function loadBranchKindInput(repoRoot: string = process.cwd()): BranchKindInput {
  let branch: string | null = null;
  try {
    branch = execFileSync("git", ["-C", repoRoot, "rev-parse", "--abbrev-ref", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    branch = null;
  }

  let changedPaths: string[] = [];
  try {
    changedPaths = loadChangedFiles(repoRoot);
  } catch {
    changedPaths = [];
  }

  const planPaths = changedPaths
    .map(normalizePath)
    .filter((p) => /^docs\/plans\/PLAN-.+\.md$/.test(p));
  const plans = planPaths
    .map((p) => {
      try {
        return loadPlanDoc(repoRoot, p);
      } catch {
        return { file: p };
      }
    })
    .filter((p): p is BranchPlanDoc => p != null);

  return { branch, changedPaths, plans };
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
    ...warn.map((f) => `branch-kind-check - warn ${f.code}: ${f.message}`),
  ];
}
