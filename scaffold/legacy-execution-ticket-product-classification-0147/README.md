# SCF-B-0147 — Execution Ticket候補8資産の四製品責務境界研究

固定BASE `8a9fdc973f3553bea78d022e8d73f109aca526da`（作業時のcurrent main）の資産台帳から、`docs/governance/candidates/execution-ticket-*` に属する全8件を選んだresearch-only Scaffoldです。8件はvision、recognition、requests、requirements、acceptance、trace、validation、intakeからなる同一候補系列です。別テーマを混ぜず、この系列全体を扱います。

選定対象は固定BASE、open PR #2094 HEAD `32e0f8a8469887ed6baa8294c4597d51614bcaeb`、open PR #2096 HEAD `ab0a1faa4e2b310206b97a786c329334a2a0e151`の分類集合と照合しました。PR #2090 HEAD `4b6e1bbf122b03fd3531047290161aced34eefda`はBASEへ統合済みのため、main集合に一度だけ含め、独立したopen PR集合として重ねて数えていません。`validate.py` は対象集合を固定BASE台帳から独立に再導出し、各比較集合に対するasset ID、source path、source SHA-256、(ID,path,SHA)の重なりを個別照合します。選定8件との重なりは全キーで0件です。集合の行数とdistinct ID数は`inventory.json`に固定しています。

比較起点BASE `0871112f37d42fd0b01d3e5290632d2306463320`から7bed4fcd1f50721592b0ce25a8c5d4ee71220b0b（#2092反映後）までは、mainの分類集合が538行／496 distinct IDのままで、#2092による追加は0件でした。その後、#2090統合で41分類資産が加わり、現BASEは579行／537 distinct IDです。対象8件のID、source path、source SHA-256は両方のmain revisionで不変で、disposition／phase台帳、境界、承認decision、L1、failure／consumer inventory、archive manifestの固定根拠bytesも現BASEまで変わっていません。比較対象は各PRの指定HEADに固定し、編集中worktreeは読みません。

旧文書のsource anchor、archive blob/mode、manifest digest、disposition行、phase bootstrap行、四製品の現行boundary/L1/approval行を固定Git objectから記録します。結果はHARNESS/OSの責務境界にまたがる衝突候補5件、意味的なproduct ownerの基礎が不足する3件です。HARNESS候補はV-model・要求・検証、OS候補はWorker・計測・継続運用の現行境界との比較から置いた研究候補にとどまります。HELIX-WebとHELIX-Web-OSへの正式割当はありません。

実装状態は全件 `unknown`、縮退状態は全件 `unknown`、正式phase admissionは全件未実施、consumer closureは全件pendingです。旧phase bootstrapのcandidate targetと文書存在はphase完了・稼働の証拠ではありません。候補本文中の未実装／未実行表示も、当該archive sourceの外にある現行実装の不存在を証明しません。失敗・consumer inventoryのasset-specific evidenceは確認できず、間接consumerが無いとは結論しません。

旧archiveはGit objectとして読み取り、旧source、test、CI、runtime、hook、adapterは実行していません。正式な資産分類、要求採否、製品owner、phase、実装、縮退、consumer、successor、build authorityを更新しません。

```sh
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/generate.py
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/validate.py
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/selfcheck.py
python3 scaffold/tools/scfctl.py validate
```
