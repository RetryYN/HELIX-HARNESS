# 旧資産研究レコードの証拠深度projection

`SCF-B-0149` は、main `69e3c6b20541721161cab9d69f3aaf834e89d511` にある14個の既存 `classification-research.jsonl` を読み取り、行数、unique asset ID、重複出現、既存recordが明示する証拠markerを集計するresearch-only projectionです。入力recordを変更せず、製品配置や要求採否の正本にもなりません。

14束は768 record rows／726 unique asset IDです。42 IDが複数束に現れ、追加出現は42行です。`projection.json` は重複IDの件数とbundle別追加出現数を示し、全入力からの再計算方法を残します。重複ID一覧は投影JSONへ複製せず、scriptが14入力から再計算します。unique ID被覆は4,020件の台帳分母に対して726件（18.06%）です。これは調査被覆であり、同深度の意味レビュー数や正式配置数ではありません。

同名の `direct_product_basis` は証拠の深さを保証しません。14束合計では387 record occurrencesにこのラベルがあります。これは重複を含む行出現数で、unique ID数ではありません。0142は57件のpath/profile起点分類で、35件が `direct_product_basis`、17件が `multi_product_conflict`、5件が `insufficient_basis` です。記録内の `mechanical_excerpt.not_semantic_analysis=true` は52件にあり、direct 35件とconflict 17件を含みます。このmarkerは意味解析を行っていないことを示します。0141は41件すべてに `manual_semantic_span_pinned_pending_human_review` があり、そのうち26件が `direct_product_basis`、9件がconflict、6件がinsufficientです。これは選択区間と責務境界の候補根拠であり、人間review pending・正式採択前です。projectionはこの二つのdirect件数を別々に表示します。

全束を一つの意味review尺度へ押し込まず、bundleごとに元recordのcategory、`semantic_status`、機械excerpt marker、boundary comparison material、`formal_asset_classification_updated` の記録有無を表示します。0141の41件すべてにselected-span statusがあり、そのうち35件にproduct basisがあります。0142は57件すべてにboundary evidence objectがあり、path/profile候補の境界参照です。どちらもrecord内に比較材料がある件数で、正式な責務採否数ではありません。formal update flagはunique IDのうち明示trueが0、明示falseが666、marker欠落または混在が60です。これはrecordの記録値であり、承認証拠でも正式採択率でもありません。空欄を否定へ読み替えず、IssueやScaffoldの集計から承認、owner、実装、failure/degradation、phase、consumer closureを生成しません。

この作業は既存recordの範囲・証拠深度の投影であり、旧HELIXの仕組みを再実装しません。参照した既存資産はSCF-B-0141（旧configの選択semantic span研究）とSCF-B-0142（path/profileによる旧research-assets分類）です。両者のsource、判断境界、failure/consumer状態は各束のREADME・Binding・record内に保持されており、このprojectionは既存record以外から意味判断を追加しません。旧archiveのsource/runtime/test/CIは実行していません。

## 静的確認

```text
python3 -B scaffold/legacy-evidence-depth-projection-0149/project.py --write
python3 -B scaffold/legacy-evidence-depth-projection-0149/project.py --check
python3 -B scaffold/legacy-evidence-depth-projection-0149/project.py --selfcheck
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`--selfcheck` は0142のdirect候補1件の `not_semantic_analysis` をfalseへ変えた入力を一時メモリ上で検査し、35件のdirect機械marker不変条件に反するため拒否されることを確認します。ファイルへの変更はありません。
