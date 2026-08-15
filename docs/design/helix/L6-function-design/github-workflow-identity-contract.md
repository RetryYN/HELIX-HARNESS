---
title: "GitHub typed workflow identity contract機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
plan: docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md
pair_artifact: docs/test-design/helix/L8-github-workflow-identity-contract-unit-test-design.md
---

# GitHub typed workflow identity contract機能設計

## Authority

要件正本4.2.1のversioned workflow分類registryと§6のIssue→PLAN→PR episode契約を上位authorityとする。
GitHub本文のprose、label、旧15-route catalog、`mode`／`model`は意味authorityにしない。

## 責務

IssueとPRが同じmarker付きJSON contractで宣言した`registry_version`、`registry_source_digest`、
`target_axis`、`target_id`をstrict value objectへ変換する。I/O、GitHub API、DB commit、episode lifecycleは
所有せず、後続adapterが利用するpure schema／comparisonだけを所有する。

## Contract

- `U-GWID-001`: marker直後の単一JSON contractをstrict schemaで読み、current generated catalogへexact照合する。
- `U-GWID-002`: marker欠落／重複、壊れたJSON、余剰field、legacy identityを別reasonでfail-closeする。
- `U-GWID-003`: registry version／digest driftと未知axis／IDを推測せず拒否する。
- `U-GWID-004`: optional `signal_tokens`はrequirements catalog resolverで照合し、unknown、decision待ち、
  ambiguity、identity矛盾を別reasonで閉じる。proseや`po_directive`本文からsignalを抽出しない。
- `U-GWID-005`: IssueとPRのauthority tupleまたはidentityが異なる場合、同一episodeとして受理しない。
- `U-GWID-006`: L6/L8 pairをdesign catalogとG3 freeze digestへ伝播する。

## Marker

current contractは次のmarkerを1件だけ持つ。

```text
<!-- HELIX:github-workflow-identity-contract:v1 -->
```

marker直後の`json` fenced block以外をidentityとして解釈しない。これにより説明文やコード例の偶発一致を
machine authorityへ昇格させない。

## Failure境界

canonical contractがmissing／invalid／driftの場合にlegacy fieldやlabelの成功で相殺しない。
DB projection、execution episode、right-arm evidence、terminal dispositionは#205の後続sliceへ分離する。
