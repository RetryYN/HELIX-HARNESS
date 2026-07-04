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
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, readSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, sep } from "node:path";
import { parse as parseYaml } from "yaml";
import {
  BUILTIN_GITHUB_TEMPLATES,
  COMMON_FILES,
  CONSUMER_CLAUDE_AGENT_NAMES,
  CONSUMER_CLAUDE_COMMAND_NAMES,
  CONSUMER_TEAM_DEFINITION_PATH,
  PROJECT_SETUP_FILES,
  type TemplateSet,
} from "./templates";

export type SetupPhase = "0-A" | "0-B"; // 0-A=solo / 0-B=team
export const PACK_DISTRIBUTION_REMOTE_URL =
  "https://github.com/RetryYN/HELIX-HARNESS-OS.git";
export const PACK_DISTRIBUTION_REFERENCE = {
  repo: "RetryYN/HELIX-HARNESS-OS",
  mainHead: "a43771ab091486520a4970f6b19b1663a009d4d0",
  latestTag: "v0.1.4",
} as const;
export const CONSUMER_VERSION_UP_DRY_RUN_COMMAND = `ut-tdd version-up dry-run --current v0.1.0 --target ${PACK_DISTRIBUTION_REFERENCE.latestTag} --release-remote ${PACK_DISTRIBUTION_REMOTE_URL} --json`;
export const CONSUMER_VERSION_UP_DRY_RUN_BUN_COMMAND = `bun run ${CONSUMER_VERSION_UP_DRY_RUN_COMMAND}`;

export const CONSUMER_CI_RUN_COMMANDS = [
  "bun install --frozen-lockfile",
  "bun run ut-tdd --version",
  "bun run ut-tdd setup project --dry-run --json",
  "bun run ut-tdd status --json",
  "bun run ut-tdd completion decision-packet --json",
  "bun run ut-tdd completion review-bundle --json",
  CONSUMER_VERSION_UP_DRY_RUN_BUN_COMMAND,
  "bun run ut-tdd doctor --profile consumer --json",
  "bun run ut-tdd rename plan --json",
  "bun run ut-tdd handover status --json",
  `bun run ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
  "bun run typecheck",
  "bun run test",
] as const;

export const CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS = [
  "bun install --frozen-lockfile",
  "bun run ut-tdd handover status --json",
  "bun run ut-tdd completion decision-packet --json",
  "bun run ut-tdd completion review-bundle --json",
  "bun run ut-tdd doctor --profile consumer --json",
] as const;

export const CONSUMER_VSCODE_TASK_COMMANDS = [
  ["HELIX: status", "bun run ut-tdd status"],
  ["HELIX: doctor", "bun run ut-tdd doctor --profile consumer"],
  ["HELIX: completion decision-packet", "bun run ut-tdd completion decision-packet --json"],
  ["HELIX: completion review-bundle", "bun run ut-tdd completion review-bundle --json"],
  ["HELIX: version-up dry-run", CONSUMER_VERSION_UP_DRY_RUN_BUN_COMMAND],
  ["HELIX: rename plan", "bun run ut-tdd rename plan --json"],
  ["HELIX: handover status", "bun run ut-tdd handover status --json"],
  ["HELIX: setup dry-run", "bun run ut-tdd setup project --dry-run"],
  [
    "HELIX: team run dry-run",
    `bun run ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
  ],
] as const;

export function extractWorkflowRunCommands(workflow: string): string[] {
  return workflow
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(?:-\s*)?run:\s*(.+?)\s*$/)?.[1]?.trim())
    .filter((command): command is string => Boolean(command))
    .map((command) => command.replace(/^['"]|['"]$/g, ""));
}

export function workflowRunCommandsExactlyMatchConsumerCi(workflow: string): boolean {
  const commands = extractWorkflowRunCommands(workflow);
  return (
    commands.length === CONSUMER_CI_RUN_COMMANDS.length &&
    CONSUMER_CI_RUN_COMMANDS.every((command, index) => commands[index] === command)
  );
}

function parseJsonRecord(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function problemMatcherIsEmpty(value: unknown): boolean {
  return Array.isArray(value) && value.length === 0;
}

function runOptionsAreManual(value: unknown): boolean {
  if (value === undefined) return true;
  if (!isRecord(value)) return false;
  const runOn = value.runOn;
  return runOn === undefined || runOn === "default";
}

export function consumerVscodeTasksExactlyMatchSetupContract(tasksText: string): boolean {
  const parsed = parseJsonRecord(tasksText);
  const tasks = parsed?.tasks;
  if (parsed?.version !== "2.0.0" || !Array.isArray(tasks)) return false;
  if (tasks.length !== CONSUMER_VSCODE_TASK_COMMANDS.length) return false;

  return CONSUMER_VSCODE_TASK_COMMANDS.every(([label, command], index) => {
    const task = tasks[index];
    if (!isRecord(task)) return false;
    return (
      task.label === label &&
      task.command === command &&
      task.type === "shell" &&
      problemMatcherIsEmpty(task.problemMatcher) &&
      runOptionsAreManual(task.runOptions) &&
      task.options === undefined
    );
  });
}

export function consumerVscodeSettingsDisableAutomaticTasks(settingsText: string): boolean {
  return parseJsonRecord(settingsText)?.["task.allowAutomaticTasks"] === "off";
}

function parseYamlRecord(text: string): Record<string, unknown> | null {
  try {
    return recordFromUnknown(parseYaml(text) as unknown);
  } catch {
    return null;
  }
}

function recordFromUnknown(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

type RequiredHookCommand = {
  event: string;
  matcher?: string;
  command: string;
  blockOnFailure?: true;
};

const CONSUMER_CLAUDE_REQUIRED_HOOKS: RequiredHookCommand[] = [
  {
    event: "PreToolUse",
    matcher: "Agent|Task",
    command: "ut-tdd hook agent-guard",
    blockOnFailure: true,
  },
  {
    event: "PreToolUse",
    matcher: "Edit|Write|MultiEdit",
    command: "ut-tdd hook work-guard",
    blockOnFailure: true,
  },
  {
    event: "PreToolUse",
    matcher: "Bash",
    command: "ut-tdd hook git-command-guard",
    blockOnFailure: true,
  },
  { event: "SessionStart", command: "ut-tdd session start" },
  {
    event: "PostToolUse",
    matcher: "Edit|Write|MultiEdit|Bash",
    command: "ut-tdd hook post-tool-use",
  },
  { event: "Stop", command: "ut-tdd session summary" },
  { event: "SubagentStop", command: "ut-tdd hook subagent-stop" },
];

const CONSUMER_CODEX_REQUIRED_HOOKS: RequiredHookCommand[] = [
  {
    event: "PreToolUse",
    matcher: "spawn_agent|spawn_agents_on_csv",
    command: "ut-tdd hook agent-guard",
    blockOnFailure: true,
  },
  {
    event: "PreToolUse",
    matcher: "apply_patch|write_file",
    command: "ut-tdd hook work-guard",
    blockOnFailure: true,
  },
  {
    event: "PreToolUse",
    matcher: "exec_command|local_shell",
    command: "ut-tdd hook git-command-guard",
    blockOnFailure: true,
  },
  { event: "SessionStart", command: "ut-tdd session start" },
  {
    event: "PostToolUse",
    matcher: "apply_patch|write_file|exec_command|local_shell",
    command: "ut-tdd hook post-tool-use",
  },
  { event: "Stop", command: "ut-tdd session summary" },
];

function hookConfigMatchesContract(text: string, requiredHooks: RequiredHookCommand[]): boolean {
  const parsed = parseJsonRecord(text);
  const hooksByEvent = recordFromUnknown(parsed?.hooks);
  if (!hooksByEvent) return false;

  return requiredHooks.every((required) => {
    const entries = hooksByEvent[required.event];
    if (!Array.isArray(entries)) return false;
    return entries.some((entry) => {
      if (!isRecord(entry)) return false;
      if (required.matcher !== undefined && entry.matcher !== required.matcher) return false;
      const hooks = entry.hooks;
      if (!Array.isArray(hooks)) return false;
      return hooks.some((hook) => {
        if (!isRecord(hook)) return false;
        return (
          hook.type === "command" &&
          hook.command === required.command &&
          (required.blockOnFailure !== true || hook.blockOnFailure === true)
        );
      });
    });
  });
}

export function consumerClaudeHookSettingsMatchContract(settingsText: string): boolean {
  return hookConfigMatchesContract(settingsText, CONSUMER_CLAUDE_REQUIRED_HOOKS);
}

export function consumerCodexHookSettingsMatchContract(hooksText: string): boolean {
  return hookConfigMatchesContract(hooksText, CONSUMER_CODEX_REQUIRED_HOOKS);
}

export function consumerCodexConfigEnablesHooks(configText: string): boolean {
  let inFeatures = false;
  for (const rawLine of configText.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (line.length === 0) continue;
    const section = line.match(/^\[([^\]]+)\]$/)?.[1]?.trim();
    if (section) {
      inFeatures = section === "features";
      continue;
    }
    if (inFeatures && /^hooks\s*=\s*true$/.test(line)) {
      return true;
    }
  }
  return false;
}

export interface ConsumerCiWorkflowContract {
  ok: boolean;
  nameOk: boolean;
  pushMain: boolean;
  pullRequestMain: boolean;
  unexpectedTriggers: string[];
  noPullRequestTarget: boolean;
  permissionsRead: boolean;
  tokenWrite: boolean;
  jobOk: boolean;
  checkoutPersistCredentialsFalse: boolean;
  checkoutInputsExact: boolean;
  setupBunInputsEmpty: boolean;
  customEnvFree: boolean;
  skipOrSoftFailFree: boolean;
  jobPermissionsFixed: boolean;
  executionSurfaceFixed: boolean;
  missingUses: string[];
  unexpectedUses: string[];
  missingRuns: string[];
  exactSteps: boolean;
  exactRuns: boolean;
  secretsFree: boolean;
}

export interface ConsumerEscalationWorkflowContract {
  ok: boolean;
  nameOk: boolean;
  scheduleOk: boolean;
  unexpectedTriggers: string[];
  noPullRequestTarget: boolean;
  permissionsRead: boolean;
  tokenWrite: boolean;
  jobOk: boolean;
  checkoutPersistCredentialsFalse: boolean;
  checkoutInputsExact: boolean;
  setupBunInputsEmpty: boolean;
  customEnvFree: boolean;
  skipOrSoftFailFree: boolean;
  jobPermissionsFixed: boolean;
  executionSurfaceFixed: boolean;
  missingUses: string[];
  unexpectedUses: string[];
  missingRuns: string[];
  exactSteps: boolean;
  exactRuns: boolean;
  secretsFree: boolean;
  placeholderFree: boolean;
}

export function analyzeConsumerCiWorkflowContract(
  workflowText: string,
): ConsumerCiWorkflowContract {
  const workflow = parseYamlRecord(workflowText);
  const workflowOn = recordFromUnknown(workflow?.on);
  const push = recordFromUnknown(workflowOn?.push);
  const pullRequest = recordFromUnknown(workflowOn?.pull_request);
  const permissionsRaw = workflow?.permissions;
  const permissions = recordFromUnknown(permissionsRaw);
  const jobs = recordFromUnknown(workflow?.jobs);
  const harnessJob = recordFromUnknown(jobs?.["harness-check"]);
  const steps = Array.isArray(harnessJob?.steps) ? harnessJob.steps : [];
  const stepRecords = steps
    .map(recordFromUnknown)
    .filter((step): step is Record<string, unknown> => Boolean(step));
  const requiredUses = ["actions/checkout@v4", "oven-sh/setup-bun@v2"];
  const requiredRuns = [...CONSUMER_CI_RUN_COMMANDS];
  const expectedSteps = [
    ...requiredUses.map((use) => ({ key: "uses", value: use })),
    ...requiredRuns.map((run) => ({ key: "run", value: run })),
  ];
  const missingUses = requiredUses.filter((use) => !stepRecords.some((step) => step.uses === use));
  const checkoutStep = stepRecords.find((step) => step.uses === "actions/checkout@v4");
  const checkoutWith = recordFromUnknown(checkoutStep?.with);
  const checkoutPersistCredentialsFalse =
    checkoutWith?.["persist-credentials"] === false ||
    checkoutWith?.["persist-credentials"] === "false";
  const checkoutInputsExact =
    checkoutWith !== null &&
    Object.keys(checkoutWith).length === 1 &&
    Object.hasOwn(checkoutWith, "persist-credentials");
  const setupBunStep = stepRecords.find((step) => step.uses === "oven-sh/setup-bun@v2");
  const setupBunWith = recordFromUnknown(setupBunStep?.with);
  const setupBunInputsEmpty = setupBunWith === null || Object.keys(setupBunWith).length === 0;
  const actualUses = stepRecords
    .map((step) => step.uses)
    .filter((use): use is string => typeof use === "string");
  const unexpectedUses = actualUses.filter((use) => !requiredUses.includes(use));
  const missingRuns = requiredRuns.filter((run) => !stepRecords.some((step) => step.run === run));
  const workflowOnKeys = workflowOn ? Object.keys(workflowOn).sort() : [];
  const unexpectedTriggers = workflowOnKeys.filter(
    (key) => !["pull_request", "push"].includes(key),
  );
  const permissionsRead = permissions?.contents === "read";
  const tokenWrite =
    typeof permissionsRaw === "string"
      ? /write/i.test(permissionsRaw)
      : permissions
        ? Object.values(permissions).some((value) => value === "write")
        : false;
  const exactSteps =
    stepRecords.length === expectedSteps.length &&
    expectedSteps.every((expected, index) => stepRecords[index]?.[expected.key] === expected.value);
  const customEnvFree =
    !Object.hasOwn(workflow ?? {}, "env") &&
    !Object.hasOwn(harnessJob ?? {}, "env") &&
    stepRecords.every((step) => !Object.hasOwn(step, "env"));
  const skipOrSoftFailFree =
    !Object.hasOwn(harnessJob ?? {}, "if") &&
    !Object.hasOwn(harnessJob ?? {}, "continue-on-error") &&
    stepRecords.every(
      (step) => !Object.hasOwn(step, "if") && !Object.hasOwn(step, "continue-on-error"),
    );
  const jobPermissionsFixed = !Object.hasOwn(harnessJob ?? {}, "permissions");
  const executionSurfaceFixed =
    !Object.hasOwn(workflow ?? {}, "concurrency") &&
    !Object.hasOwn(workflow ?? {}, "defaults") &&
    !Object.hasOwn(harnessJob ?? {}, "concurrency") &&
    !Object.hasOwn(harnessJob ?? {}, "defaults") &&
    !Object.hasOwn(harnessJob ?? {}, "environment") &&
    !Object.hasOwn(harnessJob ?? {}, "needs") &&
    !Object.hasOwn(harnessJob ?? {}, "strategy") &&
    !Object.hasOwn(harnessJob ?? {}, "timeout-minutes") &&
    !Object.hasOwn(harnessJob ?? {}, "container") &&
    !Object.hasOwn(harnessJob ?? {}, "services") &&
    !Object.hasOwn(harnessJob ?? {}, "uses") &&
    !Object.hasOwn(harnessJob ?? {}, "secrets") &&
    stepRecords.every(
      (step) =>
        !Object.hasOwn(step, "shell") &&
        !Object.hasOwn(step, "timeout-minutes") &&
        !Object.hasOwn(step, "working-directory"),
    );
  const contract = {
    ok: false,
    nameOk: workflow?.name === "harness-check",
    pushMain: stringList(push?.branches).includes("main"),
    pullRequestMain: stringList(pullRequest?.branches).includes("main"),
    unexpectedTriggers,
    noPullRequestTarget: workflowOn ? !Object.hasOwn(workflowOn, "pull_request_target") : false,
    permissionsRead,
    tokenWrite,
    jobOk: harnessJob?.["runs-on"] === "ubuntu-latest",
    checkoutPersistCredentialsFalse,
    checkoutInputsExact,
    setupBunInputsEmpty,
    customEnvFree,
    skipOrSoftFailFree,
    jobPermissionsFixed,
    executionSurfaceFixed,
    missingUses,
    unexpectedUses,
    missingRuns,
    exactSteps,
    exactRuns: workflowRunCommandsExactlyMatchConsumerCi(workflowText),
    secretsFree: !/\bsecrets\s*(?:\.|\[)/i.test(workflowText),
  };
  return {
    ...contract,
    ok:
      contract.nameOk &&
      contract.pushMain &&
      contract.pullRequestMain &&
      contract.unexpectedTriggers.length === 0 &&
      contract.noPullRequestTarget &&
      contract.permissionsRead &&
      !contract.tokenWrite &&
      contract.jobOk &&
      contract.checkoutPersistCredentialsFalse &&
      contract.checkoutInputsExact &&
      contract.setupBunInputsEmpty &&
      contract.customEnvFree &&
      contract.skipOrSoftFailFree &&
      contract.jobPermissionsFixed &&
      contract.executionSurfaceFixed &&
      contract.missingUses.length === 0 &&
      contract.unexpectedUses.length === 0 &&
      contract.missingRuns.length === 0 &&
      contract.exactSteps &&
      contract.exactRuns &&
      contract.secretsFree,
  };
}

export function analyzeConsumerEscalationWorkflowContract(
  workflowText: string,
): ConsumerEscalationWorkflowContract {
  const workflow = parseYamlRecord(workflowText);
  const workflowOn = recordFromUnknown(workflow?.on);
  const schedule = Array.isArray(workflowOn?.schedule) ? workflowOn.schedule : [];
  const permissionsRaw = workflow?.permissions;
  const permissions = recordFromUnknown(permissionsRaw);
  const jobs = recordFromUnknown(workflow?.jobs);
  const auditJob = recordFromUnknown(jobs?.["escalation-audit"]);
  const steps = Array.isArray(auditJob?.steps) ? auditJob.steps : [];
  const stepRecords = steps
    .map(recordFromUnknown)
    .filter((step): step is Record<string, unknown> => Boolean(step));
  const requiredUses = ["actions/checkout@v4", "oven-sh/setup-bun@v2"];
  const requiredRuns = [...CONSUMER_ESCALATION_WORKFLOW_RUN_COMMANDS];
  const expectedSteps = [
    ...requiredUses.map((use) => ({ key: "uses", value: use })),
    ...requiredRuns.map((run) => ({ key: "run", value: run })),
  ];
  const actualUses = stepRecords
    .map((step) => step.uses)
    .filter((use): use is string => typeof use === "string");
  const missingUses = requiredUses.filter((use) => !stepRecords.some((step) => step.uses === use));
  const unexpectedUses = actualUses.filter((use) => !requiredUses.includes(use));
  const missingRuns = requiredRuns.filter((run) => !stepRecords.some((step) => step.run === run));
  const checkoutStep = stepRecords.find((step) => step.uses === "actions/checkout@v4");
  const checkoutWith = recordFromUnknown(checkoutStep?.with);
  const checkoutPersistCredentialsFalse =
    checkoutWith?.["persist-credentials"] === false ||
    checkoutWith?.["persist-credentials"] === "false";
  const checkoutInputsExact =
    checkoutWith !== null &&
    Object.keys(checkoutWith).length === 1 &&
    Object.hasOwn(checkoutWith, "persist-credentials");
  const setupBunStep = stepRecords.find((step) => step.uses === "oven-sh/setup-bun@v2");
  const setupBunWith = recordFromUnknown(setupBunStep?.with);
  const setupBunInputsEmpty = setupBunWith === null || Object.keys(setupBunWith).length === 0;
  const workflowOnKeys = workflowOn ? Object.keys(workflowOn).sort() : [];
  const unexpectedTriggers = workflowOnKeys.filter((key) => key !== "schedule");
  const permissionsRead = permissions?.contents === "read";
  const tokenWrite =
    typeof permissionsRaw === "string"
      ? /write/i.test(permissionsRaw)
      : permissions
        ? Object.values(permissions).some((value) => value === "write")
        : false;
  const customEnvFree =
    !Object.hasOwn(workflow ?? {}, "env") &&
    !Object.hasOwn(auditJob ?? {}, "env") &&
    stepRecords.every((step) => !Object.hasOwn(step, "env"));
  const skipOrSoftFailFree =
    !Object.hasOwn(auditJob ?? {}, "if") &&
    !Object.hasOwn(auditJob ?? {}, "continue-on-error") &&
    stepRecords.every(
      (step) => !Object.hasOwn(step, "if") && !Object.hasOwn(step, "continue-on-error"),
    );
  const jobPermissionsFixed = !Object.hasOwn(auditJob ?? {}, "permissions");
  const executionSurfaceFixed =
    !Object.hasOwn(workflow ?? {}, "concurrency") &&
    !Object.hasOwn(workflow ?? {}, "defaults") &&
    !Object.hasOwn(auditJob ?? {}, "concurrency") &&
    !Object.hasOwn(auditJob ?? {}, "defaults") &&
    !Object.hasOwn(auditJob ?? {}, "environment") &&
    !Object.hasOwn(auditJob ?? {}, "needs") &&
    !Object.hasOwn(auditJob ?? {}, "strategy") &&
    !Object.hasOwn(auditJob ?? {}, "timeout-minutes") &&
    !Object.hasOwn(auditJob ?? {}, "container") &&
    !Object.hasOwn(auditJob ?? {}, "services") &&
    !Object.hasOwn(auditJob ?? {}, "uses") &&
    !Object.hasOwn(auditJob ?? {}, "secrets") &&
    stepRecords.every(
      (step) =>
        !Object.hasOwn(step, "shell") &&
        !Object.hasOwn(step, "timeout-minutes") &&
        !Object.hasOwn(step, "working-directory"),
    );
  const exactSteps =
    stepRecords.length === expectedSteps.length &&
    expectedSteps.every((expected, index) => stepRecords[index]?.[expected.key] === expected.value);
  const commands = extractWorkflowRunCommands(workflowText);
  const exactRuns =
    commands.length === requiredRuns.length &&
    requiredRuns.every((command, index) => commands[index] === command);
  const contract = {
    ok: false,
    nameOk: workflow?.name === "escalation-stale",
    scheduleOk: schedule.length === 1 && recordFromUnknown(schedule[0])?.cron === "0 0 * * 1",
    unexpectedTriggers,
    noPullRequestTarget: workflowOn ? !Object.hasOwn(workflowOn, "pull_request_target") : false,
    permissionsRead,
    tokenWrite,
    jobOk: auditJob?.["runs-on"] === "ubuntu-latest",
    checkoutPersistCredentialsFalse,
    checkoutInputsExact,
    setupBunInputsEmpty,
    customEnvFree,
    skipOrSoftFailFree,
    jobPermissionsFixed,
    executionSurfaceFixed,
    missingUses,
    unexpectedUses,
    missingRuns,
    exactSteps,
    exactRuns,
    secretsFree: !/\bsecrets\s*(?:\.|\[)/i.test(workflowText),
    placeholderFree: !/\b(?:placeholder|TODO|TBD|FIXME)\b/i.test(workflowText),
  };
  return {
    ...contract,
    ok:
      contract.nameOk &&
      contract.scheduleOk &&
      contract.unexpectedTriggers.length === 0 &&
      contract.noPullRequestTarget &&
      contract.permissionsRead &&
      !contract.tokenWrite &&
      contract.jobOk &&
      contract.checkoutPersistCredentialsFalse &&
      contract.checkoutInputsExact &&
      contract.setupBunInputsEmpty &&
      contract.customEnvFree &&
      contract.skipOrSoftFailFree &&
      contract.jobPermissionsFixed &&
      contract.executionSurfaceFixed &&
      contract.missingUses.length === 0 &&
      contract.unexpectedUses.length === 0 &&
      contract.missingRuns.length === 0 &&
      contract.exactSteps &&
      contract.exactRuns &&
      contract.secretsFree &&
      contract.placeholderFree,
  };
}

export function branchProtectionScriptIsApprovalOnly(scriptText: string): boolean {
  const mutatingPatterns = [
    /\bgh\s+api\b/i,
    /\bgh\s+auth\b/i,
    /\b-X\s+(?:PUT|POST|PATCH|DELETE)\b/i,
    /\/branches\/main\/protection/i,
    /\brulesets?\b/i,
    /\bGITHUB_TOKEN\b/i,
    /\bsecrets?\s*(?:\.|\[)/i,
  ];
  return (
    scriptText.includes("action-binding approval") &&
    scriptText.includes("remote GitHub API") &&
    scriptText.includes("exit 2") &&
    !mutatingPatterns.some((pattern) => pattern.test(scriptText))
  );
}

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

export interface HelixProjectSetupState {
  schemaVersion: "helix-project-setup-state.v1";
  setupCommand: "ut-tdd setup project";
  phase: SetupPhase;
  decidedAt: string;
  decidedBy: "flag" | "confirm" | "fallback";
  objectiveBoundary: ConsumerReadinessPlan["objectiveBoundary"];
  postSetupWorkflow: Pick<
    HelixProjectPostSetupWorkflow,
    "nextRoute" | "readinessOk" | "verificationCommands" | "verificationMatrix"
  >;
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
  identicalManagedPaths: string[];
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
    profileName: "HELIX";
    profileOpenCommand: "code --profile HELIX .";
    profileSourceUrl: "https://code.visualstudio.com/docs/configure/command-line";
    profileSourceCheckedAt: "2026-07-03";
    statusTask: "HELIX: status";
    completionDecisionPacketTask: "HELIX: completion decision-packet";
    completionReviewBundleTask: "HELIX: completion review-bundle";
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
    "ut-tdd setup project --dry-run --json",
    "ut-tdd completion decision-packet --json",
    "ut-tdd completion review-bundle --json",
    "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
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
  manualVerificationCommands: string[];
  dryRunVerificationCommands: string[];
  postApplyVerificationCommands: string[];
  verificationMatrix: Array<{
    phase: string;
    command: string;
    writePolicy: "no-write";
    availability: "dry-run-immediate" | "post-apply-or-projected" | "manual-local";
    requiresMaterializedPaths: string[];
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
  artifactReadiness: ConsumerArtifactReadinessPlan;
  objectiveBoundary: {
    scope: "consumer_setup_readiness_not_whole_program_completion";
    progressPercent: 90;
    completionClaimAllowed: false;
    objectiveAuditCommand: "ut-tdd status --json";
    completionPacketCommand: "ut-tdd completion decision-packet --json";
    completionReviewBundleCommand: "ut-tdd completion review-bundle --json";
    versionUpPacketCommand: "ut-tdd version-up activation-packet --json";
    cutoverPacketCommand: "ut-tdd rename plan --json";
    distributionReference: {
      repo: "RetryYN/HELIX-HARNESS-OS";
      mainHead: "a43771ab091486520a4970f6b19b1663a009d4d0";
      latestTag: "v0.1.4";
    };
    versionBinding: {
      localPackageVersion: string;
      localDistributionTag: string;
      requestedDistributionTag: string;
      requestedTagMatchesPackageVersion: boolean;
      packLatestTag: "v0.1.4";
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
  cliResolution: {
    command: "ut-tdd";
    checkedFrom: string;
    resolved: boolean;
    strategy: "path" | "package-script" | "missing";
    bareCommandResolved: boolean;
    packageScriptAvailable: boolean;
    evidence: string;
    fallbackCommands: string[];
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
    packagePreflight: {
      installCommand: "bun install --frozen-lockfile";
      lockfiles: ["bun.lock", "bun.lockb"];
      requiredScripts: ["ut-tdd", "typecheck", "test"];
      scriptCommands: ["bun run ut-tdd --version", "bun run typecheck", "bun run test"];
      source: "Bun install / lockfile / package scripts official documentation";
      sourceUrl: "https://bun.com/docs/pm/cli/install";
      lockfileSourceUrl: "https://bun.com/docs/pm/lockfile";
      scriptsSourceUrl: "https://bun.com/docs/quickstart";
      sourceCheckedAt: "2026-07-03";
      latestOfficialStatus: string;
      sourceStatusDelta: string;
      adoptionDecision: string;
      workflowRouteImpact: string;
    };
    distributionPackageSurface: {
      checked: boolean;
      source:
        | "current-clean-artifact-link"
        | "package-script-probe"
        | "released-pack-tag"
        | "not-supplied";
      tag: string;
      requiredCommands: string[];
      ok: boolean;
      evidence: string;
      remediation: string;
      sourceCheckedAt: "2026-07-04";
      latestObservedStatus: string;
      workflowRouteImpact: string;
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

export interface ConsumerArtifactReadinessPlan {
  ok: boolean;
  checks: {
    name: string;
    path: string;
    ok: boolean;
    message: string;
    evidence: string;
  }[];
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
  runCommand?: (
    cwd: string,
    command: string,
    args: string[],
  ) => { status: number; stderr: string; stdout: string };
  packageRoot?: string;
}

const CODEOWNERS_TARGET = join(".github", "CODEOWNERS");
const STATE_PATH = join(".ut-tdd", "state", "setup.json");
const PROJECT_SETUP_STATE_PATH = join(".ut-tdd", "state", "project-setup.json");
const PROJECT_PACKAGE_JSON = "package.json";
const PROJECT_BUN_LOCK = "bun.lock";
const BP_SCRIPT = join("scripts", "setup-branch-protection.sh");
const MANAGED_START = "<!-- UT-TDD:managed:start -->";
const MANAGED_END = "<!-- UT-TDD:managed:end -->";
const MERGEABLE_ADAPTER_DOCS = new Set(["AGENTS.md", "CLAUDE.md", join(".claude", "CLAUDE.md")]);
const MERGEABLE_PACKAGE_JSON = new Set([PROJECT_PACKAGE_JSON]);
const COMMITLINT_DOTFILE = "commitlint.config.js";
export const LOCAL_DISTRIBUTION_PACKAGE_VERSION = "0.1.0";
const LOCAL_DISTRIBUTION_PACKAGE_SPEC = "github:RetryYN/HELIX-HARNESS";
const LOCAL_TYPESCRIPT_PACKAGE_SPEC = "^5.6.3";

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

export function packageJsonDeclaresScript(packageJson: string | null, scriptName: string): boolean {
  if (!packageJson) return false;
  try {
    const parsed = JSON.parse(packageJson) as { scripts?: Record<string, unknown> };
    return typeof parsed.scripts?.[scriptName] === "string";
  } catch {
    return false;
  }
}

export function packageJsonDeclaresUtTddScript(packageJson: string | null): boolean {
  return packageJsonDeclaresScript(packageJson, "ut-tdd");
}

function mergeConsumerPackageJson(existing: string | null, scaffold: string): string | null {
  try {
    const base = existing
      ? (JSON.parse(existing) as Record<string, unknown>)
      : (JSON.parse(scaffold) as Record<string, unknown>);
    const wanted = JSON.parse(scaffold) as {
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
    };
    const scripts =
      base.scripts && typeof base.scripts === "object" && !Array.isArray(base.scripts)
        ? (base.scripts as Record<string, unknown>)
        : {};
    for (const [key, value] of Object.entries(wanted.scripts ?? {})) {
      if (typeof scripts[key] !== "string") scripts[key] = value;
    }
    base.scripts = scripts;
    const devDependencies =
      base.devDependencies &&
      typeof base.devDependencies === "object" &&
      !Array.isArray(base.devDependencies)
        ? (base.devDependencies as Record<string, unknown>)
        : {};
    if (
      typeof devDependencies["ut-tdd"] !== "string" &&
      !(
        base.dependencies &&
        typeof base.dependencies === "object" &&
        !Array.isArray(base.dependencies) &&
        typeof (base.dependencies as Record<string, unknown>)["ut-tdd"] === "string"
      )
    ) {
      devDependencies["ut-tdd"] =
        wanted.devDependencies?.["ut-tdd"] ?? LOCAL_DISTRIBUTION_PACKAGE_SPEC;
    }
    if (typeof devDependencies.typescript !== "string") {
      devDependencies.typescript =
        wanted.devDependencies?.typescript ?? LOCAL_TYPESCRIPT_PACKAGE_SPEC;
    }
    base.devDependencies = devDependencies;
    if (typeof base.private !== "boolean") base.private = true;
    return `${JSON.stringify(base, null, 2)}\n`;
  } catch {
    return null;
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
    ".github/workflows/escalation-stale.yml",
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
    "ut-tdd setup project --dry-run --json",
    "ut-tdd completion decision-packet --json",
    "ut-tdd completion review-bundle --json",
    "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
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
  if (targetPath === PROJECT_PACKAGE_JSON) return "project/package.json";
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
  const cleanRepo = input.cleanRepo ?? "RetryYN/HELIX-HARNESS-OS";
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
  hasUtTddPackageScript?: boolean;
  hasTypecheckPackageScript?: boolean;
  hasTestPackageScript?: boolean;
  hasBunLockfile?: boolean;
  artifactReadiness?: ConsumerArtifactReadinessPlan;
  hasClaude: boolean;
  hasCodex: boolean;
  repoRoot: string;
  packageRoot?: string;
  tag?: string;
  packageVersion?: string;
  distributionPackageSurface?: {
    checked: boolean;
    ok: boolean;
    source:
      | "current-clean-artifact-link"
      | "package-script-probe"
      | "released-pack-tag"
      | "not-supplied";
    evidence: string;
    latestObservedStatus: string;
    tag?: string;
  };
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
  const cliResolvedByPath = input.hasUtTddCli === true;
  const cliResolvedByPackageScript = input.hasUtTddPackageScript === true;
  const typecheckPackageScriptAvailable = input.hasTypecheckPackageScript === true;
  const testPackageScriptAvailable = input.hasTestPackageScript === true;
  const bunLockfileAvailable = input.hasBunLockfile === true;
  const hookCliOk = cliResolvedByPath;
  const artifactReadiness = input.artifactReadiness ?? {
    ok: true,
    checks: [
      {
        name: "artifact-readiness-not-supplied",
        path: "n/a",
        ok: true,
        message: "pure readiness input did not include projected artifact checks",
        evidence: "buildConsumerReadinessPlan.artifactReadiness omitted",
      },
    ],
  };
  const distributionPackageSurface = {
    checked: input.distributionPackageSurface?.checked ?? false,
    source: input.distributionPackageSurface?.source ?? "not-supplied",
    tag: input.distributionPackageSurface?.tag ?? tag,
    requiredCommands: [
      "bun run ut-tdd setup project --dry-run --json",
      "bun run ut-tdd status --json",
      "bun run ut-tdd completion decision-packet --json",
      "bun run ut-tdd completion review-bundle --json",
      "bun run ut-tdd doctor --profile consumer --json",
      "bun run ut-tdd rename plan --json",
      `bun run ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
    ],
    ok: input.distributionPackageSurface?.ok ?? false,
    evidence:
      input.distributionPackageSurface?.evidence ??
      "generated consumer CI command surface was not probed; readiness fails closed to avoid treating stale Pack tags as runnable",
    remediation:
      "current clean artifact link smoke または version-up activation で公開 Pack tag の CLI surface を更新してから consumer readiness を再判定する",
    sourceCheckedAt: "2026-07-04" as const,
    latestObservedStatus:
      input.distributionPackageSurface?.latestObservedStatus ??
      "not observed in this readiness input; Pack v0.1.0/v0.1.4 external probe on 2026-07-04 returned unknown option '--json' for setup project --dry-run --json",
    workflowRouteImpact:
      "missing or failing distribution package surface routes setup/distribution readiness to fix_consumer_readiness before first HELIX work",
  };
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
      ok: hookCliOk,
      message: cliResolvedByPath
        ? "projected hook 用の `ut-tdd` が PATH 上で解決できる"
        : cliResolvedByPackageScript
          ? "consumer packageRoot の `bun run ut-tdd` script は CI fallback として利用可能だが、projected hook / agent 用の bare `ut-tdd` は PATH 上で解決できない"
          : "setup 前に harness package で `bun link`、consumer repo で `bun link ut-tdd` または package.json scripts.ut-tdd を設定する",
    },
    {
      name: "ut-tdd-package-script",
      ok: cliResolvedByPackageScript,
      message: cliResolvedByPackageScript
        ? "consumer CI / VSCode task fallback 用の `bun run ut-tdd` script が packageRoot で解決できる"
        : "consumer CI / VSCode task fallback 用に packageRoot の package.json scripts.ut-tdd を用意する",
    },
    {
      name: "bun-lockfile",
      ok: bunLockfileAvailable,
      message: bunLockfileAvailable
        ? "consumer CI 用の lockfile があり `bun install --frozen-lockfile` を実行できる"
        : "生成 harness-check.yml は `bun install --frozen-lockfile` を実行するため、packageRoot に bun.lock または bun.lockb を用意する",
    },
    {
      name: "typecheck-package-script",
      ok: typecheckPackageScriptAvailable,
      message: typecheckPackageScriptAvailable
        ? "consumer CI 用の `bun run typecheck` script が packageRoot で解決できる"
        : "生成 harness-check.yml は `bun run typecheck` を実行するため、packageRoot の package.json scripts.typecheck を用意する",
    },
    {
      name: "test-package-script",
      ok: testPackageScriptAvailable,
      message: testPackageScriptAvailable
        ? "consumer CI 用の `bun run test` script が packageRoot で解決できる"
        : "生成 harness-check.yml は `bun run test` を実行するため、packageRoot の package.json scripts.test を用意する",
    },
    {
      name: "runtime-cli",
      ok: runtimeOk,
      message: runtimeOk
        ? `mode=${mode}`
        : "review gate 前に claude または codex を install / login する",
    },
    {
      name: "projected-consumer-artifacts",
      ok: artifactReadiness.ok,
      message: artifactReadiness.ok
        ? "projected adapter / VSCode task / .ut-tdd baseline / default-hybrid team が初回 HELIX 稼働契約を満たす"
        : "projected consumer artifacts が不足または意味ずれしている。artifactReadiness.checks を修正してから setup を再実行する",
    },
    {
      name: "distribution-package-surface",
      ok: distributionPackageSurface.ok,
      message: distributionPackageSurface.ok
        ? `generated consumer CI の必須 CLI surface は ${distributionPackageSurface.source} で実測済み`
        : "公開 Pack または package-local CLI が生成 consumer CI の必須 command surface を満たす証跡がない。current clean artifact link smoke または version-up activation 後に再確認する",
    },
  ];
  const packageRoot = input.packageRoot ?? input.repoRoot;
  return {
    ok:
      bunOk &&
      input.hasGit &&
      requestedTagMatchesPackageVersion &&
      hookCliOk &&
      cliResolvedByPackageScript &&
      bunLockfileAvailable &&
      typecheckPackageScriptAvailable &&
      testPackageScriptAvailable &&
      runtimeOk &&
      artifactReadiness.ok &&
      distributionPackageSurface.ok,
    checks,
    artifactReadiness,
    objectiveBoundary: {
      scope: "consumer_setup_readiness_not_whole_program_completion",
      progressPercent: 90,
      completionClaimAllowed: false,
      objectiveAuditCommand: "ut-tdd status --json",
      completionPacketCommand: "ut-tdd completion decision-packet --json",
      completionReviewBundleCommand: "ut-tdd completion review-bundle --json",
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
    cliResolution: {
      command: "ut-tdd",
      checkedFrom: packageRoot,
      resolved: hookCliOk,
      strategy: cliResolvedByPath
        ? "path"
        : cliResolvedByPackageScript
          ? "package-script"
          : "missing",
      bareCommandResolved: cliResolvedByPath,
      packageScriptAvailable: cliResolvedByPackageScript,
      evidence: cliResolvedByPath
        ? "`ut-tdd --version` resolved for consumer readiness"
        : cliResolvedByPackageScript
          ? "`bun run ut-tdd --version` is available from consumer packageRoot scripts, but bare `ut-tdd --version` did not resolve for hooks"
          : "`ut-tdd --version` and consumer packageRoot scripts.ut-tdd did not resolve for consumer readiness",
      fallbackCommands: [
        "bun run ut-tdd --version",
        "bun link ut-tdd",
        "bun run ut-tdd setup project --dry-run --json",
      ],
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
          "bun run ut-tdd completion decision-packet --json",
          "bun run ut-tdd completion review-bundle --json",
          "bun run ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
          "bun run ut-tdd doctor --profile consumer --json",
          "bun run ut-tdd rename plan --json",
          `bun run ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
        ],
        remediation:
          "consumer package.json に HELIX harness package/bin を解決できる dependency または approved link/install route を追加する",
      },
      packagePreflight: {
        installCommand: "bun install --frozen-lockfile",
        lockfiles: ["bun.lock", "bun.lockb"],
        requiredScripts: ["ut-tdd", "typecheck", "test"],
        scriptCommands: ["bun run ut-tdd --version", "bun run typecheck", "bun run test"],
        source: "Bun install / lockfile / package scripts official documentation",
        sourceUrl: "https://bun.com/docs/pm/cli/install",
        lockfileSourceUrl: "https://bun.com/docs/pm/lockfile",
        scriptsSourceUrl: "https://bun.com/docs/quickstart",
        sourceCheckedAt: "2026-07-03",
        latestOfficialStatus:
          "`bun install --frozen-lockfile` installs exact lockfile versions without updating the lockfile, errors when package.json and bun.lock disagree, and CI usage requires committing bun.lock; Bun v1.2+ uses text bun.lock while older projects may still have bun.lockb",
        sourceStatusDelta:
          "changed; consumer readiness now records Bun frozen-lockfile, lockfile, and package-script semantics as structured CI preflight metadata",
        adoptionDecision:
          "consumer CI は `bun.lock` または `bun.lockb` と package.json scripts.ut-tdd/typecheck/test が揃う場合だけ再現可能な package/bin smoke として扱う",
        workflowRouteImpact:
          "missing lockfile or required package script routes setup/distribution readiness to fix_consumer_readiness before first HELIX work",
      },
      distributionPackageSurface,
      requires: [
        "actions/checkout@v4 with persist-credentials=false",
        "oven-sh/setup-bun@v2",
        "bun install --frozen-lockfile",
        "bun run ut-tdd --version",
        "bun run ut-tdd setup project --dry-run --json",
        "bun run ut-tdd status --json",
        "bun run ut-tdd completion decision-packet --json",
        "bun run ut-tdd completion review-bundle --json",
        "bun run ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
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
      commands: [
        `git switch ${tag}`,
        "ut-tdd setup project --dry-run --json",
        "ut-tdd setup project --solo",
      ],
    },
    contracts: {
      semver: "0.x may add capabilities; breaking public contract changes require migration notes",
      tagPin: `github:RetryYN/HELIX-HARNESS-OS#${tag}`,
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

function buildConsumerArtifactReadinessPlan(
  plan: SetupPlan,
  templates: TemplateSet,
): ConsumerArtifactReadinessPlan {
  const artifacts = renderArtifacts(plan, templates);
  const byPath = new Map(artifacts.map((artifact) => [artifact.path, artifact.content]));
  const hasPath = (path: string): boolean => byPath.has(path);
  const content = (path: string): string => byPath.get(path) ?? "";
  const tasksPath = join(".vscode", "tasks.json");
  const settingsPath = join(".vscode", "settings.json");
  const claudeSettingsPath = join(".claude", "settings.json");
  const codexHooksPath = join(".codex", "hooks.json");
  const codexConfigPath = join(".codex", "config.toml");
  const workflowPath = join(".github", "workflows", "harness-check.yml");
  const escalationWorkflowPath = join(".github", "workflows", "escalation-stale.yml");
  const branchProtectionScriptPath = BP_SCRIPT;
  const teamPath = CONSUMER_TEAM_DEFINITION_PATH;
  const baselinePaths = [
    join(".ut-tdd", "memory", ".gitkeep"),
    join(".ut-tdd", "handover", ".gitkeep"),
    join(".ut-tdd", "evidence", ".gitkeep"),
    teamPath,
  ];
  const ag = content("AGENTS.md");
  const tasks = content(tasksPath);
  const settings = content(settingsPath);
  const claudeSettings = content(claudeSettingsPath);
  const codexHooks = content(codexHooksPath);
  const codexConfig = content(codexConfigPath);
  const workflow = content(workflowPath);
  const escalationWorkflow = content(escalationWorkflowPath);
  const branchProtectionScript = content(branchProtectionScriptPath);
  const team = content(teamPath);
  const codeowners = content(CODEOWNERS_TARGET);
  const codeownersRequired = plan.files.some((file) => file.path === CODEOWNERS_TARGET);
  const expectedTeamSlugs = plan.teams ? [plan.teams.tl, plan.teams.qa, plan.teams.po] : [];
  const codeownersTeamSlugsOk =
    !codeownersRequired ||
    (hasPath(CODEOWNERS_TARGET) &&
      !codeowners.includes("{{TL_TEAM}}") &&
      !codeowners.includes("{{QA_TEAM}}") &&
      !codeowners.includes("{{PO_TEAM}}") &&
      (expectedTeamSlugs.length === 0 ||
        expectedTeamSlugs.every((slug) => codeowners.includes(slug))));
  const claude = content("CLAUDE.md");
  const claudeRuntime = content(join(".claude", "CLAUDE.md"));
  const claudeAgentPaths = CONSUMER_CLAUDE_AGENT_NAMES.map((name) =>
    join(".claude", "agents", `${name}.md`),
  );
  const claudeCommandPaths = CONSUMER_CLAUDE_COMMAND_NAMES.map((name) =>
    join(".claude", "commands", `${name}.md`),
  );
  const adapterDocHasConsumerBoundary = (text: string): boolean =>
    text.includes(MANAGED_START) &&
    text.includes(MANAGED_END) &&
    text.includes("HELIX") &&
    text.includes("ut-tdd completion decision-packet --json") &&
    text.includes("ut-tdd completion review-bundle --json") &&
    text.includes(
      "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
    ) &&
    text.includes("ut-tdd doctor --profile consumer") &&
    text.includes("ut-tdd rename plan --json") &&
    /[ぁ-んァ-ヶ一-龠]/.test(text);
  const claudeAgentSurfacesOk = claudeAgentPaths.every((path) => {
    const text = content(path);
    return (
      hasPath(path) &&
      text.includes("consumer-safe な HELIX subagent") &&
      text.includes("ut-tdd completion decision-packet --json") &&
      text.includes("ut-tdd completion review-bundle --json") &&
      text.includes(
        "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
      ) &&
      text.includes("ut-tdd doctor --profile consumer") &&
      text.includes("secret、credential、PII") &&
      /[ぁ-んァ-ヶ一-龠]/.test(text)
    );
  });
  const claudeCommandSurfacesOk = claudeCommandPaths.every((path) => {
    const text = content(path);
    return (
      hasPath(path) &&
      text.includes("HELIX") &&
      text.includes("ut-tdd status --json") &&
      text.includes("ut-tdd completion decision-packet --json") &&
      text.includes("ut-tdd completion review-bundle --json") &&
      text.includes(
        "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
      ) &&
      text.includes("ut-tdd doctor --profile consumer") &&
      /[ぁ-んァ-ヶ一-龠]/.test(text)
    );
  });
  const workflowContract = analyzeConsumerCiWorkflowContract(workflow);
  const escalationWorkflowContract = analyzeConsumerEscalationWorkflowContract(escalationWorkflow);
  const checks: ConsumerArtifactReadinessPlan["checks"] = [
    {
      name: "adapter-guidance-connects-consumer-verification",
      path: "AGENTS.md",
      ok:
        hasPath("AGENTS.md") &&
        ag.includes(MANAGED_START) &&
        ag.includes(MANAGED_END) &&
        ag.includes("ut-tdd doctor --profile consumer") &&
        ag.includes(
          `ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json`,
        ),
      message:
        "AGENTS managed block must point to consumer doctor and the distributed default-hybrid team dry-run",
      evidence: "AGENTS.md managed block command surface",
    },
    {
      name: "claude-adapter-docs-carry-consumer-boundary",
      path: "CLAUDE.md,.claude/CLAUDE.md",
      ok:
        hasPath("CLAUDE.md") &&
        hasPath(join(".claude", "CLAUDE.md")) &&
        adapterDocHasConsumerBoundary(claude) &&
        adapterDocHasConsumerBoundary(claudeRuntime),
      message:
        "CLAUDE adapter docs must keep Japanese HELIX prose, completion packet preflight, version-up dry-run, consumer doctor, and rename/cutover boundary",
      evidence: "CLAUDE.md and .claude/CLAUDE.md managed block command surface",
    },
    {
      name: "claude-surface-templates-carry-completion-preflight",
      path: ".claude/agents,.claude/commands",
      ok: claudeAgentSurfacesOk && claudeCommandSurfacesOk,
      message:
        "distributed Claude subagents and slash commands must keep Japanese HELIX prose, completion packet preflight, version-up dry-run, consumer doctor, and secret/PII guardrails",
      evidence: `${claudeAgentPaths.length} agent templates and ${claudeCommandPaths.length} command templates`,
    },
    {
      name: "claude-adapter-hooks-are-structured",
      path: claudeSettingsPath,
      ok: hasPath(claudeSettingsPath) && consumerClaudeHookSettingsMatchContract(claudeSettings),
      message:
        "Claude adapter hook settings must be parseable JSON with exact guard matchers, command hooks, and blockOnFailure on hard guards",
      evidence: ".claude/settings.json structured hook contract",
    },
    {
      name: "codex-adapter-hooks-are-structured",
      path: `${codexConfigPath},${codexHooksPath}`,
      ok:
        hasPath(codexConfigPath) &&
        hasPath(codexHooksPath) &&
        consumerCodexConfigEnablesHooks(codexConfig) &&
        consumerCodexHookSettingsMatchContract(codexHooks),
      message:
        "Codex adapter hooks must be enabled and parseable JSON with exact guard matchers, command hooks, and blockOnFailure on hard guards",
      evidence: ".codex/config.toml and .codex/hooks.json structured hook contract",
    },
    {
      name: "vscode-tasks-are-manual-consumer-smoke",
      path: tasksPath,
      ok: hasPath(tasksPath) && consumerVscodeTasksExactlyMatchSetupContract(tasks),
      message:
        "VSCode tasks must expose the exact manual consumer smoke task set with shell tasks, empty problemMatcher, no task options, and no automatic run options",
      evidence: ".vscode/tasks.json schema, task labels, commands, and safety fields",
    },
    {
      name: "vscode-automatic-tasks-disabled",
      path: settingsPath,
      ok: hasPath(settingsPath) && consumerVscodeSettingsDisableAutomaticTasks(settings),
      message: "VSCode workspace settings must disable automatic tasks for consumer setup",
      evidence: ".vscode/settings.json task.allowAutomaticTasks",
    },
    {
      name: "harness-check-ci-is-read-only-consumer-smoke",
      path: workflowPath,
      ok: hasPath(workflowPath) && workflowContract.ok,
      message:
        "harness-check workflow must be a read-only, secret-free consumer smoke on push/pull_request main with fixed action inputs, no custom env, no skip or soft-pass controls, and the fixed package-local HELIX command set",
      evidence:
        ".github/workflows/harness-check.yml YAML contract for permissions, triggers, job, action inputs, env, execution controls, setup steps, and command surface",
    },
    {
      name: "escalation-stale-is-no-write-route-audit",
      path: escalationWorkflowPath,
      ok: hasPath(escalationWorkflowPath) && escalationWorkflowContract.ok,
      message:
        "escalation-stale workflow must be a scheduled read-only HELIX route audit with no placeholder step, no secret use, and the fixed handover/completion/consumer-doctor command set",
      evidence:
        ".github/workflows/escalation-stale.yml YAML contract for schedule, read-only permissions, action inputs, placeholder-free commands, and no-write route audit",
    },
    {
      name: "branch-protection-script-is-approval-only",
      path: branchProtectionScriptPath,
      ok:
        hasPath(branchProtectionScriptPath) &&
        branchProtectionScriptIsApprovalOnly(branchProtectionScript),
      message:
        "branch protection setup script must remain an approval checklist only and must not call mutating GitHub API/auth endpoints",
      evidence: "scripts/setup-branch-protection.sh approval-only script contract",
    },
    ...(codeownersRequired
      ? [
          {
            name: "team-codeowners-are-rendered-for-0-b",
            path: CODEOWNERS_TARGET,
            ok: codeownersTeamSlugsOk,
            message:
              "0-B/team setup must project CODEOWNERS with resolved team slugs and no unresolved placeholders",
            evidence: ".github/CODEOWNERS phase/team rendering contract",
          },
        ]
      : []),
    {
      name: "ut-tdd-baseline-paths-projected",
      path: ".ut-tdd",
      ok: baselinePaths.every(hasPath),
      message:
        "setup must project .ut-tdd memory, handover, evidence, and default-hybrid team baselines",
      evidence: baselinePaths.join(", "),
    },
    {
      name: "default-hybrid-team-separates-worker-reviewer",
      path: teamPath,
      ok:
        hasPath(teamPath) &&
        team.includes("name: default-hybrid") &&
        team.includes("role: se") &&
        team.includes("engine: codex-se") &&
        team.includes("role: tl") &&
        team.includes("engine: pmo-sonnet") &&
        team.includes("serialize_after: se"),
      message:
        "default-hybrid team must keep Codex worker and TL reviewer roles separate for dry-run verification",
      evidence: ".ut-tdd/teams/default-hybrid.yaml role/engine/serialization contract",
    },
  ];
  return { ok: checks.every((check) => check.ok), checks };
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
    if (existing === r.content) continue;
    if (exists && MERGEABLE_PACKAGE_JSON.has(r.path)) {
      const merged = mergeConsumerPackageJson(existing, r.content);
      if (merged === null || merged === existing) continue;
      deps.writeText(abs, merged);
      written.push(r.path);
      continue;
    }
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

function identicalManagedPaths(plan: SetupPlan, templates: TemplateSet, deps: SetupDeps): string[] {
  return renderArtifacts(plan, templates)
    .filter((r) => deps.readText(join(deps.repoRoot, r.path)) === r.content)
    .map((r) => r.path);
}

function buildHelixProjectImportReport(input: {
  plan: SetupPlan;
  templates: TemplateSet;
  existingPaths: string[];
  identicalPaths: string[];
  emittedPaths: string[];
}): HelixProjectImportReport {
  const managedPaths = renderArtifacts(input.plan, input.templates).map((r) => r.path);
  const actualWrittenPaths = input.plan.dryRun ? [] : input.emittedPaths;
  const writtenSet = new Set(actualWrittenPaths);
  const existingSet = new Set(input.existingPaths);
  const identicalSet = new Set(input.identicalPaths);
  const mergeableManagedBlockPaths = managedPaths.filter(
    (path) =>
      existingSet.has(path) &&
      (MERGEABLE_ADAPTER_DOCS.has(path) || MERGEABLE_PACKAGE_JSON.has(path)),
  );
  const mergeableSet = new Set(mergeableManagedBlockPaths);
  const skippedExistingPaths = input.existingPaths.filter(
    (path) => !writtenSet.has(path) && !mergeableSet.has(path) && !identicalSet.has(path),
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
    identicalManagedPaths: input.identicalPaths,
    writtenPaths: actualWrittenPaths,
    skippedExistingPaths,
    mergeableManagedBlockPaths,
    skipSubDocs,
    requiresReview,
    reviewRequiredReasons: requiresReview ? ["existing_non_mergeable_paths_preserved"] : [],
    nextRoute: requiresReview ? "review_import_report" : "ready",
  };
}

function buildHelixSetupConsumerReadiness(deps: SetupDeps, plan: SetupPlan): ConsumerReadinessPlan {
  const commandAvailable = deps.commandAvailable ?? (() => false);
  const packageRoot = deps.packageRoot ?? deps.repoRoot;
  const distributionPackageSurface = probeDistributionPackageSurface(deps, packageRoot);
  return buildConsumerReadinessPlan({
    bunVersion: deps.bunVersion?.() ?? null,
    hasGit: commandAvailable("git"),
    hasGh: commandAvailable("gh"),
    hasUtTddCli: commandAvailable("ut-tdd"),
    hasUtTddPackageScript: packageJsonDeclaresScript(
      deps.readText(join(packageRoot, "package.json")),
      "ut-tdd",
    ),
    hasTypecheckPackageScript: packageJsonDeclaresScript(
      deps.readText(join(packageRoot, "package.json")),
      "typecheck",
    ),
    hasTestPackageScript: packageJsonDeclaresScript(
      deps.readText(join(packageRoot, "package.json")),
      "test",
    ),
    hasBunLockfile:
      deps.readText(join(packageRoot, "bun.lock")) !== null ||
      deps.readText(join(packageRoot, "bun.lockb")) !== null,
    artifactReadiness: buildConsumerArtifactReadinessPlan(plan, deps.templates),
    hasClaude: commandAvailable("claude"),
    hasCodex: commandAvailable("codex"),
    repoRoot: deps.repoRoot,
    distributionPackageSurface,
    ...(deps.packageRoot ? { packageRoot: deps.packageRoot } : {}),
  });
}

function probeDistributionPackageSurface(
  deps: SetupDeps,
  packageRoot: string,
): NonNullable<Parameters<typeof buildConsumerReadinessPlan>[0]["distributionPackageSurface"]> {
  if (!deps.runCommand) {
    return {
      checked: false,
      ok: false,
      source: "not-supplied",
      tag: `v${LOCAL_DISTRIBUTION_PACKAGE_VERSION}`,
      evidence: "runCommand seam is unavailable; package-local generated CI surface was not probed",
      latestObservedStatus: "not observed",
    };
  }
  if (process.env.UT_TDD_SETUP_SURFACE_PROBE === "1") {
    return {
      checked: false,
      ok: false,
      source: "not-supplied",
      tag: `v${LOCAL_DISTRIBUTION_PACKAGE_VERSION}`,
      evidence: "nested setup surface probe suppressed to avoid recursive self-probing",
      latestObservedStatus: "nested probe suppressed",
    };
  }
  const previousProbe = process.env.UT_TDD_SETUP_SURFACE_PROBE;
  process.env.UT_TDD_SETUP_SURFACE_PROBE = "1";
  let result: { status: number; stderr: string; stdout: string };
  try {
    result = deps.runCommand(packageRoot, "bun", ["run", "ut-tdd", "setup", "project", "--help"]);
  } finally {
    if (previousProbe === undefined) delete process.env.UT_TDD_SETUP_SURFACE_PROBE;
    else process.env.UT_TDD_SETUP_SURFACE_PROBE = previousProbe;
  }
  const output = `${result.stdout}\n${result.stderr}`.trim();
  const surfaceOk = result.status === 0 && output.includes("--json") && output.includes("--dry-run");
  return {
    checked: true,
    ok: surfaceOk,
    source: "package-script-probe",
    tag: `v${LOCAL_DISTRIBUTION_PACKAGE_VERSION}`,
    evidence:
      surfaceOk
        ? "`bun run ut-tdd setup project --help` exposed --dry-run and --json from consumer packageRoot"
        : `\`bun run ut-tdd setup project --help\` did not expose required setup surface (status ${result.status}): ${output.slice(0, 240)}`,
    latestObservedStatus:
      surfaceOk
        ? "package-local generated CI setup command exposes dry-run JSON surface"
        : "package-local generated CI setup command surface failed",
  };
}

function packageRootPath(deps: SetupDeps): string {
  const root = deps.packageRoot ?? deps.repoRoot;
  return isAbsolute(root) ? root : join(deps.repoRoot, root);
}

function repoRelativePath(deps: SetupDeps, absolutePath: string): string {
  const rel = relative(deps.repoRoot, absolutePath).split(sep).join("/");
  return rel && !rel.startsWith("..") ? rel : absolutePath;
}

function bootstrapProjectPackageLockfile(input: {
  deps: SetupDeps;
  packageJsonWritten: boolean;
  plan: SetupPlan;
}): string[] {
  if (input.plan.dryRun || !input.deps.runCommand) return [];
  const packageRoot = packageRootPath(input.deps);
  const packageJsonPath = join(packageRoot, PROJECT_PACKAGE_JSON);
  const bunLockPath = join(packageRoot, PROJECT_BUN_LOCK);
  const bunLockbPath = join(packageRoot, "bun.lockb");
  if (input.deps.readText(packageJsonPath) === null) return [];
  const hasLockfile =
    input.deps.readText(bunLockPath) !== null || input.deps.readText(bunLockbPath) !== null;
  if (!input.packageJsonWritten && hasLockfile) {
    return [];
  }
  const result = input.deps.runCommand(packageRoot, "bun", ["install", "--lockfile-only"]);
  if (result.status !== 0) return [];
  if (input.deps.readText(bunLockPath) !== null) return [repoRelativePath(input.deps, bunLockPath)];
  if (input.deps.readText(bunLockbPath) !== null) return [repoRelativePath(input.deps, bunLockbPath)];
  return [];
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
          `HELIX work 開始前に \`ut-tdd status --json\`、\`ut-tdd setup project --dry-run --json\`、\`ut-tdd completion decision-packet --json\`、\`ut-tdd completion review-bundle --json\`、\`ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json\`、\`ut-tdd doctor --profile consumer\`、\`ut-tdd rename plan --json\`、\`ut-tdd handover status --json\`、\`ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json\` を実行する`,
        ]
      : nextRoute === "fix_consumer_readiness"
        ? [
            ...failedBlockingChecks.map((check) => check.message),
            "readiness check が green になった後に `ut-tdd setup project --dry-run` を再実行する",
            `HELIX work 開始前に \`ut-tdd status --json\`、\`ut-tdd setup project --dry-run --json\`、\`ut-tdd completion decision-packet --json\`、\`ut-tdd completion review-bundle --json\`、\`ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json\`、\`ut-tdd doctor --profile consumer\`、\`ut-tdd rename plan --json\`、\`ut-tdd handover status --json\`、\`ut-tdd team run --definition ${CONSUMER_TEAM_DEFINITION_PATH} --mode hybrid --json\` を実行する`,
          ]
        : [
            "`ut-tdd status --json` を実行する",
            "`ut-tdd setup project --dry-run --json` を実行し、githubPlan と consumerReadiness.ci.requires の read-only CI 境界を初回稼働証跡に保存する",
            "`ut-tdd completion decision-packet --json` を実行し、completionClaimAllowed=false と未完了 blocker queue を初回稼働証跡に保存する",
            "`ut-tdd completion review-bundle --json` を実行し、S4 / version-up / rename / action-binding の scoped review packet 束、exact digest、semantic digest を初回稼働証跡に保存する",
            "`ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` を実行し、distribution tag 更新が plan-only / mustNotApply のまま rollback と idempotency evidence を返すことを確認する",
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
    readinessOk: !input.importReport.requiresReview && input.consumerReadiness.ok,
    manualDocSearchRequired: false,
    unmetGates,
    nextActions,
    verificationCommands: verificationMatrix
      .filter((row) => row.availability !== "manual-local")
      .map((row) => row.command),
    manualVerificationCommands: verificationMatrix
      .filter((row) => row.availability === "manual-local")
      .map((row) => row.command),
    dryRunVerificationCommands: verificationMatrix
      .filter((row) => row.availability === "dry-run-immediate")
      .map((row) => row.command),
    postApplyVerificationCommands: verificationMatrix
      .filter((row) => row.availability === "post-apply-or-projected")
      .map((row) => row.command),
    verificationMatrix,
    blockedUntil,
  };
}

function buildHelixProjectPostSetupVerificationMatrix(): HelixProjectPostSetupWorkflow["verificationMatrix"] {
  return [
    {
      phase: "setup-dry-run",
      command: "ut-tdd setup project --dry-run",
      writePolicy: "no-write",
      availability: "dry-run-immediate",
      requiresMaterializedPaths: [],
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
      phase: "vscode-profile-open",
      command: "code --profile HELIX .",
      writePolicy: "no-write",
      availability: "manual-local",
      requiresMaterializedPaths: [".vscode/tasks.json", ".vscode/settings.json"],
      expected:
        "opens the consumer folder in a named HELIX VS Code profile while keeping generated tasks manual and repository writes out of the open step",
      evidence:
        "local operator records VS Code profile-open command output or screenshot in first-run readiness evidence",
      source: "VS Code command line profile launch",
      sourceUrl: "https://code.visualstudio.com/docs/configure/command-line",
      sourceCheckedAt: "2026-07-03",
      latestOfficialStatus:
        "VS Code CLI official docs expose the --profile option for launching a folder or workspace with a selected profile",
      sourceStatusDelta:
        "changed; setup first-run workflow now records the HELIX profile-open entrypoint instead of only projecting tasks",
      adoptionDecision:
        "HELIX 導入済み VSCode では `code --profile HELIX .` を手動 local verification とし、profile 起動を setup 完了や automatic task 許可に読み替えない",
      adoptionDecisionDelta:
        "add VS Code profile launch evidence as a manual-local first-run check",
      workflowRouteImpact:
        "missing local profile-open evidence keeps operator onboarding evidence incomplete but does not authorize cutover or external apply",
    },
    {
      phase: "status-frontier",
      command: "ut-tdd status --json",
      writePolicy: "no-write",
      availability: "dry-run-immediate",
      requiresMaterializedPaths: [],
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
      phase: "github-ci-safety",
      command: "ut-tdd setup project --dry-run --json",
      writePolicy: "no-write",
      availability: "dry-run-immediate",
      requiresMaterializedPaths: [],
      expected:
        "returns githubPlan and consumerReadiness.ci.requires with push/pull_request on main, contents:read permissions, pull_request_target denied, required smoke commands, and no repository secrets",
      evidence: "setup project JSON attached to the first-run readiness record",
      source: "GitHub Actions secure use and workflow token permissions",
      sourceUrl: "https://docs.github.com/en/actions/reference/security/secure-use",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus:
        "GitHub recommends minimum required GITHUB_TOKEN permissions and read-only contents by default where possible",
      sourceStatusDelta: "none; setup keeps generated harness-check CI secret-free and read-only",
      adoptionDecision:
        "harness-check は push/pull_request の read-only smoke に限定し、pull_request_target と repository secret 前提を初回 setup 証跡にしない",
      adoptionDecisionDelta:
        "none; branch protection and remote required-check application remain plan-only until approval",
      workflowRouteImpact:
        "CI permission or trigger drift routes to consumer doctor/template repair before first HELIX work",
    },
    {
      phase: "completion-decision-packet",
      command: "ut-tdd completion decision-packet --json",
      writePolicy: "no-write",
      availability: "dry-run-immediate",
      requiresMaterializedPaths: [],
      expected:
        "returns completionStatus=blocked, completionClaimAllowed=false, ordered blocker decisions, scoped packet commands, and supporting packet summaries before any first HELIX work",
      evidence: "completion decision packet JSON attached to the first-run readiness record",
      source: "HELIX completion decision packet contract",
      sourceUrl: "docs/design/harness/L6-function-design/function-spec.md",
      sourceCheckedAt: "2026-07-02",
      latestOfficialStatus: "local HELIX completion packet contract current at HEAD",
      sourceStatusDelta:
        "none; completion packet remains separate from setup readiness and consumer doctor success",
      adoptionDecision:
        "setup 初回検証は completion decision packet を保存し、90% progress や consumer readiness を L14 完了 claim に読み替えない",
      adoptionDecisionDelta:
        "none; completionClaimAllowed=false remains first-run evidence until blockers close",
      workflowRouteImpact:
        "missing completion packet routes to fix_consumer_readiness before implementation starts",
    },
    {
      phase: "completion-review-bundle",
      command: "ut-tdd completion review-bundle --json",
      writePolicy: "no-write",
      availability: "dry-run-immediate",
      requiresMaterializedPaths: [],
      expected:
        "returns completion-review-bundle.v1 with planOnly=true, mustNotDecide=true, mustNotApply=true, scoped reviewPackets, bundleDigest, semanticBundleDigest, and completionClaimAllowed=false",
      evidence: "completion review-bundle JSON attached to the first-run readiness record",
      source: "HELIX completion review-bundle contract",
      sourceUrl: "docs/plans/PLAN-L7-278-completion-review-bundle.md",
      sourceCheckedAt: "2026-07-03",
      latestOfficialStatus: "local HELIX completion review-bundle contract current at HEAD",
      sourceStatusDelta:
        "changed; setup first-run verification now saves the scoped review packet bundle, not only the decision list",
      adoptionDecision:
        "setup 初回検証は completion review-bundle を保存し、S4 / version-up / rename / action-binding の supporting packet、exact digest、semantic digest を人間判断前に照合できるようにする",
      adoptionDecisionDelta:
        "changed; completion decision-packet の判断一覧に加えて scoped review packet bundle を初回証跡にする",
      workflowRouteImpact:
        "missing or drifted completion review-bundle routes to fix_consumer_readiness before implementation starts",
    },
    {
      phase: "version-up-dry-run",
      command:
        "ut-tdd version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
      writePolicy: "no-write",
      availability: "dry-run-immediate",
      requiresMaterializedPaths: [],
      expected:
        "returns a plan-only distribution tag upgrade packet with SemVer diff, release tag check, rollback plan, idempotency checks, mustNotApply=true, and applyCommandAvailable=false",
      evidence: "version-up dry-run JSON attached to the first-run readiness record",
      source: "Semantic Versioning 2.0.0 and HELIX version-up dry-run contract",
      sourceUrl: "https://semver.org/",
      sourceCheckedAt: "2026-07-03",
      latestOfficialStatus: "Semantic Versioning 2.0.0 official specification page is current",
      sourceStatusDelta:
        "none; setup adopts SemVer only for compatibility classification and keeps release activation behind HELIX version-up review",
      adoptionDecision:
        "consumer setup は distribution tag bump を dry-run 証跡に限定し、release tag 未解決や activation 未承認を ready と誤認しない",
      adoptionDecisionDelta:
        "changed; setup first-run verification now includes version-up dry-run evidence instead of only naming the version-up packet in objectiveBoundary",
      workflowRouteImpact:
        "version-up dry-run drift or accidental apply surface routes to fix_consumer_readiness before tag pin update",
    },
    {
      phase: "consumer-doctor",
      command: "ut-tdd doctor --profile consumer",
      writePolicy: "no-write",
      availability: "post-apply-or-projected",
      requiresMaterializedPaths: [
        "AGENTS.md",
        "CLAUDE.md",
        ".claude/CLAUDE.md",
        ".vscode/tasks.json",
        ".vscode/settings.json",
        ".ut-tdd/memory",
        ".ut-tdd/handover",
        ".ut-tdd/evidence",
        ".ut-tdd/teams",
      ],
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
      writePolicy: "no-write",
      availability: "dry-run-immediate",
      requiresMaterializedPaths: [],
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
      writePolicy: "no-write",
      availability: "dry-run-immediate",
      requiresMaterializedPaths: [],
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
      writePolicy: "no-write",
      availability: "post-apply-or-projected",
      requiresMaterializedPaths: [CONSUMER_TEAM_DEFINITION_PATH],
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

export function recordHelixProjectSetupState(state: HelixProjectSetupState, deps: SetupDeps): void {
  deps.writeText(
    join(deps.repoRoot, PROJECT_SETUP_STATE_PATH),
    `${JSON.stringify(state, null, 2)}\n`,
  );
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
  const decidedAt = deps.now();
  if (!args.dryRun) {
    recordSetupState({ phase, decidedAt, decidedBy, signals: scale }, deps);
  }
  const plan = planHelixProjectSetup(phase, { teams: args.teams, dryRun: args.dryRun });
  const existingPaths = existingManagedPaths(plan, deps.templates, deps);
  const identicalPaths = identicalManagedPaths(plan, deps.templates, deps);
  const emitted = emitSetup(plan, deps.templates, deps);
  const packageBootstrapWritten = bootstrapProjectPackageLockfile({
    deps,
    packageJsonWritten: emitted.includes(PROJECT_PACKAGE_JSON),
    plan,
  });
  const written = [...emitted, ...packageBootstrapWritten];
  const importReport = buildHelixProjectImportReport({
    plan,
    templates: deps.templates,
    existingPaths,
    identicalPaths,
    emittedPaths: written,
  });
  const consumerReadiness = buildHelixSetupConsumerReadiness(deps, plan);
  const postSetupWorkflow = buildHelixProjectPostSetupWorkflow({
    importReport,
    consumerReadiness,
  });
  if (!args.dryRun) {
    recordHelixProjectSetupState(
      {
        schemaVersion: "helix-project-setup-state.v1",
        setupCommand: "ut-tdd setup project",
        phase,
        decidedAt,
        decidedBy,
        objectiveBoundary: consumerReadiness.objectiveBoundary,
        postSetupWorkflow: {
          nextRoute: postSetupWorkflow.nextRoute,
          readinessOk: postSetupWorkflow.readinessOk,
          verificationCommands: postSetupWorkflow.verificationCommands,
          verificationMatrix: postSetupWorkflow.verificationMatrix,
        },
      },
      deps,
    );
  }
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
      profileName: "HELIX",
      profileOpenCommand: "code --profile HELIX .",
      profileSourceUrl: "https://code.visualstudio.com/docs/configure/command-line",
      profileSourceCheckedAt: "2026-07-03",
      statusTask: "HELIX: status",
      completionDecisionPacketTask: "HELIX: completion decision-packet",
      completionReviewBundleTask: "HELIX: completion review-bundle",
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

export function nodeSetupDeps(repoRoot: string, packageRoot?: string): SetupDeps {
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
    runCommand: (cwd, command, args) => {
      const result = spawnSync(command, args, {
        cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      return {
        status: result.status ?? 1,
        stderr: result.stderr ?? "",
        stdout: result.stdout ?? "",
      };
    },
    ...(packageRoot ? { packageRoot } : {}),
  };
}
