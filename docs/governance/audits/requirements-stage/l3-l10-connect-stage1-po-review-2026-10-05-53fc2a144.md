# CONNECT Stage 1 L3/L10 再レビュー・PO確認資料（2026-10-05）

本文revision `53fc2a1441b890b5bcd904e6d9805453c8c833d1`、採択親001〜005・6文書238行。L3承認未了、L10未実行。独立再レビュー待ち。

接続を登録し、実使用する版の互換性を照合し、契約に束縛した送受信・制御再送・追跡を行う要件案です。登録や参照照合に送信許可を先取りして要求せず、送信操作で既存の適用権限を照合します。技術成功から業務完了を生成しません。

再送上限は接続契約のNを入力して境界を検証します。同じ内容の再到着は追加効果0、stale再照合前は送信0、通常traceへのraw値保存0を比較条件とします。共通SLAは定めず、必要な技術値は根拠付き候補として扱います。要求の意味・範囲・担当・版は変えていません。

ClaudeのMajor3・Minor6に対応しました。比較不能をunknown/stale記録・送信保留に戻し、契約不一致の戻し先と分離。既存trace eventの非改変と訂正追記をAC/CASEへ追加。旧NFRはHELIX projectionのpath・asset・SHA・73行へ統一しました。4 stale契機、登録時/使用時revision、両端operation identity、recovery handoff、期限切れのSECURITY返却、交換/切戻しとdata-use識別子の検証も追加しました。作成側対応は独立reviewの解消判断ではありません。

旧監査と旧source-noteは当時の記録として保持し、現本文へ継承しません。旧source-noteの「比較不能を契約ownerへ戻す」解釈は撤回します。新監査は本文6SHA・13source pin・36current行pinを固定します。旧runtime/CI/testは実行していません。

|正本文書|SHA-256|
|---|---|
|`docs/helix-connect/L10-verification/business-verification.md`|`0ecd6905b16568d54f13ed3ae807eb588be3dfefaa41f9c2e3a6daf372b9e012`|
|`docs/helix-connect/L10-verification/functional-verification.md`|`09f4e572f0c282ac51a914995c744b7b0fcc02d1e424d907a22a23044f61ee4a`|
|`docs/helix-connect/L10-verification/nfr-verification.md`|`796c0644a92d40e6ee18f4dc505737ffe225b5c606db400609bc45ebdef07a3c`|
|`docs/helix-connect/L3-requirements/business-requirements.md`|`7cbbfe2095d182a1e4244255c8dc40d55fe3bc4692a6e62e417d749c677b7087`|
|`docs/helix-connect/L3-requirements/functional-requirements.md`|`f5df086977de2f707b6d9aff8878adff80e6e0acd95d9edee9979a30a3e14e09`|
|`docs/helix-connect/L3-requirements/nfr-grade.md`|`1ca36cdf1fef00f75e24b71fd65ee12d677453dde0d6a67eec2493574275e78b`|

全5親の旧sourceと現行FR/ACの意味対応、静的監査全項目・行pinの独立照合が残ります。POは独立レビュー結果を見て判断するため、承認はまだ求めません。
