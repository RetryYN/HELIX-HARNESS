# v1.3 effective rank 21–40 再構成レビュー

## 結論

queueの303行から `priority=primary_residual` かつ `queue_state=unresolved_for_closure_work` の255行を取り、32件のfocused auditをsource identityで再照合した。raw ID tokenだけの一致を既監査扱いせず、完全なsource identity tupleが確認できた124行だけを除く。残るeffective unreviewed poolは131行である。固定first20の次の正しいposition 21–40はJSONの20 source rowsで、ID順は `REQSRC-SUP-00077`, `REQSRC-SUP-00081`, `REQSRC-SUP-00089`, `REQSRC-SUP-00097`, `REQSRC-SUP-00105`, `REQSRC-SUP-00108`, `REQSRC-SUP-00112`, `REQSRC-SUP-00114`, `REQSRC-SUP-00146`, `REQSRC-SUP-00147`, `REQSRC-SUP-00150`, `REQSRC-SUP-00151`, `REQSRC-SUP-00153`, `REQSRC-SUP-00154`, `REQSRC-SUP-00155`, `REQSRC-SUP-00161`, `REQSRC-SUP-00163`, `REQSRC-SUP-00165`, `REQSRC-SUP-00167`, `REQSRC-SUP-00170`。

先行first20 bundle（commit `0c08cffe4d47f499214d952b1e6b055dba22bcf6`）との重複は0件。既存の「rows21–40」audit artifactは異なるsliceを記録している。`REQSRC-SUP-00089`（archive line119）を含め、`REQSRC-SUP-00171`（line221）は正しいpoolではposition41になる。意味比較の内容をこのレビュー記録が置換するものではない。

## Joinの根拠

raw bytes中のID token regexは136件を拾うが、そのままではidentity proofにならない。source item IDに加え、source path、source file SHA-256、physical line、source line SHA-256がqueue rowと一致するtupleを数えた。親scopeと子rowのpins、同一bytesの保存snapshotを組み合わせた明示分も個別検証した。

| 証拠形状 | 件数 | 検証内容 |
|---|---:|---|
| structured nested tuple | 116 | ID/path/file SHA/line/line SHAすべてがqueue identityと一致 |
| parent scope + line row | 5 | policy-lines auditのarchive path/file SHAと、各lineのphysical line/line SHAが一致 |
| source pin + authority correction row | 2 | overlayの`legacy_source_pin`と、00506/00514各rowのline/line SHAが一致 |
| 同一bytesのsnapshot atom | 1 | 00507はpathがheld snapshotだが、archiveとfile SHA/line/line SHAが同じ |
| **source-qualified hit 合計** | **124** | **重複なし** |

したがって候補数は `255 - 124 = 131`。sort keyは旧sourceのphysical line昇順、同値ならsource ID昇順。全32 focused auditのpathとSHA-256はJSONに記録した。

## 除外しないraw mention

以下はtokenとして見つかっても、当該queue rowのsource tupleを証明しないので候補poolから除外しない。

- `REQSRC-SUP-00089` line119はv13 forward/reverse auditの`origin_source_item_id`とbounded relevance記述に出るが、同rowのarchive path、file SHA、physical line、line SHAを同audit内でpinしない。source ID aloneはjoinではない。
- raw-only 11 IDs (`00192`, `00193`, `00194`, `00198`, `00213`, `00217`, `00330`, `00332`, `00334`, `00483`, `00504`) は、v13 development-style auditの`excluded_2411_source_item_ids`などのID列挙や prose/citation内に現れる。いずれも当該queue rowの完全tupleを持たないためindividual identity hitに数えない。各出現監査と全file pinはJSONに記録した。

## 固定first20とclaim boundary

先行bundle `0c08cffe4d47f499214d952b1e6b055dba22bcf6` の2 JSON artifactはcommit上のSHA-256をJSONにpinし、20 IDを再読した。重複はなく、first20のmembershipは維持される。

この記録は順位とsource identity joinだけを再構成する。source conditionの意味比較、formal successor、採択、closure、実装・受入authority、authority変更を主張しない。旧runtime、CLI、test、CIは実行していない。
