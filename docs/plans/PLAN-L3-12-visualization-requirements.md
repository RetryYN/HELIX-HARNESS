---
plan_id: PLAN-L3-12-visualization-requirements
title: "PLAN-L3-12 (add-design): 可視化 view 要件の L3 降下 — Tree View / graph panel / evidence drill-down / read-only 境界の要件・acceptance ID 化（PLAN-DISCOVERY-10 forward route）"
kind: add-design
layer: L3
drive: fe
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-06 view をすすめてくれ（PLAN-DISCOVERY-10 S4 confirmed の forward route L3 降下）"
created: 2026-07-06
updated: 2026-07-07
backprop_decision: not_required
backprop_decision_reason: "PLAN-DISCOVERY-10 S4 confirmed（reuse-with-hardening）の forward route どおりの L3 追加設計。L1 §2.8 / HOT-P9 / VisualizationSnapshot（PLAN-L7-206）は変更せず、その下流要件を追加するのみ。"
owner: Claude (Fable)
parent_design: docs/design/helix/L1-requirements/pillar-requirements.md
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: uiux
    slot_label: "FE lead (Opus) - view 要件の情報設計と分割"
  - role: tl
    slot_label: "TL - read-only / action-binding 境界と正本整合のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L3-12-visualization-requirements.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/visualization-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-07T13:05:00+09:00"
    tests_green_at: "2026-07-06T17:17:15+09:00"
    verdict: approve
    scope: "5 軸レビュー。verdict=approve-with-notes（Critical 0 / Important 2 / Minor 2）: (1) Design/test pair の graph.* 総数と pair フィルタ済み集計の精度不整合 → L6 契約で専用 field 定義と HAC-VIS-02a の集計方法明示に是正。(2) HAC-VIS-04a の view 別 warning 期待が実装（共有 warnings 1 件）と不整合 → 共有 banner 方式へ是正し warnings 拡張を L5/L6 送り。(3) action-binding タプルに timestamp 補完（L1 §2.8 準拠）。(4) inventory 一次確認の注記（2026-07-06 shallow clone 実確認）を追記。全所見反映済み。confirmed 化は PO 承認後（charter §3、L3 は人間承認）。PO 承認 2026-07-07（chat、Harness growth view + Project/Harness 2 root 分割を含む draft を承認）。"
    green_commands:
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L3-12-visualization-requirements.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T17:17:15+09:00"
        evidence_path: docs/design/helix/L3-requirements/visualization-requirements.md
        output_digest: "sha256:cf5230cbdded597aa0bd1f23b1c7b1552cc39b47baaca2c9db44fc276a266b8c"
dependencies:
  parent: docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md
  requires:
    - docs/plans/PLAN-DISCOVERY-10-helix-asset-visualization.md
    - docs/plans/PLAN-L7-206-visualization-read-model-response.md
  references:
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/plans/PLAN-L7-141-web-dashboard-component-derived.md
    - docs/plans/PLAN-REVERSE-343-asset-visualization-fullback.md
---

# PLAN-L3-12 (add-design): 可視化 view 要件の L3 降下

## 起点 signal

- `po_directive:2026-07-06 「view をすすめてくれ」`（本日 chat 指示）。
- 上流決定: `PLAN-DISCOVERY-10` S4 `decision_outcome: confirmed` / `promotion_strategy:
  reuse-with-hardening` / `forward_route: L3 visualization 要件 → L4 UI/data 境界 →
  L6 view-model 契約 → L7 VSCode Tree View/Webview 試作`。本 PLAN はその第 1 段。

## 0. 目的

L1 §2.8（asset/progress visualization 要求）と DISCOVERY-10 の S3/S4 決定
（Tree View first surface / Mermaid 互換 graph IR / read-only + CLI copy まで /
正本 = Markdown・harness.db・relation graph）を、**L3 の view 要件 + acceptance ID**
へ降下させる。実装は行わない（L4 境界 / L6 view-model / L7 試作は後続 PLAN）。

## 1. スコープ

設計正本として `docs/design/helix/L3-requirements/visualization-requirements.md` を新設し、
以下を要件 ID（`HR-FR-VIS-01..` 系）+ acceptance ID（`HAT-VIS-01..` 系、pair test-design へ
1:1 追記）で規定する。

1. **View 別要件**: DISCOVERY-10 候補 View 5 種＋PO 指示（2026-07-07 進捗と成長の両方可視化）による Harness growth view の計 6 種（Layer progress / Design-test pair /
   Relation-dependency / Runtime evidence / Skill-agent telemetry / Harness growth）を Tree View と
   graph/detail panel（Webview）へ割り付け、各 view の正本 source
   （`VisualizationSnapshot` field）と oracle（node/edge 数一致、projection-only 非昇格、
   空 DB cold start の 0 表示）を要件化する。
2. **read-only 境界**: 表示は read-only + CLI command copy まで。command 実行・外部 API・
   設定変更導線は action-binding approval 境界（HNFR-P8 / XR-2）に置く要件を明記。
3. **drill-down 要件**: 各表示要素から evidence path（DB row / docs / CLI）へ戻れる
   deterministic drill-down を要件化（LLM 生成図・要約を正本にしない、L1 §2.8 原則の継承）。
4. **旧 HELIX inventory 突き合わせ**: 旧 HELIX（ai-dev-kit-vscode）の可視化系機能の
   inventory 結果を採用可否台帳（adopt-concept / skip + 理由）として設計 doc に含める
   （inventory-first ルールの実施証跡）。
5. pair: `docs/test-design/helix/L3-pillar-acceptance-test-design.md` へ HAT-VIS 系
   acceptance を 1:1 追記（片肺禁止）。

## 2. 対象外

- VSCode extension / Webview / Tree View の実装（L7）。
- CSP / localResourceRoots / adapter 境界の設計（L4）。
- view-model 関数契約・graph IR 変換の設計（L6）。
- `helix web render`（PLAN-L7-141 系 read-only web UI slice）の変更。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): 旧 HELIX inventory → L3 設計 doc 起草 → pair test-design 追記。
- step 2 (mode: serial): レビュー（code-reviewer、5 軸）→ 是正 → PO 承認（L3 は人間承認、
  charter §3）→ confirmed。
- step 3 (mode: serial): 後続 L4/L6/L7 PLAN の起票解禁。

## 4. 受入条件

- L3 設計 doc が §1 の 1..5 を備え、要件 ID と acceptance ID が pair test-design と 1:1。
- `npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L3-12-visualization-requirements.md` green。
- code-reviewer レビュー（intra_runtime_subagent）の review_evidence + green_commands 記録。
- confirmed 化は PO 承認後（本 PLAN は承認依頼まで）。
