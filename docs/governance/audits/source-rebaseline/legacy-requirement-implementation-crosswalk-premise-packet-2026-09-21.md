---
title: "製品要求unit・旧HELIX実装証拠crosswalk premise packet"
status: candidate_incomplete
authority_effect: none
captured_at: 2026-09-21
pr_class: research_premise
---

# 製品要求unit・旧HELIX実装証拠crosswalk premise packet

## 判断論点

製品別に分けた要求unitについて、旧HELIXの同じ役割の仕組みを見落とさず、旧assetの存在を実装済みと誤認せずに、直接semantic linkと現行差分を調べ始められる検索面をどこまで構成できるか。

この論点は要求、phase、assetの採否を問うものではない。後続の一要求unitごとの意味reviewに渡す候補pool、既知の縮退、未解決集合、停止条件を固定する問いである。

## 親revision、取得時点、調査scope

- 親decision: `HDEC-CONCEPT-V4.1-AND-FOUR-L1-2026-09-17`。
- 親Concept exact SHA-256: `181b0c555f4e27f83a1f92d315aee0e66a9f3f645e3cebe0a1b8d487878efaad`。
- HELIX-HARNESS L1 exact SHA-256: `a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04`。
- HELIX-OS L1 exact SHA-256: `0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8`。
- current base revision: `eea2f794a5e96947c99d4222c1be0fb244bfc3e9`。
- legacy source revision: `legacy-generation-2026-09-14`。
- 取得時点: 2026-09-21（Asia/Tokyo）。
- scope: 218要求unit／connection候補、20 phase能力、旧asset 4,020件の静的分類を接続し、旧能力、縮退、候補asset、未解決を検索可能にする。

旧archiveはread-onlyで照合し、旧runtime、CI、test、hook、adapterは実行しない。

## premise状態

| 種別 | 内容 | source／時点 |
|---|---|---|
| `known` | 旧Requirement IR 153件は217 product unit候補と1 connection候補へ展開され、HELIX-HARNESS 85、HELIX-OS 132、connection 1である | `legacy-ir-product-unit-decomposition-bootstrap.jsonl`、2026-09-21取得 |
| `known` | 20 phaseは現行状態、旧到達層、旧能力状態、transition assessment、代表assetを保持する | `phase-capability-inventory.json`、2026-09-21取得 |
| `known` | 旧asset分類は4,020件のexact setで、phase候補、low confidenceの製品候補、静的存在状態を保持する | `legacy-asset-phase-product-classification-bootstrap.jsonl`、2026-09-21取得 |
| `known` | 188 unitに321 phase候補linkがあり、30 unitは直接phase未解決である | 本crosswalkの再導出、2026-09-21 |
| `known` | phase rationaleのquoteはsource span要素完全一致87、span内逐語部分一致51、trace未解決183である | 本crosswalk verifier、2026-09-21 |
| `known` | phase代表assetは84件で、unitから参照できるもの78件、PHCAP-15／17で未接続のもの6件である | phase inventoryと本crosswalk metadata、2026-09-21 |
| `assumption` | phase候補とlow confidence製品候補の交差は、直接semantic reviewの探索順を狭める検索候補として使える | 候補pool membershipは直接linkへ昇格させず、全文精読で再評価する |
| `assumption` | phase代表assetは旧能力の調査入口として有用である | 要求unitへの直接対応、consumer完全性、現行適合を別に確認する |
| `unknown` | 218 unitそれぞれを直接満たす旧asset、保持すべき契約、failure、consumer、現行差分 | 一要求unitごとの直接semantic reviewで閉じる |
| `unknown` | 183未trace phase link、117 unitのtrace queue、30 unitのphase未解決 | phase候補の人間decisionへ返す |
| `unknown` | 4,020 assetの全consumer集合と、旧実装の実行可能性・pass・現行適合 | consumer closureと実行可能性reviewへ返す。旧実行結果を流用しない |
| `conflict` | 旧HELIXの単一namespace／owner表現と、現行のHARNESS／OS／Web／Web-OS責務境界は一致しない | 旧path名だけで現行ownerを確定しない |
| `conflict` | phaseの`implemented_*`は静的asset存在を表す一方、要求unitの実装状態は全件unknownである | phase状態をunit実装状態へ転用しない |
| `stale` | archiveにsource、test、workflowが存在しても、2026-09-21時点の稼働、pass、依存解決、現行適合は証明されない | `present_unexecuted`とconsumer pendingを維持する |
| `stale` | 親Concept／L1、unit ledger、phase inventory、asset catalogのbytesが変われば現crosswalkの候補集合は現行性を失う | 入力digest不一致時に再導出する |

## 適用条件と限界

本packetは旧資産調査、直接semantic reviewの作業順、consumer closure、要求判断準備にだけ適用する。対象unit、phase、assetは候補であり、要求採否、successor、L2／L11、設計freeze、実装、旧asset再利用、release、deploymentを許可しない。

候補asset ID集合はphase候補との交差、またはphase候補とlow confidence製品候補との交差である。意味類似、契約一致、consumer完全性を証明しない。候補poolにないassetも、phase未解決、製品候補未登録、分類誤りによって真の対応assetであり得る。

## 反例

- 同じPHCAP-10かつHELIX-OS候補のassetでも、Worker lease要求と無関係なagent設定なら対象unitの実装証拠ではない。
- 直接phaseが空のunitでも、`screen-applicability.ts`のような対応候補が存在し得る。空poolは旧asset不存在を意味しない。
- phase代表assetに実装sourceが含まれても、対象unitの全義務、failure、consumerを満たすとは限らない。
- test sourceやtest designが存在しても、旧testの実行、pass、現行oracle適合を示さない。
- 現行phaseが`scaffold_operating`でも、対象要求unitの正式実装、受入、consumer closureは成立しない。
- 旧pathに`harness`または`helix`が含まれても、現行製品ownerを確定できない。

## 再調査条件と返却先

次のいずれかでcrosswalkを再調査する。

1. 親Concept／L1、製品境界、unit ledger、phase inventory、asset catalogのrevisionまたはdigestが変わる。
2. phase候補の採否、routing訂正、successor、人間による製品境界decisionが記録される。
3. 直接semantic reviewで候補pool外の対応asset、誤候補、保持すべきfailure／consumerが見つかる。
4. consumer closureで未登録consumer、循環、orphan、置換不能契約が見つかる。
5. 旧assetのrights、secret、executability、external effectの状態が変わる。
6. Scaffoldが正式artifactへ置換・retireされ、現行phase状態が変わる。

結果は親Issue #1888、対応する`PHCAP-*` Issue、要求処分review program、技術代替可能性review programへ返す。一要求の採否が必要なら、対象revision付きの個別requirement decisionへ分離する。
