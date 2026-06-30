---
plan_id: PLAN-L7-175-helix-orchestration-memory-impl
title: "PLAN-L7-175 (add-impl): P2/P7 純粋契約コア実装 (orchestration pure fns + memory logic, Codex 分散)"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
review_evidence:
  - reviewer: claude-opus-4-8
    review_kind: cross_agent
    reviewed_at: "2026-06-28T17:00:00+09:00"
    tests_green_at: "2026-06-28T16:58:00+09:00"
    verdict: pass
    worker_model: gpt-5.3-codex
    reviewer_model: claude-opus-4-8
    scope: "純粋契約コア (canResume/evaluateStop/selectVerifier/classifyRecovery + writeMemory/listMemory/surfaceMemory) を Codex(worker) が実装、Claude(reviewer) が契約適合を独立レビュー(生成≠判断)。fail-close・自己評価禁止・secret reject(body 非 echo)・supersede・harness-only surface を確認。U-ORCH-001/002/003/005 + U-MEM-001/002/003 Red→Green。U-ORCH-004(tick)/U-ORCH-006(job-queue) は follow-up add-impl へ carry (it.todo 維持)。"
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/orchestration tests/memory"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28T16:58:00+09:00"
        evidence_path: tests/orchestration/orchestration.test.ts
        output_digest: "sha256:27d21f17db9adbeac47bd7d1894214c45c679ef657d7a5ddc9e06ab55a39ab1c"
      - kind: unit_test
        command: "bun run vitest run tests/memory"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28T16:58:00+09:00"
        evidence_path: tests/memory/memory.test.ts
        output_digest: "sha256:90f4a45ff76f85c33db90d1d022c6bcc7257ca001e1b0f14cb5c4080e6b00e5e"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-28T16:58:00+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:290e679c492d7c229373061b313ab332394da783b08c9eff85bbb81275f96afc"
agent_slots:
  - role: se
    slot_label: "SE — Codex 実装 worker (writable, hybrid)"
  - role: tl
    slot_label: "TL — cross-runtime review (Claude が Codex 実装を判断)"
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-175-helix-orchestration-memory-impl.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-175-helix-orchestration-memory.md
    artifact_type: markdown_doc
  - artifact_path: src/orchestration/loop-state.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/loop-stop-rules.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/cross-verifier.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/loop-recovery.ts
    artifact_type: source_module
  - artifact_path: src/orchestration/loop-runner.ts
    artifact_type: source_module
  - artifact_path: src/memory/memory-types.ts
    artifact_type: source_module
  - artifact_path: src/memory/index.ts
    artifact_type: source_module
dependencies:
  parent: PLAN-L6-50-helix-orchestration-memory
  requires:
    - PLAN-L6-50-helix-orchestration-memory
    - PLAN-REVERSE-175-helix-orchestration-memory
  references:
    - docs/design/helix/L6-function-design/orchestration-memory.md
    - docs/test-design/helix/orchestration-memory.md
    - src/state-db/projection-writer.ts
    - src/schema/harness-db-tables-core.ts
---

# PLAN-L7-175 (add-impl): P2/P7 純粋契約コア実装

## §0 役割 / mode

凍結済み L6 機能設計（PLAN-L6-50）の **純粋契約関数**を TS/Bun 実装する add-impl。**Codex を実装 worker、
Claude を cross-runtime reviewer**（生成≠判断、hybrid 分散で main budget 節約）。対の Reverse=PLAN-REVERSE-175
（L3 要件 back-fill）。原則: 仕組み=harness 上 / 機能=旧 HELIX 上、ADR-001 TS/Bun、P8 外部バイナリ不採用。

> **スコープ確定**: DB を持たない純粋契約コアに限定。DB 連動部（`job-queue`/`loop-runner.tick`/schema 4 表 +
> projection + `nodeMemoryDeps`/cli memory/doctor 2 gate/agent-guard・asset-drift 改修）は **follow-up add-impl
> （PLAN-L7-176 予定）へ carry**。本 PLAN は純粋ロジックの確定で 1 つの coherent な green 単位を成す。

## §1 実装単位（本 PLAN 範囲 = 実装済み・verified）

| module | 契約関数 | oracle |
|--------|----------|--------|
| `src/orchestration/loop-state.ts` | LoopState/StopRule 等の型 + fail-close 定義 | (型基盤) |
| `src/orchestration/loop-stop-rules.ts` | `evaluateStop`（欠落/未知 fail-close） | U-ORCH-002 |
| `src/orchestration/cross-verifier.ts` | `selectVerifier`（自己評価禁止） | U-ORCH-003 |
| `src/orchestration/loop-recovery.ts` | `classifyRecovery`（C1-C4） | U-ORCH-005 |
| `src/orchestration/loop-runner.ts` | `canResume`（4 述語 AND）。`tick` は carry | U-ORCH-001 |
| `src/memory/memory-types.ts` | MemoryEntry/MemoryLayer/MemoryDeps（注入抽象） | (型基盤) |
| `src/memory/index.ts` | `writeMemory`/`listMemory`/`surfaceMemory`（secret reject / supersede / harness-only surface） | U-MEM-001/002/003 |

## §2 進め方（TDD Red-first / Codex 分散・実施済）

1. test-design の oracle を `it.todo` から実テスト（Red）へ展開（import 未実装で失敗を確認）。
2. chunk を **writable Codex（`ut-tdd codex --execute`）へ委譲** → design 準拠で実装し Red→Green。
3. Claude が **cross-runtime review**（契約適合をコード精読、green だけで信用しない）。

## §3 DoD（達成）

- [x] 7 module 実装、U-ORCH-001/002/003/005 + U-MEM-001/002/003 が Red→Green。
- [x] fail-close（未知 reason・欠落フィールド）/ 自己評価禁止（hybrid worker≠verifier）/ secret reject（body 非 echo）を契約どおり実装。
- [x] `bun run vitest run tests/orchestration tests/memory` / `typecheck` / `biome` green、cross-runtime review 証跡（green_commands + 実 digest）。
- [x] Reverse(PLAN-REVERSE-175) の L3 要件 back-fill (HR-BR-07/HR-BR-12/HR-NFR-03) と両 confirm（pair-freeze 完了、IMP-043）。

## §4 carry（follow-up add-impl PLAN-L7-176 予定）

- `job-queue`（BEGIN IMMEDIATE、U-ORCH-006）/ `loop-runner.tick`（hybrid fail-close、U-ORCH-004）。
- DB 4 表 + SCHEMA_VERSION bump + `projection-writer` 改修 + `nodeMemoryDeps`（実 2 層投影）。
- `cli` memory subcommand / doctor `verifier-provider-mismatch`・`agent-memory-silo` / `agent-guard`・`asset-drift` 改修。
- 要件 back-fill（BR-07/BR-12/NFR-03）は PLAN-REVERSE-175。常駐スケジューラは improvement-backlog。
