---
plan_id: PLAN-L6-20-runtime-adapter-session-lifecycle
title: "PLAN-L6-20 (add-design): runtime adapter session lifecycle and shared hook entrypoints"
kind: add-design
layer: L6
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-09
owner: Codex TL / PO
review_evidence:
  - reviewer: claude-pmo-sonnet
    review_kind: cross_agent
    reviewed_at: "2026-06-09T10:57:49+09:00"
    tests_green_at: "2026-06-09T10:55:36+09:00"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude-pmo-sonnet
    scope: "PLAN-L6-20/L7-21/REVERSE-20 runtime adapter lifecycle; Critical/High/Important 0 after follow-up review."
agent_slots:
  - role: tl
    slot_label: "TL - shared CLI hook and adapter wrapper design"
generates:
  - artifact_path: docs/design/harness/L6-function-design/session-log.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
dependencies:
  parent: docs/plans/PLAN-L6-03-session-log.md
  requires:
    - docs/plans/PLAN-L6-03-session-log.md
---

# PLAN-L6-20 (add-design): ランタイムアダプターのセッションライフサイクルと共有 hook 入口 (runtime adapter session lifecycle and shared hook entrypoints)

## §0 位置づけ

`PLAN-L6-03-session-log` の追補 add-design。session-log の hook 実体を `.claude/hooks/session-log.ts` 直接実装からパッケージ内 (package-local) の `src/cli.ts` 入口 (entrypoint) に寄せ、`helix codex|claude --execute` も同じセッションライフサイクル (session lifecycle) を記録する。

今回の変更は既存 session-log / handover / forced-stop の設計を置換しない。hook とランタイムアダプター (runtime adapter) の入口を共有化し、探索コスト (search cost) と乖離 (drift) を下げるための小さな L6 増分である。

## §1 設計差分

- `.claude/settings.json` は SessionStart / PostToolUse / Stop で `src/cli.ts` の `session start` / `hook post-tool-use` / `session summary` を呼ぶ。
- `.claude/hooks/session-log.ts` は後方互換 shim とし、正本 (canonical) 実装は `src/cli.ts` に集約する。
- `SessionHookInput.plan_id` を許容し、アダプターラッパー (adapter wrapper) が明示 PLAN を digest に渡せるようにする。
- `helix codex|claude --execute` は provider 起動前後に SessionStart / PostToolUse / Stop を記録し、handover 警告 (warnings) を表面化 (surface) する。
- `--task-file` を追加し、Windows ARG_MAX 回避を provider 非依存のアダプター契約 (adapter contract) にする。
- `--plan` は harness metadata として保持し、provider CLI には `--plan-id` を渡さない。初期実装は Codex=`codex exec <task>`、Claude=`claude --print -p <task>` だったが、PLAN-L7-77 / PLAN-L7-78 で prompt 本文は両 provider とも stdin へ移した。
- PLAN-L7-68 により置換済み (Superseded by PLAN-L7-68): provider execution no longer emits legacy raw-wrapper env names. Native provider resolution and `HELIX_CODEX_BIN` / `HELIX_CLAUDE_BIN` are the supported execution path.

## §3.1 実装計画（情報源明記）

情報源:

- `docs/design/harness/L6-function-design/session-log.md`
- `docs/design/harness/L4-basic-design/function.md`
- `docs/test-design/harness/L7-unit-test-design.md`
- `src/runtime/session-log.ts`
- `src/runtime/adapter.ts`

実装先:

- `src/cli.ts`
- `src/runtime/session-log.ts`
- `src/runtime/adapter.ts`
- `.claude/settings.json`
- `.claude/hooks/session-log.ts`
- `tests/runtime-hook-entrypoints.test.ts`
- `tests/runtime-adapter.test.ts`

## §3 工程表

### Step 1: [並列] L6 設計トレース更新 (design trace)

`session-log.md` と `function.md` に共有 CLI hook (shared CLI hook) / アダプターラッパー (adapter wrapper) / provider args の設計差分を反映する。

### Step 2: [並列] L7 テスト設計更新 (test design)

`L7-unit-test-design.md` に U-SLOG-007 と U-ADAPTER oracle を追加し、設計とテスト設計の孤児を作らない。

### Step 3: [直列] 共有 CLI hook 入口の実装 (shared CLI hook entrypoints)

直列理由: downstream_dependency。アダプターラッパー (adapter wrapper) は shared CLI の `readHookInput` / lifecycle dispatch を前提にする。

### Step 4: [直列] ランタイムアダプターラッパー実装 (runtime adapter wrapper)

直列理由: downstream_dependency。Step 3 の lifecycle dispatch を使って provider 実行前後の session evidence を記録する。

### Step 5: [並列] tests / docs adapters 更新

runtime hook entrypoint tests、runtime adapter tests、agent guard / rule drift tests を更新する。

### Step 6: [直列] レビュー (review)

直列理由: downstream_dependency。typecheck / vitest / doctor が成功 (green) になった後、self review と cross-agent review で freeze 可能性を確認する。

## §6 用語更新

- 共有 hook 入口 (shared hook entrypoint): Claude hook から package-local `src/cli.ts` を呼び、session-log core を共有する入口。
- アダプターライフサイクルラッパー (adapter lifecycle wrapper): `helix codex|claude --execute` が provider 実行を SessionStart / PostToolUse / Stop で包む機構。
- PLAN メタデータ分離 (plan metadata separation): `--plan` を provider 引数ではなく harness/session-log の plan_id として使う規約。

## §8 DoD

- [x] L6 design と L7 unit test design に U-SLOG-007 / U-ADAPTER 変更が反映されている。
- [x] shared CLI hook entrypoints が temp repo で PLAN digest を生成し、explicit `--plan` では `session_start` / `tool_use` / `session_end` を同一 plan_id に集計する。
- [x] Codex / Claude アダプターラッパー (adapter wrapper) が lifecycle を記録する。PLAN-L7-68 が以前の raw-guard-env 挙動を置換し、provider execution から legacy wrapper env names を除去する。
- [x] provider CLI に `--plan-id` を渡さない。
- [x] typecheck / full vitest / doctor / review が成功 (green)。
