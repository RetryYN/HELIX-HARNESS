# SCF-B-0108 `src/lint/` implementation source product classification research

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` から、`legacy-asset-phase-product-classification-bootstrap.jsonl` のうち `product_classification_status=unresolved`、`artifact_evidence_kind=implementation_source`、`source_path` が `src/lint/` 配下である95資産を再導出する。phase台帳の95件はすべて `candidate_product_targets=[]` のため、旧path名やphase候補を正式製品ownerへ昇格しない。

各recordは旧archive sourceのGit blob・bytes・SHA-256、実sourceのsemantic anchor（行番号、行テキスト、行テキストdigest）、phase／asset disposition、Wave1–50のsemantic link、unit候補、四製品boundary／L1、旧decision／failure／consumer状態を結ぶ。Wave1–50は598 edge／355 unique assetを再走査し、対象95資産には17 edge／14 linked assetがある。全17 edgeは `semantic_link_status=unresolved` であり、confirmed/rejectedを正式根拠へ使わない。

旧sourceを実読した14件は、具体的なsource span、対応L1行、product-boundaryの反証境界、consumer pending境界を個別に保存し、直接候補根拠14件として提案する。内訳はHARNESS 8件（g1/g3 trace、FR registry、doc consistency、entity coverage、plan-specific V-pair、WCC trace、sub-doc structure）、OS 6件（retirement authority、closure registry、DB projection ingestion、Codex hook trust、verification profile safety、verifier provider mismatch）である。候補は正式routingではなく、`authority_effect=none` の人間レビュー待ちである。

残り81件は `source_semantic_review_pending`／`insufficient_basis` として保留する。filename grouping、汎用語、宣言名、未承認Wave unit scopeからownerや競合を推測しない。WaveでHARNESS／OSの複数scopeが観測されるassetもasset責務へ継承せず、`observed_wave_products` とedge内の観測値に保持する。直接候補14件にも、formal product owner、phase admission、successor、consumer closure、実装成立を与えない。

旧archiveのsource／runtime／test／CI／workflow／hook／adapterは実行せず、`git show BASE:<path>` による静的readだけを行う。既存phase／asset分類、formal product route、successor、implementation成立、consumer closureは更新しない。#1813は進捗参照のみでcloseしない。

検証:

```text
python3 -B scaffold/legacy-lint-product-classification-0108/generate.py
python3 -B scaffold/legacy-lint-product-classification-0108/validate.py
python3 -B scaffold/legacy-lint-product-classification-0108/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorは固定BASE祖先性、input path集合・digest、95件exact set、598/355 Wave分母、17 edge欠落／重複、source blob／bytes／digest／line_count／read_mode／semantic line anchor、14件manual span／L1／反証／consumer boundary、81件pending宣言、phase／disposition未変更、record／inventory全宣言、target asset artifact kind分母、四製品boundary／L1／failure／consumer行digest、authority昇格をfail-closedに検査する。selfcheckは23 negative casesを期待error code付きで検査する。
