# HARNESS Stage 1 L3/L10修正確認資料（2026-10-05）

本文revision `3c9b1921d0007f13db1395f12eacd800443ca48e`。3採択親010/011/023、6文書235行。修正後独立review前・L3未承認・L10未実行。

能力を交換・更新できるパックとして識別し、画面や作業環境へ依存せず契約で呼び出し、利用条件ごとの依存を判定する案です。依存宣言の不足はパック契約の担当、呼出し固有の不足・版不一致は呼出し担当、権限・安全条件の不明は既存の権限担当へ理由付きで返します。

同じ入力・版の成果物差分0、対象外パックの変更0、同じキーの追加効果0、期限切れの成功0、依存判定の再評価差分0を根拠付き候補として測ります。期限の等号は既存契約を優先し、未定義なら比較案を同じ入力で評価します。依存15条件と、正常・誤り・未見の条件を対のL10で区別します。

固定L2/L11の意味・範囲・担当・版を保持し、旧L3のFR/ACと対検証を起点に再導出しました。旧のCLI・runtime・数値や隣接候補のauthorityは持ち込みません。独立business要件はこの3親では追加しません。

|正本|SHA-256|
|---|---|
|`docs/helix-harness/L3-requirements/functional-requirements.md`|`9222d84eb1176f67ab11640b5ffef3b112f098060828ed0910fc39c9ba30f811`|
|`docs/helix-harness/L3-requirements/business-requirements.md`|`4edda6e444179db716442eaa39bffb8783eb3a8440b87dda5723c54aeb6294f3`|
|`docs/helix-harness/L3-requirements/nfr-grade.md`|`d291fab1f81b8adb76d6cbfbcb0ca274105338b2e6a7fed3c4dbb1443d2f9bd2`|
|`docs/helix-harness/L10-verification/functional-verification.md`|`e8c21613d3d9ed1102fb9b3a3e510c74bcfd967ab6c5fe2f07e7855df1ddde0d`|
|`docs/helix-harness/L10-verification/business-verification.md`|`30942ad3414982c13016e7f196cae20f4a6dbe3e53b4175165f2505fb8be92bb`|
|`docs/helix-harness/L10-verification/nfr-verification.md`|`c04ad3e124cac5f659f0a03ff22eea79a8e7ca8b0998921d037b77185a01f078`|

静的監査は [l3-l10-harness-stage1-static-validation-2026-10-05-3c9b1921d.json](l3-l10-harness-stage1-static-validation-2026-10-05-3c9b1921d.json)。Claude02の10指摘への作成側修正を記録しました。旧FR/AT/FRS候補の意味について独立レビューの未確認範囲を残し、新HEADで再確認を依頼します。POへは独立review結果とこの本文revisionを併せて提示します。以前の本文への判断は継承しません。
