---
title: "HELIX L10 受入テスト設計 — Scrum運営層typed projection"
layer: L10
artifact_type: test_design
status: draft
created: 2026-09-12
updated: 2026-09-12
owner: QA / TL
plan: PLAN-RECOVERY-1751-scrum-operation-typed-projection
parent_design: docs/design/helix/L3-requirements/scrum-operation-typed-projection.md
pair_artifact: docs/design/helix/L3-requirements/scrum-operation-typed-projection.md
behavior_contract_id: SCRUM-OPERATION-TYPED-PROJECTION-001
spec:
  defines:
    - { id: SCRUM-OPS-A-01, kind: acceptance criteria, title: story mapping typed projection, layer: L10, owner: QA, status: draft }
    - { id: SCRUM-OPS-A-02, kind: acceptance criteria, title: estimation velocity typed projection, layer: L10, owner: QA, status: draft }
    - { id: SCRUM-OPS-A-03, kind: acceptance criteria, title: DoR DoD typed projection, layer: L10, owner: QA, status: draft }
    - { id: SCRUM-OPS-A-04, kind: acceptance criteria, title: daily record typed projection, layer: L10, owner: QA, status: draft }
    - { id: SCRUM-OPS-A-05, kind: acceptance criteria, title: sprint review typed projection, layer: L10, owner: QA, status: draft }
    - { id: SCRUM-OPS-A-06, kind: acceptance criteria, title: retrospective reverse projection, layer: L10, owner: QA, status: draft }
    - { id: SCRUM-OPS-A-07, kind: acceptance criteria, title: burndown velocity metric projection, layer: L10, owner: QA, status: draft }
    - { id: U-SCRUMOPS-001, kind: unit test, title: 7 operationとpair metadataの完全性, layer: L7, owner: QA, status: draft }
    - { id: U-SCRUMOPS-002, kind: unit test, title: 旧ZIP宣言による相殺拒否, layer: L7, owner: QA, status: draft }
  refs:
    - { from: SCRUM-OPS-A-01, to: SCRUM-OPS-R-01, kind: accepts }
    - { from: SCRUM-OPS-A-02, to: SCRUM-OPS-R-02, kind: accepts }
    - { from: SCRUM-OPS-A-03, to: SCRUM-OPS-R-03, kind: accepts }
    - { from: SCRUM-OPS-A-04, to: SCRUM-OPS-R-04, kind: accepts }
    - { from: SCRUM-OPS-A-05, to: SCRUM-OPS-R-05, kind: accepts }
    - { from: SCRUM-OPS-A-06, to: SCRUM-OPS-R-06, kind: accepts }
    - { from: SCRUM-OPS-A-07, to: SCRUM-OPS-R-07, kind: accepts }
---

# Scrum運営層typed projection受入設計

7 operationを正規L3 declarationと一対一で検証する。ID、layer、owner、source pathの欠落・重複・
誤配線をfail-closeし、旧ZIP provenanceや語句heuristicによる相殺を許さない。

| 受入ID | 検証対象 | 合格条件 |
|---|---|---|
| `SCRUM-OPS-A-01` | story mapping | `SCRUM-OPS-R-01`が正規sourceから投影される |
| `SCRUM-OPS-A-02` | estimation／velocity | `SCRUM-OPS-R-02`の見積りと実測が分離される |
| `SCRUM-OPS-A-03` | DoR／DoD | `SCRUM-OPS-R-03`の着手・完成gateがtypedである |
| `SCRUM-OPS-A-04` | daily record | `SCRUM-OPS-R-04`のevent／receiptが観測できる |
| `SCRUM-OPS-A-05` | sprint review | `SCRUM-OPS-R-05`の受入照合とfeedbackを追跡できる |
| `SCRUM-OPS-A-06` | retrospective | `SCRUM-OPS-R-06`がRecovery／Reverseへ接続する |
| `SCRUM-OPS-A-07` | burndown／velocity metrics | `SCRUM-OPS-R-07`を意味正本と分離して観測できる |

`U-SCRUMOPS-002`は正規宣言のlayer mutationと同カテゴリの旧ZIP宣言、および正規宣言0件と
旧ZIP宣言一式を投入し、それでも`scrum_operation_gap`が残ることを検証する。DB rebuild 2回でmissing 0、ceremony／metric非ゼロ、
current-location／roadmap／vmodel fitの同一根拠を確認する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-SCRUMOPS-001 | 7 operationとL3/L10 pair metadata | 集合またはpair metadata欠落で失敗する | `tests/current-location.test.ts` |
| U-SCRUMOPS-002 | 正規宣言の完全一致 | 誤layerまたは正規宣言全欠落を旧ZIP同カテゴリで相殺せずmissingを維持する | `tests/current-location.test.ts` |
