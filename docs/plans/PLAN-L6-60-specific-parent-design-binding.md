---
plan_id: PLAN-L6-60-specific-parent-design-binding
title: "PLAN-L6-60 (add-design): specific parent design binding — L7 を設計棚卸し doc にしない追加 gate"
kind: add-design
layer: L6
drive: agent
status: draft
created: 2026-07-08
updated: 2026-07-08
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-08:L7-plan-used-as-design-doc"
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-54 plan-descent gate の穴を塞ぐ L6 追加設計。新規 L1/L3 要求ではなく、既存 V-model forward descent の機械強制を具体化する。"
owner: Codex
parent_design: docs/design/harness/L6-function-design/plan-descent-gate.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE - specific parent design binding / lint contract"
  - role: tl
    slot_label: "TL - V-model forward descent boundary"
generates:
  - artifact_path: docs/plans/PLAN-L6-60-specific-parent-design-binding.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-54-plan-descent-gate.md
  requires:
    - docs/plans/PLAN-L6-54-plan-descent-gate.md
  references:
    - docs/governance/helix-awesome-agent-catalog-reconciliation-audit-2026-07-07.md
    - docs/plans/PLAN-L7-347-plan-descent-gate-impl.md
---

# PLAN-L6-60 (add-design): specific parent design binding

## 0. 目的

外部 agent catalog 監査で、L7 impl PLAN が `pillar-function-design.md` のような汎用 L6 doc を parent にし、
実質的な採用判断・境界・受入条件を L7 本文へ置ける穴が露出した。

L7 は実装スプリントであり、採用候補の意味・境界・契約は L3-L6 の Forward 設計へ降下してから L7 に入る。
本 PLAN は `PLAN-L6-54` の plan-descent gate を拡張し、「L6 parent が存在するだけ」ではなく
「機能固有の親 design contract に bound されている」ことを追加契約として設計する。

## 1. スコープ

- `docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md` を新設する。
- 汎用 parent design による L7 量産を検出する lint contract を定義する。
- 外部 source 監査の採用候補は L7 実装 ready ではなく、research / add-design / audit finding / backlog へ置く route を明記する。
- 今回の `PLAN-L7-361..384` は採用候補棚卸しとして残すが、実装着手前に L3-L6 降下が必要な forward descent debt として扱う。

## 2. 対象外

- 本 PLAN では lint 実装を行わない。
- 既存 L7 PLAN を一括改名・削除しない。
- 外部 source の code import、credential、外部 write は行わない。

## 3. 受入条件

- L6 design doc が §1 範囲 / §2 contract / §3 reason / §4 test oracle を持つ。
- `PLAN-L6-54` の既存 plan-descent gate と衝突せず、追加 gate として実装可能である。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L6-60-specific-parent-design-binding.md` が green。
- `bun run src/cli.ts plan lint --gate governance` が green。

## 4. スケジュール

- step 1 (mode: serial): L6 設計 doc と PLAN 起票。
- step 2 (mode: serial): 既存外部 catalog L7 PLAN 群を forward descent debt として audit に記録。
- step 3 (mode: serial): 後続 L7 実装 PLAN で lint / doctor gate を追加する。
