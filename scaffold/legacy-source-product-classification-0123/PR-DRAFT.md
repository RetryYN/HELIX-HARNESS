## 変更内容

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` から、未解決かつ `implementation_source` の旧assetを五つのsource領域で全件再導出し、四製品責務候補と旧実装・縮退根拠を静的に保持する research-only Scaffold Binding `SCF-B-0123` を追加する。

対象分母は `src/workflow/` 15、`src/setup/` 14、`src/cli/` 10、`src/requirements/` 10、`src/shared/` 10 の計59件である。

- 分類候補: direct 30、multi-product conflict 15、insufficient basis 14
- direct: HARNESS 11、OS 19
- conflict: HARNESS+OS 13、HARNESS+Web 1、OS+Web-OS 1
- phase候補: PHCAP-03 7、PHCAP-03+PHCAP-04 1、PHCAP-05 1、PHCAP-12 2、PHCAP-14 13、空35
- Wave1–50: 598 edge／355 unique、対象14 edge／11 linked asset
- 重複: 今回対象∩Wave64=11、∩lint95=0、∩runtime73=0、∩schema31=0、4束union=280
- 境界: `authority_effect=none`、formal asset/product classification・route・phase authority・successor・implementation成立・consumer closure・new buildは未変更
- validatorは59件の固定target set、Wave/source overlap、record全top-level keyとnested field、history／failure／consumer、inventoryのtop-level keyと全nested declarationを固定BASEから完全再導出する。HELIX-LABO候補は対象製品集合に含めず、旧実装・縮退・consumer closureを候補分類から正式statusへ昇格しない。

各recordに旧asset ledger、旧source Git blob／bytes／SHA-256、具体的source spanとline text digest、四製品L1／boundary receipt、Wave link、旧history／failure／consumer参照、legacy縮退証拠、human judgmentを保持する。Waveのobserved scopeは正式product候補へ継承しない。

## 検証

旧archive runtime・test・CIは実行していない。固定BASE Git objectの静的readと、現行Scaffoldの決定的生成・独立validator・selfcheckだけを使う。

- `python3 scaffold/legacy-source-product-classification-0123/generate.py`
- `python3 scaffold/legacy-source-product-classification-0123/validate.py`
- `python3 scaffold/legacy-source-product-classification-0123/selfcheck.py`（44負例、期待error code照合）
- `python3 scaffold/tools/scfctl.py validate`
- `python3 scaffold/tools/scfctl.py stale`
- `python3 scaffold/tools/scfctl.py residuals`
- `git diff --check`
- `git diff origin/main...HEAD --check`

最新main上の実測は `scfctl validate: bindings=124 fail=0`、`stale=0`、`residuals=0`。対象59件のrecord、target/overlap集合、旧実装・縮退・consumerの非昇格境界はvalidator/selfcheckで再確認した。

PR作成側はmerge／closeを実行しない。正式分類・authority昇格は人間レビュー後の別判断とする。
