# RDP-001 DELEGATED-DOC-003 未処理先頭8文書の静的監査候補

この候補は、`MPR-SH-DELEGATED-DOC-003` の114 `file_blob`から、現行mainにtrackedされたdelegated-doc scaffold inventoryで静的処理済みと確認できる18文書を除き、`source_document_id`の数値suffix昇順で残り96件の先頭8文書を監査する。選定結果は `DELEGATED-DOC-001`、`009`、`010`、`012`、`019`、`020`、`021`、`022` である。

file blobは要求atomとして扱わない。各文書について、archive commit `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658` の旧source exact blob、bytes/lines、holding SHA-256、source relation、歴史的なproduct/phase/owner/authority signal、要求意味candidate、未atom化範囲、legacy asset disposition、旧原文のfailure/degraded/implementation/consumer/decision lexical signalを保持した。current owner/authority、decision、consumer reference、implementation statusは未確定のままである。

現行mainで差し引いた18文書は、merged PR #1936、#1937、#1940、#1942、#1948、#1953の6 inventoryに記録された `source_documents` に限る。96件は静的監査の未選択数であり、要求atom化の残数ではない。18件も含めた114 file blob全件の意味atom化は未完である。別holdingのpath参照や旧世代の実行は処理済みと数えていない。

監査結果は [report.json](report.json) にある。8文書の旧原文は合計137,328 bytes、1,514 linesで、archive blob/SHA照合は8/8、現行同pathは0/8。asset dispositionは8件すべて `historical / unresolved / unknown / unreviewed`、decision recordなし、consumer_refsなしである。語彙件数は意味上のfailure・consumer・decision・実装完了を確定しない。

候補の検証は次で行う。

```sh
python3 -B scaffold/rdp001-delegated-doc003-unprocessed8/validate.py
python3 -B scaffold/rdp001-delegated-doc003-unprocessed8/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
git diff --check
```

`SCF-B-0029`は全worktree横断で未使用を確認した。authority effectは `none`、stateは `registered` である。旧archive内のworkflow、CLI、hook、adapter、source、test、CI、runtimeは実行していない。PR共有は候補のreview surfaceであり、mergeとpost-merge read-afterは許可されたレビュー対応側が担う。
