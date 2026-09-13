---
title: "HELIX-OSのプロジェクト群統制要求"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: design
status: draft
freeze_blocking: true
created: 2026-09-14
updated: 2026-09-14
pair_artifact: docs/test-design/helix-os/L11-governance-acceptance.md
---

# HELIX-OSのプロジェクト群統制要求

2026-09-14のPO指示に基づく対象別の分離案。HELIX-OSは管理・統制、Worker、学習、ログ、CI、継続・復旧の機能を所有する。
HARNESSは提供プロダクトである。名称やフォルダの分離だけで個別要求の合意・実装・受入は成立しない。

HELIX-OSの目的は、HARNESSを含むHELIXプロジェクト群を管理・統制し、運用から学んでHELIXを改善し続けること。
外部へ輸出するプロダクトはHARNESSであり、本要求でHELIX-OSの外販・配布を目的化しない。
HELIXOS-L2-005の改善還流は、観測→候補→採否→要求・設計変更→検証→再観測まで追跡する。
候補の生成件数やログの蓄積だけで改善達成とせず、採用した変更の効果と退行を確認する。

| ID | HELIX-OSに対する利用要求 | 主な移管元 | 確認する結果 |
|---|---|---|---|
| HELIXOS-L2-001 | プロジェクトごとの企画・要求正本・採否・合意revisionと担当責務を確認できる | HCV4-L2-001／002、HBR-P9 | GitHubの状態から要求を推定せず、何に対する要求かと判断の出所が分かる |
| HELIXOS-L2-002 | プロジェクト群の要求から作業・実装・検証・提供・運用まで追跡し、欠落と競合を把握できる | HCV4-L2-002／003、HBR-P3／P9 | 未接続・未合意・未実装・未検証を区別し、部分成功で全体完了にならない |
| HELIXOS-L2-003 | 共通統制と各プロダクトの開発方式の選択を区別し、変更影響を対象範囲へ伝播できる | PO指摘、HCV4-L2-001／004／006、HBR-P0 | あるプロダクトの方式変更が他プロダクトや共通統制を暗黙に変えない |
| HELIXOS-L2-004 | Workerへ作業を割り当てて実行・回収し、優先度・予算・依存・レビュー能力の制約内で進行を統制できる | 常駐レーン・三社レーン要求、HBR-P1／P2 | 実行担当の交代で責務・未完義務・累積制約が失われず、自己承認や二重割当を防ぐ |
| HELIXOS-L2-005 | 観測・失敗・改善候補を、出典と適用範囲を保持して要求へ還流できる | HBR-P4／P7／P8、HCV4-L2-006 | 経験を正本へ勝手に昇格せず、訂正・棄却・保留・失効と影響範囲を確認できる |
| HELIXOS-L2-006 | HARNESSの提供版を新規・既存プロジェクトへ導入し、更新・復旧できる | HBR-P6、柱要求§2.7、v1.3 HR-FR-HYB-008 | source・要求revision・artifactが辿れ、既存成果を壊さず導入できる |
| HELIXOS-L2-007 | Worker・判断・操作・検証のログと証拠を保存し、対象プロジェクトと要求revisionから参照できる | HBR-P7／P9、v1.3 HR-FR-HYB-006 | 欠落・重複・古い証拠を識別し、ログの存在だけで承認・完了にしない |
| HELIXOS-L2-008 | 承認済み上流revisionとHARNESSの検証契約から責務に合うCI profileを組み立て、隔離して実行・監視・回収・再開できる | HBR-P6、v1.3 HR-FR-HYB-010、新世代CI要求候補 | 上流意味reviewと下流CIを分け、未実行・失敗・中断・staleを区別し、旧CI greenで新世代未実行やreview・承認を代替しない |
| HELIXOS-L2-009 | 中断・担当交代・障害後に、許可範囲内で継続・復旧できる | HBR-P1／P2、HNFR-P5／P8 | 累積予算・期限・未完義務を保持し、二重実行や範囲外操作を防ぐ |

移管元は[柱要求](../../helix/L1-requirements/pillar-requirements.md)、
[Concept v4由来整理案](../../helix/L2-requirements/concept-v4-derived-requirements.md)、
[常駐レーン](../../helix/L1-requirements/resident-lane-orchestration-requests.md)、
[三社レーン](../../helix/L1-requirements/three-lane-cloud-governance-requests.md)。
承認済み・未承認・IR移管済みの状態が異なるため、上表への収載を一括採択と扱わない。

[HARNESS要求](../../harness/L2-requirements/product-requirements.md)の具体的な開発能力を重複定義しない。
HELIX-OSはHARNESSが規定する層・pair・工程条件を参照し、Worker・CIの実行結果を証拠として収集して進行を制御する。
OS内に工程規則の別正本を作らず、適用するHARNESS版とプロジェクトの選択を記録する。
HELIX-OS自身の変更も要求・判断・検証へ追跡し、統制する立場を自己承認権限へ拡張しない。

## 管理上の観測と製品変更の入口

[旧Management Scrum policy](../../../governance/management-scrum-product-forward.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-management-change-source-crosswalk.md)に従って
HELIX-OSの管理統制とHARNESSのForward条件へ分ける。旧policyのconfirmed状態、Issue-first、`S0..S4`、Scrum Reverse、
既存adapter／template／test／CIを新世代へ継承しない。

HELIXOS-L2-001／002／003／005／007では、gate漏れ、監査所見、運用上の再発等を対象・出典・revision・影響・
重複・調査・候補・採否・戻し先とともにrepo-owned intakeへ記録する。remote Issue／Projectは必要に応じて同期する
projectionとし、その状態から要求意味・承認・完了を逆生成しない。採択した変更は対象製品の意味が変わる最上流へ戻し、
OSが要求を直接書き換えたり自己承認したりしない。本節ではGitHub、DB、workflow、CIを操作しない。

[旧Scrum Operation候補](../../../governance/candidates/scrum-operation-typed-projection-requirements.md)は、
[新世代管理状態対応表](../../../governance/audits/l2-requirements/new-generation-management-state-projection-crosswalk.md)に従って
再採否する。HELIXOS-L2-002／004／005／007／009では、要求・責務・作業・判断・証拠のauthority identityを参照し、
進行、blocker、待ち、失敗、検証、改善候補等を再構築可能な管理viewへ投影する。Project、Issue、DB、dashboard、roadmapから
要求意味・承認・完了を逆生成せず、missing・unknown・stale・conflict・projection failureを完了へ補完しない。
旧7 operation、旧layer配置、既存DB／roadmap／test／CIは新世代のschema・oracleではない。

## 限定修復の統制条件

[旧Bugbot候補](../../../governance/candidates/bugbot-bounded-repair-requests.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-bounded-repair-source-crosswalk.md)に従って再採否する。
HELIXOS-L2-001／002／004／005／007／009では、逸脱の検出、修復候補、意味判断、操作許可、隔離適用、検収、
停止・復旧を別状態として追跡する。対象revision、actor、write-set、副作用、予算、期限、再試行、影響範囲、復旧先、
独立検証が成立する操作だけを実行対象にし、候補・登録・旧GH-FR-011から包括的write権限を生成しない。

二重実行、session交代による予算reset、循環、stale、所有競合、未信頼実装、範囲外変更、不明な外部副作用を
成功へ補完しない。意味矛盾は上流変更候補へ戻し、要求・設計・検証義務を修復器が変更しない。
本節では旧bugbot、既存CI、旧DB／transaction、自動修復を実行しない。

## 構造改善候補の統制条件

[旧Refactoring Trigger候補](../../../governance/candidates/refactoring-trigger-admission-requirements.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-refactoring-trigger-source-crosswalk.md)に従って再採否する。
HELIXOS-L2-001／002／003／005／007では、観測、finding、改善候補、scope、根拠、意味保存、必要検証、採否、
割当、結果、効果、失効を区別する。未評価、unknown、stale、partial、findingなし、no actionを別状態として保持し、
単一metric、AI評価、file size、Issue数、定期scan、旧CI結果から候補の採択・実行を生成しない。
旧UIL、System Synthesis、RF0..RF6、current 9 scope、既存scanner／CIを新世代へ継承しない。

## Worker capacityの統制条件

[旧Three Lane候補](../../../governance/candidates/three-lane-capacity-profile-requests.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-worker-capacity-source-crosswalk.md)に従って再採否する。
HELIXOS-L2-004／005／007／008／009では、利用可能resource、割当上限、active WIP、実行中、検証待ち、統合待ち、
予算、期限、競合、再作業、停止・縮退を区別する。pool登録数や最大値を稼働・accepted throughputとして表示せず、
下流処理能力と検証独立性を保つ範囲でbackpressureを適用する。

provider、model、account、runner、reviewer数は有期resource profileとして扱い、三社、Codex／Cursor／Claude、
定常3／2、burst 5、8-slotを恒久要求にしない。対象revision変更後は証拠を再評価し、stale reviewを流用しない。
本節ではWorker dispatch、旧三社lane、既存CI、Merge Train、PR／DB projectionを実行しない。

## Security engagementの統制条件

[旧SEA候補](../../../governance/candidates/security-engagement-authority-requests.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-security-engagement-source-crosswalk.md)に従って再採否する。
HELIXOS-L2-001／003／004／005／007／009では、対象製品が承認したtarget、operation、environment、network／data scope、
期限へ操作authorityを束縛し、通常作業と特権Workerのresource・証拠を分ける。authorization不在、scope drift、revoke、
stale、unknownでは新規・実行中操作を停止し、候補文書・Issue・過去承認・provider accessから実行権限を生成しない。

sensitive security dataは対象製品のdata classificationに従い、通常DB、log、memory、Issue、PR、AI context、配布物へ
流出させない。保管・暗号化・retention・disclosure方式は未承認であり、本節ではcredential、network、scan、exploit、
production、external service、旧broker、既存CIを操作しない。

## 利用許諾・配布の統制条件

[旧Commercial License候補](../../../governance/candidates/helix-commercial-license-requirements.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-license-distribution-source-crosswalk.md)に従って再採否する。
HELIXOS-L2-001／002／006／007では、承認済みの製品scope、契約版、対象asset、第三者条件、artifact、release、
配布・更新・復旧結果を対応づける。権利不明、適用版不一致、未発効を識別し、候補文書・PR・CI・配布成功から
契約内容、権利、公開許可を生成しない。

HELIX-OSは内部統制機構として扱い、HARNESSやHELIX-Web等の外部提供条件と一括契約にしない。
具体的な条文・価格・契約・課金・LICENSE変更・repository visibility・公開・配布は本節の対象外である。

## Worker・学習・ログ・CIの具体条件

以下は柱要求と要件v1.3の既存条件をOS側へ具体化したもの。候補固有の拡張や数値上限は、出典の採用状態を
確認して別に移管する。provider名や固定レーン数をOS全体の恒久要件にしない。

| 親要求 | 保持する条件 | 出典 |
|---|---|---|
| HELIXOS-L2-004 | Workerの目的・成果形式・許可範囲・予算・期限を割当に結び、実行・停止・成果回収を追跡する。作成側と検証側を区別し、独立検証不成立を明示する。CLI／IDE／hosted surfaceの差でguardの適用有無を隠さない | HBR-P2、柱要求§2.6 |
| HELIXOS-L2-005 | 検出から改善候補・採否・再検証へ接続する。学習の発火・利用・効果・誤推薦・古い版を計測し、知見の登録だけを有効性の証拠にしない。経験からHARNESS工程規則を直接書き換えない | HBR-P4／P8、v1.3 HR-FR-HYB-007 |
| HELIXOS-L2-007 | 作業・判断・検証の原証拠と出典を保持する。feedbackはintake・classify・ack・pending・resolutionを区別し、未ack findingを消さない。memoryの内容を責務正本へ反映してからretireし、古い指示を再提示しない | HBR-P7／P9、v1.3 HR-FR-HYB-005／006 |
| HELIXOS-L2-008 | 承認済み上流revision、HARNESS版、対象product、変更集合からCI profileを生成し、結果を要求・pair・oracle・HEAD・環境・runner・実行世代へ結ぶ。上流意味review、下流verification、merge、releaseを別pipeline classにする。失敗種別と差戻し先を保持し、検査を弱めてgreenにしない | HBR-P6、v1.3 HR-FR-HYB-010／§6、新世代CI要求候補 |
| HELIXOS-L2-009 | eventをdurableに記録して冪等に投影し、成功後だけcheckpointを公開する。session交代で予算・期限・失敗回数・未完義務を初期化せず、同一作業の二重claimや副作用を防ぐ | HBR-P1、HNFR-P5、柱要求§2.7 |

ログ保存・DB投影は要求の意味正本を代替しない。必要な証拠の種類と工程条件はHARNESSを参照し、
その収集・保全・有効性確認と実行制御をHELIX-OSが担う。

## 新世代CIの再構築条件

[新世代CI要求候補](../../../governance/candidates/next-generation-ci-requirements.md)のNCI-OS-001..007を、
HELIXOS-L2-008の適用待ち具体化として保持する。既存workflow、job、required check、review admissionはlegacy implementationであり、
新世代CIの要求分母や合格oracleにしない。GitHub Actions等は交換可能なprovider adapterとする。

新旧CIはidentity、writer、evidence namespaceを分け、旧CIは実行せずarchive referenceとしてのみ扱う。上流意味review専用laneが整う前に、Concept／L1／L2／L3候補を
旧PR・旧CIへ接続しない。新世代CIの実装は、対象別上流の確定後にL3／L10から再導出し、shadow比較、cutover、rollback、
consumer read-afterを経て旧writerを停止する。shadow実行では新世代だけを要求oracleへ照合し、旧CIとのdual runやparityを求めない。
本節ではworkflow、runtime、gate、設定を変更しない。

## 運用品質の管理・統制条件

[旧NIO候補](../../../governance/candidates/infrastructure-operations-quality-l1-request-candidates.md)は、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-operational-quality-source-crosswalk.md)に従って
再採否する。旧Issue番号をownerにせず、既存measurement、event、logging、alert、incident、lifecycle、Requirement Re-entry
engineの再利用を新世代要件にしない。

HELIXOS-L2-002／005／007では、管理対象の要求revisionから配備・設定・計測・log・通知・incident・backup・restore・
rollback・maintenance・decommission・費用の適用状態と証拠へ辿り、欠測・stale・collector停止をhealthyへ変換しない。
運用観測からの差分は改善候補として出典とscopeを保持し、人間の採否や対象製品の要求を直接書き換えない。

HELIXOS-L2-004／006／009では、通知・担当・ack・期限・復旧操作・中断・再開を追跡し、対象、actor、権限、予算、
影響範囲、復旧先、独立検証が成立する範囲だけを実行対象にする。NIO候補は操作認可や自動修復権限を付与しない。
具体SLO、RTO／RPO、保持期間、対象環境は個別製品・releaseの承認済み要求を参照する。本節では旧機構、CI、
故障注入、production操作、自動修復を実行しない。

## 管理対象としてのHELIX-Web

2026-09-14のPO指示「Vision2のHELIX-WebはHELIX-OSが管理する」を、HELIXOS-L2-001／002／003／005の具体的な対象として保持する。
HARNESSとHELIX-Webはそれぞれ要求正本・合意revision・進行状態を持ち、OSが横断して管理する。
Web固有の利用者体験やサービス要求は[HELIX-Web側](../../helix-web/README.md)へ置く。
Webで適用するHARNESS版と採用能力を追跡し、Webの変更だけを理由にHARNESSの共通規則や他プロダクトの要求を変更しない。
Webでの実践証拠をHELIX改善へ戻す際は、出典・利用可能範囲・採否・変更対象・検証結果を保持する。
管理対象への位置づけは、Webの全機能の採択、開発完了、公開時期の確定を意味しない。

## 有期限通知とmemoryの責務

最新の[HMC利用者要求候補](../../../governance/candidates/harness-memory-coordination-boundary-requests.md)は、
有期限な連絡・受渡し・再開通知への限定を要求する。HELIX-OSの要求案として次の条件を保持する。
HMC候補は人間承認記録済み・独立検収／正本化待ちと宣言されているが、本書でIRやruntimeへ昇格させない。

| 出典 | 対応L2要求 | 利用者が確認できるべき具体条件 |
|---|---|---|
| HMC-BR-001 | HELIXOS-L2-004／009 | runtimeを跨いでassignment、review依頼、handover、heartbeat、確認待ちを有期限な通知として受け渡せる |
| HMC-BR-002 | HELIXOS-L2-001／009 | 通知から各対象の正本を再取得でき、stale pointerやHEAD不一致を把握できる。要求の意味は要求文書・指定JSONへ、実行状態はその状態authorityへ戻る。Issue本文を要求正本として再取得しない |
| HMC-BR-003 | HELIXOS-L2-001／005 | 要求・設計・受入・運用規則・ユーザー嗜好をmemoryの正本へ移さない。長期知識はLearning／Skill authorityへ接続し、参照先を確認できる |
| HMC-BR-004 | HELIXOS-L2-001／007 | 通知中の相談・質問・仮説・叱責・AI解釈から承認・決定・完了を生成しない |
| HMC-BR-005 | HELIXOS-L2-004／009 | 重複配送・再送・消費・期限切れ・訂正・crash後再開を追跡できる。無効記録は監査履歴として参照できてもcurrent guidanceへ再表示されない |
| HMC-BR-006 | HELIXOS-L2-004／009 | provider native memory・session history・user設定が共有通知やauthorityへ暗黙混入しない |

HBR-P7とHIL-BR-03等の旧memory中心要求は、この責務分離に従って要求本文・受入・consumerを同じrevisionへ
移行する対象である。通知本文の削除やmemory件数減少を移行成功の証拠にしない。
要求・知識・作業状態の移管先、原文provenance、再取得可用性、訂正履歴、未移管項目を確認してから置換する。
retention／purge期間と既存記録の削除は本要求案で決定しない。

通知はtyped pointerを運び、各対象の正本へ再取得する。要求の意味はローカル要求文書・指定JSONを参照し、
Issue／PRは対応する作業や統合の記録として参照する。作業管理の現在値を要求の意味や採否へ転用しない。
HMC-BR-004の「作業依頼」も自動的な承認・決定・完了への昇格対象にしない。
HMC-BR-006のprovider設定詳細はProvider Configurationの責務とし、OSの通知機構へ混在させない。
保持・削除期間の数値、authority語彙、JSON key orderingは本移管で新規定義しない。

## 監査・学習・成果の出所に関する候補条件

AAFD、RCLS、PPSの要求候補をHELIX-OSの対象別要求案へ接続する。
AAFDはHELIXOS-L2-005／007、RCLSはHELIXOS-L2-004／005、PPSはHELIXOS-L2-004／007に対応する。
いずれもdraftであり、以下への収載を採択・正本昇格と扱わない。出典は[AAFD](../../../governance/candidates/agentic-audit-future-state-delta-requests.md)、
[RCLS](../../../governance/candidates/responsibility-centric-learning-requests.md)、
[PPS](../../../governance/candidates/producer-provenance-separation-requests.md)である。

| 出典 | 保持する具体条件 |
|---|---|
| AAFD-BR-01 | 監査提案から対象HEAD・authority・producer・証拠・再現手順・反証条件へ辿れる。自由文だけをauthorityにしない |
| AAFD-BR-02 | 内部改善と外部環境変化の出所を保持し、既存UIL／TERからFuture Synthesisへ接続する |
| AAFD-BR-03 | 確定変更で影響する将来投影・前提・指令だけを失効・再合成し、古い投影で割当・公開・廃止を判断しない |
| AAFD-BR-04 | モデル更新を同一corpus・責務scopeで比較し、所見の増減・誤検出・見逃し・再現性・費用・遅延を確認する。更新だけで適格化しない |
| RCLS-BR-001 | 知識・経験の所有を安定したresponsibility_idで追跡し、フォルダやSkill名の変更で失わない |
| RCLS-BR-002 | CASE／SCENE／PATTERN／LOG／VERIFYを責務・事例・revisionへ対応づけ、相関を因果、自己評価を独立検証として扱わない |
| RCLS-BR-003 | 割当には責務・事例・リスク・provider・task class・context budgetに応じた最小packetを使い、全記録を一括投入しない |
| RCLS-BR-004 | project内、独立検証、横断検証、shadow、Mechanismへの段階を区別し、機構化した規則のSkill本文との二重管理を解消する |
| RCLS-BR-005 | 反例・authority変更・provider／model／version・期限・security／licenseを適格性へ反映し、失効・矛盾・取消後の再検証を確認できる |
| RCLS-BR-006 | 学習結果は提案・証拠・検索入力として扱い、要求・設計・merge・Release authorityを直接書き換えない。既存の要求形成・改善機構を重複実装しない |
| PPS-BR-01 | 内容のproducer、commit実行者、PR公開者を別々に確認できる |
| PPS-BR-02 | Git actorの違いだけで独立review成立としない |
| PPS-BR-03 | assignment scopeとcandidate HEADに結びつくprovenance graphから成果の経路を再現できる |
| PPS-BR-04 | 過去の不明producerを推定で承認済みにせず、段階的移行を示す。mixedとunknownを区別し、外部botからHELIX producerを推定しない |

AAFDの提案・差分・将来指令から要求・設計・提供・割当・mergeのauthorityを直接変更しない。
既存UIL／TER／Future Synthesis等への接続であり、新しいroute、開発style、DB正本、常駐レーンを追加しない。
RCLSの最小packetはsceneとartifact classも保持して決定的に構成する。学習の仕組みを既存の要求形成・改善・評価機構と重複実装しない。
PPSは成果生成者、commit実行者、PR公開者、独立reviewerを別identityとして記録する。
双方の寄与と独立reviewが実測されたmixedは正規の受理状態として保持し、unknownへ劣化させない。
Git actor・署名・provider routingの再設計は本移管の対象外である。
独立性の工程基準はHARNESS-L2-005を参照し、OSはproducerの実証拠を保存・照合する。

## 会話継続と外部状態からの再構成

[会話寿命管理の要求候補](../../../governance/candidates/conversation-lifetime-reconstruction-requests.md)の
CLR-BR-001はHELIXOS-L2-009の追加検討入力であり、状態保存はHELIXOS-L2-007、割当継承はHELIXOS-L2-004へ接続する。詳細CLR-R01..08とL10 oracleは未承認候補であり、
L2の合意・L11受入を代替しない。利用者向け条件を次のように保持する。

| 出典 | 利用時に保持・確認する条件 |
|---|---|
| CLR-R01 | 目的・受入・未解決意図・棄却理由・失敗仮説の未保存や不明を識別でき、重要情報が欠ける場合は切替を保留する |
| CLR-R02 | 要求・判断・成果・証拠は既存ownerへ保存し、checkpointから未commit差分・実行中処理・累積予算へ辿れる。未承認意図は承認済み要求にならない |
| CLR-R03 | 保存・再取得・意味と版の対応を確認できた範囲だけを次回入力から外す。会話原本や監査証拠の削除と混同しない |
| CLR-R04 | 継続・compact・新sessionの選択根拠と実provider能力を確認でき、非対応・観測不能を成功扱いしない |
| CLR-R05 | 切替前後で未完義務・担当履歴・予算・期限・retryを引き継ぎ、二重writer・二重副作用を防ぐ。session交代だけで独立review成立としない |
| CLR-R06 | 最小restart packetでも必要情報を黙って切らず、不足時は分割取得または保留する。取消権限や他案件の情報を混入させない |
| CLR-R07 | 同一条件で3方式を比較し、意図保持・品質・見逃し・再試行・再取得・時間・総費用を確認できる。初期context減少だけを成功としない |
| CLR-R08 | shadowから段階的に導入し、生成・保存・受信・利用・検証・運用有効化を別状態で確認する。既存continuation等を重複する第二正本を作らない |

本候補のL11では、利用者が切替前後の目的・受入・未完作業と制約を比較できること、保存失敗や版混在で
作業完了・切替成功と誤表示しないこと、実行中処理を再起動して二重実行しないことを確認する。
L10の障害注入成功だけで利用者合意を取得済みとしない。

詳細は[CLR要件候補](../../../governance/candidates/conversation-lifetime-reconstruction-requirements.md)を参照する。
CLR-R02のcheckpointはrepo・branch・worktree・HEAD、未追跡変更、実行中Worker／CI／外部操作、契約版と失敗回数を含む必要範囲の派生viewとする。
CLR-R04ではhook未発火も観測不能と区別して記録する。CLR-R05の切替はsafe point、保存・再取得、旧writer停止またはhandover、後継の再束縛、再構成確認の順で扱う。
CLR-R06ではsecret、private reasoning、撤回claim、作成側の結論誘導もrestart packetへ混入させない。
CLR-R07は同一task・HEAD・要求・provider／model／設定で隔離比較し、保存・再構成を含む費用とtoken／cacheも記録する。
CLR-R08はshadow、無副作用復元、単一task境界、未commit・未追跡差分・長期実行へ段階を分ける。
Skill、Rule導出、会話寿命は別の要求・受入・完了状態として維持する。

## 要求形成・人間反応の具体化

[AVS](../../../governance/candidates/authority-vocabulary-requests.md)、
[RFA](../../../governance/candidates/requirement-formation-scoped-admission-requests.md)、
[DGH](../../../governance/candidates/design-grounding-human-convergence-requests.md)をHELIXOS-L2-001／002／003／007へ対応づける。
RFAは承認済み・正本化待ちの候補、AVS／DGHはdraft候補として扱い、同じ採用状態に丸めない。

| 出典 | 利用者が確認できるべき具体条件 |
|---|---|
| AVS-BR-001 | 相談・質問・叱責・緊急性だけで人間承認を生成せず、AIが導出した作業候補を人間の発言と区別できる |
| AVS-BR-002 | architectureや責務境界を継続的に拘束する判断はADR等の版付き記録へ辿れる |
| AVS-BR-003 | selection、approval、disposition、一時的技術評価を別identityとして確認できる |
| AVS-BR-004 | 作業指示と技術的正しさ・完了証拠を区別できる。委任scope内の手段選択は根拠付きで進み、指示の逐語実行を理由に検証を省略しない |
| AVS-BR-005 | agent連絡と長期authorityを区別し、通知から正本へ戻れる |
| AVS-BR-006 | drift等からAIが起票した作業を人間指示に偽装せず、実際の開始理由を追跡できる |
| RFA-BR-01 | 目的・前提・選択肢・根拠を比較し、利用者意図との食い違いを確認できる |
| RFA-BR-02 | 委任済み意図の範囲では技術的具体化が反復承認を要求せず進む。未委任の意味・権限変更は区別される |
| RFA-BR-03 | 変更で影響する要求・検証・writerだけを再確定し、無関係な有効作業の継続を確認できる |
| DGH-BR-01 | 外部実例と既存資産を論点ごとに参照し、根拠付きDesign候補を比較できる |
| DGH-BR-02 | 人間の反応とAI解釈を別に確認し、客観品質と主観的な受容を相殺せず影響scopeだけを再作業できる |
| DGH-BR-03 | 反復で受容した軸を保持し、findingの解消・再発・未解決を比較して収束を確認できる |

本L2案の具体化を既存の要求形成機構とは別のRequirement Engineや承認台帳へしない。
未取得の人間反応を補完せず、既存承認の有効なscopeと新たな意味変更を個別に照合する。
候補の完成を、無関係なCI改善・Recovery・限定委譲の待機条件に追加しない。

OSは判断の出典・scope・revisionと反復結果を記録し、下記HARNESSの工程条件を参照して適用する。
AVS-BR-001のdirective候補は実行意図・対象・許可scopeが明示またはtyped assignmentから解決できる場合に限る。
作業依頼を扱えることと、要求承認・恒久decision・完了を自動生成することを分ける。
AVS-BR-006の開始理由には現行workflow分類のsignalを使用し、旧po_directiveはcompatibility input-onlyとする。
RFAの要求形成は企画・前提・調査・限定PoC・プロト・反応・比較を反復し、全件を直列待機gateにしない。
RFA／DGH候補はWeb製品化、独立Research／Approval／Requirement Engine、新DB・scheduler・route、全体planner解放、包括的公開権限を追加しない。
Fullの成立とLiteへの昇格を区別し、利用者報告を原因確定・再現済み不具合へ自動変換しない。

## 提供・再編要求の具体化

[FRS v0.2利用者要求候補](../../../governance/candidates/functional-release-slice-requests.md)の9要求を、
[新世代対応表](../../../governance/audits/l2-requirements/new-generation-release-composition-source-crosswalk.md)に従って
HELIXOS-L2-002／004／005／006の構成・配布運用条件へ再分類する。旧RLS・既存CI・DevOS・Cursorを含むv0.2への
過去承認は新世代へ継承せず、この案からCI、Worker、公開manifest、配布先を変更しない。

| 出典 | L2で保持する具体条件 |
|---|---|
| FRS-BR-001 | behavior contract・source・依存・受入・artifact・rollbackの証拠を機能単位で確認できる |
| FRS-BR-002 | 提供構成へ含む機能と除外する機能をexact setで確認でき、未指定・未適格な機能を暗黙収載しない |
| FRS-BR-003 | 機能単位と上位構成の版・成熟度を別に追跡し、一方の昇格で他方を自動昇格させない。旧Slice／Module／Bundle名とchannel enumは未採択 |
| FRS-BR-004 | 変更pathから影響する所有単位・機能・提供構成と必要な検証へ辿れる。unknown・ambiguousを影響なしに変換しない |
| FRS-BR-005 | 同一source／registry／profileからmanifest・artifactを再現し、clean consumerで検証してqualifiedな直前版または明示replacementへ戻せる |
| FRS-BR-006 | 要求・所有・依存・検証・利用実績を根拠に責務の維持・分割・統合・移管候補を比較できる。未検証の再編はshadowとして区別する |
| FRS-BR-007 | 対象要求revisionごとに実装・検証・owner・提供構成・未成立条件を辿り、未所属・二重所有・未実装・未接続・未検証を区別できる |
| FRS-BR-008 | 新世代では不採用。要求整理中に既存CIを内部利用・比較・効果測定しない。Cursor固有条件は提供構成から外し、Worker要求源として別途再採否する |
| FRS-BR-009 | 各機能単位の安全依存閉包を確認し、構成全体の統合・更新・rollback・運用検証を個別機能の成功とは別に確認する。Lite／Full名は未採択 |

[Concept・Vision提供構成案](../../../governance/candidates/concept-vision-release-crosswalk.md)のPKG-D01..13は
利用者向け選択viewの旧候補である。[新世代対応表](../../../governance/audits/l2-requirements/new-generation-concept-package-source-crosswalk.md)に従い、
工程・提供契約はHARNESS、Worker・CI・配布操作はOS、将来能力は個別製品へ分ける。正式Module／Slice identityや公開版を生成する根拠にしない。
同案のgrowth-offでの通常開発、対象製品ReleaseとHELIX自己Releaseの権限分離、公開版から原証跡への追跡、
未採択Visionの必須依存化禁止は、RLS／FRSへの要求差分として保持する。採用済みとする前に対象revisionの合意が必要である。
PKG-D01..13の名前・個数、旧Module対応、Lite／Full、`8+1`構成、旧CI先行投入をOSの固定管理分母にしない。

提供物として成立する条件はHARNESS-L2-006、変更影響の工程条件はHARNESS-L2-004／005を参照する。
OSはこの条件に従う構成管理・生成・検証・配布・復旧の実行と証拠を所有する。
FRS-BR-003では未完の上位構成内にある適格な機能単位を不必要に隠さない。FRS-BR-004では局所検証と全体critical pathを分けて扱う。
FRS-BR-007のWaveは依存と検収証拠から導出し、説明用の9群・17系統を固定分母にしない。
FRS-BR-008は既存CI先行利用として棄却し、CI要求は上流確定後にNCIから降ろし直す。外部Workerの有界割当は
HELIXOS-L2-004へ別系列で接続し、旧provider・branch・review方式を継承しない。
FRS-BR-009は必要な安全依存が不足する場合に投入を止め、無関係な基盤の完成を一律の待機条件にしない。
提供構成の単位をworkflow、route、provider lane、repository境界の別名にせず、責務所有と選択的収載を区別する。
本移管でrepository分割、別builder・DB・要求正本、配車・全体planner、OPSやsecurity brokerの再実装を要求しない。

## L3候補への接続

対象別L2の具体化先として既存L3候補を参照する。以下は接続先の識別であり、全FRの意味被覆、対象別L3凍結、
候補の正本昇格を完了した証拠ではない。候補のL10をOS利用者のL11受入へ転用しない。

| L2条件群 | 既存L3候補とID範囲 | 接続するOS要求 |
|---|---|---|
| HMC | [HMC要件](../../../governance/candidates/harness-memory-coordination-boundary-requirements.md)：HMC-FR-001..006 | HELIXOS-L2-001／004／005／007／009 |
| AAFD | [AAFD要件](../../../governance/candidates/agentic-audit-future-state-delta-requirements.md)：AAFD-FR-001..004、AAFD-R-01..15 | HELIXOS-L2-005／007 |
| RCLS | [RCLS要件](../../../governance/candidates/responsibility-centric-learning-requirements.md)：RCLS-FR-001..006 | HELIXOS-L2-004／005 |
| PPS | [PPS要件](../../../governance/candidates/producer-provenance-separation-requirements.md)：PPS-R-01..07 | HELIXOS-L2-004／007 |
| CLR | [CLR要件](../../../governance/candidates/conversation-lifetime-reconstruction-requirements.md)：CLR-R01..08 | HELIXOS-L2-004／007／009 |
| AVS | [AVS要件](../../../governance/candidates/authority-vocabulary-requirements.md)：AVS-FR-001..005 | HELIXOS-L2-001／003／007 |
| RFA | [RFA要件](../../../governance/candidates/requirement-formation-scoped-admission-requirements.md)：RFA-RF-01..04、RFA-RC-01..05、RFA-GH-01..03 | HELIXOS-L2-001／002／003／007 |
| DGH | [DGH要件](../../../governance/candidates/design-grounding-human-convergence-requirements.md)：DG-R-01..04、HR-R-01..04、DC-R-01..04 | HELIXOS-L2-001／002／003／007 |
| FRS | [FRS要件](../../../governance/candidates/functional-release-slice-requirements.md)：FRS-FR-001..006、FRS-R-01..24 | HELIXOS-L2-002／004／005／006／008 |

HARNESSの工程・提供条件に関係するRFA／DGH／FRS等は、OSの実行機構だけで条件を再定義しない。
既存候補の親L1参照は履歴として残し、対象別L2への正式接続は候補の改訂・承認範囲と併せて整合させる。

## 要求正本を更新する管理条件

HELIXOS-L2-001／002／007／009を、指定JSONのHIL-BR-26、HIL-FR-51..53、HIL-NFR-30..32と
HR-FR-HIL-19から具体化する。原文は[JSON正本](../../../../requirements-ir/requirements.json)、
[契約](../../../../requirements-ir/system_contracts.json)を参照する。新しいAdmission Engineや要求DBの追加ではない。

| 条件 | 利用者が確認できるべき結果 |
|---|---|
| 変更案の保持 | 未確定の要求変更も原文・理由・対象・変更前revisionとともに保持し、正本化待ちを理由に消失させない |
| 更新範囲の提示 | 変更する要求・契約・受入・検証・下流影響を示し、意味変更と生成projectionの追従を区別する |
| 適用判断 | 適用するpolicy・根拠・scopeから自動適用、修復、必要な人間判断、拒否、競合を区別する。既に許可された変更を同じ理由で再質問しない |
| 原子的な確定 | 要求revision・履歴・trace・下流失効・生成view・DB・receiptの整合を確認できる。部分更新を現行正本として公開しない |
| 競合と再実行 | staleな変更前revisionを拒否し、同じoperationの再試行で二重更新しない。失敗時は元状態または復旧待ちを明示する |
| 旧版からの保護 | 互換Markdown・旧shadow・Issue本文から現行JSONを再生成して最新要求を巻き戻さない |
| 更新経路の実証 | 契約文書やCLI名の存在だけで更新可能と表示せず、正規経路の実行結果・before／after revision・receiptへ辿れる |

現時点でこの更新経路の実証は未取得。[L2凍結境界の是正調査](../../../governance/audits/l2-requirements/l2-freeze-ir-correction.md)では、
既存PLAN用transaction等を要求shard更新の代用にできないことを確認した。利用者要求の文書化と実装完了を分ける。

## Execution Ticketと継続観測

[既存L2候補](../../../governance/candidates/execution-ticket-requests.md)の7要求をOSの対象別要求へ接続する。
候補はproposed_pending_l3_confirmationであり、既存の対文書を移動・再承認したことにはしない。
HXT-RQ-01／04／07はHELIXOS-L2-004、02は007、03／05は005、06は009を具体化する。

| 出典 | OSが保持する利用条件 |
|---|---|
| HXT-RQ-01 | 仕事の意味、実行担当、一回の試行、測定結果を独立させ、再割当後も追跡できる |
| HXT-RQ-02 | 通常開発の成功・失敗・拒否・中断・待ちを継続観測し、成功例だけを集計しない |
| HXT-RQ-03 | 同じモデル・同じ仕事に対するHELIXの効果を、固定条件と公平な採点で検証できる |
| HXT-RQ-04 | 追加実験は限定的に行い、開発レーン・review capacity・費用を圧迫しない |
| HXT-RQ-05 | 劣化・適性・費用の実測を既存の能力評価・配車・Requirement Re-entryへ還流する |
| HXT-RQ-06 | 旧実装から安全に移行し、既存benchmarkと開発を新Ticket完成待ちで循環停止させない |
| HXT-RQ-07 | 人間は意味・予算・危険操作の境界を決め、依存・優先度・WIPによる実行順はHELIXが決める |

通常の仕事から観測receiptまでの到達、欠損検出、replay一致、固定条件比較、予算強制、既存ownerへの還流を確認する。
計測コードやdashboardの存在だけを成功とせず、改善なし・劣化・判定不能も正当な測定結果として保持する。
既存Benchを新Ticket完成待ちにせず、切替scopeを限定する。HARNESSは検証条件を定め、OSは試行・観測・評価・還流を運用する。
