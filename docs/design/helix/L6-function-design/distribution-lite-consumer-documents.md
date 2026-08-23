---
title: "HELIX L6 機能設計 — Lite consumer配布文書"
layer: L6
kind: add-design
status: confirmed
created: 2026-08-23
updated: 2026-08-23
owner: SE + TL
plan: docs/plans/PLAN-L7-658-lite-consumer-distribution-docs.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-documents-unit-test-design.md
related_l5: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
github_issue_id: 958
behavior_contract_id: DISTRIBUTION-LITE-CONSUMER-DOCUMENTS-001
responsibility_owner: distribution-lite-consumer-documents
---

# HELIX L6 機能設計 — Lite consumer配布文書

## 目的

`HR-AC-HYB-008-04`を、HELIX-HARNESS唯一正本から生成するconsumer文書exact setへ接続する。
development checkout向けREADMEをそのままcurrent consumer guidanceへ再出力しない。

## 文書exact set

- `README.md`: `README-LITE.md`から投影するconsumer guidance。
- `LICENSE`: source licenseの同一bytes。
- `THIRD_PARTY_NOTICES.md`: runtime同梱dependencyと外部tool非同梱境界。
- `PROVENANCE.md`: source／requirements／profile／artifactの同一性証拠。
- `DISCLAIMER.md`: 自動判断とconsumer責務の境界。

各文書はoutput path、source path、bytes digest、first／third-party区分をmanifest extensionへ束縛する。
source HEADが変わらない手編集source／archiveや、文書欠落を成功へ丸めない。5文書のいずれかに1 byteでも
未commit差分があれば、親builderの`source_head_dirty` admissionでarchive write前に拒否する。

## READMEコマンド受理

READMEに記載するHELIX commandは`consumer_core_v1` command registryのexact setだけとする。
install／setup／status／consumer doctor／Codex・Claude dry-run／completion evidenceを案内し、team run、resident lane、
provider自動配車、Full CLI、旧配布identityをcurrent commandとして案内しない。

## 非対象

tag、publish、remote sync、promotion、DevOS cutover、consumer canary実行は別sliceが所有する。
