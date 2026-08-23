---
title: "HELIX L6 機能設計 — Lite clean consumer canary"
layer: L6
kind: add-design
status: draft
created: 2026-08-23
updated: 2026-08-23
owner: SE + TL
plan: docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-canary-unit-test-design.md
related_l5: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
github_issue_id: 948
behavior_contract_id: DISTRIBUTION-LITE-CONSUMER-CANARY-001
responsibility_owner: distribution-lite-consumer-canary
---

# HELIX L6 機能設計 — Lite clean consumer canary

## 目的

`consumer_core_v1`から生成した同一Lite artifactを、clean Linux consumerとWindows smokeで実行する。
source HEAD、requirements、profile、artifact、Linux／Windows receiptを一つのmanifest chainへ束縛し、
差替え、別HEAD、別profile、consumer所有bytesの破壊を成功へ丸めない。

## artifact admission

- #947 builder receiptを外部期待値とし、tarball、manifest、checksumのbytes digestを展開前に再計算する。
- manifestのsource HEAD、requirements version／digest、profile ID／version／digest、package version、
  artifact exact set、prebuilt Node artifact path／digestを期待値へexact一致させる。
- 三成果物はregular physical fileだけを受理し、symlink、hardlink、ancestor symlink、欠落を拒否する。
- archive entryはportable relative pathだけを受理し、manifestのexact setとの過不足を拒否する。
- checksum drift、artifact 1 byte差替え、別HEAD、別profileはextract／install／process起動前にfail-closeする。

## clean consumer transaction

Linuxはfresh temporary repositoryでchecksum検証、extract、package install、setup dry-run／apply／idempotency、status、
consumer doctor、Codex／Claude minimal workflow dry-run、generated CI、completion decision packet／review bundleを順に実測する。
setupはconsumer所有fileの既存bytesを上書きせず、HELIX管理blockだけをexact ownershipで更新する。

WindowsはLinuxで検証した同一tarball digestとprebuilt Node artifactを使用し、PowerShell entrypoint、setup dry-run、
status、consumer doctor、minimal workflow dry-runを検証する。Windows専用rebuildで代替しない。

## lifecycle rehearsal

upgrade、rollback、uninstallはengine pinだけを変更対象とし、consumer成果とcompletion evidenceのbefore／after digestを
一致させる。直前pin以外へのrollback、identity drift、部分更新を拒否する。

## 非対象

tag、publish、remote sync apply、canary／preview／stable promotion、DevOS cutover、resident lane、provider自動配車は
#659以降へ残す。
