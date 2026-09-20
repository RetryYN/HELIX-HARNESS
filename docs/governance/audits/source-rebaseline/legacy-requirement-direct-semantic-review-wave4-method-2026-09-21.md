---
title: "旧要求・旧asset直接semantic review wave 4方法"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 4方法

## 対象

wave 4はHELIX-OSの`HIL-BR-10`、`HIL-BR-06`、`HIL-BR-33`を各3 edge、合計9 edgeで直接照合する。
因果鎖のDB収束、Issue gateの状態遷移、配布cutover承認というOSの運転統制を対象にし、HARNESS側の
gate契約やmarketplace package仕様をOS側へ複製しない。

schema 6はschema 5のbounded global search、atom被覆、`no_shared_source_span`と
`product_boundary_decision_complete`の分離を維持し、直接phase候補のexact転記を追加する。
phaseごとの旧能力・現行状態・transition assessmentはphase候補の調査状態であり、要求単位の旧実装成立を意味しない。
要求単位は未review候補とconsumer chainが残る間、実装状態をunknown、縮退評価を
`unresolved_legacy_implementation_unknown`に保つ。

## edgeと製品境界

各unitは同じ要求IDのsource snapshot、設計文書、implementation sourceを1件ずつ読む。source snapshotの
`confirmed`は契約保存だけである。設計と未実行sourceは要求atomの一部に対応しても`unresolved`とし、
implementation confirmedへ算入しない。

- BR-10はOS単独候補で、event envelope、causation/correlation、因果順序、冪等取り込みを部分証拠とする。
  Issueからmemoryまでの全member joinとharness.db consumer closureは未確認である。
- BR-06はHARNESS unitとの共有source overlapを維持する。設計のordered gateと旧merge admission sourceは
  遷移禁止の部分証拠であり、AdmissionからClosureまでの全gate実装ではない。
- BR-33 OS unitは配布surfaceの実切替とcutover承認境界だけを扱う。release ADRとplan-only decision sourceは
  approval境界の部分証拠で、実cutoverやpublishを成立させない。

## bounded global search

4,020件のasset catalog全件についてarchive file bytesを読み、要求ID、意味語、failure code、隣接symbolの
いずれかを含むassetを候補にする。anchor、候補集合digest、選択asset、未review集合をmetadataへ固定し、
verifierが再計算する。検索membershipはsemantic link、phase採否、製品owner、実装成立を生成しない。

archive内runtime、test、hook、CI、adapterは実行しない。consumer closure、要求採否、phase採否、製品境界判断、
現行実装、再利用、置換、new build許可も生成しない。wave 1〜3のledgerとmetadataを入力digestで固定し、
edge pair非重複、累積件数、status表、引用bytesを静的検査する。
