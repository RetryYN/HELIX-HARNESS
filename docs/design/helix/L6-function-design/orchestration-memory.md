---
title: "HELIX L6 機能設計 — P2 hybrid orchestration + P7 共有メモリ"
layer: L6
kind: add-design
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL
plan: PLAN-L6-50-helix-orchestration-memory
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/orchestration-memory.md
pair_test_design: docs/test-design/helix/orchestration-memory.md
---

# HELIX L6 機能設計 — P2 hybrid orchestration + P7 共有メモリ

> PLAN-L6-50 (add-design, route B) Step 2 の成果物。③ 単体テスト設計
> (`docs/test-design/helix/orchestration-memory.md`) と **pair-freeze**（片肺禁止）。
> 原則: 仕組み=harness 上 / 個別機能=旧 HELIX 上（機能は仕組みを超えない）、ADR-001=TS/Bun
> 再実装（旧 HELIX Python はコピーせず概念のみ）、P8=外部バイナリ/shell/http 委譲は不採用。

## §1 概要

HELIX を **Claude Code ↔ Codex 連携前提のマルチエージェント・オーケストレーション**へ寄せる
機能追加。standalone 単体は縮退モード、**hybrid Claude+Codex を foundation** に据える。本書は
2 つの Bounded Context を function 粒度で確定する:

- **P2 orchestration** (`src/orchestration/`): worker/verifier の loop を回し、stop 条件で止め、
  失敗を recovery へ送る coordinator。verifier は常に worker と別 runtime（自己評価禁止を machine-enforce）。
- **P7 memory** (`src/memory/`): harness 層 / project 層の 2 層共有メモリ。Claude も Codex も同一
  ソースを読み書きできる（per-agent silo を廃止）。

## §2 機能設計 (L6 粒度)

### §2.1 責務分離

| 責務 | 関数 | machine enforcement |
|------|------|---------------------|
| loop 駆動 | `tick` / `canResume` (`loop-runner.ts`) | resume 3 条件 AND（数だけで自動継続しない） |
| 停止判定 | `evaluateStop` (`loop-stop-rules.ts`) | stop schema を zod で固定（未知 reason は fail-close） |
| 検証者選定 | `selectVerifier` (`cross-verifier.ts`) | hybrid で verifier≠worker provider を **fail-close** |
| 失敗回収 | `classifyRecovery` (`loop-recovery.ts`) | C1-C4 条件 → escalate/retry/abort、判断は純関数 |
| job 排他 | `claimNextJob` (`job-queue.ts`) | `BEGIN IMMEDIATE` で多ランタイム競合 claim を直列化 |
| memory 投影 | `writeMemory` / `listMemory` (`src/memory/index.ts`) | secret strip + 2 層投影（harness.db + jsonl） |

> 生成 = AI、判断 = 別 runtime。standalone は verifier を同 runtime に fallback するが
> `blockedReason="intra_runtime_fallback"` を必ず記録（自己評価を黙認しない）。

### §2.2 型 / schema (D-CONTRACT)

```ts
// loop-state.ts
type Provider = "claude" | "codex";
type Verdict = "pass" | "fail" | "error" | "pending";

interface LoopState {
  planId: string;
  status: "running" | "paused" | "stopped";
  iteration: number;
  maxIterations: number;
  lastVerdict: Verdict;
  workerProvider: Provider;
  verifierProvider: Provider | null;   // standalone fallback では worker と同値 + blockedReason
  blockedReason: string | null;        // "intra_runtime_fallback" / "cross_runtime_unavailable" 等。null=正常
  windowOpensAt: string;               // ISO8601。within_time_window 判定の下端
  windowClosesAt: string;              // ISO8601。これを過ぎたら resume しない
  costUsd: number;                     // 累積。cost_budget stop の入力
  updatedAt: string;
}

// loop-stop-rules.ts — 旧 HELIX AgentLoop stop schema の TS 拡張
type StopReason = "verdict" | "count" | "file_exists" | "cost_budget" | "no_progress" | "custom";
type OnFailure = "escalate" | "retry" | "abort";
interface StopRule {
  reason: StopReason;
  threshold?: number;     // count / cost_budget / no_progress の閾値
  path?: string;          // file_exists の対象（repo-relative）
  onFailure: OnFailure;
}
interface StopDecision { stop: boolean; reason: StopReason | null; onFailure: OnFailure | null; }

// job-queue.ts
type JobStatus = "queued" | "claimed" | "done" | "failed";
interface Job {
  id: string;
  planId: string;
  priority: number;       // 小さいほど先
  status: JobStatus;
  provider: Provider | null;  // claim した runtime
  retryCount: number;
  createdAt: string;
}

// memory-types.ts
type MemoryLayer = "harness" | "project";
interface MemoryEntry {
  id: string;             // stableId（内容ハッシュ由来、再投影で安定）
  layer: MemoryLayer;
  key: string;
  body: string;
  supersedes: string | null;  // 旧 entry id（履歴を壊さず上書き）
  createdAt: string;
}
```

### §2.3 関数 signature + DbC (契約)

| 関数 | signature | DbC |
|------|-----------|-----|
| `canResume` | `(s: LoopState, now: string) => boolean` | **純関数**。旧 auto_run_engine の **3 条件** `status==="running"` ∧ `within_time_window` ∧ `should_schedule` を TS 化。`within_time_window` = `now∈[windowOpensAt,windowClosesAt]`（両端含む ≤）、`should_schedule` = `lastVerdict!=="pass"` ∧ `iteration<maxIterations`（carry 述語）。展開すると **計 4 述語の AND**、1 つでも偽 → false |
| `evaluateStop` | `(rules: StopRule[], s: LoopState, probe: StopProbe) => StopDecision` | **純関数**（I/O は probe 注入）。最初に成立した rule で stop。`verdict`→`lastVerdict==="pass"`、`count`→`iteration>=threshold`、`cost_budget`→`costUsd>=threshold`、`file_exists`→`probe.exists(path)`、`no_progress`→`probe.noProgress(threshold)`、`custom`→`probe.custom()`。**必須フィールド欠落の fail-close**: `count`/`cost_budget`/`no_progress` で `threshold==null`、`file_exists` で `path==null` の rule は評価不能 → `{stop:true,reason:null,onFailure:"escalate"}`。未知 reason も同様（throw せず escalate で安全側に倒す） |
| `selectVerifier` | `(workerProvider: Provider, mode: ExecutionMode) => { provider: Provider; blockedReason: string \| null }` | **純関数**（provider 選定のみ。可用性 I/O は持たない）。hybrid → worker と異なる provider を返す（`blockedReason=null`）。それ以外（single-runtime）→ worker と同 provider + `blockedReason="intra_runtime_fallback"`。**hybrid で worker と同 provider を返すことは無い**（BLOCKED_SELF_DELEGATION の core） |
| `tick` | `(s: LoopState, rules: StopRule[], deps: TickDeps) => Promise<LoopState>` | orchestration。`canResume` 偽 → state 不変で返す。真 → `evaluateStop`→stop なら `onFailure` 経路（escalate/retry/abort）→ worker dispatch → `selectVerifier` で verifier provider 決定 → verifier dispatch → `loop_iterations` 追記 → iteration++ で新 state。**hybrid 自己評価 fail-close**: hybrid で選定 verifier provider が dispatch 時に利用不能（`deps.providerAvailable(provider)===false`）なら **worker と同 runtime で代替検証せず escalate**（`status="stopped"`, `blockedReason="cross_runtime_unavailable"`）。worker 自身の runtime から `pass` を出さない。**副作用は deps 経由のみ**、token を state/log に書かない |
| `classifyRecovery` | `(s: LoopState, signals: RecoverySignals) => RecoveryAction` | **純関数**。旧 RecoveryEngine C1-C4: diff 規模超過 / doctor 赤 / handover stale / budget 両超過 → `{kind:"escalate"\|"retry"\|"abort", reason}`。閾値内 → `{kind:"continue"}` |
| `claimNextJob` | `(db: Database, provider: Provider) => Job \| null` | `BEGIN IMMEDIATE` トランザクション内で `status="queued"` の最優先 1 件を `status="claimed", provider=:provider` に更新して返す。無ければ null。**並行 claim はトランザクション直列化で二重取得しない**（旧 job_queue 排他の TS 移植） |
| `writeMemory` | `(input: WriteMemoryInput, deps: MemoryDeps) => MemoryEntry`（`WriteMemoryInput={layer,key,body}`。coding-rule max-source-params=3 のため input object 化、impl→design back-fill） | **secret 命中時は書込拒否（throw、reject）— strip して部分保存はしない**（部分保存は「保存された」誤解と漏洩境界の曖昧化を生む）。既存 `SECRET_PATTERN` で body を検査し、命中 0 のときのみ harness.db `upsertRow` + `.ut-tdd/memory/<layer>.jsonl` 追記の **2 層投影**。同 key 既存 → `supersedes` に旧 id を載せて新 entry（履歴非破壊） |
| `listMemory` | `(layer: MemoryLayer, deps: MemoryDeps) => MemoryEntry[]` | 指定層の有効 entry（superseded 除く）を `createdAt` 昇順で返す。**純読取**、書込なし |
| `surfaceMemory` | `(deps: MemoryDeps, budget?: SurfaceBudget) => string[]` | SessionStart 用。harness 層の有効 entry を人間可読行で返す（project 層は明示要求時のみ）。秘匿情報を surface しない。**context 圧迫対策**: 直近 `maxEntries`(既定 12) 件のみ・各 body は `maxBodyChars`(既定 240) で切り詰め、超過分は `(+N older — ut-tdd memory list harness)` フッタに集約（無制限注入を禁止） |

### §2.4 既存機構との接続（改修 delta）

| 既存 | 改修 | 不変条件 |
|------|------|----------|
| `src/team/run.ts` (`validateTeamRun`) | hybrid team で verifier slot が worker と同 provider なら fail-close | 既存 team 検証の他項目は不変 |
| `src/runtime/agent-guard.ts` | BLOCKED_SELF_DELEGATION を `selectVerifier` 経由へ集約（重複ロジック排除） | guard の allowlist/model 照合は不変 |
| `src/state-db/projection-writer.ts` | `loop_iterations` / `jobs` / memory 2 表への projection 関数追加（既存 `recordProjectionEvent` 再利用） | 既存 projection の冪等性・secret strip 不変 |
| `src/lint/asset-drift.ts` | `.claude/agent-memory/` scan を除去（silo 廃止に伴う） | 他 asset-drift 検査は不変 |
| `src/doctor/index.ts` | `verifier-provider-mismatch`（hybrid 自己評価検出）/ `agent-memory-silo`（旧 silo 残存検出）を hard gate 追加 | 既存 gate の ok 集約規約に従う |
| `src/cli.ts` | `ut-tdd memory write/list/show/supersede` subcommand | 既存 subcommand の引数規約に従う |
| `src/schema/harness-db-*` | `loop_iterations` / `jobs` / `harness_memory_entries` / `project_memory_entries` 追加 + `SCHEMA_VERSION` bump | 既存テーブル/インデックスは不変、migrate は前方互換 |

### §2.5 fail-safe + 安全フォールバック

- **verifier 選定の fail-close**: hybrid で別 runtime が利用不能 → loop を進めず escalate（自己評価で「pass」を出さない）。
- **stop の未知 reason**: throw でなく `escalate` で安全側に倒す（loop を暴走させない）。
- **job claim 競合**: `BEGIN IMMEDIATE` 失敗（busy）→ null を返し呼び出し側が backoff（二重実行しない）。
- **memory secret**: `SECRET_PATTERN` 命中で書込拒否（docs/audit に秘匿が漏れない、CLAUDE.md 禁止事項）。
- **P8 境界**: heartbeat-scheduler 外部バイナリ / shell・http dispatcher は不採用。loop は `tick` の明示呼び出しベース（常駐スケジューラは後続 carry）。

### §2.6 ストレージ / 配置

- loop state: `.ut-tdd/state/loop/<planId>.json`（runtime state、非追跡）。
- 投影: harness.db `loop_iterations`（plan_id/iteration/worker_provider/verifier_provider/verdict/cost_usd/stop_reason/**blocked_reason**）/ `jobs`。`blocked_reason` で hybrid 自己評価 fallback・cross_runtime_unavailable を後段 doctor（`verifier-provider-mismatch`）が検査できる。
- memory: harness.db `harness_memory_entries` / `project_memory_entries` ＋ `.ut-tdd/memory/<layer>.jsonl`（**git 共有 = Claude も Codex も読める**）。
- `.claude/agent-memory/` silo は廃止（per-agent・Codex 非共有・asset-drift 衝突の解消）。
- **SessionStart 配線（実装済 PLAN-L7-176 後続）**: `ut-tdd session start`（`.claude/settings.json` SessionStart hook 本体）が `surfaceMemory(fileMemoryDeps)` を呼び、harness 層メモリを `harness-memory (N):` として hook 出力に surface する。これにより共有 SSoT（`.ut-tdd/memory/harness.jsonl`、git 追跡・Claude/Codex 共有）が想起され、**Claude Code 内蔵メモリ（per-agent silo）に依存しない**（charter P7）。被覆 = U-CLI-MEM-SURFACE。

## §3 ③ 単体テスト設計 (pair)

`docs/test-design/helix/orchestration-memory.md` を SSoT とし、本 §2.3 契約関数 9 本を 1:1 被覆:
U-ORCH-001 (`canResume` 3 条件 AND) / U-ORCH-002 (`evaluateStop` 各 reason + 未知 fail-close) /
U-ORCH-003 (`selectVerifier` hybrid 別 provider / single fallback 記録) / U-ORCH-004 (`tick`
resume 偽で不変 / stop 経路 / iteration++) / U-ORCH-005 (`classifyRecovery` C1-C4) /
U-ORCH-006 (`claimNextJob` BEGIN IMMEDIATE 二重取得なし) / U-MEM-001 (`writeMemory` 2 層投影 +
secret 拒否 + supersede) / U-MEM-002 (`listMemory` superseded 除外・昇順) / U-MEM-003
(`surfaceMemory` harness 層のみ・秘匿非 surface)。**coverage 単独 pass 禁止**（oracle 観点で被覆）。

> 孤児 0: §2.3 の 9 契約 ↔ U-ORCH/U-MEM 9 oracle を 1:1 対応。pair-freeze は両 doc 同時凍結。

## §4 carry / 後続

- 本 add-design freeze 後 → `kind=add-impl`（parent=PLAN-L6-50, layer=L7）で実装を **writable Codex へ分散**。
- Reverse(R0-R4, forward_routing=L3) で L3 要件 BR-07(loop-eng)/BR-12(2 層メモリ)/NFR-03(hybrid 前提) を back-fill → G3 凍結。
- 常駐スケジューラ（heartbeat 相当の自動 tick 周回）は本書 scope 外、improvement-backlog へ。
