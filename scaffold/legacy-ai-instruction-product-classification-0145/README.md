# SCF-B-0145 固定BASE AI instruction / adapter 72件の四製品責務候補研究

このresearch-only Scaffoldは、固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の旧AI指示、provider adapter、consumer templateを静的参照し、現在の4製品L1との候補関係、未解決点、判断史、failure、consumer closureを記録します。対象はunresolved候補75件から、#2078で先行研究されmainに統合済みのasset IDおよびsource path/SHA重複3件を除いた72件です。`.claude/`、`.codex/`、`.cursor/`、`docs/templates/adapter/`とroot `AGENTS.md` / `CLAUDE.md`を含みます。

候補数はdirect product basis 28、multi-product conflict 41、insufficient basis 3です。全72件のlegacy implementation statusは`unknown`、consumer closureは`pending`、current successor／実装成立は未確定です。phase bootstrapの候補状態は`unresolved_with_candidate` 35、`unresolved` 22、`multi_phase_candidate` 11、`classified_candidate` 4であり、正式phaseへ昇格していません。Wave semantic edgeは1件です。旧sourceのAI指示やadapterを実行していません。

`independent-source-audit.py`はgenerator/validatorをimportせず、固定BASE disposition、Git object、archive MANIFEST、手動profile spanと出力ledgerを直接照合します。72/72件のsource path/SHA/blob/type/mode/MANIFESTとspan文字列、AICR-06のadapter template物理集合34/34、main 496件（#2078統合済み）・#2090 41件とのID/path-SHA重複0を確認し、span digestごとの結果を`independent-source-audit.json`へ記録します。この監査は意味解釈を承認しません。製品候補やmanual interpretationの採否、phase admission、successor、実装または縮退、consumer closure、formal classificationは人間判断待ちです。

`classification-research.jsonl`、`inventory.json`、[SCF-B-0145 Binding](../bindings/SCF-B-0145.json)は`authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false`を維持します。4製品以外の分類は行わず、LABO分類は適用していません。

## 検証

```text
python3 scaffold/legacy-ai-instruction-product-classification-0145/independent-source-audit.py
# PASS targets=72 raw_spans=72 adapter_templates=34 overlaps=0 semantic_adjudication=human_pending
python3 scaffold/legacy-ai-instruction-product-classification-0145/generate.py
# PASS records=72 categories={multi_product_conflict: 41, direct_product_basis: 28, insufficient_basis: 3} wave_edges=1 overlaps=0
python3 scaffold/legacy-ai-instruction-product-classification-0145/validate.py
# PASS targets=72 archive_receipts=72 upstream_inputs=exact overlaps=0 authority_effect=none new_build_allowed=false
python3 scaffold/legacy-ai-instruction-product-classification-0145/selfcheck.py
# PASS exact_negative_cases=35 ordered=true
python3 -m py_compile scaffold/legacy-ai-instruction-product-classification-0145/*.py
python3 scaffold/tools/scfctl.py validate
git diff --check
```

validator/selfcheckは新世代research bundleだけを検査します。旧archiveは`git show` / `git ls-tree`による静的readのみです。この束はDraft PRとして提示し、既存PRの依存とHEAD再照合を明記します。review依頼、merge、closeは行いません。
