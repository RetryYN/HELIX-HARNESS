# SCF-B-0100 旧IR対象routing未解決18件の製品unit bridge

status: research_only_candidate  
authority_effect: none  
binding: `scaffold/bindings/SCF-B-0100.json`  
base_head: `36784d25aa4cc53d89c28c2ff81b4009db234605`

このbundleは、`legacy-ir-target-routing-queue.jsonl`で`target_resolution_status=unresolved_target`となっている18件を、旧IR原文、四製品routing bootstrap、製品unit decomposition bootstrap、製品責務境界、旧資産台帳と照合するread-only研究束である。queue側の18件を正式変更せず、先行台帳側に存在する候補unitとの状態差分を記録する。

`research.jsonl`は要求IDごとに次を保持する。

- 旧IR原文のexact path、Git blob、line、JSON pointer、statement semantic digest。
- queueの`unresolved_target`と空の候補target。
- routing bootstrapの153/153候補、decompositionの候補product unit、candidate shape（`unit`／`unit_set`／`connection`／`composite`／`unresolved`）。
- HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの責務境界引用。候補targetがWeb／Web-OSに無いことを正式な不要性・除外へ昇格しない。
- 旧assetのrepresentative candidate pool、asset ledger行、source digest、history decision/read-after、failure未確認、consumer closure pending。phase／product候補assetは要求への直接意味linkではない。
- 対象revision付きで人間が判断するowner、unit／connection／composite境界、successor、atom、意味差分、technology／domain design適用範囲。

18件の候補shapeは`unit=9`、`unit_set=9`、`connection=0`、`composite=0`、`unresolved=0`である。候補product unitの出現数はHARNESS 10、OS 17、Web 0、Web-OS 0だが、これは候補数であり単一owner、要求採否、successor、authority、実装状態を示さない。`unit_set`は既存decompositionが`split_required`とした候補の保持であり、connection成立やcomposite成立を推定しない。

旧IR原文はarchive内JSONの静的readだけを行う。旧runtime、旧test、旧CI、workflow、hook、adapterは実行しない。旧asset evidenceは`disposition=unresolved`、要求unitの実装状態unknown、history／failure／consumer closure pendingを維持する。

## 検証

```text
python3 scaffold/legacy-ir-target-routing-0100/generate.py
python3 scaffold/legacy-ir-target-routing-0100/validate.py
python3 scaffold/legacy-ir-target-routing-0100/selfcheck.py
python3 scaffold/tools/scfctl.py validate
git diff --check
```

`validate.py`は18 IDのexact set（重複・欠落）、旧IR statement digest、source file digest、Git blob／line／pointer、queue／routing／decomposition候補集合、責務境界の四製品語彙、authority／successor／execution境界、asset ledger digestとhistory／failure／consumer未完状態を検査する。`selfcheck.py`はduplicate、missing、digest tamper、source reference tamper、candidate boundary tamper、authority promotion、asset digest tamper、旧実行promotionの否定例について、狙ったerror codeを照合する。

この合格は人間decision、要求採否、owner確定、L2／L11、phase、設計、実装、consumer closure、Issue closeを生成しない。
