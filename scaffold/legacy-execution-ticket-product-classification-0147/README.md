# SCF-B-0147 — Execution Ticket候補8資産の四製品責務境界研究

固定BASE `0871112f37d42fd0b01d3e5290632d2306463320`（現origin/main）の資産台帳から、`docs/governance/candidates/execution-ticket-*` に属する全8件を選んだresearch-only Scaffoldです。8件はvision、recognition、requests、requirements、acceptance、trace、validation、intakeからなる同一候補系列です。別テーマまで広げると意味単位が崩れるため、50件上限より小さい系列全体を扱います。

選定対象は現origin/main、open PR #2090 HEAD `f075c91c03e8ebff5e9c30c8a6974a6e9389b40e`、open PR #2094 HEAD `e5fc691c33f182f036048904b699e448795c2e20`、open PR #2096 HEAD `ab0a1faa4e2b310206b97a786c329334a2a0e151`の分類集合と照合しました。`validate.py` は対象集合をorigin/main台帳から独立に再導出し、各集合に対するasset ID、source path、source SHA-256、(ID,path,SHA)の重なりを個別照合します。選定8件との重なりは全キーで0件です。集合の行数とdistinct ID数は`inventory.json`に固定しています。

元の保存時BASE `b3a3c49b34bfaa1cca5861075d1de18c0e5e7204` から再baselineしました。対象8件のID、source path、source SHA-256は現origin/mainでも不変で、台帳・phase、境界、承認decision、L1、failure/consumer inventory、archive manifestの根拠bytesも変わっていません。比較対象は各PRの指定HEADに固定し、編集中worktreeは読みません。

旧文書のsource anchor、archive blob/mode、manifest digest、disposition行、phase bootstrap行、四製品の現行boundary/L1/approval行を固定Git objectから記録します。結果はHARNESS/OSの責務境界にまたがる衝突候補5件、意味的なproduct ownerの基礎が不足する3件です。HARNESS候補はV-model・要求・検証、OS候補はWorker・計測・継続運用の現行境界との比較から置いた研究候補にとどまります。HELIX-WebとHELIX-Web-OSへの正式割当はありません。

実装状態は全件 `unknown`、縮退状態は全件 `unknown`、正式phase admissionは全件未実施、consumer closureは全件pendingです。旧phase bootstrapのcandidate targetと文書存在はphase完了・稼働の証拠ではありません。候補本文中の未実装／未実行表示も、当該archive sourceの外にある現行実装の不存在を証明しません。失敗・consumer inventoryのasset-specific evidenceは確認できず、間接consumerが無いとは結論しません。

旧archiveはGit objectとして読み取り、旧source、test、CI、runtime、hook、adapterは実行していません。正式な資産分類、要求採否、製品owner、phase、実装、縮退、consumer、successor、build authorityを更新しません。

```sh
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/generate.py
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/validate.py
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/selfcheck.py
python3 scaffold/tools/scfctl.py validate
```
