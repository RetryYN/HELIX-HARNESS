---
title: "HARNESS利用要求の受入案"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: test_design
status: draft
freeze_blocking: true
pair_artifact: docs/design/harness/L2-requirements/product-requirements.md
---

# HARNESS利用要求の受入案

全件未実行。合意した要求revision・対象artifact・操作・実結果を記録して判定する。

| 親要求 | 利用者が確認する結果と反例 |
|---|---|
| HARNESS-L2-001 | L1–L12の成果と対を確認し、L2／L11とL3／L10の混同、片側欠落を識別できる |
| HARNESS-L2-002 | 異なる開発styleの工程を確認し、Discovery／PoCをScrumへ混入させない |
| HARNESS-L2-003 | 凍結・差戻し・再開・完了の条件を確認し、未合意・未検証で進行可能と判定しない |
| HARNESS-L2-004 | 要求変更から影響設計・テストへ辿り、変更した条件の検証漏れを識別できる |
| HARNESS-L2-005 | 異なる言語・CI実装でも同じ検証契約を評価でき、特定Worker、旧job集合、CI greenを検証義務の代替にしない |
| HARNESS-L2-006 | 提供版・機能・依存・導入条件を確認し、HELIX内部の運用状態を持たない利用環境で対象機能を利用できる |

## 工程条件の確認シナリオ

- HARNESS-L2-001：旧L0–L14 pathを持つ成果でも現行6 pairを確認でき、L2の対をL10とする入力を拒否する。
- HARNESS-L2-002：3 styleそれぞれでL1–L3の共通条件とslice開始位置を確認する。Discovery／PoCのS4未判断をproductionへ持ち込まない。
- HARNESS-L2-003：プロト合意欠落と非UI記録欠落を別々に投入し、L2要求を飛ばしてL3凍結可能にならないことを確認する。
- HARNESS-L2-003：実装済み・総合検証済み・利用者受入済み・運用評価済みを区別し、一つの状態から残りを推定しない。
- HARNESS-L2-004：要求変更に対して影響する設計・V-pairが示され、無関係な要求を再承認対象へ巻き込まず、必要な検証を落とさない。
- HARNESS-L2-005：別revisionの証拠やCI成功のみを提示しても利用者受入成立と判定しない。実行基盤を変えても必要な証拠条件を維持する。
- HARNESS-L2-005：required oracleを欠くprofile、unknownをN/Aへ変えたprofile、expected failureと差戻し先を持たないprofileを不成立とする。providerを交換してもrequirement・pair・oracle・evidence identityが維持されることを確認する。

本書はHARNESSの利用者による工程規則の確認である。OS側のWorker・CI・ログ保存の実機能検証とは分ける。

## 運用品質工程の受入

NIO由来条件は新世代で採用する要求revisionの確定後に評価する。全件未実行。

- HARNESS-L2-003／004／005：対象製品の品質領域ごとに適用・非適用・unknown・決定ownerを確認し、根拠のないSLO値や保持期間を工程規則から生成しない。
- HARNESS-L2-003／005：designed、implemented、verified、observed、operatedを別々に提示し、文書存在、実装済み、CI成功、別環境の観測で後続状態を代替しない。
- HARNESS-L2-004／005：要求から設計・検証・運用観測・再要求化への接続欠落を検出し、旧graph、旧Issue、既存CIの結果で補完しない。
- HARNESS-L2-005：backupの存在、restore成功、rollback成功、恒久修復、再発防止を別結果として確認する。個別製品の実結果は対応する製品L11／L10／L12で判定する。

旧NIOのL10候補をHARNESS利用者受入へ一括転用せず、L2に対する利用者結果だけを本L11へ接続する。

HARNESS-L2-006：外部利用者の導入条件を確認し、HARNESSの提供版・仕様・必要な依存を辿れることを検証する。
HELIX内部のプロジェクト群や運用記録がないことだけを理由に、HARNESS利用不能とする暗黙依存を認めない。

提供機能を一つ選び、指定版のartifactと明示された依存だけを用いて導入・利用し、期待成果と実結果を記録する。
依存欠落・未対応版・非提供機能の要求では、満たせない条件を説明できることを確認する。
HELIX内部への未記載の接続が必要になった場合は不成立とする。これらの利用者受入は未実行である。

## 要求形成の工程条件の受入

AVS／RFA／DGH由来の条件は採用revision確定後に検証する。全件未実行。

- HARNESS-L2-003：委任範囲内の技術的具体化と範囲外の意味変更を分け、前者への不要な再承認と後者の無承認通過の両方を検出する。
- HARNESS-L2-003／005：指示文だけ、相談だけ、別revisionの承認を入力しても、検証済み・合意済みの条件を満たさない。
- HARNESS-L2-004：変更に対応する要求・対検証だけを再評価し、無関係な有効作業を一律失効させない。
- HARNESS-L2-003／005：根拠欠落、未解決finding、客観品質不合格、人間の未受容を個別に与え、文書リンクや一方の成功で残りの条件を相殺しない。

管理変更入口の条件は新世代で採用するrevision確定後に評価する。全件未実行。

- HARNESS-L2-003／004：管理観測や改善候補を入力し、意味が変わる最上流への差戻し、再合意、pair再凍結、再検証範囲を確認する。
- Issue作成、Project状態、旧`S0..S4`完了、既存CI成功だけでは製品Forwardの進行条件を満たさない。
- 管理上の緊急性を与えても、V-pair、trace、検証、利用者受入を省略しない。
- 旧DoR／DoD、sprint review、retrospective等のceremony完了を与えても、HARNESSの着手・完了・利用者受入・L12観測を自動成立させない。

## 提供構成の受入

FRSと提供構成追補の採用revision確定後に評価する。全件未実行。
旧FRS v0.2の承認、旧Slice／Module／Bundle名、旧channel enum、既存CI結果は採用revisionの代替にしない。

- HARNESS-L2-006（FRS-BR-001／002／003）：選択した構成の収載・除外、機能の証拠、版を確認する。未適格機能の混入と階層間の自動昇格を拒否し、適格な機能単位を未完の上位構成と混同しない。
- HARNESS-L2-004／005（FRS-BR-004／007）：要求と変更箇所から必要検証へ辿り、未所属・二重所有・未検証・unknown影響を個別に識別する。
- HARNESS-L2-006（FRS-BR-005）：同一入力で再生成した提供物を比較し、clean consumerの利用結果と適格な復旧先を確認する。
- HARNESS-L2-005／006（FRS-BR-009）：個別機能が成功しても、組合せの統合・更新・復旧・運用検証が不足すれば全体受入済みとしない。
- HARNESS-L2-006（提供構成追補）：growth-offで対象開発機能を利用でき、未採択Visionや内部学習を必須依存にしない。文書版から公開版を推定せず、提供artifactと原証拠へ辿る。
- HARNESS-L2-006（Concept・Package取込）：旧PKG-D01..13、旧Module対応、Lite／Full、`8+1`を入力しても固定提供構成と判定しない。採用済み機能と明示依存から選択構成を確認する。
