---
title: "HELIX L12 Vモデル層カバレッジ設計"
layer: L12
kind: design
status: draft
created: 2026-07-08
updated: 2026-07-08
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
      status: draft
    - id: HVC-L2-REQUIREMENTS-SCREEN
      kind: 要求 画面 flow
      title: L2 requirements screen coverage
      layer: L2
      owner: TL
      status: draft
    - id: HVC-L4-BASIC-DESIGN
      kind: 基本設計 architecture
      title: L4 basic design coverage
      layer: L4
      owner: TL
      status: draft
    - id: HVC-L6-IMPLEMENTATION-BINDING
      kind: 実装契約 implementation binding
      title: L6 implementation binding coverage
      layer: L6
      owner: TL
      status: draft
    - id: HVC-L8-UNIT-TEST-DESIGN
      kind: 単体テスト unit test
      title: L8 unit test design coverage
      layer: L8
      owner: QA
      status: draft
    - id: HVC-L9-INTEGRATION-TEST-DESIGN
      kind: 結合テスト integration test
      title: L9 integration test design coverage
      layer: L9
      owner: QA
      status: draft
    - id: HVC-L10-SYSTEM-TEST-DESIGN
      kind: 総合テスト system test
      title: L10 system test design coverage
      layer: L10
      owner: QA
      status: draft
  refs:
    - from: HVC-L1-PLANNING-INTENT
      to: HR-FR-VMFIT-01
      kind: covers
    - from: HVC-L2-REQUIREMENTS-SCREEN
      to: HR-FR-VMFIT-02
      kind: covers
    - from: HVC-L4-BASIC-DESIGN
      to: HR-FR-VMFIT-04
      kind: covers
    - from: HVC-L6-IMPLEMENTATION-BINDING
      to: HR-FR-VMFIT-05
      kind: covers
    - from: HVC-L8-UNIT-TEST-DESIGN
      to: HAT-VMFIT-03
      kind: verifies
    - from: HVC-L9-INTEGRATION-TEST-DESIGN
      to: HAT-VMFIT-04
      kind: verifies
    - from: HVC-L10-SYSTEM-TEST-DESIGN
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
| HVC-L4-BASIC-DESIGN | L4 基本設計 | DB projection、Project view、drive model の方式境界 | 基本設計 |
| HVC-L6-IMPLEMENTATION-BINDING | L6 実装 | typed declaration、projection writer、current-location、VSCode view への実装 binding | 実装契約 |
| HVC-L8-UNIT-TEST-DESIGN | L8 単体テスト | parser、coverage gate、drive selector の unit oracle | 単体テスト設計 |
| HVC-L9-INTEGRATION-TEST-DESIGN | L9 結合テスト | design declarations から harness.db、read-model、Project view までの integration oracle | 結合テスト設計 |
| HVC-L10-SYSTEM-TEST-DESIGN | L10 総合テスト | L14 claim と open L7、工程表、operation scope を合わせた system oracle | 総合テスト設計 |

## §2 不変条件

1. L1 は HELIX 固有のメタ層として残さず、V 字成立のための企画層として扱う。
2. L2 は要求と画面を分離せず、要求を引き出す画面/flow/mock を同じ typed coverage に含める。
3. L4 は実装詳細ではなく、DB/read-model/view/drive model の方式境界を宣言する。
4. L6 はコード完了ではなく、どの実装 surface がどの typed declaration と DB table に binding されるかを宣言する。
5. L8/L9/L10 はテスト実行結果ではなく、ZIP の右腕に対応する test design oracle を宣言する。
6. Reverse は不足した層の設計/テスト設計へ戻し、文書依存と実装依存を `current-location` に出す。
