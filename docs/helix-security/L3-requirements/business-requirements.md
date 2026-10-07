# HELIX-SECURITY L3 業務要件

> **本書の範囲（2026-10-07追記）**：題名にあった「Stage 1（19親の候補）」は、本書で最初に起草した節の範囲である。本書には、その後のStageの節（Stage 2c、Stage 3、Stage 4、Stage 5）が追補されている。各節の対象親、対象revision、判断状態は[L3／L10 PO事後確認一覧](../../governance/l3-l10-po-post-confirmation.md)と各判断記録を正とする。冒頭の状態の記述は、最初の節を起草した時点のものとして読む。本追記は範囲の表示だけを直し、要件・検証の意味、ID、承認状態を変えない。

> 状態：この19親のscopeに独立したbusiness identity/ACはない。これは他機構・他Stageへ一般化しない。

固定L2/L11がbusiness meaning、承認、実保存を別ownerに残す境界を保つ。SECURITYは各operationのpolicy/authority判定を返し、OS assignment、CONNECT送達、HARNESS共通pack lifecycle、LABO評価、BRAIN登録、実保存の成功を代行しない。receipt、classification、decision、未見正常判定はbusiness success・approval・保存完了を生成しない。業務ownerが持つmeaning/resultは当該ownerの契約に残す。意味・範囲・owner・版の変更が必要な場合だけ親L2へ戻す。

## Stage 2c（HELIXSECURITY-L2-031）

この親に独立したbusiness identity/ACはない。business上の業務結果は追加runtimeやSECURITYのpolicy判定、assignment、receiptから生成しない。proposalの採択、canonical変更、要求承認、merge/promotionは既存のHARNESS/OSおよび当該業務ownerの契約に残す。SECURITYはoperation policy/authority判定を所有し、OSはassignmentと未完義務、Worker/INFRASTRUCTUREは実行と観測、HARNESSは選択済みoracleによるproposal検証を所有する。Stage 1の19親のbusiness境界をこの個別親へ機械的に一般化しない。独立business ACやownerを新設しない。


## Stage 3の業務意味境界

029、030、032、034、035は独立した新しい業務価値・価格・risk受容owner・保存完了基準を導出しない。runtime採用条件、profile別policy、run cleanup、拡大条件照合の成功を、事業採用・利益・包括許可・OS昇格へ昇格させない。riskの実責務は030の既存ownerへ保つ。機能ACとpaired L10の正常・反例・未評価を業務境界の照合にも用い、他機構全体の業務要件非適用へ一般化しない。

## Stage 4（HELIXSECURITY-L2-021/022/023/024/026）

この5親に独立したbusiness identity/ACはない。receipt・trust判断・SECURITY admission・Guard結果から下流受領のtrust、OS assignment、Worker実行、HARNESS verification、OS promotion、実資源適用やsemantic業務判断を成功として生成しない。各意味と結果はL2が示すCONNECT、LABO/INTELLIGENCE、OS、Worker、HARNESS、INFRASTRUCTUREの既存ownerへ残す。026の1.0 Guard境界からsemantic judgement/Bot runtimeの業務結果を前倒ししない。独立BR/AC/ownerは新設せず、意味・scope・owner・versionの変更が必要な場合だけ固定親L2へ戻す。


## Stage 5 — HELIXSECURITY-L2-027

固定親に独立business outcome/KPI/ACはない。三経路のSECURITY判定とsink受渡しをbusiness成功へ変換しない。SECURITY-AC-027-01〜05とSECURITY-CASE-027-001〜093を対functional文書で照合する。各sink固有の業務意味・保存/評価/登録結果は当該owner契約に残す。
