---
plan_id: PLAN-L4-50-orchestration-memory-hybrid
title: "PLAN-L4-50: P2 hybrid orchestration + P7 共有メモリ 機能追加 (Claude+Codex 前提)"
kind: design
layer: L4
drive: agent
status: archived
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

> **訂正・archived / superseded (2026-06-28)**: 本 PLAN を `kind=design` master_hub で起票したのは Add-feature
> ワークフロー（`docs/process/modes/add-feature.md` = `kind=add-design`(L3-L6) + `kind=add-impl`(L7)、
> route B bottom-up）の誤適用だった。正しい add-design として **PLAN-L6-50-helix-orchestration-memory**
> が本 PLAN を supersede する。設計サマリ・実行は L6-50（および後続 add-impl / Reverse）へ移管。
> `PLAN-L4-51-helix-pillar-basic-design` で P2/P7 を含む HELIX pillar 全体の L4 block へ再接地したため、
> 本 PLAN は historical artifact として `archived` に閉じる。

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

### 前提改修（Codex を実働 worker 化、先行実装済）
- `src/runtime/adapter.ts`: codex `--execute` 時に `--sandbox workspace-write` を付与（dry-run は read-only 維持、`CODEX_STDIN_ARGS` 定数は不変で doctor adapter-policy 維持）。これで `ut-tdd codex --execute` が in-repo 書き込み可能になり、**実装を Codex へ分散できる**（hybrid worker 前提の土台、PO 承認 2026-06-28）。test = `U-ADAPTER-007`（tests/runtime-adapter.test.ts）。

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

## §工程表（V-model 降下 — L4→L5→L6 設計+pair-freeze→L7 実装。実装は L6 freeze 後）

### Step 1: [直列] L4 基本設計 freeze
> 直列理由: downstream_dependency — モジュール構成/データ配置が後続詳細設計の前提。
本 PLAN §1 = L4 設計（src/orchestration・src/memory のモジュール構成、harness.db テーブル、既存接続点、旧 HELIX 採用核心3点、hybrid 前提）。architecture/data 整合を確認し freeze。
- 進捗: 🔄 §1 に L4 設計記載済（分散 subagent 検証）。L4 freeze 判定待ち。

### Step 2: [直列] L5 詳細設計
> 直列理由: downstream_dependency — L4 構成を各モジュールの内部詳細へ落とす。
loop tick アルゴリズム / stop-rule 判定 / cross-verifier 選定 / job-queue claim(BEGIN IMMEDIATE) / memory 2層投影 / CLI フロー の詳細設計（`docs/design/helix/L5-detail/` 相当）。
- 進捗: ⬜

### Step 3: [直列] L6 機能設計 + pair-freeze（片肺禁止）
> 直列理由: downstream_dependency — 詳細設計を関数契約へ確定し test-design と対凍結。
function-spec（型 body・契約・擬似コード）⇔ test-design（U-* oracle、tests/orchestration・tests/memory の観点）を **対で pair-freeze**。coverage 単独 pass 禁止。
- 進捗: ⬜

### Step 4: [直列] L7 add-impl（L6 freeze 後に Codex 分散）
> 直列理由: downstream_dependency — 凍結 design に基づき実装。設計凍結前に実装しない。
L6 freeze 後、**writable Codex へ実装委譲**（scratchpad の Codex ドラフトは参照素材、design 準拠で再生成）。typecheck/vitest/doctor green。
- 進捗: ⬜（L6 freeze まで着手しない）

### Step 5: [直列] trace-freeze → review (cross-runtime) → accept
> 直列理由: downstream_dependency — 定量 green 後に trace/定性レビュー（tests_green_at ≤ reviewed_at）。
trace-freeze → cross-agent (Codex 実装 ↔ Claude review) / intra_runtime_subagent 記録 → 受入。
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
