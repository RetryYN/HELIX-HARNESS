import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkActionBindingApprovalReadiness,
  checkAgentSlots,
  checkAllowlistSync,
  checkApprovalReviewBinding,
  checkAssetDrift,
  checkBackfillResult,
  checkChangeImpact,
  checkChangeSetIntegrity,
  checkClosureApplyBinding,
  checkCodexWrapperParity,
  checkCodingRules,
  checkCompletionDecisionPacket,
  checkCompletionReviewBundle,
  checkCutoverReadiness,
  checkCycleP4Verification,
  checkDbProjectionCoverage,
  checkDbProjectionIngestion,
  checkDddTddRules,
  checkDependencyDrift,
  checkDescentObligation,
  checkDesignCoverage,
  checkDesignLanguage,
  checkDriveDbRegistration,
  checkDriveModelBinding,
  checkDriveModelPassage,
  checkFrRoadmapCoverage,
  checkFunctionDesignAbsorptionBinding,
  checkGateConfirm,
  checkGuardrailInvariants,
  checkImplPlanTrace,
  checkJudgmentCoreCoverage,
  checkL6Completion,
  checkL6FrCoverage,
  checkL7Completion,
  checkL12CompatibilityBinding,
  checkL14CloseAudit,
  checkMergedPlanStatus,
  checkModuleDrift,
  checkObjectiveEvidenceAudit,
  checkOperationScopeBinding,
  checkOracleTestTrace,
  checkPairFreeze,
  checkPlaceholderDeps,
  checkPlanDod,
  checkPlanGovernance,
  checkPlanTraceGate,
  checkProjectCurrentLocation,
  checkProjectHooks,
  checkProjectSkillBinding,
  checkPropagation,
  checkReadability,
  checkRecoveryExitBinding,
  checkRecoveryHandoffBinding,
  checkRecoveryRunwayBinding,
  checkRefactorCandidateTriage,
  checkRegressionExpansion,
  checkRequirementsBindingConfig,
  checkReviewEvidence,
  checkRightArmVerificationStrategy,
  checkRoadmap,
  checkRoadmapCurrentBinding,
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
  checkVerifierProviderMismatch,
  checkVersionUpReadiness,
  checkVisualizationTreeViewBoundary,
  checkVisualizationTreeViewSummarySurface,
  checkVisualizationViewModelBoundary,
  checkVmodelFit,
  checkVmodelZipManifest,
  checkVscodeExtensionDynamicBinding,
  checkZipAdoptionBinding,
  checkZipReferenceRuntimeBoundary,
  checkZipSourceBinding,
  completionDedicatedPacketBridgeViolations,
  type DoctorDeps,
  projectRuntimeModelTelemetryForDoctor,
  runConsumerDoctor,
  runDoctor,
} from "../../src/doctor/index";
import { checkGreenCommandDigests } from "../../src/lint/green-command-digest";
import {
  analyzeOutstandingWork,
  completionDecisionPacketForOutstanding,
  completionReviewBundleForOutstanding,
  computeOutstandingWork,
} from "../../src/lint/outstanding";
import {
  buildS4DecisionPackets,
  loadS4DecisionReadinessInput,
} from "../../src/lint/s4-decision-readiness";
import type { AgentSlotsDeps, Slot } from "../../src/runtime/agent-slots";
import { openHarnessDb, upsertRow } from "../../src/state-db/index";
import { migrate } from "../../src/state-db/migration";
import { VMODEL_ZIP_SOURCE_BINDINGS } from "../../src/vmodel/zip-manifest";

const NOW = "2026-06-04T00:00:00.000Z";
const slotStatePath = join("/repo", ".helix", "state", "agent-slots.json");

function codexWrapperParityFiles(root: string, overrides: Record<string, string> = {}) {
  const file = (relativePath: string) => join(root, ...relativePath.split("/"));
  return new Map<string, string>(
    Object.entries({
      ".claude/settings.json": [
        "{",
        '  "hooks": {',
        '    "SessionStart": [{ "hooks": [{ "command": "bun \\"$CLAUDE_PROJECT_DIR/src/cli.ts\\" session start" }] }],',
        '    "PostToolUse": [{ "hooks": [{ "command": "bun \\"$CLAUDE_PROJECT_DIR/src/cli.ts\\" hook post-tool-use" }] }],',
        '    "SubagentStop": [{ "hooks": [{ "type": "command", "command": "helix hook subagent-stop --quiet" }] }],',
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
        "helix codex --execute records the same session lifecycle through the adapter wrapper",
        "helix codex --task-file feeds file content through the same adapter wrapper",
        "helix codex --plan records wrapper lifecycle without forwarding plan flags to Codex",
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
    "- `helix status`、`helix completion decision-packet --json`、`helix completion review-bundle --json`、`helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json`、`helix doctor --profile consumer` を HELIX local state evidence として使う。completion review-bundle は exact digest と semantic digest を確認する。",
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
    "現行 `helix` CLI 経由で repository-local HELIX command を使う。最初に `helix status --json`、`helix completion decision-packet --json`、`helix completion review-bundle --json`、`helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json` を実行し、completion review-bundle の exact digest と semantic digest を確認する。必要な verification を走らせ、workflow または gate behavior に影響する場合は `helix doctor --profile consumer` で閉じる。",
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

function consumerProjectSetupStateTemplate(): string {
  const verificationMatrix = [
    {
      phase: "setup-dry-run",
      command: "helix setup project --dry-run",
      writePolicy: "no-write",
      requiresMaterializedPaths: [],
      expected: "setup dry-run returns import report and readiness plan",
      evidence: "first-run setup dry-run output",
    },
    {
      phase: "vscode-profile-open",
      command: "code --profile HELIX .",
      writePolicy: "no-write",
      requiresMaterializedPaths: [".vscode/tasks.json", ".vscode/settings.json"],
      expected: "VS Code opens the consumer folder with the HELIX profile",
      evidence: "first-run local VS Code profile-open evidence",
    },
    {
      phase: "status-frontier",
      command: "helix status --json",
      writePolicy: "no-write",
      requiresMaterializedPaths: [],
      expected: "status returns objective progress and workflow next actions",
      evidence: "first-run status JSON",
    },
    {
      phase: "github-ci-safety",
      command: "helix setup project --dry-run --json",
      writePolicy: "no-write",
      requiresMaterializedPaths: [],
      expected: "setup JSON returns read-only CI and consumer readiness",
      evidence: "first-run setup JSON",
    },
    {
      phase: "completion-decision-packet",
      command: "helix completion decision-packet --json",
      writePolicy: "no-write",
      requiresMaterializedPaths: [],
      expected: "completion packet remains blocked and does not allow completion claim",
      evidence: "first-run completion packet JSON",
    },
    {
      phase: "completion-review-bundle",
      command: "helix completion review-bundle --json",
      writePolicy: "no-write",
      requiresMaterializedPaths: [],
      expected:
        "completion review bundle remains plan-only and mustNotApply with bundleDigest and semanticBundleDigest",
      evidence: "first-run completion review-bundle JSON",
      adoptionDecision:
        "setup 初回検証は completion review-bundle の exact digest と semantic digest を保存する",
    },
    {
      phase: "version-up-dry-run",
      command:
        "helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
      writePolicy: "no-write",
      requiresMaterializedPaths: [],
      expected: "version-up dry-run remains plan-only and mustNotApply",
      evidence: "first-run version-up dry-run JSON",
    },
    {
      phase: "consumer-doctor",
      command: "helix doctor --profile consumer",
      writePolicy: "no-write",
      requiresMaterializedPaths: ["AGENTS.md", ".vscode/tasks.json", ".helix/teams"],
      expected: "consumer doctor passes projected setup artifacts",
      evidence: "first-run consumer doctor output",
    },
    {
      phase: "identifier-cutover-packet",
      command: "helix rename plan --json",
      writePolicy: "no-write",
      requiresMaterializedPaths: [],
      expected: "rename plan remains blocked until PLAN-M-02 approval",
      evidence: "first-run rename packet JSON",
    },
    {
      phase: "continuation-status",
      command: "helix status --json",
      writePolicy: "no-write",
      requiresMaterializedPaths: [],
      expected: "continuation status anchors the first project route",
      evidence: "first-run continuation status JSON",
    },
    {
      phase: "team-run-dry-run",
      command: "helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
      writePolicy: "no-write",
      requiresMaterializedPaths: [".helix/teams/default-hybrid.yaml"],
      expected: "team run returns a dry-run plan with separated worker/reviewer roles",
      evidence: "first-run team run dry-run JSON",
    },
  ];
  return JSON.stringify({
    schemaVersion: "helix-project-setup-state.v1",
    setupCommand: "helix setup project",
    phase: "0-A",
    objectiveBoundary: {
      scope: "consumer_setup_readiness_not_whole_program_completion",
      completionClaimAllowed: false,
      completionPacketCommand: "helix completion decision-packet --json",
      completionReviewBundleCommand: "helix completion review-bundle --json",
    },
    postSetupWorkflow: {
      nextRoute: "ready",
      readinessOk: true,
      verificationCommands: [
        ...new Set(
          verificationMatrix
            .filter((row) => row.phase !== "vscode-profile-open")
            .map((row) => row.command),
        ),
      ],
      manualVerificationCommands: verificationMatrix
        .filter((row) => row.phase === "vscode-profile-open")
        .map((row) => row.command),
      verificationMatrix,
    },
  });
}

function consumerDoctorFiles(root = "/repo", overrides: Record<string, string | null> = {}) {
  const file = (relativePath: string) => join(root, ...relativePath.split("/"));
  const entries: Record<string, string> = {
    "AGENTS.md": [
      "# consumer",
      "<!-- HELIX:managed:start -->",
      "# HELIX アダプター",
      "PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。",
      "PLAN-M-02 までは現行 command 名を `helix` とする。",
      "`helix completion decision-packet --json`",
      "`helix completion review-bundle --json`",
      "completion review-bundle は exact digest と semantic digest を確認する。",
      "`helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json`",
      "`helix doctor --profile consumer`",
      "`helix rename plan --json`",
      "<!-- HELIX:managed:end -->",
    ].join("\n"),
    "CLAUDE.md": [
      "<!-- HELIX:managed:start -->",
      "# HELIX 共有コンテキスト",
      "PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。",
      "PLAN-M-02 までは現行 command 名を `helix` とする。",
      "`helix completion decision-packet --json`",
      "`helix completion review-bundle --json`",
      "completion review-bundle は exact digest と semantic digest を確認する。",
      "`helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json`",
      "`helix doctor --profile consumer`",
      "`helix rename plan --json`",
      "<!-- HELIX:managed:end -->",
    ].join("\n"),
    ".claude/CLAUDE.md": [
      "<!-- HELIX:managed:start -->",
      "# Claude runtime アダプター",
      "PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。",
      "PLAN-M-02 までは現行 command 名を `helix` とする。",
      "`helix completion decision-packet --json`",
      "`helix completion review-bundle --json`",
      "completion review-bundle は exact digest と semantic digest を確認する。",
      "`helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json`",
      "`helix doctor --profile consumer`",
      "`helix rename plan --json`",
      "<!-- HELIX:managed:end -->",
    ].join("\n"),
    ".claude/settings.json": [
      "{",
      '  "hooks": {',
      '    "PreToolUse": [',
      '      { "matcher": "Agent|Task", "hooks": [{ "type": "command", "command": "helix hook agent-guard", "blockOnFailure": true }] },',
      '      { "matcher": "Edit|Write|MultiEdit", "hooks": [{ "type": "command", "command": "helix hook work-guard", "blockOnFailure": true }] },',
      '      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "helix hook git-command-guard", "blockOnFailure": true }] }',
      "    ],",
      '    "SessionStart": [{ "hooks": [{ "type": "command", "command": "helix session start", "timeout": 90 }] }],',
      '    "PostToolUse": [{ "matcher": "Edit|Write|MultiEdit|Bash", "hooks": [{ "type": "command", "command": "helix hook post-tool-use" }] }],',
      '    "Stop": [{ "hooks": [{ "type": "command", "command": "helix session summary" }] }],',
      '    "SubagentStop": [{ "hooks": [{ "type": "command", "command": "helix hook subagent-stop" }] }]',
      "  }",
      "}",
    ].join("\n"),
    ".codex/config.toml": "[features]\nhooks = true\n",
    "package.json": JSON.stringify({
      name: "consumer",
      scripts: {
        helix: "helix",
        typecheck: "tsc --noEmit",
        test: "vitest",
      },
      devDependencies: {
        helix: "workspace:*",
      },
    }),
    "bun.lock": "",
    ".codex/hooks.json": [
      "{",
      '  "hooks": {',
      '    "PreToolUse": [',
      '      { "matcher": "spawn_agent|spawn_agents_on_csv|Agent", "hooks": [{ "type": "command", "command": "helix hook agent-guard", "blockOnFailure": true }] },',
      '      { "matcher": "apply_patch|Write|Edit", "hooks": [{ "type": "command", "command": "helix hook work-guard", "blockOnFailure": true }] },',
      '      { "matcher": "Bash", "hooks": [{ "type": "command", "command": "helix hook git-command-guard", "blockOnFailure": true }] }',
      "    ],",
      '    "SessionStart": [{ "hooks": [{ "type": "command", "command": "helix session start", "timeout": 90 }] }],',
      '    "PostToolUse": [{ "matcher": "apply_patch|Write|Edit|Bash", "hooks": [{ "type": "command", "command": "helix hook post-tool-use" }] }],',
      '    "SubagentStop": [{ "hooks": [{ "type": "command", "command": "helix hook subagent-stop --quiet" }] }],',
      '    "Stop": [{ "hooks": [{ "type": "command", "command": "helix session summary --quiet" }] }]',
      "  }",
      "}",
    ].join("\n"),
    ".vscode/tasks.json": JSON.stringify({
      version: "2.0.0",
      tasks: [
        {
          label: "HELIX: status",
          type: "shell",
          command: "bun run helix status",
          problemMatcher: [],
        },
        {
          label: "HELIX: doctor",
          type: "shell",
          command: "bun run helix doctor --profile consumer",
          problemMatcher: [],
        },
        {
          label: "HELIX: completion decision-packet",
          type: "shell",
          command: "bun run helix completion decision-packet --json",
          problemMatcher: [],
        },
        {
          label: "HELIX: completion review-bundle",
          type: "shell",
          command: "bun run helix completion review-bundle --json",
          problemMatcher: [],
        },
        {
          label: "HELIX: version-up dry-run",
          type: "shell",
          command:
            "bun run helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
          problemMatcher: [],
        },
        {
          label: "HELIX: rename plan",
          type: "shell",
          command: "bun run helix rename plan --json",
          problemMatcher: [],
        },
        {
          label: "HELIX: setup dry-run",
          type: "shell",
          command: "bun run helix setup project --dry-run",
          problemMatcher: [],
        },
        {
          label: "HELIX: team run dry-run",
          type: "shell",
          command:
            "bun run helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
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
      "        with:",
      "          persist-credentials: false",
      "      - uses: oven-sh/setup-bun@v2",
      "      - run: bun install --frozen-lockfile",
      "      - name: HELIX CLI dependency",
      "        run: bun run helix --version",
      "      - name: HELIX setup dry-run",
      "        run: bun run helix setup project --dry-run --json",
      "      - name: HELIX status",
      "        run: bun run helix status --json",
      "      - name: HELIX completion decision packet",
      "        run: bun run helix completion decision-packet --json",
      "      - name: HELIX completion review bundle",
      "        run: bun run helix completion review-bundle --json",
      "      - name: HELIX version-up dry-run",
      "        run: bun run helix version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
      "      - name: HELIX consumer doctor",
      "        run: bun run helix doctor --profile consumer --json",
      "      - name: HELIX rename plan",
      "        run: bun run helix rename plan --json",
      "      - name: HELIX team run dry-run",
      "        run: bun run helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
      "      - run: bun run typecheck",
      "      - run: bun run test",
      "",
    ].join("\n"),
    ".github/workflows/escalation-stale.yml": [
      "name: escalation-stale",
      "on:",
      "  schedule:",
      "    - cron: '0 0 * * 1'",
      "permissions:",
      "  contents: read",
      "jobs:",
      "  escalation-audit:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "        with:",
      "          persist-credentials: false",
      "      - uses: oven-sh/setup-bun@v2",
      "      - run: bun install --frozen-lockfile",
      "      - name: HELIX status",
      "        run: bun run helix status --json",
      "      - name: HELIX completion decision packet",
      "        run: bun run helix completion decision-packet --json",
      "      - name: HELIX completion review bundle",
      "        run: bun run helix completion review-bundle --json",
      "      - name: HELIX consumer doctor",
      "        run: bun run helix doctor --profile consumer --json",
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
    "scripts/setup-branch-protection.sh": [
      "#!/usr/bin/env bash",
      "set -euo pipefail",
      'REPO="$' + '{1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"',
      "gh auth status >/dev/null",
      'ADMIN="$(gh api "repos/$' + "{REPO}\" -q '.permissions.admin')\"",
      'if [[ "$' + '{ADMIN}" != "true" ]]; then',
      '  echo "repository admin permission is required before branch protection apply" >&2',
      "  exit 2",
      "fi",
      'gh api -X PUT "repos/$' + '{REPO}/branches/main/protection" \\',
      '  -f "required_status_checks[strict]=true" \\',
      '  -f "required_status_checks[contexts][]=harness-check" \\',
      '  -f "enforce_admins=true" \\',
      '  -f "required_pull_request_reviews[required_approving_review_count]=1" \\',
      '  -f "restrictions="',
      'echo "main の branch protection を適用しました: $' + '{REPO}"',
      "",
    ].join("\n"),
    ".helix/memory/.gitkeep": "",
    ".helix/evidence/.gitkeep": "",
    ".helix/state/project-setup.json": consumerProjectSetupStateTemplate(),
    ".helix/teams/default-hybrid.yaml": consumerTeamDefinitionTemplate(),
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
  const legacyCliName = ["ut", "tdd"].join("-");
  const legacyStateDir = `.${legacyCliName}`;

  it("passes with generated consumer setup artifacts without requiring dogfood design docs", () => {
    const result = runConsumerDoctor(deps({ files: consumerDoctorFiles() }));

    expect(result.ok, result.messages.join("\n")).toBe(true);
    expect(hasDoctorMessage(result.messages, "doctor: profile=consumer")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-claude-adapter - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-vscode-tasks - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-ci-workflow - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-escalation-workflow - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-branch-protection-script - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-policy-templates - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-claude-surface - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-team-run-surface - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-project-setup-state - OK")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-package-preflight - OK")).toBe(true);
  });

  it("fails closed when saved setup state is ready but package.json is missing", () => {
    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          "package.json": null,
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-package-preflight - violation",
        "consumer_readiness:package-json",
      ),
    ).toBe(true);
  });

  it("fails closed when saved setup state is ready but package scripts drift", () => {
    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          "package.json": JSON.stringify({
            name: "consumer",
            scripts: {
              helix: "helix",
            },
          }),
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-package-preflight - violation",
        "consumer_readiness:typecheck-package-script",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-package-preflight - violation",
        "consumer_readiness:test-package-script",
      ),
    ).toBe(true);
  });

  it("fails closed when saved setup state is ready but the Bun lockfile is missing", () => {
    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          "bun.lock": null,
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-package-preflight - violation",
        "consumer_readiness:bun-lockfile",
      ),
    ).toBe(true);
  });

  it("fails closed when setup state loses the completion boundary", () => {
    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".helix/state/project-setup.json": JSON.stringify({
            schemaVersion: "helix-project-setup-state.v1",
            setupCommand: "helix setup project",
            objectiveBoundary: {
              scope: "consumer_setup_readiness_not_whole_program_completion",
              completionClaimAllowed: true,
              completionPacketCommand: "helix completion decision-packet --json",
              completionReviewBundleCommand: "helix completion review-bundle --json",
            },
            postSetupWorkflow: {
              nextRoute: "ready",
              readinessOk: true,
              verificationCommands: ["helix doctor --profile consumer"],
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
        "verificationCommands=helix doctor --profile consumer",
      ),
    ).toBe(true);
  });

  it("fails closed when setup state omits the completion review-bundle boundary command", () => {
    const setupState = JSON.parse(consumerProjectSetupStateTemplate()) as {
      objectiveBoundary: Record<string, unknown>;
    };
    delete setupState.objectiveBoundary.completionReviewBundleCommand;

    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".helix/state/project-setup.json": JSON.stringify(setupState),
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-project-setup-state - violation",
        "completionReviewBundle=false",
      ),
    ).toBe(true);
  });

  it("fails closed when setup state still routes to consumer readiness repair", () => {
    const setupState = JSON.parse(consumerProjectSetupStateTemplate()) as {
      postSetupWorkflow: {
        nextRoute: string;
        readinessOk: boolean;
        verificationCommands: string[];
      };
    };
    setupState.postSetupWorkflow.nextRoute = "fix_consumer_readiness";
    setupState.postSetupWorkflow.readinessOk = false;

    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".helix/state/project-setup.json": JSON.stringify(setupState),
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-project-setup-state - violation",
        "readinessOk=false",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-project-setup-state - violation",
        "nextRoute=fix_consumer_readiness",
      ),
    ).toBe(true);
  });

  it("fails closed when setup state omits the full first-run verification matrix", () => {
    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".helix/state/project-setup.json": JSON.stringify({
            schemaVersion: "helix-project-setup-state.v1",
            setupCommand: "helix setup project",
            phase: "0-A",
            objectiveBoundary: {
              scope: "consumer_setup_readiness_not_whole_program_completion",
              completionClaimAllowed: false,
              completionPacketCommand: "helix completion decision-packet --json",
              completionReviewBundleCommand: "helix completion review-bundle --json",
            },
            postSetupWorkflow: {
              nextRoute: "ready",
              readinessOk: true,
              verificationCommands: [
                "helix setup project --dry-run",
                "helix status --json",
                "helix setup project --dry-run --json",
                "helix completion decision-packet --json",
                "helix doctor --profile consumer",
                "helix rename plan --json",
                "helix status --json",
                "helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
              ],
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
        "verificationMatrix=false",
      ),
    ).toBe(true);
  });

  it("fails closed when the first-run verification matrix keeps phases but drifts command bindings", () => {
    const setupState = JSON.parse(consumerProjectSetupStateTemplate()) as {
      postSetupWorkflow: {
        verificationCommands: string[];
        verificationMatrix: Array<{ phase: string; command: string }>;
      };
    };
    setupState.postSetupWorkflow.verificationMatrix[1].command = "helix doctor --profile consumer";
    setupState.postSetupWorkflow.verificationCommands =
      setupState.postSetupWorkflow.verificationMatrix.map((row) => row.command);

    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".helix/state/project-setup.json": JSON.stringify(setupState),
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-project-setup-state - violation",
        "verificationMatrix=false",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-project-setup-state - violation",
        "matrixCommands=helix setup project --dry-run,helix doctor --profile consumer",
      ),
    ).toBe(true);
  });

  it("fails closed when the completion review-bundle matrix omits semantic digest evidence", () => {
    const setupState = JSON.parse(consumerProjectSetupStateTemplate()) as {
      postSetupWorkflow: {
        verificationMatrix: Array<{ phase: string; expected?: string; adoptionDecision?: string }>;
      };
    };
    const row = setupState.postSetupWorkflow.verificationMatrix.find(
      (candidate) => candidate.phase === "completion-review-bundle",
    );
    if (row) {
      row.expected = "completion review bundle remains plan-only and mustNotApply";
      row.adoptionDecision = "setup 初回検証は completion review-bundle を保存する";
    }

    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".helix/state/project-setup.json": JSON.stringify(setupState),
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-project-setup-state - violation",
        "completionReviewSemanticDigest=false",
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
            command: "bun run helix status",
            problemMatcher: [],
          },
          {
            label: "HELIX: doctor",
            type: "shell",
            command: "bun run helix doctor",
            problemMatcher: [],
          },
          {
            label: "HELIX: setup dry-run",
            type: "shell",
            command: "bun run helix setup project --dry-run",
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
            command: "bun run helix status",
            problemMatcher: [],
            runOptions: { runOn: "folderOpen" },
          },
          {
            label: "HELIX: doctor",
            type: "shell",
            command: "bun run helix doctor --profile consumer",
            problemMatcher: ["$tsc"],
          },
          {
            label: "HELIX: setup dry-run",
            type: "process",
            command: "bun run helix setup project --dry-run",
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
        "      - run: bun run helix --version",
        "      - run: bun run helix status --json",
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
      hasDoctorMessage(result.messages, "missingRuns=bun run helix setup project --dry-run --json"),
    ).toBe(true);
  });

  it("fails closed when the consumer CI workflow adds an extra run command outside the fixed smoke set", () => {
    const files = consumerDoctorFiles("/repo");
    const workflowPath = join("/repo", ".github", "workflows", "harness-check.yml");
    files.set(
      workflowPath,
      `${files.get(workflowPath) ?? ""}      - run: echo unexpected extra command\n`,
    );

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(result.messages, "consumer-ci-workflow - violation", "exactRuns=false"),
    ).toBe(true);
  });

  it("fails closed when consumer CI leaves checkout credentials persisted", () => {
    const files = consumerDoctorFiles("/repo", {
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
        "      - run: bun run helix --version",
        "      - run: bun run helix setup project --dry-run --json",
        "      - run: bun run helix status --json",
        "      - run: bun run helix completion decision-packet --json",
        "      - run: bun run helix doctor --profile consumer --json",
        "      - run: bun run helix rename plan --json",
        "      - run: bun run helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
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
        "checkoutPersistCredentialsFalse=false",
      ),
    ).toBe(true);
  });

  it("fails closed when consumer CI adds custom env or setup-bun inputs", () => {
    const files = consumerDoctorFiles("/repo", {
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
        "        with:",
        "          persist-credentials: false",
        "          token: $" + "{{ github.token }}",
        "      - uses: oven-sh/setup-bun@v2",
        "        with:",
        "          token: $" + "{{ github.token }}",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run helix --version",
        "      - run: bun run helix setup project --dry-run --json",
        "      - run: bun run helix status --json",
        "      - run: bun run helix completion decision-packet --json",
        "      - run: bun run helix doctor --profile consumer --json",
        "      - run: bun run helix rename plan --json",
        "        env:",
        "          HELIX_CI_MODE: read-only",
        "      - run: bun run helix status --json",
        "      - run: bun run helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
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
        "checkoutInputsExact=false",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-ci-workflow - violation",
        "setupBunInputsEmpty=false",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-ci-workflow - violation",
        "customEnvFree=false",
      ),
    ).toBe(true);
  });

  it("fails closed when consumer CI can skip or soft-pass fixed smoke commands", () => {
    const files = consumerDoctorFiles("/repo", {
      ".github/workflows/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [main]",
        "  pull_request:",
        "    branches: [main]",
        "permissions:",
        "  contents: read",
        "defaults:",
        "  run:",
        "    shell: bash",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    if: $" + "{{ false }}",
        "    continue-on-error: true",
        "    strategy:",
        "      fail-fast: false",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "        with:",
        "          persist-credentials: false",
        "      - uses: oven-sh/setup-bun@v2",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run helix --version",
        "      - run: bun run helix setup project --dry-run --json",
        "      - run: bun run helix status --json",
        "      - run: bun run helix completion decision-packet --json",
        "      - run: bun run helix doctor --profile consumer --json",
        "      - run: bun run helix rename plan --json",
        "        if: $" + "{{ false }}",
        "        continue-on-error: true",
        "      - run: bun run helix status --json",
        "      - run: bun run helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
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
        "skipOrSoftFailFree=false",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-ci-workflow - violation",
        "executionSurfaceFixed=false",
      ),
    ).toBe(true);
  });

  it("fails closed when consumer CI overrides job permissions or expression controls", () => {
    const files = consumerDoctorFiles("/repo", {
      ".github/workflows/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [main]",
        "  pull_request:",
        "    branches: [main]",
        "permissions:",
        "  contents: read",
        "concurrency: helix-consumer-smoke",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    permissions:",
        "      contents: write",
        "    environment: production",
        "    concurrency: helix-consumer-smoke-job",
        "    timeout-minutes: 1",
        "    continue-on-error: $" + "{{ true }}",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "        with:",
        "          persist-credentials: false",
        "      - uses: oven-sh/setup-bun@v2",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run helix --version",
        "      - run: bun run helix setup project --dry-run --json",
        "      - run: bun run helix status --json",
        "      - run: bun run helix completion decision-packet --json",
        "      - run: bun run helix doctor --profile consumer --json",
        "      - run: bun run helix rename plan --json",
        "        continue-on-error: false",
        "        shell: bash",
        "        timeout-minutes: 1",
        "        working-directory: .",
        "      - run: bun run helix status --json",
        "      - run: bun run helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
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
        "skipOrSoftFailFree=false",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-ci-workflow - violation",
        "jobPermissionsFixed=false",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-ci-workflow - violation",
        "executionSurfaceFixed=false",
      ),
    ).toBe(true);
  });

  it("fails closed when consumer CI adds extra triggers, actions, or bracket secret references", () => {
    const files = consumerDoctorFiles("/repo", {
      ".github/workflows/harness-check.yml": [
        "name: harness-check",
        "on:",
        "  push:",
        "    branches: [main]",
        "  pull_request:",
        "    branches: [main]",
        "  workflow_dispatch:",
        "permissions:",
        "  contents: read",
        "jobs:",
        "  harness-check:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "        with:",
        "          persist-credentials: false",
        "      - uses: oven-sh/setup-bun@v2",
        "      - uses: third-party/unpinned-action@v1",
        "      - run: bun install --frozen-lockfile",
        "      - run: bun run helix --version",
        "      - run: bun run helix setup project --dry-run --json",
        "      - run: bun run helix status --json",
        "      - run: bun run helix completion decision-packet --json",
        "      - run: bun run helix doctor --profile consumer --json",
        "      - run: bun run helix rename plan --json",
        "        env:",
        "          TOKEN: $" + "{{ secrets [ 'API_TOKEN' ] }}",
        "      - run: bun run helix status --json",
        "      - run: bun run helix team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: bun run typecheck",
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
        "unexpectedTriggers=workflow_dispatch",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-ci-workflow - violation",
        "unexpectedUses=third-party/unpinned-action@v1",
      ),
    ).toBe(true);
    expect(hasDoctorMessage(result.messages, "exactSteps=false")).toBe(true);
    expect(hasDoctorMessage(result.messages, "secrets=true")).toBe(true);
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

  it("U-SETUP-024: fails closed when escalation workflow is placeholder or write-capable", () => {
    const files = consumerDoctorFiles("/repo", {
      ".github/workflows/escalation-stale.yml": [
        "name: escalation-stale",
        "on:",
        "  schedule:",
        "    - cron: '0 0 * * 1'",
        "permissions:",
        "  issues: write",
        "jobs:",
        "  escalation-audit:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - run: echo escalation policy placeholder",
        "",
      ].join("\n"),
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-escalation-workflow - violation",
        "placeholderFree=false",
      ),
    ).toBe(true);
    expect(hasDoctorMessage(result.messages, "permissionsRead=false")).toBe(true);
  });

  it("U-SETUP-022: fails closed when branch protection script lacks required apply contract", () => {
    const files = consumerDoctorFiles("/repo", {
      "scripts/setup-branch-protection.sh": [
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        "gh auth status",
        "gh api -X PUT repos/example/repo/branches/main/protection",
        "",
      ].join("\n"),
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(hasDoctorMessage(result.messages, "consumer-branch-protection-script - violation")).toBe(
      true,
    );
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
        "- `helix status` と `helix doctor --profile consumer` を HELIX local state evidence として使う。",
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
      deps({ files: consumerDoctorFiles("/repo", { ".helix/teams/default-hybrid.yaml": null }) }),
    );
    expect(missing.ok).toBe(false);
    expect(
      hasDoctorMessage(
        missing.messages,
        "consumer-files - violation missing=.helix/teams/default-hybrid.yaml",
      ),
    ).toBe(true);

    const singleProvider = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".helix/teams/default-hybrid.yaml": [
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
        "<!-- HELIX:managed:start -->",
        "# Claude runtime アダプター",
        "<!-- HELIX:managed:end -->",
      ].join("\n"),
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(hasDoctorMessage(result.messages, "consumer-adapter-docs - violation")).toBe(true);
  });

  it("fails closed when legacy state exists after PLAN-M-02 cutover", () => {
    const files = consumerDoctorFiles("/repo", {
      [`${legacyStateDir}/teams/default-hybrid.yaml`]: "name: default-hybrid\nmembers: []\n",
      [`${legacyStateDir}/state/setup.json`]: "{}\n",
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(hasDoctorMessage(result.messages, "consumer-identifier-transition - violation")).toBe(
      true,
    );
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain(
      `legacy_state=${legacyStateDir}/state/setup.json,${legacyStateDir}/teams/default-hybrid.yaml`,
    );
  });

  it("fails closed when root helix runtime-like state exists after PLAN-M-02 cutover", () => {
    const files = consumerDoctorFiles("/repo", {
      "helix/evidence/rename/blast-radius-baseline.json": "{}\n",
      "helix/handover/CURRENT.json": "{}\n",
      "helix/harness.db": "",
      "helix/state/current-plan": "PLAN-M-02\n",
      "helix/teams/default-hybrid.yaml": "name: default-hybrid\nmembers: []\n",
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain(
      "legacy_state=helix/evidence/rename/blast-radius-baseline.json,helix/handover/CURRENT.json,helix/harness.db,helix/state/current-plan,helix/teams/default-hybrid.yaml",
    );
  });

  it("fails closed when package/bin or scripts expose the legacy CLI after PLAN-M-02 cutover", () => {
    const files = consumerDoctorFiles("/repo", {
      "package.json": JSON.stringify({
        name: "consumer",
        bin: { [legacyCliName]: `./dist/${legacyCliName}` },
        scripts: { doctor: `${legacyCliName} doctor --profile consumer` },
      }),
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain(`legacy_alias=package.json:bin.${legacyCliName},package.json:scripts.doctor`);
  });

  it("fails closed when package string bin exposes the legacy package command after cutover", () => {
    const files = consumerDoctorFiles("/repo", {
      "package.json": JSON.stringify({
        name: `@scope/${legacyCliName}`,
        bin: `./dist/${legacyCliName}`,
      }),
    });

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain("legacy_alias=package.json:bin");
  });

  it("fails closed when executable consumer surfaces expose legacy CLI commands after cutover", () => {
    const files = consumerDoctorFiles("/repo");
    const tasksPath = join("/repo", ".vscode", "tasks.json");
    const workflowPath = join("/repo", ".github", "workflows", "harness-check.yml");
    const hooksPath = join("/repo", ".codex", "hooks.json");
    files.set(
      tasksPath,
      (files.get(tasksPath) ?? "").replace("bun run helix status", `${legacyCliName} status`),
    );
    files.set(
      workflowPath,
      (files.get(workflowPath) ?? "").replace(
        "bun run helix status --json",
        `${legacyCliName} status --json`,
      ),
    );
    files.set(
      hooksPath,
      (files.get(hooksPath) ?? "").replace("helix hook work-guard", `${legacyCliName} doctor`),
    );

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain(
      "legacy_alias=.vscode/tasks.json,.github/workflows/harness-check.yml,.codex/hooks.json",
    );
  });

  it("fails closed when cutover, decision, or hook surfaces expose legacy CLI commands after cutover", () => {
    const files = consumerDoctorFiles("/repo");
    const tasksPath = join("/repo", ".vscode", "tasks.json");
    const workflowPath = join("/repo", ".github", "workflows", "harness-check.yml");
    const claudePath = join("/repo", ".claude", "settings.json");
    files.set(
      tasksPath,
      (files.get(tasksPath) ?? "").replace(
        "helix rename plan --json",
        `${legacyCliName} rename plan --json`,
      ),
    );
    files.set(
      workflowPath,
      (files.get(workflowPath) ?? "").replace(
        "bun run helix rename plan --json",
        `${legacyCliName} version-up activation-packet --json`,
      ),
    );
    files.set(
      claudePath,
      (files.get(claudePath) ?? "").replace(
        "helix hook agent-guard",
        `${legacyCliName} action-binding approval-packet`,
      ),
    );

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain(
      "legacy_alias=.vscode/tasks.json,.github/workflows/harness-check.yml,.claude/settings.json",
    );
  });

  it("fails closed when distributed Claude templates instruct legacy CLI commands after cutover", () => {
    const files = consumerDoctorFiles("/repo");
    const agentPath = join("/repo", ".claude", "agents", "security-audit.md");
    const commandPath = join("/repo", ".claude", "commands", "helix-status.md");
    files.set(
      agentPath,
      `${files.get(agentPath) ?? ""}\n- 旧 CLI で ${legacyCliName} doctor --profile consumer を実行する。\n`,
    );
    files.set(
      commandPath,
      `${files.get(commandPath) ?? ""}\n旧 CLI で ${legacyCliName} status --json を実行する。\n`,
    );

    const result = runConsumerDoctor(deps({ files }));

    expect(result.ok).toBe(false);
    expect(
      result.messages.find((message) => message.includes("consumer-identifier-transition")),
    ).toContain("legacy_alias=.claude/agents/security-audit.md,.claude/commands/helix-status.md");
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

  it("U-SETUP-025: fails closed when adapter hooks only contain command strings without schema-valid guard hooks", () => {
    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".claude/settings.json": JSON.stringify({
            hooks: {
              PreToolUse: [
                {
                  matcher: "Agent|Task",
                  hooks: [
                    {
                      type: "command",
                      command: "helix hook agent-guard",
                      blockOnFailure: true,
                    },
                  ],
                },
                {
                  matcher: "Edit|Write|MultiEdit",
                  hooks: [
                    {
                      type: "note",
                      command: "helix hook work-guard",
                      blockOnFailure: true,
                    },
                  ],
                },
                {
                  matcher: "Bash",
                  hooks: [
                    {
                      type: "command",
                      command: "helix hook git-command-guard",
                      blockOnFailure: true,
                    },
                  ],
                },
              ],
              SessionStart: [{ hooks: [{ type: "command", command: "helix session start" }] }],
              PostToolUse: [
                {
                  matcher: "Edit|Write|MultiEdit|Bash",
                  hooks: [{ type: "command", command: "helix hook post-tool-use" }],
                },
              ],
              Stop: [{ hooks: [{ type: "command", command: "helix session summary --quiet" }] }],
              SubagentStop: [{ hooks: [{ type: "command", command: "helix hook subagent-stop" }] }],
            },
          }),
          ".codex/hooks.json": JSON.stringify({
            hooks: {
              PreToolUse: [
                {
                  matcher: "spawn_agent|spawn_agents_on_csv|Agent",
                  hooks: [
                    {
                      type: "command",
                      command: "helix hook agent-guard",
                      blockOnFailure: true,
                    },
                  ],
                },
                {
                  matcher: "apply_patch|Write|Edit",
                  hooks: [
                    {
                      type: "command",
                      command: "helix hook work-guard",
                      blockOnFailure: false,
                    },
                  ],
                },
                {
                  matcher: "Bash",
                  hooks: [
                    {
                      type: "command",
                      command: "helix hook git-command-guard",
                      blockOnFailure: true,
                    },
                  ],
                },
              ],
              SessionStart: [{ hooks: [{ type: "command", command: "helix session start" }] }],
              PostToolUse: [
                {
                  matcher: "apply_patch|Write|Edit|Bash",
                  hooks: [{ type: "command", command: "helix hook post-tool-use" }],
                },
              ],
              Stop: [{ hooks: [{ type: "command", command: "helix session summary --quiet" }] }],
            },
          }),
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(hasDoctorMessage(result.messages, "consumer-claude-adapter - violation")).toBe(true);
    expect(hasDoctorMessage(result.messages, "consumer-codex-adapter - violation")).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-claude-adapter - violation",
        "JSON/schema baseline incomplete",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-codex-adapter - violation",
        "JSON/schema baseline incomplete",
      ),
    ).toBe(true);
  });

  it("U-SETUP-025: fails closed when Codex hooks=true is outside the features section", () => {
    const result = runConsumerDoctor(
      deps({
        files: consumerDoctorFiles("/repo", {
          ".codex/config.toml": "# [features]\n[other]\nhooks = true\n",
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(hasDoctorMessage(result.messages, "consumer-codex-adapter - violation")).toBe(true);
  });
});

function hasDoctorMessageWith(messages: string[], ...fragments: string[]): boolean {
  return messages.some((m) => fragments.every((fragment) => m.includes(fragment)));
}

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
  let liveDoctorResult: ReturnType<typeof runDoctor> | null = null;
  const liveDoctor = (): ReturnType<typeof runDoctor> => {
    liveDoctorResult ??= runDoctor();
    return liveDoctorResult;
  };

  it("U-OUTSTANDING-003: completion decision doctor bridge accepts the current live dedicated packets", () => {
    const result = checkCompletionDecisionPacket(process.cwd());

    expect(result.ok).toBe(true);
    expect(result.messages).toContainEqual(
      expect.stringContaining("completion-decision-packet - OK"),
    );
  });

  it("U-OUTSTANDING-003/U-OUTSTANDING-018: completion review-bundle doctor bridge accepts the current live scoped packet bundle", () => {
    const result = checkCompletionReviewBundle(process.cwd());
    const expectedBundle = completionReviewBundleForOutstanding(
      computeOutstandingWork(process.cwd()),
    );

    expect(result.ok).toBe(true);
    expect(result.messages).toContainEqual(
      expect.stringContaining("completion-review-bundle - OK"),
    );
    expect(result.messages).toContainEqual(
      expect.stringContaining(`decisions=${expectedBundle.decisionCount}`),
    );
    expect(result.messages).toContainEqual(
      expect.stringContaining(`reviewPackets=${expectedBundle.reviewPacketCount}`),
    );
    expect(result.messages).toContainEqual(expect.stringContaining("semanticDigest=sha256:"));
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

  it("U-OUTSTANDING-011: completion decision doctor bridge has no scoped packet drift for live decisions", () => {
    const livePacket = completionDecisionPacketForOutstanding(
      computeOutstandingWork(process.cwd()),
    );

    expect(livePacket.decisionCount).toBe(livePacket.decisions.length);
    expect(completionDedicatedPacketBridgeViolations(process.cwd(), livePacket)).toEqual([]);
  });

  it("U-OUTSTANDING-014: completion review-bundle doctor bridge accepts current live review packets", () => {
    const liveS4Packets = buildS4DecisionPackets(loadS4DecisionReadinessInput(process.cwd()));
    const expectedBundle = completionReviewBundleForOutstanding(
      computeOutstandingWork(process.cwd()),
    );

    const result = checkCompletionReviewBundle(process.cwd(), { s4Packets: liveS4Packets });
    expect(liveS4Packets).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.messages).toContainEqual(
      expect.stringContaining(`reviewPackets=${expectedBundle.reviewPacketCount}`),
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
    const r = liveDoctor();
    expect(hasDoctorMessageWith(r.messages, "doctor: asset-drift", "OK")).toBe(true);
  });

  it("includes allowlist-sync hard gate in doctor output", () => {
    const sync = checkAllowlistSync(process.cwd());
    const r = liveDoctor();

    expect(sync.ok).toBe(true);
    expect(hasDoctorMessage(r.messages, "doctor: allowlist-sync - OK")).toBe(true);
  });

  it("includes judgment-core-coverage hard gate in doctor output", () => {
    const coverage = checkJudgmentCoreCoverage(process.cwd());
    const r = liveDoctor();

    expect(coverage.ok).toBe(true);
    expect(hasDoctorMessage(r.messages, "doctor: judgment-core-coverage - OK")).toBe(true);
  });

  it("includes skill-assignment hard gate in doctor output", () => {
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: skill-assignment - OK")).toBe(true);
  });

  // PLAN-L7-95: the 4 previously-inert lint audits + the lint-wiring meta-gate must be
  // invoked by runDoctor (invocation fence — guards against re-introducing the absence-blindness
  // where a lint module is reachable/tested but its audit never runs in a runtime path).
  it("invokes the 4 newly-wired lint audits + lint-wiring meta-gate in doctor output", () => {
    const r = liveDoctor();
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
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: branch-kind-check - OK")).toBe(true);
  });

  it("includes right-arm verification strategy hard gate in doctor output", () => {
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: right-arm-verification-strategy - OK")).toBe(true);
  });

  it("includes L14 close audit hard gate in doctor output", () => {
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: l14-close-audit - OK")).toBe(true);
  });

  it("includes version-up readiness hard gate in doctor output", () => {
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: version-up-readiness - OK")).toBe(true);
  });

  it("includes action-binding approval readiness hard gate in doctor output", () => {
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: action-binding-approval-readiness - OK")).toBe(
      true,
    );
  });

  it("includes S4 decision readiness hard gate in doctor output", () => {
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: s4-decision-readiness - OK")).toBe(true);
  });

  it("includes cutover readiness hard gate in doctor output", () => {
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: cutover-readiness - OK")).toBe(true);
  });

  it("includes objective evidence audit hard gate in doctor output", () => {
    const audit = checkObjectiveEvidenceAudit(process.cwd());
    const r = liveDoctor();

    expect(audit.ok).toBe(true);
    expect(hasDoctorMessage(r.messages, "doctor: objective-evidence-audit - OK")).toBe(true);
    for (const message of audit.messages) {
      expect(hasDoctorMessage(r.messages, `doctor: ${message}`)).toBe(true);
    }
  });

  it("includes repository name path hard gate in doctor output", () => {
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: repository-name-paths - OK")).toBe(true);
  });

  it("includes semantic frontier consistency hard gate in doctor output", () => {
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: semantic-frontier-consistency - OK")).toBe(true);
  });

  it("includes G1/G3 trace gates in doctor output", () => {
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: g1-trace - OK")).toBe(true);
    expect(hasDoctorMessage(r.messages, "doctor: g3-trace - OK")).toBe(true);
  });

  it("includes requirements-binding config hard gate in doctor output", () => {
    const config = checkRequirementsBindingConfig(process.cwd());
    const r = liveDoctor();

    expect(config.ok).toBe(true);
    expect(hasDoctorMessage(r.messages, "doctor: requirements-binding-config - OK")).toBe(true);
  });

  it("includes refactor-candidate-triage warning surface in doctor output", () => {
    const triage = checkRefactorCandidateTriage(process.cwd());
    const r = liveDoctor();

    expect(triage.ok).toBe(true);
    expect(hasDoctorMessageWith(r.messages, "doctor: refactor-candidate-triage", "")).toBe(true);
  });

  it("hard-gates PLAN governance once repo frontmatter debt is closed", () => {
    const governance = checkPlanGovernance(process.cwd());
    const r = liveDoctor();

    expect(governance.ok).toBe(true);
    expect(governance.messages[0]).toContain("plan-governance - OK");
    expect(hasDoctorMessageWith(r.messages, "doctor: plan-schedule", "OK")).toBe(true);
    expect(hasDoctorMessage(r.messages, "doctor: plan-governance - OK")).toBe(true);
  });

  it("U-DESIGNCOV-014: design catalog coverage is wired into doctor as a hard gate", () => {
    const coverage = checkDesignCoverage(process.cwd());
    const r = liveDoctor();

    expect(coverage.ok).toBe(true);
    expect(coverage.messages[0]).toContain("design-coverage");
    expect(hasDoctorMessageWith(r.messages, "doctor: design-coverage", "OK")).toBe(true);
  });

  it("surfaces dependency-drift and regression expansion instead of scaffold stub", () => {
    const r = liveDoctor();
    expect(hasDoctorMessage(r.messages, "doctor: dependency-drift")).toBe(true);
    expect(hasDoctorMessage(r.messages, "doctor: regression-expansion")).toBe(true);
    expect(r.messages.some((m) => m.includes("scaffold stub"))).toBe(false);
  });

  it("surfaces Project current-location as an advisory doctor check", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-current-location-"));
    const db = openHarnessDb(":memory:", { repoRoot: root });
    try {
      migrate(db);
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: {
          plan_id: "PLAN-L14-01-close",
          kind: "impl",
          layer: "L14",
          drive: "agent",
          status: "confirmed",
          updated_at: "2026-07-08T00:00:00.000Z",
        },
      });
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: {
          plan_id: "PLAN-L7-999-new-impl",
          kind: "add-impl",
          layer: "L7",
          drive: "agent",
          status: "draft",
          updated_at: "2026-07-08T00:01:00.000Z",
        },
      });
      upsertRow(db, {
        table: "design_declarations",
        primaryKey: "declaration_id",
        row: {
          declaration_id: "decl:HVC-L1-PLANNING-INTENT",
          defined_id: "HVC-L1-PLANNING-INTENT",
          declaration_kind: "企画 採用境界",
          title: "L1 planning intent coverage",
          layer: "L1",
          owner: "TL",
          status: "draft",
          source_path: "docs/design/helix/L12-vmodel/vmodel-layer-coverage.md",
          source: "test-fixture",
          indexed_at: "2026-07-08T00:02:00.000Z",
        },
      });
      for (const row of [
        {
          declaration_id: "decl:US-03",
          defined_id: "US-03",
          declaration_kind: "ストーリー",
          title: "通知設定 Story",
          layer: "L3",
          source_path: "docs/112_プロダクトバックログ.yaml",
        },
        {
          declaration_id: "decl:SP-2",
          defined_id: "SP-2",
          declaration_kind: "スプリント計画",
          title: "通知スプリント",
          layer: "L7",
          source_path: "docs/116_スプリント計画.yaml",
        },
        {
          declaration_id: "decl:AC-03-1",
          defined_id: "AC-03-1",
          declaration_kind: "受入基準",
          title: "通知設定 BDD",
          layer: "L11",
          source_path: "docs/29_受入基準・BDDシナリオ.yaml",
        },
      ]) {
        upsertRow(db, {
          table: "design_declarations",
          primaryKey: "declaration_id",
          row: {
            ...row,
            owner: "TL",
            status: "draft",
            source: "test-fixture",
            indexed_at: "2026-07-08T00:02:30.000Z",
          },
        });
      }
      upsertRow(db, {
        table: "roadmap_rollups",
        primaryKey: "rollup_id",
        row: {
          rollup_id: "program",
          total_bands: 5,
          covered_bands: 5,
          parked_bands: 0,
          uncovered_bands: 0,
          total_gates: 0,
          reached_gates: 0,
          total_spans: 0,
          confirmed_spans: 0,
          frontier: "",
          computed_at: "2026-07-08T00:03:00.000Z",
        },
      });
      for (const [bandId, name] of [
        ["upstream", "上流 (要求〜要件 L0-L3)"],
        ["design", "設計 (基本〜機能 L4-L6)"],
        ["impl", "実装+谷 (L7)"],
        ["verification", "検証 (結合〜運用 L8-L14)"],
        ["cutover", "cutover (legacy-source isolation)"],
      ]) {
        upsertRow(db, {
          table: "roadmap_band_coverage",
          primaryKey: "band_id",
          row: {
            band_id: bandId,
            name,
            status: "covered",
            roadmap_ids: "",
            computed_at: "2026-07-08T00:03:00.000Z",
          },
        });
      }
      upsertRow(db, {
        table: "project_vmodel_handoff_summary",
        primaryKey: "summary_id",
        row: {
          summary_id: "recovery_handoff",
          snapshot_id: "project-current-location:latest",
          status: "none",
          handoff_total: 0,
          machine_pending: 0,
          approval_pending: 0,
          approval_required: 0,
          approval_rejected: 0,
          apply_ready: 0,
          scope_match: 0,
          scope_mismatch: 0,
          scope_missing: 0,
          valid_for_apply: 0,
          invalid_for_apply: 0,
          recovery_gate_status: "none",
          effective_phase: "none",
          approval_state: "not_required",
          approval_status: null,
          scope_status: null,
          decision_id: null,
          materialize_status: null,
          reviewed_candidate_count: null,
          command: "helix vmodel fit --json",
          reason_codes: "handoff.next.missing,handoff.status.none",
          reasons: "total=0",
          indexed_at: "2026-07-08T00:04:00.000Z",
        },
      });
      upsertRow(db, {
        table: "automation_assets",
        primaryKey: "asset_id",
        row: {
          asset_id: "skill:gate-planning",
          asset_type: "skill",
          path: "docs/skills/gate-planning.md",
          trigger: "Scrum gate planning",
          role: "",
          capability: "scrum sprint gate planning checklist",
          skill_type: "orchestration",
          applies_layers: "L3,L7",
          applies_drive_models: "Forward,Scrum,Discovery",
          drift_status: "ok",
          indexed_at: "2026-07-08T00:05:00.000Z",
        },
      });
      upsertRow(db, {
        table: "automation_assets",
        primaryKey: "asset_id",
        row: {
          asset_id: "skill:planning-and-task-breakdown",
          asset_type: "skill",
          path: "docs/skills/planning-and-task-breakdown.md",
          trigger: "Scrum sprint planning and task breakdown",
          role: "",
          capability: "scrum sprint backlog planning task breakdown",
          skill_type: "orchestration",
          applies_layers: "L3,L7",
          applies_drive_models: "Forward,Scrum,Discovery",
          drift_status: "ok",
          indexed_at: "2026-07-08T00:05:00.000Z",
        },
      });
      upsertRow(db, {
        table: "automation_assets",
        primaryKey: "asset_id",
        row: {
          asset_id: "skill:harness-observability",
          asset_type: "skill",
          path: "docs/skills/harness-observability.md",
          trigger: "runtime verification and harness db observability",
          role: "",
          capability: "runtime verification harness db observability",
          skill_type: "verification",
          applies_layers: "L12",
          applies_drive_models: "Recovery,Forward",
          drift_status: "ok",
          indexed_at: "2026-07-08T00:05:00.000Z",
        },
      });

      const check = checkProjectCurrentLocation(root, db);

      expect(check.ok).toBe(true);
      expect(check.messages[0]).toContain("project-current-location - advisory");
      expect(check.messages[0]).toContain("status=needs_recovery");
      expect(check.messages[0]).toContain("route=drive:Recovery:recover-current-location");
      expect(check.messages[0]).toContain("route_status=recovery_required");
      expect(check.messages[0]).toContain("coverage done/missing/reverify=");
      expect(check.messages.join("\n")).toContain(
        "project-current-location - drive-route: drive:Recovery:recover-current-location status=recovery_required model=Recovery default=Forward return_to_design=true write=read-only",
      );
      expect(check.messages.join("\n")).toContain(
        "project-current-location - reverse-scope: targets=docs/design/**,docs/test-design/**",
      );
      expect(check.messages.join("\n")).toContain(
        "project-current-location - zip-adoption: status=missing adopt=0 complement=0 reject=0 missing=11",
      );
      expect(check.messages.join("\n")).toContain(
        "project-current-location - tailoring-gate: status=needs_tailoring profile=solo required=0 optional=0 na=2 missing=4",
      );
      expect(check.messages.join("\n")).toContain("project-current-location - design-impact:");
      expect(check.messages.join("\n")).toContain(
        "project-current-location - closure-overview: status=contradicted queue=1 close=0 collect=0 repair=0 reverse=1 apply=no_close_ready_candidates recommended=reverse_design human=false command=helix closure review-bundle --action reverse_design --summary-json",
      );
      expect(check.messages.join("\n")).toContain(
        "project-current-location - closure-approval-frontier: windows=0 current=0/0 listed=0 omitted=0",
      );
      expect(check.messages.join("\n")).toContain(
        "decision_record=helix closure decision-draft --action close_ready --limit 20 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft-offset-0.yml --summary-json",
      );
      expect(check.messages.join("\n")).toContain(
        "project-current-location - next-action-ledger: total=1",
      );
      expect(check.messages.join("\n")).toContain("reverse=1");
      expect(check.messages.join("\n")).toContain("l14_claim_with_l7_work");

      const fitCheck = checkVmodelFit(root, db);
      expect(fitCheck.ok).toBe(true);
      expect(fitCheck.messages.join("\n")).toContain("vmodel-fit - advisory: status=needs_fit");
      expect(fitCheck.messages.join("\n")).toContain(
        "vmodel-fit - current-location-gate: status=needs_recovery current=needs_recovery/contradicted",
      );
      expect(fitCheck.messages.join("\n")).toContain(
        "vmodel-fit - recovery-runway-gate: status=design_reverse_required blocking=1 machine=0 approval=0 reverse=1 after_machine=1 phases=1 next=reverse_design phase=design_reverse gate=recompute_drive_model command=helix closure batch --action reverse_design --json execute=helix closure batch --action reverse_design --json",
      );
      expect(fitCheck.messages.join("\n")).toContain(
        "vmodel-fit - recovery-runway-phases: 1:reverse_design:design_reverse:count=1:listed=1:remaining=0:gate=recompute_drive_model:signature=artifact:missing+execution:missing:plans=PLAN-L7-999-new-impl",
      );

      const boundaryCheck = checkVisualizationViewModelBoundary(root, db);
      expect(boundaryCheck.ok).toBe(true);
      expect(boundaryCheck.messages.join("\n")).toContain(
        "visualization-view-model-boundary - OK: project=current_location,layer_progress,design_test_pair,relation_graph,runtime_evidence harness=harness_growth,skill_agent_telemetry",
      );
      expect(boundaryCheck.messages.join("\n")).toContain(
        "command=helix progress view-model --json",
      );
      expect(boundaryCheck.messages.join("\n")).toContain(
        "visualization-view-model-boundary - l12-compatibility=",
      );
      expect(boundaryCheck.messages.join("\n")).toContain("implementation:bound:L7->L6");
      expect(boundaryCheck.messages.join("\n")).toContain(
        "project-excluded=evidence.skill_invocations,evidence.model_runs,harness_growth",
      );
      expect(boundaryCheck.messages.join("\n")).toContain(
        "harness-excluded=project_current_location.vmodel_fit,project_current_location.drive_route,project_current_location.closure,vmodel_zip_manifest,vmodel_zip_source_bindings,project_zip_adoption_decisions,project_tailoring_decisions,project_vmodel_regression_guards,project_vmodel_fit_blockers,project_vmodel_handoff_summary",
      );

      const treeBoundaryCheck = checkVisualizationTreeViewBoundary(root, db);
      expect(treeBoundaryCheck.ok).toBe(true);
      expect(treeBoundaryCheck.messages.join("\n")).toContain(
        "visualization-tree-view-boundary - OK: roots=project,harness",
      );
      expect(treeBoundaryCheck.messages.join("\n")).toContain(
        "visualization-tree-view-boundary - full-json-audit",
      );
      expect(treeBoundaryCheck.messages.join("\n")).toContain("allowed=none");
      expect(treeBoundaryCheck.messages.join("\n")).toContain(
        "policy=project-view-current-location harness-view-telemetry",
      );
      expect(treeBoundaryCheck.messages.join("\n")).toContain(
        "project/current-location/l12-compatibility",
      );
      expect(treeBoundaryCheck.messages.join("\n")).toContain(
        "project/current-location/l12-compatibility/l0_slide",
      );
      expect(treeBoundaryCheck.messages.join("\n")).toContain(
        "project/current-location/operation-scope/incident_recovery_route/observation-gap",
      );

      const treeSummarySurfaceCheck = checkVisualizationTreeViewSummarySurface(root);
      expect(treeSummarySurfaceCheck.ok).toBe(true);
      expect(treeSummarySurfaceCheck.messages.join("\n")).toContain(
        "visualization-tree-view-summary-surface - OK: status=pass checked=22 excluded=2 unexpected=0",
      );
      expect(treeSummarySurfaceCheck.messages.join("\n")).toContain(
        "source=helix progress tree-view --summary-json",
      );
      expect(treeSummarySurfaceCheck.messages.join("\n")).toContain(
        "visualization-tree-view-summary-surface - catalog=pass expected=22 missing=0 unexpected_surfaces=0 source_mismatches=0",
      );
      expect(treeSummarySurfaceCheck.messages.join("\n")).toContain(
        "closure-evidence-probe:helix closure evidence-probe --summary-json",
      );
      expect(treeSummarySurfaceCheck.messages.join("\n")).toContain(
        "vmodel-fit:helix vmodel fit --summary-json",
      );

      const vscodeDynamicBinding = checkVscodeExtensionDynamicBinding(root, db);
      expect(vscodeDynamicBinding.ok).toBe(true);
      expect(vscodeDynamicBinding.messages.join("\n")).toContain(
        "vscode-extension-dynamic-binding - OK: roots=project,harness",
      );
      expect(vscodeDynamicBinding.messages.join("\n")).toContain(
        "source=helix progress tree-view --json",
      );

      const compatibility = checkL12CompatibilityBinding(root, db);
      expect(compatibility.ok).toBe(true);
      expect(compatibility.messages.join("\n")).toContain("l12-compatibility-binding - OK");
      expect(compatibility.messages.join("\n")).toContain(
        "l12-compatibility-binding - l0-slide: declaration=HVC-L1-PLANNING-INTENT layer=L1",
      );
      expect(compatibility.messages.join("\n")).toContain("current=L14->L12");
      expect(compatibility.messages.join("\n")).toContain("l0_slide=not_observed");
      expect(compatibility.messages.join("\n")).toContain("function_design=not_observed");
      expect(compatibility.messages.join("\n")).toContain("implementation=L6");
      expect(compatibility.messages.join("\n")).toContain("operation=L12");
      expect(compatibility.messages.join("\n")).toContain(
        "l12-compatibility-binding - coverage-metadata:",
      );
      expect(compatibility.messages.join("\n")).toContain("L12:zip=");
      expect(compatibility.messages.join("\n")).toContain("tailoring=HVM-TAILOR-OPERATION");
      expect(compatibility.messages.join("\n")).toContain("remap_zip=");
      expect(compatibility.messages.join("\n")).toContain("remap_tailoring=");

      const roadmapBinding = checkRoadmapCurrentBinding(root, db);
      expect(roadmapBinding.ok).toBe(true);
      expect(roadmapBinding.messages.join("\n")).toContain("roadmap-current-binding -");
      expect(roadmapBinding.messages.join("\n")).toContain("db=L12");
      expect(roadmapBinding.messages.join("\n")).toContain(
        "route=drive:Recovery:recover-current-location",
      );
      expect(roadmapBinding.messages.join("\n")).toContain(
        "roadmap-current-binding - current-link:",
      );
      expect(roadmapBinding.messages.join("\n")).toContain(
        "roadmap-current-binding - l12-coverage: bands=5/5 layers=L1,L2,L3,L4,L5,L6,L7,L8,L9,L10,L11,L12",
      );
      expect(roadmapBinding.messages.join("\n")).toContain("current=L14->L12");
      expect(roadmapBinding.messages.join("\n")).toContain(
        "drive_action=drive:Recovery:recover-current-location",
      );
      expect(roadmapBinding.messages.join("\n")).toContain("command=helix roadmap current --json");
      expect(roadmapBinding.messages.join("\n")).toContain(
        "postcheck=helix db rebuild && helix roadmap current --json && helix current-location --json && helix vmodel fit",
      );

      const driveBinding = checkDriveModelBinding(root, db);
      expect(driveBinding.ok).toBe(true);
      expect(driveBinding.messages.join("\n")).toContain(
        "drive-model-binding - OK: selected=Recovery",
      );
      expect(driveBinding.messages.join("\n")).toContain(
        "route=drive:Recovery:recover-current-location",
      );
      expect(driveBinding.messages.join("\n")).toContain("coverage=");
      expect(driveBinding.messages.join("\n")).toContain(
        "drive-model-binding - dependency-closure:",
      );
      expect(driveBinding.messages.join("\n")).toContain(
        "drive-model-binding - reverse-dependency-closure:",
      );
      expect(driveBinding.messages.join("\n")).toContain("docs=docs/design/**,docs/test-design/**");
      expect(driveBinding.messages.join("\n")).toContain(
        "drive-model-binding - candidate-dependency-closure: Recovery:docs=docs/design/**+docs/test-design/**",
      );
      expect(driveBinding.messages.join("\n")).toContain(
        "Reverse:docs=docs/design/**+docs/test-design/**",
      );
      expect(driveBinding.messages.join("\n")).toContain(
        "drive-model-binding - selection-rationale: selected=Recovery default=Forward",
      );
      expect(driveBinding.messages.join("\n")).toContain(
        "trigger=L14 claim と L7/open evidence の矛盾",
      );
      expect(driveBinding.messages.join("\n")).toContain(
        "drive-model-binding - forward-gate: status=blocked",
      );
      expect(driveBinding.messages.join("\n")).toContain(
        "drive-model-binding - operation-verification: coverage=L12-operation-observability doc=docs/design/**,docs/test-design/**",
      );
      expect(driveBinding.messages.join("\n")).toContain(
        "impl=closure_next_action_ledger,design_declarations,gate_runs,hook_events,quality_signals,runtime_verification_events,test_runs",
      );
      expect(driveBinding.messages.join("\n")).toContain(
        "reverse_targets=docs/design/**,docs/test-design/**",
      );
      expect(driveBinding.messages.join("\n")).toContain("must_return=true");
      expect(driveBinding.messages.join("\n")).toContain("1:Recovery:selected");
      expect(driveBinding.messages.join("\n")).toContain("4:Forward:blocked");
      expect(driveBinding.messages.join("\n")).toContain(
        "postcheck=helix drive model --json && helix current-location --json && helix roadmap current --json && helix vmodel fit",
      );

      const projectSkillBinding = checkProjectSkillBinding(root, db);
      expect(projectSkillBinding.ok).toBe(true);
      expect(projectSkillBinding.messages.join("\n")).toContain(
        "project-skill-binding - OK: status=ready selected=Recovery",
      );
      expect(projectSkillBinding.messages.join("\n")).toContain("workflow=Recovery,Scrum");
      expect(projectSkillBinding.messages.join("\n")).toContain(
        "command=helix skill suggest --current-location --summary-json",
      );
      expect(projectSkillBinding.messages.join("\n")).toContain("automation_assets");
      expect(projectSkillBinding.messages.join("\n")).toContain("skill_recommendations");
      expect(projectSkillBinding.messages.join("\n")).toContain("skill:gate-planning:required");
      expect(projectSkillBinding.messages.join("\n")).toContain(
        "skill:planning-and-task-breakdown:required",
      );

      const recoveryRunway = checkRecoveryRunwayBinding(root, db);
      expect(recoveryRunway.ok).toBe(true);
      expect(recoveryRunway.messages.join("\n")).toContain("recovery-runway-binding - OK");
      expect(recoveryRunway.messages.join("\n")).toContain(
        "status=design_reverse_required blocking=1 machine=0 approval=0 reverse=1",
      );
      expect(recoveryRunway.messages.join("\n")).toContain("phases=1");
      expect(recoveryRunway.messages.join("\n")).toContain(
        "1:design_reverse:reverse_design:1:remaining=0:next=recompute_drive_model",
      );

      const recoveryHandoff = checkRecoveryHandoffBinding(root, db);
      expect(recoveryHandoff.ok).toBe(true);
      expect(recoveryHandoff.messages.join("\n")).toContain("recovery-handoff-binding - OK");
      expect(recoveryHandoff.messages.join("\n")).toContain("status=none");
      expect(recoveryHandoff.messages.join("\n")).toContain("db: status=none");

      const restoreRecoveryHandoffSummary = (): void => {
        upsertRow(db, {
          table: "project_vmodel_handoff_summary",
          primaryKey: "summary_id",
          row: {
            summary_id: "recovery_handoff",
            snapshot_id: "project-current-location:latest",
            status: "none",
            handoff_total: 0,
            machine_pending: 0,
            approval_pending: 0,
            approval_required: 0,
            approval_rejected: 0,
            apply_ready: 0,
            scope_match: 0,
            scope_mismatch: 0,
            scope_missing: 0,
            valid_for_apply: 0,
            invalid_for_apply: 0,
            recovery_gate_status: "none",
            effective_phase: "none",
            approval_state: "not_required",
            approval_status: null,
            scope_status: null,
            decision_id: null,
            materialize_status: null,
            reviewed_candidate_count: null,
            command: "helix vmodel fit --json",
            reason_codes: "handoff.next.missing,handoff.status.none",
            reasons: "total=0",
            indexed_at: "2026-07-08T00:04:00.000Z",
          },
        });
      };

      db.prepare(
        `UPDATE project_vmodel_handoff_summary
         SET recovery_gate_status = ?, reason_codes = ?
         WHERE summary_id = ?`,
      ).run("approval_pending", "handoff.status.approval_pending", "recovery_handoff");
      const driftedRecoveryHandoff = checkRecoveryHandoffBinding(root, db);
      expect(driftedRecoveryHandoff.ok).toBe(false);
      expect(driftedRecoveryHandoff.messages.join("\n")).toContain(
        "recovery-handoff-binding - violation: db.recovery_gate_status=approval_pending",
      );
      expect(driftedRecoveryHandoff.messages.join("\n")).toContain(
        "recovery-handoff-binding - violation: db.reason_code_missing=handoff.next.missing",
      );
      restoreRecoveryHandoffSummary();

      db.prepare(
        `UPDATE project_vmodel_handoff_summary
         SET approval_state = ?
         WHERE summary_id = ?`,
      ).run("pending_human_review", "recovery_handoff");
      const approvalStateDrift = checkRecoveryHandoffBinding(root, db);
      expect(approvalStateDrift.ok).toBe(false);
      expect(approvalStateDrift.messages.join("\n")).toContain(
        "recovery-handoff-binding - violation: db.approval_state=pending_human_review",
      );
      restoreRecoveryHandoffSummary();

      db.prepare("DELETE FROM project_vmodel_handoff_summary WHERE summary_id = ?").run(
        "recovery_handoff",
      );
      const missingRecoveryHandoff = checkRecoveryHandoffBinding(root, db);
      expect(missingRecoveryHandoff.ok).toBe(false);
      expect(missingRecoveryHandoff.messages.join("\n")).toContain(
        "recovery-handoff-binding - violation: db_row=missing",
      );
      restoreRecoveryHandoffSummary();

      const recoveryExit = checkRecoveryExitBinding(root, db);
      expect(recoveryExit.ok).toBe(true);
      expect(recoveryExit.messages.join("\n")).toContain("recovery-exit-binding - OK");
      expect(recoveryExit.messages.join("\n")).toContain(
        "status=blocked remaining=1 selected=reverse_design",
      );
      expect(recoveryExit.messages.join("\n")).toContain(
        "reverse_design:1:blocking=true:human=false",
      );
      expect(recoveryExit.messages.join("\n")).toContain(
        "helix current-location --json && helix drive model --json && helix roadmap current --json && helix vmodel fit",
      );

      const approvalReview = checkApprovalReviewBinding(root, db);
      expect(approvalReview.ok).toBe(true);
      expect(approvalReview.messages.join("\n")).toContain("approval-review-binding - OK");
      expect(approvalReview.messages.join("\n")).toContain(
        "status=none action=close_ready count=0",
      );

      const closureApply = checkClosureApplyBinding(root, db);
      expect(closureApply.ok).toBe(true);
      expect(closureApply.messages.join("\n")).toContain("closure-apply-binding - OK");
      expect(closureApply.messages.join("\n")).toContain(
        "readiness=no_close_ready_candidates close_ready=0 allowed=false approval_valid=false patches=0/0",
      );
      expect(closureApply.messages.join("\n")).toContain(
        "execute=helix closure apply --execute --approval-record <approved-approval-record-path> --limit 20 --offset 0 --json",
      );

      const operationScope = checkOperationScopeBinding(root, db);
      expect(operationScope.ok).toBe(true);
      expect(operationScope.messages.join("\n")).toContain("operation-scope-binding -");
      expect(operationScope.messages.join("\n")).toContain("coverage=L12-operation-observability");
      expect(operationScope.messages.join("\n")).toContain(
        "required=log_design,kpi_metric,runtime_verification,operation_test,class_method_contract,incident_recovery_route",
      );
      expect(operationScope.messages.join("\n")).toContain("runtime_verification_events");
      expect(operationScope.messages.join("\n")).toContain("operation-scope-binding - design=");
      expect(operationScope.messages.join("\n")).toContain(
        "operation-scope-binding - observation-sources=",
      );
      expect(operationScope.messages.join("\n")).toContain(
        "operation-scope-binding - traces=HAT-VMFIT-07:",
      );
      expect(operationScope.messages.join("\n")).toContain(
        "operation-scope-binding - observed-gap:",
      );
      expect(operationScope.messages.join("\n")).toContain(
        "operation-scope-binding - view-nodes=observation-gap:6/6",
      );

      const zipRuntimeBoundary = checkZipReferenceRuntimeBoundary(root);
      expect(zipRuntimeBoundary.ok).toBe(true);
      expect(zipRuntimeBoundary.messages.join("\n")).toContain(
        "zip-reference-runtime-boundary - OK",
      );
      expect(zipRuntimeBoundary.messages.join("\n")).toContain("policy=reference-only");
    } finally {
      db.close();
      rmSync(root, { recursive: true, force: true });
    }

    const r = liveDoctor();
    expect(hasDoctorMessageWith(r.messages, "doctor: project-current-location", "")).toBe(true);
    expect(
      hasDoctorMessageWith(r.messages, "doctor: project-current-location", "closure-overview"),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(r.messages, "doctor: visualization-view-model-boundary", "OK"),
    ).toBe(true);
    expect(hasDoctorMessageWith(r.messages, "doctor: visualization-tree-view-boundary", "OK")).toBe(
      true,
    );
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: visualization-tree-view-boundary",
        "full-json-audit",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: visualization-tree-view-summary-surface",
        "checked=22",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: visualization-tree-view-summary-surface",
        "unexpected=0",
      ),
    ).toBe(true);
    expect(hasDoctorMessageWith(r.messages, "doctor: vscode-extension-dynamic-binding", "OK")).toBe(
      true,
    );
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: vscode-extension-dynamic-binding",
        "source=helix progress tree-view --json",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: visualization-view-model-boundary",
        "l12-compatibility=pass",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(r.messages, "doctor: l12-compatibility-binding", "current=L14->L12"),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(r.messages, "doctor: l12-compatibility-binding", "l0_slide=L1"),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: roadmap-current-binding",
        "command=helix roadmap current --json",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(r.messages, "doctor: drive-model-binding", "selected=Recovery"),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: drive-model-binding",
        "operation-verification: coverage=L12-operation-observability",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: drive-model-binding",
        "runtime_verification_events",
      ),
    ).toBe(true);
    expect(hasDoctorMessageWith(r.messages, "doctor: project-skill-binding", "status=ready")).toBe(
      true,
    );
    expect(
      hasDoctorMessageWith(r.messages, "doctor: project-skill-binding", "workflow=Recovery,Scrum"),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: project-skill-binding",
        "helix skill suggest --current-location --summary-json",
      ),
    ).toBe(true);
    const recoveryRunway = r.messages.find((message) =>
      message.includes("doctor: recovery-runway-binding - OK:"),
    );
    expect(recoveryRunway).toMatch(/status=(?:machine_work_available|approval_required)/);
    if (recoveryRunway?.includes("status=machine_work_available")) {
      expect(recoveryRunway).toMatch(/machine=[1-9]\d*/);
    }
    const recoveryHandoff = r.messages.find((message) =>
      message.includes("doctor: recovery-handoff-binding - OK:"),
    );
    expect(recoveryHandoff).toMatch(
      /status=(?:approval_pending phase=approval|(?:generate_probe|generate_approval_draft|refresh_approval_draft|unchecked|unavailable) phase=machine)/,
    );
    expect(hasDoctorMessageWith(r.messages, "doctor: recovery-handoff-binding", "scope=")).toBe(
      true,
    );
    expect(
      r.messages.some(
        (message) =>
          message.includes("doctor: recovery-handoff-binding - db:") &&
          /status=(?:approval_|machine_)/.test(message),
      ),
    ).toBe(true);
    const handoffDecisionMatch = r.messages
      .find((message) => message.includes("doctor: recovery-handoff-binding - digest="))
      ?.match(/decision=(closure-review|closure-evidence-materialize):([a-z_]+)/);
    const handoffDecision = handoffDecisionMatch?.[2];
    expect(handoffDecision).toMatch(/^[a-z_]+$/);
    expect(handoffDecisionMatch?.[1]).toBe(
      recoveryHandoff?.includes("phase=approval")
        ? "closure-review"
        : "closure-evidence-materialize",
    );
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: recovery-handoff-binding",
        recoveryHandoff?.includes("phase=approval")
          ? "handoff.decision_draft.present"
          : "handoff.phase.machine",
      ),
    ).toBe(true);
    const liveCount = (surface: string, pattern: RegExp): number => {
      const line = r.messages.find((message) => message.includes(`doctor: ${surface}`));
      expect(line, `${surface} message`).toBeDefined();
      const match = line?.match(pattern);
      expect(match, `${surface} live count`).not.toBeNull();
      return Number(match?.[1]);
    };
    const recoveryRemaining = liveCount("recovery-exit-binding", /remaining=(\d+)/);
    const approvalCount = liveCount("approval-review-binding", /count=(\d+)/);
    const closureReadyCount = liveCount("closure-apply-binding", /close_ready=(\d+)/);
    expect(recoveryRemaining).toBeGreaterThan(0);
    expect(approvalCount).toBeGreaterThanOrEqual(0);
    expect(closureReadyCount).toBeGreaterThanOrEqual(0);
    const selectedAction = r.messages
      .find((message) => message.includes("doctor: recovery-exit-binding"))
      ?.match(/selected=([a-z_]+)/)?.[1];
    expect(selectedAction).toBe(handoffDecision);
    expect(
      hasDoctorMessageWith(r.messages, "doctor: approval-review-binding", `count=${approvalCount}`),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: closure-apply-binding",
        `close_ready=${closureReadyCount} allowed=false approval_valid=false patches=20/20`,
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: operation-scope-binding",
        "coverage=L12-operation-observability",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(r.messages, "doctor: operation-scope-binding", "observed_gap="),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: operation-scope-binding",
        "observed-gap: status=clear",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: operation-scope-binding",
        "view-nodes=observation-gap:6/6",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(r.messages, "doctor: operation-scope-binding", "class_method_contract:"),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: operation-scope-binding",
        "incident_recovery_route:",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: operation-scope-binding",
        "traces=HAT-VMFIT-07:4/4",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: zip-adoption-binding",
        "adopt=5 complement=3 reject=3 missing=0",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: zip-adoption-binding",
        "references=11/11 kinds=supports,complements,constrains",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: zip-adoption-binding",
        "decision-db: rows=11/11 table=project_zip_adoption_decisions categories=adopt:5,complement:3,reject:3",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: zip-adoption-binding",
        "receivers=HVM-ADOPT-01:design_declarations+design_references+vmodel_zip_source_bindings",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: zip-adoption-binding",
        "HVM-COMP-02:project_current_location+visualization_view_model+visualization_tree_view+vmodel_zip_source_bindings",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: zip-adoption-binding",
        "HVM-REJECT-01:zip-reference-runtime-boundary+vmodel_zip_manifest",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: zip-adoption-binding",
        "matrix-signature: entries=703 extensions=yaml:208,md:161,xlsx:263,png:26,py:29,json:9,feature:3,yml:1,txt:1 required_sources=21/21",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: zip-source-binding",
        `status=complete bound=${VMODEL_ZIP_SOURCE_BINDINGS.length} missing=0 advisory=0`,
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: zip-reference-runtime-boundary",
        "policy=reference-only",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: function-design-absorption-binding",
        "policy=abolished detail=covered tailoring=declared",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: function-design-absorption-binding",
        "declarations=detail:",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: function-design-absorption-binding",
        "tailoring-db: table=project_tailoring_decisions detail=required/詳細/declared",
      ),
    ).toBe(true);
    expect(
      hasDoctorMessageWith(
        r.messages,
        "doctor: function-design-absorption-binding",
        "canonical-sources=docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md,docs/design/helix/L3-requirements/vmodel-docgen-fit.md",
      ),
    ).toBe(true);
    expect(hasDoctorMessageWith(r.messages, "doctor: vmodel-fit", "current=needs_recovery")).toBe(
      true,
    );
  });

  it("surfaces roadmap-rollup as a hard gate summary line", () => {
    const r = liveDoctor();
    const rollupLines = r.messages.filter((m) => m.startsWith("doctor: roadmap-rollup"));

    expect(rollupLines).toHaveLength(1);
    expect(rollupLines[0]).toContain("bands ");
    expect(rollupLines[0]).toContain("gates ");
    expect(rollupLines[0]).toContain("spans ");
    expect(rollupLines[0]).toContain("frontier:");
  });

  it("surfaces Cycle P4 closure audit as a hard gate", () => {
    const r = liveDoctor();

    expect(hasDoctorMessage(r.messages, "doctor: cycle-p4-verification - OK")).toBe(true);
  });

  it("fails descent-obligation when a trace chain has no required downstream landing", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-descent-"));
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
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-guardrail-ok-"));
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
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-guardrail-same-"));
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
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-guardrail-intra-"));
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
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-guardrail-partial-"));
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
    const missingRoot = join(tmpdir(), `helix-doctor-guardrail-missing-${NOW}-nope`);
    const result = checkGuardrailInvariants(missingRoot);
    expect(result.ok).toBe(false);
  });

  it("fails confirmed L7 PLANs with unchecked DoD items", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-plan-dod-"));
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
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-placeholder-deps-"));
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
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-l7-completion-"));
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
          "| `helix review --uncommitted` | FR-45 | pending | doc-reviewer |",
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
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-codex-parity-"));
    try {
      const result = checkCodexWrapperParity(
        deps({ repoRoot: root, files: codexWrapperParityFiles(root) }),
      );

      expect(result.ok).toBe(true);
      expect(result.messages.join("\n")).toContain("codex-wrapper-parity - OK");
      expect(result.messages.join("\n")).toContain("codex=helix-wrapper-lifecycle");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-ADAPTER-009: fails closed when Codex wrapper lifecycle evidence is missing", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-codex-parity-missing-"));
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
    const missingRoot = join(tmpdir(), `helix-doctor-missing-${Date.now()}-nope`);
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
      ["completion-review-bundle", checkCompletionReviewBundle(missingRoot)],
      ["green-command-digest", checkGreenCommandDigests(missingRoot)],
      ["skill-assignment", checkSkillAssignment(missingRoot)],
      ["descent-obligation", checkDescentObligation(missingRoot)],
      ["change-impact", checkChangeImpact(missingRoot)],
      ["change-set-integrity", checkChangeSetIntegrity(missingRoot)],
      ["verification-profile", checkVerificationProfile(missingRoot)],
      ["coding-rules", checkCodingRules(missingRoot)],
      ["design-coverage", checkDesignCoverage(missingRoot)],
      ["ddd-tdd-rules", checkDddTddRules(missingRoot)],
      ["design-language", checkDesignLanguage(missingRoot)],
      ["runtime-portability", checkRuntimePortability(missingRoot)],
      ["db-projection-coverage", checkDbProjectionCoverage(missingRoot)],
      ["db-projection-ingestion", checkDbProjectionIngestion(missingRoot)],
      ["project-current-location", checkProjectCurrentLocation(missingRoot)],
      ["visualization-view-model-boundary", checkVisualizationViewModelBoundary(missingRoot)],
      ["visualization-tree-view-boundary", checkVisualizationTreeViewBoundary(missingRoot)],
      [
        "visualization-tree-view-summary-surface",
        checkVisualizationTreeViewSummarySurface(missingRoot),
      ],
      ["vscode-extension-dynamic-binding", checkVscodeExtensionDynamicBinding(missingRoot)],
      ["l12-compatibility-binding", checkL12CompatibilityBinding(missingRoot)],
      ["roadmap-current-binding", checkRoadmapCurrentBinding(missingRoot)],
      ["drive-model-binding", checkDriveModelBinding(missingRoot)],
      ["project-skill-binding", checkProjectSkillBinding(missingRoot)],
      ["recovery-runway-binding", checkRecoveryRunwayBinding(missingRoot)],
      ["recovery-handoff-binding", checkRecoveryHandoffBinding(missingRoot)],
      ["recovery-exit-binding", checkRecoveryExitBinding(missingRoot)],
      ["approval-review-binding", checkApprovalReviewBinding(missingRoot)],
      ["closure-apply-binding", checkClosureApplyBinding(missingRoot)],
      ["operation-scope-binding", checkOperationScopeBinding(missingRoot)],
      ["zip-adoption-binding", checkZipAdoptionBinding(missingRoot)],
      ["zip-source-binding", checkZipSourceBinding(missingRoot)],
      ["zip-reference-runtime-boundary", checkZipReferenceRuntimeBoundary(missingRoot)],
      ["function-design-absorption-binding", checkFunctionDesignAbsorptionBinding(missingRoot)],
      ["vmodel-zip-manifest", checkVmodelZipManifest(missingRoot)],
      ["vmodel-fit", checkVmodelFit(missingRoot)],
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
      ["l14-close-audit", checkL14CloseAudit(missingRoot)],
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
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-pair-agent-"));
    try {
      mkdirSync(join(root, "docs", "plans"), { recursive: true });
      mkdirSync(join(root, ".helix", "evidence", "pair-agent"), { recursive: true });
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
        join(root, ".helix", "evidence", "pair-agent", "20260701034800-PLAN-L7-177.json"),
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

  it("U-DBPROJ-PROV-03: overlays runtime session token usage into model_runs for doctor", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-runtime-model-runs-"));
    const oldClaudeDir = process.env.HELIX_CLAUDE_SESSIONS_DIR;
    const oldCodexDir = process.env.HELIX_CODEX_SESSIONS_DIR;
    try {
      const claudeDir = join(root, "claude-sessions");
      const codexDir = join(root, "codex-sessions");
      mkdirSync(claudeDir, { recursive: true });
      mkdirSync(codexDir, { recursive: true });
      process.env.HELIX_CLAUDE_SESSIONS_DIR = claudeDir;
      process.env.HELIX_CODEX_SESSIONS_DIR = codexDir;
      writeFileSync(
        join(claudeDir, "session.jsonl"),
        `${JSON.stringify({
          type: "assistant",
          sessionId: "doctor-session-1",
          message: {
            model: "claude-opus-4-8",
            usage: {
              input_tokens: 1000,
              output_tokens: 500,
              cache_creation_input_tokens: 0,
              cache_read_input_tokens: 2000,
            },
          },
        })}\n`,
      );
      const db = openHarnessDb(":memory:", { repoRoot: root });
      try {
        migrate(db);
        projectRuntimeModelTelemetryForDoctor(root, db);
        const row = db
          .prepare(
            "SELECT runtime, model, role, input_tokens, output_tokens, cached_input_tokens, cost_usd FROM model_runs WHERE role = ?",
          )
          .get("session") as
          | {
              runtime: string;
              model: string;
              role: string;
              input_tokens: number;
              output_tokens: number;
              cached_input_tokens: number;
              cost_usd: number;
            }
          | undefined;

        expect(row).toMatchObject({
          runtime: "claude",
          model: "claude-opus-4-8",
          role: "session",
          input_tokens: 1000,
          output_tokens: 500,
          cached_input_tokens: 2000,
        });
        expect(row?.cost_usd).toBeCloseTo(0.0185, 6);
      } finally {
        db.close();
      }
    } finally {
      if (oldClaudeDir === undefined) delete process.env.HELIX_CLAUDE_SESSIONS_DIR;
      else process.env.HELIX_CLAUDE_SESSIONS_DIR = oldClaudeDir;
      if (oldCodexDir === undefined) delete process.env.HELIX_CODEX_SESSIONS_DIR;
      else process.env.HELIX_CODEX_SESSIONS_DIR = oldCodexDir;
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("skips change-impact / change-set-integrity in a non-git directory instead of failing closed", () => {
    // ZIP 展開のみ (非 git) の利用環境: git status が引けないだけで doctor を落とさない。
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-nongit-"));
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
    const runFullDoctorBody =
      source.match(
        /function runFullDoctor[\s\S]*?return\s+\{\s+ok:([\s\S]*?),\s+messages:\s+\[/,
      )?.[1] ?? "";
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
      "vscodeExtensionDynamicBinding",
      "verifierProviderMismatch",
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
      "objectiveEvidenceAudit",
      "regressionExpansion",
    ];

    expect(expectedHardGates.filter((name) => !runFullDoctorBody.includes(`${name}.ok`))).toEqual(
      [],
    );
  });

  it("verifier-provider-mismatch doctor check blocks self-evaluation evidence", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-doctor-verifier-mismatch-"));
    try {
      const loopDir = join(root, ".helix", "state", "loop");
      mkdirSync(loopDir, { recursive: true });
      writeFileSync(
        join(loopDir, "PLAN-X.iterations.jsonl"),
        JSON.stringify({
          planId: "PLAN-X",
          iteration: 1,
          workerProvider: "codex",
          verifierProvider: "codex",
        }),
      );

      const result = checkVerifierProviderMismatch(root);
      expect(result.ok).toBe(false);
      expect(result.messages.join("\n")).toContain("hybrid self-evaluation rows=1");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
