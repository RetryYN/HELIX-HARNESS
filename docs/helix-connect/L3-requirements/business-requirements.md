# HELIX-CONNECT L3 業務要件

> **本書の範囲（2026-10-07追記）**：題名にあった「Stage 1」は、本書で最初に起草した節の範囲である。本書には、その後のStageの節（Stage 2a、Stage 4、Stage 5）が追補されている。各節の対象親、対象revision、判断状態は[L3／L10 PO事後確認一覧](../../governance/l3-l10-po-post-confirmation.md)と各判断記録を正とする。冒頭の状態の記述は、最初の節を起草した時点のものとして読む。本追記は範囲の表示だけを直し、要件・検証の意味、ID、承認状態を変えない。

> 状態: 未承認草稿。対象はHELIXCONNECT-L2-001〜005の5件。

固定親は登録・互換・送受信・再送・traceの技術契約であり、独立した業務要件identity/ACを導出しない。業務意味・結果・承認・保存実行は両端ownerへ残す。これは今回の5親の分類で、他機構・他Stageへ一般化しない。

技術receiptから業務成功・承認・許可を生成しない境界は[機能要件](functional-requirements.md)と対の[L10機能検証](../L10-verification/functional-verification.md)で確認する。意味・scope・owner・版の変更が必要な場合だけ親L2へ戻す。旧3 sub-doc構造と変更理由は機能要件の旧HELIX対応に記録した。


## Stage 2a 追加 — HELIXCONNECT-L2-006のみ

`HELIXCONNECT-L2-006`はconnection技術互換・片側交換の要求であり、独立したbusiness outcome/ACを追加しない。compatibleな技術送受信、handoff、rollback/recovery receiptから接続先業務結果、業務承認、業務完了を生成しない。意味契約差分は両端owner、接続先の業務結果は当該business owner、許可はSECURITYに残す。L2-006の技術条件と失敗経路は[機能要件](functional-requirements.md#L137)および[L10 case 006-01〜05](../L10-verification/functional-verification.md#L92)で照合する。前段Stage 1本文は変更しない。


## Stage 4 — 008/009

profile catalog/typed descriptorとdirection/order/feedback relationは技術契約であり、独立business criterionを新設しない。供給・技術eventから業務解決・要求採択・ticket発行・許可を生成しない。L3機能AC-008-02および009-03/05とL10個別CASEで境界を確認し、業務意味は元ownerへ残す。


## Stage 5 — 007

007はcompositeの技術通信完全性であり独立business ACを追加しない。業務成立と結果承認は元ownerへ残す。CONNECT-AC-007-04と対応機能CASEで、全辺技術completeからの業務成立・承認・許可生成を拒否する。送信結果のみ/受信結果のみの欠落と送受信結果の不一致（CASE-007-41〜43）は技術traceの未完/unknownとして扱い、業務結果・承認を生成しない。
