# Fix: SCF-B-0118 の旧receipt結果分類をfail-closed化

## 問題と修正

旧test receiptのasset-level分類器が、失敗数を持つJSON、必要countが欠けたJSON、`0 passed`、pass summary後の非zero exitを `pass_observed` と判定できた。JSONはsuite/test countの非負整数、総和整合、正のpass countを必須にし、textは行頭から行末までの構造化pass summary、正のfailed数、fatal/error/failure、exit codeを別々に評価するようにした。正のpass summaryには明示的なexit=0（`vitest exit=0`、`Exit code: 0`、`exited with code 0`）を必須化し、exit欠落、負値を含むnonzero、0x形式、散文のpass表現、passとの矛盾はverdictなしへ倒す。行全体が`0 failed`／`0 errors`だけの場合はfailure markerにせず、`FAIL ... 0 errors`のような混在行はfailureとして扱う。`npm ERR!` markerもfail-closed観測にする。

`common.py`とvalidatorは同じ観測仕様を二重実装し、生成値と検証値の一致でdriftを検出する。意味的に独立したoracleとは主張しない。selfcheckにはO01–O26の26観測状態（混在したFAIL＋zero errors、`npm ERR! code 1`を含む）とN01–N32の32負例を追加し、recordの`authority_effect`／`asset_role`、inventoryの`schema_revision`／`binding_id`、`anchor_rule`／`exploration`、破損JSON／JSONLも検査する。

## 再分類結果

- 対象28 assetは不変（JSON 21、text 5、identity receipt 2）。
- `pass_observed`: 直前値24 → 今回22。
- `pass_with_pending`: 1 → 1。
- verdictなし: 直前値3 → 今回5。
- verdictなし5件はidentity-only 2件、CE767のfailure marker 1件、明示的なexit=0を欠くtext 2件。unit-level verdict、acceptance、旧実装、縮退、current実装、formal authorityは更新していない。

## 監査再現

次を直接試験し、いずれもpassへ昇格しないことを固定した。

- JSON: success 0 / failure 2
- JSON: count全zero、suite/test count欠測または総和不整合
- text: 0 passed / 2 failed
- text: pass summary + exit=2、負値exit、`vitest exit=0x1`
- text: exit欠落、散文中のpass表現
- text: bare `FAIL`／bare `failed`／`Segmentation fault`はfailure markerとして観測する
- text: `0 failed`／`0 errors`はfailure markerにしない
- text: `Exit code: 0`／`exited with code 0`は明示成功exitとして認識
- identity-only receiptはverdictなし

## 検証

`generate.py`再生成、`validate.py` PASS（28件）、selfcheck 32負例＋26観測状態 PASS、scfctl validate／stale／residuals、py_compile、diff checkを実施する。生成後の固定集計は `pass_observed=22`、`pass_with_pending=1`、verdictなし=5、failure observed=1。旧archiveは固定Git objectの静的読取だけで、旧runtime／test／CIは実行していない。Progress reference #1813 はcloseしない。
