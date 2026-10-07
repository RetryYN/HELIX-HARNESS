# HARNESS-044 review08 postbody時点監査

対象はPR #2641、body revision `36b7fa508d5c61b6f4eb8743e23fa02e14ce11d2`、parent `ce753466868d7bedaa72ea90e12e36e4198431f3`、review base/merge-base `0acbed34bfda48e32092feb63db61d2eff6d5ec4`。JSON監査記録 `docs/governance/audits/requirements-stage/harness-stage3-parent044-review08-disposition-2026-10-07-36b7fa50.json` のSHA-256は `5c5287f12a5bbc773b944005dd8de4466018a988868578371f4cfd4b6933085a`。6文書の現在の全文SHA・byte数、suffix SHA・byte数、実本文はJSONに保存した。

実HEADから6本文を再読しRoot integration checkpointと照合した。全6件でfull SHA/bytesが一致し、baseの完全prefix、suffix、LF、v2候補after byteとの一致を確認した。IDは旧64件を保持した76件で全て一意。旧39 raw literalは元blobの物理行と照合した。固定318 L2/L11のfull/span SHAと11件の旧source/consumer pinも再照合した。

Formal review08のcomment ID `6025933756`を含むreview01〜08全16件のrawを保存した。過去レビューの照合漏れ、R1–25、X1の記録も保持。X1 historic auditは当時のrevision/bytes/SHAがimmutable pinと一致する。X1はbase `0acbed`のtracked treeには存在しない旧時点監査記録であり、現行本文のSHAと混同せず、その歴史的pinとして扱う。review07 postbody audit `0999a056…`の6 SHAは歴史記録として別に保存し、今回のbody `36b7fa…`の6 SHAと混同していない。

Rootはv1候補の変異対象・不変条件の矛盾、抽象的なstale/conflict値、r17出力誤りのAC範囲漏れを指摘し、v1は採用せずv2へ訂正した。v1全文、v2全文、Root指摘と訂正内容をJSONに保持した。v2と実bodyはbyte一致する。Root報告govdiff PASSは未再実行として記録。

この監査はpostbody readbackであり、独立review、fixture/L10実行、PO承認、意味完全性は主張しない。正本編集・commit・push・PR操作・mergeは行っていない。
