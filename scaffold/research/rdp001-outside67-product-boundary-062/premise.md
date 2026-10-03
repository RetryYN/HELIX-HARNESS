# 調査前提

- `MPR-SH-OUTSIDE67-001`は`unassigned_cross_product`、`source_preserved_unassigned`、`authority_effect:none`のsource holdingであり、path_revision_pairは要求atomではない。
- `OUTSIDE67-PATH-059`の責務決定本文と`063`〜`066`のL11案は、四製品の意味境界を比較する旧source referenceである。source本文に書かれたdraft／全件未実行／将来条件は現行承認・実装・受入の証拠ではない。
- path由来product／phaseは候補であり、最終owner、authority、current requirement、successorを決めない。四製品候補は各unitに保持する。
- 旧・現行implementation、degradation、failure、consumer、decisionのunknownを別の状態へ補完しない。exact-key match 0は調査範囲内でledger evidenceが見つからなかったという観測だけである。
- source_fragmentにないactor／action／condition／guard／sequenceは候補意味へ混入させない。今回のunitはsource anchorと境界roleだけを保持し、semantic fieldsはunresolvedとする。
- `normalized_statement`、`retained_meaning`、`unresolved_questions`、`diff_observation`は自由な追加意味ではなく、逐語source fragment、保持意味、未解決status、revision差分観測を分離した固定recordで保持する。inventoryのfindings／unresolved_questions／prohibited_inferenceも固定id／status／text recordとして扱う。candidate product、selection reason、source path、phase、source anchorの値は独立canonical tableと固定scope／anchor keysetで検査する。
- #2007とsource path／unitを共有しない。001／010は参照混入を含むため除外するが、既レビュー件数には算入しない。
- archive revisionはGit objectの静的referenceとして読む。旧runtime、test、CI、hook、adapterは実行せず、旧結果をoracle／fallbackにしない。
- 今回の検証幅は5件の観測であり、安全なbatch上限を断定しない。次batchはsource chainごとに独立確認する。
