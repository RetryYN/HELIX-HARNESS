---
plan_id: PLAN-L6-54-plan-descent-gate
title: "PLAN-L6-54 (add-design): plan-descent gate の機能設計 — 実装 PLAN の L7 直行起票を fail-close で封じる（PO 指摘 2026-07-06）"
kind: add-design
layer: L6
drive: agent
master_hub: true
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "FR-L1-03（V字双方向 trace / 抜け漏れ検出）の既存要求を PLAN 起票経路へ降下させる L6 機能設計。descent-obligation（PLAN-L6-35）の absence-blindness の PLAN 起票版を埋めるもので、新規 L1/L3 要求は追加しない。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/descent-obligation.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE - L6 機能設計（ratchet contract / oracle 定義）"
  - role: tl
    slot_label: "TL - grandfather baseline 方式と対象 kind 境界のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-54-plan-descent-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/plan-descent-gate.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-35-descent-obligation.md
  requires:
    - docs/plans/PLAN-L6-35-descent-obligation.md
  references:
    - docs/plans/PLAN-L7-341-coding-debt-reduction-roadmap.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-07T00:20:00+09:00"
    tests_green_at: "2026-07-07T00:20:00+09:00"
    verdict: approve
    scope: "L6 plan-descent gate 設計の contract / oracle / baseline 方針を確認。実装は PLAN-L7-347 へ降下する。"
    worker_model: claude-fable
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-07T00:20:00+09:00"
        evidence_path: docs/design/harness/L6-function-design/plan-descent-gate.md
        output_digest: "sha256:c03461782be10ce9bfb0e44f1c13fca74589a453ab5257603e8db3607a6cd0a9"
---

# PLAN-L6-54 (design): plan-descent gate の機能設計

## 0. 目的（PO 指摘 2026-07-06 の機械化）

PO 指摘: 「L7 からプランを組むのはおかしい。実装から後付けしているだけでシステムとして
根本意味がない。AI がその起票の仕方をできること自体がシステムの不完全さを物語っている」。

PO 規則（同日確定）: **L6（機能設計）+ test-design pair ⇒ L7（実装）は必須**。実装起点の
発見は kind=impl で直接起票せず、DISCOVERY（design-bottomup mode、PLAN-DISCOVERY-07）
または reverse 系で起票して L6 → L7 へ降下する。

事実確認済みの欠陥: plan-governance の `parent_design` 検査は path 存在のみで、
(a) parent_design 省略、(b) 別 PLAN への親付け、(c) pair_artifact の未検査、いずれも
素通りする。descent-obligation（PLAN-L6-35）は trace key 駆動の freeze 時検査で、
PLAN 起票経路を見ない。このため上位モデルの注意力に依存しないと設計降下が守られず、
下位モデル運用では必ず崩れる。**harness が工程を機械強制すること自体が
「下位モデルで Mythos 級」の前提**である。

設計正本: `docs/design/harness/L6-function-design/plan-descent-gate.md`
（contract: `analyzePlanDescent`（L6 親 + test-design pair の二重検査）/ grandfather
baseline + ratchet（新規 PLAN には不適用）/ confirm 時の設計 confirmed 必須
（`parent_design_not_confirmed`）/ 実装 PLAN の test_code 資産必須
（`generates_missing_test_code`、ドキュメント・検証資産に残らない実装の起票拒否）/
doctor では `plan-descent` gate として実行し、検査 oracle は U-PDESC-001..010 とする）。

## 1. 受入条件

- L6 設計 doc が §1 範囲 / §2 contract / §3 配線 / §4 test oracle を備え、
  oracle ID（U-PDESC-001..010）が実装 PLAN（PLAN-L7-347）のテストと 1:1 対応する。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L6-54-plan-descent-gate.md` green。
- 実装は本 PLAN では行わない（実装・baseline 生成・doctor 配線は PLAN-L7-347 が担う）。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): L6 設計 doc 起草 → レビュー → confirm。
- step 2 (mode: serial): PLAN-L7-347 の実装解禁（design confirm 後）。
