# HELIX-OS Stage 2c: support/consult未選択経路の訂正記録

- 本文revision: `e5dca5dd4051358d0725a13ab38cce50a488911c`。対象は `HELIXOS-L2-029` の既存Stage 2c候補です。
- 固定L2/L11 revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2-029:872–873はINTELLIGENCE提案がsupport選択時に必要であり、supportを選ばなくても既存requirement/pair/oracleに基づく作業・検証・記録義務が残ると定めます。
- 修正はsupport選択かつconsult未選択の通常fixtureと、support/consult双方未選択の通常fixtureを分離しました。どちらも実作業、固定oracleの適用、検証結果receipt、必要な独立review/owner receiptを保ちます。OS-028 receiptは実consultを選んだ場合だけ要求します。
- 変更した本文箇所はL3機能要件73, 75, 80行、L10機能検証144, 146, 148, 204行です。新設したのは `CASE-OS-029-07` のみです。FR/AC/CASEのtrace mapにも追加しました。
- 直前のroot follow-up auditとsummaryは編集していません。旧記録と本訂正のSHA、source pins、current line pinsは同名JSON監査に固定しています。

## 六文書SHA-256

- `docs/helix-os/L3-requirements/functional-requirements.md` — `276aa19b54ed27a1dff84972267106b6d47962c6b1414af82abc4cfd8e86d477`
- `docs/helix-os/L3-requirements/business-requirements.md` — `0511d67950ecc9af9540700f9500157ccc4a733c26908a07cdd7c2495a1c3037`
- `docs/helix-os/L3-requirements/nfr-grade.md` — `95d56d864b78382dc91d76b986987bdf51b6e47920502ae00100dcbef9ae03e5`
- `docs/helix-os/L10-verification/functional-verification.md` — `07afaa2f3b7d33905f92e7c843e5543d535b4eb0f996d778fbaec97874637a45`
- `docs/helix-os/L10-verification/business-verification.md` — `371c14bef224730973c94c0815ae0f4a80621e162075584dc51de5a14148a25e`
- `docs/helix-os/L10-verification/nfr-verification.md` — `9595fc9c7415fd59a1a297cc5794846a0e6181b6b04bfc16d41f2cf9644a8b34`

## 静的検証

`scfctl validate`: 147 bindings, fail 0; `stale=0`; `residuals=0`. `govcheck`: 7622 atoms, 57 requirements, 58 files. `git diff --check` passed. 旧runtime、旧CI、Bunは実行していません。

この作成側修正は独立reviewではなく、PO/L3承認も未実施です。
