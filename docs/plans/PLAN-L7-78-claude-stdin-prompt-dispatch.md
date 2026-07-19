---
plan_id: PLAN-L7-78-claude-stdin-prompt-dispatch
title: "PLAN-L7-78 (troubleshoot): claude dispatch delivers prompts via stdin so native tool markup cannot leak through argv"
kind: troubleshoot
layer: L7
drive: agent
status: confirmed
created: 2026-06-19
updated: 2026-06-19
backprop_decision: not_required
backprop_decision_reason: "Internal harness self-application tooling (lint gate / runtime dispatch / guard / governance mechanism); hardens the harness's own enforcement and does not change the product's external requirement / design / test-design contract, so there is no upstream backprop target."
owner: Codex TL
parent_design: docs/design/harness/L6-function-design/function-spec.md
review_evidence:
  - reviewer: codex-gpt-5
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-19"
    tests_green_at: "2026-06-19"
    verdict: pass
    scope: "Claude provider dispatch no longer sends task text through `-p <task>`. `buildAdapterPlan` emits fixed Claude argv (`--print --input-format text` plus model/effort flags) and carries the prompt in `AdapterPlan.stdin`, matching the existing Codex stdin transport. Regression coverage proves native ClaudeCode tool markup such as `<invoke name=\"Bash\">...` and multi-line prompt text do not appear in argv or the provider invocation string; fake `helix claude --execute` receives the prompt on stdin while preserving session lifecycle evidence. Follow-up recurrence analysis found an interactive Claude VSCode transcript emitting XML-like pseudo tool calls as assistant text, so repository Claude policy now explicitly forbids `court` / `<invoke>` pseudo tool text and hook status messages are ASCII to avoid adding corrupted context."
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5
  - reviewer: codex-tl-current-location-recovery
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T18:47:48+09:00"
    tests_green_at: "2026-07-09T18:47:48+09:00"
    verdict: pass
    scope: "current-location recovery collect_evidence: Claude prompt stdin dispatch と native tool markup の argv 非混入 contract が現HEADの fast suite で壊れていないことを再検証する。"
    worker_model: codex
    reviewer_model: codex
    green_commands:
      - kind: unit_test
        command: "npm test:fast"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T18:47:48+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:0a56427fb56ec573beb58350c31ad8ef5b217ae5377bd190e4c3d670b5279403"
agent_slots:
  - role: tl
    slot_label: "TL - claude stdin prompt dispatch reliability fix"
generates:
  - artifact_path: docs/plans/PLAN-L7-78-claude-stdin-prompt-dispatch.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
  - artifact_path: tests/runtime-hook-entrypoints.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: .claude/CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: .claude/settings.json
    artifact_type: source_module
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/plans/PLAN-L7-77-codex-stdin-prompt-dispatch.md
    - docs/governance/helix-harness-requirements_v1.2.md
    - docs/adr/ADR-001-helix-harness-redesign-and-language.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
---

# PLAN-L7-78 (troubleshoot): Claude プロンプトの stdin 配送

## 0. 目的

Claude provider dispatch は、まだタスク本文を `claude --print -p <task>` の
argv として渡していた。このため、複数行テキスト、shell metacharacter、
`<invoke name="Bash">` のような ClaudeCode native tool markup が、不活性な
prompt content として扱われず、command-line 構造として解釈されたり可視テキスト
として漏れたりする 2 本目の transport path が残っていた。

PLAN-L7-77 は、Windows `.cmd` wrapping が prompt を切り詰め得るため、Codex
側の同種問題を修正した。本 PLAN は Claude prompt でも stdin を使い、provider
boundary を完了させる。

## 1. 範囲

対象範囲:

- `buildAdapterPlan` は Claude argv を固定 flag のみにする:
  `--print --input-format text` に加え、必要に応じて `--model` / `--effort` を付ける。
- Claude prompt text は `AdapterPlan.stdin` で運び、`args` には入れない。
- `helix claude --execute` は既存 adapter wrapper 経由で stdin を渡し、
  `SessionStart` / `PostToolUse` / `Stop` evidence の記録を継続する。
- Regression test は、複数行の native tool markup と fake Claude execution path
  を対象にする。
- Repository Claude runtime policy は、XML-like な pseudo tool call
  (`court`, `<invoke>`, `<parameter>`) を assistant text として書くことを明示的に
  禁止する。破損した transcript residue は継続しない。
- `.claude/settings.json` の status message は ASCII とし、hook summary が将来の
  Claude context に mojibake を追加しないようにする。

対象外:

- Claude Code の native interactive UI protocol 変更。
- legacy raw Claude または HELIX wrapper path の再有効化。

## 2. 受入条件

- Claude 用の `buildAdapterPlan` は `--print --input-format text` を含み、`-p`
  を含まず、タスク本文を `plan.stdin` に保存する。
- `<invoke name="Bash">...` と改行を含む prompt は、Claude argv や provider
  invocation string に出現しない。
- `helix claude --execute` の fake-provider smoke は task text を stdin で受け取り、
  期待される session lifecycle digest を引き続き書き出す。
- Targeted adapter test、typecheck、lint、doctor が pass する。
- Claude runtime policy は明示的な native-tool-only rule を含み、interactive
  Claude Code session が pseudo tool markup を valid output style として扱わない。

## 3. テスト設計との対応

Unit test design の entry: `docs/test-design/harness/L7-unit-test-design.md`
(U-ADAPTER-008)。Red->Green: 修正前は Claude prompt text が `-p <task>` に埋め込まれる。
修正後は stdin 経由で配送され、argv には存在しない。

## 4. 状態

Confirmed。2026-06-19 に実装・検証済み。再発 follow-up では、transcript evidence
により failure が HELIX adapter 由来の argv leakage ではなく Claude VSCode が生成した
assistant text だと分かったため、interactive Claude Code native-tool policy guard を追加した。
