# HELIX-CONNECT L10 業務検証

> **本書の範囲（2026-10-07追記）**：題名にあった「Stage 1」は、本書で最初に起草した節の範囲である。本書には、その後のStageの節（Stage 2a、Stage 4、Stage 5）が追補されている。各節の対象親、対象revision、判断状態は[L3／L10 PO事後確認一覧](../../governance/l3-l10-po-post-confirmation.md)と各判断記録を正とする。冒頭の状態の記述は、最初の節を起草した時点のものとして読む。本追記は範囲の表示だけを直し、要件・検証の意味、ID、承認状態を変えない。

> 状態: 検証設計・未実行。対象はHELIXCONNECT-L2-001〜005。

独立business ACは新設せず、[L3業務要件](../L3-requirements/business-requirements.md)の分類を照合する。[機能検証](functional-verification.md)の各CONNECT-CASE-001-01〜005-01において、登録・技術送受信・再送・traceだけで業務成功、承認、SECURITY許可、保存完了を生成する反例を不合格とする。両端ownerが持つ業務結果はそのownerの受入へ引き渡し、CONNECTが代行しない。


## Stage 2a 追加 — HELIXCONNECT-L2-006のみ

独立business ACは追加しない。`CONNECT-CASE-006-01..05`のいずれのcompatible技術結果、attempt receipt、handoff、rollback/recovery receiptも業務結果・受領承認・業務完了へ昇格しないことを確認する。意味契約差分は両端owner、送信先business resultは受信側business owner、authorityはSECURITYへ戻り、CONNECTが代行しない。failure時も技術停止をbusiness failure routeへ置換しない。


## Stage 4 — 008/009

独立business ACを新設せず、L3業務分類を照合する。008のdescriptorからの許可/実行生成、009のedge記録/伝送からの解決/承認/完了生成および技術eventからの業務解決/要求採択/ticket発行を、機能検証の各個別CASEで拒否する。未実行の検証設計であり業務完了を宣言しない。


## Stage 5 — 007

独立business ACを追加せず、CONNECT-AC-007-04に対する業務成立・結果承認・許可生成の3独立negative CASEを照合する。機能CASE-007-41〜43の送信結果のみ欠落・受信結果のみ欠落・送受信結果不一致は技術的未完/unknownであり、業務成立や承認へ変換しない。全辺の技術完了も元ownerの業務結果/承認へ昇格しない。未実行の検証設計である。
