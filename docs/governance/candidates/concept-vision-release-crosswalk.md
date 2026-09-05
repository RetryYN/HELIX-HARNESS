# HELIXのコンセプト・長期ビジョン・提供構成

文書版: 0.1.0。状態: 整理候補。公開版、要件承認、実装完了を表さない。

## 作ったものと、つくる力を育て続ける

HELIXは、要求を整理し、設計・実装・検証をつなぎ、使い始めた後も保守・改修できる開発システムを目指す。
経験は根拠と適用条件を伴って次の仕事へ渡す。利用者が自分のシステムを育て続けられることを中心価値に置く。

本体の構造は、共通基盤を利用する「対象製品を開発する責務」と「HELIX自身を改善する責務」、それらの関係を見渡す全体統制として整理する。
全体統制へ個別の認可・品質検収・公開権限を集約する意味ではない。自己改善も通常の開発・独立検収へ戻す。

Gene・Genome・発現は経験の継承を説明する比喩である。既存Knowledge、Context、Requirement、PLANのIDや意味を置き換えない。
Guardは操作認可、Sandboxは実行範囲の隔離、品質検証は要求充足を担当する。いずれかの成功で他の条件を代用しない。

## 長期ビジョンは公開版と別に持つ

| 能力目標 | 目指すこと | 現在との境界 |
| --- | --- | --- |
| 1.0 | 確定対象の開発・検証・提供・運用を成立させる | 対象要求・consumer・受入範囲の確定が必要 |
| 2.0 | 外部開発情報から根拠付きの推薦を返す | 出典・権利・適用可能性の検証が必要 |
| 3.0 | 許可されたHELIXデータでモデルを調整・評価する | 学習同意・評価分離・モデル選定は未確定 |
| 4.0 | 調整した知能で案件ごとの開発方法を構成する | 既存の動的配車を未来まで延期する意味ではない |
| 5.0 | 共同で確定した仕様から検証付きシステムを納品する | 差分更新・既存データ・納品契約の実証が必要 |

Web、Connector、HDA、FACTORY、MARKETINGとの接続は別案件の長期参照とする。現在の必須実装へ自動追加しない。
本体とサービスは能力・契約の互換性で接続し、同日公開や同一版番号を要求しない。

## 提供候補と既存の所有責務

以下のPKG-IDは入力カタログの文書IDを保存したもの。新しいruntime enum、正式Slice ID、公開製品名ではない。
Module名は既存RLS-R-02/13との名前照合であり、path所有・consumer適格性まで検証した意味ではない。

| 候補 | 利用目的 | 既存Moduleへの対応候補 |
| --- | --- | --- |
| PKG-D01 | 要求形成・要件定義 | helix-requirements |
| PKG-D02 | 構造・UI/UX設計 | helix-design |
| PKG-D03 | 計画・進行・停止再開 | helix-workflow / helix-agent-runtime / helix-context-memory |
| PKG-D04 | Worker実行・候補成果生成 | helix-agent-runtime / helix-context-memory |
| PKG-D05 | 検証・品質保証 | helix-verification |
| PKG-D06 | CI計画・実行最適化 | helix-ci |
| PKG-D07 | 操作認可・隔離・出力境界 | primary Module未確定。安全責務をcoreへ便宜上集約しない |
| PKG-D08 | 親受入・PR・変更統合 | helix-github-ops |
| PKG-D09 | 開発対象製品のRelease | 未確定。HELIX自身の配布工場と同一視しない |
| PKG-D10 | 配備・環境適用 | helix-deployment |
| PKG-D11 | 運用・保守 | helix-operations / helix-maintenance |
| PKG-D12 | 診断・回復 | helix-diagnosis / helix-reverse-recovery |
| PKG-D13 | 意味保存の構造改善 | helix-refactoring |

すべて正式Slice、path allowlist、依存lock、公開版、独立consumer検収は未確定として扱う。
複数Packageが同じModuleのSliceを利用しても、primary ownershipを二重化しない。
Lite/Fullは必要な開発能力を選んだ構成であり、全repo・内部学習・自己公開工場の無条件配布ではない。

## 現行要求との対応と差分

照合基準はmain `0f733a9a034759521ad38ac6b92c8c5a39f7b9a1`。
RLSはconfirmed、FRS v0.2は承認記録を持つが正本昇格前の候補である。この状態差を保存する。

| 提案 | 既存契約 | 取込区分 |
| --- | --- | --- |
| Module所有と構成を分ける | RLS-R-01/03/05、FRS-R-04/06 | 説明整理。現行所有は変更しない |
| 独立versionと内容束縛 | RLS-R-01/05/07/10、FRS-R-05/11/15 | 説明整理。既存versionを推測採番しない |
| Packageを利用者向け選択viewにする | RLSのModule/Bundle、FRSのSliceへ対応 | 要求差分候補。Package公開契約の追加要否を既存ownerで確認 |
| 学習・統治・自己公開工場を外部提供から分離 | RLS-R-03/04/06、FRS-R-19/23/24 | 要求差分候補。growth-off時の通常開発受入をL10へ対応させる必要あり |
| 汎用製品ReleaseとHELIX自己公開の分離 | RLS-R-07/09/13 | 要求差分候補。汎用adapter実装済みとは扱わない |
| 個数・順序の再導出 | FRS-R-19/20 | 承認候補との整合。RLS初期11+4 Module/8+1 Bundleを無言で上書きしない |
| CIとCursorの先行投入 | FRS-R-21/22/23 | 既存進行を維持。長期Visionを一律の待機依存にしない |
| Conceptの比喩・Vision能力目標 | 要求変更や実行許可とは別 | doc-only / future-only |

要求差分は#1073/#1494へ返し、L1/L3/L10の対形成と必要な正本化を通す。#1500には対応結果を管理projectionとして接続する。
本書からRequirement IR、公開manifest、runtimeへ直接新しい意味を投入しない。

## 版管理の読み方

文書revision、能力目標、Module/SliceのSemVer、Bundle構成版、公開Release、artifact digest、Deployment revisionを別軸で記録する。
同一公開実体を指すPackage/Bundleは同じReleaseを参照し、二重台帳を作らない。
公開版を変更するかは公開契約への影響で判定する。説明文だけの更新で全Moduleを一斉に改版しない。

### 既存要求へ戻す差分と受入候補

以下は今回の取込から抽出した対であり、新しい正本IDの採番や承認を意味しない。
既存RLS/FRSの改版ではこの対を移管し、本書と独立した要求台帳を維持しない。

| 差分 | 要求候補 | 受入候補 | 既存責務 |
| --- | --- | --- | --- |
| 利用者向け構成 | Packageは既存Sliceへの選択viewとし、各artifactのprimary Moduleを一意に辿れること | 13候補の全項目を解決または未確定として列挙し、未所属を黙って省略せず、二重ownerを拒否する | #1494 / #1500 |
| 開発と自己改善の分離 | 内部学習・統治・自己公開工場を無効にしても、選択した開発能力と必須安全基盤が動くこと | growth-off構成でclean consumerの最小開発経路を実行し、内部state・credential混入がないことを確認する | #1073 / #1074 |
| 公開対象の分離 | 対象製品のReleaseとHELIX自身のReleaseを別scopeとして扱うこと | 一方のRelease権限・receiptを他方へ転用できず、対象・artifact・rollbackの誤束縛を拒否する | #1494 / 既存Release authority |
| 版の追跡 | 公開Releaseから構成lock・Module/Slice版・source HEAD・artifact digest・検収証拠へ辿れること | 文書v0.6やVision 1.0を公開SemVerへ自動変換せず、同一公開版の内容差を拒否する | #1500 / RLS-R-07/10 |
| 長期目標の隔離 | Visionは対象要求を明示した能力目標とし、未採択の将来能力を現在の必須依存へ追加しないこと | モデル学習・Web等の未採択項目が現在の開発完了を阻害せず、目標達成を文書存在だけで認定しない | Concept / World Governance |

構成の採用は全13候補の実装完了を待つ一括gateではない。独立Sliceごとに必要な依存・安全・検収を閉じて進める。
未確定は候補整理を止める理由ではなく、そのSliceの公開可否と追跡上の残務として扱う。

## 原文と留保

- [原文と取込メモ](../../archive/intake/2026-09-06-concept-vision/00_MASTER_INTAKE.md)
- [Concept原文](../../archive/intake/2026-09-06-concept-vision/concept/HELIX_CONCEPT_v0.1.md)
- [Vision原文](../../archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md)
- [Package原文](../../archive/intake/2026-09-06-concept-vision/current/HELIX_DEVELOPMENT_PACKAGE_CATALOG_v0.6.md)
- [Release/Version原文](../../archive/intake/2026-09-06-concept-vision/current/HELIX_RELEASE_AND_VERSION_CATALOG_v0.6.md)
- [取込状況・不整合一覧](concept-vision-package-intake.md)

原文の `basis/` リンクは本節の実配置リンクで補完する。原文bytes自体は保全する。
原文が言及する別ZIP、roadmap JSON、DECISIONS_v0.6、旧v0.5調査書、evidence付属JSON等は今回の同梱物にはない。
それらの検証完了を主張しない。引用された過去発言や出典の確認記録を、今回の承認や今回の実測として再使用しない。
