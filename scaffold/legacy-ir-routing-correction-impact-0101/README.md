# SCF-B-0103 PO未承認routing correction 7件の影響研究

status: `research_only_candidate`

authority_effect: `none`

base_head: `36784d25aa4cc53d89c28c2ff81b4009db234605`

binding: `scaffold/bindings/SCF-B-0103.json`

このbundleは、`legacy-ir-product-routing-corrections.jsonl`のHIL-FR-01／11／15／16／37／41／57について、旧IRのexact statement、現行四製品L1、`docs/concept/product-boundary.md`、routing／decomposition／crosswalk、該当Wave semantic review、旧assetのsource／history／failure／consumer inventoryを固定BASEから静的に突合する研究束である。7件はすべて`correction_state=proposed_pending_po_review`、`authority_effect=none`、`meaning_change_applied=false`であり、correctionのafterをeffective routingへ上書きしない。

source provenanceは`fixed_git_object`である。入力blob、bytes、行anchor、digestは固定BASEの`git rev-parse <BASE>:<path>`と`git show <BASE>:<path>`から取得し、working treeをsource snapshotに使わない。validatorは検証HEADが固定BASEの祖先であることを確認する。

現在のdecompositionは153 requirement record、218 unit（product unit 217、cross-product connection 1）、product候補HARNESS 85／OS 132、phase候補unit 188、phase未割当30、phase link 321、successor assigned 0である。7件のbeforeは単一product unitで、FR-01／15／16／37はOS、FR-11／41／57はHARNESSに候補付けされている。afterを仮に全件採択した場合の影響を、追加候補unit 7件（HARNESS +4／OS +3）として225 unit（product unit 224、connection 1）へ投影するが、これは適用結果ではない。

各recordのafter projectionは、追加unitのsource span、phase、consumer edge、successorを空／未割当で保持する。beforeのconsumer closure／direct legacy links／successor statusは固定BASEのcrosswalk／decompositionから再導出し、human_action／interpretation文字列とdigestも固定する。既存unitのphaseを移送せず、consumer closureや旧asset直接意味linkを生成せず、connection／compositeも生成しない。仮適用後のscaffold-only投影はphase候補unit 188、未割当37、phase link 321、consumer edge 0、successor assigned 0であり、実際の台帳・formal route・successorは変更しない。

## 検証

```text
python3 scaffold/legacy-ir-routing-correction-impact-0101/generate.py
python3 scaffold/legacy-ir-routing-correction-impact-0101/validate.py
python3 scaffold/legacy-ir-routing-correction-impact-0101/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorは7 IDの重複・欠落、fixed BASE input path集合／digest／blob、old IR statement line／line digest／semantic digest、correction before／afterと未承認状態、routing／decomposition／crosswalkのbefore候補、consumer／successorのBASE照合、追加unitのproduct_unit／phase／candidate asset境界、固定human_action／interpretation digest、四製品boundaryとL1のblob／行／digest、Wave 3行ずつのrow digest、旧assetのcrosswalk由来ID集合・source／history／failure／consumerの静的状態、human judgment項目、unit／phase／consumer／successor／connection／compositeの影響数、inventory authority_effectを再導出する。selfcheckは各改竄が狙ったerror codeで拒否されることを確認する（44負例）。

旧archiveのruntime、test、CI、workflow、hook、adapter、sourceは実行しない。この束の合格はPO decision、formal routing、owner、phase、設計、実装、consumer closure、successor、Issue closeを生成しない。
