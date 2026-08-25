---
title: "current-location summary typed workflow output"
layer: L6
artifact_type: design
status: draft
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
registry: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
plan: docs/plans/PLAN-L7-672-current-location-summary-typed-output.md
pair_artifact: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md
---

# current-location summary の typed workflow 出力

## 目的

既存のcurrent-location snapshotが持つ内部compatibility情報から、利用者向けsummaryを分離し、
requirements-owned registryのtyped workflow identityをprimary outputへ投影する。本sliceは
`helix current-location --summary-json`、current-location frontier、同コマンドのread-only text
出力だけを対象とする。

## 正本と境界

- 意味authorityはrequirementsとversioned classification registryであり、旧`drive`／`model`は
  current identityではない。
- primary identityはregistry version、registry digest、`target_axis`、`target_id`のtupleである。
- legacy入力が一意に変換できる場合だけ、変換元とwarningをreceiptへ残して一方向変換する。
- registry欠落、stale、unknown、ambiguous、unsupportedは推測せずfail-closeする。
- current summary、frontier、textへ旧`drive_recommendation`、`drive_route`、`selected_model`、
  `default_model`、`route_id`、`commands.drive_model`を再出力しない。

## 出力契約

`project-current-location-summary.v2`と`current-location-frontier-summary.v2`は、typed identity、
identity receipt、workflow route statusを持つ。authority-backed repositoryではregistry tupleを
返し、authorityが無いfixtureやconsumerではnull identityとfail-close receiptを返す。text出力は
typed workflow routeの状態とreceipt dispositionだけを表示し、旧model名を表示しない。

## 非対象と後続

DB／schemaのlegacy列、visualization tree全体、skill binding、`helix drive model` compatibility
command、snapshot内部型の全面改名、#206全体の終端は後続atomic sliceとする。本sliceのgreenを
#206全体の完了として扱わない。
