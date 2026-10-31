# WR255 SEC009 L5/L8 pair監査

この監査はSEC009のL5/L8 V-pair候補を記録するscaffold evidenceです。authorityを持たず、security algorithm、runtime、test、CI、外部操作を実行しません。4層検証の完了を主張しません。

## 再実行

repository rootから次を実行します。

```sh
python3 scaffold/research/wr255-sec009-l5l8-audit-20261101/validate_wr255_l5l8.py
```

通常実行はread-onlyで、測定summaryをstdoutへ出し、ファイルを作りません。証拠を保存する場合だけ `--record` を付けます。保存時は実行ごとの一意なpathをexclusive createし、既存pathを上書きしません。

```sh
python3 scaffold/research/wr255-sec009-l5l8-audit-20261101/validate_wr255_l5l8.py --record
```

初回測定とその後の旧時点summary/reportはGit履歴で保全し、commit・blob・SHA-256と復元commandを[統合disposition](measurement-artifact-disposition.json)に記録しました。current treeには最新overlayの測定summaryと対応check-child reportを各1本だけ保持します。positive最小期待の設計後の追補はsource revision `24d7f00bdca41c3dfb1f3137655ffdbe3674cfb3`、L8 SHA-256 `91da3af2c6ad997fdf265871f9776c5bed41f196fbccfc2276e1a41f42a267bb` に固定されています。L4/L5/L8/L9の32 class identity、L5 rule IDの保持、L4/L5 codeとownerの対応、L9 source caseに結びつく285件のU-IDを照合します。negative U-IDの `condition`、`expected`、`expected_preserved` はL4 classと比較します。positive 8件は契約最小期待を設計し、実測未観測としたうえで個別 `oracle_id` と `test_citation` がnullであることを確認します。

## U-ID表とsource参照

L8 `unit_cases` の `id` は `SEC009-U0001`〜`SEC009-U0285` の専用連番です。元のSEC009 source IDは `case_id` と `integration_case_ref` に保持します。L8 `cases` は契約単位の概要だけを持ち、`positive_cases`、`negative_cases`、`source_case_refs` の重複行群と重複`unit_case_source_index`は置きません。validatorは285 U-ID行の`integration_case_ref`をL9 `integration_cases`のIDと照合し、L9のcase-specific sourceはL9本文内でIDから解決します。negative行は`negative_class_ref`、`rule_ref`、`function_ref`でL4 classとL5 rule/ownerを引きます。

各negative行のcounterexampleは対象と食い違いを日本語で短く説明し、L4 classが示す失敗の意味を添えます。source IDの言い換えだけにはしていません。R1指摘の「識別子:が欠落/unknown」等13行を読み直して句読点を文に直し、他の反例本文は維持しました。sourceのL9 `given` に具体値がないconflict行では、値が根拠に記載されていないと明記し、値の組を補っていません。各行には契約単位の `system_oracle_ref` を残し、個別の `oracle_id` と `test_citation` はnullのままにしています。negative期待値はL9 `expected_proposal` ではなくL4から導きます。

class tableをaxis、state、owner、expected classificationの共有元とします。重複する行別 `source_pointers`、`expected_property`、classのaxis/state投影は取り除きました。checkerが各L8行に必要とする `condition`、`expected`、`expected_preserved` は保持し、L5 ownerを解決する `function_ref` もnegative行に残します。

validatorはnegative 277行それぞれのL9 nested pointerを解決します。全givenに共通の `evidence_limit` があるだけで、具体的なidentity値やconflict値は含まれていません。そこでcounterexampleはsource case markerにある対象・不足またはconflictの種類とL4 classの意味を説明します。実際値は記録・推測していません。

## positive行の最小期待と根拠境界

8件のpositive IDについてcanonical L9 nested sourceを確認しました。各 `given` は共通 `evidence_limit` のみで、case-specific fixture値や実観測を含みません。L9 `expected_proposal` は期待値の根拠に使っていません。代わりにcase markerの抽象条件とL3/L10/L4契約から、結果値を作らない最小意味を設計し、各U-IDに `condition`、`expected`、`expected_preserved` と共有の `positive_expectation_ref` を記録しました。

5件の `ONLY-…-UNSELECTED-ABSENT` は、case markerが示す対象recipientの不在を選択閉包の不足や任意operation開始条件へ広げない期待です。`EMPTY-RECIPIENT-SET` は、独立期待集合と選択集合が空として解決する場合のrecipient別空出力を扱います。`OS-OFFLINE-INDEPENDENT-RECOVERY-SELECTION` は、独立復旧経路に停止中OSや通常009応答を普遍的前提とせず、隔離と復旧素材を分ける期待です。F02の一般文書meaning unknownは全操作・全scope停止へ拡張せず、unknownから安全分類を作らない期待です。

これらは契約最小期待の設計であり、行固有fixtureによる実測ではありません。期待の共有根拠pointerはL3 B01/F02、L10 B01/F02、L4 B01/F02とF02 architectureです。`HELIXSECURITY-L10-009-B01/F02` は契約単位system oracleであり、個別U-ID oracleは未確認でnullです。test citationも根拠に見つからないためnullです。

## check-childの計測結果

latest `origin/main` をmergeしたL5/L8候補とcanonical L4/L9を照合したstatic checker結果は次の通りです。過去のpair単独測定は書き換えず、L4/L9補足と組み合わせた測定は[別V-pairの証拠](../wr255-sec009-l4l9-supplement-20261101/README.md)とそのoverlay reportに分けて保持しています。

- L4/L9 pair: pass
- L5/L8 pair: pass
- 4層matched cases: 277
- 4層のfailure: 0
- positive最小期待の設計済み（実測未観測）: 8

277件のmatchedは現行static checkerの構造照合結果です。positive 8件は契約最小期待を設計した段階であり、fixture観測ではありません。個別 `oracle_id` と `test_citation` は引き続きnullです。この計測はruntime動作やsecurity behaviorの証明ではありません。

## 最新main overlayと固定証拠

fresh fetch/ls-remoteで一致確認したlatest main `9cce1cc5238de71231b1fcd37727391113e17956`を第1親にPR-B HEAD `11ccad81240e243a42392e29c15677772ff6526d`をno-commit overlayして再検証しました。L4/L9・L5/L8 pair pass、4wayは277 matched / 0 failures、pointer移行validator pass、scfctl validate 207/fail 0・stale 0です。validatorを2回とpointer validatorをread-only実行し、overlay worktreeのstatus不変を確認しました。次のsummary/reportはfeature branchのcurrent sourceを測った保存証拠です。positive 8件は設計済み・未観測、個別oracleとtest citationはnullです。

- [verification summary](verification-summary-l4-d670496eeb-00376c40-l5-ea8e3c2510-1aefb9b6-l8-0451f67e4b-49875dcd-l9-087f02dc63-e918a289-validator-b2cd66c3-record-1793485186690215383-388303.json)
- [check-child report](check-child-report-l4-d670496eeb-00376c40-l5-ea8e3c2510-1aefb9b6-l8-0451f67e4b-49875dcd-l9-087f02dc63-e918a289-record-1793485186690215383-388303.json)
- [L8 pointer transfer audit](pointer-transfer-audit-49875dcdb4bc-e918a289fe88.json)

summaryは正本285行の内容を再複製せず、validatorで再計算したrow/class audit digestを記録します。詳細値は固定revision・SHAを持つL4/L5/L8/L9正本にあり、再現validatorは285行すべてのpointerと期待を検査します。

事前生成の展開版summaryはSHA-256 `7e09863b58053b03e833df14d034f7c8d52b5a9ff3e0344a996aa0a82c9d4446` で、commit `69fbb3e2f0` のvalidatorから完全一致で再生成可能です。復元手順は[統合disposition](measurement-artifact-disposition.json)にあります。

## SCF-B-0209 pointer移行

修正前のL8 `cases`に含まれた重複wrapper 275件は正本配列の撤去とともに現行ファイルから除きました。これは275件の独立aliasへ転送した件数ではありません。現在残るL8 taxonomy pointer 30件をcanonical L4 `/failure_classifications/{index}`へ解決し、nested `code`とcanonical `class_id`の一致を確認します。旧nested値はclassごとに照合し、`change`/`axis`/`state`/`backflow_owner`/`expected`/`expected_preserved`/`expected_side_effect_count`/`source_pointers`は30 classすべてで型と値が一致します。旧`expected_text`はcanonical側に同名fieldがないため、`condition + " " + expected_preserved.contract_detail`で再構成し、元の30文字列と型が一致することをvalidatorが確認します。

R2時点の未割当監査にあるL4参照3件（F01の14要素collection 1件、F02の単体class 2件）は、過去の未割当判断を保持するためL4固定revision `c50eb21b34f034262ced3f8052d2502fb84c57c9`を参照します。collectionの14要素をcurrent 32 classから同じ順序の集合としてJSON Pointer一つで選ぶことはできません。削除したL8 case群を指していた監査内2件は、参照先objectの値を確認したうえで、固定L9 revision `40d6da48a44625bfd064ccabceb7f7ecb47dcd7c`上の同一case objectへ直接付け替えました。L8のF02 source-review pointer `/diagnostic_contract/locality`の訂正履歴は旧L8 revision `24d7f00bdca41c3dfb1f3137655ffdbe3674cfb3`・SHA-256 `91da3af2c6ad997fdf265871f9776c5bed41f196fbccfc2276e1a41f42a267bb`にあり、現行L4 `/architecture/locality`へ訂正済みです。

再帰走査で確認した現行nested pointer文字列はL8が3件（すべて固定R2 L4参照）、L9が583件（`cases` 550件、`negative_class_assignment_audit` 33件）、L5 `failure_rules`が30件です。R1前のL8 wrapper 275件は削除済みです。旧auditの「L8 308件」「L9 308件」は旧時点に認識したconsumer subsetの測定であり、raw pointer文字列の全件数ではありません。L9とL5は各V-pairの別途確認が必要なため、L4のnested payloadを残し、全consumerの移行と照合が揃うまでSCF-B-0209のcheck-replacementとretireを行いません。

再現コマンドは次の通りです。

```sh
python3 scaffold/research/wr255-sec009-l5l8-audit-20261101/validate_pointer_transfer.py
```

監査ではcurrent checkerの明示class modeと`CHK-JSON-POINTER`の読取を確認します。明示modeの4-way照合はtop-level class表を使い、pointer checkerは参照先を解決します。legacy modeはnested classificationを読むため、明示modeのmarkerを維持します。SCF-B-0209はpendingのままです。L8の削除済みcase群、残るL8歴史参照、L5の30件、L9の583 raw pointer文字列をconsumer別に扱い、別V-pair分の移行後に全体を再評価します。

## 測定artifactの履歴と集約

修正前のcheck-child report、summary、308 subsetのpointer auditは現行測定ではなく、固定時点の意味をGit履歴と[統合disposition](measurement-artifact-disposition.json)に保持します。異なる各revisionのcommit・blob SHA-1・content SHA-256・復元command、同一bytesの重複関係、旧full-report pointerを同dispositionに集約しました。current treeにはこの修正後のsummary/reportを各1本、全consumerを数え直したpointer-transfer監査を1本だけ保持します。
