# SCF-B-0147 — Execution Ticket候補8資産の四製品責務境界研究

固定BASE `b3a3c49b34bfaa1cca5861075d1de18c0e5e7204` の資産台帳から、`docs/governance/candidates/execution-ticket-*` に属する全8件を選んだresearch-only Scaffoldです。8件はvision、recognition、requests、requirements、acceptance、trace、validation、intakeからなる同一候補系列です。別テーマまで広げると意味単位が崩れるため、50件上限より小さい系列全体を扱います。

選定時は固定台帳から対象を抽出し、mainの既存分類集合、open PR #2078/#2090/#2094、PR #2092のreconciliation集合、SCF-B-0142の57件を引いた後に対象を確定しました。`validate.py` は対象集合を台帳から独立に再導出し、各集合に対するasset ID、source path、source SHA-256、(ID,path,SHA)の重なりを個別照合します。選定8件との重なりは全キーで0件です。main集合は471行／429 distinct ID、#2078は67、#2090は41、#2094は72、#2092 reconciliationは36、0142は57です。reconciliation集合は新しい分類の集合ではなく、比較用にID/path/SHAを照合しています。

旧文書のsource anchor、archive blob/mode、manifest digest、disposition行、phase bootstrap行、四製品の現行boundary/L1/approval行を固定Git objectから記録します。結果はHARNESS/OSの責務境界にまたがる衝突候補5件、意味的なproduct ownerの基礎が不足する3件です。HARNESS候補はV-model・要求・検証、OS候補はWorker・計測・継続運用の現行境界との比較から置いた研究候補にとどまります。HELIX-WebとHELIX-Web-OSへの正式割当はありません。

実装状態は全件 `unknown`、縮退状態は全件 `unknown`、正式phase admissionは全件未実施、consumer closureは全件pendingです。旧phase bootstrapのcandidate targetと文書存在はphase完了・稼働の証拠ではありません。候補本文中の未実装／未実行表示も、当該archive sourceの外にある現行実装の不存在を証明しません。失敗・consumer inventoryのasset-specific evidenceは確認できず、間接consumerが無いとは結論しません。

旧archiveはGit objectとして読み取り、旧source、test、CI、runtime、hook、adapterは実行していません。正式な資産分類、要求採否、製品owner、phase、実装、縮退、consumer、successor、build authorityを更新しません。

```sh
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/generate.py
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/validate.py
python3 -B scaffold/legacy-execution-ticket-product-classification-0147/selfcheck.py
python3 scaffold/tools/scfctl.py validate
```
