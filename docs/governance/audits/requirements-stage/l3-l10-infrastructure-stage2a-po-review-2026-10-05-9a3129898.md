# INFRASTRUCTURE Stage 2a L3/L10確認資料（2026-10-05）

本文revision `9a3129898f95a1e7a487fa34dadc7bac9be7fb98`。採択親003/004/005/009/010の5件を6正本文書へ対で追補しました。独立review前・PO L3未承認・検証未実行です。

実行環境の資源・容量・稼働状態を、出典と版を付けて観測する案です。復元の成否を手順の設定だけで判断せず、完全性・再接続・起動・検証の証拠を区別します。OSの作業記録と資源変更を結び、読み取り操作と変更操作の条件を分けます。実操作は既存の権限とWorker契約に従います。

候補値は観測間隔の2倍の経過時間、容量の20%余裕、2間隔にまたがる3標本、隔離した小さな成果物の復元5分・3回反復、適用対象の必須観測項目100%です。上流指定値として扱わず、短い比較案や資源費用・誤判定を対のL10で測ります。担当の値が未定でも候補の比較測定を進め、候補だけで操作可否や業務上の終端を決めません。

固定L2/L11の意味・範囲・担当・1.0の版を保持しました。読み取りは対象・範囲・空のwrite-setと対象状態の不変を確認し、無関係な資源の変更を失敗にしません。高度な自動増減・自動切替・後続版の詳細鮮度規則を前倒ししません。旧L3と対検証の項目を起点に、再導出・置換とsource SHAを監査へ記録しています。

| 正本 | SHA-256 |
|---|---|
| `docs/helix-infrastructure/L3-requirements/business-requirements.md` | `5bf1a11da8596bfe770c61d61766b3a144311f8facc28f8988d1d1d431e91f7f` |
| `docs/helix-infrastructure/L3-requirements/functional-requirements.md` | `1d664098e9ad7d44f8488b9105fd31da0bff28f9afcc41f924cfa895cf14d501` |
| `docs/helix-infrastructure/L3-requirements/nfr-grade.md` | `d7b8f75dcbc1c6b722bd250f85fce801fc5ad32315d814037398f7a73834832b` |
| `docs/helix-infrastructure/L10-verification/business-verification.md` | `bdebf4f6e6bce665cbe1f6a187eb9727ffc421f898113cc066bb88f8715778a4` |
| `docs/helix-infrastructure/L10-verification/functional-verification.md` | `40fc8e971d3fe6446b47fdc6404964402eff1929d550a80b610853e4c66153c2` |
| `docs/helix-infrastructure/L10-verification/nfr-verification.md` | `e6e21bcff9741bdac28eb8dd1c952543d3df941ae625a7d343c90c34372f6c7b` |

監査: [l3-l10-infrastructure-stage2a-static-validation-2026-10-05-9a3129898.json](l3-l10-infrastructure-stage2a-static-validation-2026-10-05-9a3129898.json)、SHA-256 `9cc3f466a97ff46f58a731e24f52fbf13030ff084e19acd2e88472249ffb9d25`。41のFR/AC参照・45検証ケース・6非機能候補の対応を静的確認しました。旧C13と未承認Stage1の範囲は解消扱いにしません。独立レビューと通常のPO L3承認は別途このrevisionへ受けます。
