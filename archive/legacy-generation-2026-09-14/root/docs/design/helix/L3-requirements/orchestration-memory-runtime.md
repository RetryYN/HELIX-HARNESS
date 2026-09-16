---
title: "HELIX L3 要件 back-fill — P2/P7 runtime (tick / job-queue / memory persistence + CLI)"
layer: L3
kind: reverse-backfill
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL
plan: PLAN-REVERSE-176-helix-orchestration-memory-runtime
backfills: PLAN-L7-176-helix-orchestration-memory-runtime
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
---

# HELIX L3 要件 back-fill — P2/P7 runtime

> Add-feature route B（bottom-up）の Reverse back-fill。先行 build した PLAN-L7-176（runtime）から
> L3 要件を後追いで明文化する（forward_routing=L3、IMP-043）。純粋契約コア（PLAN-L7-175 /
> REVERSE-175 の HR-BR-07/HR-BR-12/HR-NFR-03）を **永続・実行・競合排他**の runtime 面へ拡張する。
> 設計の storage 方針（L6 §2.6）に沿い **ファイル/専用ストア永続**で実装。harness.db 分析投影は P9 観測強化へ carry。

## HR-BR-07R — loop 実行 runtime（tick）

- `tick` は `canResume` 偽で state を不変返却（dispatch しない）。`evaluateStop` 成立で `stopped`。
- 継続時のみ worker を実行 → **別 runtime の verifier**（`selectVerifier`）を実行 → `iteration++`、
  各反復を `recordIteration`（worker/verifier provider・verdict・stop_reason・blocked_reason）で記録。
- **hybrid 自己評価 fail-close**: 選定 verifier provider が利用不能なら **worker と同 runtime で代替検証せず
  `stopped` + `blockedReason="cross_runtime_unavailable"`**（worker の runtime から pass を出さない）。
- loop state は `.helix/state/loop/<planId>.json` に永続（`loop-store`）。
- 受入 = U-ORCH-004。

## HR-BR-12R — memory 永続 + CLI（2 層 jsonl）

- `MemoryDeps` の実体は `.helix/memory/<layer>.jsonl`（git 共有 SSoT、Claude も Codex も読み書き可）。
- append-only・履歴非破壊（supersede で上書きせず追記）、破損行はスキップ（fail-soft 読取）。
- `helix memory write/list/show` CLI で人手/エージェントから操作可能。
- secret は `isSecretLike`（単一正本）で write 時 reject（body を echo しない）。
- 受入 = memory-store / CLI（writeMemory/listMemory/surfaceMemory の実 deps）。

## HR-NFR-03R — 多ランタイム競合排他（job-queue）

- `job-queue` は **専用 sqlite ストア**（`.helix/state/jobs.db`、harness.db とは分離）で、
  `BEGIN IMMEDIATE` トランザクションにより Claude/Codex の競合 claim を直列化し**二重取得しない**。
- `SQLITE_BUSY` は null 返却で呼び出し側が backoff（二重実行回避）。rollback 失敗は cause 付きで変換送出。
- 受入 = U-ORCH-006。

## carry（P9 観測強化、別 add-impl）

- harness.db への loop_iterations[blocked_reason] / jobs / memory 2 表 projection（分析・query）。
- doctor `verifier-provider-mismatch`（loop_iterations 走査）/ `agent-memory-silo`、`asset-drift` silo scan 除去、
  `agent-guard` の BLOCKED_SELF_DELEGATION を `selectVerifier` へ集約。
