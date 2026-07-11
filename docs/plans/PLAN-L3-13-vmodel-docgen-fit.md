---
plan_id: PLAN-L3-13-vmodel-docgen-fit
title: "PLAN-L3-13 (add-design): ハイブリッド設計ドキュメントv1-fixed.zip 適合構想と L12 駆動モデル再設計"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-08 ハイブリッド設計ドキュメントv1-fixed.zip をベースに、機能設計を軽量化し L12 Vモデルへ再構築する"
created: 2026-07-08
updated: 2026-07-09
backprop_decision: not_required
backprop_decision_reason: "既存 P9 は DB 収束・強い検証・可視化を既に要求している。本 PLAN は ZIP の L12/typed spec/impact/tailoring を HELIX 側へ additive に取り込む構想であり、L0 は V 字成立のためのスライド調整対象として扱う。"
owner: Codex / TL
parent_design: docs/design/helix/L3-requirements/pillar-functional-requirements.md
pair_artifact: docs/test-design/helix/vmodel-docgen-fit-acceptance.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - ZIP の構造理解、HELIX との差分、L12 化の境界判断"
  - role: qa
    slot_label: "QA - typed spec / impact / current-location / drive-model の受入観測化"
  - role: docs
    slot_label: "Docs - 日本語設計正本と trace の整備"
generates:
  - artifact_path: docs/plans/PLAN-L3-13-vmodel-docgen-fit.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/vmodel-docgen-fit-acceptance.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L3-00-master.md
  requires:
    - docs/design/helix/L0-charter/helix-charter_v0.1.md
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/design/helix/L3-requirements/visualization-requirements.md
    - docs/process/forward/overview.md
  blocks: []
  references:
    - ハイブリッド設計ドキュメントv1-fixed.zip
    - docs/design/helix/L3-requirements/vmodel-docgen-fit.md
    - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
    - docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md
    - docs/test-design/helix/vmodel-docgen-fit-acceptance.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T21:05:00+09:00"
    tests_green_at: "2026-07-09T21:05:00+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "ハイブリッド設計ドキュメントv1-fixed.zip の L12 V+Scrum 適合構想、採用マトリクス、solo tailoring、acceptance pair を confirmed 化する。PO は ZIP 方針の導入を承認済みで、実装変更は後続 L7 PLAN に分離する。"
    green_commands:
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L3-13-vmodel-docgen-fit.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T21:02:00+09:00"
        evidence_path: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
        output_digest: "sha256:1f03aef46fb7eb35543972ce7c77266ad167ec937ec6a8b2c50423bacba217f0"
---

# PLAN-L3-13: ハイブリッド設計ドキュメントv1-fixed.zip 適合構想

## §0 目的

`ハイブリッド設計ドキュメントv1-fixed.zip` の狙いを、HELIX の設計カバレッジ、設計と実装のデグレ対策、DB projection、
VSCode view、工程表、駆動モデルへ統合する。直接置換ではなく、ZIP の強みを HELIX の既存強みに従属させる。

本 PLAN の成果は L3 の構想・要件化であり、L番号 schema、DB migration、VSCode extension 実装は後続 PLAN へ送る。
L3 は人間承認境界のため、PO の導入承認と review evidence を確認して `confirmed` とする。

## §1 調査証跡

| 照合先 | 確認日 | 範囲 | 結論 |
|--------|--------|------|------|
| `ハイブリッド設計ドキュメントv1-fixed.zip` | 2026-07-08 | 703 entries、YAML 208、Markdown 161、XLSX 263、PNG 26、tools 29 | 採用対象。L12 レベル定義、typed spec、impact、tailoring、工程表、Scrum運営層、spec gate を設計概念として採る |
| ZIP `docs/107_Vモデル・レベル定義.yaml` | 2026-07-08 | L1-L12、release milestone、TDD closure、運用テスト | 採用対象。現 HELIX の L0 は V 字成立のためのスライド調整として扱い、ZIP の設計カバレッジに従って L12 へ再投影する |
| ZIP `docs/99_型付きスペック・自動検出設計書.yaml` | 2026-07-08 | `spec.defines` / typed declarations / heuristic 廃止 | 採用対象。ただし Python runtime は持ち込まず TS/Bun core で再実装 |
| ZIP `tools/spec_check.py` / `tools/spec_types.py` | 2026-07-08 | impact、live status、型付き宣言検査 | 採用対象は oracle と出力契約。実装言語は TS/Bun |
| 現行 HELIX `VisualizationSnapshot` / view-model | 2026-07-08 | harness.db read-model、runtime evidence、drill-down、read-only view | 維持対象。ZIP 単体には弱い DB projection / runtime evidence / VSCode 動的可視化を補う |
| 現行 HELIX roadmap registry | 2026-07-08 | program bands、parked bands、L7 feature pack coverage | 維持・拡張対象。工程表と harness.db の現在地を結び、いまの場所を確定する |

## §2 工程表

1. [直列] ZIP 構造を理解し、採用する概念と採用しない実装を分離する。
2. [直列] 現行 HELIX の L0-L14、DB projection、VSCode view、roadmap registry と照合する。
3. [直列] L3 設計 doc と L12 acceptance pair を追加し、共通/差異/判断を固定する。
4. [直列] L12 採用マトリクスを追加し、ZIP の長所、短所、HELIX 補完、非採用境界を typed declaration として固定する。
5. [直列] 個人開発向け tailoring profile を追加し、required / optional / na の成果物境界を typed declaration として固定する。
6. [直列] 後続 PLAN で L12 layer map、typed design declaration schema、DB projection、drive-model selector、view 拡張を実装する。

## §3 受入条件

- L3 設計 doc が ZIP の理解、HELIX との差分、採用/非採用、L12 化、DB projection、工程表、Project view、運用後検証を明示する。
- L12 採用マトリクスが ZIP の共通点、差異、採用対象、HELIX 補完、非採用対象を typed declaration として持つ。
- 個人開発向け tailoring profile が required / optional / na を区別し、機能設計廃止後の契約移転先を示す。
- pair test-design が typed spec、impact、current-location、drive-model、Project view、ログ/運用検証の acceptance ID を持つ。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L3-13-vmodel-docgen-fit.md` が green。
- docs 変更検証として、古い runtime path を current として増やしていないことを `rg` で確認する。

## §4 対象外

- `src/schema/index.ts` の L0-L14 enum 変更。
- `.helix` state、CLI 名、runtime path の移行。
- ZIP 内 Python generator / Excel builder の core runtime 移植。
- VSCode extension の画面実装。
