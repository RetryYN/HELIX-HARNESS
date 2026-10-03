# Fix: SCF-B-0118 の旧receipt結果分類をfail-closed化

## 問題と修正

exit markerの読み取りが値全体を検査せず、句読点付きnonzero（`exit code 1;`や`Process finished with exit code 1.`）をunknown扱いにしてfailure観測を落とし、追加語彙の`exit_code=1`等を見逃すと、同じreceiptにある`vitest exit=0`だけで誤ってpassを記録できる。parse不能な値は依然としてverdictなしに保ち、先頭に非ゼロの十進整数がある場合は曖昧なasset-level failure候補として記録する。検出語彙を`vitest exit`、`exit`／`exit code`、`exit_code`、`exited with code`／`exited with status`、`returncode`／`return_code`、`rc`へ明示し、digit-adjacentな`0exit code 1`も境界不明としてpassを阻止する。`exit_code`等を含むpathは値形式が続かない場合markerとして誤検出しない。

共通classifierとvalidatorの独立oracleは同じ観測仕様を別々に実装し、selfcheckが出力一致を検証する。意味的独立性は主張しない。validatorはinventoryとevidence recordをrecursive exact-type比較し、Pythonの`True == 1`や`28.0 == 28`で型混同を通さない。asset-level分類の既存契約は維持する。JSONはsuite/test countの非負整数、総和整合、正のpass countを必須にし、textは行頭から行末までの構造化pass summaryを使う。正のpass summaryには明示的なexit=0を要求し、欠落、負値を含むnonzero、散文のpass表現、passとの矛盾はverdictなしにする。ISO timestamp annotation、`0 failed`／`0 errors`、path中のerror語、hyphenated word、bare FAIL／failed／fatal／error／segmentation fault／`npm ERR!`の既存挙動を維持する。

O01–O42の42観測状態とN01–N32の32負例は既存selfcheckから維持する。今回のfollow-upで追加した観測状態はO43–O50の8件（句読点付きnonzero候補、`exit_code`／`rc`／`returncode`／`exited with status` alias、digit-adjacent境界不明marker、path aliasの誤検出防止）であり、新規負例はN33–N36の4件（bool/intおよびfloat/intの型混同）である。負例の既存範囲や観測数を遡って「追加」とは記述しない。

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
- text: marker間に許可外の`/`区切りがある場合、両markerをunparseableとしてunknownにし、それぞれ別recordで保持する
- text: `Process finished with exit code 1.`／`exit code 1;`は値全体がparse不能でも先頭nonzeroをfailure observationへ記録し、verdictを出さない
- text: `vitest exit=0`と`exit_code=1`／`rc=1`／`returncode=1`／`exited with status 1`の混在は、どのaliasも見逃さずpassを阻止する
- text: `0exit code 1`はmarker boundary不明としてunparseable・failure observedにし、`exit_code`／`rc`／`returncode`を含むpath名は値形式が続かない限りmarkerにしない
- text: 既存`vitest exit=0 at 2026-09-06T19:42:32Z` timestamp annotationはdecimal exit=0として維持する
- JSON: suite/test countが整合したtodo未完了（suite passed=1/todo=1/total=2、test passed=1/todo=1/total=2）は`pass_with_pending`として観測し、failure/pendingを0のまま保持
- text: exit欠落、散文中のpass表現
- text: bare `FAIL`／bare `failed`／`Segmentation fault`はfailure markerとして観測する
- text: `src/error-handling.test.ts`と`error-handling`／`fail-safe`等のハイフン連結語は、pass summary＋exit=0ではfailure markerにしない
- text: `0 failed`／`0 errors`はfailure markerにしない
- text: `Exit code: 0`／`exited with code 0`は明示成功exitとして認識
- identity-only receiptはverdictなし

## 検証

`generate.py`再生成、`validate.py` PASS（28件）、selfcheck 36負例＋50観測状態 PASS、scfctl validate／stale／residuals、py_compile、diff checkを実施する。生成後の固定集計は `pass_observed=22`、`pass_with_pending=1`、verdictなし=5、failure observed=1。新しいsynthetic observationはparse不能なnonzero prefixをasset-level failureへ記録しつつ、unit-level verdictを作らない。旧archiveは固定Git objectの静的読取だけで、旧runtime／test／CIは実行していない。Progress reference #1813 はcloseしない。
