# IR153 HIL-FR-25〜31 現行pair条件監査

- 基準: 72d08ebc1b45c8cf85c0e89359c48f78eb779fee（2026-10-02）
- 旧IR: archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json SHA-256 80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688
- 旧raw L1: archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md、asset LEGACY-ASSET-719D5EC9C06FC4AAD0FF、SHA-256 db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb
- 現行OS L2/L11 file SHA: bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf / cd0e750cab9e694eed060a619d50527239e1b1291b9550cc0c95dbbd486c7112
- 現行HARNESS L2/L11 file SHA: 78c32b598f449cf80d90e0e35eab6d39b94bd150abbfd543bc75bdb8be949ae6 / a216403173175d9683737b1ab82f7e0ff1a1e85f31b1b155ad63ee3c00cc096e
- 現行BRAIN L2/L11 file SHA: 421eba418a3fa639fdb46bdd902b33d59854aed544f11712d494d7d2e12eaaaa / 833e80f6b27e6f20461f4c57dd8021d146badcd3a6296e2dd7148649a4389ed5
- legacy runtime/test/CIは実行していない。

## Authority read

採否はfrontmatterや候補本文のdraft表示から推定せず、対象revision付きdecisionを正本にする。2026-09-29のpo-decision-2026-09-29-57candidates.md rows 55/56/63/64/66はOS-032/033/040/041/043を採択。OS-041の固定section digestはL2 a43e3eda819e37ef81db0c60c5add5cebce5e3d17ca858c1446c27ac4db80c48、L11 32f08cfa7b070bb902277f79e044e971bbd3948e90621c624d80b167f80d7ded。OS-043も採択済み: L2 e286b34a9805a690f324ebe37ee0936691f636082b49350ee9dc5183787d9a68、L11 136c2c209e30667dc74f1757b00fc482ce1216f05a851990c02437dc9078976b。
2026-09-30のpo-decision-2026-09-30-live26.md rows 43/51/53/54/56/70/76/77はHARNESS-058 + OS-034-003 + OS-101-002を一体採択、HARNESS-060 + OS-103のA案、OS-055のA案を選択。OS-034 adopted pairはL2 6b019294047fce2e1c8b5d1b5e8d379fa9111f5912274f6dca918ffd81c0e1e8、L11 b89f63d709b38de1ddc8b7ca7d51de595b9cae587da320e027aefed67a3a4e4b。OS-040も9/29 row 63で採択（L2 dfd272b75826d37333671f7152a0a58d2d013f0bd13a3f3957a76a39dcdfad80、L11 a70e3b1af4b22d3370c6a845fc6b5ced1e1162e2cea66cb1d0664211130533e7）。
2026-09-24 PO decision（concept-requirement-po-decisions-2026-09-24.md rows 108/120/125等）はHARNESSの動的CIとOS workflow意味変更を選択。2026-09-28 OS base decisionは採択OS pair 014〜029に018/019/020を含む。

## 条件別照合

| 原要求 | 原文 | 現行行き先と判定 |
|---|---|---|
| HIL-FR-25 | 旧L1:115、IR #/HIL-FR-25。ZIP由来build/agent metadata/assignment/schedule/trace/impactをversioned capabilityとして分離し、snapshotごとrun/artifact/digest/exit statusを記録。 | 採択OS-033 pair (9/29 row 56) はcapability別identity/versionとsnapshot/run/artifact/digest/status、同条件再現oracleを保持。旧ZIP engine方式は含めない。formal successor未割当。 |
| HIL-FR-26 | 旧L1:116、IR #/HIL-FR-26。spec/schema/trace/consistency/file/metadata detectorをcoreから分け、finding code/severity/location/subject/evidence/version、run/dedupe/provenanceを永続化。 | 採択OS-033 pairが分離、finding/provenance/replay条件を保持。旧detector実装は移植しない。 |
| HIL-FR-27 | 旧L1:117、IR #/HIL-FR-27。startup/handshake/request/progress/result/error/timeout/cancel/process exitと失効runのlate result commit拒否。IR statement digest d07429d447a619e36123eef0eec84033d66bea379ac65c632db5de7794781ecb、record digest 7ca748a46d5554641a3a4f7cf2f003b597ded3ee3877617c74fcadce94035c06。 | 採択OS-018/019/020はassignment/attempt/expiry stop/durable evidence/stale/unknown/未完、OS-043はapproval request/call/result相関を分担する。043はresultからauthority/採択/writeを導かないが、terminal後late resultのcanonical commit拒否oracleはない。そこで「失効runの遅着resultをcommitしない」一atomだけをOS-115未採択候補へ対応させた。候補は明示したtimeout/cancel/lease・deadline expiry/process exitとduplicate/mismatchまで一般化しており、原文のexpiry条件を越えるため、その一般化を現行採択状態とは扱わず下記PO判断へ残す。関連HR/HAC/HATとFR-27残り、正式successorはholding。 |
| HIL-FR-28 | 旧L1:118、IR #/HIL-FR-28。固定3段と必須check、SHA/tree/result/artifact、単調stage遷移。 | 9/24 POが固定列をticket/revision/pair/riskから必要検証を導く動的CIへ意味変更。HARNESS-005が義務/oracle、OS-008/020が運転/回収。対象と証拠を結び、required欠落/stale/未実行は成功にしない。旧段数/順序は現行要件でない。 |
| HIL-FR-29 | 旧L1:119、IR #/HIL-FR-29。check/fingerprint/baseline限定quarantine、reason/remediation/owner/expiry-or-cap/minimum gate、fingerprint変更で通常failure。 | 採択OS-032 pair (9/29 row 55) が同じ意味と負例を保持。旧CI runtimeは実行しない。 |
| HIL-FR-30 | 旧L1:120、IR #/HIL-FR-30。criteria/責務でcurrent_pr_fix対successor_issue、次件のみsame-cause ID promotion、writerへの一括返却、途中欠落not ready。旧outputsはduplicate check/Issue/Universal Reverse/memory summary/Codex queue。 | OS-010 ticket section、HXT-FLOW-07 governance-requirements.md row 605、OS L11 rows 48/305がcurrent fixをwriterへ一括返却またはsame causal IDのnext ticketへ送り、drop/reflowを拒否。HARNESS-058+OS-034/101 adopted setが分類/evidence/authorityを補う。ticketが正、Issue/PR等はprojection。旧物理fanoutをそのまま現行の要求へ移さない。OS-116は起草せず、物理fanoutと現行canonical recordsの意味選択肢を次節に残す。 |
| HIL-FR-31 | 旧L1:121、IR #/HIL-FR-31。affected layer別L1/L12またはL2/L11+screen applicability/Prototypeをstale化し、再承認前implementation claim/Forward拒否。 | HARNESS-003/004とL11が変更影響/pair/Prototype・PoC applicabilityと未合意前進拒否を保持。OS-055 + HARNESS-060/OS-103 decision Aは適用確定工程だけ照合し、unknown applicabilityは止める。POは旧一律stage gateでなくscope適用へ変更。 |

## FR27候補115のPO判断点

原source atomは「失効runのlate resultをcommitしない」である。候補HELIXOS-L2/L11-115は既存assignment内の同一attemptに限定し、timeout、cancel、lease/deadline expiry、process exit後、および既存OS contractが終端と定義するその他のresultが終端状態・accepted/current結果を変えないことに加え、duplicate/mismatched resultを拒否またはunknown/staleで保持する。したがって候補は原文atomを、既存contractで既に定義されるterminal原因へ一般化し、duplicate/mismatch処置を追加している。これは採択済みOS-018/019/020/043から採否を推定できない差分であり、FR-27全体へのformal successor割当でもない。

receipt [`helixos-l2-115-late-result-coverage-receipt-2026-10-02.json`](../requirement-registration/helixos-l2-115-late-result-coverage-receipt-2026-10-02.json) は、候補L2/L11のfull-file SHA、section境界・digest、固定OS L1親と2026-09-28 PO decisionをそれぞれ固定する。候補採否は未決。

POには次の具体選択肢がある。**A（推奨）**は対象revision付きで候補pairを採択し、timeout/cancel/lease・deadline expiry/process exitと、既存OS contractが既に終端と定義する原因へ限定した一般化として選ぶ。同一attemptのduplicate/mismatchも候補記載の範囲で扱い、この判断だけで新terminal原因は追加しない。これはOS-004/018のassignment/attempt終端、OS-019のsource/revision/evidence、採択OS-043のcall/result相関、およびL11-115のlate-result拒否oracleに影響する。**B**は原文のexpired-run late-result no-commit範囲に候補を狭め、HACのcancel/timeoutは補助oracleとして保持しつつ、process exit、既存contract上も未確定の端点、duplicate/mismatchを独立条件にしない。影響は同じ4契約のうちexpiryと未決端点の適用境界に限られる。**C**は対象run/attemptとterminal適用範囲の選択まで候補を未採択で保留し、source atomとholdingを維持する。OS-004/018での適用run集合、OS-019でのsource/revision/evidence scope、OS-043でのcall/result種別、L11-115での適用oracle範囲が未確定のまま残る。いずれもMPR、receipt、監査から採択・実装・運転許可を生成しない。

## FR30の未決意味差

旧IRの複数出力原子性を現行の単一canonical ticketとそのtyped relationへどこまで意味移管したかは、既存decisionに明示したcurrent output集合がない。選択肢Aはcurrent ticket/causality/projection/knowledge boundaryを意味代替とし、旧physical fanoutとsource holdingを閉じない（推奨）。選択肢Bは現行output set/owner/all-or-none条件をPOが明示し、その後に候補要否を判定する。BRAIN-L2-007はgeneric knowledge promotion条件を定めるが、旧issue summary projectionを採用しないことだけから別の旧summary semanticsをretireしない。この範囲はOS-010/HXT-FLOW-07、OS-009、HARNESS-058/OS-034/101、BRAIN-007へ影響する。

## 補助source・残件

旧system_contracts.json SHA-256 2a7df673138568526e714342679ce2982238966b42f2d1967b2da92e9dbf02ab はHR-FR-HIL-10(FR25/26)、-12(FR27)、-06(FR28/29)、-04(FR31)を結び、HR-FR-HIL-16はFR30/31の関連context。旧L3 acceptance design lines 35/36/38/42/44はHAT-HIL-03/04/06/10/12を、L9 system test design lines 29/30/32/34/35/36/49はHST-HIL-002/003/005/007/008/009/022を対応付ける。HOT-HIL-23/24/27/28はL1 operational design lines 50/51/54/55。HAC-HIL-12a/b/cとL6 worker unit design line 38はnormal、anomaly/partial、late-after-cancel/timeoutの旧oracleを含む。これらは未実装の設計条件で、現行要求の採択・実行証拠ではない。旧Node/Python、JSONL IPC、harness.db、固定gate列を現行へ移さない。

carry-forward ledgerではIRの7 identityがpreserved_pending_rehome、successor IDsは空。OS-115 candidateは採択・owner移管・全体closure・formal successorを作らない。legacy-ir-functional-source-recheck-2026-09-28.md（base 559）は歴史locatorだけでcurrent status根拠にしていない。

残件:
1. OS-115の対象revision付きPO採択または不採択。判断前に実装claimへ進めない。
2. FR27残余、各IR全行のformal successor/owner/whole-row closure。今回の限定候補から生成しない。
3. FR28 fixed-stage source atom全体の正式disposition。POのdynamic meaning changeは記録したがholdingは残る。
4. FR30の旧physical output identityを含むsource全体のclosure。現在のticket route意味は保持しているが旧出力同一性は主張しない。

機械可読のsource row/text/hash/statusは同名JSON、候補対象atomはregistration ledgerとcoverage receiptにある。

現行PR比較baseは `7b9d1938fc7699404f68c2b87829df56dc6f690d`。既存OS本文と646行台帳prefixを保持し、115のみ末尾追補した。構築時72d08ebの履歴source/readingsはその時点の証拠として区別し、current_file_sha256とcandidate pinは統合後bytesへ追随する。
