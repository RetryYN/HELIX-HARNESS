---
title: "旧要求・旧asset直接semantic review wave 4 premise packet"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 4 premise packet

## 入力と出力

- 入力: archive manifest、4,020 asset分類台帳、218 product unit crosswalk、product unit decomposition、
  phase capability inventory、wave 1〜3 ledgerとmetadata。
- 出力: schema revision 6の9 edge ledger、3 unit aggregate、phase assessment、bounded search receipt。
- authority effect: none。
- legacy execution: false。
- consumer closure: pending。
- new build allowed: false。

## このpacketが確定しないもの

要求採否、phase採否、製品owner、旧要求全体の実装成立、test合格、consumer closure、現行実装、再利用、置換、
new build許可を確定しない。phase capabilityの具体的transition候補と要求単位のunknown状態を別に保持する。

## 検証

専用verifierは親revisionと入力digest、archive manifest、catalog join、source span、atom被覆、shared overlap、
引用bytes、artifact種別、semantic relation、phase assessment exact転記、bounded search集合、prior wave非重複、
累積件数、status表を再計算する。phase候補のauthority化、designの実装算入、未実行sourceの実装確定、
unknown状態での縮退確定、共有spanのexclusive化、検索receipt driftを拒否する。
