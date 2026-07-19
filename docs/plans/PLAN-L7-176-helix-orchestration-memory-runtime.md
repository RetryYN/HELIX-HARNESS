---
plan_id: PLAN-L7-176-helix-orchestration-memory-runtime
title: "PLAN-L7-176 (add-impl): P2/P7 runtime — tick / job-queue / memory 永続 + CLI (Codex 分散)"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-28
updated: 2026-07-06
owner: AIM + TL
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
review_evidence:
  - reviewer: claude-opus-4-8
    review_kind: cross_agent
    reviewed_at: "2026-06-28T18:00:00+09:00"
    tests_green_at: "2026-06-28T17:55:00+09:00"
    verdict: pass
    worker_model: gpt-5.3-codex
    reviewer_model: claude-opus-4-8
    scope: "P2/P7 runtime: tick (hybrid 自己評価 fail-close)/job-queue (BEGIN IMMEDIATE 二重 claim 回避)/loop-store (json I/O)/memory-store (jsonl 2 層永続, isSecretLike reject)/cli memory。Codex(worker) 実装、Claude(reviewer) が job-queue 排他・tick fail-close・secret reject・active/superseded 算出を精読確認。U-ORCH-004/006 + memory-store Red→Green、9 oracle 全 Green。harness.db 分析投影/observability doctor gate/asset-drift silo 除去は P9 carry。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/orchestration tests/memory"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28T17:55:00+09:00"
        evidence_path: tests/orchestration/orchestration.test.ts
        output_digest: "sha256:27d21f17db9adbeac47bd7d1894214c45c679ef657d7a5ddc9e06ab55a39ab1c"
      - kind: unit_test
        command: "npx --no-install vitest run tests/memory"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28T17:55:00+09:00"
        evidence_path: tests/memory/memory-store.test.ts
        output_digest: "sha256:bb7378891f56252325adb44a34ed2e36aa0cbc9aae1a7d11bbcfab0796edb868"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-28T17:55:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
agent_slots:
  - role: se
    slot_label: "SE — Codex 実装 worker (writable, hybrid)"
  - role: tl
    slot_label: "TL — cross-runtime review (Claude)"
generates:
  - artifact_path: docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-176-helix-orchestration-memory-runtime.md
    artifact_type: markdown_doc
  - artifact_path: src/orchestration/job-queue.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/loop-store.ts
    artifact_type: source_module
  - artifact_path: src/memory/memory-store.ts
    artifact_type: source_module
  - artifact_path: tests/memory/memory-store.test.ts
    artifact_type: test_code
dependencies:
  parent: PLAN-L6-50-helix-orchestration-memory
  requires:
    - PLAN-L6-50-helix-orchestration-memory
    - PLAN-REVERSE-176-helix-orchestration-memory-runtime
  references:
    - docs/design/helix/L6-function-design/orchestration-memory.md
    - src/orchestration/loop-runner.ts
    - src/memory/index.ts
---

# PLAN-L7-176 (add-impl): P2/P7 runtime 実行・永続化

2026-07-06 追記: PLAN-L7-346 により `tests/memory/memory-store.test.ts` の `test_code` generates を追記した。confirmed claim 本体は変更せず、silent overwrite ではない機械的登録補完として扱う。

## §0 役割 / スコープ

純粋契約コア（PLAN-L7-175）の上に **runtime（永続・実行・競合排他）**を載せる add-impl。**Codex=worker /
Claude=reviewer**。設計の storage 方針（§2.6）に沿い **ファイル/専用ストア永続**で機能を完成させ、
harness.db 分析投影（loop_iterations/jobs/memory 2 表）＋観測 doctor gate は **P9 観測強化として carry**
（既存 db-projection-coverage/ingestion gate を本 PLAN で巻き込まない）。

## §1 実装単位

| モジュール (module) | 内容 | 検証基準 (oracle) |
|--------|------|--------|
| `src/orchestration/loop-store.ts` | LoopState の `.helix/state/loop/<planId>.json` I/O（read/write、注入 fs） | (tick の deps) |
| `src/orchestration/loop-runner.ts`（改修） | `tick`（hybrid 自己評価 fail-close、stop 経路、iteration++、loop record） | U-ORCH-004 |
| `src/orchestration/job-queue.ts` | `claimNextJob`（**専用** `bun:sqlite` `.helix/state/jobs.db`、`BEGIN IMMEDIATE` 競合排他） | U-ORCH-006 |
| `src/memory/memory-store.ts` | 実 `MemoryDeps`（`.helix/memory/<layer>.jsonl` git 共有 SSoT、`isSecretLike` 再利用、stableId/now） | (U-MEM 実体) |
| `src/cli.ts`（改修） | `helix memory write/list/show` subcommand（memory-store 経由） | (CLI surface) |
| `src/lint/asset-drift.ts`（改修） | `.claude/agent-memory/` silo scan 除去（per-agent silo 廃止） | (silo 廃止) |

## §2 進め方（Codex 分散・Red→Green）

1. U-ORCH-004 / U-ORCH-006 の `it.todo` を実テスト（Red）へ展開し Codex 実装で Green。
2. memory-store / cli は file-based で結合し、`helix memory` が動くことを確認。
3. Claude が cross-runtime review（契約適合・fail-close・secret reject を精読）。

## §3 DoD（達成）

- [x] `tick`（U-ORCH-004）/ `claimNextJob`（U-ORCH-006）green、**9 oracle 全 Green（todo 解消）**。
- [x] `helix memory write/list/show` がファイル永続（jsonl）で動作、secret reject、harness-only surface。
- [x] typecheck/vitest/lint/doctor green、cross-runtime review 証跡（green_commands + 実 digest）。
- [x] Reverse(PLAN-REVERSE-176) の L3 要件 back-fill（HR-BR-07R/12R/NFR-03R）と両 confirm。

> 注: `.claude/agent-memory/` silo 廃止（asset-drift scan 除去）は §4 carry（P9 観測強化）へ。

### §3.1 追補（SessionStart surfacing 配線、2026-06-28）

L6 設計 §2.6 の「SessionStart で harness 層 surface」を配線完了: `helix session start`（`.claude/settings.json`
SessionStart hook 本体）が `surfaceMemory(fileMemoryDeps({root}))` を呼び、harness メモリを `harness-memory (N):`
として hook 出力に surface する。これで共有 SSoT（`.helix/memory/harness.jsonl`、git 追跡・Claude/Codex 共有）が
**自動想起**され、**Claude Code 内蔵メモリ（per-agent silo）に依存しない**（charter P7 dogfood）。被覆 = U-CLI-MEM-SURFACE。

### §3.2 追補（surface context-budget 上限化、2026-06-28）

`surfaceMemory` は SessionStart で毎回 context へ注入されるため、無制限化すると entry 増加に比例して
context を圧迫する。L6 設計 §2.3 契約を改訂し、surface を有界化した: 直近 `maxEntries`(既定 12) 件のみ・
各 body を `maxBodyChars`(既定 240) で切り詰め、超過分は `(+N older — helix memory list harness)` フッタへ
集約する（全文・全件の毎回注入を禁止）。`SurfaceBudget` で上限を注入可能（テスト容易性）。
被覆 = tests/memory/memory-store.test.ts「clips long bodies and caps surfaced entries」。これは
HNFR-AC（同一記憶共有）の運用 NFR（context 予算）面の補強であり、契約の意味は不変（harness 層のみ・秘匿非 surface）。

## §4 後続持ち越し（carry、P9 観測強化、別 add-impl）

- harness.db への loop_iterations[blocked_reason] / jobs / memory 2 表 projection（分析・query）。
- doctor `verifier-provider-mismatch`（loop_iterations 走査）/ `agent-memory-silo`。
- `agent-guard` の BLOCKED_SELF_DELEGATION を `selectVerifier` へ集約（重複排除）。
