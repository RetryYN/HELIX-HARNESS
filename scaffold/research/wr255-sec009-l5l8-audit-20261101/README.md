# WR255 SEC009 L5/L8 pair監査

この監査はSEC009のL5/L8 V-pair候補を記録するscaffold evidenceです。authorityを持たず、security algorithm、runtime、test、CI、外部操作を実行しません。4層検証の完了を主張しません。

## 再実行

repository rootから次を実行します。

```sh
python3 scaffold/research/wr255-sec009-l5l8-audit-20261101/validate_wr255_l5l8.py
```

初回測定はcommit `9dffee8c34` の `verification-summary.json` と `check-child-report.json` に固定してあります。validatorの再測定はこの初回記録を書き換えず、L8 source revisionとSHA-256を含む別file名で追記します。追補には後続source revision `cb44877e1db6`、L8 SHA-256 `27531334c998af878f98714b89878ca23c41f75cfd130bae13c817eee9d1ce2c` の測定を記録します。L4/L5/L8/L9の32 class identity、L5 rule IDの保持、L4/L5 codeとownerの対応、L9 source caseに結びつく285件のU-IDを照合します。negative U-IDの `condition`、`expected`、`expected_preserved` はL4 classと比較します。positive 8件は未確定のまま、各行の `oracle_id` と `test_citation` はnullであることを確認します。

## U-ID表とsource参照

L8 `unit_cases` の `id` は `SEC009-U0001`〜`SEC009-U0285` の専用連番です。元のSEC009 source IDは `case_id` と `integration_case_ref` に保持します。`unit_case_source_index` は各U-IDを一度だけL9 source pointerへ結び、negative行はL4 classとL5 ruleへのpointerも記録します。

各negative行のcounterexampleは対象と食い違いを日本語で短く説明し、L4 classが示す失敗の意味を添えます。source IDの言い換えだけにはしていません。sourceのL9 `given` に具体値がないconflict行では、値が根拠に記載されていないと明記し、値の組を補っていません。各行には契約単位の `system_oracle_ref` を残し、個別の `oracle_id` と `test_citation` はnullのままにしています。negative期待値はL9 `expected_proposal` ではなくL4から導きます。

class tableをaxis、state、owner、expected classificationの共有元とします。重複する行別 `source_pointers`、`expected_property`、classのaxis/state投影は取り除きました。checkerが各L8行に必要とする `condition`、`expected`、`expected_preserved` は保持し、L5 ownerを解決する `function_ref` もnegative行に残します。L9には対応する行別期待値がまだないため、4層checkerの照合はL4/L9補足がcanonical L9に反映されるまで未成立です。

validatorはnegative 277行それぞれのL9 nested pointerを解決します。全givenに共通の `evidence_limit` があるだけで、具体的なidentity値やconflict値は含まれていません。そこでcounterexampleはsource case markerにある対象・不足またはconflictの種類とL4 classの意味を説明します。実際値は記録・推測していません。

## positive行の最小期待と根拠境界

8件のpositive IDについてcanonical L9 nested sourceを確認しました。各 `given` は共通 `evidence_limit` のみで、case-specific fixture値や実観測を含みません。L9 `expected_proposal` は期待値の根拠に使っていません。代わりにcase markerの抽象条件とL3/L10/L4契約から、結果値を作らない最小意味を設計し、各U-IDに `condition`、`expected`、`expected_preserved` と共有の `positive_expectation_ref` を記録しました。

5件の `ONLY-…-UNSELECTED-ABSENT` は、case markerが示す対象recipientの不在を選択閉包の不足や任意operation開始条件へ広げない期待です。`EMPTY-RECIPIENT-SET` は、独立期待集合と選択集合が空として解決する場合のrecipient別空出力を扱います。`OS-OFFLINE-INDEPENDENT-RECOVERY-SELECTION` は、独立復旧経路に停止中OSや通常009応答を普遍的前提とせず、隔離と復旧素材を分ける期待です。F02の一般文書meaning unknownは全操作・全scope停止へ拡張せず、unknownから安全分類を作らない期待です。

これらは契約最小期待の設計であり、行固有fixtureによる実測ではありません。期待の共有根拠pointerはL3 B01/F02、L10 B01/F02、L4 B01/F02とF02 architectureです。`HELIXSECURITY-L10-009-B01/F02` は契約単位system oracleであり、個別U-ID oracleは未確認でnullです。test citationも根拠に見つからないためnullです。

## check-childの計測結果

このL5/L8候補だけをcanonical L9と照合したpair固有のstatic checker結果は次の通りです。L4/L9補足と組み合わせた別worktreeのoverlay結果は、[L4/L9補足](../../wr255-sec009-l4l9-supplement-20261101/README.md)およびその `overlay-check-child-d646a09e-cb6e085e-00376c40.json` に分けて記録しています。

- L4/L9 pair: pass
- L5/L8 pair: pass
- 4層matched cases: 0
- 4層のfailure: 2,235
- positive最小期待の設計済み（実測未観測）: 8

このpair単独の結果ではL9行のcondition/expected/expected_preservedとcompact observationが不足するため、negative行はmatchedになりません。L4/L9補足を組み合わせたoverlayは別の候補と検証結果として扱い、正式な4層検証やsecurity behaviorの証明とはしません。
