---
title: "current-location summary typed workflow output"
layer: L6
artifact_type: design
status: draft
created: 2026-08-25
updated: 2026-08-31
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
出力を正本とし、後続summary consumerであるproject-frontier／tree-view outlineのprimary workflow
identityとnavigation commandも同じtyped tupleへ収束する。

## 正本と境界

- 意味authorityはrequirementsとversioned classification registryであり、旧`drive`／`model`は
  current identityではない。
- primary identityはregistry version、registry digest、`target_axis`、`target_id`のtupleである。
- legacy入力が一意に変換できる場合だけ、変換元とwarningをreceiptへ残して一方向変換する。
- registry欠落、stale、unknown、ambiguous、unsupportedは推測せずfail-closeする。
- current summary、frontier、textへ旧`drive_recommendation`、`drive_route`、`selected_model`、
  `default_model`、`route_id`、`commands.drive_model`を再出力しない。
- project-frontier／tree-view outlineへtop-level `drive_model` objectを別identityとして再投影せず、
  `workflow_identity`と`workflow_route`を返す。navigation先は`helix current-location`へ固定する。

## 出力契約

`project-current-location-summary.v2`と`current-location-frontier-summary.v2`は、typed identity、
identity receipt、workflow route statusを持つ。authority-backed repositoryではregistry tupleを
返し、authorityが無いfixtureやconsumerではnull identityとfail-close receiptを返す。text出力は
typed workflow routeの状態とreceipt dispositionを表示し、reverse／forwardの範囲も
`workflow-route-reverse-scope`／`workflow-route-forward-scope`として表示する。旧model名や
`drive-*` prefixのprimary labelは表示しない。

同じ`helix status` surfaceの`judgmentReview`は、human・cross-agent・intra-runtime subagentを
区別する。単一runtimeでは既存checklistの必要証拠をJSONとtextの双方へ欠落なく投影し、
human以外を一律cross-agentとして表示しない。本契約はレビュー方式を新規定義せず、既存判定の
表示整合だけを所有する。

## 非対象と後続

DB／schemaのlegacy列、visualization treeのskill binding、`helix drive model` compatibility
command、snapshot内部型の全面改名、#206全体の終端は後続atomic sliceとする。本sliceのgreenを
#206全体の完了として扱わない。
