# HIL-09監査のHARNESS-L2/L11-027採択authority訂正

## 訂正対象

この追補は、#2439でmergeされたHIL-09監査の誤記だけを訂正する。既存監査は書き換えない。

- 対象: merge commit `225f1d2acd7f180f317cef96acb4922d36d6ab74`（#2439）、blob `60803cce4176f3df9c9b6457fbe848ff78e723c4`、`docs/governance/audits/requirements-stage/hil09-auxiliary-source-receipt-condition-audit-2026-10-01.md`、SHA-256 `92f5ae75694f1d2564f1a274f9443791197b81a4881cf05b74db12b5bcc9d05d`。
- 誤りの位置: 同ファイル62–67行。HARNESS-L2-027と対応L11を「candidate」「unexecuted selected-source candidate」と記した後、67行で「candidate material, not a successor」と総括し、固定revisionの採択済みauthorityを反映していない。

## 正しいauthority

2026-09-28 HELIX-HARNESS PO判断記録 `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md`（SHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`）が、確認資料に固定されたL1 revisionと対のL2/L11一式を対象に、明示候補24件を全件採用している（25行）。表のHARNESS-L2-027行は`MPR-RC-HARNESS-L2-027-003`を対応付ける（56行）。判断記録は027を含む残り候補も、固定確認資料の所属・適用条件を保持して採用と明示する（66行）。承認対象本文の「候補」等の記述は判断前の固定bytesとして保持する（68行）。従って訂正後のauthorityは、f6固定revisionのHARNESS-L2-027/L11-027 pairが採択済み、である。

判断対象の固定点:

- decision target commit: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- L2 `docs/helix-harness/L2-requirements/product-requirements.md`: SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、blob `e09de04601039d8593768eb3f3342d3416d03b8b`。027 section 559–571行。明示scopeは選択した静的code、DB definition/schema、API definition、configのreadであり、running service・customer DB dataのscanと実適用を含めない（565行）。
- L11 `docs/helix-harness/L11-acceptance/product-acceptance.md`: SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`、blob `f827c6bd955bbeb91deba5b7dced93e512e5da9e`。027 acceptance section 365行以降は未実行oracle候補であり、実行済みpassではない。
- Decision tableは027を1.0、unit、`registered_proposal` / `authority_effect=none`の登録IDとともに載せ、receipt `MPR-RCPT-HELIX-HARNESS-STAGE-REVIEW-2026-09-27`およびdigest `c6c3b2863eaf026ac61c4e272acc197c6021c24e74b4899a23631c74b67b8860`へ結ぶ（56行）。この登録metadataとL2/L11に残る候補表記は歴史的・管理上の値であり、PO decisionが示す採否authorityを取り消さない。

## 適用範囲と残る未解決事項

この訂正で変わるのは027のauthority記述のみである。静的なcode/schema/API/config artifactを選択scope内で扱う候補の採択は、実データや実行環境を走査した証拠ではない。HIL-09固有のZIP・指定2 repository・現行HEADに対するexact 3-source census、sealed source authority、ref/entry/edge denominator receipts、実行receipt、正式successor割当、HIL-09の閉包・受入完了は、引き続き確認されていない。HARNESS-L2/L11-027の採択からこれらを導かない。#2439監査に記された他のHIL-09 residualとsource custodyの判定はこの追補の対象外である。

## 静的照合

#2439の対象blobと該当行、2026-09-28 PO判断記録の25/56/66/68行、f6固定L2/L11本文およびstage review receiptを静的に照合した。旧sourceは旧要求 `HIL-BR-14`（旧移行L1 `infinity-loop-platform-requirements.md:66`、IR `requirements.json#/HIL-BR-14`）と#2439が参照するHIL-09 source/consumerを参照起点として確認した。旧runtime、test、CLI、hook、CIや外部顧客DB・running serviceは実行・走査していない。
