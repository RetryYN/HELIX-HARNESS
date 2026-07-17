---
title: "HELIX L12 Vモデル層カバレッジ設計"
layer: L12
kind: design
status: confirmed
created: 2026-07-08
updated: 2026-07-10
owner: Codex / TL
plan: PLAN-L3-13-vmodel-docgen-fit
related_l3: docs/design/helix/L3-requirements/vmodel-docgen-fit.md
spec:
  defines:
    - id: HVC-L1-PLANNING-INTENT
      kind: 企画 採用境界
      title: L1 planning intent coverage
      layer: L1
      owner: TL
      status: confirmed
    - id: HVC-L2-REQUIREMENTS-SCREEN
      kind: 要求 画面 flow
      title: L2 requirements screen coverage
      layer: L2
      owner: TL
      status: confirmed
    - id: HVC-L3-REQUIREMENTS-FREEZE
      kind: 要件 凍結
      title: L3 requirements freeze coverage
      layer: L3
      owner: TL
      status: confirmed
    - id: HVC-L4-BASIC-DESIGN
      kind: 基本設計 architecture
      title: L4 basic design coverage
      layer: L4
      owner: TL
      status: confirmed
    - id: HVC-L5-DETAIL-TEST-CONTRACT
      kind: 詳細設計 テスト契約
      title: L5 detail and test contract coverage
      layer: L5
      owner: TL
      status: confirmed
    - id: HVC-L6-IMPLEMENTATION-BINDING
      kind: 実装契約 implementation binding
      title: L6 implementation binding coverage
      layer: L6
      owner: TL
      status: confirmed
    - id: HVC-L7-TDD-CLOSURE
      kind: テスト実装 TDD closure
      title: L7 TDD closure coverage
      layer: L7
      owner: QA
      status: confirmed
    - id: HVC-L8-UNIT-TEST-DESIGN
      kind: 単体テスト unit test
      title: L8 unit test design coverage
      layer: L8
      owner: QA
      status: confirmed
    - id: HVC-L9-INTEGRATION-TEST-DESIGN
      kind: 結合テスト integration test
      title: L9 integration test design coverage
      layer: L9
      owner: QA
      status: confirmed
    - id: HVC-L10-SYSTEM-TEST-DESIGN
      kind: 総合テスト system test
      title: L10 system test design coverage
      layer: L10
      owner: QA
      status: confirmed
    - id: HVC-L11-ACCEPTANCE
      kind: 受入テスト
      title: L11 acceptance coverage
      layer: L11
      owner: QA
      status: confirmed
    - id: HVC-L12-OPERATION
      kind: 運用テスト 改善還流
      title: L12 operation coverage
      layer: L12
      owner: QA
      status: confirmed
  refs:
    - from: HVC-L1-PLANNING-INTENT
      to: HR-FR-VMFIT-01
      kind: covers
    - from: HVC-L2-REQUIREMENTS-SCREEN
      to: HR-FR-VMFIT-02
      kind: covers
    - from: HVC-L3-REQUIREMENTS-FREEZE
      to: HR-FR-VMFIT-03
      kind: covers
    - from: HVC-L4-BASIC-DESIGN
      to: HR-FR-VMFIT-04
      kind: covers
    - from: HVC-L5-DETAIL-TEST-CONTRACT
      to: HR-FR-VMFIT-04
      kind: covers
    - from: HVC-L6-IMPLEMENTATION-BINDING
      to: HR-FR-VMFIT-05
      kind: covers
    - from: HVC-L7-TDD-CLOSURE
      to: HAT-VMFIT-L7-CLOSURE
      kind: verifies
    - from: HVC-L8-UNIT-TEST-DESIGN
      to: HAT-VMFIT-03
      kind: verifies
    - from: HVC-L9-INTEGRATION-TEST-DESIGN
      to: HAT-VMFIT-04
      kind: verifies
    - from: HVC-L10-SYSTEM-TEST-DESIGN
      to: HAT-VMFIT-05
      kind: verifies
    - from: HVC-L11-ACCEPTANCE
      to: HAT-VMFIT-05
      kind: verifies
    - from: HVC-L12-OPERATION
      to: HAT-VMFIT-05
      kind: verifies
---

# HELIX L12 Vモデル層カバレッジ設計

## §0 位置づけ

本書は `ハイブリッド設計ドキュメントv1-fixed.zip` の `107_Vモデル・レベル定義` を HELIX の機械検出 gate へ写すための
層カバレッジ設計である。ここで定義する ID は実装完了の主張ではない。各 L 層が `design_declarations` へ
投影され、Project view と `current-location` が heuristic ではなく typed declaration を根拠に現在地を描くための
検出契約である。

## §1 カバレッジ契約

| ID | ZIP L | HELIX で検出するもの | 逆流時の戻り先 |
|----|-------|----------------------|----------------|
| HVC-L1-PLANNING-INTENT | L1 企画 | ZIP 採用境界、L0 のスライド調整、core runtime 非置換の判断 | 企画/採用境界 |
| HVC-L2-REQUIREMENTS-SCREEN | L2 要求+画面 | 要求、画面、flow、mock から L3 要件へ締める入力 | 要求/画面 |
| HVC-L3-REQUIREMENTS-FREEZE | L3 要件 | FR/NFR/ACとtest oracleの凍結 | 要件 |
| HVC-L4-BASIC-DESIGN | L4 基本設計 | DB projection、Project view、drive model の方式境界 | 基本設計 |
| HVC-L5-DETAIL-TEST-CONTRACT | L5 詳細設計 | 内部設計、typed contract、edge case、先行test design | 詳細設計 |
| HVC-L6-IMPLEMENTATION-BINDING | L6 実装 | typed declarationとproduct codeのbinding | 実装 |
| HVC-L7-TDD-CLOSURE | L7 TDD closure | Red→Green→Refactorと実装/test双方向trace | テスト実装 |
| HVC-L8-UNIT-TEST-DESIGN | L8 単体テスト | parser、coverage gate、drive selector の unit oracle | 単体テスト設計 |
| HVC-L9-INTEGRATION-TEST-DESIGN | L9 結合テスト | design declarations から harness.db、read-model、Project view までの integration oracle | 結合テスト設計 |
| HVC-L10-SYSTEM-TEST-DESIGN | L10 総合テスト | L3 FR/NFR/ACをsystem全体で検証 | 総合テスト設計 |
| HVC-L11-ACCEPTANCE | L11 受入テスト | L2要求・prototypeを実利用/実データで検証 | 受入テスト |
| HVC-L12-OPERATION | L12 運用テスト | L1価値、運用時間軸、改善還流を検証 | 運用テスト |

## §2 不変条件

1. L1 は HELIX 固有のメタ層として残さず、V 字成立のための企画層として扱う。
2. L2 は要求と画面を分離せず、要求を引き出す画面/flow/mock を同じ typed coverage に含める。
3. L4 は実装詳細ではなく、DB/read-model/view/drive model の方式境界を宣言する。
4. L6 はコード完了ではなく、どの実装 surface がどの typed declaration と DB table に binding されるかを宣言する。
5. L8/L9/L10 はテスト実行結果ではなく、ZIP の右腕に対応する test design oracle を宣言する。
6. Reverse は不足した層の設計/テスト設計へ戻し、文書依存と実装依存を `current-location` に出す。

## §3 機械ゲート対応

このカバレッジ契約は `vmodel fit --summary-json` と `current-location --summary-json` の以下の
機械ゲートで検証する。`status: confirmed` は実装完了の宣言ではなく、ZIP の L12 層定義を HELIX の
検出契約として固定したことを意味する。

| 契約 | 機械ゲート | 退行時の症状 |
|------|------------|--------------|
| HVC-L1-PLANNING-INTENT | `zip_adoption` / `tailoring` | ZIP 採用判断、L0 スライド調整、個人開発 tailoring が欠落する |
| HVC-L2-REQUIREMENTS-SCREEN | `acceptance_traceability` | 要求、画面、flow、受入基準の trace が切れる |
| HVC-L4-BASIC-DESIGN | `roadmap_current` / `drive_model` | 工程表、現在地、駆動モデルの接続が contradiction のまま隠れる |
| HVC-L6-IMPLEMENTATION-BINDING | `function_design_absorption` / `design_integrity` | 独立機能設計が復活する、または typed declaration と実装 binding が drift する |
| HVC-L8-UNIT-TEST-DESIGN | `regression_guards.design-coverage` | coverage parser / gate / drive selector の unit oracle が不足する |
| HVC-L9-INTEGRATION-TEST-DESIGN | `zip_source_bindings` / `current_location` | design declaration から harness.db/read-model/Project view への投影が切れる |
| HVC-L10-SYSTEM-TEST-DESIGN | `recovery_runway` / `approval_review` / `attention_boundary` | L14 claim、open L7、工程表、operation scope の system oracle が人間承認境界を示せない |
