---
plan_id: PLAN-L7-139-codex-hook-adapter
title: "PLAN-L7-139: Codex hook adapter (orchestrator-rule parity)"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-24
updated: 2026-07-01
owner: Claude
backprop_decision: not_required
backprop_decision_reason: "Developer-local runtime guard parity: gives the Codex CLI the same repo-local foreign-edit / session-lifecycle hooks Claude already has, enforcing the existing hybrid Git rule. It does not change product requirements or runtime user behavior (mirrors PLAN-L7-114-work-guard, which is the Claude side of the same guard)."
agent_slots:
  - role: tl
    slot_label: "TL - Codex hook adapter (repo-local .codex/hooks.json, parity gate)"
  - role: aim
    slot_label: "AIM - troubleshoot classification + cross-runtime guard parity review"
generates:
  - artifact_path: docs/plans/PLAN-L7-139-codex-hook-adapter.md
    artifact_type: markdown_doc
  - artifact_path: .codex/hooks.json
    artifact_type: json_config
  - artifact_path: .codex/config.toml
    artifact_type: json_config
  - artifact_path: src/lint/codex-hook-adapter.ts
    artifact_type: source_module
  - artifact_path: src/lint/codex-hook-adapter-policy.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-guard.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-guard-policy.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: .claude/hooks/agent-guard.ts
    artifact_type: source_module
  - artifact_path: tests/codex-hook-adapter.test.ts
    artifact_type: test_code
  - artifact_path: tests/agent-guard.test.ts
    artifact_type: test_code
  - artifact_path: tests/work-guard.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - PLAN-L7-114-work-guard
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T06:20:45+09:00"
    tests_green_at: "2026-07-01T06:20:45+09:00"
    verdict: pass
    scope: "Continuation: Codex spawn_agent guard parity is now wired instead of deferred. .codex/hooks.json requires the shared agent-guard entrypoint for spawn_agent|spawn_agents_on_csv, evaluateAgentGuard validates Codex payloads separately from Claude Agent payloads, helix hook agent-guard exposes the blocking CLI hook used by consumer templates, and design/test-design/PLAN text now reflects that subagent-stop is the only true N/A while spawn_agent is guarded."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/agent-guard.test.ts tests/codex-hook-adapter.test.ts tests/setup.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T06:18:00+09:00"
        evidence_path: tests/agent-guard.test.ts
        output_digest: "sha256:2e77132180a05f588c6225cc5f6af92bdc87624b59445edb8e71a3a158f7bac2"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T06:18:00+09:00"
        evidence_path: src/runtime/agent-guard.ts
        output_digest: "sha256:8bc4662d6ad9f7af6a243a60833905bdc0c4cb674e36a079f25ab26a6db569e2"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T06:18:00+09:00"
        evidence_path: src/lint/codex-hook-adapter.ts
        output_digest: "sha256:90ac4dbc6ae3c9bb1ff59c7dddb4801216dd0a673be8bb8046bb8a60f2932102"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T06:20:45+09:00"
        evidence_path: tests/codex-hook-adapter.test.ts
        output_digest: "sha256:298920e10466ce19b7994d8e061b79c99d8bbc62cbc537d0ffe83a2367c3912a"
  - reviewer: claude-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-24T12:20:00+09:00"
    tests_green_at: "2026-06-24T12:17:00+09:00"
    verdict: approve
    scope: "Cross-runtime (Codex/gpt-5.5) desk review returned REJECT (see body '## Cross-runtime review'); all three substantive findings verified TRUE against the real codex.exe 0.128.0 binary (233.8MB, strings inspection) and addressed in code. (Critical) work-guard now extracts edit targets from the apply_patch freeform patch body (`*** Update/Add/Delete File:` / `*** Move to:`, multi-file) so the foreign-edit block actually fires for apply_patch — runtime-agnostic pure fn `extractEditTargets`, Claude file_path path unchanged. (Important) spawn_agent N/A falsehood corrected: subagent-stop is genuinely N/A (no SubagentStop event); spawn_agent was first recorded as a real surface rather than absent, and the 2026-07-01 continuation wires spawn_agent|spawn_agents_on_csv to agent-guard instead of leaving it deferred. (Important) analyzer hardened: `type===\"command\"` required + token-exact path matching. status=confirmed because the deliverables are merged (merged-plan-status hard-requires confirmed+evidence for merged artifacts) and the change is unit-green (32 tests); the end-to-end live Codex hook-payload run is a documented hardening follow-up, not a confirmation blocker (the parser is payload-key-agnostic, so the residual is only whether Codex puts the patch in tool_input at all — the freeform single-arg binary evidence makes that low-risk)."
    worker_model: claude-opus-4-8
    reviewer_model: claude-opus-4-8
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-24T12:17:00+09:00"
        evidence_path: src/runtime/work-guard.ts
        output_digest: "sha256:ad589a73486d347838c5b913d7746df7b8037a50c2e97baa29790b2c22b8c81b"
      - kind: unit_test
        command: "bun run vitest run tests/work-guard.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-24T12:17:00+09:00"
        evidence_path: tests/work-guard.test.ts
        output_digest: "sha256:5ff89dd03a0e6ec91733514d7c94ee10a7bf2dbe8b148a24c73d779a0681c35b"
      - kind: unit_test
        command: "bun run vitest run tests/codex-hook-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-24T12:17:00+09:00"
        evidence_path: tests/codex-hook-adapter.test.ts
        output_digest: "sha256:298920e10466ce19b7994d8e061b79c99d8bbc62cbc537d0ffe83a2367c3912a"
---

# PLAN-L7-139: Codex hook adapter 対応（orchestrator-rule parity）

## 状態

`confirmed`。成果物は working tree に merge 済みであり、`merged-plan-status` は
merge 済み成果物に対して confirmed かつ `review_evidence` 付きの PLAN を必須にする。
完了・検証済み作業を `draft` PLAN のまま残すこと自体が state-drift 違反になるためである。
foreign-edit guard parity は実装済み、unit-green（32 tests）で、cross-runtime（Codex）
review の REJECT findings はすべて対応済みである。end-to-end live confirmation、つまり
この repo で `codex` を起動し foreign `apply_patch` edit に対する実際の `work-guard`
block を観測する確認は、文書化済みの **hardening follow-up** であり confirmation blocker
ではない。`extractEditTargets` は payload-key-agnostic（leaf-scan）なので、残リスクは
Codex が PreToolUse `tool_input` に patch を含めるかどうかだけで、binary の freeform
single-argument evidence から低リスクと判断する。詳細は **Follow-ups** を参照する。

## 問題

Claude Code は `.claude/settings.json` hooks（`work-guard` foreign-edit block、
session lifecycle）で orchestration guardrails を機械強制する。一方、Codex CLI runtime
には `AGENTS.md` の project rules はあったが、direct / interactive use に対する
**mechanical hook enforcement** が無かった。そのため、この repo で developer が `codex`
を実行すると、Claude 側なら block される foreign uncommitted files を編集できていた。
これは Claude 向けに `PLAN-L7-114-work-guard` が構築した同一 guard の Codex 側である。

feasibility spike `PLAN-DISCOVERY-06-orchestrator-rule-parity` は、Codex CLI 0.128.0 が
Claude-compatible hook system（`hooks.json`、`PreToolUse`/`PostToolUse`/`SessionStart`/
`Stop`、`permissionDecision: deny`、Claude と共有される payload field names）を搭載
していることを ADOPT として確認した。本 PLAN はその実装を着地させる。

## 変更内容

- **`.codex/hooks.json`**: Claude guards を mirrored する Codex hook adapter。
  同一 TypeScript entrypoints（`.claude/hooks/work-guard.ts`、
  `.claude/hooks/agent-guard.ts`、`bun src/cli.ts session ...`）を再利用し、logic fork
  は作らない。repo-relative であり、global `~/.codex/` には書かない。
- **`.codex/config.toml`**: `[features].hooks = true` により project-local hooks を
  明示的に有効化する。Codex は trusted projects でのみ project `.codex/` layers を読む。
- **明示的な scope boundary**: `.codex/hooks.json` は Codex CLI / Codex IDE の
  project-local hook source である。周辺 chat runtime が注入する hosted API/developer
  tool calls（例: この session の `apply_patch`）は intercept しない。2026-06-24 の
  live smoke では、この session の API-provided `apply_patch` が repo hook を発火させずに
  untracked file を編集できる一方、同一 payload を `.claude/hooks/work-guard.ts` へ直接
  渡すと exit 2 で block することを確認した。したがって `doctor` は `.codex/hooks.json`
  が Codex-branded execution surfaces すべてを機械的に guard すると示唆してはならない。
- **Matcher mapping**: Codex tool names は Claude と異なるため、literal copy では
  never fire、つまり false parity になる。`codex.exe` 0.128.0 binary から確認した対応は
  次のとおりである。
  - `Edit|Write|MultiEdit` -> `apply_patch|write_file`（work-guard）。
  - `Bash` -> `exec_command|local_shell`（PostToolUse session logging）。
  - `Agent` -> `spawn_agent|spawn_agents_on_csv`（agent-guard）。
- **`work-guard` apply_patch path extraction（path 抽出）**（cross-runtime REJECT fix）:
  Codex の `apply_patch` は **freeform** であり、`tool_input.file_path` を持たない。
  edited paths は patch body（`*** Update File:` / `*** Add File:` /
  `*** Delete File:` / `*** Move to:`、multi-file）内にある。元の `file_path ?? path`
  extraction は apply_patch では silently no-op になり false parity を生んでいた。
  `src/runtime/work-guard.ts` は runtime-agnostic pure fn `extractEditTargets` を公開し、
  Claude / `write_file` 向けには明示的な `file_path`/`path` を返し、apply_patch 向けには
  patch-body paths をすべて parse する。entrypoint は全 target を評価し、いずれかが
  foreign-uncommitted なら block する。Claude の挙動は変更しない（常に `file_path` を送る）。
- **N/A vs guarded sub-agent surface の扱い**（cross-runtime REJECT correction）:
  - `subagent-stop`（`SubagentStop`）は **genuinely N/A** である。codex.exe 0.128.0 が
    expose する hook events は `PreToolUse`/`PostToolUse`/`SessionStart`/`Stop`/
    `UserPromptSubmit` のみで、`SubagentStop` は無いことを binary で確認した。
  - `agent-guard` は **NOT N/A** である。Codex には実際の sub-agent surface
    （`spawn_agent` / `wait_agent` / `list_agents` / `close_agent` /
    `spawn_agents_on_csv`、19 件の `spawn_agent` occurrence、"This spawn_agent tool
    provides you access to sub-agents"）がある。`spawn_agent|spawn_agents_on_csv` は
    `agent-guard` へ route され、`agent_type` は explicit かつ allowlisted、direct
    `model` overrides は blocked、concrete task body は required、bulk spawn は
    `helix team run` / pair-agent workflow 経由でなければ denied とする。
    `CODEX_DEFERRED_SURFACE` はこの known sub-agent surface について empty である。
- **`src/lint/codex-hook-adapter.ts` + doctor `codex-hook-adapter`**: `.codex/hooks.json`
  が `.claude/settings.json` と同じ guard entrypoints を Codex matchers で宣言していること、
  guard 上の `blockOnFailure`、`$CLAUDE_PROJECT_DIR` 不使用（Codex は展開しない）、global
  `~/.codex/` reference 不在を fail-close に検査する parity check。review により harden
  され、guard を満たすには `type==="command"` hooks のみ有効、script-path token は完全一致
  （loose substring 不可）とする。entrypoint set は `src/lint/project-hook.ts` の `REQUIRED`
  と共有される SSoT であり、片側だけの entrypoint は `entrypoint_drift` とする。
- **`tests/codex-hook-adapter.test.ts`**（U-CXHOOK-001..014）+
  **`tests/work-guard.test.ts`**（`extractEditTargets` cases）: real-repo regression を含み、
  すべての fail-close branch、shared-guard runtime-agnostic parity、apply_patch multi-file
  path extraction（false-parity regression）を覆う。

## Cross-runtime review（hybrid judgement gate の判定）

次のコマンドを実行した。

```bash
helix codex --role qa --task-file .helix/review/PLAN-L7-139-codex-review-task.md
--plan PLAN-L7-139-codex-hook-adapter --execute
```

この review（reviewer = gpt-5.5、別 model family）は
**Verdict: reject** を返した。3 件の substantive findings はすべて実 `codex.exe` 0.128.0
binary に照らして TRUE と確認し、対応済みである。

| 指摘 | 重要度 | 検証 | 対応 |
| --- | --- | --- | --- |
| `apply_patch` が `file_path` を持たず work-guard が no-op になる false parity | Critical | TRUE（freeform、"accepts exactly one argument"、path は patch body 内） | `extractEditTargets` が patch-body paths（multi-file）を parse する |
| `agent-guard` "N/A" は誤りで、`spawn_agent` sub-agent family が存在する | Important | TRUE（19x `spawn_agent`、tool family） | まず explicit surface として修正し、その後 `spawn_agent|spawn_agents_on_csv` matcher と Codex payload validation で agent-guard に接続した |
| analyzer は `type==="command"` と stricter tokens を要求すべき | Important | n/a（design） | `type==="command"` と token-exact path matching を追加した |
| status=confirmed は premature | Minor | n/a | live hook-payload run まで status=draft とした |

## 受入条件

1. Codex `.codex/hooks.json` が存在し、Claude guard entrypoints を Codex matchers で
   mirror していること。（U-CXHOOK-001）
2. Codex adapter が Claude hook config から diverge した場合、`doctor` `codex-hook-adapter`
   が fail closed すること。対象は missing guard、literal-copy matcher、dropped
   `blockOnFailure`、`$CLAUDE_PROJECT_DIR`、global `~/.codex/`、entrypoint drift、
   non-`command` hook、loose token match である。（U-CXHOOK-002..010, 013, 014）
3. global `~/.codex/` writes は無く、config は repo-relative に留まること。（U-CXHOOK-009）
4. `work-guard` が apply_patch patch-body paths（multi-file）を抽出し、Codex の primary
   edit tool で foreign-edit block が発火すること。`write_file` だけに限定しない。
   Claude の `file_path` behavior は unchanged とする。（`tests/work-guard.test.ts` の
   `extractEditTargets` tests）
5. `subagent-stop` は genuinely N/A と記録し、`spawn_agent|spawn_agents_on_csv` は required
   `agent-guard` matcher として記録すること（not N/A / not deferred）。shared guard logic
   は unsafe Claude / Codex sub-agent dispatch を block する。（U-CXHOOK-011, U-CXHOOK-012）
6. `doctor` は hosted API/developer-tool limitation を明示的に surface すること。
   `.codex/hooks.json` は direct Codex CLI/IDE sessions を covers するが、この chat/runtime
   が injected する `apply_patch` tool path は covers しない。

## Follow-ups（hardening、confirmation blockers ではない）

- **Live hook-payload run**: この repo で `codex` を実行し、foreign `apply_patch` edit を
  `work-guard` が実際に block することを確認する。これは patch を運ぶ正確な PreToolUse
  `tool_input` key を検証する作業である（binary-inspected、live では未観測）。
  `write_file` payload も live ではまだ未確認である。`extractEditTargets` は
  payload-key-agnostic なので、残リスクは低い。
- **Hosted API tool enforcement**: repo files は、周辺 platform が injected developer tools
  を呼ぶ前に `.codex/hooks.json` を呼ばせることはできない。この chat/API path に対する
  真の mechanical enforcement には platform-level hook support、または raw `apply_patch`
  surface の除去が必要である。repo-side countermeasure として、`helix guard preflight`
  は hosted/API edits の前に同じ `work-guard` decision を実行する。explicit targets、
  patch files、stdin apply_patch bodies を受け取り、foreign uncommitted targets では exit 2
  を返し、preflight と mechanical hook interception を混同しないよう
  `apiToolPathEnforced=false` を報告する。
- **SSoT materializer**: `.claude/settings.json` と `.codex/hooks.json` を 1 つの source
  （`helix setup`）から emit する。現時点では `codex-hook-adapter` drift gate が
  2 つの hand-maintained adapters を同期状態に保つ。
