---
title: "旧要求・旧asset直接semantic review wave 3 premise packet"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 3 premise packet

## 入力と出力

- 入力: archive manifest、4,020 asset分類台帳、218 product unit crosswalk、product unit decomposition、
  phase capability inventory、wave 1／2 ledgerとmetadata。
- 出力: schema revision 5の9 edge ledger、3 unit aggregate、bounded global search receipt。
- authority effect: none。
- legacy execution: false。
- consumer closure: pending。
- new build allowed: false。

## このpacketが確定しないもの

このpacketは旧asset候補の意味調査であり、要求採否、phase採否、製品owner決定、実装完了、test合格、consumer closure、
現行への再利用、置換、new build許可を確定しない。designとtest designをimplementationへ数えず、archive内assetを実行しない。
検索候補の残りとconsumer chainが閉じるまでは、旧要求実装状態をunknownのまま保持する。

## 検証

専用verifierは入力digest、親revision、archive manifest、catalog join、要求unit source span、atom無損失被覆、
shared span、引用bytes、artifact種別、semantic relation、bounded search exact set、未review集合、wave間edge非重複、
累積件数、status表の件数を再計算する。検索anchor欠落、phase authority偽装、designの実装算入、製品unit外atom混入、
引用改変、累積件数driftを拒否する。
