# SCF-B-0108 `src/lint/` implementation source product classification research

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` から、`legacy-asset-phase-product-classification-bootstrap.jsonl` の `product_classification_status=unresolved`、`artifact_evidence_kind=implementation_source`、`source_path=src/lint/**` の95資産を再導出する。phase台帳の95件はすべて`candidate_product_targets=[]`のため、旧path名やphase候補を正式製品ownerへ昇格しない。

各recordは旧archive sourceのGit blob・bytes・SHA-256、実sourceのsemantic anchor（行番号、行テキスト、行テキストdigest）、phase／asset disposition、Wave1–50のsemantic link、unit候補、四製品boundary／L1、旧decision／failure／consumer状態を結ぶ。Wave1–50は598 edge／355 unique asset、対象17 edge／14 linked assetである。全17 edgeは`semantic_link_status=unresolved`であり、confirmed/rejectedを正式根拠へ使わない。

旧sourceを実読した14件は、固定BASE asset IDをkeyにしたvalidator内の独立pin（product、source span、L1、product-boundary反証、interpretation）で照合し、HARNESS 8件／OS 6件を`direct_product_basis`として提案する。残り81件は`source_semantic_review_pending`／`insufficient_basis`として保留する。generatorのmanual tableは記録生成専用で、validator oracleではないため、manual tableの追加・削除・product／span／L1／interpretation改竄後の再生成をselfcheckで拒否する。

正式asset分類、product route、successor、implementation成立、consumer closure、new buildは更新しない。全件`authority_effect=none`であり、旧archive source／runtime／test／CI／workflow／hook／adapterは実行せず、`git show BASE:<path>`による静的readだけを行う。

検証:

```text
python3 -B scaffold/legacy-lint-product-classification-0108/generate.py
python3 -B scaffold/legacy-lint-product-classification-0108/validate.py
python3 -B scaffold/legacy-lint-product-classification-0108/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff origin/main...HEAD --check
```

validatorは固定BASE祖先性、validator内固定path／選択規則、95件exact set、598／355／17 edge分母、source blob／bytes／digest／line_count／read_mode／semantic line anchor、独立pin14件、category14/81、四製品boundary／L1／failure／consumer行digest、authority昇格をfail-closedに検査する。selfcheckは35 negative casesを期待error code付きで検査する。
