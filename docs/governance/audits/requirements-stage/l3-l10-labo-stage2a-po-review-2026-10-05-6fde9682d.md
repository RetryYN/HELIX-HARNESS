# HELIX-LABO Stage 2a L3/L10確認資料（2026-10-05）

本文revision `6fde9682d477cde955e1dfdc1ce1b8dcddeeaa8d`。3親055/056/057、6文書、Stage2a追補159行、3 FR・10 AC・36機能CASE。L3未承認・L10未実行。

Worker作業履歴を作業種別とmodel class別に集計し、評価oracleの結果に基づく対応可能性水準、根拠、適用範囲を示す案です。観測・証拠の充足状況と能力水準を分け、初回の結果を観測しただけで評価済みや配置判断へ変えません。結果と受領receiptは同じidentity・版・scopeを保ち、CONNECT契約と同義務を満たす人手receiptの両経路を検証します。

技術候補は必要fieldと結果状態の忠実保持、重複観測0、群別件数の一致です。時間と処理量は母集団と単位を明示して比較し、失敗・欠測・打切りを別記します。能力の尺度、資格基準、一律件数・SLAや新たな配置権限は作りません。

固定L2/L11の意味・範囲・担当・1.0の版を保持し、旧L3要件と検証設計からの再導出・置換を本文へ記録しました。Stage1の未承認草稿は文脈だけです。旧指摘を持ち越し、修正後exact HEADのClaude独立reviewと、それを添えたPOのL3判断が残ります。

|正本|SHA-256|
|---|---|
|`docs/helix-labo/L3-requirements/functional-requirements.md`|`dd79efdc84e2419a63c2ac30d4df10d6b05d1537d6949ddf4340aaf64cedc8ea`|
|`docs/helix-labo/L3-requirements/business-requirements.md`|`36c21708c0b72cfc900697ec85b569f7ec48418d9f42431f4af874f3d7f73912`|
|`docs/helix-labo/L3-requirements/nfr-grade.md`|`78a29ac7bb4f3e0777b9b752d4c3b716510e2a8ac4b0036625535f6443ffbbb4`|
|`docs/helix-labo/L10-verification/functional-verification.md`|`a81a089e77d273450fd5906136384790fadc141402db00f05a9ef748b23a49f0`|
|`docs/helix-labo/L10-verification/business-verification.md`|`9c1406ddb4c26d0445724817053188c6effc35933270289115b0d5d41b0cb9da`|
|`docs/helix-labo/L10-verification/nfr-verification.md`|`4971620056d6443f5471474adfad29c664d77b2a266c992543810b7ba2c0bbbb`|

静的監査：[l3-l10-labo-stage2a-static-validation-2026-10-05-6fde9682d.json](l3-l10-labo-stage2a-static-validation-2026-10-05-6fde9682d.json)。26 source pinをGitの全文・実在行spanから再計算し不一致0。全6文書のStage1 prefix bytes一致、AC/CASE重複・未解決参照0、scf147 fail0/stale0/residuals0、govcheckとdiff-checkは合格。実行・性能実測は行っていません。
