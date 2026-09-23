---
title: "旧HELIX要求・assetの製品／phase分類状況"
status: candidate_incomplete
authority_effect: none
source_revision: legacy-generation-2026-09-14
current_evidence_revision: c51125b3af523d4efcc46a328f5bc948b9f82c79
---

# 旧HELIX要求・assetの製品／phase分類状況

## 結論

要求を製品単位まで**候補routingする作業**は153件全件で終わっている。ただし、製品別の要求unitへの分割とsuccessor割当は0件であり、製品単位への分離完了とは扱えない。

旧assetは4,020件のexact setをphase／製品候補台帳へ載せた。これは所在を失わず後続reviewへ渡すbootstrapであり、意味closure、consumer closure、実装成立、再利用許可を示さない。

## Requirement IR 153件

正本候補は[旧Requirement IR製品routing bootstrap](../../legacy-ir-product-routing-bootstrap.jsonl)（SHA-256 `c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1`）である。

| 状態 | 件数 | 意味 |
|---|---:|---|
| `single_product` | 87 | 一製品を候補ownerとした。採否・successorは未確定 |
| `split_required` | 65 | 複数製品の責務が一要求に混在し、unit分割が必要 |
| `cross_product_connection` | 1 | 製品間connectionとして別契約化が必要 |
| successor割当済み | 0 | 全153件が`unassigned` |

候補targetの組合せは、HELIX-OS単独67件、HELIX-HARNESS単独20件、両製品66件である。HELIX-Web／HELIX-Web-OSは旧IR本文から直接owner候補になっていない。これは両製品に要求が不要という判断ではなく、旧IR 153件のsource scopeに直接根拠がないことを示す。

phase routingはまだ正本化しない。独立した二つの全件候補を照合したところ、一般的な`event`、`execution`、`verification`等をphase能力へ広げる過剰分類と、複合責務の取りこぼしの双方が見つかった。例えば、PR eventを要求原eventの`PHCAP-02`へ置くことや、platform優先順位だけからCI／verificationを生成することはphase定義を越える。とくに`oracle`／`evidence`／`test`等から`PHCAP-07`、`state`／`projection`／`transaction`等から`PHCAP-10`を生成する系統誤差が残った。責務atomを分け、phase機構そのものへの直接要求だけを再判定する。`phase_routing_candidate`には意味上の`unresolved`を表す値も必要である。

## 旧asset 4,020件

[分類方法](legacy-phase-product-classification-method-2026-09-20.md)に従い、[候補台帳](../../legacy-asset-phase-product-classification-bootstrap.jsonl)と[metadata](../../legacy-asset-phase-product-classification-bootstrap.meta.json)を作成した。候補台帳のSHA-256は`2188f236cb7ed316772ee1fcf413f3b098f702cb4c9d9b3dad09a72db7468c1f`である。

| phase分類状態 | 件数 |
|---|---:|
| `classified_candidate` | 510 |
| `multi_phase_candidate` | 1,170 |
| `unresolved_with_candidate` | 1,087 |
| `unresolved` | 1,253 |

全4,020件について、asset ID、source path、source SHA、archive実体SHAを照合済みである。旧source、test、workflowは実行していない。実装source 557件、test source 597件、test design 373件、workflow 5件はいずれも`present_unexecuted`としており、`implemented`、`tested`、`operational`を生成していない。

製品候補があるassetは2,228件、根拠不足は1,792件である。全5,227 product assignmentは直接根拠の記録が未完了なためlow confidenceへ統一し、現行製品境界とのsemantic review待ちとした。旧path中の`helix`、`harness`等だけではownerを確定しない。

`classified_candidate` 510件はphase側のstrong candidate数であり、製品分類の成立件数ではない。このうち製品候補がないrecordを含み、製品候補があるrecordもすべて直接根拠review待ちである。

consumer closureは4,020件すべてpendingである。`consumer_refs`が空の3,991件に加え、値がある29件も全consumer集合との一致をまだ証明していない。

## 外部監査で修正した事項

- `src/`配下18件のrequirement風名称を文書扱いせず、実装sourceとして`implementation_source_present_unexecuted`へ修正した。
- Phase Capability Inventoryの代表asset 87件を対応phaseへ照合し、取りこぼしていた9件を追加した。
- 根拠が空のphase候補2件を除去した。
- body／一般subject語だけのhigh confidenceをmediumへ降格した。
- `doctor`を含むbasenameだけを根拠にした`PHCAP-11` high confidenceを一律mediumへ降格した。
- `frontmatter:layer`だけを直接根拠としたhigh confidence 254件をmediumへ降格した。
- `frontmatter:canonical_layer`等のartifact layer／pair fieldだけを直接根拠としたhigh confidence 25件をmediumへ降格した。
- evidence tagを宣言語彙へ正規化し、confidence上限をmetadataと検査scriptへ固定した。
- [静的検査script](../../tools/verify_legacy_asset_phase_product_classification.py)を追加し、exact set、archive SHA、状態境界、evidence形式、confidence上限を再検証可能にした。
- 根拠を保持していないproduct候補5,227割当をすべてlow confidenceにし、直接semantic evidence待ちを明記した。
- 一時pathをmetadataのsourceから除き、repository内のsource ledger、phase inventory、製品境界へ固定した。

## 未完了条件

次の作業が残るため、本棚卸しは完了ではない。

1. 153要求の責務atom分割と`PHCAP-01..20`への再判定。
2. `split_required` 65件とconnection 1件の製品別unit化。
3. 全153件のsuccessor割当と個別の人間decision。
4. 2,228 assetの製品候補に対する直接根拠の追加。
5. 1,170 multi-phase assetの意味分割、1,087 weak candidateの確認、1,253 unresolved assetの調査。
6. 全4,020 assetのconsumer closureと209件のartifact kind解決。

これらは全旧資産の棚卸しを完了と主張できない条件であり、個別要求の要否・製品scope判断を一律に止めない。旧能力全体と全資産の再利用可否は未確定のまま保持し、scope確定後にL3で選んだ関係資産だけを個別に調べる（[旧資産の判断時期に関するPO決定](../../decisions/legacy-asset-review-timing-2026-09-23.md)）。[Phase Capability Inventory](../../phase-capability-inventory.json)の`new_build_allowed:false`と[新世代作業入口](../../new-generation-start-here.md)の正式設計・実装停止は変更しない。
