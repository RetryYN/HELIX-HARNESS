---
title: "HELIX L6 機能設計 — Lite profile-bound deterministic package"
layer: L6
kind: add-design
status: draft
created: 2026-08-23
updated: 2026-08-23
owner: SE + TL
plan: docs/plans/PLAN-L7-656-distribution-lite-profile-bound-package.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-profile-bound-package-unit-test-design.md
related_l5: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
github_issue_id: 947
behavior_contract_id: DISTRIBUTION-LITE-PROFILE-PACKAGE-001
responsibility_owner: distribution-lite-profile-package
---

# HELIX L6 機能設計 — Lite profile-bound deterministic package

## 目的

`consumer_core_v1`のvalidated profile、capability artifact projection、dependency closureを、既存の
`distribution package`と同じdeterministic archive coreへ一方向に接続する。Full HELIXを唯一のsource authorityとし、
Lite専用builder、別requirements、暗黙のFull package fallbackを作らない。

## admission境界

- profile IDは必須で、catalog上のexact oneへ解決する。未指定・unknown・重複はarchive作成前に拒否する。
- artifact projectionとdependency closureの両方が`ok=true`でなければfilesystem writeを0件にする。
- exact artifact setは昇順relative pathだけを受理し、重複、absolute、escape、excluded、development state、
  PLAN corpus、credential／PII候補を既存projection gateで拒否する。
- source rootと各artifact sourceをphysical identityへ解決し、source自身またはancestorがsymlink、hardlink、root外、
  missing、またはexact fileでない場合はarchive staging前に全write 0で拒否する。directory単位の再帰収録を許可しない。
- output directoryの既存physical ancestor、またはtarball／checksum／manifestのfinal targetが既存なら、
  dangling symlinkを含むsymlink／hardlink／競合出力による物理出力先差し替えとしてwrite前にtyped拒否する。
  final fileはexclusive createする。
- current distribution repositoryは`RetryYN/HELIX-HARNESS-DevOS`だけを出力する。旧OS identityは出力しない。

## package identityの束縛

manifestはsource HEAD、requirements version／root digest、profile ID／version／digest、package version、
artifact exact set／digest、tarball digest、checksum filenameを束縛する。manifestはtarball外のreceiptであり、
自己digestを本文へ埋め込まない。呼出側receiptがmanifest bytesとchecksum bytesのdigestを返す。
runtime入力はtop-levelとnested requirements／profileの余剰identity keyを拒否し、blocked receiptにも余剰fieldを
再投影しない。typed compile-time契約だけにauthority field保護を依存しない。

## 決定的archive core

Full packageとLite packageは同じarchive coreを使用する。path順、mtime epoch、uid／gid 0、numeric owner、
volatile pax field除去を共通化し、同一inputの独立2 buildでtarball、manifest、checksum bytesを一致させる。
1 pathまたは1 byteの変更はartifact setまたはtarball digestを変える。

## 非対象

clean consumer実行、Windows smoke、tag、publish、remote sync、canary／preview／stable promotionは#948と#659へ残す。
