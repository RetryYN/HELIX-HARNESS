---
title: "製品要求unit・旧HELIX実装証拠crosswalk 独立監査応答"
status: review_response_candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 製品要求unit・旧HELIX実装証拠crosswalk 独立監査応答

## 対象

Luna xhighの三担当が、HELIX-HARNESS 85 unit、HELIX-OS 132 unit、phase／asset横断を分担してread-only監査した。旧runtime、CI、test、hook、adapterは実行していない。

## 初回所見と対応

| 所見 | 対応 |
|---|---|
| 候補asset poolが件数だけでasset IDを持たない | unitごとにphase交差asset ID集合とphase・製品候補交差asset ID集合を追加 |
| 代表assetにpath／digest／artifact kind／consumer状態がない | source digest、archive digest照合、kind、存在状態、consumer refs、closureを追加 |
| source spanとphase rationaleがcrosswalkにない | unitの逐語spanとsource phase rationaleを保持 |
| Phase Capability Inventoryの代表asset 84件中6件がunitから未接続 | PHCAP-15／17の6件をmetadataの未接続exact setとして記録 |
| phase状態とunit実装状態を誤読し得る | `status_scope`を追加し、phase状態、search pool、requirement unit状態を分離 |

候補asset metadataはunit行へ全件複製しない。unit側のasset ID集合と、metadataでdigestを固定した4,020件のasset catalogを正規化joinする。候補membershipは`search_candidate_only_not_direct_semantic_link`であり、直接意味edgeではない。

## 再監査所見と対応

再監査で、321 unit-phase候補linkにphase別の逐語根拠がない問題を検出した。rationaleをphaseごとのentryへ分け、引用文字列をunitの`source_text_spans`へ照合した。

- source span要素と完全一致するquoteを結べたlink: 87
- source span要素内の逐語部分文字列quoteを結べたlink: 51
- 逐語quoteを結べないlink: 183
- 未trace linkを含むunit: 117

未trace linkは削除や補完をせず`unresolved_no_exact_source_span`としてreview queueへ残した。直接phase自体がない30 unitも、ID、製品scope、原文spanを別queueへ保持した。top-levelのphase非対応summaryを廃止し、phase entry内でtransition assessmentと根拠を対応させた。

Claude GUI round 1はBlocker 0、Major 0、Minor 2、Info 1だった。PR classと必須入力の欠落、作業入口規範変更の同梱、source span要素全体一致と部分文字列一致の表現混同を指摘された。PR classを`research_premise`として明示し、作業入口変更を分離し、trace状態を上記2種へ分けた。独立再計算という表現はasset pool交差の別式検査に限定した。

Claude GUI round 2はBlocker 0、Major 0、Minor 1だった。`research_premise`の成立物に、一つの判断論点、known／assumption／unknown／conflict／stale、反例、再調査条件、返却先が明示されていないとの指摘だった。独立した`legacy-requirement-implementation-crosswalk-premise-packet-2026-09-21.md`を追加し、親revision、取得時点、scope、適用条件、限界を含む一つのversioned evidence bundleへ揃えた。

最終再監査はBlocker 0、Major 0、Minor 0だった。4,020 assetとのphase交差・phaseと製品候補の交差をbuilderとは別に218 unit全件で再計算し、候補ID集合と一致した。未接続代表6件もsource SHA、artifact種別、静的状態、consumer、closure、archive digestの不一致0を確認した。

HELIX-HARNESSのphase未解決6 unitを調べるsearch leadとして、独立監査は次の旧assetを提示した。unitへの直接linkとphase採否は未判断である。

| asset ID | source path |
|---|---|
| `LEGACY-ASSET-35B6DB08FC6E6881DA37` | `src/design/screen-applicability.ts` |
| `LEGACY-ASSET-C5D38136B1BC66C18D15` | `tests/prototype-walkthrough.test.ts` |
| `LEGACY-ASSET-FA8D4E24D8399E8350F1` | `src/cli.ts` |
| `LEGACY-ASSET-B6DC14C1DA937E3AC96C` | `docs/design/helix/L5-detail/node-runtime-cutover.md` |

## 残る停止条件

全218 unitで直接asset semantic link、unit実装状態、consumer closure、人間による製品境界・phase・successor判断が未完である。これは候補crosswalkの明示した停止状態であり、この監査応答から実装済み、未実装確定、再利用許可、new build許可、設計・実装開始を生成しない。
