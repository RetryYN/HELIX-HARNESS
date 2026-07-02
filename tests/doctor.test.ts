import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkActionBindingApprovalReadiness,
  checkAgentSlots,
  checkAssetDrift,
  checkBackfillResult,
  checkChangeImpact,
  checkChangeSetIntegrity,
  checkCodexWrapperParity,
  checkCodingRules,
  checkCompletionDecisionPacket,
  checkCutoverReadiness,
  checkCycleP4Verification,
  checkDbProjectionCoverage,
  checkDbProjectionIngestion,
  checkDddTddRules,
  checkDependencyDrift,
  checkDescentObligation,
  checkDesignLanguage,
  checkDriveDbRegistration,
  checkDriveModelPassage,
  checkFrRoadmapCoverage,
  checkGateConfirm,
  checkGuardrailInvariants,
  checkHandover,
  checkHandoverDisciplineMessages,
  checkImplPlanTrace,
  checkL6Completion,
  checkL6FrCoverage,
  checkL7Completion,
  checkMergedPlanStatus,
  checkModuleDrift,
  checkObjectiveEvidenceAudit,
  checkOracleTestTrace,
  checkPairFreeze,
  checkPlaceholderDeps,
  checkPlanDod,
  checkPlanGovernance,
  checkPlanTraceGate,
  checkProjectHooks,
  checkPropagation,
  checkReadability,
  checkRegressionExpansion,
  checkReviewEvidence,
  checkRightArmVerificationStrategy,
  checkRoadmap,
  checkRuleAutomationClosure,
  checkRuleDrift,
  checkRuntimePortability,
  checkRuntimeReadability,
  checkS4DecisionReadiness,
  checkScrumReverse,
  checkSemanticFrontierConsistency,
  checkSkillAssignment,
  checkTelemetryClosure,
  checkToolContractRegistry,
  checkTrackedCanonical,
  checkVerificationGroupsResult,
  checkVerificationProfile,
  checkVersionUpReadiness,
  completionDedicatedPacketBridgeViolations,
  type DoctorDeps,
  runConsumerDoctor,
  runDoctor,
} from "../src/doctor/index";
import { checkGreenCommandDigests } from "../src/lint/green-command-digest";
import {
  analyzeOutstandingWork,
  completionDecisionPacketForOutstanding,
} from "../src/lint/outstanding";
import {
  buildS4DecisionPackets,
  loadS4DecisionReadinessInput,
} from "../src/lint/s4-decision-readiness";
import type { AgentSlotsDeps, Slot } from "../src/runtime/agent-slots";

const NOW = "2026-06-04T00:00:00.000Z";
const pointerPath = join("/repo", ".ut-tdd", "handover", "CURRENT.json");
const slotStatePath = join("/repo", ".ut-tdd", "state", "agent-slots.json");
const currentPlanPath = join("/repo", ".ut-tdd", "state", "current-plan");
const digestDir = join("/repo", ".ut-tdd", "logs", "plan");

function codexWrapperParityFiles(root: string, overrides: Record<string, string> = {}) {
  const file = (relativePath: string) => join(root, ...relativePath.split("/"));
  return new Map<string, string>(
    Object.entries({
      ".claude/settings.json": [
        "{",
        '  "hooks": {',
        '    "SessionStart": [{ "hooks": [{ "command": "bun \\"$CLAUDE_PROJECT_DIR/src/cli.ts\\" session start" }] }],',
        '    "PostToolUse": [{ "hooks": [{ "command": "bun \\"$CLAUDE_PROJECT_DIR/src/cli.ts\\" hook post-tool-use" }] }],',
        '    "Stop": [{ "hooks": [{ "command": "bun \\"$CLAUDE_PROJECT_DIR/src/cli.ts\\" session summary" }] }]',
        "  }",
        "}",
      ].join("\n"),
      "src/runtime/adapter.ts": [
        'const args = isCodex ? ["exec", "-"] : ["--print", "--input-format", "text"];',
        "return { stdin: intent.task, plan_id: intent.planId };",
      ].join("\n"),
      "src/runtime/adapter-policy.ts": 'export const CODEX_STDIN_ARGS = ["exec", "-"] as const;',
      "tests/runtime-hook-entrypoints.test.ts": [
        "ut-tdd codex --execute records the same session lifecycle through the adapter wrapper",
        "ut-tdd codex --task-file feeds file content through the same adapter wrapper",
        "ut-tdd codex --plan records wrapper lifecycle without forwarding plan flags to Codex",
      ].join("\n"),
      "tests/runtime-adapter.test.ts": "U-ADAPTER-007\nU-ADAPTER-008",
      "docs/test-design/harness/L7-unit-test-design.md": "U-ADAPTER-009",
      ...overrides,
    }).map(([relativePath, text]) => [file(relativePath), text]),
  );
}

function deps(over: Partial<DoctorDeps> & { files?: Map<string, string> } = {}): DoctorDeps {
  const files = over.files ?? new Map<string, string>();
  return {
    repoRoot: "/repo",
    now: NOW,
    readText: (p) => files.get(p) ?? null,
    listDir: (dir) =>
      [...files.keys()]
        .filter((k) => k.startsWith(`${dir}/`) || k.startsWith(`${dir}\\`))
        .map((k) => k.slice(dir.length + 1)),
    ...over,
  };
}

function hasDoctorMessage(messages: string[], fragment: string): boolean {
  return messages.some((m) => m.includes(fragment));
}

const consumerClaudeAgentNames = [
  "be-api",
  "be-logic",
  "code-reviewer",
  "db-schema",
  "devops-deploy",
  "pdm-innovation-manager",
  "pdm-marketing-innovation",
  "pdm-tech-innovation",
  "pmo-haiku",
  "pmo-project-explorer",
  "pmo-project-scout",
  "pmo-sonnet",
  "pmo-tech-docs",
  "pmo-tech-fork",
  "pmo-tech-news",
  "qa-test",
  "refactor-scout",
  "security-audit",
  "helix-tl",
];

const consumerClaudeCommandNames = [
  "build",
  "code-simplify",
  "sdd-plan",
  "sdd-review",
  "ship",
  "spec",
  "test",
  "helix-status",
  "helix-test",
];

function consumerClaudeAgentTemplate(name: string): string {
  return [
    "---",
    `name: ${name}`,
    `description: ${name} の HELIX レビュアー。`,
    "tools: Read, Grep, Glob, Bash",
    "---",
    "",
    "現在の repository に対して、consumer-safe な HELIX subagent として振る舞う。",
    "- `ut-tdd status`、`ut-tdd completion decision-packet --json`、`ut-tdd doctor --profile consumer` を HELIX local state evidence として使う。",
    "- summary より先に findings を出す。",
    "- secret、credential、PII、machine-local absolute path を書かない。",
    "",
  ].join("\n");
}

function consumerClaudeCommandTemplate(name: string): string {
  return [
    "---",
    `description: ${name} の HELIX command。`,
    "---",
    "",
    `Command: ${name}`,
    "",
    "現行 `ut-tdd` CLI 経由で repository-local HELIX command を使う。最初に `ut-tdd status --json` と `ut-tdd completion decision-packet --json` を実行し、必要な verification を走らせ、workflow または gate behavior に影響する場合は `ut-tdd doctor --profile consumer` で閉じる。",
    "",
  ].join("\n");
}

function consumerTeamDefinitionTemplate(): string {
  return [
    "name: default-hybrid",
    "strategy: sequential",
    "max_parallel: 2",
    "serialization:",
    "  file_conflict: false",
    "  downstream_dependency: true",
    "  shared_state: false",
    "members:",
    "  - role: se",
    "    engine: codex-se",
    "    difficulty: standard",
    "    ownership: 実装対象ファイルを明示し、既存変更を戻さない",
    "    task: HELIX setup 後の対象 slice を実装し、変更ファイルと検証 command を残す",
    "  - role: tl",
    "    engine: pmo-sonnet",
    "    difficulty: standard",
    "    serialize_after: se",
    "    ownership: worker の変更範囲を review し、要求・設計・テストの意味整合を確認する",
    "    task: worker の実装結果を review し、findings-first で gate / test / handover の不足を指摘する",
    "",
  ].join("\n");
}

function consumerDoctorFiles(root = "/repo", overrides: Record<string, string | null> = {}) {
  const file = (relativePath: string) => join(root, ...relativePath.split("/"));
  const entries: Record<string, string> = {
    "AGENTS.md": [
      "# consumer",
      "<!-- UT-TDD:managed:start -->",
      "# HELIX アダプター",
      "PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。",
      "PLAN-M-02 までは現行 command 名を `ut-tdd` とする。",
      "`ut-tdd completion decision-packet --json`",
      "`ut-tdd doctor --profile consumer`",
      "`ut-tdd rename plan --json`",
      "<!-- UT-TDD:managed:end -->",
    ].join("\n"),
    "CLAUDE.md": [
      "<!-- UT-TDD:managed:start -->",
      "# HELIX 共有コンテキスト",
      "PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。",
      "PLAN-M-02 までは現行 command 名を `ut-tdd` とする。",
      "`ut-tdd completion decision-packet --json`",
      "`ut-tdd doctor --profile consumer`",
      "`ut-tdd rename plan --json`",
      "<!-- UT-TDD:managed:end -->",
    ].join("\n"),
    ".claude/CLAUDE.md": [
      "<!-- UT-TDD:managed:start -->",
      "# Claude runtime アダプター",
      "PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。",
      "PLAN-M-02 までは現行 command 名を `ut-tdd` とする。",
      "`ut-tdd completion decision-packet --json`",
      "`ut-tdd doctor --profile consumer`",
      "`ut-tdd rename plan --json`",
      "<!-- UT-TDD:managed:end -->",
    ].join("\n"),
    ".claude/settings.json": [
      "{",
      '  "hooks": {',
      '    "PreToolUse": [',
      '      { "matcher": "Agent|Task", "hooks": [{ "type": "command", "command": "ut-tdd hook agent-guard", "blockOnFailure": true }] },',
      '      { "matcher": "Edit|Write|MultiEdit", "hooks": [{ "type": "command", "command": "ut-tdd hook work-guard", "blockOnFailure": true }] }',
      "    ],",
      '    "SessionStart": [{ "hooks": [{ "type": "command", "command": "ut-tdd session start" }] }]',
      "  }",
      "}",
    ].join("\n"),
    ".codex/config.toml": "[features]\nhooks = true\n",
    ".codex/hooks.json": [
      "{",
      '  "hooks": {',
      '    "PreToolUse": [',
      '      { "matcher": "spawn_agent|spawn_agents_on_csv", "hooks": [{ "type": "command", "command": "ut-tdd hook agent-guard", "blockOnFailure": true }] },',
      '      { "matcher": "apply_patch|write_file", "hooks": [{ "type": "command", "command": "ut-tdd hook work-guard", "blockOnFailure": true }] }',
      "    ]",
      "  }",
      "}",
    ].join("\n"),
    ".vscode/tasks.json": JSON.stringify({
      version: "2.0.0",
      tasks: [
        {
          label: "HELIX: status",
          type: "shell",
          command: "bun run ut-tdd status",
          problemMatcher: [],
        },
        {
          label: "HELIX: doctor",
          type: "shell",
          command: "bun run ut-tdd doctor --profile consumer",
          problemMatcher: [],
        },
        {
          label: "HELIX: completion decision-packet",
          type: "shell",
          command: "bun run ut-tdd completion decision-packet --json",
          problemMatcher: [],
        },
        {
          label: "HELIX: rename plan",
          type: "shell",
          command: "bun run ut-tdd rename plan --json",
          problemMatcher: [],
        },
        {
          label: "HELIX: handover status",
          type: "shell",
          command: "bun run ut-tdd handover status --json",
          problemMatcher: [],
        },
        {
          label: "HELIX: setup dry-run",
          type: "shell",
          command: "bun run ut-tdd setup project --dry-run",
          problemMatcher: [],
        },
        {
          label: "HELIX: team run dry-run",
          type: "shell",
          command:
            "bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
          problemMatcher: [],
        },
      ],
    }),
    ".vscode/settings.json": JSON.stringify({ "task.allowAutomaticTasks": "off" }),
    ".github/workflows/harness-check.yml": [
      "name: harness-check",
      "on:",
      "  push:",
      "    branches: [main]",
      "  pull_request:",
      "    branches: [main]",
      "permissions:",
      "  contents: read",
      "jobs:",
      "  harness-check:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - uses: oven-sh/setup-bun@v2",
      "      - run: bun install --frozen-lockfile",
      "      - name: HELIX CLI dependency",
      "        run: bun run ut-tdd --version",
      "      - name: HELIX setup dry-run",
      "        run: bun run ut-tdd setup project --dry-run --json",
      "      - name: HELIX status",
      "        run: bun run ut-tdd status --json",
      "      - name: HELIX completion decision packet",
      "        run: bun run ut-tdd completion decision-packet --json",
      "      - name: HELIX consumer doctor",
      "        run: bun run ut-tdd doctor --profile consumer --json",
      "      - name: HELIX rename plan",
      "        run: bun run ut-tdd rename plan --json",
      "      - name: Handover route",
      "        run: bun run ut-tdd handover status --json",
      "      - name: HELIX team run dry-run",
      "        run: bun run ut-tdd team run --definition .ut-tdd/teams/default-hybrid.yaml --mode hybrid --json",
      "      - run: bun run typecheck",
      "      - run: bun run test",
      "",
    ].join("\n"),
    ".github/ISSUE_TEMPLATE/recovery.md": [
      "---",
      "name: Recovery",
      "about: AI 逸脱・暴走・強制停止からの復旧",
      "labels: recovery",
      "---",
      "",
      "## 発生事象",
      "",
      "## root cause",
      "",
      "## 復旧手順 / 再開ポイント",
      "",
      "## 再発防止",
      "",
      "## L14 route",
      "",
    ].join("\n"),
    ".github/ISSUE_TEMPLATE/add-feature.md": [
      "---",
      "name: Add-feature",
      "about: 機能追加",
      "labels: add-feature",
      "---",
      "",
      "## 追加する機能",
      "",
      "## drive",
      "",
      "## 受け入れ条件",
      "",
      "## 上位整合",
      "",
    ].join("\n"),
    ".github/PULL_REQUEST_TEMPLATE.md": [
      "## 概要",
      "",
      "## 関連 PLAN / Issue",
      "Closes #",
      "",
      "## V-model artifact",
      "- [ ] ① 設計 (docs/design/)",
      "- [ ] ② 実装 (src/)",
      "- [ ] ③ テスト設計 (docs/test-design/)",
      "- [ ] ④ テストコード (tests/)",
      "",
      "## 検証",
      "- [ ] typecheck pass",
      "- [ ] 全回帰 pass",
      "",
    ].join("\n"),
    ".ut-tdd/memory/.gitkeep": "",
    ".ut-tdd/handover/.gitkeep": "",
    ".ut-tdd/evidence/.gitkeep": "",
    ".ut-tdd/state/project-setup.json": JSON.stringify({
      schemaVersion: "helix-project-setup-state.v1",
      setupCommand: "ut-tdd setup project",
      phase: "0-A",
      objectiveBoundary: {
        scope: "consumer_setup_readiness_not_whole_program_completion",
        completionClaimAllowed: false,
        completionPacketCommand: "ut-tdd completion decision-packet --json",
      },
      postSetupWorkflow: {
        nextRoute: "ready",
        readinessOk: true,
        verificationCommands: [
          "ut-tdd setup project --dry-run",
          "ut-tdd status --json",
          "ut-tdd completion decision-packet --json",
          "ut-tdd doctor --profile consumer",
          "ut-tdd rename plan --json",
        ],
      },
    }),
    ".ut-tdd/teams/default-hybrid.yaml": consumerTeamDefinitionTemplate(),
  };
  for (const name of consumerClaudeAgentNames) {
    entries[`.claude/agents/${name}.md`] = consumerClaudeAgentTemplate(name);
  }
  for (const name of consumerClaudeCommandNames) {
    entries[`.claude/commands/${name}.md`] = consumerClaudeCommandTemplate(name);
  }
  for (const [path, text] of Object.entries(overrides)) {
    if (text === null) delete entries[path];
    else entries[path] = text;
  }
  return new Map(Object.entries(entries).map(([relativePath, text]) => [file(relativePath), text]));
}

describe("runConsumerDoctor", () => {
  it("passes with generated consumer setup artifacts without requiring dogfood design docs", () => {
    const result = runConsumerDoctor(deps({ files: consumerDoctorFiles() }));

    expect(result.ok).toBe(true);
    expect(hasDoctorMessage(result.messages, "doctor: profile=consumer")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-claude-adapter - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-vscode-tasks - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-ci-workflow - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-policy-templates - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-claude-surface - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-team-run-surface - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-project-setup-state - OK")).toBe(true);
  });

  it("fails closed when setup state loses the completion boundary", () => {
    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".ut-tdd/state/project-setup.json": JSON.stringify({
            schemaVersion: "helix-project-setup-state.v1",
            setupCommand: "ut-tdd setup project",
            objectiveBoundary: {
              scope: "consumer_setup_readiness_not_whole_program_completion",
              completionClaimAllowed: true,
              completionPacketCommand: "ut-tdd completion decision-packet --json",
            },
            postSetupWorkflow: {
              nextRoute: "ready",
              readinessOk: true,
              verificationCommands: ["ut-tdd doctor --profile consumer"],
            },
          }),
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-project-setup-state - violation",
        "completionClaimAllowed=false",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-project-setup-state - violation",
        "verificationCommands=ut-tdd doctor --profile consumer",
      ),
    ).toBe(true);
  });

  it("fails closed when the consumer doctor task still points at the product doctor", () => {
    const files = consumerDoctorFiles("/repo", {
      ".vscode/tasks.json": JSON.stringify({
        version: "2.0.0",
        tasks: [
          {
            label: "HELIX: status",
            type: "shell",
            command: "bun run ut-tdd status",
            problemMatcher: [],
          },
          {
            label: "HELIX: doctor",
            type: "shell",
            command: "bun run ut-tdd doctor",
            problemMatcher: [],
          },
          {
            label: "HELIX: handover status",
            type: "shell",
            command: "bun run ut-tdd handover status --json",
            problemMatcher: [],
          },
          {
            label: "HELIX: setup dry-run",
            type: "shell",
            command: "bun run ut-tdd setup project --dry-run",
            problemMatcher: [],
          },
        ],
      }),
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(hasDoctorMessage(result.messages, "consumer-vscode-tasks - violation")).toBe(true);
  });

  it("fails closed when VS Code tasks can auto-run or carry unsafe task options", () => {
    const files = consumerDoctorFiles("/repo", {
      ".vscode/tasks.json": JSON.stringify({
        version: "2.0.0",
        tasks: [
          {
            label: "HELIX: status",
            type: "shell",
            command: "bun run ut-tdd status",
            problemMatcher: [],
            runOptions: { runOn: "folderOpen" },
          },
          {
            label: "HELIX: doctor",
            type: "shell",
            command: "bun run ut-tdd doctor --profile consumer",
            problemMatcher: ["$tsc"],
          },
          {
            label: "HELIX: handover status",
            type: "shell",
            command: "bun run ut-tdd handover status --json",
            problemMatcher: [],
          },
          {
            label: "HELIX: setup dry-run",
            type: "process",
            command: "bun run ut-tdd setup project --dry-run",
            problemMatcher: [],
            options: { cwd: "workspace-root" },
          },
          {
            label: "consumer-extra",
            type: "shell",
            command: "echo extra",
            problemMatcher: [],
            runOptions: { runOn: "folderOpen" },
          },
        ],
      }),
      ".vscode/settings.json": JSON.stringify({ "task.allowAutomaticTasks": "on" }),
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-vscode-tasks - violation",
        "automaticTasksOff=false",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessage(result.messages, "unsafe=HELIX: status,HELIX: doctor,HELIX: setup dry-run"),
    ).toBe(true);
    expect(hasDoctorMessage(result.messages, "autoRun=HELIX: status,consumer-extra")).toBe(true);
  });

  it("fails closed when VS Code task schema version or task list shape drifts", () => {
    const tasksPath = join("/repo", ".vscode", "tasks.json");
    const generatedTasks = JSON.parse(consumerDoctorFiles("/repo").get(tasksPath) ?? "{}") as {
      tasks: unknown;
    };
    const wrongVersion = consumerDoctorFiles("/repo", {
      ".vscode/tasks.json": JSON.stringify({
        ...generatedTasks,
        version: "0.1.0",
      }),
    });

    const wrongVersionResult = runConsumerDoctor(deps({ files: wrongVersion }));

    expect(wrongVersionResult.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        wrongVersionResult.messages,
        "consumer-vscode-tasks - violation",
        "version=false",
      ),
    ).toBe(true);

    const nonArrayTasks = consumerDoctorFiles("/repo", {
      ".vscode/tasks.json": JSON.stringify({
        version: "2.0.0",
        tasks: { label: "HELIX: status" },
      }),
    });

    const nonArrayResult = runConsumerDoctor(deps({ files: nonArrayTasks }));

    expect(nonArrayResult.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        nonArrayResult.messages,
        "consumer-vscode-tasks - violation",
        "tasksArray=false",
      ),
    ).toBe(true);
  });

  it("fails closed when the consumer CI workflow loses read-only smoke-test contract", () => {
    const files = consumerDoctorFiles("/repo", {
      ".github/workflows/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [main]",
        "  pull_request_target:",
        "    branches: [main]",
        "permissions:",
        "  contents: write",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - uses: oven-sh/setup-bun@v2",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run ut-tdd --version",
        "      - run: bun run ut-tdd status --json",
        "      - run: bun run test",
        "",
      ].join("\n"),
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-ci-workflow - violation",
        "permissionsRead=false",
      ),
    ).toBe(true);
    expect(hasDoctorMessage(result.messages, "noPullRequestTarget=false")).toBe(true);
    expect(hasDoctorMessage(result.messages, "tokenWrite=true")).toBe(true);
    expect(
      hasDoctorMessage(
        result.messages,
        "missingRuns=bun run ut-tdd setup project --dry-run --json",
      ),
    ).toBe(true);
  });

  it("fails closed when GitHub policy templates lose HELIX workflow evidence fields", () => {
    const files = consumerDoctorFiles("/repo", {
      ".github/ISSUE_TEMPLATE/recovery.md": "# Recovery\n",
      ".github/PULL_REQUEST_TEMPLATE.md": "## 概要\n",
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-policy-templates - violation",
        "recovery=false",
      ),
    ).toBe(true);
    expect(hasDoctorMessage(result.messages, "pullRequest=false")).toBe(true);
  });

  it("fails closed when distributed Claude subagent or slash-command templates drift", () => {
    const files = consumerDoctorFiles("/repo", {
      ".claude/agents/security-audit.md": [
        "---",
        "name: generic-reviewer",
        "description: security audit の HELIX レビュアー。",
        "tools: Read, Grep, Glob, Bash",
        "---",
        "",
        "現在の repository に対して、consumer-safe な HELIX subagent として振る舞う。",
        "- `ut-tdd status` と `ut-tdd doctor --profile consumer` を HELIX local state evidence として使う。",
        "- summary より先に findings を出す。",
        "- secret、credential、PII、machine-local absolute path を書かない。",
        "",
      ].join("\n"),
      ".claude/commands/helix-test.md": "Run tests only.\n",
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-claude-surface - violation",
        "invalidAgents=.claude/agents/security-audit.md",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessage(result.messages, "invalidCommands=.claude/commands/helix-test.md"),
    ).toBe(true);
  });

  it("U-SETUP-023: fails closed when the distributed team-run definition is missing or not hybrid-runnable", () => {
    const missing = runConsumerDoctor(
      deps({ files: consumerDoctorFiles("/repo", { ".ut-tdd/teams/default-hybrid.yaml": null }) }),
    );
    expect(missing.ok).toBe(false);
    expect(
      hasDoctorMessage(
        missing.messages,
        "consumer-files - violation missing=.ut-tdd/teams/default-hybrid.yaml",
      ),
    ).toBe(true);

    const singleProvider = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".ut-tdd/teams/default-hybrid.yaml": [
            "name: default-hybrid",
            "members:",
            "  - role: se",
            "    engine: codex-se",
            "    task: implement",
            "  - role: tl",
            "    engine: codex-tl",
            "    task: review",
            "",
          ].join("\n"),
        }),
      }),
    );
    expect(singleProvider.ok).toBe(false);
    expect(hasDoctorMessage(singleProvider.messages, "consumer-team-run-surface - violation")).toBe(
      true,
    );
  });

  it("fails closed when adapter docs omit Japanese/cutover markers", () => {
    const files = consumerDoctorFiles("/repo", {
      ".claude/CLAUDE.md": [
        "<!-- UT-TDD:managed:start -->",
        "# Claude runtime アダプター",
        "<!-- UT-TDD:managed:end -->",
      ].join("\n"),
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(hasDoctorMessage(result.messages, "consumer-adapter-docs - violation")).toBe(true);
  });

  it("fails closed when .helix state exists before PLAN-M-02 approval", () => {
    const files = consumerDoctorFiles("/repo", {
      ".helix/teams/default-hybrid.yaml": "name: default-hybrid\nmembers: []\n",
      ".helix/state/setup.json": "{}\n",
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(hasDoctorMessage(result.messages, "consumer-identifier-transition - violation")).toBe(
      true,
    );
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain("premature_future_state=.helix/state/setup.json,.helix/teams/default-hybrid.yaml");
  });

  it("fails closed when package/bin or scripts expose helix before PLAN-M-02 approval", () => {
    const files = consumerDoctorFiles("/repo", {
      "package.json": JSON.stringify({
        name: "consumer",
        bin: { helix: "./dist/helix" },
        scripts: { doctor: "helix doctor --profile consumer" },
      }),
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain("premature_alias=package.json:bin.helix,package.json:scripts.doctor");
  });

  it("fails closed when package string bin exposes a helix package command before PLAN-M-02 approval", () => {
    const files = consumerDoctorFiles("/repo", {
      "package.json": JSON.stringify({
        name: "@scope/helix",
        bin: "./dist/helix",
      }),
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain("premature_alias=package.json:bin");
  });

  it("fails closed when executable consumer surfaces expose helix aliases before PLAN-M-02 approval", () => {
    const files = consumerDoctorFiles("/repo");
    const tasksPath = join("/repo", ".vscode", "tasks.json");
    const workflowPath = join("/repo", ".github", "workflows", "harness-check.yml");
    const hooksPath = join("/repo", ".codex", "hooks.json");
    files.set(
      tasksPath,
      (files.get(tasksPath) ?? "").replace("bun run ut-tdd status", "helix status"),
    );
    files.set(
      workflowPath,
      (files.get(workflowPath) ?? "").replace(
        "bun run ut-tdd status --json",
        "helix status --json",
      ),
    );
    files.set(
      hooksPath,
      (files.get(hooksPath) ?? "").replace("ut-tdd hook work-guard", "helix doctor"),
    );

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain(
      "premature_alias=.vscode/tasks.json,.github/workflows/harness-check.yml,.codex/hooks.json",
    );
  });

  it("fails closed when cutover, decision, or hook surfaces expose helix aliases before PLAN-M-02 approval", () => {
    const files = consumerDoctorFiles("/repo");
    const tasksPath = join("/repo", ".vscode", "tasks.json");
    const workflowPath = join("/repo", ".github", "workflows", "harness-check.yml");
    const claudePath = join("/repo", ".claude", "settings.json");
    files.set(
      tasksPath,
      (files.get(tasksPath) ?? "").replace("ut-tdd rename plan --json", "helix rename plan --json"),
    );
    files.set(
      workflowPath,
      (files.get(workflowPath) ?? "").replace(
        "bun run ut-tdd rename plan --json",
        "helix version-up activation-packet --json",
      ),
    );
    files.set(
      claudePath,
      (files.get(claudePath) ?? "").replace(
        "ut-tdd hook agent-guard",
        "helix action-binding approval-packet",
      ),
    );

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain(
      "premature_alias=.vscode/tasks.json,.github/workflows/harness-check.yml,.claude/settings.json",
    );
  });

  it("fails closed when distributed Claude templates instruct future helix aliases before PLAN-M-02 approval", () => {
    const files = consumerDoctorFiles("/repo");
    const agentPath = join("/repo", ".claude", "agents", "security-audit.md");
    const commandPath = join("/repo", ".claude", "commands", "helix-status.md");
    files.set(
      agentPath,
      `${files.get(agentPath) ?? ""}\n- 承認前でも helix doctor --profile consumer を実行する。\n`,
    );
    files.set(
      commandPath,
      `${files.get(commandPath) ?? ""}\n承認前でも helix status --json を実行する。\n`,
    );

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain(
      "premature_alias=.claude/agents/security-audit.md,.claude/commands/helix-status.md",
    );
  });

  it("fails closed when Claude adapter hooks are incomplete", () => {
    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".claude/settings.json": '{"hooks":{"SessionStart":[]}}\n',
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(hasDoctorMessage(result.messages, "consumer-claude-adapter - violation")).toBe(true);
  });
});

function hasDoctorMessageWith(messages: string[], ...fragments: string[]): boolean {
  return messages.some((m) => fragments.every((fragment) => m.includes(fragment)));
}

describe("checkHandover (doctor handover staleness surface)", () => {
  it("missing CURRENT.json prompts generation without failing", () => {
    expect(checkHandover(deps())).toContain("CURRENT.json");
  });

  it("fresh pointer returns OK and includes active plan", () => {
    const files = new Map([
      [
        pointerPath,
        JSON.stringify({
          active_plan: "PLAN-X",
          status: "in_progress",
          latest_doc: null,
          digest_summary: null,
          updated_at: "2026-06-03T18:00:00.000Z",
        }),
      ],
    ]);
    const msg = checkHandover(deps({ files }));
    expect(msg).toContain("OK");
    expect(msg).toContain("PLAN-X");
  });

  it("older than 24h returns stale warning", () => {
    const files = new Map([
      [pointerPath, JSON.stringify({ updated_at: "2026-06-01T00:00:00.000Z" })],
    ]);
    expect(checkHandover(deps({ files }))).toContain("stale");
  });

  it("broken JSON prompts regeneration without throwing", () => {
    const files = new Map([[pointerPath, "{not json"]]);
    expect(() => checkHandover(deps({ files }))).not.toThrow();
    expect(checkHandover(deps({ files }))).toContain("CURRENT.json");
  });

  it("runDoctor fails closed when blocked handover pointer lacks completionDecisionPacket", () => {
    const files = new Map([
      [
        pointerPath,
        JSON.stringify({
          active_plan: null,
          status: "in_progress",
          latest_doc: null,
          digest_summary: null,
          updated_at: NOW,
          generated_by: "ut-tdd-handover",
          outstanding: {
            nonTerminalPlansByLayer: { cross: 1 },
            nonTerminalPlansTotal: 1,
            versionUpParked: 0,
            activeDraftTotal: 1,
            openDefers: 0,
            blockersByKind: { po_decision_pending: 1 },
            items: [
              {
                planId: "PLAN-S3",
                layer: "cross",
                kind: "poc",
                status: "draft",
                workflowPhase: "S3",
                versionTarget: null,
                reason: "po_decision_pending",
                blockers: ["po_decision_pending"],
                requiredAction: "record the PO/S4 decision before promotion",
                requiredActions: ["record the PO/S4 decision before promotion"],
                requiredEvidence: ["s4_decision_record"],
              },
            ],
            completionReadiness: {
              ok: false,
              status: "blocked",
              reason: "whole-program completion is blocked",
              blockers: ["po_decision_pending"],
              requiredActions: ["record the PO/S4 decision before promotion"],
            },
          },
        }),
      ],
    ]);
    const r = runDoctor(deps({ files }));

    expect(r.ok).toBe(false);
    expect(
      hasDoctorMessageWith(r.messages, "handover-decision-packet", "completionDecisionPacket"),
    ).toBe(true);
  });
});

describe("checkHandoverDisciplineMessages", () => {
  it("fresh CURRENT still surfaces drift when active_plan differs from current plan", () => {
    const files = new Map([
      [currentPlanPath, "PLAN-L5-08-harness-db-feedback\n2026-06-03T23:50:00.000Z"],
      [
        join(digestDir, "PLAN-L5-08-harness-db-feedback.digest.json"),
        JSON.stringify({
          plan_id: "PLAN-L5-08-harness-db-feedback",
          sessions: ["s1"],
          commits: [],
          files_touched: ["docs/plans/PLAN-L5-08-harness-db-feedback.md"],
          failures: [],
          updated_at: "2026-06-03T23:55:00.000Z",
        }),
      ],
      [
        pointerPath,
        JSON.stringify({
          active_plan: "PLAN-L5-00-master",
          status: "completed",
          latest_doc: null,
          digest_summary: { commits: 0, files: 0, failures: 0 },
          updated_at: "2026-06-03T23:59:00.000Z",
          generated_by: "ut-tdd-handover",
          doc_entry_count: 0,
        }),
      ],
    ]);
    const messages = checkHandoverDisciplineMessages(deps({ files }));
    expect(messages.some((m) => m.includes("drift"))).toBe(true);
  });

  it("runDoctor surfaces handover discipline as warning-only", () => {
    const files = new Map([
      [currentPlanPath, "PLAN-L5-08-harness-db-feedback\n2026-06-03T23:50:00.000Z"],
      [
        join(digestDir, "PLAN-L5-08-harness-db-feedback.digest.json"),
        JSON.stringify({
          plan_id: "PLAN-L5-08-harness-db-feedback",
          sessions: ["s1"],
          commits: [],
          files_touched: ["docs/plans/PLAN-L5-08-harness-db-feedback.md"],
          failures: [],
          updated_at: "2026-06-03T23:55:00.000Z",
        }),
      ],
    ]);
    const r = runDoctor(deps({ files }));
    expect(r.ok).toBe(false);
    expect(r.messages.some((m) => m.includes("handover-discipline"))).toBe(true);
    expect(
      r.messages.some((m) => m.includes("verification") && m.includes("design doc なし")),
    ).toBe(true);
  });
});

describe("checkAgentSlots (doctor agent-slots surface, IMP-050)", () => {
  function slotDeps(slots: Slot[] | null, now = "2026-06-04T00:10:00.000Z"): AgentSlotsDeps {
    const files = new Map<string, string>();
    if (slots !== null) files.set(slotStatePath, JSON.stringify(slots));
    return {
      repoRoot: "/repo",
      now: () => now,
      readText: (p) => files.get(p) ?? null,
      writeText: () => {
        throw new Error("doctor slotDeps writeText must stay read-only");
      },
      newId: () => "x",
    };
  }
  function slot(over: Partial<Slot>): Slot {
    return {
      slot_id: "s",
      agent_kind: "pmo-sonnet",
      role: null,
      slot_source: "agent_guard",
      fired_at: "2026-06-04T00:00:00.000Z",
      released_at: null,
      status: "running",
      exit_code: null,
      ...over,
    };
  }

  it("returns a no-record message when slot state is missing", () => {
    expect(checkAgentSlots(slotDeps(null))).toContain("agent-slots");
  });

  it("reports stale slots older than the release threshold", () => {
    const msg = checkAgentSlots(slotDeps([slot({ slot_id: "old" })])); // fired 00:00, now 00:10
    expect(msg).toContain("stale");
    expect(msg).toContain("old");
  });

  it("reports OK and peak for released slots without writing state", () => {
    const msg = checkAgentSlots(
      slotDeps([slot({ status: "completed", released_at: "2026-06-04T00:02:00.000Z" })]),
    );
    expect(msg).toContain("OK");
    expect(msg).toContain("peak_parallel");
  });
});

describe("runDoctor", () => {
  it("U-OUTSTANDING-003: completion decision doctor bridge accepts the current live dedicated packets", () => {
    const result = checkCompletionDecisionPacket(process.cwd());

    expect(result.ok).toBe(true);
    expect(result.messages).toContainEqual(
      expect.stringContaining("completion-decision-packet - OK"),
    );
  });

  it("U-OUTSTANDING-003: completion decision doctor bridge fails when a referenced S4 packet is not live", () => {
    const packet = completionDecisionPacketForOutstanding(
      analyzeOutstandingWork(
        [
          {
            planId: "PLAN-NO-SUCH-S3",
            layer: "cross",
            kind: "poc",
            status: "draft",
            workflowPhase: "S3",
            versionTarget: null,
          },
        ],
        0,
      ),
      {
        generatedAt: "2026-07-02T00:00:00.000Z",
        now: "2026-07-02T00:00:00.000Z",
      },
    );

    expect(completionDedicatedPacketBridgeViolations(process.cwd(), packet)).toContain(
      "missing live S4 decision packet for PLAN-NO-SUCH-S3",
    );
  });

  it("U-OUTSTANDING-011: completion decision doctor bridge rejects unscoped or mis-scoped related dedicated packets", () => {
    const planId = "PLAN-DISCOVERY-10-helix-asset-visualization";
    const packet = completionDecisionPacketForOutstanding(
      analyzeOutstandingWork(
        [
          {
            planId,
            layer: "cross",
            kind: "poc",
            status: "draft",
            workflowPhase: "S3",
            versionTarget: null,
            text: "S4 decision pending and requires action-binding approval.",
          },
        ],
        0,
      ),
      {
        generatedAt: "2026-07-02T00:00:00.000Z",
        now: "2026-07-02T00:00:00.000Z",
      },
    );
    const liveS4Packet = buildS4DecisionPackets(loadS4DecisionReadinessInput(process.cwd())).find(
      (candidate) => candidate.planId === planId,
    );
    if (!liveS4Packet) {
      throw new Error(`live S4 packet not found: ${planId}`);
    }
    const badS4Packet = {
      ...liveS4Packet,
      relatedDecisionPackets: liveS4Packet.relatedDecisionPackets.map((related) => {
        if (related.role === "primary") {
          return { ...related, scopedCommand: undefined };
        }
        if (related.command === "ut-tdd action-binding approval-packet --json") {
          return {
            ...related,
            scopedCommand: "ut-tdd action-binding approval-packet --json --plan PLAN-Y",
          };
        }
        return related;
      }),
    };

    expect(
      completionDedicatedPacketBridgeViolations(process.cwd(), packet, {
        s4Packets: [badS4Packet],
      }),
    ).toEqual(
      expect.arrayContaining([
        `S4 ${planId} relatedDecisionPackets primary ut-tdd s4 decision-packet --json missing scopedCommand`,
        `S4 ${planId} relatedDecisionPackets supporting ut-tdd action-binding approval-packet --json scopedCommand mismatch expected=ut-tdd action-binding approval-packet --json --plan ${planId} actual=ut-tdd action-binding approval-packet --json --plan PLAN-Y`,
      ]),
    );
  });

  it("ok=true includes handover and agent-slots surfaces as warnings", () => {
    const r = runDoctor(deps());
    expect(r.ok).toBe(false);
    expect(r.messages.some((m) => m.includes("handover"))).toBe(true);
    expect(r.messages.some((m) => m.includes("agent-slots"))).toBe(true);
    expect(
      r.messages.some((m) => m.includes("verification") && m.includes("design doc なし")),
    ).toBe(true);
    // Keep warning-only surfaces from masking hard-fail lint coverage.
    expect(r.messages.some((m) => m.includes("scrum-reverse"))).toBe(true);
    expect(r.messages.some((m) => m.includes("propagation"))).toBe(true);
    expect(r.messages.some((m) => m.includes("coding-rules"))).toBe(true);
  });

  it("includes asset-drift hard gate in doctor output", () => {
    const r = runDoctor();
    expect(hasDoctorMessageWith(r.messages, "doctor: asset-drift", "OK")).toBe(true);
  });

  it("includes skill-assignment hard gate in doctor output", () => {
    const r = runDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: skill-assignment - OK")).toBe(true);
  });

  // PLAN-L7-95: the 4 previously-inert lint audits + the lint-wiring meta-gate must be
  // invoked by runDoctor (invocation fence — guards against re-introducing the absence-blindness
  // where a lint module is reachable/tested but its audit never runs in a runtime path).
  it("invokes the 4 newly-wired lint audits + lint-wiring meta-gate in doctor output", () => {
    const r = runDoctor();
    for (const gate of [
      "doctor: doc-consistency — OK",
      "doctor: entity-coverage — OK",
      "doctor: fr-registry-audit — OK",
      "doctor: improvement-backlog — OK",
      "doctor: design-language - OK",
      "doctor: lint-wiring — OK",
    ]) {
      expect(r.messages.some((m) => m.includes(gate))).toBe(true);
    }
  });

  it("includes branch-kind-check in doctor output", () => {
    const r = runDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: branch-kind-check - OK")).toBe(true);
  });

  it("includes right-arm verification strategy hard gate in doctor output", () => {
    const r = runDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: right-arm-verification-strategy - OK")).toBe(true);
  });

  it("includes version-up readiness hard gate in doctor output", () => {
    const r = runDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: version-up-readiness - OK")).toBe(true);
  });

  it("includes action-binding approval readiness hard gate in doctor output", () => {
    const r = runDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: action-binding-approval-readiness - OK")).toBe(
      true,
    );
  });

  it("includes S4 decision readiness hard gate in doctor output", () => {
    const r = runDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: s4-decision-readiness - OK")).toBe(true);
  });

  it("includes cutover readiness hard gate in doctor output", () => {
    const r = runDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: cutover-readiness - OK")).toBe(true);
  });

  it("includes objective evidence audit hard gate in doctor output", () => {
    const r = runDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: objective-evidence-audit - OK")).toBe(true);
    expect(hasDoctorMessage(r.messages, "progress=90%")).toBe(true);
  });

  it("includes semantic frontier consistency hard gate in doctor output", () => {
    const r = runDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: semantic-frontier-consistency - OK")).toBe(true);
  });

  it("includes G1/G3 trace gates in doctor output", () => {
    const r = runDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: g1-trace - OK")).toBe(true);
    expect(hasDoctorMessage(r.messages, "doctor: g3-trace - OK")).toBe(true);
  });

  it("hard-gates PLAN governance once repo frontmatter debt is closed", () => {
    const governance = checkPlanGovernance(process.cwd());
    const r = runDoctor();

    expect(governance.ok).toBe(true);
    expect(governance.messages[0]).toContain("plan-governance - OK");
    expect(hasDoctorMessageWith(r.messages, "doctor: plan-schedule", "OK")).toBe(true);
    expect(hasDoctorMessage(r.messages, "doctor: plan-governance - OK")).toBe(true);
  });

  it("surfaces dependency-drift and regression expansion instead of scaffold stub", () => {
    const r = runDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: dependency-drift")).toBe(true);
    expect(hasDoctorMessage(r.messages, "doctor: regression-expansion")).toBe(true);
    expect(r.messages.some((m) => m.includes("scaffold stub"))).toBe(false);
  });

  it("surfaces roadmap-rollup as a hard gate summary line", () => {
    const r = runDoctor();
    const rollupLines = r.messages.filter((m) => m.startsWith("doctor: roadmap-rollup"));

    expect(rollupLines).toHaveLength(1);
    expect(rollupLines[0]).toContain("bands ");
    expect(rollupLines[0]).toContain("gates ");
    expect(rollupLines[0]).toContain("spans ");
    expect(rollupLines[0]).toContain("frontier:");
  });

  it("surfaces Cycle P4 closure audit as a hard gate", () => {
    const r = runDoctor();

    expect(hasDoctorMessage(r.messages, "doctor: cycle-p4-verification - OK")).toBe(true);
  });

  it("fails descent-obligation when a trace chain has no required downstream landing", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-descent-"));
    try {
      const docDir = join(root, "docs", "design", "harness", "L6-function-design");
      mkdirSync(docDir, { recursive: true });
      writeFileSync(
        join(docDir, "bad.md"),
        "---\nlayer: L6\nstatus: confirmed\n---\nFR-L1-99\n",
        "utf8",
      );

      const result = checkDescentObligation(root);

      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("descent-obligation - unmet");
      expect(result.messages.join("\n")).toContain("FR-L1-99");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  // Guardrail invariant helper for review evidence fixtures.
  function planWithReview(
    planId: string,
    reviewKind: string,
    reviewer: string,
    worker: string,
  ): string {
    return [
      "---",
      `plan_id: ${planId}`,
      "status: confirmed",
      "kind: impl",
      "review_evidence:",
      "  - reviewer: code-reviewer",
      `    review_kind: ${reviewKind}`,
      `    worker_model: ${worker}`,
      `    reviewer_model: ${reviewer}`,
      '    tests_green_at: "2026-06-15"',
      '    reviewed_at: "2026-06-15"',
      "    verdict: pass",
      "---",
      "",
      "## body",
      "",
    ].join("\n");
  }

  it("passes guardrail-invariants when cross_agent review uses distinct models", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-guardrail-ok-"));
    try {
      const planDir = join(root, "docs", "plans");
      mkdirSync(planDir, { recursive: true });
      writeFileSync(
        join(planDir, "PLAN-TEST-01-crossmodel.md"),
        planWithReview("PLAN-TEST-01-crossmodel", "cross_agent", "gpt-5.4", "claude-opus-4-8"),
        "utf8",
      );

      const result = checkGuardrailInvariants(root);

      expect(result.ok).toBe(true);
      expect(result.messages.join("\n")).toContain("guardrail-invariants");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails guardrail-invariants on cross_agent same-model self-review (reviewer == worker)", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-guardrail-same-"));
    try {
      const planDir = join(root, "docs", "plans");
      mkdirSync(planDir, { recursive: true });
      writeFileSync(
        join(planDir, "PLAN-TEST-02-selfreview.md"),
        planWithReview(
          "PLAN-TEST-02-selfreview",
          "cross_agent",
          "claude-opus-4-8",
          "claude-opus-4-8",
        ),
        "utf8",
      );

      const result = checkGuardrailInvariants(root);

      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("guardrail-invariants - violation");
      expect(result.messages.join("\n")).toContain("same-model-self-review");
      expect(result.messages.join("\n")).toContain("PLAN-TEST-02-selfreview");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("permits intra_runtime_subagent same-model review in single-runtime fallback", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-guardrail-intra-"));
    try {
      const planDir = join(root, "docs", "plans");
      mkdirSync(planDir, { recursive: true });
      writeFileSync(
        join(planDir, "PLAN-TEST-04-intra.md"),
        planWithReview("PLAN-TEST-04-intra", "intra_runtime_subagent", "gpt-5.4", "gpt-5.4"),
        "utf8",
      );

      const result = checkGuardrailInvariants(root);

      expect(result.ok).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("does not false-positive guardrail-invariants when one model is omitted", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-guardrail-partial-"));
    try {
      const planDir = join(root, "docs", "plans");
      mkdirSync(planDir, { recursive: true });
      // Missing worker_model should not trigger a same-model violation.
      writeFileSync(
        join(planDir, "PLAN-TEST-03-partial.md"),
        [
          "---",
          "plan_id: PLAN-TEST-03-partial",
          "status: confirmed",
          "kind: impl",
          "review_evidence:",
          "  - reviewer: code-reviewer",
          "    review_kind: intra_runtime_subagent",
          "    reviewer_model: claude-sonnet-4-6",
          '    tests_green_at: "2026-06-15"',
          '    reviewed_at: "2026-06-15"',
          "    verdict: pass",
          "---",
          "",
        ].join("\n"),
        "utf8",
      );

      const result = checkGuardrailInvariants(root);

      expect(result.ok).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails closed when guardrail-invariants repo root cannot be read", () => {
    const missingRoot = join(tmpdir(), `ut-tdd-doctor-guardrail-missing-${NOW}-nope`);
    const result = checkGuardrailInvariants(missingRoot);
    expect(result.ok).toBe(false);
  });

  it("fails confirmed L7 PLANs with unchecked DoD items", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-plan-dod-"));
    try {
      const planDir = join(root, "docs", "plans");
      mkdirSync(planDir, { recursive: true });
      writeFileSync(
        join(planDir, "PLAN-L7-99-unchecked.md"),
        [
          "---",
          "plan_id: PLAN-L7-99-unchecked",
          "status: confirmed",
          "kind: impl",
          "---",
          "",
          "## L4 DoD",
          "",
          "- [ ] verification evidence is not closed",
          "",
          "## L5 Notes",
          "",
        ].join("\n"),
        "utf8",
      );

      const result = checkPlanDod(root);

      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("plan-dod - violation");
      expect(result.messages.join("\n")).toContain("PLAN-L7-99-unchecked:9");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails active design/test-design docs with unresolved L7 placeholder_deps", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-placeholder-deps-"));
    try {
      const docDir = join(root, "docs", "design", "harness", "L5-detailed-design");
      mkdirSync(docDir, { recursive: true });
      writeFileSync(
        join(docDir, "physical-data.md"),
        [
          "---",
          "layer: L5",
          "status: confirmed",
          "---",
          "",
          "- placeholder_deps: {waiting_layer:L7, waiting_spec: stale implementation bridge}",
          "- Current status: dedicated `placeholder_deps` doctor rule is not implemented yet.",
        ].join("\n"),
        "utf8",
      );

      const result = checkPlaceholderDeps(root);

      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("placeholder-deps - violation");
      expect(result.messages.join("\n")).toContain("physical-data.md:6");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails active L4-L6 design docs with stale L7 completion blockers", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-l7-completion-"));
    try {
      const docDir = join(root, "docs", "design", "harness", "L4-basic-design");
      mkdirSync(docDir, { recursive: true });
      writeFileSync(
        join(docDir, "function.md"),
        [
          "---",
          "layer: L4",
          "status: confirmed",
          "---",
          "",
          "> Current implementation only covers C2; remaining items are L7 carry.",
          "| `ut-tdd review --uncommitted` | FR-45 | pending | doc-reviewer |",
        ].join("\n"),
        "utf8",
      );

      const result = checkL7Completion(root);

      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("l7-completion - violation");
      expect(result.messages.join("\n")).toContain("function.md:6");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-ADAPTER-009: surfaces Claude hook / Codex wrapper parity as a doctor hard gate", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-codex-parity-"));
    try {
      const result = checkCodexWrapperParity(
        deps({ repoRoot: root, files: codexWrapperParityFiles(root) }),
      );

      expect(result.ok).toBe(true);
      expect(result.messages.join("\n")).toContain("codex-wrapper-parity - OK");
      expect(result.messages.join("\n")).toContain("codex=ut-tdd-wrapper-lifecycle");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-ADAPTER-009: fails closed when Codex wrapper lifecycle evidence is missing", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-codex-parity-missing-"));
    try {
      const result = checkCodexWrapperParity(
        deps({
          repoRoot: root,
          files: codexWrapperParityFiles(root, {
            "tests/runtime-hook-entrypoints.test.ts": "Claude settings only",
          }),
        }),
      );

      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("Codex wrapper lifecycle test missing");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails closed when hard-gate checker inputs cannot be read", () => {
    const missingRoot = join(tmpdir(), `ut-tdd-doctor-missing-${Date.now()}-nope`);
    const checks = [
      ["backfill", checkBackfillResult(missingRoot)],
      ["scrum-reverse", checkScrumReverse(missingRoot)],
      ["propagation", checkPropagation(missingRoot)],
      ["pair-freeze", checkPairFreeze(missingRoot)],
      ["module-drift", checkModuleDrift(missingRoot)],
      ["merged-plan-status", checkMergedPlanStatus(missingRoot)],
      ["review-evidence", checkReviewEvidence(missingRoot)],
      ["guardrail-invariants", checkGuardrailInvariants(missingRoot)],
      ["asset-drift", checkAssetDrift(missingRoot)],
      ["completion-decision-packet", checkCompletionDecisionPacket(missingRoot)],
      ["green-command-digest", checkGreenCommandDigests(missingRoot)],
      ["skill-assignment", checkSkillAssignment(missingRoot)],
      ["descent-obligation", checkDescentObligation(missingRoot)],
      ["change-impact", checkChangeImpact(missingRoot)],
      ["change-set-integrity", checkChangeSetIntegrity(missingRoot)],
      ["verification-profile", checkVerificationProfile(missingRoot)],
      ["coding-rules", checkCodingRules(missingRoot)],
      ["ddd-tdd-rules", checkDddTddRules(missingRoot)],
      ["design-language", checkDesignLanguage(missingRoot)],
      ["runtime-portability", checkRuntimePortability(missingRoot)],
      ["db-projection-coverage", checkDbProjectionCoverage(missingRoot)],
      ["db-projection-ingestion", checkDbProjectionIngestion(missingRoot)],
      ["rule-drift", checkRuleDrift(missingRoot)],
      ["gate-confirm", checkGateConfirm(missingRoot)],
      ["plan-dod", checkPlanDod(missingRoot)],
      ["placeholder-deps", checkPlaceholderDeps(missingRoot)],
      ["g1-trace", checkPlanTraceGate(missingRoot, "G1-trace")],
      ["g3-trace", checkPlanTraceGate(missingRoot, "G3-trace")],
      ["rule-automation-closure", checkRuleAutomationClosure(missingRoot)],
      ["drive-model-passage", checkDriveModelPassage(missingRoot)],
      ["drive-db-registration", checkDriveDbRegistration(missingRoot)],
      ["fr-roadmap-coverage", checkFrRoadmapCoverage(missingRoot)],
      ["telemetry-closure", checkTelemetryClosure(missingRoot)],
      ["cycle-p4-verification", checkCycleP4Verification(missingRoot)],
      ["l6-fr-coverage", checkL6FrCoverage(missingRoot)],
      ["readability", checkReadability(missingRoot)],
      ["runtime-readability", checkRuntimeReadability(missingRoot)],
      ["project-hook", checkProjectHooks(missingRoot)],
      ["tool-contract-registry", checkToolContractRegistry(missingRoot)],
      ["codex-wrapper-parity", checkCodexWrapperParity(deps({ repoRoot: missingRoot }))],
      ["l6-completion", checkL6Completion(missingRoot)],
      ["l7-completion", checkL7Completion(missingRoot)],
      ["verification-groups", checkVerificationGroupsResult(missingRoot)],
      ["roadmap", checkRoadmap(missingRoot)],
      ["impl-plan-trace", checkImplPlanTrace(missingRoot)],
      ["oracle-test-trace", checkOracleTestTrace(missingRoot)],
      ["tracked-canonical", checkTrackedCanonical(missingRoot)],
      ["dependency-drift", checkDependencyDrift(missingRoot)],
      ["right-arm-verification-strategy", checkRightArmVerificationStrategy(missingRoot)],
      ["version-up-readiness", checkVersionUpReadiness(missingRoot)],
      ["action-binding-approval-readiness", checkActionBindingApprovalReadiness(missingRoot)],
      ["s4-decision-readiness", checkS4DecisionReadiness(missingRoot)],
      ["cutover-readiness", checkCutoverReadiness(missingRoot)],
      ["objective-evidence-audit", checkObjectiveEvidenceAudit(missingRoot)],
      ["semantic-frontier-consistency", checkSemanticFrontierConsistency(missingRoot)],
      ["regression-expansion", checkRegressionExpansion(missingRoot, null)],
    ] as const;

    expect(checks.filter(([, result]) => result.ok).map(([name]) => name)).toEqual([]);
    for (const [name, result] of checks) {
      const messages = result.messages.join("\n");
      if (name === "verification-groups") {
        expect(messages).toContain("design doc なし");
      } else {
        expect(messages).toMatch(/violation/i);
      }
    }
  });

  it("fails db projection ingestion when pair-agent evidence gates are blocked", () => {
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-pair-agent-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      mkdirSync(join(root, ".ut-tdd", "evidence", "pair-agent"), { recursive: true });
      writeFileSync(
        join(root, "docs", "plans", "PLAN-L7-177-helix-orchestration-runtime-bridge.md"),
        [
          "---",
          "plan_id: PLAN-L7-177-helix-orchestration-runtime-bridge",
          "title: pair-agent evidence doctor fixture",
          "kind: add-impl",
          "layer: L7",
          "drive: agent",
          "status: confirmed",
          "created: 2026-07-01",
          "updated: 2026-07-01",
          "---",
          "",
          "# Fixture",
        ].join("\n"),
      );
      writeFileSync(
        join(root, ".ut-tdd", "evidence", "pair-agent", "20260701034800-PLAN-L7-177.json"),
        `${JSON.stringify(
          {
            schema_version: "pair-agent-run-evidence.v1",
            recorded_at: "2026-07-01T03:48:00.000Z",
            run_id: "pair-agent:PLAN-L7-177:20260701034800",
            mode: "hybrid",
            execute: true,
            trace: {
              plan_id: "PLAN-L7-177-helix-orchestration-runtime-bridge",
              span_id: "pair-agent:PLAN-L7-177:20260701034800:run",
              tool_contract_id: "HC-P2.runPairAgentTddPlan",
              guardrail_decision: {
                guardrail: "frontier-approval",
                decision: "allow",
                human_signoff_required: false,
              },
              eval_outcome: { ok: true, status: "passed", final_verdict: "pass" },
              completed_at: "2026-07-01T03:48:00.000Z",
              phase_spans: [
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034800:phase:1",
                  phase: "smart_test_author",
                  cycle: 0,
                  agent_key: "smart-review-agent",
                  provider: "claude",
                  model: "claude-opus-4-8",
                  eval_outcome: { status: "passed", verdict: null, exit_code: 0 },
                },
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034800:phase:2",
                  phase: "light_implementation",
                  cycle: 1,
                  agent_key: "light-implementation-agent",
                  provider: "codex",
                  model: "gpt-5.3-codex-spark",
                  eval_outcome: { status: "passed", verdict: null, exit_code: 0 },
                },
                {
                  span_id: "pair-agent:PLAN-L7-177:20260701034800:phase:3",
                  phase: "smart_review",
                  cycle: 1,
                  agent_key: "smart-review-agent",
                  provider: "claude",
                  model: "claude-opus-4-8",
                  eval_outcome: { status: "passed", verdict: "pass", exit_code: 0 },
                },
              ],
            },
            result: {
              findings: [
                {
                  code: "light-agent-closure-claim",
                  severity: "error",
                  message: "light agent attempted to close the pair-agent loop",
                },
              ],
            },
          },
          null,
          2,
        )}\n`,
      );

      const result = checkDbProjectionIngestion(root);

      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("pair-agent-run-evidence gate blocked");
      expect(result.messages.join("\n")).toContain(
        "open pair-agent evidence finding pair-agent-evidence-light-agent-closure-claim",
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("skips change-impact / change-set-integrity in a non-git directory instead of failing closed", () => {
    // ZIP 展開のみ (非 git) の利用環境: git status が引けないだけで doctor を落とさない。
    const root = mkdtempSync(join(tmpdir(), "ut-tdd-doctor-nongit-"));
    try {
      const impact = checkChangeImpact(root);
      const integrity = checkChangeSetIntegrity(root);
      expect(impact.ok).toBe(true);
      expect(impact.messages.join("\n")).toMatch(/skipped \(not a git repository\)/);
      expect(integrity.ok).toBe(true);
      expect(integrity.messages.join("\n")).toMatch(/skipped \(not a git repository\)/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-GREENCMD-003: keeps all hard gates wired into runDoctor hard-gate aggregation", () => {
    const source = readFileSync(join(process.cwd(), "src", "doctor", "index.ts"), "utf8");
    const okExpression = source.match(/return\s+\{\s+ok:([\s\S]*?),\s+messages:\s+\[/)?.[1] ?? "";
    const expectedHardGates = [
      "backfill",
      "scrumRev",
      "propagation",
      "pairFreeze",
      "moduleDrift",
      "mergedPlanStatus",
      "reviewEvidence",
      "guardrailInvariants",
      "assetDrift",
      "skillAssignment",
      "descentObligation",
      "changeImpact",
      "changeSetIntegrity",
      "verificationProfile",
      "codingRules",
      "dddTddRules",
      "designLanguage",
      "runtimePortability",
      "dbProjectionCoverage",
      "dbProjectionIngestion",
      "ruleDrift",
      "gateConfirm",
      "planSchedule",
      "planGovernance",
      "planDod",
      "placeholderDeps",
      "g1Trace",
      "g3Trace",
      "ruleAutomationClosure",
      "driveModelPassage",
      "driveDbRegistration",
      "frRoadmapCoverage",
      "telemetryClosure",
      "cycleP4Verification",
      "l6FrCoverage",
      "readability",
      "runtimeReadability",
      "projectHooks",
      "toolContractRegistry",
      "codexWrapperParity",
      "l6Completion",
      "l7Completion",
      "verificationGroups",
      "roadmap",
      "implPlanTrace",
      "oracleTestTrace",
      "trackedCanonical",
      "greenCommandDigest",
      "dependencyDrift",
      "rightArmVerificationStrategy",
      "versionUpReadiness",
      "completionDecisionPacket",
      "handoverDecisionPacket",
      "objectiveEvidenceAudit",
      "regressionExpansion",
    ];

    expect(expectedHardGates.filter((name) => !okExpression.includes(`${name}.ok`))).toEqual([]);
  });
});
