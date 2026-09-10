---
title: "Design Catalog Relation Projection機能設計"
layer: L6
kind: recovery
status: draft
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-1706-design-catalog-relation-projection.md
parent_design: docs/design/helix/L5-detail/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L7-design-catalog-relation-projection-unit-test-design.md
---

# Design Catalog Relation Projection機能設計

## 1. 責務

`docs/design/design-catalog.yaml`を別graphへ複製せず、既存relation graphのcatalog rootとして読み込む。
loaderはcatalog item、登録artifact、review済みdigest authority、design-coverage source/test、governing PLANを
同じ`RelationGraphSourceSet`へ供給し、projectorは既存node・edge・finding vocabularyへ投影する。

## 2. 型付き関係

- catalog rootからitemへ`catalogs`を張り、itemから登録artifactへ`catalog-artifact`を張る。
- rootからreview済みdigest authorityへ`reviewed-by`、coverage source/testへ`validated-by`を張る。
- governing PLANは履歴上の所有元として`governed-by` edgeにだけ保持し、current PLANの依存正本にはしない。
- artifact変更からitemとrootへ逆引きでき、catalog変更から全authority consumerへimpactを辿れるようにする。

## 3. fail-close境界

`done` itemのartifact欠落、catalog外のcurrent design文書、review済みdigestのmissing/staleを、それぞれ
`catalog-artifact-missing`、`catalog-unregistered-artifact`、`reviewed-digest-missing`／
`reviewed-digest-stale`として分離する。semantic digestは自動更新せず、再検収要求だけを返す。
optional sourceが存在しないconsumer checkoutでは既存loader方針どおりfail-openとするが、catalogを読めた後の
node／必須edge欠落やintegrity違反をsilent fallbackしてはならない。

## 4. 受入契約

| Oracle ID | 契約 |
| --- | --- |
| U-RELGRAPH-012 | catalog root、item、artifact、digest authority、coverage oracle、governing PLANのtyped edgeと非空impactを返す。 |
| U-RELGRAPH-013 | artifact削除、未登録design文書、review済みdigestのmissing/staleを別findingとしてfail-closeする。 |

対応する反例とtest citationはpair artifactに置く。
