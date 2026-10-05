# LABO Stage 5 Root補正追補監査（13親）

記録日: 2026-10-06。対象base mainは`1d7f57491`、本文commitは`66d0acd32334afb18a43ae281b9194d1d64d681a`。対象は既存の採択済みStage 5 / 1.0 の13親だけで、固定L2/L11、owner、scope、versionを変更していない。D1の065/067条件付きscopeも維持した。

Root所見10項目を読み、追補table delimiterを追加した。全412件の対象functional CASE IDは重複0で、全行の終端pipe欠落0。内訳は独立定義394行、alias/index 18行。index/aliasはfixture数から除外し、完全CASE IDで単独oracleへ結ぶ。CASE-28〜72は固定L2-061 task snapshotの15項目それぞれについてmissing/stale/mismatchを単独化した45行である。

親別のL10 CASE行数は050=19、059=40、060=36、061=89、063=19、064=17、065=38、066=18、067=18、068=17、069=21、070=62、071=18。05006は対象revision変更のみを変え、旧verification receiptの新revisionへの非適用を結果として扱う。05007はこの帰結の索引である。05922、06023/26/29、06125/26/27、06405、06520は元IDを残したalias/indexにした。複合行05008、06416、06513、06607、06713、06915、07009、07022もindexへ置き、064/065/069/070の不足する単独観点は独立CASEで補った。

ownerは固定親が示す原因ownerへ一意に戻し、固定sourceから個別特定できないものはunknownとした。07010/11はHARNESS、07016/17とduration source eventはOS。価格、mapping、decision等のownerを推測で足していない。追補文の説明は日本語とし、contract field/識別子のみ原語を保持した。

6本文のfull SHA、main prefix SHA/length、Stage 5 suffix SHA/lengthをJSONへ固定し、6/6 prefix exactを確認した。固定L2/L11の13親、PO/G0登録、旧source full digestとspan literal/raw-LF SHAをJSONへ固定・再計算した。旧source/body audit二件は変更せずSHAを記録した。

`git diff --check`と文書ID/trace/tableの静的確認を実施。旧runtime、旧test/CI、Bun、新世代CIは実行していない。CASEは未実行で、効果・実装・承認・受入の証拠ではない。このfollow-upは独立reviewではない。

詳細なCASE literal、13固定親、旧source pins、Root所見ごとの処置と静的検査結果は同名JSONを正本とする。
