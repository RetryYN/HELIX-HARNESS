# WR255 SEC009 L4/L9独立投影とoverlay証拠

このdirectoryはL4/L9 V-pair補足のscaffold evidenceです。authorityを持たず、実動作も生みません。L5/L8は別のV-pairです。checker用のL5/L8候補JSONをscaffoldへ複製せず、固定commitからvalidatorが `git show` で読み、実行中だけ一時fileに置きます。一時fileはvalidator終了時に削除します。

## 固定revisionと再現

- L4/L9の投影元L9: `6a7fbfbe134e9163976fa67319044fa0bc03973f`（fetch済み`origin/main`）
- canonical L4/L9補足: commit `d646a09e74aa815f5e565f02d26f27ecb67efe98`
- overlay対象のL5/L8候補: commit `24d7f00bdca41c3dfb1f3137655ffdbe3674cfb3`（L5/L8側でcase markerとL3/L10/L4からpositive最小期待を独立設計）

過去測定の投影元 `c14adddf2678c7a69d76420c451df3f05b1251ab` は各時点artifactとGit履歴に残しています。現行validatorは最新origin/mainの固定bytesから投影し、L9 285行のIDと順序、非case field、L4由来のnegative期待、L3/L10/L4由来のpositive期待を比較します。

repository rootで次を実行します。

```sh
python3 scaffold/research/wr255-sec009-l4l9-supplement-20261101/validate_l4_l9_supplement.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py check-replacement SCF-B-0209
python3 -m json.tool docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json >/dev/null
git diff --check
```

validatorの既定実行は読み取り専用で、測定結果だけをstdoutへ出します。成果物を保存するときだけ、まだ存在しない専用pathを明示します。

```sh
python3 scaffold/research/wr255-sec009-l4l9-supplement-20261101/validate_l4_l9_supplement.py \
  --record-dir scaffold/research/wr255-sec009-l4l9-supplement-20261101/measurements/run-20261101-001
```

`--record-dir`は既存directory・fileを受け付けません。既存artifactやSCF-B-0221の参照先へ書き込まず、専用path内にcontent-addressed artifactを記録します。

validatorは固定L5/L8 commitを `git show` で読み込み、canonical L4/L9文書に対してcurrent checkerを実行します。L9提案の一時複製は作りません。代わりに固定base L9から独立投影を作り、canonical L9の `integration_cases` と全ての非case fieldが一致することを確認します。

## 285行の照合と投影

現行のcontent-addressed `l9-row-audit-*.jsonl` はL9 285行それぞれのcase ID、state、L9 source pointerとgiven digestを記録します。negative 277行は対応するL4 class ID/pointerと `condition`、`expected`、`expected_preserved` のdigestを記録し、期待値がL4 classから導出されたことを追えます。positive 8行はcase markerの抽象条件とL3/L10/L4契約から最小期待を設計し、各値のdigestと共有根拠refを記録します。fixture入力と実観測はなく、個別oracle IDとtest citationはnullです。L9 `expected_proposal` を期待値の根拠に使いません。

5件の `ONLY-…-UNSELECTED-ABSENT` は未選択recipientの能力不在を選択閉包の不足・任意operation開始条件にしない期待です。`EMPTY-RECIPIENT-SET` は、独立期待集合とpolicy選択集合が既知の空集合であるという設計条件の下で、recipient別空出力を期待します。この条件はgivenにある観測事実ではありません。OS offlineの独立復旧選択はOS/通常009応答を普遍的前提にせず、隔離と復旧素材を分けます。F02の一般文書meaning unknownは全操作・全scope停止へ拡張せず、unknownだけから安全trigger分類を作りません。これらの期待は未実測であり、実停止・実復旧・再開許可の生成を意味しません。

正例8行の `positive_expectation_ref` は、L9本文に参照先のbasis節がないため削除しました。L9の `source_pointers`、`condition`、`expected`、`expected_preserved` は保持しています。validatorはL9本文に残る同名参照を走査し、L9内の `positive_expectation_basis` から解決できない参照があれば失敗します。

negative givenは全行が共通 `evidence_limit` だけで、同一digestです。ケース固有の対象値・実際値・差分を裏付けないため、値を補っていません。positiveの契約レベル最小意味と行別に不足する入力は、現行のcontent-addressed `positive-source-review-*.json` に分けて記録します。L10 oracleは契約単位であり、個別行のoracleとは区別しています。

## checker結果

現行のcontent-addressed `overlay-check-child-*.json` はcanonical L4/L9と固定L5/L8 candidate commitのchecker結果です。L4/L9 pair、L5/L8 pairはいずれも成立し、negative 277件がmatched、negative failureは0件です。positive 8件は契約最小期待を設計しましたが、case-specific fixture値・実観測・個別oracle・test citationがなく、未実測です。この静的照合は正式な4way検証やsecurity behaviorの証拠ではありません。

## consumer移行の行別監査

`pointer-consumer-audit-33973b4b762d.jsonl` にはL8とL9それぞれの直接pointer 308件とfull-path wrapper 275件を、一consumer一行で記録します。合計は直接pointer 616件とwrapper 550件です。各行に旧pointer、現行L4の代替top-level class pointerまたはcollection内class pointer一覧、移行可否と理由を記録します。ファイル名は行JSONLの内容hashから固定しています。

各層の直接pointer 308件中307件は行class、1件はcontract内の14-class collectionを指します。行classはtop-level classへ一意に対応し、8項目のalias比較は値・型とも一致します。ただし旧`expected_text`に同値のtop-level fieldがなく、`code`、`change`、`axis`、`state`等にfield名の対応もあります。consumerのfield-aware移行と再照合はまだ行っていないため、代替先候補があることを移行済みとは扱いません。

collection consumerは同じ順序の14 class IDと代替pointer一覧まで照合しましたが、contract内のこのsubsetを指す単一top-level JSON Pointerはありません。一つのcollection pointerを複数class pointerへ展開するconsumer変更が要ります。現時点では全consumer移行が未成立なので、SCF-B-0209はpendingを維持します。`check-replacement` の `E_REPL: transfer（対応表）が無い` を確認し、退役していません。

[`pointer-consumer-audit-history.json`](pointer-consumer-audit-history.json) は、同じSHA-256 `33973b4b…` の過去4測定のsource revision、Git commit/blob、復元commandを列挙します。4つのJSONLは全行・重なる主要fieldを機械照合し、headには同じ内容hashのJSONLを1本だけ置きました。過去の1.6MB展開JSONは1166 consumer行のidentity・pointer・class/alternate target・field比較・移行blockerが正本JSONLと一致することを機械照合しました。過去artifactの全詳細はGit履歴から復元できるため、展開JSONと3つの重複summary JSONも現行treeから除きました。manifestには各artifactのcommit/blob/SHA-256と復元commandを記録しています。L4/L9補足branchはL5/L8 pairから分離しています。

## 測定artifactと履歴

現行treeには、L9 row audit、positive source review、overlay check-child、overlay summaryをそれぞれ1本ずつ置き、ファイル名を内容SHA-256由来にしています。同じbytesのvalidator再実行は同じartifact pathを再利用し、内容が異なる測定は新しいpathを作るため、過去artifactを上書きしません。更新時は現行pathを新測定へ合わせ、旧pathのcommit/blob/SHA-256と正確な `git show <commit>:<path> > <path>` 復元commandを [`duplicate-measurement-disposition.json`](duplicate-measurement-disposition.json) に記録します。

これまでのrevision別artifactも削除後のGit履歴から復元できます。manifestには本補足のGit履歴で確認できた各artifact path・commit・blob・本文SHA-256・復元commandを記録しています。現在の測定はmanifestの `retained_current_measurements` とSCF-B-0221が指します。L4/L9補足branchはL5/L8 pairから分離しています。
