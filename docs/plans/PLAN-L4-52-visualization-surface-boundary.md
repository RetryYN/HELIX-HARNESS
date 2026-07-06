---
plan_id: PLAN-L4-52-visualization-surface-boundary
title: "PLAN-L4-52 (add-design): 可視化 view の L4 基本設計 — VSCode extension adapter / Tree View・Webview 境界 / CSP / read-only action 境界"
kind: add-design
layer: L4
drive: fe
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-07 PLAN-L3-12 PO 承認（L3 confirmed）に伴う forward route L4 降下"
created: 2026-07-07
updated: 2026-07-07
backprop_decision: not_required
backprop_decision_reason: "PLAN-L3-12 confirmed（HR-FR-VIS-01..07）の forward route どおりの L4 追加設計。L3 要件・VisualizationSnapshot 契約は変更しない。"
owner: Claude (Fable)
parent_design: docs/design/helix/L3-requirements/visualization-requirements.md
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: uiux
    slot_label: "FE lead (Opus) - extension surface 構成と Webview 境界設計"
  - role: tl
    slot_label: "TL - CSP / read-only / secret 非保持境界のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L4-52-visualization-surface-boundary.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L4-basic-design/visualization-surface-boundary.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L3-12-visualization-requirements.md
  requires:
    - docs/plans/PLAN-L3-12-visualization-requirements.md
  references:
    - docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md
    - src/state-db/visualization-read-model.ts
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
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L4-52-visualization-surface-boundary.md && bun run src/cli.ts plan lint docs/plans/PLAN-L6-58-visualization-view-model.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-07T07:12:00+09:00"
        evidence_path: docs/design/helix/L6-function-design/visualization-view-model.md
        output_digest: "sha256:66da77bd5c7ea369c2f25c34e6bf67fd4fce592b88e903e60b1b3b54d276edfb"
---

# PLAN-L4-52 (add-design): 可視化 view の L4 基本設計

## 0. 目的

PLAN-L3-12 confirmed（HR-FR-VIS-01..07、Project/Harness 2 root、read-only + CLI copy）を、
VSCode extension の基本設計へ降下させる。実装・view-model 関数契約は行わない（L6/L7 後続）。

## 1. スコープ

`docs/design/helix/L4-basic-design/visualization-surface-boundary.md` を新設し、以下を確定する。

1. **extension surface 構成**: Tree View（Project root / Harness root の 2 root）・Webview panel
   （graph / trend / detail）・コマンド（CLI copy のみ）の割り付けと activation events。
2. **data 境界**: extension は `VisualizationSnapshot` JSON（`helix` CLI 経由 or 直接 read-model 呼出）
   のみを読む。LLM 生成・外部 API・書込みを持たない。
3. **Webview 境界**: CSP（default-src 'none' 基調）、`localResourceRoots` 限定、
   postMessage 契約（read-only データ受渡しのみ）、provider transcript / secret / 絶対 path 非保持。
4. **read-only action 境界**: command copy はクリップボードまで。実行導線は置かない
   （action-binding approval 境界、HR-FR-VIS-05 継承）。

## 2. 対象外

- view-model 関数契約・graph IR（L6、後続 PLAN）。
- extension 実装・Webview 実装（L7）。
- `helix web render` 系 slice（PLAN-L7-141）の変更。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): L4 基本設計 doc 起草 + pair test-design 追記（必要分）。
- step 2 (mode: serial): レビュー → 是正 → confirmed。
- step 3 (mode: serial): L6 view-model 契約 PLAN（PLAN-L6-58）着手解禁。

## 4. 受入条件

- L4 設計 doc が §1 の 1..4 を備え、HR-FR-VIS 要件との trace を持つ。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L4-52-visualization-surface-boundary.md` green。
- レビュー evidence 記録後に confirmed（L4 以降は AI 自律、charter §3）。
