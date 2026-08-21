---
title: "HELIX L6 機能設計 — Lite profile manifest"
layer: L6
kind: add-design
status: confirmed
created: 2026-08-21
updated: 2026-08-21
owner: SE + TL
plan: docs/plans/PLAN-L7-642-distribution-lite-profile-manifest.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-profile-manifest-unit-test-design.md
related_l5: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
github_issue_id: 856
behavior_contract_id: DISTRIBUTION-LITE-PROFILE-001
responsibility_owner: distribution-lite-profile-authority
---

# HELIX L6 機能設計 — Lite profile manifest

## 目的

`consumer_core_v1`をpath推測や手編集allowlistではなく、Requirement IR refinementへ束縛されたtyped
capability manifestとして読み込む。manifestはFull HELIXから生成されるprojectionであり、Lite側の逆向きauthorityにしない。

## 機能契約

- profile identity、version、display name、source／distribution repositoryをschemaで型付けする。
- allowlistとexclusionはtyped ID、重複なし、相互排他とする。
- profile digestはdigest field自身を除く全materialのcanonical digestとする。
- source refinement IDとsemantic digestをcurrent Requirement IRへ照合する。
- parse失敗、重複、overlap、digest drift、refinement欠落／driftをfail-closeする。

## 非対象

本sliceではcapability IDからartifact pathへのprojection、package build、consumer smoke、promotion、publishを実装しない。
これらをmanifest schemaのgreenへ読み替えない。
