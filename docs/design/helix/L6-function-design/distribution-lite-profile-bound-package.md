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
- source repositoryは`origin`の実remoteを`RetryYN/HELIX-HARNESS`へ照合し、別repositoryのHEADへ正本名だけを付け替えない。

## package identityの束縛

manifestはsource repository／HEAD、requirements version／root digest、profile ID／version／digest、package version、
artifact exact set／digest、tarball digest、checksum filenameを束縛する。manifestはtarball外のreceiptであり、
自己digestを本文へ埋め込まない。呼出側receiptがmanifest bytesとchecksum bytesのdigestを返す。
source HEADは`git rev-parse HEAD`の文字列だけで成立させず、追跡済みworking treeがそのHEADと一致する場合だけ受理する。
未commit差分がある場合は`source_head_dirty`でarchive write前にfail-closeし、古いHEADで新しいbytesを包装しない。
tracked差分だけでなく未追跡fileも同じdirty判定へ含める。Full経路の候補集合も`git ls-files`へ限定し、
ignored untracked bytesをfilesystem walkからclean HEADへ混入させない。
このresolverはLite profile経路とFull `distribution package`経路で共有し、片側だけにstale HEAD包装を残さない。
requirements identityは`setup`からrequirements実装moduleへ逆依存せず、canonical manifestのexact shard set、
各shard count／digest、baseline root digest、root digestをread-only projection adapterで再検証する。
runtime入力はtop-levelとnested requirements／profileの余剰identity keyを拒否し、blocked receiptにも余剰fieldを
再投影しない。typed compile-time契約だけにauthority field保護を依存しない。

## 決定的archive core

Full packageとLite packageは同じarchive coreを使用する。path順、mtime epoch、uid／gid 0、numeric owner、
volatile pax field除去を共通化し、同一inputの独立2 buildでtarball、manifest、checksum bytesを一致させる。
Lite packageはconsumer専用entrypointをNode 24向けsingle bundleへprebuildし、`dist/helix.js`のpath／digestを
manifestへ束縛する。package.jsonは同artifactを`bin.helix`へ固定し、fresh install後の`helix --version`が
TypeScript source、tsx、esbuildへ依存せず起動することをpackage sliceの受入境界とする。
dependency closureのTypeScript compilerはshared lazy loaderを介し、`helix --version`等の非compiler経路では
実体をloadしない。
1 pathまたは1 byteの変更はartifact setまたはtarball digestを変える。

## 非対象

clean consumer実行、Windows smoke、tag、publish、remote sync、canary／preview／stable promotionは#948と#659へ残す。
