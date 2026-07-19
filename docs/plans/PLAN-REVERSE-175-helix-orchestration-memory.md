---
plan_id: PLAN-REVERSE-175-helix-orchestration-memory
title: "PLAN-REVERSE-175: P2 orchestration + P7 memory の L3 要件 back-fill (route B fullback)"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-28
updated: 2026-06-28
owner: AIM + TL
forward_routing: L3
promotion_strategy: reuse-as-is
review_evidence:
  - reviewer: claude-opus-4-8
    review_kind: cross_agent
    reviewed_at: "2026-06-28T17:05:00+09:00"
    tests_green_at: "2026-06-28T16:58:00+09:00"
    verdict: pass
    worker_model: gpt-5.3-codex
    reviewer_model: claude-opus-4-8
    scope: "PLAN-L7-175 純粋契約コアの実体から L3 要件 (HR-BR-07 loop-eng / HR-BR-12 2層メモリ / HR-NFR-03 hybrid 自己評価禁止) を back-fill。実装と受入 oracle (U-ORCH-001/002/003/005 + U-MEM-001/002/003) に 1:1 対応。DB 連動部は scope 外明示で follow-up へ carry。"
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/orchestration tests/memory"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28T16:58:00+09:00"
        evidence_path: docs/design/helix/L3-requirements/orchestration-memory.md
        output_digest: "sha256:9c88351f237d00c809f2cf7796fa30942f0ee2c3ad071842e719861551ccca5c"
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/design/helix/L3-requirements/orchestration-memory.md
    reason: "Add-feature route B fullback: 先行 build した純粋契約コア (PLAN-L7-175) の L3 要件を HR-BR-07 / HR-BR-12 / HR-NFR-03 として明文化。実装・受入 oracle と 1:1。DB 連動要件は follow-up add-impl へ carry (本 back-fill 範囲外を明示)。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "本 add-feature は L6 機能設計 (PLAN-L6-50) で外部設計済。L4 基本設計の外部 IF は変えない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "詳細設計は L6 function-design に内包。独立 L5 改訂は不要。"
agent_slots:
  - role: tl
    slot_label: "TL — route B fullback の L3 要件 back-fill レビュー"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-175-helix-orchestration-memory.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/orchestration-memory.md
    artifact_type: design_doc
dependencies:
  parent: PLAN-L6-50-helix-orchestration-memory
  requires:
    - PLAN-L7-175-helix-orchestration-memory-impl
  references:
    - docs/plans/PLAN-L6-50-helix-orchestration-memory.md
    - docs/plans/PLAN-L1-06-helix-solo-conversion.md
---

# PLAN-REVERSE-175: P2 orchestration + P7 memory の L3 要件 back-fill

## §0 位置づけ（route B fullback）

Add-feature route B（bottom-up）の Reverse 対。先行 build（PLAN-L7-175 add-impl）で確定した
P2 hybrid orchestration / P7 共有メモリの実体から、**L3 要件を後追いで back-fill** する
（`forward_routing=L3`）。要件後追いは Add-feature の常態（IMP-043: 先行 build 許容、trace 確定は
本 Reverse の G3 pair-freeze 後）。

## §1 back-fill 対象（確定、`docs/design/helix/L3-requirements/orchestration-memory.md`）

- **HR-BR-07 (loop-engineering)**: `canResume`/`evaluateStop`/`classifyRecovery` の決定ロジックを要件化（U-ORCH-001/002/005）。
- **HR-BR-12 (2 層共有メモリ)**: harness/project 層、supersede 履歴非破壊、harness-only surface（U-MEM-001/002/003）。
- **HR-NFR-03 (hybrid 自己評価禁止)**: `selectVerifier` で verifier≠worker、secret reject（U-ORCH-003 + U-MEM-001）。

> 要件 ID は HELIX 名前空間（`HR-`）で harness BR/NFR registry と非衝突。DB 連動要件は follow-up へ carry。
> solo 変換 PLAN-L1-06 と整合（L1 = 機能エリア、本 Reverse = L3 機能ユニット要件）。

## §工程表（R0→R4、完了）

- R0: 起票。— 進捗: ✅
- R1: add-impl（PLAN-L7-175 純粋契約コア）実体から L3 要件を逆生成。— 進捗: ✅
- R2: 既存 requirements と整合（HR- 名前空間で非衝突、DB 連動は scope 外明示）。— 進捗: ✅
- R3: ① L3 要件 ⇔ ③ 受入 oracle（U-ORCH/U-MEM）を 1:1 pair-freeze（G3）。— 進捗: ✅
- R4: Forward merge（add-impl PLAN-L7-175 と両 confirm）。— 進捗: ✅
