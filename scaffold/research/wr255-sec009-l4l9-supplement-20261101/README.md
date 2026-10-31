# WR255 SEC009 L4/L9独立投影とoverlay証拠

このdirectoryはL4/L9 V-pair補足のscaffold evidenceです。authorityを持たず、実動作も生みません。L5/L8は別のV-pairです。checker用のL5/L8候補JSONをscaffoldへ複製せず、固定commitからvalidatorが `git show` で読み、実行中だけ一時fileに置きます。一時fileはvalidator終了時に削除します。

## 固定revisionと再現

- L4/L9の投影元L9: `c14adddf2678c7a69d76420c451df3f05b1251ab`
- canonical L4/L9補足: commit `d646a09e74aa815f5e565f02d26f27ecb67efe98`
- overlay対象のL5/L8候補: commit `24d7f00bdca41c3dfb1f3137655ffdbe3674cfb3`（L5/L8側でcase markerとL3/L10/L4からpositive最小期待を独立設計）

repository rootで次を実行します。

```sh
python3 scaffold/research/wr255-sec009-l4l9-supplement-20261101/validate_l4_l9_supplement.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py check-replacement SCF-B-0209
python3 -m json.tool docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json >/dev/null
git diff --check
```

validatorは固定L5/L8 commitを `git show` で読み込み、canonical L4/L9文書に対してcurrent checkerを実行します。L9提案の一時複製は作りません。代わりに固定base L9から独立投影を作り、canonical L9の `integration_cases` と全ての非case fieldが一致することを確認します。

## 285行の照合と投影

`l9-row-audit-<revision/hash>` はL9 285行それぞれのcase ID、state、L9 source pointerとgiven digestを記録します。negative 277行は対応するL4 class ID/pointerと `condition`、`expected`、`expected_preserved` のdigestを記録し、期待値がL4 classから導出されたことを追えます。positive 8行はcase markerの抽象条件とL3/L10/L4契約から最小期待を設計し、各値のdigestと共有根拠refを記録します。fixture入力と実観測はなく、個別oracle IDとtest citationはnullです。L9 `expected_proposal` を期待値の根拠に使いません。

5件の `ONLY-…-UNSELECTED-ABSENT` は未選択recipientの能力不在を選択閉包の不足・任意operation開始条件にしない期待です。`EMPTY-RECIPIENT-SET` は、独立期待集合とpolicy選択集合が既知の空集合であるという設計条件の下で、recipient別空出力を期待します。この条件はgivenにある観測事実ではありません。OS offlineの独立復旧選択はOS/通常009応答を普遍的前提にせず、隔離と復旧素材を分けます。F02の一般文書meaning unknownは全操作・全scope停止へ拡張せず、unknownだけから安全trigger分類を作りません。これらの期待は未実測であり、実停止・実復旧・再開許可の生成を意味しません。

negative givenは全行が共通 `evidence_limit` だけで、同一digestです。ケース固有の対象値・実際値・差分を裏付けないため、値を補っていません。positiveの契約レベル最小意味と行別に不足する入力は `positive-source-review.json` に分けて記録します。L10 oracleは契約単位であり、個別行のoracleとは区別しています。

## checker結果

`overlay-check-child-<revision/hash>` はcanonical L4/L9と固定L5/L8 candidate commitのchecker結果です。初回測定の `overlay-check-child.json` は元のcommit時点証拠として保持します。L4/L9 pair、L5/L8 pairはいずれも成立し、negative 277件がmatched、negative failureは0件です。positive 8件は契約最小期待を設計しましたが、case-specific fixture値・実観測・個別oracle・test citationがなく、未実測です。この静的照合は正式な4way検証やsecurity behaviorの証拠ではありません。

## consumer移行の行別監査

`pointer-consumer-audit-d646a09e-e7dd88b8-00376c40-0dae5023.jsonl` にはL8とL9それぞれの直接pointer 308件とfull-path wrapper 275件を、一consumer一行で記録します。合計は直接pointer 616件とwrapper 550件です。各行に旧pointer、現行L4の代替top-level class pointerまたはcollection内class pointer一覧、移行可否と理由を記録します。

各層の直接pointer 308件中307件は行class、1件はcontract内の14-class collectionを指します。行classはtop-level classへ一意に対応し、8項目のalias比較は値・型とも一致します。ただし旧`expected_text`に同値のtop-level fieldがなく、`code`、`change`、`axis`、`state`等にfield名の対応もあります。consumerのfield-aware移行と再照合はまだ行っていないため、代替先候補があることを移行済みとは扱いません。

collection consumerは同じ順序の14 class IDと代替pointer一覧まで照合しましたが、contract内のこのsubsetを指す単一top-level JSON Pointerはありません。一つのcollection pointerを複数class pointerへ展開するconsumer変更が要ります。現時点では全consumer移行が未成立なので、SCF-B-0209はpendingを維持します。`check-replacement` の `E_REPL: transfer（対応表）が無い` を確認し、退役していません。

`pointer-consumer-audit-d646a09e-e7dd88b8-00376c40-0dae5023.json` は行別JSONLの集計です。L4/L9補足branchはL5/L8 pairから分離しています。

## 同一bytesのcommit前後測定の整理

commit `d646a09e` と確定L9 commit `e22b5c96` の間で、L9 SHA-256・L5/L8固定commit・validatorが同一の測定を比較しました。L9 285行監査、checker全文、pointer consumerの1,166行JSONL、positive source reviewは内容SHAが同一のため、HEADには後続commit時点の一組だけを残しました。overlay summaryとpointer集計はpath・revision参照が異なるため、後続commit後の報告に整理しました。旧artifactごとのGit commit/blob/SHA-256、同一性または後続測定との関係、`git show <commit>:<path> > <path>`復元commandは [`duplicate-measurement-disposition.json`](duplicate-measurement-disposition.json) に記録しました。確定時点のsummaryは `overlay-summary-e22b5c96-57c0197c-24d7f00b-00376c40-e540f13f.json` です。
