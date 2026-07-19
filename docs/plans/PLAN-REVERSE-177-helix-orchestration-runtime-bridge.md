---
plan_id: PLAN-REVERSE-177-helix-orchestration-runtime-bridge
title: "PLAN-REVERSE-177: P2 runtime bridge (tick→実ランタイム配線 + loop entrypoint) の L3 要件 back-fill"
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
    reviewed_at: "2026-06-28T20:05:00+09:00"
    tests_green_at: "2026-06-28T20:00:00+09:00"
    verdict: pass
    worker_model: gpt-5.3-codex
    reviewer_model: claude-opus-4-8
    scope: "PLAN-L7-177 bridge 実体から L3 要件 HR-BR-13R/14R を back-fill。受入 U-ORCH-BRIDGE-01/02 に 1:1。tick の selectVerifier 委譲・loop entrypoint・harness.db projection は P9 carry 明示。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/orchestration"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-28T20:00:00+09:00"
        evidence_path: docs/design/helix/L3-requirements/orchestration-runtime-bridge.md
        output_digest: "sha256:315afb56ea9cee0ae1ee5111afd8f55e132f7a3de43db92f27d125355139b01c"
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/design/helix/L3-requirements/orchestration-runtime-bridge.md
    reason: "Add-feature route B fullback: runtime bridge (nodeTickDeps 実 adapter 配線 + helix loop entrypoint) の L3 要件を back-fill。受入 U-ORCH-BRIDGE-01/02 に 1:1。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "L6 機能設計 (PLAN-L6-50) の tick 契約を変えない。bridge は既存 adapter 実行面を tick に接続する配線。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "詳細は L6 function-design に内包。"
agent_slots:
  - role: tl
    slot_label: "TL — runtime bridge back-fill レビュー"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-177-helix-orchestration-runtime-bridge.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/orchestration-runtime-bridge.md
    artifact_type: design_doc
dependencies:
  parent: PLAN-L6-50-helix-orchestration-memory
  requires:
    - PLAN-L7-177-helix-orchestration-runtime-bridge
  references:
    - docs/plans/PLAN-L7-176-helix-orchestration-memory-runtime.md
---

# PLAN-REVERSE-177: P2 runtime bridge の L3 要件 back-fill

Add-feature route B の Reverse 対。PLAN-L7-177（runtime bridge: tick を実 Codex/Claude adapter へ配線 +
`helix loop` entrypoint）の実体から L3 要件を後追いで back-fill する（forward_routing=L3）。純粋契約コア
（PLAN-L7-175/176）の上に「実起動可能」を足した差分を L3 要件として明文化する。

## §工程表（R0→R4）

- R0: 起票。— 進捗: ✅
- R1: PLAN-L7-177 bridge 実体から L3 要件逆生成（HR-BR-13R 実 dispatch 配線 / HR-BR-14R loop run entrypoint）。— 進捗: ✅
- R2: 既存 requirements と整合（HR- 名前空間、harness.db 投影は carry 明示）。— 進捗: ✅
- R3: ① L3 要件 ⇔ ③ 受入（U-ORCH-BRIDGE-01/02）1:1 pair-freeze。— 進捗: ✅
- R4: Forward merge（add-impl PLAN-L7-177 と両 confirm、dual-confirm）。— 進捗: ✅
