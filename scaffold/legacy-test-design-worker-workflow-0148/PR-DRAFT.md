# SCF-B-0148 旧test-design worker/workflow 52件の初回責務・phase分類候補

## 差分

- 固定BASE `8a9fdc973f3553bea78d022e8d73f109aca526da` から、指定されたsource path／phase／basename条件で52 assetを独立再導出。
- 52件すべてに選択semantic spanと親pair、四製品候補根拠・反証、phase候補、実装／failure／consumerの不明範囲を保持。
- current main `a577a7cddd1405de27bf01d22b050eb2acaa9ba9` の609件（#2094 mergeを含む）、open #2096/#2097の提示HEADとID/path/SHA重複0を記録。mainやPRの候補を採択・authorityにしない。
- Scaffold Bindingへ登録し、旧archiveは静的読取りのみ。

## 状態

全52件の製品境界とphase admissionは未決。PHCAP-07は候補として保持。test-designや引用されたoracleは実装・実行・pass証拠ではない。phase-level degradationは個別asset状態から分離し、consumer closureは未完。

## ローカル確認

```text
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

merge、push、Issue close、旧test/runtime/CI実行はこの候補に含めない。
