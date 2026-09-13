---
title: "提供プロダクトHARNESSの利用要求"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: design
status: draft
freeze_blocking: true
created: 2026-09-14
updated: 2026-09-14
pair_artifact: docs/test-design/harness/L11-product-acceptance.md
parent_l1_candidate: docs/design/harness/L1-planning/product-intent.md
---

# 提供プロダクトHARNESSの利用要求

2026-09-14のPO指示に従い、提供するプロダクトをHARNESS、HELIXプロジェクト群の統制をHELIX-OSとして
要求の対象を分離する。本書は既存の混在要求から分離した案であり、個別要求の合意・IR移管は未完了である。
旧`harness/L1-requirements`や`L2-screen`の配置だけを現行採用の根拠にしない。

HARNESSはVモデル等の開発工程を規定する提供プロダクトである。Worker実行、CI運転、ログ保存、学習、
プロジェクト群の管理・統制はHELIX-OS側に置く。

外部利用者へ提供する範囲はHARNESSである。提供物の仕様・版・導入条件を明示し、HELIX内部の
プロジェクト群、Worker割当、学習記録、ログ、CI運用をそのまま利用者の必須構成にしない。
提供範囲と依存条件は明示して管理し、内部運用が存在することだけを暗黙の外部依存にしない。

親は[HARNESS L1企画候補](../L1-planning/product-intent.md)である。現在は親ConceptとL1が未承認のため、
以下のrelationは接続案であり、承認済み導出ではない。

| L2要求 | 親L1候補 |
|---|---|
| HARNESS-L2-001 | HARNESS-L1-001 |
| HARNESS-L2-002 | HARNESS-L1-002 |
| HARNESS-L2-003 | HARNESS-L1-002／HARNESS-L1-006 |
| HARNESS-L2-004 | HARNESS-L1-003／HARNESS-L1-004／HARNESS-L1-006 |
| HARNESS-L2-005 | HARNESS-L1-004 |
| HARNESS-L2-006 | HARNESS-L1-005 |

| ID | HARNESSに対する利用要求 | 主な移管元 | 確認する結果 |
|---|---|---|---|
| HARNESS-L2-001 | 企画・要求・要件・設計・実装・検証をL1–L12と正規V-pairで構成できる | v1.3 §2、HBR-P3 | L2要求とL11受入、L3要件とL10総合検証を混同せず、各層の成果と対が分かる |
| HARNESS-L2-002 | 対象プロダクトに適した開発styleと工程の進め方を選べる | HBR-P0／P1、v1.3 §4 | Full V／Production Scrum／Hybridを区別し、Discovery／PoCを別軸で扱う |
| HARNESS-L2-003 | 工程の開始・凍結・差戻し・再開・完了に必要な条件を確認できる | HBR-P0／P3、HNFR-P3 | 必要な合意、対成果物、検証、未解決事項が明示され、実行成功だけで工程完了にならない |
| HARNESS-L2-004 | 要求から設計・テストへ対応を定義し、変更時の再検証範囲を決められる | HBR-P3／P9 | 上下流traceとV-pairの欠落を識別し、変更した要求が検証から落ちない |
| HARNESS-L2-005 | 言語・tool・実装方式が異なっても、layer・pair・変更種別・riskに応じた検証義務と証拠条件を適用できる | HNFR-P3、v1.3 §4、新世代CI要求候補 | 特定CIやWorkerに依存せず、対象revision、oracle、expected failure、証拠、有効期限、差戻し先を説明できる |
| HARNESS-L2-006 | 外部利用者が、提供範囲・版・必要依存・導入条件を確認してHARNESSを利用できる | 2026-09-14 PO指示、HBR-P6の提供物側条件 | HELIX内部の管理対象や運用記録を持たなくても、明示された構成で提供機能を利用できる |

移管元の本文は[柱要求](../../helix/L1-requirements/pillar-requirements.md)、
[要件v1.3](../../../governance/helix-harness-requirements_v1.3.md)を参照する。
上表は条件群の分離であり、移管元の全条件・数値・追補を置換済みではない。

HARNESS自身の開発にも、その対象としての要求・設計・検証が必要である。HARNESSの実装言語や画面を
利用者のプロダクトへ一律強制しない。[HELIX-OS要求](../../helix-os/L2-requirements/governance-requirements.md)は
HARNESSの工程規則を参照してWorker・CIを動かし、証拠を保存し、プロジェクトの進行を制御する。
「何を満たせば進めるか」の定義と、「実行・記録して進行を制御する」責務を分ける。
HELIX管理下への導入・更新の実行はOSの運用側で扱う。外部利用者が導入・利用できるための提供物の条件はHARNESS-L2-006が所有し、OSの内部運用要求だけで代替しない。

## 工程規則として保持する具体条件

要件v1.3 §2–4の条件を対象別に整理する。以下はHARNESSが規定し、OSが適用する条件である。

| 親要求 | 具体条件 |
|---|---|
| HARNESS-L2-001 | 正規pairはL1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7。L0 charterは層外の上位根拠とし、旧物理pathの層番号を現行pairへ混入させない |
| HARNESS-L2-002 | 全production styleでL1–L3と人間の要件承認を必要とし、L3凍結時にstyleを合意する。Production ScrumはL3後、HybridはL5後にslice化し、Full Vはslice化しない。style選択で品質条件を省略しない |
| HARNESS-L2-002 | Discovery／PoCは仮説・実現性を検証する別軸であり、S4判断前にproduction成果へ昇格しない。Scrumのphaseとして扱わない |
| HARNESS-L2-003 | UI案件は要求とプロトの合意をL3凍結前に確認する。非UIもL2要求を省略せず、非適用・理由・判定者・HEAD・要求への影響・再評価条件を記録する |
| HARNESS-L2-003 | 実装は凍結済み設計の範囲に従い、L6↔L7でRed→Green→Refactorと双方向traceを閉じる。L10総合検証、L11利用者受入、L12運用評価を別の状態として扱う |
| HARNESS-L2-004 | 要求変更・public contract変更・設計trace欠落等の際は、影響する設計と対検証へ差し戻す。Scrumの実装事実もreview・release合流前に設計資産へ戻し、必要なpair凍結を確認する |
| HARNESS-L2-005 | 検証条件には対象要求revision、成果物、入力、oracle、expected failure、実結果、証拠の有効期限、差戻し先を含める。required／conditional／informational／N/Aを理由付きで区別し、unknownをskipへ変換しない。CI成功・画面表示・文書登録だけを利用者受入や全工程完了の証拠にしない |

HARNESSの規則が定める「未充足なら進行不可」を、OSがWorker停止・再割当・CI・記録・表示へ適用する。
具体的なWorker起動方式やCIサービス名はこの工程規則の所有対象にしない。

## 新世代CIへ渡す検証契約

[新世代CI要求候補](../../../governance/candidates/next-generation-ci-requirements.md)の
NCI-HARNESS-001..004をHARNESS-L2-004／005の適用待ち具体化として保持する。HARNESSはCI workflowを所有せず、
layer、V-pair、artifact class、変更種別、riskから検証義務を定義する。profile生成・runner・queue・cache・retry・
provider接続・run監視はHELIX-OSの責務である。

上流意味review、設計検証、実装test、merge admission、利用者受入、release、運用評価を一つの`CI green`へ畳み込まない。
旧CIのjob集合やworkflow名を新契約の分母にせず、承認された上流revisionから必要なoracleを降ろし直す。
本節は要求案であり、既存CIの変更・実行・適格化を行わない。

## 旧資産退役に適用する工程条件

[旧資産退役要求候補](../../../governance/candidates/legacy-asset-retirement-requirements.md)の
LAR-HARNESS-001..003をHARNESS-L2-003／004／005／006の適用待ち具体化として保持する。退役前に旧資産の要求、
behavior、設計、検証、consumerと後継上流IDを照合し、必要なpair、oracle、expected failure、利用者受入、差戻し条件を
確認する。archive資料をcurrent authority・実行可能成果・検証済み能力にせず、旧実装とのparityやdual-greenを要求しない。
本節では旧資産を移動・削除・停止しない。

## 運用品質を落とさない工程条件

[旧NIO候補](../../../governance/candidates/infrastructure-operations-quality-l1-request-candidates.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-operational-quality-source-crosswalk.md)で
HARNESS、HELIX-OS、個別製品へ再分類した。旧Issue owner、既存計測・logging・incident engineの再利用は継承しない。

HARNESS-L2-003／004／005では、対象製品の可用性、信頼性、性能、容量、費用、security、privacy、運用、保守、
回復、observabilityについて、適用・非適用・unknown・決定ownerをL2で確認し、設計・検証・L12観測・再要求化へ
同じ要求revisionで接続する。designed、implemented、verified、observed、operatedを別状態とし、文書・実装・CIの
存在だけで後続状態を成立させない。

HARNESSは品質値、対象環境、RTO／RPO、保持期間、予算、blast radiusを全製品へ固定しない。それらは各製品の
要求とrelease条件で承認する。HELIX-OSによる監視・incident・復旧の実行成功も、製品利用者の受入や運用成立を代替しない。
本節は工程条件の要求案であり、計測、故障注入、CI、復旧、自動修復を実行しない。

## 外部提供の条件

HARNESS-L2-006では、提供機能、構成版、artifact、必要依存、導入・更新条件を対応づける。
利用者が選択した機能を明示された条件で利用でき、非提供機能・未対応条件も確認できることを要求する。
HELIX内部のWorker割当、学習履歴、CI運転、プロジェクト群の状態を、説明のない必須依存として持ち込まない。
提供物が必要とする実行接続は明示し、内部機構の一括同梱を条件にしない。
本要求は外部利用が成立する条件であり、配布先の切替・公開・リリース承認を代替しない。

## 要求形成・合意・反復の工程条件

[AVS候補](../../../governance/candidates/authority-vocabulary-requests.md)、
[RFA候補](../../../governance/candidates/requirement-formation-scoped-admission-requests.md)、
[DGH候補](../../../governance/candidates/design-grounding-human-convergence-requests.md)から工程条件を分離する。
RFAは候補承認済み・正本化待ち、AVS／DGHはdraftであり、本書への記載で採用状態を変更しない。
OS側が判断記録・反復実行を所有し、HARNESS側は以下の進行条件を所有する。

| 親要求 | 出典 | 工程として満たす条件 |
|---|---|---|
| HARNESS-L2-003 | AVS-BR-001／003、RFA-BR-02 | 相談・依頼・採択・要件承認・操作認可を区別してscopeとrevisionを照合する。委任済み意図の技術的具体化は反復承認を必須にせず、未委任の意味・権限変更は別判断を要する |
| HARNESS-L2-003／005 | AVS-BR-004 | 指示の存在を技術的正しさ・review・完了の証拠にせず、独立した技術理由と反証可能な検証で進行条件を満たす |
| HARNESS-L2-004 | RFA-BR-03、DGH-BR-02 | 変更の影響要求・設計・対検証を再確定し、影響しない有効作業を一律失効させない |
| HARNESS-L2-003／005 | RFA-BR-01、DGH-BR-01／03 | 目的・前提・外部実例・既存資産・比較根拠と、受容済みの軸・未解決findingを確認する。客観品質と人間の受容を相殺せず、両者に必要な確認を残す |

これらを別の要求形成engineや承認台帳として実装することは要求しない。人間反応の記録・解釈分離・履歴管理はOS側へ接続する。

## 管理変更を製品Forwardへ戻す条件

[旧Management Scrum policy](../../../governance/management-scrum-product-forward.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-management-change-source-crosswalk.md)で再採否する。
HARNESS-L2-003／004では、管理上の観測や改善判断から製品要求を直接変更せず、意味が変わる最上流の対象層へ
変更候補を戻し、差戻し・再合意・pair再凍結・再検証の必要範囲を決める。

管理上の緊急性、Issue作成、Project状態、既存CI成功を、V-pair、上下trace、検証、利用者受入の省略理由にしない。
管理作業の`S0..S4`、Scrum Reverse、旧adapterをHARNESSの固定workflowとして継承しない。本節は工程条件の要求案であり、
現行AGENTS／CLAUDE、hook、Issue template、workflow、CIを変更・実行しない。
旧Scrum Operation候補のDoR／DoD、sprint review等も固定ceremonyやV-model layerとして採用しない。
着手・完了・受入・改善還流に必要な意味だけをHARNESS-L2-003／005へ再採否し、管理状態の保存と表示はOSへ委ねる。

## 限定修復に適用する検証条件

[旧Bugbot候補](../../../governance/candidates/bugbot-bounded-repair-requests.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-bounded-repair-source-crosswalk.md)で再採否する。
HARNESS-L2-005では、自動・手動を問わず修復後に必要な要求revision、oracle、expected failure、独立検証、
consumer受入、差戻し条件を維持する。必須test削除、閾値緩和、scope拡張、意味digestの無審査更新でgreen化しない。
修復器の登録や旧CI自己修復成功は検証義務・操作許可を代替しない。修復の実行統制はHELIX-OSが所有する。

## 構造改善に適用する変更条件

[旧Refactoring Trigger候補](../../../governance/candidates/refactoring-trigger-admission-requirements.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-refactoring-trigger-source-crosswalk.md)で再採否する。
HARNESS-L2-004／005では、構造改善が要求・public contractの意味を保存するか、影響する上流・設計・V-pair、
必要な再検証、差戻し先を確認する。意味変更、実装故障、外部環境変化を一つのrefactoring routeへ丸めない。
旧候補にはL1利用要求がないため、新世代の利用者価値が確定するまでL3 triggerを採用しない。

## Worker capacityに依存しない検証条件

[旧Three Lane候補](../../../governance/candidates/three-lane-capacity-profile-requests.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-worker-capacity-source-crosswalk.md)で再採否する。
HARNESS-L2-005では、作成側と検証側の独立性、対象revision変更時の再検証、証拠の有効性を、provider名、
固定worker数、PR、Merge Train、既存CIに依存せず定める。登録capacityや並列数を独立検証・受入済み成果の証拠にしない。

## Security要求に適用する工程条件

[旧SEA候補](../../../governance/candidates/security-engagement-authority-requests.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-security-engagement-source-crosswalk.md)で再採否する。
HARNESS-L2-003／004／005では、対象製品が承認した保護対象、data、操作、環境、network、severity、開示条件から、
設計・threat・verification・独立review・利用者受入へ接続する。推定、再現、検証、修復、再検証、運用成立を別状態にし、
旧broker、provider、CI greenで相殺しない。具体的な特権操作・credential管理はHELIX-OSが統制する。

## 利用許諾を確認できる提供条件

[旧Commercial License候補](../../../governance/candidates/helix-commercial-license-requirements.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-license-distribution-source-crosswalk.md)で再採否する。
旧「HELIX全体」の一括商用方針を採用せず、HARNESS-L2-006では外部提供するHARNESSの範囲、artifact、適用許諾版、
第三者通知、導入・更新・復旧条件を利用者が確認できる要求だけを候補として保持する。

有償・評価・SaaS・OEM・再配布、所有権、学習利用、紹介表示等の具体条件は未決であり、正式な事業・法務判断を
本要求案から生成しない。候補merge、CI、配布成功を契約発効にせず、現行LICENSEと過去版の許諾を変更しない。

## AIへ渡す工程契約

[AI可読上流文書の要求候補](../../../governance/candidates/ai-readable-authority-requirements.md)の
AIDOC-HARNESS-001..003をHARNESS-L2-001／003／005の適用待ち具体化として保持する。AIは対象HARNESS版、layer、
V-pair、artifact、required oracle、差戻し・完了条件を承認済みsourceから取得し、生成要約から該当する正本revisionへ
逆参照できなければならない。未承認、stale、compatibility、historical、unknownをcurrent契約と区別する。

HARNESSのAI向け文書へWorker inventory、provider session、CI運転、HELIX内部memoryを混入させない。
現行Core Reads、AGENTS／CLAUDE、promptを新世代のbaselineにせず、物理path、manifest schema、生成器は上流確定後に
L3／L10から導出する。本節では現行AI文書、hook、adapter、runtimeを変更しない。

## 開発投資候補から採る工程意味

[旧INV-001..072](../../../governance/candidates/development-investment-stage-directives-intake_v1.0.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-investment-candidate-crosswalk.md)で全件分類した。
HARNESS-L2-003／004／005／006では、到達可能性、変更影響、検証義務、反例、再資格、提供依存等の工程意味だけを
再採否する。旧P0..P4、既存CI、prepare、cache、shard、fixture、warm環境、test generatorを要求や実装順として採用しない。
INV番号、投資priority、費用削減見込みを、利用者要求・合意・検証済み能力の代替にしない。

## 提供構成と再現性の条件

[FRS v0.2候補](../../../governance/candidates/functional-release-slice-requests.md)からHARNESSの提供物側の条件を分離する。
v0.2候補の承認記録は旧RLS・既存CI・DevOS・Cursorを含む旧製品境界に対するものであり、新世代へ継承しない。
以下は[新世代対応表](../../../governance/audits/l2-requirements/new-generation-release-composition-source-crosswalk.md)で
再採否を待つ意味候補であり、本対象別L2の合意・IR admission・公開を代替しない。

| 親要求 | 出典 | 提供物・工程の条件 |
|---|---|---|
| HARNESS-L2-006 | FRS-BR-001／002／003 | 提供する機能単位のcontract・source・依存・受入・artifact・復旧先へ辿れ、構成の収載・除外を特定できる。未指定・未適格な機能を上位の提供構成へ暗黙収載せず、各構成階層の版と成熟度を区別する。旧Slice／Module／Bundle名とchannel enumは未採択 |
| HARNESS-L2-004／005 | FRS-BR-004／007 | 要求revisionと変更箇所から影響する構成・検証条件へ辿れる。所有・実装・接続・検証の欠落、unknownやambiguousを「影響なし」にしない |
| HARNESS-L2-006 | FRS-BR-005 | 同一source・registry・profileから同一manifestとartifactを再現でき、clean consumerで利用できる。失敗時の復旧対象は適格な直前版または明示replacementとして識別できる |
| HARNESS-L2-005／006 | FRS-BR-009 | 機能単位の必要な安全依存を明示し、組合せの統合・更新・復旧・L12運用検証を個別機能の成功と区別する |

[提供構成追補](../../../governance/candidates/concept-vision-release-crosswalk.md)のPKG-D01..13は、
[新世代Concept・Package対応表](../../../governance/audits/l2-requirements/new-generation-concept-package-source-crosswalk.md)で
再採否を待つ選択viewの候補であり、
正式なModule／Sliceのidentityや公開版を生成する根拠にしない。growth-offでも通常開発が成立すること、
公開版から構成・source・artifact・検収証拠へ辿れること、未採択Visionを必須依存にしないことを候補条件として保持する。
文書版・Visionの節目・公開SemVerは別軸である。内部学習機構をHARNESSへ一括同梱する条件へ戻さない。
構成の再編判断、生成・配布・復旧の実行はOS側が所有する。旧CIの先行利用は新世代では採用せず、
要求整理後に承認済み上流から新しいCI要求・設計・検証を導出する。
PKG-D01..13の名前・個数、旧Module対応、Lite／Full、`8+1`構成をHARNESSの固定提供分母にしない。

## L3候補との境界

AVS／RFA／DGH／FRSの既存L3候補とID範囲は[OS側の接続表](../../helix-os/L2-requirements/governance-requirements.md)を参照する。
これらの文書には工程条件と実行・管理機構が混在している。HARNESS-L2-003／004／005／006の具体化として参照する場合は、
提供する条件・契約とOS内部の実行方法を分け、候補文書全体をHARNESSの実装仕様へ一括採用しない。
対象別L3の全件対応・凍結は未完了であり、リンクの存在を完了証拠にしない。
