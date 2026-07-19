---
plan_id: PLAN-L6-58-visualization-view-model
title: "PLAN-L6-58 (add-design): 可視化 view-model の L6 機能設計 — 6 view の view-model 関数契約 / Mermaid 互換 graph IR / 時系列 growth 集計 field"
kind: add-design
layer: L6
drive: fe
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-07 PLAN-L3-12 PO 承認（L3 confirmed）に伴う forward route L6 降下"
created: 2026-07-07
updated: 2026-07-07
backprop_decision: not_required
backprop_decision_reason: "PLAN-L3-12 confirmed の forward route どおりの L6 追加設計。VisualizationSnapshot 既存 field の意味は変えず、L3 が L6 送りにした field（pair フィルタ済み count / warnings 拡張 / growth 時系列）を契約として新設する。"
owner: Claude (Fable)
parent_design: docs/design/helix/L3-requirements/visualization-requirements.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: uiux
    slot_label: "FE lead (Opus) - view-model 契約と graph IR 設計"
  - role: se
    slot_label: "SE - snapshot 拡張 field / 時系列集計の oracle 定義"
generates:
  - artifact_path: docs/plans/PLAN-L6-58-visualization-view-model.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L6-function-design/visualization-view-model.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L3-12-visualization-requirements.md
  requires:
    - docs/plans/PLAN-L3-12-visualization-requirements.md
  references:
    - docs/plans/PLAN-L4-52-visualization-surface-boundary.md
    - src/state-db/visualization-read-model.ts
    - docs/plans/PLAN-L7-206-visualization-read-model-response.md
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-07T07:20:00+09:00"
    tests_green_at: "2026-07-07T07:12:00+09:00"
    verdict: approve_after_fixes
    worker_model: claude-opus (fe-lead)
    reviewer_model: claude-sonnet-5
    scope: "5 軸レビュー verdict=approve-with-notes（Critical 0 / Important 2 / Minor 1）。Important: (1) 生 node/edge リスト非提供の gap を §2 該当行へ直接明記（honest degrade + snapshot 拡張 escalation 待ち）、(2) U-VVM-006 の growth/drill-down 混在を U-VVM-007 分離で是正。Minor: graph.latest_snapshot_* 省略表記を実 field 4 種の列挙へ置換（L3/L4/L6 横断）。全所見 fe-lead が反映済み、CSP・read-only・secret 非保持は L3/L4/L6 で一貫。"
    green_commands:
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L4-52-visualization-surface-boundary.md && npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L6-58-visualization-view-model.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-07T07:12:00+09:00"
        evidence_path: docs/design/helix/L6-function-design/visualization-view-model.md
        output_digest: "sha256:66da77bd5c7ea369c2f25c34e6bf67fd4fce592b88e903e60b1b3b54d276edfb"
---

# PLAN-L6-58 (add-design): 可視化 view-model の L6 機能設計

## 0. 目的

L3（HR-FR-VIS-01..07）と L4 surface 境界を、実装可能な view-model 関数契約へ降下させる。
L3 が L6 送りにした 3 点（pair フィルタ済み count field / 空状態 warnings 拡張 /
Harness growth 時系列集計 field）をここで契約化する。

## 1. スコープ

`docs/design/helix/L6-function-design/visualization-view-model.md` を新設し、以下を確定する。

1. **view-model 関数契約**: 6 view（Project root 4 + Harness root 2）それぞれの
   `VisualizationSnapshot -> ViewModel` 純関数契約（入力 field、出力 shape、oracle）。
2. **Mermaid 互換 graph IR**: Relation/dependency と Design/test pair orphan graph の
   node/edge IR（deterministic 生成、count 一致 oracle、cycle 表示）。
3. **snapshot 拡張 field**: pair edge フィルタ済み count、view 別空状態 warnings、
   Harness growth 時系列 series（snapshot 履歴 / evidence timestamp 由来、補間禁止・「記録なし」表現）。
4. **drill-down 契約**: 各 ViewModel row から `drilldowns` pointer への deterministic 経路。
5. pair: `docs/test-design/harness/L7-unit-test-design.md` へ unit test design を 1:1 追記。

## 2. 対象外

- VSCode extension / Webview 実装（L7）。
- harness.db schema 変更（既存 projection の query-only 読取で賄えない場合は要 escalate）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): L6 設計 doc + L7 unit test design pair 追記。
- step 2 (mode: serial): レビュー → 是正 → confirmed。
- step 3 (mode: serial): L7 実装 PLAN（Tree View prototype → Webview graph panel）起票解禁
  （plan-descent gate: 本 L6 pair が前提）。

## 4. 受入条件

- L6 設計 doc が §1 の 1..5 を oracle 付きで規定し、pair test-design と 1:1。
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L6-58-visualization-view-model.md` green。
- レビュー evidence 記録後に confirmed（L4 以降は AI 自律、charter §3）。
