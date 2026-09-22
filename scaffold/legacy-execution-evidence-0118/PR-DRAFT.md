# Fix: SCF-B-0118 の旧receipt結果分類をfail-closed化

## 問題と修正

旧test receiptのasset-level分類器が、失敗数を持つJSON、必要countが欠けたJSON、`0 passed`、pass summary後の非zero exitを `pass_observed` と判定できた。JSONはsuite/test countの非負整数、総和整合、正のpass countを必須にし、textは正のpass数、正のfailed数、fatal/error、exit codeを分離した。失敗・非zero exit・成功との矛盾はverdictなし、欠測・不整合もunknownへ倒す。

generatorの状態機械とvalidatorの独立oracleを分け、分類関数へ直接与える13ケースを追加した。既存の24 mutation caseも維持する。

## 再分類結果

- 対象28 assetは不変（JSON 21、text 5、identity receipt 2）。
- `pass_observed`: 25 → 24。
- `pass_with_pending`: 1 → 1。
- verdictなし: 2 → 3。
- `LEGACY-ASSET-CE767996F54E28A6486B` はpass summaryと `fatal:` markerが併存するため、verdictなし＋asset-level failure observedへ訂正した。
- unit-level verdict、acceptance、旧実装、縮退、current実装、formal authorityは更新していない。

## 監査再現

次を直接試験し、いずれもpassへ昇格しないことを固定した。

- JSON: success 0 / failure 2
- JSON: count全zero
- JSON: suite/test count欠測または総和不整合
- text: 0 passed / 2 failed
- text: pass summary + exit=2
- text: 0 failed はfailure markerにしない
- identity-only receiptはverdictなし

## 検証

`generate.py`再生成差分なし、`validate.py` PASS（28件）、selfcheck 24負例＋13分類ケース PASS、scfctl 123 bindings / fail 0、stale 0、residuals 0、py_compile、diff check PASS。

旧archiveは固定Git objectの静的読取だけで、旧runtime／test／CIは実行していない。Progress reference #1813 はcloseしない。
