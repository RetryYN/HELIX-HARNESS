---
title: "HELIX L6 単体テスト設計 (③) — P2 orchestration + P7 memory"
layer: L6
kind: add-design
status: draft
created: 2026-06-28
updated: 2026-06-28
owner: QA + AIM
plan: PLAN-L6-50-helix-orchestration-memory
pair_artifact: docs/design/helix/L6-function-design/orchestration-memory.md
pair_design: docs/design/helix/L6-function-design/orchestration-memory.md
---

# HELIX L6 単体テスト設計 (③) — P2 orchestration + P7 memory

> `docs/design/helix/L6-function-design/orchestration-memory.md` (①) と **pair-freeze**。
> oracle は「観測 → 期待」を明示し、coverage 単独 pass を禁止する。tests 配置（add-impl 時）:
> `tests/orchestration/*.test.ts` / `tests/memory/*.test.ts`。`tdd_red_required: true`（Red 先行）。

## §1 契約 ↔ oracle 対応（孤児 0）

| 契約関数 (§2.3) | oracle |
|------|--------|
| `canResume` | U-ORCH-001 |
| `evaluateStop` | U-ORCH-002 |
| `selectVerifier` | U-ORCH-003 |
| `tick` | U-ORCH-004 |
| `classifyRecovery` | U-ORCH-005 |
| `claimNextJob` | U-ORCH-006 |
| `writeMemory` | U-MEM-001 |
| `listMemory` | U-MEM-002 |
| `surfaceMemory` | U-MEM-003 |

## §2 oracle 定義

### U-ORCH-001 — `canResume` は（3 条件＝計 4 述語の）AND
- **観測**: `status`/時刻 window/`lastVerdict`/`iteration<max` の各組合せで `canResume(s, now)`。
- **期待**: 旧 auto_run_engine 3 条件（`status` ∧ `within_time_window` ∧ `should_schedule`、後者は
  `lastVerdict!=="pass"` ∧ `iteration<max` の 2 述語）= 展開して **4 述語が全成立のみ true**。`status!=="running"` /
  `now` が window 外 / `lastVerdict==="pass"` / `iteration>=max` のいずれか 1 つでも → **false**。境界: `now===windowClosesAt` は含む（≤）。

### U-ORCH-002 — `evaluateStop` 各 reason + 欠落/未知 fail-close
- **観測**: 各 `StopReason` の rule 配列を、成立/非成立する `LoopState`+`probe` で評価。**必須フィールド欠落
  rule**（`count`/`cost_budget`/`no_progress` で `threshold` 無し、`file_exists` で `path` 無し）と未知 reason も注入。
- **期待**: `verdict`(pass)/`count`(≥threshold)/`cost_budget`(≥)/`file_exists`(probe true)/`no_progress`/
  `custom` が各々成立時に `stop:true` と当該 reason・`onFailure` を返す。**最初に成立した rule** を採用。
  どれも非成立 → `stop:false`。**必須フィールド欠落 rule・未知 reason → `{stop:true,reason:null,onFailure:"escalate"}`**（throw しない、安全側）。

### U-ORCH-003 — `selectVerifier` 自己評価禁止
- **観測**: `selectVerifier("codex", "hybrid")` / `("claude","hybrid")` / `(_, "codex-only")` / `(_, "claude-only")`。
- **期待**: hybrid → worker と**異なる** provider、`blockedReason===null`。single-runtime → worker と
  同 provider だが `blockedReason==="intra_runtime_fallback"`。**hybrid で worker と同 provider を返さない**。

### U-ORCH-004 — `tick` の状態遷移 + hybrid 自己評価 fail-close
- **観測**: (a) `canResume` 偽な state、(b) stop 成立 state、(c) 継続 state、(d) hybrid で選定 verifier provider
  が利用不能（`deps.providerAvailable→false`）な state を、mock `TickDeps` で `tick`。
- **期待**: (a) state 不変で返る（dispatch 呼ばれない）。(b) `onFailure` 経路が呼ばれ loop が `stopped`。
  (c) worker→verifier dispatch、`loop_iterations` 追記（`blocked_reason` 記録）、`iteration` が +1。
  **(d) worker と同 runtime で代替検証せず `status="stopped"`・`blockedReason="cross_runtime_unavailable"` で
  escalate（worker の runtime から `pass` を出さない）**。全ケースで **token を state/log に書かない**。

### U-ORCH-005 — `classifyRecovery` C1-C4
- **観測**: diff 規模超過 / doctor 赤 / handover stale / budget 両超過 の各 signal、および閾値内 signal。
- **期待**: 各異常 → `escalate`/`retry`/`abort` の規定 kind と reason。閾値内 → `continue`。純関数（I/O なし）。

### U-ORCH-006 — `claimNextJob` 競合排他
- **観測**: in-memory `bun:sqlite` に queued job 複数。同一 DB に対し `claimNextJob` を連続/競合的に呼ぶ。
- **期待**: 各呼び出しは**異なる** job を返す（二重取得なし）。優先度昇順。queue 空 → null。
  claim 済み job は `status="claimed"`・`provider` 記録。`BEGIN IMMEDIATE` 直列化の確認。

### U-MEM-001 — `writeMemory` 2 層投影 + secret + supersede
- **観測**: 通常 body / `SECRET_PATTERN` 命中 body / 同 key 再書込 を mock `MemoryDeps` で。
- **期待**: 通常 → harness.db row ＋ `.ut-tdd/memory/<layer>.jsonl` の **両方**に投影、`id` は stableId。
  **secret 命中 → throw で書込拒否（reject、strip 部分保存はしない。両層に一切残らない）**。同 key 再書込 →
  新 entry の `supersedes` に旧 id（旧 entry は履歴に残る）。

### U-MEM-002 — `listMemory` 有効集合
- **観測**: superseded を含む entry 群に対し `listMemory(layer)`。
- **期待**: superseded entry を除外、指定層のみ、`createdAt` 昇順。書込副作用なし。

### U-MEM-003 — `surfaceMemory` 層境界
- **観測**: harness 層 + project 層 entry 混在で `surfaceMemory`。
- **期待**: harness 層の有効 entry のみを人間可読行で返す。project 層は含めない。**秘匿パターンを surface しない**。

## §3 doctor / 統合観点（add-impl 時に配線）

- `verifier-provider-mismatch`（hard）: hybrid loop_iterations に worker===verifier の行があれば violation。
- `agent-memory-silo`（hard）: `.claude/agent-memory/` が残存すれば violation（silo 廃止の machine-enforce）。
- memory secret: 投影経路に `SECRET_PATTERN` を通すことを統合テストで確認（漏洩ゼロ）。

> pair-freeze: 本 ③ と ① を同時凍結。実装は freeze 後（IMP-043: 先行 build は可だが trace 確定は
> Reverse G3 pair-freeze を待つ）。
