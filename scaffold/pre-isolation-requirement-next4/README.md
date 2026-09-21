# RDP-001 PREISOLATION 要件含有差分 次候補 4 path / 28 hunk

status: `scaffold_candidate_pending_semantic_equivalence_review`
candidate_kind: `requirement_bearing_verification`
authority_effect: `none`
diff_scope: `selected_source_items_only`

この候補は、PR #1943、#1946、#1949、#1951で先に選定された
`PREISO-REV-000001..000144` と重複しない、source holding末尾の
`PREISO-REV-000330..000333`を対象にする。330–332はL11／L10受入設計の層境界、停止条件、
acceptance、trace条件を含み、333はそのpair trace検査の変更を含む。いずれも
`registry_source_digest`だけを更新する145–329とは差分の性質が異なる。

選定範囲は次のとおりである。

- selected: 4 source path / 28 changed hunk（330: 6、331: 6、332: 14、333: 2）
- prior selected: 144 source path / 212 hunk（ID 000001–000144）
- combined selected: 148 path / 240 hunk
- full Git diff: 400 path / 492 hunk。候補後の未処理は252 path / 252 hunk
- source holding: 333 records。候補後のholding未選定は185 records（145–329）
- holding外のnew-path diff: 67 path / 67 hunk。source holdingへ未登録のため本候補へ混ぜない

今回の28 hunkは変更前後のGit objectとexact line spanを検査するが、意味atom化は開始しない。
`semantic_atom_count=0`、`compound_hunk_hold_count=28`、`semantic_atomization_complete=false`とし、
28 hunkすべてを未解決のsemantic denominatorとして保持する。層・status・更新日時だけに見える
6 hunkも、受入文書のauthority／freeze境界を変えるため、digest-only metadataとは分類しない。

330–333の旧archive対応資産は意味、consumer、実装、採否を決めず、archiveのGit objectをread-onlyで
照合した。旧runtime、旧test、旧CI、旧hookは実行していない。候補の静的検証合格は、意味同値、
要求採否、authority、実装、consumer closure、受入、releaseの証拠を生成しない。

## 静的確認

```text
python3 scaffold/pre-isolation-requirement-next4/validate.py
python3 scaffold/pre-isolation-requirement-next4/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorはsource holding、asset／phase ledger、baseline／pre-isolation／archive object、全体／選定
hunk、exact span／SHA-256、既選定IDとの非重複、metadata-only除外、atom hold、未処理分母、否定境界を
read-onlyに検査する。
