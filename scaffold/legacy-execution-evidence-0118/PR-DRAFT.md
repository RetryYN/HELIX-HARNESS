# Fix: SCF-B-0118 の旧receipt結果分類をfail-closed化

## 問題と修正

終了コードmarkerのregexが読める十進数部分だけを拾い、同じ行の`vitest exit=0; vitest exit=0x1`を有効なexit=0として扱って`pass_observed`にできた。続く監査再現では、`,`／`;`／`|`で値を切り出して余剰tokenを捨てるため、`exit=0,0x1`、`exit=0|N/A`、`exit=0; N/A`もpassになった。markerを先に全出現検出し、marker間の区切りは次の認識済みmarkerがある場合だけ分離し、単独markerの値領域全体をparseする。`0x1`、`N/A`、空値、delimiter後の余剰tokenを含むparse不能markerは`unparseable_exit_observations`とresult reasonへ保持し、failure markerへ混ぜずverdictなしにする。既存のasset-level分類契約として、JSONはsuite/test countの非負整数、総和整合、正のpass countを必須にし、textは行頭から行末までの構造化pass summary、正のfailed数、fatal/error/failure、exit codeを別々に評価する。正のpass summaryには明示的なexit=0（`vitest exit=0`、`Exit code: 0`、`exited with code 0`）を必須化し、exit欠落、負値を含むnonzero、散文のpass表現、passとの矛盾はverdictなしへ倒す。既存receiptのISO timestamp annotationは維持する。行全体が`0 failed`／`0 errors`だけの場合はfailure markerにせず、`FAIL ... 0 errors`のような混在行はfailureとして扱う。`npm ERR!` markerもfail-closed観測にする。FAIL_REはpath区切り、dot、ハイフンに連結された語をfailure markerから除外し、bare FAIL／failed／fatal／error／segmentation fault／npm ERR!を維持する。

`generate.py`は`common.py`を使い、validatorは同じ明示仕様の独立oracle実装を持つ。生成値と検証値の一致でdriftを検出し、意味的独立性は主張しない。selfcheckにはO01–O42の42観測状態（comma／pipe／semicolon後の余剰token、正当なcomma／pipe／semicolonで分離した複数marker、許可外境界のmarker、既存timestamp suffix、同一行の`vitest exit=0; vitest exit=2`全件抽出、hex、N/A、空値、一部parse不能な複数marker、suite/testの整合したtodo未完了、混在したFAIL＋zero errors、`npm ERR! code 1`、path中のerror語、ハイフン連結語を含む）とN01–N32の32負例を追加し、recordの`authority_effect`／`asset_role`、inventoryの`schema_revision`／`binding_id`、`anchor_rule`／`exploration`、破損JSON／JSONLも検査する。

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
- text: pass summary + exit=2、同一行のmixed decimal exit（`vitest exit=0; vitest exit=2`）、負値exit、hex／N/A／空値／一部parse不能な複数markerはいずれもpassにしない
- text: 単独markerの`exit=0,0x1`、`exit=0|N/A`、`exit=0; N/A`はいずれもunparseableでpassにしない。次markerがあるcomma／pipe／semicolonはmarker間の区切りとして処理する
- text: marker間に許可外の`/`区切りがある場合、先行markerをunparseableとしてunknownにし、後続markerの値と分けて保持する
- text: 既存`vitest exit=0 at 2026-09-06T19:42:32Z` timestamp annotationはdecimal exit=0として維持する
- JSON: suite/test countが整合したtodo未完了（suite passed=1/todo=1/total=2、test passed=1/todo=1/total=2）は`pass_with_pending`として観測し、failure/pendingを0のまま保持
- text: exit欠落、散文中のpass表現
- text: bare `FAIL`／bare `failed`／`Segmentation fault`はfailure markerとして観測する
- text: `src/error-handling.test.ts`と`error-handling`／`fail-safe`等のハイフン連結語は、pass summary＋exit=0ではfailure markerにしない
- text: `0 failed`／`0 errors`はfailure markerにしない
- text: `Exit code: 0`／`exited with code 0`は明示成功exitとして認識
- identity-only receiptはverdictなし

## 検証

`generate.py`再生成、`validate.py` PASS（28件）、selfcheck 32負例＋42観測状態 PASS、scfctl validate／stale／residuals、py_compile、diff checkを実施する。生成後の固定集計は `pass_observed=22`、`pass_with_pending=1`、verdictなし=5、failure observed=1。追加したsynthetic observationはunparseable exitをfailure markerへ混ぜず、単独marker値の余剰tokenを拒否する。旧archiveは固定Git objectの静的読取だけで、旧runtime／test／CIは実行していない。Progress reference #1813 はcloseしない。
