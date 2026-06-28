---
title: "HELIX L3 要件 back-fill — P2 orchestration 純粋契約 + P7 memory ロジック"
layer: L3
kind: reverse-backfill
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL
plan: PLAN-REVERSE-175-helix-orchestration-memory
backfills: PLAN-L7-175-helix-orchestration-memory-impl
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
---

# HELIX L3 要件 back-fill — P2/P7 純粋契約コア

> Add-feature route B（bottom-up）の Reverse back-fill。先行 build した PLAN-L7-175（純粋契約コア）
> から L3 要件を後追いで明文化する（PLAN-REVERSE-175、forward_routing=L3、IMP-043）。
> 要件 ID は HELIX 名前空間（`HR-`）で、harness の BR/NFR registry と衝突させない。
> 本 back-fill は **実装済みの純粋契約の範囲に限定**する（DB 連動・job-queue・tick は follow-up で別途）。

## HR-BR-07 — loop-engineering 決定ロジック

worker/verifier の反復 loop は、**機械判定可能な決定関数**で駆動されること。

- **継続判定** `canResume`: `status==="running"` ∧ 時間窓内 ∧ `lastVerdict!=="pass"` ∧ `iteration<max`
  の 4 述語 AND（旧 auto_run_engine 3 条件の TS 化）。数だけで自動継続しない。
- **停止判定** `evaluateStop`: `verdict/count/file_exists/cost_budget/no_progress/custom` を first-satisfied で
  評価。**未知 reason・必須フィールド欠落は escalate で fail-close**（throw せず安全側）。
- **失敗分類** `classifyRecovery`: doctor 赤 / budget 両超過 → escalate、handover stale → retry、diff 規模超過
  → abort、閾値内 → continue（旧 RecoveryEngine C1-C4）。
- 受入 = U-ORCH-001 / U-ORCH-002 / U-ORCH-005（`tests/orchestration`）。

## HR-BR-12 — 2 層共有メモリのセマンティクス

メモリは **harness 層 / project 層**を持ち、エントリは履歴非破壊で更新されること。

- `writeMemory`: 同 key 既存は新エントリの `supersedes` に旧 id を載せる（上書きせず履歴を残す）。
- `listMemory`: superseded を除外し、指定層のみ `createdAt` 昇順。
- `surfaceMemory`: **harness 層のみ** surface（project 層は出さない）。
- 永続は **注入抽象 `MemoryDeps`** 経由（実 2 層投影 = harness.db + jsonl は follow-up で配線）。
- 受入 = U-MEM-001 / U-MEM-002 / U-MEM-003（`tests/memory`）。

## HR-NFR-03 — hybrid 自己評価禁止（非機能・安全）

hybrid では **検証者は worker と別 runtime**でなければならない（自己評価で pass を出さない）。

- `selectVerifier`: hybrid → worker と異なる provider（`blockedReason=null`）。single-runtime → worker と
  同 provider だが `blockedReason="intra_runtime_fallback"` を必ず記録。**hybrid で worker と同 provider を
  返さない**（旧 BLOCKED_SELF_DELEGATION の機械担保）。
- secret 安全: `writeMemory` は secret 命中時に**書込拒否（reject、body を echo しない）**。漏洩境界を実装裁量に
  残さない（CLAUDE.md 禁止事項の機械担保）。
- 受入 = U-ORCH-003（self-eval 禁止）＋ U-MEM-001（secret reject）。

## carry（本 back-fill 範囲外）

- DB 連動要件（loop_iterations[blocked_reason]/jobs/memory 2 表 projection の永続・doctor 検査）、
  job-queue 競合排他（BEGIN IMMEDIATE）、tick の hybrid-unavailable escalate は **follow-up add-impl
  （PLAN-L7-176 予定）** とその Reverse で back-fill する。
