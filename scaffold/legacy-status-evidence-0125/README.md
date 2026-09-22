# SCF-B-0125 旧status候補13件の静的evidence partition

固定BASE `bab1ca011a407112920aad1e6bfcfe5e79bc8122` の旧asset ledgerから、旧実装の履歴的主張、partial/degraded、failure、consumerを時間・対象・反証を分けて読む最小研究束である。選定対象は次の13 asset IDを固定順で全件収録する。

- `LEGACY-ASSET-FC00E18B0184CD15033E`
- `LEGACY-ASSET-14C0516250418981B156`
- `LEGACY-ASSET-21039705931BB982EE0E`
- `LEGACY-ASSET-961D6EFEE6F94569D113`
- `LEGACY-ASSET-BDFA744FAF7312826672`
- `LEGACY-ASSET-EEEAD0B3DFB1D12AC571`
- `LEGACY-ASSET-61BA713A6C7588D8AA85`
- `LEGACY-ASSET-7ED36EDFF34D5A6F2A41`
- `LEGACY-ASSET-86214CFBCCC55483170C`
- `LEGACY-ASSET-046F2B43CDD5A827CC95`
- `LEGACY-ASSET-5094F36916F00C37F385`
- `LEGACY-ASSET-61D85EE372040EBCB68B`
- `LEGACY-ASSET-0C8803AA14C9967096DF`

source本文は固定BASEのGit objectから読み、archive旧code／test／runtime／CIは実行しない。各行にはsource blob、source SHA、exact path、claim anchor、履歴レコード、candidate pool／Wave relation、反証、未解決欄を保存する。asset本文に「implemented」「partial」「failed」「consumer」等の記載があっても、`legacy_status`、`current_implementation`、`acceptance_evidence`、`unit_binding`は直接unit receiptがないためunknown／pendingに保つ。

対象範囲の分母は固定BASEから再導出する。218 product unit、153 source ID、Wave1–50の598 edge／355 unique asset、legacy ledger 4,020行、選定13 asset、選定assetのcandidate-pool 281行、Wave edge 1行である。candidate poolは検索関係でありunit結合ではなく、representative/direct linkは0件である。

`generate.py`は証拠束を固定BASEから再生成し、`validate.py`は同じBASE objectからledger完全一致、source claim anchor、status partition、unit/requirement/acceptance境界、入力digest、BASE祖先性を独立検査する。`selfcheck.py`は21件の改竄負例を期待error codeと照合する。Bindingには束の全成果物を登録する。

## 検証

```text
python3 -B scaffold/legacy-status-evidence-0125/generate.py
python3 -B scaffold/legacy-status-evidence-0125/validate.py
python3 -B scaffold/legacy-status-evidence-0125/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

この束はresearch-only Scaffoldであり、formal crosswalk、authority、successor、implementation、degradation、unimplemented、failure、acceptanceを更新しない。#1813は進捗参照だけで、merge／closeは行わない。
