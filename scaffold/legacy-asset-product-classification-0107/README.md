# SCF-B-0107 Wave1–50 legacy asset product classification research

`SCF-B-0107` は、固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` のWave1–50を静的に再照合し、Waveで参照された355 unique旧assetと、`legacy-asset-phase-product-classification-bootstrap.jsonl` の `product_classification_status=unresolved` との交差64件を研究候補として保持する。

Wave1–36は `docs/governance/` のJSONL、Wave37–50は既存の `scaffold/legacy-semantic-review-wave37..50/` JSONLを入力にする。598 edgeを再導出し、対象64件を単一製品候補の直接根拠56件、複数製品競合5件、根拠不足3件へ分類した。対象assetのsemantic linkはunresolved-only 61件、rejected-only 3件、confirmedを含むassetは0件である。単一候補でもsemantic link、product authority、phase admission、successor、consumer closureが未承認であるため、これは正式asset分類やroutingではない。

各recordは次を結んでいる。

- 旧asset台帳の行、旧archive sourceのGit blob・bytes・SHA-256、Wave evidenceのline anchorと行テキストdigest
- Wave semantic linkの `confirmed`／`unresolved`／`rejected`、source requirement、unit候補、candidate product、phase候補
- 現行crosswalkとproduct-unit decompositionのunit/product候補
- 四製品boundaryと四つのL1候補の行digest、旧decision／read-afterの対象別状態、failure／consumer inventory
- 人間判断残り、authority boundary、formal asset classificationを更新していないこと

旧archiveは `git show BASE:<path>` による静的read-only参照だけに限定し、runtime、test、CI、workflow、hook、adapter、旧sourceを実行しない。既存のphase台帳、asset台帳、Wave台帳、formal product routeは変更しない。

分類規則はvalidatorが再導出する。複数製品候補は競合、rejected-only semantic linkは隣接unitの製品scopeをcounter-evidenceとして保持するだけの根拠不足（asset `candidate_products=[]`）、単一製品かつ全linkにsource anchorがある場合は直接根拠候補とする。ただし全recordは `authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false` に固定する。

検証:

```text
python3 -B scaffold/legacy-asset-product-classification-0107/generate.py
python3 -B scaffold/legacy-asset-product-classification-0107/validate.py
python3 -B scaffold/legacy-asset-product-classification-0107/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

negative selfcheckはtarget欠落／重複、edge欠落／重複、source digest、candidate product、authority昇格、boundary line digest、input digest欠落／重複、固定BASE祖先性を期待error code付きで拒否する。
