# HARNESS Stage4 026–029 review01所見訂正記録（2026-10-05）

このappend-only記録は、本文 `c608bf612cc72c54b6354ebcd77076eda7297cd9` と既存監査 `e35625d92330ffa1f5e7e955e8fc066c98573b05` を変更せず、H4-AUTH-01/02への訂正を本文 `890f66ce91d2d9046e7fbbd92abe3e696a3c97af` に結び付ける。対象はPOが1.0 Stage4で起草適格としたHARNESS-L2-026/027/028/029のみ。承認・独立review・実装・releaseではない。

H4-AUTH-01では、026と全case共通部からL11:445–462/750を汎用戻し先として使う記述を除いた。固定L11 445–462は未採択L2-027〜033の所属候補表であり、全選択親に共通するfailure routingではない。750は未採択L2-044受入本文内にあり、選択親の権威境界ではない。固定親ごとの既存境界に限定し、026はL2-008/L3 authority・L2-009/template・BRAIN/Pattern・HARNESS design/pair、027は選択source/providerまたは019/010/011の該当owner、028は027 source・saved-design authority/L2-014・requirement/L2-008・003/004、029はL2-008/L3 authority・L2-014/022・選択API/data ownerへ戻すようにした。旧監査の誤ったpinは不変のまま保存し、そのraw bytesと意味上の誤記をこの追補で訂正した。

H4-AUTH-02ではAC-028-03を固定receipt oracleへ合わせ、CASE-028-14（対象revisionへ結び付く既存receipt normal）とCASE-028-15（receipt欠落でapprovedを主張する独立negative）を追加した。別revision receiptを拒否するCASE-028-08は維持した。NFR候補とL10測定caseも正確一致・欠落・不一致を別状態として扱う。照合は既存状態の認識であり、承認やreceiptを生成しない。

検証: prior auditのsource pins 28/28をexact revisionのfull file/物理行/raw-LF spanで再照合。採択L2/L11、PO登録、旧FR-14/AT-FR-14の訂正根拠pinsを追加。6 canonicalすべてでbase prefix bytesを維持し、current full/suffix hashesをJSONへ記録した。AC 20、functional CASE 81（028は15）、ID重複なし、AC全件参照済み、全markdown table幅不一致0。`scfctl validate` 147/0、stale=0、residuals=0、`govcheck` 7622/57/58、`git diff --check`はPASS。旧CLI/runtime/test/CIは起動していない。

物理行、source SHA、literal hashesは対のJSON記録を参照。