---
title: "Universal Improvement観測正規化機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
plan: docs/plans/PLAN-L7-705-universal-improvement-observation-normalizer.md
pair_artifact: docs/test-design/helix/L8-universal-improvement-observation-normalizer-unit-test-design.md
related_l3: docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md
---

# Universal Improvement観測正規化機能設計

## 1. 責務境界

本機能はUIL-02として、UIL-01のrepository-bound registry resultとsource observationを同じadmission関数へ戻し、
admit済み観測だけをstable eventへ正規化する。finding、candidate、Issue、PLAN、Requirement、DB authorityを生成・更新しない。
通知本文、AI出力、file名類似を観測正本にせず、source registry／detectorを再実装しない。

## 2. 正規event

`UniversalImprovementNormalizedEventV1`はregistry version／digest、source／detector identity、baseline、observed、
predicted、correlation、causation、confidence、counterevidenceを別fieldへ束縛する。event IDはsource identity、観測時刻、
payload／evidence digestから決定的に導出し、入力順へ依存させない。event digestとexact set digestは共通
`canonicalJson`／`sha256Digest`を利用する。

baselineは`current`または`missing`とし、`missing`ではrevision／payload digestをnullへ固定する。predictionは独立した
nullable fieldであり、observed evidenceや完了証拠へ昇格しない。confidenceは0以上1以下とbasis digestを持ち、
counterevidenceはdigest exact setとしてbytewise sortする。

## 3. fail-close境界

- forged／stale registry result、unknown source、wrong source revision、digest／timestamp不正はUIL-01 admissionで拒否する。
- baseline stateとrevision／digestの矛盾、prediction不正、confidence範囲外、counterevidence digest不正を拒否する。
- duplicate event ID、未解決causation、cross-correlation causationを拒否する。
- event集合はevent IDで決定的にsortし、同じ入力集合から同じexact set digestを返す。
- validation errorが1件でもあれば部分event集合を返さず、errorsだけを返す。

## 4. 後続接続

normalized eventは#1211のfinding適格化へread-onlyで渡す。baseline比較のmetric意味判定、dedupe／expiry、semantic impact、
counterfactual、route、authority writeは後続sliceへ残す。
