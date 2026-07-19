import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkAgentSlots,
  type DoctorDeps,
  runConsumerDoctor,
  runDoctor,
} from "../src/doctor/index";
import type { AgentSlotsDeps, Slot } from "../src/runtime/agent-slots";

const NOW = "2026-06-04T00:00:00.000Z";
const slotStatePath = join("/repo", ".helix", "state", "agent-slots.json");

function _codexWrapperParityFiles(root: string, overrides: Record<string, string> = {}) {
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

describe("doctor registry / timing scope", () => {
  it("runs the toolchain scope through the registry and returns timing evidence", () => {
    const result = runDoctor(deps(), { scope: "toolchain", timing: true });

    expect(result.scope).toBe("toolchain");
    expect(result.timings).toEqual([
      expect.objectContaining({
        id: "toolchain-pin",
        ok: expect.any(Boolean),
        duration_ms: expect.any(Number),
        message_count: expect.any(Number),
      }),
    ]);
    expect(result.messages.every((message) => message.startsWith("doctor: "))).toBe(true);
    expect(result.messages.some((message) => message.includes("toolchain-pin"))).toBe(true);
  });

  it("keeps setup-smoke separate from full product doctor", () => {
    const result = runDoctor(deps({ files: consumerDoctorFiles() }), {
      setupSmoke: true,
      timing: true,
    });

    expect(result.setupSmoke).toBe(true);
    expect(result.timings).toEqual([
      expect.objectContaining({
        id: "setup-smoke",
        ok: true,
      }),
    ]);
    expect(result.messages).toContain("doctor: profile=consumer");
    expect(result.messages.some((message) => message.includes("backfill"))).toBe(false);
  });
});

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
    "package-lock.json": "",
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
          command: "npm run helix -- status",
          problemMatcher: [],
        },
        {
          label: "HELIX: doctor",
          type: "shell",
          command: "npm run helix -- doctor --profile consumer",
          problemMatcher: [],
        },
        {
          label: "HELIX: completion decision-packet",
          type: "shell",
          command: "npm run helix -- completion decision-packet --json",
          problemMatcher: [],
        },
        {
          label: "HELIX: completion review-bundle",
          type: "shell",
          command: "npm run helix -- completion review-bundle --json",
          problemMatcher: [],
        },
        {
          label: "HELIX: version-up dry-run",
          type: "shell",
          command:
            "npm run helix -- version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
          problemMatcher: [],
        },
        {
          label: "HELIX: rename plan",
          type: "shell",
          command: "npm run helix -- rename plan --json",
          problemMatcher: [],
        },
        {
          label: "HELIX: setup dry-run",
          type: "shell",
          command: "npm run helix -- setup project --dry-run",
          problemMatcher: [],
        },
        {
          label: "HELIX: team run dry-run",
          type: "shell",
          command:
            "npm run helix -- team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
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
      "      - uses: actions/setup-node@v4",
      "      - run: npm ci",
      "      - name: HELIX CLI dependency",
      "        run: npm run helix -- --version",
      "      - name: HELIX setup dry-run",
      "        run: npm run helix -- setup project --dry-run --json",
      "      - name: HELIX status",
      "        run: npm run helix -- status --json",
      "      - name: HELIX completion decision packet",
      "        run: npm run helix -- completion decision-packet --json",
      "      - name: HELIX completion review bundle",
      "        run: npm run helix -- completion review-bundle --json",
      "      - name: HELIX version-up dry-run",
      "        run: npm run helix -- version-up dry-run --current v0.1.0 --target v0.1.4 --release-remote https://github.com/RetryYN/HELIX-HARNESS-OS.git --json",
      "      - name: HELIX consumer doctor",
      "        run: npm run helix -- doctor --profile consumer --json",
      "      - name: HELIX rename plan",
      "        run: npm run helix -- rename plan --json",
      "      - name: HELIX team run dry-run",
      "        run: npm run helix -- team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
      "      - run: npm run typecheck",
      "      - run: npm test",
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
      "      - uses: actions/setup-node@v4",
      "      - run: npm ci",
      "      - name: HELIX status",
      "        run: npm run helix -- status --json",
      "      - name: HELIX completion decision packet",
      "        run: npm run helix -- completion decision-packet --json",
      "      - name: HELIX completion review bundle",
      "        run: npm run helix -- completion review-bundle --json",
      "      - name: HELIX consumer doctor",
      "        run: npm run helix -- doctor --profile consumer --json",
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
          "package-lock.json": null,
        }),
      }),
    );

    expect(result.ok).toBe(false);
    expect(
      hasDoctorMessageWith(
        result.messages,
        "consumer-package-preflight - violation",
        "consumer_readiness:node-lockfile",
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
            command: "npm run helix -- status",
            problemMatcher: [],
          },
          {
            label: "HELIX: doctor",
            type: "shell",
            command: "npm run helix -- doctor",
            problemMatcher: [],
          },
          {
            label: "HELIX: setup dry-run",
            type: "shell",
            command: "npm run helix -- setup project --dry-run",
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
            command: "npm run helix -- status",
            problemMatcher: [],
            runOptions: { runOn: "folderOpen" },
          },
          {
            label: "HELIX: doctor",
            type: "shell",
            command: "npm run helix -- doctor --profile consumer",
            problemMatcher: ["$tsc"],
          },
          {
            label: "HELIX: setup dry-run",
            type: "process",
            command: "npm run helix -- setup project --dry-run",
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
        "      - uses: actions/setup-node@v4",
        "      - run: npm ci",
        "      - run: npm run helix -- --version",
        "      - run: npm run helix -- status --json",
        "      - run: npm test",
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
        "missingRuns=npm run helix -- setup project --dry-run --json",
      ),
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
        "      - uses: actions/setup-node@v4",
        "      - run: npm ci",
        "      - run: npm run helix -- --version",
        "      - run: npm run helix -- setup project --dry-run --json",
        "      - run: npm run helix -- status --json",
        "      - run: npm run helix -- completion decision-packet --json",
        "      - run: npm run helix -- doctor --profile consumer --json",
        "      - run: npm run helix -- rename plan --json",
        "      - run: npm run helix -- team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: npm run typecheck",
        "      - run: npm test",
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
        "      - uses: actions/setup-node@v4",
        "        with:",
        "          token: $" + "{{ github.token }}",
        "      - run: npm ci",
        "      - run: npm run helix -- --version",
        "      - run: npm run helix -- setup project --dry-run --json",
        "      - run: npm run helix -- status --json",
        "      - run: npm run helix -- completion decision-packet --json",
        "      - run: npm run helix -- doctor --profile consumer --json",
        "      - run: npm run helix -- rename plan --json",
        "        env:",
        "          HELIX_CI_MODE: read-only",
        "      - run: npm run helix -- status --json",
        "      - run: npm run helix -- team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: npm run typecheck",
        "      - run: npm test",
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
        "setupNodeInputsEmpty=false",
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
        "      - uses: actions/setup-node@v4",
        "      - run: npm ci",
        "      - run: npm run helix -- --version",
        "      - run: npm run helix -- setup project --dry-run --json",
        "      - run: npm run helix -- status --json",
        "      - run: npm run helix -- completion decision-packet --json",
        "      - run: npm run helix -- doctor --profile consumer --json",
        "      - run: npm run helix -- rename plan --json",
        "        if: $" + "{{ false }}",
        "        continue-on-error: true",
        "      - run: npm run helix -- status --json",
        "      - run: npm run helix -- team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: npm run typecheck",
        "      - run: npm test",
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
        "      - uses: actions/setup-node@v4",
        "      - run: npm ci",
        "      - run: npm run helix -- --version",
        "      - run: npm run helix -- setup project --dry-run --json",
        "      - run: npm run helix -- status --json",
        "      - run: npm run helix -- completion decision-packet --json",
        "      - run: npm run helix -- doctor --profile consumer --json",
        "      - run: npm run helix -- rename plan --json",
        "        continue-on-error: false",
        "        shell: bash",
        "        timeout-minutes: 1",
        "        working-directory: .",
        "      - run: npm run helix -- status --json",
        "      - run: npm run helix -- team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: npm run typecheck",
        "      - run: npm test",
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
        "      - uses: actions/setup-node@v4",
        "      - uses: third-party/unpinned-action@v1",
        "      - run: npm ci",
        "      - run: npm run helix -- --version",
        "      - run: npm run helix -- setup project --dry-run --json",
        "      - run: npm run helix -- status --json",
        "      - run: npm run helix -- completion decision-packet --json",
        "      - run: npm run helix -- doctor --profile consumer --json",
        "      - run: npm run helix -- rename plan --json",
        "        env:",
        "          TOKEN: $" + "{{ secrets [ 'API_TOKEN' ] }}",
        "      - run: npm run helix -- status --json",
        "      - run: npm run helix -- team run --definition .helix/teams/default-hybrid.yaml --mode hybrid --json",
        "      - run: npm run typecheck",
        "      - run: npm test",
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
      (files.get(tasksPath) ?? "").replace("npm run helix -- status", `${legacyCliName} status`),
    );
    files.set(
      workflowPath,
      (files.get(workflowPath) ?? "").replace(
        "npm run helix -- status --json",
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
        "npm run helix -- rename plan --json",
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
      "legacy_alias=.github/workflows/harness-check.yml,.claude/settings.json",
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
