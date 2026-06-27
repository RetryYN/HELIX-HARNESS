---
plan_id: PLAN-L4-50-orchestration-memory-hybrid
title: "PLAN-L4-50: P2 hybrid orchestration + P7 共有メモリ 機能追加 (Claude+Codex 前提)"
kind: design
layer: L4
drive: agent
status: draft
created: 2026-06-28
updated: 2026-06-28
owner: PO (人間 / RetryYN)
master_hub: true   # G.3 単一 sub_doc 例外: P2 orchestration + P7 memory の複数モジュールを coordinate する機能追加 hub
agent_slots:
  - role: po
    slot_label: "PO — P2/P7 機能追加の受入判断"
generates:
  - artifact_path: docs/plans/PLAN-L4-50-orchestration-memory-hybrid.md
    artifact_type: markdown_doc
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
dependencies:
  parent: PLAN-L0-01-helix-charter
  requires:
    - PLAN-L0-01-helix-charter
  blocks: []
  references:
    - docs/plans/PLAN-L1-06-helix-solo-conversion.md
    - docs/plans/PLAN-L7-44-harness-db-master.md
    - src/team/run.ts
    - src/runtime/agent-guard.ts
    - src/state-db/projection-writer.ts
---

# PLAN-L4-50: P2 hybrid orchestration + P7 共有メモリ 機能追加

## §0 役割 / 前提

HELIX を **Claude Code ↔ Codex 連携前提のマルチエージェント・オーケストレーション**に寄せる機能追加（PO 指示）。UT ハーネスの standalone 単体ベースは縮退モード扱いとし、**hybrid Claude+Codex を foundation** に据える。当面の駆動目的＝**作業を Codex へ分散し main(Claude) budget を節約**。L1 trace（BR-07 loop-eng / BR-12 2層メモリ / NFR-03 hybrid 前提）は solo 変換 PLAN-L1-06 で確定（carry）。

**原則**: 仕組み=harness 上 / 個別機能=旧 HELIX 上、ただし機能は仕組みを超えない。ADR-001=TS/Bun 再実装（旧 HELIX Python は概念のみ・コピー禁止）。P8=外部バイナリ/subprocess/shell/http 委譲は不採用。

## §1 設計サマリ（分散 subagent 検証済 / file-grounded）

### P2 hybrid orchestration（新規 `src/orchestration/`）
- `loop-runner.ts` — loop coordinator state machine。`tick()` が stop 判定→worker/verifier dispatch→loop_iterations 記録。
- `loop-state.ts` — LoopState 型 + `.ut-tdd/state/loop/{planId}.json` I/O。
- `loop-stop-rules.ts` — stop schema（旧 HELIX AgentLoop 拡張）: `verdict|count|file_exists|cost_budget|no_progress|custom` + `on_failure: escalate|retry|abort`。
- `cross-verifier.ts` — **verifier は常に相手ランタイム**（hybrid 前提の核心）。standalone は fallback だが `blockedReason="intra_runtime_fallback"` 記録必須。
- `loop-recovery.ts` — 旧 RecoveryEngine C1-C4（diff規模/doctor/handover stale/budget両超過）TS 再実装。
- `job-queue.ts` — 旧 job_queue の Bun-native 移植。`bun:sqlite` WAL + `BEGIN IMMEDIATE` で Claude+Codex 競合 claim 排他。

### 旧 HELIX 採用（検証済 / 核心3点）
1. **resume 3条件 AND**（auto_run_engine）: `status==running && within_time_window && should_schedule`（carry= `last_verdict!=pass && iter<max`）→ `loop-runner.canResume()`。
2. **claim_next_job BEGIN IMMEDIATE**（job_queue）: 多ランタイム競合 claim の DB 排他 → `job-queue.ts`。
3. **BLOCKED_SELF_DELEGATION**（agent_policy_guard `{opus,orchestrator,pm,po}`）: **verifier=worker 同 provider を fail-close** → `agent-guard.ts` + `validateTeamRun`。
- 却下: heartbeat-scheduler 外部バイナリ / shell・http task dispatcher / Gini 統計 / ccusage CLI（P8・ADR-001、token-tracker 既存で代替）。

### P7 共有メモリ（新規 `src/memory/`）
- 保存先 = harness.db 2テーブル `harness_memory_entries` / `project_memory_entries` ＋ `.ut-tdd/memory/*.jsonl`（git 共有・**Claude も Codex も読める**）。
- `.claude/agent-memory/` silo は廃止（per-agent・Codex 非共有・asset-drift 衝突）→ 既出の "helix" asset-drift 問題も解消。
- `ut-tdd memory write/list/show/supersede` CLI。SessionStart で harness 層 surface。
- 既存 `upsertRow/migrate/SECRET_PATTERN/recordProjectionEvent/stableId` 再利用。feedback_events/improvement_log とは責務分離（重複させない）。

### DB 追加（`harness-db-tables-core.ts` + SCHEMA_VERSION bump）
`loop_iterations`（plan_id/iteration/worker_provider/verifier_provider/verdict/cost_usd/stop_reason）／`jobs`（priority/status/retry_count/...）／`harness_memory_entries`／`project_memory_entries`。

## §工程表

### Step 1: [直列] DB スキーマ + 型確定（pair-freeze 対象）
> 直列理由: downstream_dependency — テーブル/型が後続実装の前提。
loop_iterations/jobs/memory 2表 + LoopState/MemoryEntry 型 + stop/memory zod schema。
- 進捗: ⬜

### Step 2: [並列] P2 実装 / P7 実装（Codex へ分散）
> 並列モード: P2(`src/orchestration/`) と P7(`src/memory/`) は独立モジュールで衝突しない。
P2 6ファイル + P7 3ファイル + CLI 改修 + agent-guard/team run 改修。**実装は `ut-tdd codex` 委譲、私は cross-runtime review**。
- 進捗: ⬜

### Step 3: [直列] テスト + doctor チェック追加
> 直列理由: downstream_dependency — 実装後に検証を追加。
tests/orchestration/{loop-runner,cross-verifier,job-queue,loop-recovery}.test.ts、tests/memory-*.test.ts。doctor: `verifier-provider-mismatch`/`loop-state-stale`/`jobs-stuck`/`agent-memory-silo`。
- 進捗: ⬜

### Step 4: [直列] review (cross-runtime) + accept
> 直列理由: downstream_dependency — 定量 green 後に定性レビュー（tests_green_at ≤ reviewed_at）。
typecheck/vitest/doctor green → cross-agent (Codex 実装 ↔ Claude review) または intra_runtime_subagent 記録 → 受入。
- 進捗: ⬜

## §3.1 実装計画

| Step | 対象 | 方法 |
|------|------|------|
| 1 | harness-db / 型 / schema | catalog append + SCHEMA_VERSION bump、zod schema、pair-freeze |
| 2 | src/orchestration/* + src/memory/* + cli/guard 改修 | `ut-tdd codex` で実装委譲、既存 primitive 再利用、私が review |
| 3 | tests/* + doctor checks | 各 stop-rule/verifier 差異/memory 投影/silo を test、doctor fail-close 配線 |
| 4 | lint/doctor + review | 定量 green → cross-runtime review → accept |

## §4 DoD

- [ ] P2 6 + P7 3 モジュール実装、既存 primitive 再利用、外部バイナリ不使用。
- [ ] verifier=worker 同 provider が hybrid で fail-close（自己評価禁止 machine-enforce）。
- [ ] `ut-tdd memory` CLI 動作、`.ut-tdd/memory/` 共有、`.claude/agent-memory/` silo 廃止。
- [ ] typecheck/vitest/doctor green、新 doctor チェック pass。
- [ ] cross-runtime review 証跡（tests_green_at ≤ reviewed_at）。

## §5 carry

- L1 trace（BR-07/BR-12/NFR-03 hybrid 前提 MODIFY）は PLAN-L1-06 solo 変換で確定。
- heartbeat/job-queue 自動スケジューリングの常駐化は後続（本 PLAN は tick ベース）。
- 旧 HELIX の未採用機構（skill 多様性統計等）は improvement-backlog へ。
