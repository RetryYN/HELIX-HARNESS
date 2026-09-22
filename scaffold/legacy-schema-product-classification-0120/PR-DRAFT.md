## 変更内容

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` から、未解決かつ `src/schema/` 配下の旧asset 31件を全件再導出し、旧source本文と現行四製品境界を静的に突合する research-only Scaffold Binding `SCF-B-0120` を追加する。

- 対象: 31/31 exact asset、全件 `implementation_source`
- 候補分類: direct 17（HARNESS 10、OS 7）、multi-product conflict 10（HARNESS+OS 9、HARNESS+Web 1）、insufficient basis 4
- phase候補: PHCAP-03 3、PHCAP-05 1、PHCAP-08 1、空26（正式phase admissionではない）
- Wave1–50: 598 edge／355 unique、対象1 edge／1 linked asset
- 重複: schema∩Wave64=1、schema∩lint95=0、schema∩runtime73=0、4束union=232
- 状態境界: `authority_effect=none`、formal asset/product classification・route・successor・implementation成立・consumer closure・new buildは未変更

各recordに旧asset ledger、旧sourceのGit blob／bytes／SHA-256、具体的source spanとline text digest、四製品L1／boundary receipt、Wave link、旧history／failure／consumer参照、legacy縮退証拠、残るhuman judgmentを保持する。Waveの観測scopeは正式product候補へ継承しない。

## 検証

旧archive runtime・test・CIは実行していない。固定BASE Git objectの静的readと、現行Scaffoldの決定的生成・独立validator・selfcheckだけを使う。category evidenceは direct=候補product/L1 evidence各1、conflict=各2以上、insufficient=各0を固定し、nested static reference／unit candidate key閉包とasset/unit ID型を検査する。重複は姉妹inventoryをoracleにせず、固定BASE phase/Waveから再導出する。

- `python3 scaffold/legacy-schema-product-classification-0120/generate.py`
- `python3 scaffold/legacy-schema-product-classification-0120/validate.py`
- `python3 scaffold/legacy-schema-product-classification-0120/selfcheck.py`（47負例、期待error code照合。generator category/products pin再生成、nested key閉包、型ガードを含む）
- `python3 -m py_compile`（generate／validate／selfcheck）
- `python3 scaffold/tools/scfctl.py validate`
- `python3 scaffold/tools/scfctl.py stale`（0）／`residuals`（0）; `validate`（128 bindings, fail=0）
- `git diff --check`／`git diff origin/main...HEAD --check`（origin/main=`f946cf7b0e4178d5b8f146699e3d651b4d65add9`）

PR作成側はmerge／closeを実行しない。正式分類・authority昇格は人間レビュー後の別判断とする。
