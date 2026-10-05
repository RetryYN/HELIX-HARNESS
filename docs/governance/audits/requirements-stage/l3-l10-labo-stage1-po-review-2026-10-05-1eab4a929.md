# HELIX-LABO Stage 1 L3/L10確認資料

対象本文revision: `1eab4a92900ed216d288e0b9faf94b37d212fbb3`。ローカル草稿・独立レビュー前・PO未承認。

対象は採択済み001（観測集積）と011（集積から相関への受渡し）の2親です。許可されたsourceの出典・revision・20項目と実在する7状態を保ち、episode候補から元観測へ往復参照できる条件を具体化しました。発生していない状態は生成せず、正確な過去revisionの記録とcurrent偽装を区別します。一sourceの破損で他sourceを捨てず、source正本やauthorityは元ownerに残します。

候補は20項目の全件照合、状態の忠実保持、元観測への往復参照、source正本への書戻し0、時刻・pathだけによる因果確定0です。各値は固定親の列挙・否定条件を根拠に、欠落・変換・誤結合の変異を測定する設計です。相関algorithm、時間window、保持期間を採択済み仕様として生成していません。

L2の意味・範囲・owner・版を変えていません。Web/WEB-OS接続は1.0必須にせず、単体集積の成功を接続の成功にしません。採択済みCONNECT L2/L11の操作別fixtureを根拠に技術結果を照合し、LABOの元source/correlationへの戻し先を分けています。比較不能の戻し先を新設していません。旧HARNESS dashboardとpillarの旧要件・検証はfailure類型の参照に限り、旧値・schema・runtimeを移しません。

6文書213行、2 FR・4 AC・18機能case・5 NFR候補です。独立business ACは追加していません。実環境測定と独立reviewは未実施です。Claudeのexact HEADレビュー後、その結果を添えて通常のL3承認へ渡します。

静的監査: [l3-l10-labo-stage1-static-validation-2026-10-05-1eab4a929.json](l3-l10-labo-stage1-static-validation-2026-10-05-1eab4a929.json)（SHA-256 `82deb0894115119a9c4f31b3902e98d8dd60d116a381b6f91ad81a17e4ada35c`）。

| 文書 | SHA-256 |
|---|---|
| `docs/helix-labo/L3-requirements/functional-requirements.md` | `3b1a76165ae47cdeafbbe530a5829872236d4d2996fbbb616aa6360a2a6c7ec9` |
| `docs/helix-labo/L3-requirements/business-requirements.md` | `af7c875eb2e43b99f85c092baf7cbb0379ec6b8c5c08c9e01f39f8b72f1192d0` |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | `7f5814109129d2c9d981bb351f9f355081575f2353eafa2015a701856ae01dc0` |
| `docs/helix-labo/L10-verification/functional-verification.md` | `6e06d0cfcb96f9523f3c6eacf594a6a2aa5eed4e23f2bb29233f2ada68ed26fc` |
| `docs/helix-labo/L10-verification/business-verification.md` | `603612c09603d6be3c5b1d45bcbafbe7281457454474acef38d4ddb6e7e13d37` |
| `docs/helix-labo/L10-verification/nfr-verification.md` | `f9617dc7379fde42ab473d2a3f8e7bc966c63f818ac9f13abac04b4255d48ee8` |
