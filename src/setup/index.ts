/**
 * setup — ut-tdd setup solo/team。参加規模を検出 → solo(0-A)/team(0-B) を提案 →
 * 人間確認 → 確定 phase を記録 → phase 別の GitHub 設定を出し分け生成。
 *
 * 設計 (①): docs/design/harness/L6-function-design/setup-solo-team.md (PLAN-L6-05 add-design)。
 * テスト設計 (③): docs/test-design/harness/L7-unit-test-design.md §1.7 U-SETUP-001〜007。
 * PLAN: PLAN-L7-03-setup-solo-team (add-impl)。
 *
 * セキュリティ不変条件 (CLAUDE.md エスカレーション境界):
 *   ① token を読まない・state/docs/log に記録しない (gh 認証状態に委ねる seam)。
 *   ② branch protection の実適用は action-binding approval 未実装のため常に封鎖する。
 *   ③ 既定は emit-only (スクリプト + 手順生成、適用は人間)。
 *   ④ 検出不能は solo に安全フォールバック (緩い側に倒す)。
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, readSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import {
  BUILTIN_GITHUB_TEMPLATES,
  COMMON_FILES,
  CONSUMER_TEAM_DEFINITION_PATH,
  PROJECT_SETUP_FILES,
  type TemplateSet,
} from "./templates";

export type SetupPhase = "0-A" | "0-B"; // 0-A=solo / 0-B=team

/** 検出結果 (生信号、判定しない)。token は含めない。 */
export interface ProjectScale {
  ownerType: "User" | "Organization" | "unknown";
  collaborators: number | null; // 取得不可は null
  hasCodeowners: boolean;
  hasBranchProtection: boolean | null; // 取得不可は null
}

export interface PhaseRecommendation {
  phase: SetupPhase;
  reason: string;
  confidence: "high" | "low";
}

export interface GeneratedFile {
  path: string; // 対象 repo 相対 path
  category: "A" | "B"; // §9.1 種別
  purpose: string;
}

export interface GithubAction {
  kind: "branch-protection";
  script_path: string;
  applied: boolean; // 既定 false (適用は applyBranchProtection)
}

export interface SetupPlan {
  phase: SetupPhase;
  files: GeneratedFile[];
  actions: GithubAction[];
  dryRun: boolean;
  teams?: TeamSlugs; // CODEOWNERS render 用 (impl: 設計 §2.2 type に team 反映を materialize)
}

export interface SetupState {
  phase: SetupPhase;
  decidedAt: string;
  decidedBy: "flag" | "confirm" | "fallback";
  signals: ProjectScale; // 4 フィールドのみ (recordSetupState で strip)
}

export interface TeamSlugs {
  tl: string;
  qa: string;
  po: string;
}

export interface SetupArgs {
  phase?: SetupPhase;
  dryRun: boolean;
  applyBranchProtection: boolean;
  teams?: TeamSlugs;
}

export interface SetupResult {
  phase: SetupPhase;
  written: string[];
  branchProtection: { applied: boolean; reason: string };
}

export interface HelixProjectImportReport {
  schemaVersion: "helix-project-import-report.v1";
  mode: "fresh" | "brownfield";
  dryRun: boolean;
  policy: "preserve_existing_then_review_import_report";
  managedPaths: string[];
  previewPaths: string[];
  existingPaths: string[];
  writtenPaths: string[];
  skippedExistingPaths: string[];
  mergeableManagedBlockPaths: string[];
  skipSubDocs: HelixProjectSkipSubDocRecord[];
  requiresReview: boolean;
  reviewRequiredReasons: string[];
  nextRoute: "ready" | "review_import_report";
}

export interface HelixProjectSkipSubDocRecord {
  marker: "skip_sub_doc";
  path: string;
  reason:
    | "dogfood_sub_doc_not_required_for_consumer_setup"
    | "consumer_owned_path_preserved_for_staged_migration";
  nextRoute: "consumer_doctor_profile" | "review_import_report";
  evidence: string;
  followUpGate: "consumer_doctor" | "import_report_review";
}

export interface HelixProjectSetupResult extends SetupResult {
  schemaVersion: "helix-project-setup.v1";
  setupCommand: "ut-tdd setup project";
  futureCommand: "helix setup project";
  githubPlan: HelixProjectGithubPlan;
  doctorBaseline: HelixProjectDoctorBaseline;
  importReport: HelixProjectImportReport;
  consumerReadiness: ConsumerReadinessPlan;
  postSetupWorkflow: HelixProjectPostSetupWorkflow;
  vscode: {
    tasksPath: string;
    statusTask: "HELIX: status";
    doctorTask: "HELIX: doctor";
    renamePlanTask: "HELIX: rename plan";
    handoverTask: "HELIX: handover status";
    teamRunTask: "HELIX: team run dry-run";
  };
  baseline: {
    statePath: string;
    memoryPath: string;
    handoverPath: string;
    evidencePath: string;
    teamsPath: string;
  };
  identifierTransition: {
    currentCli: "ut-tdd";
    currentStateDir: ".ut-tdd";
    currentArea: "area=harness";
    targetCli: "helix";
    targetStateDir: ".helix";
    targetArea: "area=helix";
    status: "blocked_pending_cutover_approval";
    mustNotApply: true;
    cutoverPlanCommand: "ut-tdd rename plan --json";
    reason: string;
  };
  commandAvailability: {
    currentCommand: "ut-tdd setup project";
    currentCommandAvailable: boolean;
    futureCommand: "helix setup project";
    futureCommandAvailable: false;
    enablementStatus: "blocked_pending_cutover_approval";
    enablementPacketCommand: "ut-tdd rename plan --json";
    reason: string;
  };
  nextCommands: string[];
}

export interface HelixProjectGithubPlan {
  schemaVersion: "helix-project-github-plan.v1";
  planOnly: true;
  appliesRemote: false;
  applyCommandAvailable: false;
  workflowPath: ".github/workflows/harness-check.yml";
  requiredChecks: ["harness-check"];
  generatedPolicyFiles: string[];
  branchProtection: {
    status: "emit_only";
    scriptPath: "scripts/setup-branch-protection.sh";
    requiresHumanApproval: true;
    reason: string;
  };
}

export interface HelixProjectDoctorBaseline {
  schemaVersion: "helix-project-doctor-baseline.v1";
  planOnly: true;
  baselineCommands: [
    "ut-tdd setup project --dry-run",
    "ut-tdd status --json",
    "ut-tdd doctor --profile consumer",
    "ut-tdd rename plan --json",
    "ut-tdd handover status --json",
    "ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
  ];
  stateBaselinePaths: [".ut-tdd/memory", ".ut-tdd/handover", ".ut-tdd/evidence", ".ut-tdd/teams"];
  completionClaimAllowed: false;
  nextRouteSource: "postSetupWorkflow.nextRoute";
  evidencePath: ".ut-tdd/evidence";
}

export interface HelixProjectPostSetupWorkflow {
  schemaVersion: "helix-project-post-setup-workflow.v1";
  nextRoute: "ready" | "review_import_report" | "fix_consumer_readiness";
  importReportRoute: HelixProjectImportReport["nextRoute"];
  readinessOk: boolean;
  manualDocSearchRequired: false;
  unmetGates: string[];
  nextActions: string[];
  verificationCommands: string[];
  verificationMatrix: Array<{
    phase: string;
    command: string;
    expected: string;
    evidence: string;
    source: string;
    sourceUrl: string;
    sourceCheckedAt: string;
    latestOfficialStatus: string;
    sourceStatusDelta: string;
    adoptionDecision: string;
    adoptionDecisionDelta: string;
    workflowRouteImpact: string;
  }>;
  blockedUntil: string[];
}

export interface CleanDistributionPlan {
  ok: boolean;
  channel: "clean-repo-plus-signed-tarball";
  sourceTag: string;
  cleanRepo: string;
  artifactPaths: string[];
  excludedPaths: string[];
  missingRequired: string[];
  denylistViolations: string[];
  releaseIntegrity: {
    required: boolean;
    artifacts: string[];
  };
}

export interface ConsumerReadinessPlan {
  ok: boolean;
  checks: { name: string; ok: boolean; message: string }[];
  objectiveBoundary: {
    scope: "consumer_setup_readiness_not_whole_program_completion";
    progressPercent: 90;
    completionClaimAllowed: false;
    objectiveAuditCommand: "ut-tdd status --json";
    completionPacketCommand: "ut-tdd completion decision-packet --json";
    versionUpPacketCommand: "ut-tdd version-up activation-packet --json";
    cutoverPacketCommand: "ut-tdd rename plan --json";
    distributionReference: {
      repo: "unison-ai-product/UT-TDD_AGENT-HARNESS-Pack";
      mainHead: "53f709fd5ce1769f54a274c8d150829c5301bc4b";
      latestTag: "v0.1.3";
    };
    versionBinding: {
      localPackageVersion: string;
      localDistributionTag: string;
      requestedDistributionTag: string;
      requestedTagMatchesPackageVersion: boolean;
      packLatestTag: "v0.1.3";
      packLatestRequiresVersionUpActivation: true;
      versionUpPacketCommand: "ut-tdd version-up activation-packet --json";
      adoptionDecision: string;
    };
    reason: string;
  };
  mode: "standalone" | "claude-only" | "codex-only" | "hybrid";
  workspace: {
    repoRoot: string;
    packageRoot: string;
    monorepo: boolean;
  };
  ci: {
    workflow: string;
    security: {
      permissions: "contents:read";
      triggers: ["push:main", "pull_request:main"];
      disallowedTriggers: ["pull_request_target"];
      secrets: "not-required";
    };
    packageResolution: {
      command: "bun run ut-tdd --version";
      requiredBefore: string[];
      remediation: string;
    };
    requires: string[];
    forkPullRequestSecrets: "not-required";
  };
  rollback: {
    managedPaths: string[];
    backupRequired: boolean;
    commands: string[];
  };
  contracts: {
    semver: string;
    tagPin: string;
    stable: string[];
  };
  smokeScenarios: string[];
}

/** gh 実行 seam (raw token 非依存 = gh の認証状態に委ねる)。test=mock。 */
export type GhRunner = (args: string[]) => { ok: boolean; stdout: string };
/** 対話確認 seam。test=mock、非対話では呼ばれない。 */
export type Confirm = (message: string) => boolean;

/** I/O・clock・gh・confirm・templates を注入 (session-log の deps パターン踏襲)。 */
export interface SetupDeps {
  repoRoot: string;
  now: () => string;
  gh: GhRunner;
  readText: (path: string) => string | null;
  writeText: (path: string, content: string) => void;
  confirm: Confirm;
  isInteractive: boolean;
  templates: TemplateSet;
  commandAvailable?: (name: string) => boolean;
  bunVersion?: () => string | null;
  packageRoot?: string;
}

const CODEOWNERS_TARGET = join(".github", "CODEOWNERS");
const STATE_PATH = join(".ut-tdd", "state", "setup.json");
const BP_SCRIPT = join("scripts", "setup-branch-protection.sh");
const MANAGED_START = "<!-- UT-TDD:managed:start -->";
const MANAGED_END = "<!-- UT-TDD:managed:end -->";
const MERGEABLE_ADAPTER_DOCS = new Set(["AGENTS.md", "CLAUDE.md", join(".claude", "CLAUDE.md")]);
const COMMITLINT_DOTFILE = "commitlint.config.js";
export const LOCAL_DISTRIBUTION_PACKAGE_VERSION = "0.1.0";
const PACK_DISTRIBUTION_REFERENCE = {
  repo: "unison-ai-product/UT-TDD_AGENT-HARNESS-Pack",
  mainHead: "53f709fd5ce1769f54a274c8d150829c5301bc4b",
  latestTag: "v0.1.3",
} as const;

/**
 * package.json が既に commitlint 設定 (`"commitlint"` キー) を宣言しているか判定する純関数。
 * repository-structure.md は commitlint を package.json に集約し root dotfile を増やさない方針
 * (root config 6 枚上限) なので、宣言済みなら setup は重複する commitlint.config.js を emit しない。
 * consumer の package.json に key が無ければ従来どおり dotfile を出す (非破壊・機能維持)。
 */
export function packageJsonDeclaresCommitlint(packageJson: string | null): boolean {
  if (!packageJson) return false;
  try {
    const parsed = JSON.parse(packageJson) as Record<string, unknown>;
    return Object.hasOwn(parsed, "commitlint");
  } catch {
    return false;
  }
}
const CLEAN_REQUIRED_PATHS = [
  "README.md",
  "LICENSE",
  "package.json",
  "src/cli.ts",
  "src/setup/index.ts",
  "docs/templates/project/.ut-tdd/teams/default-hybrid.yaml",
  ...COMMON_FILES.filter((entry) => entry.template.startsWith("adapter/")).map(
    (entry) => `docs/templates/${entry.template}`,
  ),
];
const CLEAN_DENY_PREFIXES = [
  ".ut-tdd/",
  "docs/plans/",
  "docs/design/harness/",
  "docs/test-design/",
  "docs/handover/",
  "docs/archive/",
  "src/web/",
  "vendor/",
  "legacy local state/",
];
const CLEAN_DENY_FILES = new Set(["tests/web.test.ts"]);
const CLEAN_ALLOW_PREFIXES = [
  "docs/adr/",
  "docs/governance/",
  "docs/process/",
  "docs/reference/",
  "docs/skills/",
  "docs/templates/adapter/",
  "docs/templates/github/",
  "docs/templates/project/",
  "scripts/",
  "src/",
  "tests/",
];
const CLEAN_ALLOW_FILES = new Set([
  ".editorconfig",
  ".gitattributes",
  ".github/workflows/harness-check.yml",
  "LICENSE",
  "README.md",
  "biome.json",
  "bun.lock",
  "package.json",
  "tsconfig.json",
  "vitest.config.ts",
]);

const PROJECT_GITHUB_PLAN: HelixProjectGithubPlan = {
  schemaVersion: "helix-project-github-plan.v1",
  planOnly: true,
  appliesRemote: false,
  applyCommandAvailable: false,
  workflowPath: ".github/workflows/harness-check.yml",
  requiredChecks: ["harness-check"],
  generatedPolicyFiles: [
    ".github/workflows/harness-check.yml",
    ".github/ISSUE_TEMPLATE/recovery.md",
    ".github/ISSUE_TEMPLATE/add-feature.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
  ],
  branchProtection: {
    status: "emit_only",
    scriptPath: "scripts/setup-branch-protection.sh",
    requiresHumanApproval: true,
    reason:
      "branch protection / required check application is a high-impact GitHub setting and remains plan-only until explicit human approval / action-binding approval",
  },
};

function helixProjectBranchProtectionDecision(args: SetupArgs): SetupResult["branchProtection"] {
  if (args.dryRun) return { applied: false, reason: "dry-run" };
  if (args.applyBranchProtection) {
    return { applied: false, reason: "action-binding-approval-required" };
  }
  return { applied: false, reason: "emit-only" };
}

const PROJECT_DOCTOR_BASELINE: HelixProjectDoctorBaseline = {
  schemaVersion: "helix-project-doctor-baseline.v1",
  planOnly: true,
  baselineCommands: [
    "ut-tdd setup project --dry-run",
    "ut-tdd status --json",
    "ut-tdd doctor --profile consumer",
    "ut-tdd rename plan --json",
    "ut-tdd handover status --json",
    `ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
  ],
  stateBaselinePaths: [".ut-tdd/memory", ".ut-tdd/handover", ".ut-tdd/evidence", ".ut-tdd/teams"],
  completionClaimAllowed: false,
  nextRouteSource: "postSetupWorkflow.nextRoute",
  evidencePath: ".ut-tdd/evidence",
};

const CONSUMER_SETUP_SKIP_SUB_DOCS: HelixProjectSkipSubDocRecord[] = [
  {
    marker: "skip_sub_doc",
    path: "docs/plans",
    reason: "dogfood_sub_doc_not_required_for_consumer_setup",
    nextRoute: "consumer_doctor_profile",
    evidence: "consumer doctor profile intentionally does not require dogfood PLAN corpus",
    followUpGate: "consumer_doctor",
  },
  {
    marker: "skip_sub_doc",
    path: "docs/design/harness",
    reason: "dogfood_sub_doc_not_required_for_consumer_setup",
    nextRoute: "consumer_doctor_profile",
    evidence: "consumer doctor profile validates projected adapters and baseline state only",
    followUpGate: "consumer_doctor",
  },
  {
    marker: "skip_sub_doc",
    path: "docs/test-design",
    reason: "dogfood_sub_doc_not_required_for_consumer_setup",
    nextRoute: "consumer_doctor_profile",
    evidence: "postSetupWorkflow.verificationCommands includes ut-tdd doctor --profile consumer",
    followUpGate: "consumer_doctor",
  },
];

/**
 * U-SETUP-001: gh で owner 種別 / collaborator 数 / 既存 protection を読む。**never throws**。
 * gh 不在/未認証/権限不足 → unknown/null。token は読まない (gh 認証状態に委譲)。
 */
export function detectProjectScale(deps: SetupDeps): ProjectScale {
  const hasCodeowners = readNonEmpty(deps, join(deps.repoRoot, CODEOWNERS_TARGET));
  let ownerType: ProjectScale["ownerType"] = "unknown";
  let collaborators: number | null = null;
  let hasBranchProtection: boolean | null = null;
  try {
    // gh は repos/{owner}/{repo} placeholder を current repo に自動解決する
    const repo = deps.gh(["api", "repos/{owner}/{repo}"]);
    if (repo.ok) {
      try {
        const t = (JSON.parse(repo.stdout) as { owner?: { type?: string } })?.owner?.type;
        if (t === "User" || t === "Organization") ownerType = t;
      } catch {
        // parse 失敗 → unknown 維持
      }
      const collab = deps.gh(["api", "repos/{owner}/{repo}/collaborators"]);
      if (collab.ok) {
        try {
          const arr = JSON.parse(collab.stdout);
          if (Array.isArray(arr)) collaborators = arr.length;
        } catch {
          // 維持
        }
      }
      // protection: 200=保護あり / 404 等=なし。repo 取得できた = gh は使えるので false に確定
      hasBranchProtection = deps.gh(["api", "repos/{owner}/{repo}/branches/main/protection"]).ok;
    }
  } catch {
    // never throws — 不明信号のまま返す
  }
  return { ownerType, collaborators, hasCodeowners, hasBranchProtection };
}

/**
 * U-SETUP-002: 純関数。org / collaborators>1 / 既存 CODEOWNERS / 既存 protection → team(0-B)。
 * User かつ collaborators<=1 → solo(0-A)。不明信号 (null 単独含む) → solo(0-A) low (安全フォールバック)。
 */
export function recommendPhase(scale: ProjectScale): PhaseRecommendation {
  if (
    scale.ownerType === "Organization" ||
    (scale.collaborators ?? 0) > 1 ||
    scale.hasCodeowners ||
    scale.hasBranchProtection === true
  ) {
    return { phase: "0-B", reason: teamReason(scale), confidence: "high" };
  }
  if (scale.ownerType === "User" && scale.collaborators !== null && scale.collaborators <= 1) {
    return {
      phase: "0-A",
      reason: "個人 owner + collaborator 1 名以下 = solo",
      confidence: "high",
    };
  }
  return {
    phase: "0-A",
    reason: "信号不足 (owner/collaborator 不明)、安全側 solo に倒す",
    confidence: "low",
  };
}

function teamReason(s: ProjectScale): string {
  const why: string[] = [];
  if (s.ownerType === "Organization") why.push("org 所有");
  if ((s.collaborators ?? 0) > 1) why.push(`collaborator ${s.collaborators} 名`);
  if (s.hasCodeowners) why.push("既存 CODEOWNERS");
  if (s.hasBranchProtection === true) why.push("既存 branch protection");
  return `team 構成の信号: ${why.join(" / ")}`;
}

/**
 * U-SETUP-003: 純関数。0-A=共通(A)のみ。0-B=共通(A)+CODEOWNERS(B)+branch-protection script。
 * actions.applied は常に false (適用は applyBranchProtection)。teams は CODEOWNERS render に反映。
 */
export function planSetup(
  phase: SetupPhase,
  opts: { teams?: TeamSlugs; dryRun: boolean },
): SetupPlan {
  const files: GeneratedFile[] = COMMON_FILES.map((c) => ({ ...c.file }));
  const actions: GithubAction[] = [];
  if (phase === "0-B") {
    const teamNote = opts.teams
      ? ` (tl=${opts.teams.tl} qa=${opts.teams.qa} po=${opts.teams.po})`
      : "";
    files.push({ path: CODEOWNERS_TARGET, category: "B", purpose: `CODEOWNERS${teamNote}` });
    files.push({
      path: BP_SCRIPT,
      category: "B",
      purpose: "branch protection 適用スクリプト (emit-only)",
    });
    actions.push({ kind: "branch-protection", script_path: BP_SCRIPT, applied: false });
  }
  return {
    phase,
    files,
    actions,
    dryRun: opts.dryRun,
    ...(opts.teams ? { teams: opts.teams } : {}),
  };
}

export function planHelixProjectSetup(
  phase: SetupPhase,
  opts: { teams?: TeamSlugs; dryRun: boolean },
): SetupPlan {
  const base = planSetup(phase, opts);
  const byPath = new Map(base.files.map((file) => [file.path, file]));
  for (const entry of PROJECT_SETUP_FILES) byPath.set(entry.file.path, { ...entry.file });
  if (!byPath.has(BP_SCRIPT)) {
    byPath.set(BP_SCRIPT, {
      path: BP_SCRIPT,
      category: "A",
      purpose: "branch protection approval checklist (emit-only)",
    });
  }
  return {
    ...base,
    files: [...byPath.values()],
  };
}

/** 内部 helper (独立契約でない、U-SETUP-004 に内包): plan + templates → {path, content}[]。token 非埋込。 */
function renderArtifacts(
  plan: SetupPlan,
  templates: TemplateSet,
): { path: string; content: string }[] {
  const out: { path: string; content: string }[] = [];
  for (const f of plan.files) {
    const name = templateNameFor(f.path);
    let content = templates[name] ?? "";
    if (f.path === CODEOWNERS_TARGET && plan.teams) {
      content = content
        .replace(/\{\{TL_TEAM\}\}/g, plan.teams.tl)
        .replace(/\{\{QA_TEAM\}\}/g, plan.teams.qa)
        .replace(/\{\{PO_TEAM\}\}/g, plan.teams.po);
    }
    out.push({ path: f.path, content });
  }
  return out;
}

function templateNameFor(targetPath: string): string {
  if (targetPath === CODEOWNERS_TARGET) return "team/CODEOWNERS";
  if (targetPath === BP_SCRIPT) return "team/setup-branch-protection.sh";
  if (targetPath === "AGENTS.md") return "adapter/AGENTS.md";
  if (targetPath === "CLAUDE.md") return "adapter/CLAUDE.md";
  if (targetPath === join(".codex", "config.toml")) return "adapter/.codex/config.toml";
  if (targetPath === join(".codex", "hooks.json")) return "adapter/.codex/hooks.json";
  if (targetPath === join(".claude", "CLAUDE.md")) return "adapter/.claude/CLAUDE.md";
  if (targetPath === join(".claude", "settings.json")) return "adapter/.claude/settings.json";
  if (targetPath === join(".vscode", "tasks.json")) return "project/.vscode/tasks.json";
  if (targetPath === join(".vscode", "settings.json")) return "project/.vscode/settings.json";
  if (targetPath === join(".ut-tdd", "memory", ".gitkeep")) {
    return "project/.ut-tdd/memory/.gitkeep";
  }
  if (targetPath === join(".ut-tdd", "handover", ".gitkeep")) {
    return "project/.ut-tdd/handover/.gitkeep";
  }
  if (targetPath === join(".ut-tdd", "evidence", ".gitkeep")) {
    return "project/.ut-tdd/evidence/.gitkeep";
  }
  if (targetPath === join(".ut-tdd", "teams", "default-hybrid.yaml")) {
    return "project/.ut-tdd/teams/default-hybrid.yaml";
  }
  if (targetPath.startsWith(`${join(".claude", "agents")}${sep}`)) {
    return `adapter/.claude/agents/${basename(targetPath)}`;
  }
  if (targetPath.startsWith(`${join(".claude", "commands")}${sep}`)) {
    return `adapter/.claude/commands/${basename(targetPath)}`;
  }
  return `common/${basename(targetPath)}`;
}

function mergeManagedBlock(existing: string | null, rendered: string): string | null {
  if (existing === null) return rendered;
  const start = rendered.indexOf(MANAGED_START);
  const end = rendered.indexOf(MANAGED_END);
  if (start === -1 || end === -1 || end < start) return null;
  const managed = rendered.slice(start, end + MANAGED_END.length);
  const existingStart = existing.indexOf(MANAGED_START);
  const existingEnd = existing.indexOf(MANAGED_END);
  if (existingStart !== -1 && existingEnd !== -1 && existingEnd >= existingStart) {
    const next =
      existing.slice(0, existingStart) + managed + existing.slice(existingEnd + MANAGED_END.length);
    return next.endsWith("\n") ? next : `${next}\n`;
  }
  const prefix = existing.endsWith("\n") ? existing : `${existing}\n`;
  return `${prefix}\n${managed}\n`;
}

function normalizeDistributionPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.\/+/, "");
}

function isDeniedCleanPath(path: string): boolean {
  const p = normalizeDistributionPath(path);
  if (CLEAN_DENY_FILES.has(p)) return true;
  return CLEAN_DENY_PREFIXES.some((prefix) => p === prefix.slice(0, -1) || p.startsWith(prefix));
}

function isAllowedCleanPath(path: string): boolean {
  const p = normalizeDistributionPath(path);
  if (CLEAN_ALLOW_FILES.has(p)) return true;
  return CLEAN_ALLOW_PREFIXES.some((prefix) => p.startsWith(prefix));
}

function hasMinimumBun(version: string, minimum = "1.3.0"): boolean {
  const parse = (v: string): number[] => {
    const match = v.match(/\d+(?:\.\d+){0,2}/)?.[0] ?? "0";
    return match.split(".").map((n) => Number.parseInt(n, 10));
  };
  const a = parse(version);
  const b = parse(minimum);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av !== bv) return av > bv;
  }
  return true;
}

export function buildCleanDistributionPlan(input: {
  paths: string[];
  sourceTag?: string;
  cleanRepo?: string;
}): CleanDistributionPlan {
  const sourceTag = input.sourceTag ?? "unreleased";
  const cleanRepo = input.cleanRepo ?? "UNISON-TECHNOLOGY/ut-tdd-agent-harness-clean";
  const normalized = [...new Set(input.paths.map(normalizeDistributionPath))].sort();
  const artifactPaths = normalized.filter(
    (path) => isAllowedCleanPath(path) && !isDeniedCleanPath(path),
  );
  const artifactSet = new Set(artifactPaths);
  const missingRequired = CLEAN_REQUIRED_PATHS.filter((path) => !artifactSet.has(path));
  const denylistViolations = artifactPaths.filter(isDeniedCleanPath);
  const excludedPaths = normalized.filter((path) => !artifactSet.has(path));
  return {
    ok: missingRequired.length === 0 && denylistViolations.length === 0,
    channel: "clean-repo-plus-signed-tarball",
    sourceTag,
    cleanRepo,
    artifactPaths,
    excludedPaths,
    missingRequired,
    denylistViolations,
    releaseIntegrity: {
      required: true,
      artifacts: [`${sourceTag}.tar.gz`, `${sourceTag}.tar.gz.sha256`, `${sourceTag}.tar.gz.sig`],
    },
  };
}

export function buildConsumerReadinessPlan(input: {
  bunVersion: string | null;
  hasGit: boolean;
  hasGh: boolean;
  hasUtTddCli?: boolean;
  hasClaude: boolean;
  hasCodex: boolean;
  repoRoot: string;
  packageRoot?: string;
  tag?: string;
  packageVersion?: string;
}): ConsumerReadinessPlan {
  const bunOk = Boolean(input.bunVersion && hasMinimumBun(input.bunVersion));
  const packageVersion = input.packageVersion ?? LOCAL_DISTRIBUTION_PACKAGE_VERSION;
  const localDistributionTag = `v${packageVersion}`;
  const tag = input.tag ?? localDistributionTag;
  const requestedTagMatchesPackageVersion = tag === localDistributionTag;
  const mode =
    input.hasClaude && input.hasCodex
      ? "hybrid"
      : input.hasClaude
        ? "claude-only"
        : input.hasCodex
          ? "codex-only"
          : "standalone";
  const runtimeOk = input.hasClaude || input.hasCodex;
  const checks = [
    {
      name: "bun>=1.3",
      ok: bunOk,
      message: bunOk ? `Bun ${input.bunVersion}` : "setup 前に Bun 1.3 以上を install する",
    },
    {
      name: "git",
      ok: input.hasGit,
      message: input.hasGit ? "git 利用可能" : "tag-pin 更新前に git を install する",
    },
    {
      name: "distribution-version-binding",
      ok: requestedTagMatchesPackageVersion,
      message: requestedTagMatchesPackageVersion
        ? `sourceTag ${tag} は package.json version ${packageVersion} と一致`
        : `sourceTag ${tag} は package.json version ${packageVersion} 由来の ${localDistributionTag} と不一致。採用前に version-up activation decision を記録する`,
    },
    {
      name: "gh",
      ok: input.hasGh,
      message: input.hasGh
        ? "gh 利用可能"
        : "GitHub setup 用に gh を install する。local setup は継続可能",
    },
    {
      name: "ut-tdd-cli",
      ok: input.hasUtTddCli === true,
      message:
        input.hasUtTddCli === true
          ? "projected hook 用の `ut-tdd` が PATH 上で解決できる"
          : "setup 前に harness package で `bun link`、consumer repo で `bun link ut-tdd` を実行する",
    },
    {
      name: "runtime-cli",
      ok: runtimeOk,
      message: runtimeOk
        ? `mode=${mode}`
        : "review gate 前に claude または codex を install / login する",
    },
  ];
  const packageRoot = input.packageRoot ?? input.repoRoot;
  return {
    ok:
      bunOk &&
      input.hasGit &&
      requestedTagMatchesPackageVersion &&
      input.hasUtTddCli === true &&
      runtimeOk,
    checks,
    objectiveBoundary: {
      scope: "consumer_setup_readiness_not_whole_program_completion",
      progressPercent: 90,
      completionClaimAllowed: false,
      objectiveAuditCommand: "ut-tdd status --json",
      completionPacketCommand: "ut-tdd completion decision-packet --json",
      versionUpPacketCommand: "ut-tdd version-up activation-packet --json",
      cutoverPacketCommand: "ut-tdd rename plan --json",
      distributionReference: PACK_DISTRIBUTION_REFERENCE,
      versionBinding: {
        localPackageVersion: packageVersion,
        localDistributionTag,
        requestedDistributionTag: tag,
        requestedTagMatchesPackageVersion,
        packLatestTag: PACK_DISTRIBUTION_REFERENCE.latestTag,
        packLatestRequiresVersionUpActivation: true,
        versionUpPacketCommand: "ut-tdd version-up activation-packet --json",
        adoptionDecision:
          "Pack latest tag is a reference source only; adopting it over the local package tag requires a recorded version-up activation decision",
      },
      reason:
        "consumer setup readiness only means the projected adapter/package path can run; it does not approve version-up activation, PLAN-M-02 cutover, or whole-program L14 completion",
    },
    mode,
    workspace: {
      repoRoot: input.repoRoot,
      packageRoot,
      monorepo:
        normalizeDistributionPath(packageRoot) !== normalizeDistributionPath(input.repoRoot),
    },
    ci: {
      workflow: ".github/workflows/harness-check.yml",
      security: {
        permissions: "contents:read",
        triggers: ["push:main", "pull_request:main"],
        disallowedTriggers: ["pull_request_target"],
        secrets: "not-required",
      },
      packageResolution: {
        command: "bun run ut-tdd --version",
        requiredBefore: [
          "bun run ut-tdd setup project --dry-run --json",
          "bun run ut-tdd doctor --profile consumer --json",
          "bun run ut-tdd rename plan --json",
          `bun run ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
        ],
        remediation:
          "consumer package.json に HELIX harness package/bin を解決できる dependency または approved link/install route を追加する",
      },
      requires: [
        "actions/checkout@v4",
        "oven-sh/setup-bun@v2",
        "bun install --frozen-lockfile",
        "bun run ut-tdd --version",
        "bun run ut-tdd setup project --dry-run --json",
        "bun run ut-tdd status --json",
        "bun run ut-tdd doctor --profile consumer --json",
        "bun run ut-tdd rename plan --json",
        "bun run ut-tdd handover status --json",
        `bun run ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
        "bun run typecheck",
        "bun run test",
      ],
      forkPullRequestSecrets: "not-required",
    },
    rollback: {
      managedPaths: [
        ...COMMON_FILES.map((entry) => normalizeDistributionPath(entry.file.path)),
        ".ut-tdd/state/setup.json",
      ],
      backupRequired: true,
      commands: [`git switch ${tag}`, "ut-tdd setup --dry-run", "ut-tdd setup --solo"],
    },
    contracts: {
      semver: "0.x may add capabilities; breaking public contract changes require migration notes",
      tagPin: `github:UNISON-TECHNOLOGY/ut-tdd-agent-harness-clean#${tag}`,
      stable: [
        "CLI surface",
        "adapter managed markers",
        ".ut-tdd state schema",
        "Claude/Codex adapter hook templates",
        "Claude subagent and slash-command templates",
        "hook event schema",
        "team yaml schema",
      ],
    },
    smokeScenarios: [
      "clean repo -> setup --dry-run -> doctor",
      "brownfield repo -> setup twice -> consumer 行を保持",
      "tag bump -> setup --dry-run -> rollback command 利用可能",
      "consumer CI -> repository secret 不要で harness-check green",
      "monorepo package root -> adapter path は repo-root scoped のまま",
    ],
  };
}

/**
 * U-SETUP-004: render → 書込。dryRun は書かず path 一覧を返すのみ。既存上書きは confirm 経由。
 * 生成内容に token を埋め込まない (render は templates と team slug のみ)。書いた path を返す。
 */
export function emitSetup(plan: SetupPlan, templates: TemplateSet, deps: SetupDeps): string[] {
  const rendered = renderArtifacts(plan, templates);
  if (plan.dryRun) return rendered.map((r) => r.path);
  const written: string[] = [];
  // governance (repository-structure.md): commitlint は package.json に集約し dotfile を増やさない。
  // 対象 repo の package.json が既に commitlint を宣言済みなら、重複する root dotfile は emit しない。
  const skipCommitlintDotfile = packageJsonDeclaresCommitlint(
    deps.readText(join(deps.repoRoot, "package.json")),
  );
  for (const r of rendered) {
    if (r.path === COMMITLINT_DOTFILE && skipCommitlintDotfile) continue;
    const abs = join(deps.repoRoot, r.path);
    const existing = deps.readText(abs);
    const exists = existing !== null;
    if (exists && MERGEABLE_ADAPTER_DOCS.has(r.path)) {
      const merged = mergeManagedBlock(existing, r.content);
      if (merged === null) continue;
      if (merged !== existing) {
        deps.writeText(abs, merged);
        written.push(r.path);
      }
      continue;
    }
    if (exists && !deps.confirm(`${r.path} は既存です。上書きしますか？`)) continue;
    deps.writeText(abs, r.content);
    written.push(r.path);
  }
  return written;
}

function existingManagedPaths(plan: SetupPlan, templates: TemplateSet, deps: SetupDeps): string[] {
  return renderArtifacts(plan, templates)
    .map((r) => r.path)
    .filter((path) => deps.readText(join(deps.repoRoot, path)) !== null);
}

function buildHelixProjectImportReport(input: {
  plan: SetupPlan;
  templates: TemplateSet;
  existingPaths: string[];
  emittedPaths: string[];
}): HelixProjectImportReport {
  const managedPaths = renderArtifacts(input.plan, input.templates).map((r) => r.path);
  const actualWrittenPaths = input.plan.dryRun ? [] : input.emittedPaths;
  const writtenSet = new Set(actualWrittenPaths);
  const existingSet = new Set(input.existingPaths);
  const mergeableManagedBlockPaths = managedPaths.filter(
    (path) => existingSet.has(path) && MERGEABLE_ADAPTER_DOCS.has(path),
  );
  const mergeableSet = new Set(mergeableManagedBlockPaths);
  const skippedExistingPaths = input.existingPaths.filter(
    (path) => !writtenSet.has(path) && !mergeableSet.has(path),
  );
  const requiresReview = skippedExistingPaths.length > 0;
  const skipSubDocs = [
    ...CONSUMER_SETUP_SKIP_SUB_DOCS,
    ...skippedExistingPaths.map(
      (path): HelixProjectSkipSubDocRecord => ({
        marker: "skip_sub_doc",
        path,
        reason: "consumer_owned_path_preserved_for_staged_migration",
        nextRoute: "review_import_report",
        evidence: "importReport.skippedExistingPaths",
        followUpGate: "import_report_review",
      }),
    ),
  ];
  return {
    schemaVersion: "helix-project-import-report.v1",
    mode: input.existingPaths.length > 0 ? "brownfield" : "fresh",
    dryRun: input.plan.dryRun,
    policy: "preserve_existing_then_review_import_report",
    managedPaths,
    previewPaths: managedPaths,
    existingPaths: input.existingPaths,
    writtenPaths: actualWrittenPaths,
    skippedExistingPaths,
    mergeableManagedBlockPaths,
    skipSubDocs,
    requiresReview,
    reviewRequiredReasons: requiresReview ? ["existing_non_mergeable_paths_preserved"] : [],
    nextRoute: requiresReview ? "review_import_report" : "ready",
  };
}

function buildHelixSetupConsumerReadiness(deps: SetupDeps): ConsumerReadinessPlan {
  const commandAvailable = deps.commandAvailable ?? (() => false);
  return buildConsumerReadinessPlan({
    bunVersion: deps.bunVersion?.() ?? null,
    hasGit: commandAvailable("git"),
    hasGh: commandAvailable("gh"),
    hasUtTddCli: commandAvailable("ut-tdd"),
    hasClaude: commandAvailable("claude"),
    hasCodex: commandAvailable("codex"),
    repoRoot: deps.repoRoot,
    ...(deps.packageRoot ? { packageRoot: deps.packageRoot } : {}),
  });
}

function buildHelixProjectPostSetupWorkflow(input: {
  importReport: HelixProjectImportReport;
  consumerReadiness: ConsumerReadinessPlan;
}): HelixProjectPostSetupWorkflow {
  const failedChecks = input.consumerReadiness.checks.filter((check) => !check.ok);
  const failedBlockingChecks = input.consumerReadiness.ok ? [] : failedChecks;
  const unmetGates = [
    ...(input.importReport.requiresReview ? ["import_report_review"] : []),
    ...failedBlockingChecks.map((check) => `consumer_readiness:${check.name}`),
  ];
  const nextRoute = input.importReport.requiresReview
    ? "review_import_report"
    : input.consumerReadiness.ok
      ? "ready"
      : "fix_consumer_readiness";
  const nextActions =
    nextRoute === "review_import_report"
      ? [
          "apply 前に importReport.skippedExistingPaths と importReport.skipSubDocs を確認し、consumer-owned config を merge または受容する",
          "import report 解消後に `ut-tdd setup project --dry-run` を再実行する",
          `HELIX work 開始前に \`ut-tdd status --json\`、\`ut-tdd doctor --profile consumer\`、\`ut-tdd rename plan --json\`、\`ut-tdd handover status --json\`、\`ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json\` を実行する`,
        ]
      : nextRoute === "fix_consumer_readiness"
        ? [
            ...failedBlockingChecks.map((check) => check.message),
            "readiness check が green になった後に `ut-tdd setup project --dry-run` を再実行する",
            `HELIX work 開始前に \`ut-tdd status --json\`、\`ut-tdd doctor --profile consumer\`、\`ut-tdd rename plan --json\`、\`ut-tdd handover status --json\`、\`ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json\` を実行する`,
          ]
        : [
            "`ut-tdd status --json` を実行する",
            "`ut-tdd doctor --profile consumer` を実行する",
            "`ut-tdd rename plan --json` を実行し、PLAN-M-02 承認前の HELIX alias/state が blocked packet のままであることを確認する",
            "`ut-tdd handover status --json` を実行し、active handover または current PLAN route から開始する",
            `\`ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json\` を dry-run し、worker/reviewer の provider 分離を確認する`,
          ];
  const blockedUntil = [
    ...(input.importReport.requiresReview ? ["importReport.requiresReview=false"] : []),
    ...failedBlockingChecks.map((check) => `${check.name}=ok`),
    "PLAN-M-02 cutover/action-binding approval before using `helix setup project` or `.helix` state",
  ];
  const verificationMatrix = buildHelixProjectPostSetupVerificationMatrix();
  return {
    schemaVersion: "helix-project-post-setup-workflow.v1",
    nextRoute,
    importReportRoute: input.importReport.nextRoute,
    readinessOk: input.consumerReadiness.ok,
    manualDocSearchRequired: false,
    unmetGates,
    nextActions,
    verificationCommands: verificationMatrix.map((row) => row.command),
    verificationMatrix,
    blockedUntil,
  };
}

function buildHelixProjectPostSetupVerificationMatrix(): HelixProjectPostSetupWorkflow["verificationMatrix"] {
  return [
    {
      phase: "setup-dry-run",
      command: "ut-tdd setup project --dry-run",
      expected:
        "returns the import report, VSCode tasks, local baseline paths, command availability, and PLAN-M-02 cutover blocker without writing files",
      evidence: "setup dry-run text or JSON output saved in the consumer repository review record",
      source: "VS Code workspace task contract",
      sourceUrl: "https://code.visualstudio.com/docs/debugtest/tasks",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus:
        "VS Code Tasks official docs current for workspace tasks and shell task configuration",
      sourceStatusDelta:
        "none; setup keeps generated tasks explicit and does not enable automatic task execution",
      adoptionDecision:
        "VS Code Tasks は shell task と problemMatcher=[] に限定し、自動実行や外部 install を setup が有効化しない",
      adoptionDecisionDelta: "none; keep task projection non-automatic and reviewable",
      workflowRouteImpact:
        "task contract drift routes to consumer doctor/template repair before first HELIX work",
    },
    {
      phase: "status-frontier",
      command: "ut-tdd status --json",
      expected:
        "returns objective progress, workflowNextAction, workflowNextActions, and completionReadiness before HELIX work starts",
      evidence: "status JSON attached to the first-run readiness record",
      source: "HELIX status and completion decision packet contract",
      sourceUrl: "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local HELIX L3 status/completion contract current at HEAD",
      sourceStatusDelta:
        "none; setup still requires status frontier evidence before treating the project as ready",
      adoptionDecision:
        "status は objective progress と workflowNextActions を初回稼働証跡として保存し、doctor green を完了 claim に読み替えない",
      adoptionDecisionDelta:
        "none; completion readiness remains separate from consumer setup success",
      workflowRouteImpact:
        "missing status frontier evidence routes to fix_consumer_readiness before implementation starts",
    },
    {
      phase: "consumer-doctor",
      command: "ut-tdd doctor --profile consumer",
      expected:
        "passes the consumer profile against projected adapters, VSCode tasks, and .ut-tdd baselines without requiring dogfood docs",
      evidence: "consumer doctor output with profile=consumer",
      source: "VS Code Workspace Trust and consumer adapter safety contract",
      sourceUrl: "https://code.visualstudio.com/docs/editing/workspaces/workspace-trust",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus:
        "VS Code Workspace Trust official docs current for restricted-mode execution boundary",
      sourceStatusDelta:
        "none; consumer doctor keeps automatic execution disabled and checks projected adapters",
      adoptionDecision:
        "Workspace Trust の自動コード実行境界に合わせ、task.allowAutomaticTasks=off と runOn/folderOpen 不使用を consumer doctor で検査する",
      adoptionDecisionDelta: "none; projected VS Code tasks remain manual verification surfaces",
      workflowRouteImpact: "consumer doctor failure routes to fix_consumer_readiness, not ready",
    },
    {
      phase: "identifier-cutover-packet",
      command: "ut-tdd rename plan --json",
      expected:
        "returns blocked_pending_cutover_approval with planOnly=true, mustNotApply=true, applyCommandAvailable=false, and the current cutoverSnapshot before any helix alias/state activation",
      evidence: "rename plan JSON attached to the first-run readiness record",
      source: "PLAN-M-02 HELIX identifier rename cutover packet",
      sourceUrl: "docs/plans/PLAN-M-02-helix-identifier-rename.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local PLAN-M-02 cutover packet contract current at HEAD",
      sourceStatusDelta:
        "none; setup remains on ut-tdd/.ut-tdd until cutover approval records bind the current snapshot",
      adoptionDecision:
        "setup 初回検証は rename plan の blocked packet を保存し、HELIX alias/state がまだ有効でないことを証跡化する",
      adoptionDecisionDelta:
        "none; future helix command activation stays behind PLAN-M-02 cutover/action-binding approval",
      workflowRouteImpact:
        "rename packet drift or accidental ready/apply surface routes back to L14 cutover review before project start",
    },
    {
      phase: "handover-route",
      command: "ut-tdd handover status --json",
      expected:
        "returns active handover route or confirms normal start so the first project action is anchored",
      evidence: "handover status JSON attached to the first-run readiness record",
      source: "handover route contract",
      sourceUrl: "docs/test-design/harness/L7-unit-test-design.md#18-u-hover-handover",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local handover route contract current at HEAD",
      sourceStatusDelta:
        "none; first action remains anchored by active handover or normal-start evidence",
      adoptionDecision:
        "handover status で active handover または通常開始を確認してから最初の HELIX 作業へ入る",
      adoptionDecisionDelta:
        "none; setup does not invent a work route without handover/status evidence",
      workflowRouteImpact:
        "handover route absence keeps the first action in fix_consumer_readiness",
    },
    {
      phase: "team-run-dry-run",
      command: `ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
      expected:
        "parses the distributed default hybrid team definition and returns a dry-run launch plan with Codex worker and Claude reviewer separation",
      evidence: "team run JSON dry-run output attached to the first-run readiness record",
      source: "HELIX team definition schema and provider handover contract",
      sourceUrl: "docs/design/harness/L6-function-design/agent-slots.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local team definition and provider handover contract current at HEAD",
      sourceStatusDelta:
        "none; distributed default team remains dry-run only for first-run verification",
      adoptionDecision:
        "AGENTS.md の team run 案内は配布 YAML と dry-run 検証へ接続し、実 provider 実行や外部 API 呼び出しなしに初回導線を検証する",
      adoptionDecisionDelta:
        "none; provider separation stays evidence-only until the user starts real work",
      workflowRouteImpact:
        "team dry-run failure routes to consumer readiness repair before parallel work",
    },
  ];
}

/**
 * U-SETUP-005: setup.json を上書き (単一ファイル = 確定値 SSoT、append しない)。
 * signals は 4 フィールドのみ strip (認証情報混入経路を遮断)。
 */
export function recordSetupState(state: SetupState, deps: SetupDeps): void {
  const stripped: SetupState = {
    phase: state.phase,
    decidedAt: state.decidedAt,
    decidedBy: state.decidedBy,
    signals: {
      ownerType: state.signals.ownerType,
      collaborators: state.signals.collaborators,
      hasCodeowners: state.signals.hasCodeowners,
      hasBranchProtection: state.signals.hasBranchProtection,
    },
  };
  deps.writeText(join(deps.repoRoot, STATE_PATH), `${JSON.stringify(stripped, null, 2)}\n`);
}

/**
 * U-SETUP-006: apply≠true → emit-only (既定)。isInteractive≠true → non-interactive で gh 非実行。
 * 対話下でも action-binding approval 入力が無い現行 setup では gh api 実行へ進まない。
 */
export function applyBranchProtection(
  plan: SetupPlan,
  deps: SetupDeps,
  opts: { apply: boolean },
): { applied: boolean; reason: string } {
  if (opts.apply !== true) return { applied: false, reason: "emit-only" };
  // ガバナンス: 非対話での無人適用を precondition で封鎖
  if (deps.isInteractive !== true) return { applied: false, reason: "non-interactive" };
  const action = plan.actions.find((a) => a.kind === "branch-protection");
  if (!action) return { applied: false, reason: "no-action" };
  return { applied: false, reason: "action-binding-approval-required" };
}

/**
 * U-SETUP-007: orchestration。phase = フラグ > confirm(recommend(detect)) > fallback(solo)。
 * 確定 → record → plan → emit → (apply は opt-in)。非対話+フラグ無し → 0-A。
 * invariant: --apply-branch-protection は対話のみ有効 (applyBranchProtection の precondition が保証)。
 * invariant: dryRun=true は副作用ゼロ (state 非書込・remote 非適用、branchProtection.reason="dry-run")。
 */
export function runSetup(args: SetupArgs, deps: SetupDeps): SetupResult {
  const scale = detectProjectScale(deps);
  const { phase, decidedBy } = decideSetupPhase(args, deps, scale);

  // dry-run は副作用ゼロ契約 (CLI help「書き込まない」)。state 書込も remote 適用も行わない。
  // emit は plan.dryRun で既に非書込だが、record/apply は dryRun を見ないため runSetup 側で封鎖する。
  if (!args.dryRun) {
    recordSetupState({ phase, decidedAt: deps.now(), decidedBy, signals: scale }, deps);
  }
  const plan = planSetup(phase, { teams: args.teams, dryRun: args.dryRun });
  const written = emitSetup(plan, deps.templates, deps);
  const branchProtection = args.dryRun
    ? { applied: false, reason: "dry-run" }
    : applyBranchProtection(plan, deps, { apply: args.applyBranchProtection });
  return { phase, written, branchProtection };
}

export function runHelixProjectSetup(args: SetupArgs, deps: SetupDeps): HelixProjectSetupResult {
  const scale = detectProjectScale(deps);
  const { phase, decidedBy } = decideSetupPhase(args, deps, scale);
  if (!args.dryRun) {
    recordSetupState({ phase, decidedAt: deps.now(), decidedBy, signals: scale }, deps);
  }
  const plan = planHelixProjectSetup(phase, { teams: args.teams, dryRun: args.dryRun });
  const existingPaths = existingManagedPaths(plan, deps.templates, deps);
  const written = emitSetup(plan, deps.templates, deps);
  const importReport = buildHelixProjectImportReport({
    plan,
    templates: deps.templates,
    existingPaths,
    emittedPaths: written,
  });
  const consumerReadiness = buildHelixSetupConsumerReadiness(deps);
  const postSetupWorkflow = buildHelixProjectPostSetupWorkflow({
    importReport,
    consumerReadiness,
  });
  const branchProtection = helixProjectBranchProtectionDecision(args);
  const currentCommandAvailable =
    consumerReadiness.checks.find((check) => check.name === "ut-tdd-cli")?.ok ?? false;
  return {
    schemaVersion: "helix-project-setup.v1",
    setupCommand: "ut-tdd setup project",
    futureCommand: "helix setup project",
    githubPlan: PROJECT_GITHUB_PLAN,
    doctorBaseline: PROJECT_DOCTOR_BASELINE,
    phase,
    written,
    branchProtection,
    importReport,
    consumerReadiness,
    postSetupWorkflow,
    vscode: {
      tasksPath: join(".vscode", "tasks.json"),
      statusTask: "HELIX: status",
      doctorTask: "HELIX: doctor",
      renamePlanTask: "HELIX: rename plan",
      handoverTask: "HELIX: handover status",
      teamRunTask: "HELIX: team run dry-run",
    },
    baseline: {
      statePath: STATE_PATH,
      memoryPath: join(".ut-tdd", "memory"),
      handoverPath: join(".ut-tdd", "handover"),
      evidencePath: join(".ut-tdd", "evidence"),
      teamsPath: join(".ut-tdd", "teams"),
    },
    identifierTransition: {
      currentCli: "ut-tdd",
      currentStateDir: ".ut-tdd",
      currentArea: "area=harness",
      targetCli: "helix",
      targetStateDir: ".helix",
      targetArea: "area=helix",
      status: "blocked_pending_cutover_approval",
      mustNotApply: true,
      cutoverPlanCommand: "ut-tdd rename plan --json",
      reason:
        "setup が生成 state を .ut-tdd から .helix へ切り替えるには PLAN-M-02 cutover/action-binding approval が必要。",
    },
    commandAvailability: {
      currentCommand: "ut-tdd setup project",
      currentCommandAvailable,
      futureCommand: "helix setup project",
      futureCommandAvailable: false,
      enablementStatus: "blocked_pending_cutover_approval",
      enablementPacketCommand: "ut-tdd rename plan --json",
      reason:
        "`helix` command 名は post-cutover target。package/bin alias activation には PLAN-M-02 cutover/action-binding approval が必要。",
    },
    nextCommands: postSetupWorkflow.verificationCommands,
  };
}

function decideSetupPhase(
  args: SetupArgs,
  deps: SetupDeps,
  scale: ProjectScale,
): { phase: SetupPhase; decidedBy: SetupState["decidedBy"] } {
  if (args.phase) {
    return { phase: args.phase, decidedBy: "flag" };
  }
  if (deps.isInteractive) {
    const rec = recommendPhase(scale);
    const ok = deps.confirm(
      `検出: owner=${scale.ownerType}, collaborators=${scale.collaborators ?? "?"}, ` +
        `CODEOWNERS=${scale.hasCodeowners ? "あり" : "なし"} → 推奨 ${rec.phase} (${rec.reason})。` +
        `${rec.phase === "0-B" ? "team" : "solo"} 設定を生成しますか？`,
    );
    return { phase: ok ? rec.phase : "0-A", decidedBy: "confirm" };
  }
  return { phase: "0-A", decidedBy: "fallback" };
}

// ── node 実 deps (real I/O / gh / confirm / templates) ──────────────────────

function readNonEmpty(deps: SetupDeps, path: string): boolean {
  const t = deps.readText(path);
  return t !== null && t.trim().length > 0;
}

/** gh CLI 実行。失敗 (不在/未認証/非0) は {ok:false}。token は扱わない (gh 認証に委譲)。 */
export function nodeGh(args: string[]): { ok: boolean; stdout: string } {
  try {
    const stdout = execFileSync("gh", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return { ok: true, stdout };
  } catch (e) {
    const stdout = (e as { stdout?: string })?.stdout;
    return { ok: false, stdout: typeof stdout === "string" ? stdout : "" };
  }
}

/** 対話確認 (isInteractive 時のみ呼ばれる)。stdin から 1 行同期読取。 */
function nodeConfirm(message: string): boolean {
  process.stderr.write(`${message} [y/N] `);
  try {
    const buf = Buffer.alloc(16);
    const n = readSync(0, buf, 0, 16, null);
    const ans = buf.toString("utf8", 0, n).trim().toLowerCase();
    return ans === "y" || ans === "yes";
  } catch {
    return false;
  }
}

function nodeCommandAvailable(name: string): boolean {
  try {
    execFileSync(name, ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

function nodeBunVersion(): string | null {
  try {
    return execFileSync("bun", ["--version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

/** docs/templates/github/{common,team}/ 配下を TemplateSet (相対名→内容) に読み込む。 */
export function loadTemplates(repoRoot: string): TemplateSet {
  const set: TemplateSet = { ...BUILTIN_GITHUB_TEMPLATES };
  const walk = (root: string, dir: string, prefix = ""): void => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) walk(root, abs, prefix);
      else set[`${prefix}${relative(root, abs).split(sep).join("/")}`] = readFileSync(abs, "utf8");
    }
  };
  const githubRoot = join(repoRoot, "docs", "templates", "github");
  walk(githubRoot, githubRoot);
  const adapterRoot = join(repoRoot, "docs", "templates", "adapter");
  walk(adapterRoot, adapterRoot, "adapter/");
  const projectRoot = join(repoRoot, "docs", "templates", "project");
  walk(projectRoot, projectRoot, "project/");
  return set;
}

export function nodeSetupDeps(repoRoot: string): SetupDeps {
  return {
    repoRoot,
    now: () => new Date().toISOString(),
    gh: nodeGh,
    readText: (p) => (existsSync(p) ? readFileSync(p, "utf8") : null),
    writeText: (p, c) => {
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, c);
    },
    confirm: nodeConfirm,
    isInteractive: Boolean(process.stdin.isTTY) && Boolean(process.stderr.isTTY) && !process.env.CI,
    templates: loadTemplates(repoRoot),
    commandAvailable: nodeCommandAvailable,
    bunVersion: nodeBunVersion,
  };
}
