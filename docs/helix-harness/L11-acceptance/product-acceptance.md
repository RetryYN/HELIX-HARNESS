---
title: "HARNESS利用要求の受入案"
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
layer: L11
kind: test_design
status: draft
freeze_blocking: true
pair_artifact: docs/helix-harness/L2-requirements/product-requirements.md
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
| HARNESS-L2-007 | 検証対象として選定した複数プロダクトとHELIX自身のプロジェクトについて、要求revision、適用構成、成果、L11受入、L12運用評価へ辿る。単一demo、HARNESS単体test、文書整合だけならVersion 1未完成とし、HELIX-Webの完成有無を判定へ混入させない |
| HARNESS-L2-008 | 指示と要求候補を意味単位で比較し、欠落・意味追加・対象違い・未確定事項を確認できる。Python coreの出力、ログ、Issue、PR、CIだけでは要求合意や操作許可を成立させない |
| HARNESS-L2-009 | unit、connection、compositeの各要求に適用するtemplateと設計義務を確認し、必要input欠落を上流質問へ戻せる。template適用や文書生成だけでは要求合意・設計完成・検証成功を成立させない |

## 工程条件の確認シナリオ

- HARNESS-L2-001：旧L0–L14 pathを持つ成果でも現行6 pairを確認でき、L2の対をL10とする入力を拒否する。
- HARNESS-L2-002：3 styleそれぞれでL1–L3の共通条件とslice開始位置を確認する。Discovery／PoCのS4未判断をproductionへ持ち込まない。
- HARNESS-L2-003：プロト合意欠落と非UI記録欠落を別々に投入し、L2要求を飛ばしてL3凍結可能にならないことを確認する。
- HARNESS-L2-003：実装済み・総合検証済み・利用者受入済み・運用評価済みを区別し、一つの状態から残りを推定しない。
- HARNESS-L2-004：要求変更に対して影響する設計・V-pairが示され、無関係な要求を再承認対象へ巻き込まず、必要な検証を落とさない。
- HARNESS-L2-005：別revisionの証拠やCI成功のみを提示しても利用者受入成立と判定しない。実行基盤を変えても必要な証拠条件を維持する。
- HARNESS-L2-005：required oracleを欠くprofile、unknownをN/Aへ変えたprofile、expected failureと差戻し先を持たないprofileを不成立とする。providerを交換してもrequirement・pair・oracle・evidence identityが維持されることを確認する。

本書はHARNESSの利用者による工程規則の確認である。OS側のWorker・CI・ログ保存の実機能検証とは分ける。

旧資産退役条件はLAR-HARNESS要求の採用revision確定後に評価する。全件未実行。

- 旧path削除や旧test greenだけを与え、要求、behavior、設計、検証、consumer、後継上流IDの欠落を移管済みにしない。
- replacementのpair、oracle、expected failure、利用者受入、差戻し条件の一つを欠かし、退役を不成立にする。
- archive内の旧承認・成功証拠をcurrent authority、検証済み能力、工程完了として採用しない。
- HARNESS-L2-004／005／006：完全一致再利用候補について、同じ製品責務・要求revision・意味・interface・権利・security・consumer・実行境界と
  source／target digest一致を確認する。一条件でも不明な資産をコピー済み・移管済みとして受け入れない。
- HARNESS-L2-004／005／006：完全一致再利用が適格な資産を不要に再実装せず、意味再導出が必要な資産をbyte copyで置換しない。

## 旧HCV4受入条件の移管

総称HELIXの旧L11を再実行せず、工程・提供契約に属するnegative caseを次へ保持する。

| 旧受入ID | 本書の親要求 | 保持する利用結果 |
|---|---|---|
| HCV4-L11-001 | HARNESS-L2-003 | request、approval、decisionと対象revisionを区別し、相談や別revisionから合意を生成しない |
| HCV4-L11-002 | HARNESS-L2-004 | 要求から設計・検証・提供・運用へのtrace欠落を確認できる |
| HCV4-L11-003 | HARNESS-L2-003／HARNESS-L2-005 | 未実行oracle、不一致digest、別HEAD review、projectionだけの完了主張を拒否する |
| HCV4-L11-004 | HARNESS-L2-003／HARNESS-L2-005 | runtime交代後も同じ工程・証拠条件を維持し、不足時は再開不可と説明できる |
| HCV4-L11-005 | HARNESS-L2-006 | 提供範囲、artifact、release、deployment、rollbackの成立を別々に確認する |
| HCV4-L11-006 | HARNESS-L2-003／HARNESS-L2-004 | 改善候補による要求変更を再合意・再検証へ戻す |

これは受入条件の移管案であり、対象別L2の合意、実操作、passを成立させない。

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
- HARNESS-L2-008：同じ意味を異なる表現で指示し、同じ要求identityへ収束できることを確認する。否定、取消、保留、対象製品変更を含む入力で旧候補を自動採用しない。
- HARNESS-L2-008：指示にない制約を追加した出力、指示の一部を落とした出力、別製品の規則を混入した出力を個別に不成立とし、質問・訂正・再抽出へ戻せることを確認する。
- HARNESS-L2-008：同一入力・engine版・製品pack版から決定論的な構造化結果を得る。network、DB、Git、GitHub、repository、credentialを与えずに意味処理できない場合は不成立とする。
- HARNESS-L2-008：機能A、機能B、機能Cの単体要求を成立させても、A→B／B→Cの接続要求とA–Cから成るシステムAの構成体要求が未成立なら全体を成立としない。接続の順序、data意味、timeout、部分失敗、回復とend-to-end acceptanceを個別に確認する。
- HARNESS-L2-008：構成体要求の変更から影響する接続・単体へ、単体interfaceの変更から影響する接続・構成体へ双方向に辿り、無関係な構成を失効させない。
- HARNESS-L2-009：同じunit要求へunit／connection／composite templateを順に与え、unitに非適用なtemplateを理由付きで区別する。接続要求へunit templateだけを適用しても設計義務を満たしたとしない。
- HARNESS-L2-009：templateの必須inputを一つ欠かし、AI補完ではなく質問・要求候補・N/A判断候補へbackflowする。未承認候補、stale版、別product版、該当なしで任意templateへfallbackしない。
- HARNESS-L2-002／003／008／009：同じ親要求と管理制約から推進方式を変えてticket graphを生成し、いずれもHARNESSが要求するlayer／pair、成果物、oracle、human gate、停止・差戻し・backflowを満たすことを確認する。HARNESSが駆動tagや個別workflowを生成する実装は不成立とする。
- HARNESS-L2-002／003：PoC、UI prototype、Feature ticketを別identityで確認し、PoC成功、prototype表示、Issue closeから要求合意・恒久技術採用・Feature完了を生成しない。

管理変更入口の条件は新世代で採用するrevision確定後に評価する。全件未実行。

- HARNESS-L2-003／004：管理観測や改善候補を入力し、意味が変わる最上流への差戻し、再合意、pair再凍結、再検証範囲を確認する。
- Issue作成、Project状態、旧`S0..S4`完了、既存CI成功だけでは製品Forwardの進行条件を満たさない。
- 管理上の緊急性を与えても、V-pair、trace、検証、利用者受入を省略しない。
- 旧DoR／DoD、sprint review、retrospective等のceremony完了を与えても、HARNESSの着手・完了・利用者受入・L12観測を自動成立させない。

限定修復の条件は新世代で採用するrevision確定後に評価する。全件未実行。

- HARNESS-L2-005：修復後も対象要求、必須oracle、expected failure、独立検証、consumer受入、差戻し条件が維持されることを確認する。
- 必須test削除、閾値緩和、scope拡張、意味digest更新、旧CI greenを与えても、適格な修復や検証完了と判定しない。

構造改善条件は新世代L1／L2の採用revision確定後に評価する。全件未実行。

- HARNESS-L2-004／005：意味保存、意味変更、実装故障、外部環境変化を個別に与え、影響する上流・設計・V-pair・再検証・差戻し先を区別する。
- 旧RF0 route、旧scope分類、既存CI成功だけでは構造改善の適格性や工程完了を成立させない。

Worker capacity由来条件は新世代の採用revision確定後に評価する。全件未実行。

- HARNESS-L2-005：作成・検証の担当、対象revision、証拠を変化させ、providerや並列数が同じでも独立性・revision有効性を個別に判定する。
- 固定worker数、PR review、Merge Train、既存CI成功を与えても、独立検証や利用者受入を成立させない。

Security工程条件は対象製品の採用revision確定後に評価する。全件未実行。

- HARNESS-L2-003／004／005：推定finding、再現、独立検証、修復、再検証、運用成立を個別に確認し、一状態から後続を推定しない。
- authority欠落、scope drift、sensitive evidence、自己検証を与え、旧broker／provider／CI greenで工程条件を相殺しない。

利用許諾条件はHARNESSの製品scope・契約・権利が正式承認された後に評価する。全件未実行。

- HARNESS-L2-006：提供artifactから適用許諾版、対象asset、第三者通知、導入・更新・復旧条件へ辿れることを確認する。
- 旧HELIX全体契約、候補文書、PR、CI、配布成功を与えても、HARNESSの契約発効・権利確認・公開承認を成立させない。

AI可読工程契約はAIDOC要求の採用revision確定後に評価する。全件未実行。

- AIDOC-HARNESS-001：異なるruntime／providerに同じHARNESS revisionを与え、layer・pair・artifact・required oracleが一致することを確認する。
- AIDOC-HARNESS-002：生成要約から正本sourceとrevisionへ逆参照し、要約の欠落・staleを検出する。要約自体をauthorityにしない。
- AIDOC-HARNESS-003：未承認、stale、compatibility、historical、unknownを入力し、current実行契約として採用しない。
- Worker inventory、provider session、CI運転、HELIX内部memoryがHARNESS工程契約へ混入した場合は不成立とする。

INV由来条件は新世代で個別採用した要求revisionの確定後に評価する。全件未実行。

- INV ID、P0..P4、投資効果、旧実装の存在だけではHARNESS要求・検証義務・提供機能を成立させない。
- 旧CI、cache、shard、fixture、warm環境の成功を与えても、対応する要求revision・oracle・利用者受入がなければ完了としない。

## 提供構成の受入

FRSと提供構成追補の採用revision確定後に評価する。全件未実行。
旧FRS v0.2の承認、旧Slice／Module／Bundle名、旧channel enum、既存CI結果は採用revisionの代替にしない。

- HARNESS-L2-006（FRS-BR-001／002／003）：選択した構成の収載・除外、機能の証拠、版を確認する。未適格機能の混入と階層間の自動昇格を拒否し、適格な機能単位を未完の上位構成と混同しない。
- HARNESS-L2-004／005（FRS-BR-004／007）：要求と変更箇所から必要検証へ辿り、未所属・二重所有・未検証・unknown影響を個別に識別する。
- HARNESS-L2-006（FRS-BR-005）：同一入力で再生成した提供物を比較し、clean consumerの利用結果と適格な復旧先を確認する。
- HARNESS-L2-005／006（FRS-BR-009）：個別機能が成功しても、組合せの統合・更新・復旧・運用検証が不足すれば全体受入済みとしない。
- HARNESS-L2-006（提供構成追補）：growth-offで対象開発機能を利用でき、未採択Visionや内部学習を必須依存にしない。文書版から公開版を推定せず、提供artifactと原証拠へ辿る。
- HARNESS-L2-006（Concept・Package取込）：旧PKG-D01..13、旧Module対応、Lite／Full、`8+1`を入力しても固定提供構成と判定しない。採用済み機能と明示依存から選択構成を確認する。
