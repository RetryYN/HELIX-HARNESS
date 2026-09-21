---
title: "旧要求・旧asset直接semantic review wave 10 premise packet"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
parent_revision: 49057f92c9738887624d5d083dcbc5cb39e7c71f
pr_class: research_premise
---

# wave 10 premise packet

Wave 10はHELIX-HARNESSの3 unitを対象とする。要求contractは各unitとも`LEGACY-ASSET-A60CF91DD2AF6693E6F9`の`requirements.json`内の該当IDをsource snapshotとして固定する。

- `IRUNIT-HIL-BR-04-HELIX-HARNESS`: design `LEGACY-ASSET-8B4A62AA38386CC475BA`、implementation candidate `LEGACY-ASSET-C49354AF8D8E8DFE5B1D`。
- `IRUNIT-HIL-BR-13-HELIX-HARNESS`: design `LEGACY-ASSET-A65B5C20721DD2149886`、implementation candidate `LEGACY-ASSET-35B6DB08FC6E6881DA37`。
- `IRUNIT-HIL-FR-43-HELIX-HARNESS`: design `LEGACY-ASSET-65AD8D5F8D976121F583`、implementation candidate `LEGACY-ASSET-F70E61EEE69BB49DCC2B`。

直接照合は9 edge、`confirmed` 3、`unresolved` 6、`rejected` 0。設計・実装候補は部分atomを示すだけであり、旧実装成立、現行replacement、consumer closure、製品owner判断は保留する。FR43のF70 assetはrequirement refinementのsource/acceptance projection部分候補であり、translator APIやchallenge queueの実装成立を示さない。

prior wave 1〜9を入力digestで固定し、累積は29 unit、87 edge、残り189 unit。archiveは静的参照のみで、runtime、test、hook、CI、adapterを実行しない。候補poolのmembershipからsemantic linkを生成しない。
