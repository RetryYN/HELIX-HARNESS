---
plan_id: PLAN-L6-51-effort-observation
title: "PLAN-L6-51 (add-design): effort 観測供給と全経路配線の機能設計 — 下位モデル底上げのための effort ladder 未配線 3 箇所の閉塞設計"
kind: add-design
layer: L6
drive: agent
master_hub: true
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-310/311 で確定済みの effort registry / selectTeamModel 配線設計を runtime 全経路へ適用する L6 機能設計。新規 L1/L3 要求は追加しない（既存設計の降下完全性を埋める）。"
owner: Claude (Fable)
parent_design: docs/design/harness/L5-detailed-design/internal-processing.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE - L6 機能設計（contract / oracle 定義）"
  - role: tl
    slot_label: "TL - L7-310/311 既存設計との整合・後方互換境界レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-51-effort-observation.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/effort-observation.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/plans/PLAN-L7-310-model-standard-effort-adaptive.md
    - docs/plans/PLAN-L7-311-model-effort-runtime-wiring.md
  references:
    - docs/plans/PLAN-REVERSE-214-loop-effort-budget.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-07T00:20:00+09:00"
    tests_green_at: "2026-07-07T00:20:00+09:00"
    verdict: approve
    scope: "L6 effort observation 設計と L7 実装 oracle の対応を確認。標準 L6 sub_doc とは重複させず、個別補助設計ハブとして confirmed 化する。"
    worker_model: claude-fable
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/effort-observation.test.ts tests/orchestration/loop-bridge.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-07T00:20:00+09:00"
        evidence_path: tests/effort-observation.test.ts
        output_digest: "sha256:b9370d0b2153f5b997f3b7d32742094ab9d8548254c8de81207a688dcb335105"
---

# PLAN-L6-51 (design): effort 観測供給と全経路配線の機能設計

## 0. 目的

2026-07-06 検査で、PLAN-L7-310/311 の effort ladder が runtime 3 経路（observation 供給 /
codex effort フラグ / pair-agent effort）で未配線であることを確認した。実装（L7）へ降りる前に、
関数 contract・定数・fail 挙動・test oracle を L6 機能設計として確定する。

設計正本: `docs/design/harness/L6-function-design/effort-observation.md`
（contract: `deriveEffortObservation` / `buildTeamRunPlan(observations?)` / `CODEX_EFFORT_FLAG` /
pair-agent への `standardEffortForModel` 付与。oracle: U-EFF-001..009）。

## 1. 受入条件

- L6 設計 doc が §1 範囲 / §2 contract / §3 runtime 挙動 / §4 test oracle を備え、
  oracle ID（U-EFF-001..009)が L7 実装 PLAN（PLAN-L7-343）のテストと 1:1 対応する。
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L6-51-effort-observation.md` green。
- 実装は本 PLAN では行わない（実装・検証は PLAN-L7-343 が担う）。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): L6 設計 doc 起草 → レビュー → confirm。
- step 2 (mode: serial): PLAN-L7-343 の実装解禁（design confirm 後）。
