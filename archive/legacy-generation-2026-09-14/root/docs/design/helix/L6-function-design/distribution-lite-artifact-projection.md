---
title: "HELIX L6 機能設計 — Lite capability artifact projection"
layer: L6
kind: add-design
status: confirmed
created: 2026-08-22
updated: 2026-08-23
owner: SE + TL
plan: docs/plans/PLAN-L7-652-distribution-lite-artifact-projection.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-artifact-projection-unit-test-design.md
related_l5: docs/design/helix/L3-requirements/distribution-package-release-requirements.md
github_issue_id: 856
behavior_contract_id: DISTRIBUTION-LITE-ARTIFACT-PROJECTION-001
responsibility_owner: distribution-lite-artifact-projection
---

# HELIX L6 機能設計 — Lite capability artifact projection

## 目的

Requirement IRへ束縛された`consumer_core_v1`のcapability allowlistを、Full HELIX source tree上の
exact artifact path集合へ決定的に投影する。既存distribution builderへ渡す入力境界であり、Lite専用builderや
別requirements authorityを作らない。

## 入出力

- 入力: validated distribution profile、versioned capability artifact catalog、source treeのrelative path集合。
- 出力: profile ID／digest、昇順exact artifact path集合、そのcanonical digest、typed failure集合。
- purity: filesystem、process、network、Git、DB、GitHubを読み書きせず、受領値だけから同じ結果を返す。

## 機能契約

- allowlist capabilityをcatalogの`consumer_safe` entryへexact一致させる。
- allowlistに対応するartifactが0件、unknown capability、duplicate capabilityをfail-closeする。
- excluded capabilityの選択、allowlist／exclusion overlapをfail-closeする。
- capability間のpath重複をfail-closeし、暗黙のowner共有や後勝ちを許さない。
- absolute path、`..` escape、development `.helix/` state、PLAN／handover／archive、credential／secret系pathを拒否する。
- catalog pathがsource treeに存在しない場合は`artifact_source_missing`として拒否する。
- artifact set digestは重複除去済み昇順relative path配列のcanonical JSONから算出する。

## 非対象

tarball生成、content digest、manifest／checksum、clean consumer canary、Windows smoke、tag、publish、promotion、
DevOS cutoverは後続sliceと#659のapproval境界へ残す。旧`helix team run`をLite正規E2Eとして固定しない。
