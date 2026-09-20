---
title: "旧Requirement IR製品unit分解状況"
status: candidate_incomplete
authority_effect: none
source_revision: legacy-generation-2026-09-14
product_routing_digest: c35934693b273e6cfd03e509886dc22bd1367e78ae1aa4568563a7da252c41e1
---

# 旧Requirement IR製品unit分解状況

## 現在地

旧Requirement IR 153件を、現行の製品責務境界に沿う217件の`product_unit`候補と1件の
`cross_product_connection`候補へ展開した。これは製品別要求のreview入力であり、対象別要求への採用、
successor割当、意味変更、L2／L11承認、設計・実装開始を成立させない。

| 項目 | 件数 |
|---|---:|
| source requirement | 153 |
| `single_product` | 87 |
| `split_required` | 65 |
| `cross_product_connection` | 1 |
| HELIX-HARNESS product unit | 85 |
| HELIX-OS product unit | 132 |
| cross-product connection | 1 |
| 直接phase候補あり | 188 |
| 直接phase未解決 | 30 |
| successor割当済み | 0 |

HELIX-Web／HELIX-Web-OS unitは0件である。旧IR 153件から直接owner候補を導けなかった現在値であり、
両製品に要求が不要という判断ではない。

## 原要求の保持

全153件でsource requirement ID、原文、semantic digest、routing registration、routing候補、製品候補集合を
既存台帳と一致させた。`single_product`は原文全体を一unitへ保持する。`split_required`は原文から採った逐語spanを
各unitへ置き、句点・セミコロン・証拠区切り`|`で分けたclauseの未被覆がないことを静的検査する。

初回の分割監査ではBlocker 0、Major 152、Minor 15を検出した。否定、例外、停止、failure、証拠suffixの欠落、
原文にない実装責務のsummary追加、PHCAP-02／07／10等への過剰分類を修正した。修正後も正本候補のexact HEADに
対する独立reviewが終わるまでは、全recordを`candidate_decomposition_pending_exact_head_independent_review`とする。
三batchの再監査では追加のMajor 33、Minor 4、後続再監査でMajor 1、Minor 1を検出して修正した。各batchの
最終再監査はBlocker 0、Major 0、Minor 0である。

## 未解決のrouting

既存routingをこの候補台帳から上書きせず、次の5要求を訂正候補として保持する。

- `HIL-FR-01`
- `HIL-FR-11`
- `HIL-FR-15`
- `HIL-FR-16`
- `HIL-TR-04`

`HIL-TR-04`はLinux／macOS／Windowsの横断platform制約であり、HARNESS／OSの二unitへ確定分割できない可能性がある。
他4件も既存routingの製品候補と分割結果に差があり、人間判断なしにroutingを変更しない。

## 旧実装・縮退・phaseとの接続

本台帳の直接phase候補は、要求本文がphase機構そのものを要求する場合だけ付与した。一般的な`event`、`state`、
`evidence`、`test`、`gate`、`finding`、`operation`や成果物layerだけからphaseを生成していない。

旧資産側は別台帳で4,020件をexact setとして保持し、実装source 557件、test source 597件、test design 373件、
workflow 5件をすべて`present_unexecuted`としている。phase分類はstrong single 510、multi 1,170、weak 1,087、
unresolved 1,253である。consumer closureは4,020件すべてpendingであり、旧test、旧CI、旧runtimeの実行結果を
現行の実装成立へ流用していない。

Phase Capability Inventoryは20フェーズの現行状態、旧到達層、縮退、代表assetを持つが、全assetの意味closureを
示さない。本unit台帳、4,020 asset候補台帳、Phase Capability Inventoryの三つを照合して初めて、各要求について
旧能力、現行との差分、本当に不足する能力を調査できる。

## 検証と停止条件

[静的検査script](../../tools/verify_legacy_ir_product_unit_decomposition.py)は、153件のexact set／順序、原文／digest、
routing、unit cardinality、製品語彙、phase語彙、source span、split clause coverage、状態境界、authority、successor、
metadata集計とoutput digestを確認する。この合格は意味review、人間判断、実装成立を代替しない。

次が残るため、製品単位への要求分離は完了扱いにしない。

1. 正本候補のexact HEADに対する独立reviewと未解決findingの解消。
2. routing訂正候補5件と全unit境界に対する対象revision付き人間decision。
3. 全153件のsuccessor ID、保持atom、未被覆atom、L11の割当。
4. 30 unitの直接phase未解決と、候補188 unitのphase採否。
5. 旧asset 4,020件の意味review、製品直接根拠、consumer closure。

これらが閉じるまで、`new_build_allowed`の解除、旧asset再利用、正式設計・実装、phase完了、Issue closeを生成しない。
