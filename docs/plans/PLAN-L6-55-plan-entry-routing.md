---
plan_id: PLAN-L6-55-plan-entry-routing
title: "PLAN-L6-55 (add-design): plan-entry routing gate の機能設計 — 起票タイプ（mode/kind/drive）の機械選定と Issue/signal 起点の必須化（PO 指摘 2026-07-06）"
kind: add-design
layer: L6
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T16:16:00+09:00"
    tests_green_at: "2026-07-06T16:15:45+09:00"
    verdict: approve
    scope: "2 巡レビュー。初回 reject（signal→kind 整合経路欠落 / reason enum 不整合 / スコープ未定義 / test-design 逆参照欠落）→ 全所見反映（signal 種別確定アルゴリズム、MODE_ALLOWED_KINDS SSoT、reason 5 種、U-PROUTE-001..012、除外スコープ、refactor_candidate token 追加、SIGNAL_KIND_ROUTING 二重表削除）→ 再判定 approve-with-notes、残 notes 2 件も反映済み。実装は PLAN-L7-352 へ降下する。"
    green_commands:
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L6-55-plan-entry-routing.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T16:15:45+09:00"
        evidence_path: docs/design/harness/L6-function-design/plan-entry-routing.md
        output_digest: "sha256:3accdb1af91074191877cf88ce3a6c1590e18822589f1a283b2fe92eae4d4c68"
backprop_decision: not_required
backprop_decision_reason: "modes README §4 の signal→mode routing（機械化目標）と requirements §6.8 の signal→Issue→PLAN 一本道を PLAN 起票経路へ降下させる L6 機能設計。routing 表・kind 体系そのものは変更しない。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/plan-descent-gate.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE - L6 機能設計（entry_signals contract / routing 整合 oracle）"
  - role: tl
    slot_label: "TL - routeSignalToMode 再利用と grandfather 境界のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-55-plan-entry-routing.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/plan-entry-routing.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-54-plan-descent-gate.md
  requires:
    - docs/plans/PLAN-L6-54-plan-descent-gate.md
  references:
    - docs/process/modes/README.md
    - docs/plans/PLAN-L7-322-harness-quality-tooling-backlog.md
---

# PLAN-L6-55 (add-design): plan-entry routing gate の機能設計

## 0. 目的（PO 指摘 2026-07-06 の機械化・第 2 弾）

PO 指摘: 「（refactor は）kind=refactor で正しいが Issue 起点が欠落」「駆動モデルが正しく
選ばれないのがそもそも穴」。plan-descent gate（PLAN-L6-54、L6+L8⇒L7 強制）に続き、
**起票タイプ（mode/kind/drive）の選定と起点（signal/Issue）宣言を機械強制**する。

実証済みの穴: `helix task classify` は性能改善タスクに kind=unknown を返し、
`routeSignalToMode`（`src/workflow/routing-contracts.ts`）は PLAN lint に未配線で、
signal 起点なしの直接起票が素通りする。

上流見本（UT-TDD_AGENT-HARNESS-Pack、2026-07-06 調査）の **route certificate 様式**を採用する:
`route_mode` frontmatter 宣言正本 + `workflowModeForPlan` フォールバック連鎖
（`src/schema/mode-catalog.ts`）+ `ROUTE_SIGNAL_MAP`（`src/schema/route-map.ts`）。
これは HELIX 既存 backlog `PLAN-L7-322`（route certificate、confirmed・未着手）の実行設計を兼ねる。

設計正本: `docs/design/harness/L6-function-design/plan-entry-routing.md`
（contract: `route_mode` + `entry_signals` frontmatter / mode-catalog（`MODE_ALLOWED_KINDS` 含む）・
route-map の上流様式移植 / `analyzePlanEntryRouting`（reason 5 種の fail-close、
grandfather baseline + ratchet）/ classify lexicon の perf 系追加。oracle: U-PROUTE-001..012）。

## 1. 受入条件

- L6 設計 doc が §1 範囲 / §2 contract（signal 種別確定アルゴリズム・`MODE_ALLOWED_KINDS`・
  reason enum 5 種・検査対象スコープと除外を含む）/ §3 配線 / §4 test oracle を備え、
  oracle ID（U-PROUTE-001..012）が実装 PLAN（PLAN-L7-352）のテストと 1:1 対応する。
- `docs/test-design/harness/L7-unit-test-design.md` の「L6 追加設計 reverse reference」表へ
  `plan-entry-routing.md | U-PROUTE-001..012` 行を追加する（`l6-completion` gate の凍結入力）。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L6-55-plan-entry-routing.md` green。
- 実装は本 PLAN では行わない（実装・baseline 生成・schema 追加・配線は PLAN-L7-352 が担う）。

## 2. スケジュール（schedule steps）

- step 1 (mode: serial): L6 設計 doc 起草 → レビュー → confirm。
- step 2 (mode: serial): PLAN-L7-352 の実装解禁（design confirm 後）。
