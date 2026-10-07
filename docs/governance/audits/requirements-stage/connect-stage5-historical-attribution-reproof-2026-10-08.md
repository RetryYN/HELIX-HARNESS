# CONNECT Stage 5の過去review帰属再照合（2026-10-08）

この追補は、PR #2615の旧委任判断を変更せず、当時のOpus/Fableコメントの帰属と対象6本文を最新mainで再照合した時点証拠である。対象はCONNECT Stage 5、固定親HELIXCONNECT-L2-007のみ。BRAIN parent024、OS parent025、他の過去3群は対象外。新しい承認、merge admission、L10実施を生成しない。

## reviewer帰属と条件1/2

- 条件1はOpus 5.5のcomment #6039141314（UTF-8 2,053 bytes、SHA-256 `c96c4afe6afd020b2ffd8949107665992aadcb2d094a84a31bb806602c1169db`）。本文はreviewer本人をOpus 5.5とし、`af0c0641c9b6df37a0742bbb9325d868db3e815a`／HEAD `0a6d7d45275da97d2deaa924e637ad1d67da53b1`を対象にMajor 0、未確認範囲0と結論する。
- 条件2はFable 5.1のcomment #6003274683（UTF-8 3,442 bytes、SHA-256 `dbca06f94af25037412ab6c7c234a59670ddffae449806ea43cd645b2df5a55e`）の結論「承認してよい」。同コメントにはreviewer帰属の曖昧な記述があるが、Opus comment #6039141314がこの#600327コメントはFable稼働セッション由来でOpusではないと明示し、誤帰属を訂正している。Fableには非blocker Minor 1件がある。
- この追補では両コメントのraw全文をJSONへ保存し、全文SHA・長さ・source URLを固定した。Opusコメントは当時の判断記録/audit/Fable見解を読まずに本文・固定親・PO採択行をブラインド照合したと記載している。Fableは当時の6本文・固定親を再照合した旨を記録している。

したがって、条件1と2の事実は、同じ`af0c...`本文revisionについて現在再証明できる。最新main `ba0df9a49ab635c020e4ec74fc05c72a49352c90`の6本文は、Fable commentが特定するreview HEAD `0a6d7d452...`の各本文とbyte-for-byte一致し、既存delegated-decision pinの6 SHAにも全件一致した。6件のSHA/byte countはJSONにある。条件3はこの記録で満たしたことにしない。Root検収後に独立reviewerが6本文不変とpinを照合するまで、新しい委任承認は発生しない。

## 固定親と旧source

採択親は固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2-007:128–138（span SHA `a2ce7b34ee2d389fbc60a45329c66014a02739150e0cc3c577188aa5578d6228`）とL11:74–77（span SHA `1caa90d7e3b407c72bea119a4084eb37e9e828c6889ea8621d65410a090a0ade`）。旧sourceの既存inventory範囲から、SEC-AC-CAP-009部分成功→Recoveryと`correlation_id`定義の旧2箇所を原文とSHAで読み直した。いずれも隣接比較であり、CONNECT親への直接要求sourceとして扱わない。既存のbounded searchはその検索範囲内に限り、全archiveの意味網羅やsource不在を主張しない。

旧decision、decision pin、review01/02 correction、Root review01/02/03 evidence、委任規則、GitHub upstream ruleの既存bytesは変更せず、新記録にSHAを列挙した。作業は新しいaudit JSON/MDの2ファイルだけで、旧CLI/runtime/hook/test/CIを実行していない。独立reviewと条件3の確認は未完了。
