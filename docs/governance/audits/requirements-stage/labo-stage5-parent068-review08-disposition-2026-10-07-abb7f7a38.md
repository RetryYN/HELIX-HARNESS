# HELIXLABO-L2-068 review08 時点処置監査（Root検収用）

- 対象 PR #2638、HEAD `abb7f7a38c95080f17b021791e3790faf252073e`（親 `e00bf5600f786e253e1c9940d050a66c91bda2d3`）、base `ceda1c53b53c53fffb8c23f394add1f2b809deb1`。working treeはclean。
- 正式comment 6024349509はUTF-8 4664 bytes、SHA-256 `2885a8df7ea9b71c0fe5f387bb171f38234eae8644826be57537e513f79a1fe8`。review01–08のcomment本文とR19/R20残余の全文をJSONへraw保存した。
- Root exact changes `/tmp/root-labo068-review08-exact-changes.json` は3件。現HEADのFVでafter literalsを照合した。

## Major M1の処置と照合

review08は、S1に有効に属するAttempt Xを同一入力へ置いたとき、S0の正常count 4からXを除外するfixtureがなく、誤って5を返す処理を拒否できない点を指摘した。Rootの処置は、CASE-01正常baselineにscope外Xを追加しつつS0 count=4/X除外を照合し、新しいCASE-r08-outside-scope-countedで出力countだけを5へ変える単独変異を拒否するもの。

- 修正後FV: 39定義、39 unique ID。
- 修正前HEAD `e00bf5600f786e253e1c9940d050a66c91bda2d3`: 38定義、38 unique ID。全38 IDが修正後にも保持され、新規IDは L10-LABO-068-CASE-r08-outside-scope-counted。
- 6本文すべてで、base prefixをbyte一致確認し、base prefix SHA、追補suffix SHA、現HEAD全文SHA/byteを再計算した。全pinはJSONの `six_document_actual_pins` にある。
- 固定L2/L11 spanはcommit `318ec4a04abb3c1cc17111b3d939f913facd5fd3` から実読してfile/span SHAを計算。PO判断はbaseの83行目を実読し、HELIXLABO-L2-068採択・MPR行を記録した。

## 履歴と検証限界

R1–R18を含むreview01–08のcomment原文、R19/R20のreview08残余、過去の旧25 literal checkpointと旧監査pinをJSONに保持した。旧25 checkpointはa4 snapshot時点であり、修正前HEADの物理38 IDと時点を分けた。

Root報告のgovcheck/diffcheck PASSは報告値として記録し、再実行していない。fixture実行、現HEAD独立review、承認、canonical編集は未実施。件数は意味完全性を証明しない。
