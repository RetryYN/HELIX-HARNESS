# HELIX-CONNECT L10 業務検証（Stage 1）

> 状態: 検証設計・未実行。対象はHELIXCONNECT-L2-001〜005。

独立business ACは新設せず、[L3業務要件](../L3-requirements/business-requirements.md)の分類を照合する。[機能検証](functional-verification.md)の各CONNECT-CASE-001-01〜005-01において、登録・技術送受信・再送・traceだけで業務成功、承認、SECURITY許可、保存完了を生成する反例を不合格とする。両端ownerが持つ業務結果はそのownerの受入へ引き渡し、CONNECTが代行しない。


## Stage 2a 追加 — HELIXCONNECT-L2-006のみ

独立business ACは追加しない。`CONNECT-CASE-006-01..05`のいずれのcompatible技術結果、attempt receipt、handoff、rollback/recovery receiptも業務結果・受領承認・業務完了へ昇格しないことを確認する。意味契約差分は両端owner、送信先business resultは受信側business owner、authorityはSECURITYへ戻り、CONNECTが代行しない。failure時も技術停止をbusiness failure routeへ置換しない。
