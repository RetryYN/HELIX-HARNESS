# HARNESS-L2-036 作成側監査候補

状態: 候補。本文review、承認、独立review、finding closeは成立していません。canonical変更もありません。

本文revisionは `c768454f1900ca104b3467fe601c8deb6ca9817c`、最新main基準は `a2638477be294880ba33e215778a763caacfa6ee` です。作業枝はcleanで、merge-baseは最新main基準と一致します。6正本はそれぞれmainのblob全体を先頭bytesとして保持しています。`1fd2285a0774f4e1b5180e5e89012a1258ac2266` と `b1ebc7f45141c8a16946b78139a4ac530e53be75` は履歴snapshot、current pinsは句点修正後の `c768454` です。

6文書のcurrent/base SHA、bytes、prefix維持結果と各履歴revisionのSHAをJSONへ収録しました。固定L2/L11は `318ec4a04abb3c1cc17111b3d939f913facd5fd3` の物理span、PO採択行とMPR登録行は `17a2f310358ee7fe209b9d37cddf4a927c740248` でpinしました。G0/登録記録から新しい要求やgateを導いていません。

functional-verificationには、6データ列からなる完全IDのcase行が95件あり、IDは一意です。旧公開revision `3fd20391f842310012d09c33f5383497898b3afe` の90 IDは現行にすべて存在し、新しい5 IDもJSONに列挙しています。全95行の実literal、AC、baseline、mutation/index、oracle、raw-LF SHAはJSONに含みます。これは変更影響のcensusで、完全性証明ではありません。

分類欄は本文が明記する「索引」「正常/無変異」「変異あり」を転記したものです。単一性と独立fixture性は未判定です。旧receiptの20 index / 66 negative / 4 normalは旧公開90件に対する歴史的ラベルです。08およびr02-unseen系等の分類には疑義があるため、現行95件へ機械的に継承していません。

旧source/consumerの6 bounded spanは、FR source snapshot、NFR source snapshot、L6 pair consumer、L6 FE consumer、L7 test consumer、旧NFR consumerです。各full/span hashとraw-LF literalを記録しました。また関連する旧L3定義 `9A77` / `B5B5`、business `A6E2`、NFR `DB66` のasset ledger行も識別していますが、これら4本文は未読・未pinであり、本候補の意味根拠へ使っていません。旧実装、test、runtime、CIは実行していません。

正式review対象は **PR #2602 review19** comment `6010662968` のうち、036範囲のM1/M2/m1/m2です。raw本文のbytes/SHA、4所見の原文、作成側の限定提案をJSONに保存しました。隣接親の範囲は含めていません。review方法comment `6013171449`（PR #2623）は完全性を一句ごとのfixture義務とせず、責務境界・authority/完了生成・弱oracle・親境界の破壊を重視する基準としてbody/hashを記録しました。提案は所見解消やreview承認を意味しません。

検算結果は、current literal 95行・unique ID 95件、旧ID保持90件・欠落0件・追加5件、main prefix一致6/6、旧source span一致6/6、formal block一致4/4です。分類の意味、fixture単一点性、独立reviewは未確認です。

詳細literalと再現手順は同名JSONに収録しています。
