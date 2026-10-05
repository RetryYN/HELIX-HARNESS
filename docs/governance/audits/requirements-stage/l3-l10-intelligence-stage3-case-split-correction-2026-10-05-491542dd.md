# INTELLIGENCE Stage 3 CASE分解・条件同期の追補

本文revision: `491542dd5b28788dc561b9e0b743b3731662a87c`。作成側の文書補正であり、L3承認・独立review・実装/実行許可を生成しない。

007–009、011–016、018–020、067、072、073のnegative変異を単独IDへ分け、併発、held-out normal、局所unknownを別CASEにした。functional verificationは168行から310行へ増加（+142）。078の既存61行は編集前revisionから完全一致で保持した。

011では共通corpus/scope/評価条件revisionを共有条件とし、各model/provider実行版が候補間で異なる正常比較を認める。欠落版・宣言版と結果版の不一致・共有条件の不一致は別negativeにした。072では`MPR-RC-HELIXINTELLIGENCE-L2-072-004`の4 partと`MPR-RC-HELIXINTELLIGENCE-L2-072-005`の2 partを区別し、6 raw source spanの欠落を個別化した。

6本文のStage 3前prefixは編集前HEADと一致し、CASE ID重複0、AC参照切れ0、table幅不正0。078既存行は61/61 byte一致。`scfctl validate`は147 bindings / fail 0、stale 0、residuals 0、`govcheck`は7622 atoms / 57 requirements / 58 filesで成功。

固定sourceはL2/L11/PO decision revision `633bf12ea8f948db8ba3d6600179c4a9507377a7`からraw bytesで再計算し、physical line boundsとraw-LF SHAをJSONへ保存した。旧publication/correction auditはimmutableのまま保持。これは作成側の対応確認で、独立reviewやoracle executionではない。