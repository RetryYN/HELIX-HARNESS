# SCF-B-0100 旧IR対象routing未解決18件の製品unit bridge

status: research_only_candidate
authority_effect: none
binding: `scaffold/bindings/SCF-B-0100.json`
base_head: `36784d25aa4cc53d89c28c2ff81b4009db234605`

source provenance: `fixed_git_object`。旧IR、台帳、queue、routing、decomposition、crosswalk、boundaryのblob／bytes／行anchor／digestはすべて固定BASEの`git rev-parse <BASE>:<path>`／`git show <BASE>:<path>`から取得し、working treeはsource digestの入力にしない。検証HEADは固定BASEの祖先でなければ`E_BASE_NOT_ANCESTOR`で停止する。

このbundleは、`legacy-ir-target-routing-queue.jsonl`で`target_resolution_status=unresolved_target`となっている18件を、旧IR原文、四製品routing bootstrap、製品unit decomposition bootstrap、製品責務境界、旧資産台帳と照合するread-only研究束である。queue側の18件を正式変更せず、先行台帳側に存在する候補unitとの状態差分を記録する。

`research.jsonl`は要求IDごとに次を保持する。

- 旧IR原文のexact path、Git blob、`statement.text`実行line、行テキストSHA-256、JSON pointer、statement semantic digest。
- queueの`unresolved_target`と空の候補target。
- routing bootstrapの153/153候補、decompositionの候補product unit、candidate shape（`unit`／`unit_set`／`connection`／`composite`／`unresolved`）。
- HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの責務境界引用（Git blob、実行行、行テキストdigest、解釈digest）。候補targetがWeb／Web-OSに無いことを正式な不要性・除外へ昇格しない。
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

`validate.py`はqueue台帳から`target_resolution_status=unresolved_target`のID集合を動的に再導出して18 recordのqueue状態と照合する。さらに18 IDのexact set（重複・欠落）、旧IR statement digest、固定BASE bytes digest、Git object、実ファイルから再導出した`statement.text` line／行テキストdigest／pointer、queue／routing／decomposition候補集合、責務境界のGit blob／実行行／行digest／interpretation digest、固定BASEの祖先性、authority／successor／execution境界、asset ledger digestとhistory／failure／consumer未完状態を検査する。`selfcheck.py`はduplicate、missing、digest tamper、line anchor／line digest tamper、queue status、boundary blob／interpretation、candidate boundary、authority promotion、asset digest、旧実行promotion、BASE祖先性、固定BASE object bytes digestの否定例について、狙ったerror codeを照合する。

この合格は人間decision、要求採否、owner確定、L2／L11、phase、設計、実装、consumer closure、Issue closeを生成しない。
