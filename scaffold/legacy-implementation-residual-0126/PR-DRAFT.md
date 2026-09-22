# 固定BASE implementation_source 残余120件を製品責務候補として固定する research Scaffold

## 変更

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` から未解決1,792件を再導出し、先行研究asset-ID集合205件とWave未解決64件（重複42件）を分離しました。既存研究unionは227件、残余分母は1,565件です。prefixだけでは先行研究接続を示せない53件を固定ID/pathでinventoryへ列挙し、insufficient basisの対象として保持した上で、残余`implementation_source` 120件をrecord化しました。

- 対象120 asset / 120 records、Wave edge 0、Wave入力50 files / 598 edges / 355 unique assets。
- candidate分類はdirect product basis 30、multi-product conflict 23、insufficient basis 67。formal product/phase/implementation/consumer closureへ昇格しない。
- 既存67件の領域内訳は`src/web/`7、`src/doctor/`5、`src/policy/`5、`src/vscode/`5、`src/audit/`4、`src/design/`4、`src/task/`4、`.claude/hooks/`3、`scripts/`3、`src/semantic/`3、`src/team/`3、`src/vmodel/`3、その他18件。追加53件は`src/cli/`、`src/requirements/`、`src/schema/`、`src/setup/`、`src/shared/`、`src/workflow/`の明示残余。
- 各recordにsource anchorと`anchor_line_coverage`を追加。既存67件のanchor集計は1,023/10,997行=9.3%、最大18行で、未読領域を明記する。追加53件は1行の不足証拠anchorとして保持する。
- validatorはgenerate.pyをoracle importせず、53件のID/path、prior205件digest、union227、残余1,565、全nested record/inventory、category cardinalityを固定BASEから独立再導出する。
- selfcheckは43 negative cases（43 cases / 17 distinct error codes）を実行し、generator category/products改竄再生成、human judgment/review pin、ledger digest、Wave/union denominator、inventory top-level keyの負例を含める。
- `authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false`を全record/inventoryに固定する。

## 検証

```text
python3 -B scaffold/legacy-implementation-residual-0126/generate.py
python3 -B scaffold/legacy-implementation-residual-0126/validate.py
# SCF-B-0126 validate: PASS records=120 categories={'direct_product_basis': 30, 'insufficient_basis': 67, 'multi_product_conflict': 23} target_wave_edges=0 union=227
python3 -B scaffold/legacy-implementation-residual-0126/selfcheck.py
# SCF-B-0126 selfcheck: PASS negative_cases=43
python3 -m py_compile scaffold/legacy-implementation-residual-0126/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

旧archive source/runtime/test/CIは実行していない。formal authorityの昇格、既存台帳変更、merge/closeは含めない。
