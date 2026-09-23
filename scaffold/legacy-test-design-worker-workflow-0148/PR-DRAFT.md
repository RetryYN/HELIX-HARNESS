# SCF-B-0148 旧test-design worker/workflow 52件の初回責務・phase分類候補

## 差分

- 固定BASE `8a9fdc973f3553bea78d022e8d73f109aca526da` から、指定されたsource path／phase／basename条件で52 assetを独立再導出。
- 52件すべてに選択semantic spanと親pair、四製品候補根拠、phase候補、実装／failure／consumerの不明範囲を保持。HARNESS-L1-004のtest-design義務・反例・証拠・consumer条件と、OS側のsource-specific tested runtimeを分け、47件をsplit候補、3件をHARNESS候補、2件を根拠不足として保留（正式採択0）。
- 固定比較snapshotとしてmain `be9cf8cf99ee94a487e54d372d7a34e9266b1ee3` の666 unique ID（#2094と#2096 mergeを含む）と、open #2097 exact HEAD `211712a0aba71ea7461f53e7f824879de5bcff48` の8 IDを静的比較し、0148対象52件とのID/path/SHA各射影の重複0を再計算。いずれかのHEAD進行を確認した場合は結果をstaleとして扱い、再導出まで新たな比較結果として利用・報告しない。validatorはremote HEADの鮮度を自動取得・保証しない。mainやPRの候補を採択・authorityにしない。
- 固定BASE crosswalk bootstrapでは、対象52件のうち31件が検索候補 `candidate_asset_pool` に出現し、1件が `representative_legacy_assets` に19 unit候補参照を持つ。phase inventoryの代表参照は1件。これらは直接semantic/consumer linkではない。LABOはこの4製品scopeに含めず、分類も恒久的非適用判断もしない。
- Scaffold Bindingへ登録し、旧archiveは静的読取りのみ。

## 状態

全52件の製品境界とphase admissionは未決。分類ledgerは固定validator contractの全record digestとledger byte digestで固定する。bootstrap・archive blob/MANIFEST・親pairをBASEから再導出し、inventoryのunionとBindingのartifact closureを含む完全一致と型検査を行う。PHCAP-07は候補として保持。test-designや引用されたoracleは実装・実行・pass証拠ではない。phase-level degradationは個別asset状態から分離し、consumer closureは未完。

## ローカル確認

```text
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
python3 scaffold/legacy-test-design-worker-workflow-0148/validate.py
python3 scaffold/legacy-test-design-worker-workflow-0148/selfcheck.py
git diff --check
```

merge、post-merge read-after、Issue close、旧test/runtime/CI実行はこの候補に含めない。
