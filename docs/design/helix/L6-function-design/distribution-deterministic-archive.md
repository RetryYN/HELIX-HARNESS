---
title: "HELIX L6 機能設計 — distribution deterministic archive"
layer: L6
kind: add-design
status: confirmed
created: 2026-08-19
updated: 2026-08-19
owner: SE + TL
plan: docs/plans/PLAN-L7-603-distribution-deterministic-archive.md
pair_artifact: docs/test-design/helix/L8-distribution-deterministic-archive-unit-test-design.md
related_l5: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
github_issue_id: 659
behavior_contract_id: DISTRIBUTION-PACKAGE-RELEASE-001
responsibility_owner: distribution-package-release
---

# HELIX L6 機能設計 — distribution deterministic archive

## 目的

同一のsource HEADとtagから生成する配布archiveを、入力以外のfilesystem metadataやentry順に依存しない
再現可能なartifactへ固定する。署名、tag、publish、canary、cutoverはこの機能設計の責務外であり、既存の
action-binding approval境界へ残す。

## 機能契約

- archive entryは名前順に固定し、mtime、owner、group、numeric owner、PAX atime/ctimeを明示的に固定する。
- manifestは生成済みtarballの実測SHA-256を`artifactDigest`として保持する。
- artifact pathはconsumerへ再利用可能なbasenameだけを記録し、実行マシンの絶対pathを出力しない。
- package commandはremote、tag、publish、credential、working treeを変更しない。

## 検証接続

L8の`U-DISTDET-001`は同じ入力を2回local packageし、tarball bytes、checksum、manifest digest、portable
manifest pathの一致を同時に検証する。片方だけの再計算やremote stateの成功をartifact再現性の証拠にはしない。
