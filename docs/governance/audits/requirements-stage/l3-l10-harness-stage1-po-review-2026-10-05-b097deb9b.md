# HARNESS Stage 1 L3/L10修正確認資料（2026-10-05）

本文revision `b097deb9b48689717ca513b843658c4034fdbc7f`。3採択親010/011/023、6文書235行。修正後独立review前・L3未承認・L10未実行。

能力を交換・更新できるパックとして識別し、画面や作業環境へ依存せず契約で呼び出し、利用条件ごとの依存を判定する案です。共同所有・宣言外依存・範囲外呼出し・期限切れ・未確定条件を成功にせず、理由と既存の担当へ返します。失敗時の復帰結果と、パックの成功だけで上位版が昇格しないことを検証します。

同じ入力・版の成果物差分0、対象外パックの変更0、同じキーの追加効果0、期限切れの成功0、依存判定の再評価差分0を根拠付き候補として測ります。期限の等号は既存契約を優先し、未定義なら比較案を同じ入力で評価します。依存の15条件と、正常・誤り・未見の条件を対のL10で区別します。

固定L2/L11の意味・範囲・担当・版を保持し、旧L3のFR/ACと対検証を起点に再導出しました。旧の具体的CLI・runtime・数値や隣接候補のauthorityを持ち込みません。独立business要件はこの3親では追加しません。

|正本|SHA-256|
|---|---|
|`docs/helix-harness/L3-requirements/functional-requirements.md`|`97021ee84ef3468564d63a07fb20323673f070cde8c444286b523b02a55579c2`|
|`docs/helix-harness/L3-requirements/business-requirements.md`|`12b3038cfa9826c5d3f659d3219e1fb7b74894b05db1cef8129868450ca6821b`|
|`docs/helix-harness/L3-requirements/nfr-grade.md`|`d291fab1f81b8adb76d6cbfbcb0ca274105338b2e6a7fed3c4dbb1443d2f9bd2`|
|`docs/helix-harness/L10-verification/functional-verification.md`|`78cee484e2121db169b4d945bc713ca6519ad5f0f7b5b24791750212e28ad0ee`|
|`docs/helix-harness/L10-verification/business-verification.md`|`653feda47904685de830f405693e72bf0e70261e801ea8a03b18109a26e1a5aa`|
|`docs/helix-harness/L10-verification/nfr-verification.md`|`c04ad3e124cac5f659f0a03ff22eea79a8e7ca8b0998921d037b77185a01f078`|

静的監査は [l3-l10-harness-stage1-static-validation-2026-10-05-b097deb9b.json](l3-l10-harness-stage1-static-validation-2026-10-05-b097deb9b.json)。Claude01の29指摘への作成側修正は記録済みですが、解消判定は新HEADの独立reviewに渡します。POへは独立review結果とこの本文revisionを併せて提示します。以前の本文への判断は継承しません。
