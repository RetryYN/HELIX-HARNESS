# 旧source起点の条件別再照合：追補記録

## 基準と範囲

本記録は[旧source起点の中間照合](legacy-source-origin-recheck-index-2026-09-28.md)の残差を追う。基準mainは同記録を含む `f4b2a2b02cf5ea3134e27be0a65c100395161bad`（PR #2235のmerge commit）とし、旧原文の行・SHAと本体8機構のPO判断済みL1/L2/L11を照合する。旧sourceに似た現行語句や関連IDがあるだけでは、原文条件の採択済み被覆と判定しない。archive内のworkflow、CLI、hook、runtime、test、CIは実行しない。

この追補は、旧能力・候補を新世代へ自動採択する判断記録ではない。旧sourceの保持、要求候補の起草、人間による採否、L3以降の実装、L11の実行結果を区別する。Web／WEB-OSの1.x材料は今回の本体8機構の合意に含まれない。

候補件数の基準時点にも注意する。25件の検算結果はcommit `9e6ac25bf4196a97e42cf4f9111cff47178f7abd` の判断パケットJSON（SHA-256 `187f9570344ca3a64b7a6c9182d88dc8daeabce2ac14bc03791c5adba906f1ec`）を指す。#2238・#2241の追加2件を加えた現行パケットは27件である。27件はいずれも採否未決であり、mergeは候補のauthority状態を変えない。

## 条件別照合

| 母集団 | 明細と判定境界 | 残余 |
|---|---|---|
| PHCAP-02〜18・20の18能力 | [旧条件→現行要求の照合](phcap18-condition-recovery-audit-2026-09-28.md)と[構造化明細](phcap18-condition-recovery-audit-2026-09-28.json)。旧source 50参照のsource-file SHAと、現行L2/L11の145行別参照ID・行位置を照合。16能力は採択済みL2/L11に関連条項があるが、能力全体の回復とは判定しない。 | PHCAP-08のWBS同等性は不明、PHCAP-15のWeb-OS展開は対象外。現行の実装・受入実行による能力成立は0件。旧consumer閉包と条件単位の正式後継は未確定。 |
| v1.3の521非空行 | [候補母集団の境界監査](legacy-v13-candidate-population-boundary-audit-2026-09-28.md)で行SHAを全件照合済み。追加の意味分類と現行の受け先判定は別明細に分ける。 | 明示IDの有無だけでは被覆を証明できない。 |
| 旧candidateの92文書・4,755行 | [条件の一次分類とroute](legacy-candidate4755-semantic-routing-2026-09-28.md)、[4,755行の構造化明細](legacy-candidate4755-semantic-routing-2026-09-28.jsonl)を作成し、旧原文の行SHAと92文書のfile SHAを全件照合した。870行を暫定的な条件行としたが、説明分類から実際の条件5行を追加発見したため、分類は完全ではない。 | 暫定条件870行のうち141行はsource relationのみで被覆未証明、155行は未採択候補との関係、574行はunknown。説明分類2,959行にも条件が残る可能性がある。行き先不明を「失われた条件0件」へ換算しない。 |
| 確認PR後の25候補 | 基準commit `9e6ac25bf4196a97e42cf4f9111cff47178f7abd` の[25件の構造化明細](https://github.com/RetryYN/HELIX-HARNESS/blob/9e6ac25bf4196a97e42cf4f9111cff47178f7abd/docs/governance/audits/requirements-stage/post-confirmation-25-po-decision-packet-2026-09-28.json)と同時点の判断パケットでsource・版・対L11・影響先ごとに整理した。生存register・receipt・当時の候補本文のdigestは、各receiptの複合節規則に従い25件一致した。現行の[候補一覧](post-confirmation-candidate-inventory-2026-09-28.md)と[PO判断パケット](post-confirmation-25-po-decision-packet-2026-09-28.md)は後続2件を追補している。 | 基準時点の25件は全てPO未決。A/B/Cは選択肢、Aは推奨に限る。mergeやreview指摘0件を採択へ読み替えず、後続版の候補を1.0へ前倒ししない。 |
| #2238・#2241統合後の追加候補2件 | [後続差分](post-confirmation-candidate-inventory-2026-09-28.md)にHARNESS-L2-042（`MPR-RC-HARNESS-L2-042-001`、coverage receipt `harness-refactor-episode-coverage-receipt-2026-09-28.json`）とHELIXOS-L2-038（`MPR-RC-HELIXOS-L2-038-001`、coverage receipt `os-layer-ledger-writer-coverage-receipt-2026-09-28.json`）を追記。両PRはmerge済みだが各receiptは`authority_effect: none`、candidate stateは`unadopted`。 | 先行25件の記録は基準時点の履歴として維持する。後続差分を加えた現在の生存候補は27件で、追加2件もPO未決。merge、register、L2/L11本文、coverage receiptから採択を推定しない。 |

## 次の判定

手順5の終了には、旧sourceの機能・要求・受入・運用保証の各条件に保持／再導出／置換／後続版保全／記録付き廃止の行き先が必要である。今回のPHCAP照合は代表assetにboundedした監査であり、旧4,020資産の全consumer閉包を証明しない。手順6の終了には、未採択候補の採否と最後の総合整理の指摘0件が別途必要である。いずれも本記録だけでは成立しない。

## 後続追加：HR-FR-P2-07／HELIXSECURITY-L2-032

旧v1.3 §4.10 HR-FR-P2-07（REQSRC-SUP-00332、archive line 430）の意味条件に、[HELIXSECURITY-L2-032](../../../helix-security/L2-requirements/security-requirements.md#helixsecurity-l2-032)と対L11を未採択候補として追補した。source line/file digestと候補coverageは`security-v13-worker-bypass-coverage-receipt-2026-09-28.json`に固定し、生存registerは`MPR-RC-HELIXSECURITY-L2-032-001`である。#2255後の現在のPO判断集合は[36候補packet](post-confirmation-25-po-decision-packet-2026-09-28.md)へ更新された。候補存在から条件閉鎖や採択を推定しない。


## 後続追加：HARNESS-L2-046／現行37候補

旧v1.3 §4.4 L259の二文（Full V段階freeze/検証、Production Scrum delta/backfill/SR4）と§10 L647の要約文を、archive revisionおよび6fabd125監査基準revisionで照合し、6 sentence spansを[HARNESS-L2-046](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-046)と対L11へ未採択候補として追補した。L647は部分重複要約で第3の独立条件ではない。生存registerは`MPR-RC-HARNESS-L2-046-001`、source-lines/coverage receiptは`harness-fullv-scrum-source-lines-2026-09-28.jsonl`と`harness-fullv-scrum-coverage-receipt-2026-09-28.json`。Full VにScrum slice/checkpoint/SR4を適用せず、Scrum適用scopeだけにbackfill条件を置く。2026-09-25 PO判断の4方式定義・合成許可を維持する。source holding/capture不変。現在の候補集合は37件で、採否は未決。


## 後続追加：HR-FR-P2-08／HELIXOS-L2-042

旧v1.3 §4.10 HR-FR-P2-08（REQSRC-SUP-00333、archive line 431）の原文1 atomを、[HELIXOS-L2-042](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-042)と対L11へ未採択候補として局所対応した。source file SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、line SHA-256 `sha256:53d8b2cd66448f9c5d4828b8fbe99d3bffed93b237fe86e0f515b3d1d7ad933f`、asset `LEGACY-ASSET-02319C2481B9E01698D5`、holding `MPR-SH-SUPPLEMENTARY-003`。source-linesとcoverage receipt `docs/governance/audits/requirement-registration/os-v13-worker-output-coverage-receipt-2026-09-28.json`はarchive input 1 atomを固定する。完全同文のbaseline revision `V13-BASE-6FAB-L0412`（6fabd125 line 412）は別atom・別holding `MPR-SH-V13-BASELINE-001`に残し、archive atomへ統合・加算しない。

候補は`MPR-RC-HELIXOS-L2-042-001`として仮登録、PO未決・未採択。strict schema／digest既定と緩和時の対象・理由・期限・再検証receiptを保持する候補だが、旧source condition unresolvedの状態、655-item holding、他のP2条件、全v1.3 coverageを閉じない。A＝exact candidate採択（推奨）、B＝atom保留、C＝対象revision付き意味変更/retire。


## 後続追加：HR-FR-P2-05／HELIXSECURITY-L2-033

旧v1.3 §4.10 HR-FR-P2-05（REQSRC-SUP-00330、archive line 428、asset `LEGACY-ASSET-02319C2481B9E01698D5`、holding `MPR-SH-SUPPLEMENTARY-003`）と、6fabd125 baseline line 409（`V13-BASE-6FAB-L0409`、別holding `MPR-SH-V13-BASELINE-001`）の同文2 revision atomsを、[HELIXSECURITY-L2-033](../../../helix-security/L2-requirements/security-requirements.md#helixsecurity-l2-033)と対L11へ未採択候補として対応づけた。archive file SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、baseline file SHA-256 `1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1`。両行のline SHA-256は`174f87daa1755264b9066d715a5c8541c9b5a13167f3fa66c18d420fe3ccc1d3`。source-linesと[coverage receipt](../requirement-registration/security-v13-worker-context-coverage-receipt-2026-09-28.json)は二atomを候補入力として別々に固定し、holdingを解消しない。登録は`MPR-RC-HELIXSECURITY-L2-033-001`、`registered_proposal` / `authority_effect:none`、PO未決・未採択。

候補は旧`worker-context-packet.v1` schema・runtimeを持ち込まず、現行descriptor/assignment/authorityによるdispatch binding、既存secret boundary、Worker出力の非権威性を限定する。L2-031の主Worker契約外runtime条件を主Workerへ拡張せず、毎回の人間承認・無関係taskの一律停止も追加しない。現在の判断packetは既存の同一ファイルを39候補・basis main `782a7320925a28d0c7b35ebc54b0ec7cc1329e7c`へ追随した。

## 後続訂正：HELIXOS-L2-042 source reference digest表記

39候補packet JSONにあったHELIXOS-L2-042のarchive line 431 source reference値`sha256:sha256:53d8b2cd66448f9c5d4828b8fbe99d3bffed93b237fe86e0f515b3d1d7ad933f`を`sha256:53d8b2cd66448f9c5d4828b8fbe99d3bffed93b237fe86e0f515b3d1d7ad933f`へ訂正した。値の直列化だけを直し、旧source atom、receipt、coverage意味を変更していない。


## 後続追加：HR-FR-P2-06／HELIXOS-L2-043

旧v1.3 §4.10 HR-FR-P2-06 archive line 429（`REQSRC-SUP-00331`、`MPR-SH-SUPPLEMENTARY-003`）とbaseline 6fabd125 line 410（`MPR-SH-V13-BASELINE-001`）の4 sentence-clause atomsを、typed-event S1 2 atomとNode-exclusive S2 2 atomに分けて照合した。S1のみを[HELIXOS-L2-043](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-043)/対L11へ候補化し、S1 subsetは`no_loss`、unaccounted atom refsは空。source line全体はpartial/no-loss非主張。S2原文「Node control planeだけがapprovalとwrite transactionを決定する」は両holdingに`preserved_pending`。PO選択A=Node専有保持、B=現行責務へ明示再導出、C=理由付きretire、D=保留（現時点推奨）。登録`MPR-RC-HELIXOS-L2-043-002`（-001の人間decision参照欄を訂正し、登録状態のr2 receiptへ参照）、candidate input 2 atom、`authority_effect:none`。

## 後続追加：HR-FR-P6-06／HELIXOS-L2-030 source対応

旧v1.3 §4.10 HR-FR-P6-06のarchive line 432（asset `LEGACY-ASSET-02319C2481B9E01698D5`、holding `MPR-SH-SUPPLEMENTARY-003`）とbaseline 6fabd125 line 413（別holding `MPR-SH-V13-BASELINE-001`）を、それぞれpackage内容S1とPLAN-M-02承認境界S2へ分割した。原文・file/line/span SHAは[source-lines](../requirement-registration/os-v13-p6-06-package-source-lines-2026-09-28.jsonl)に固定。S1の2 atomだけを既存未採択[HELIXOS-L2-030](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-030)と対L11へ対応づけ、既存96 atomに加えた98 atomの限定入力として[receipt r3](../requirement-registration/os-package-acceptance-coverage-receipt-2026-09-28-r3.json)・登録訂正`MPR-RC-HELIXOS-L2-030-003`に記録した。候補本文は不変。S2の2 atomは両holdingに保留し、旧PLAN-M-02の識別子cutover固有の承認境界と現行SECURITY authorityとの等価性・適用scopeをPO判断事項として[局所receipt](../requirement-registration/os-v13-p6-06-package-coverage-receipt-2026-09-28.json)に残す。旧行全体のno_loss／condition closure、候補採択、publish/cutover許可は主張しない。

## 後続追加：HIL-FR-68旧source meaning residual（40候補外）

旧archive `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:158`（file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、line SHA-256 `1cb33f5f4fb41235b6e5930dc888fdff561a3d6eff99d50f816ea6ab8b151cd5`）のHIL-FR-68を候補40件とは別のPO未決residualとして記録した。旧IRはHR-FR-HIL-23／HAC-HIL-23a/b/c／HAT-HIL-23へ接続する。OS-L2/L11-043はWorker typed-eventの部分重複のみ。PO採択済みCONNECT-L2-001/002/005は明示された機構間connectionのadapter/transport版・互換・traceを扱い、Workerを自動でCONNECT connectionと見なさない。旧CLI移行、Node code-held approval policy/policy digest、adapter version/ACP互換評価のowner・適用範囲は未割当。具体的選択肢と推奨A（保留・保全）は[PO packet](post-confirmation-25-po-decision-packet-2026-09-28.md#hil-fr-68のsource-meaning-residual40候補外po未決)へ記録。ACP adoptionも旧source全体のno_loss/closureも決定・主張しない。


## 後続草稿：HR-FR-HYB-006／HELIXOS-L2-044（限定negative oracle）

旧v1.3 §4.6のarchive line 290と6fabd125 baseline line 275を別revisionとして確認し、`HR-AC-HYB-006`の「prose handoverだけの解決」spanだけをOS L2/L11-044未採択候補へ限定対応する。file/line SHA、span、holding、atom範囲は`docs/governance/audits/requirement-registration/os-v13-hyb-006-feedback-resolution-source-lines-2026-09-28.jsonl`と対応receiptに固定。候補入力2 spansはno_loss、両source lines/旧HR-FR-HYB-006条件はpartialでclosureを主張しない。FR側のfeedback lifecycle/event-projection/SessionStart、未ack finding消失、source HEAD mismatchを別残差として両holdingに保持する。候補`MPR-RC-HELIXOS-L2-044-001`は`registered_proposal` / `authority_effect:none`、PO未決。採択はprose-only handover rejectionだけを具体化し、既採択HELIXOS-L2-007のevidence sufficiencyを再定義しない。旧ticket-id-redo/connection auditの同表記`HELIXOS-L2-044`は旧ticket IDの照合値であり、現行requirement identityとは別である。

## 後続限定候補：confirmed175 FR-L1-35 readiness inventory

旧source identity `harness/L1-requirements/functional-requirements.md::FR-L1-35`（archive line 66、file SHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA `7bff35b2a785e51c8eeebeded9e93ac720efd2f9ca8315552e14d8d6ea66be90`）の検証・test・検出基盤3区分一覧をHELIXOS-L2/L11-045未採択候補へ限定mappingした。candidate inputはこの1 atomだけで、coverage receiptのno_lossはmapping範囲に限る。既採択OS-L1-002/OS-L2/L11-016のgeneral cross-project stateは維持し、三分類を既存state定義へ混ぜない。旧HARNESSからOSへのrehome/owner移管、採択、retireは既存のconfirmed175残差判断を未決のまま保持する。PO packetではversion target・対象機構集合・owner方針が未決の間、旧HARNESS source holdingと045候補を保全してsource atomを保持するB（保留）を推奨するが、これはPO選択ではない。AはOSへのowner rehomeを伴う045採択、Cは対象source revision・理由・影響を明示した置換/retireである。BR-06/UX-02 dashboard条件を含めず、別revision `V13-BASE-6FAB-L0638`／`MPR-SH-V13-BASELINE-001`とも同一視しない。source line・候補入力範囲・digestは`docs/governance/audits/requirement-registration/os-fr-l1-35-readiness-source-lines-2026-09-28.jsonl`と`docs/governance/audits/requirement-registration/os-fr-l1-35-readiness-coverage-receipt-2026-09-28.json`。現時点で正式successor・source disposition・採択は未確定。
