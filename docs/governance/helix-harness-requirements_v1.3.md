<!-- HELIX:L3-PROGRESSION-AUTHORITY:v1 -->
> **L3進行authority**: 層・pair・runtime判断は
> `docs/governance/l3-progression-authority-rebaseline-2026-07-19.md`と本書のcurrent contractを
> 同時に満たす。compatibility文書はL3 freeze条件へ使用しない。

# HELIX 要件定義書 v1.3 — L1〜L12・3 development style正本

- **Version**: 1.3.13
- **Status**: document revision confirmed（要件定義 lifecycle は153/153 frozen。JSON正本rootへsnapshot-bound G1/G3 freeze済み。PO再確認 2026-07-18、全harness memory追突 2026-07-19、freeze transaction 2026-07-31。安全capability broker候補はPO確認 2026-08-19により本版へ昇格）
- **設計コア**: `ハイブリッド設計ドキュメントv1-fixed.zip`、`UNIVERSAL-WORKFLOW-REQUIREMENTS-SKILL_v1.1.0.zip`、`HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.1.zip`
- **旧正本**: `helix-harness-requirements_v1.2.md`（L0〜L14部分はcompatibility referenceへ降格）
- **継承**: v1.2のうち、本書と衝突しない安全・証跡・駆動モデル・agent・DB・GitHub要件は継承する。

## 1. 正本決定

HELIXの工程正本は **L1〜L12**であり、`FULL_L1_L12_V`、`PRODUCTION_SCRUM`、
`V_DESIGN_SCRUM_IMPLEMENTATION`を同列のdevelopment styleとして選択する。旧layer体系は既存成果物を
読み取る期限付きcompatibility inputであり、新規PLAN、template、generator、DB canonical projection、
進捗表示、tagの判定入力にしない。

本書とv1.2、concept v3.1、旧process文書が衝突する場合、本書と`docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md`を正とする。

VモデルとProduction Scrumは、目的に応じて選択できる同格のdelivery engineである。Production Scrumを
簡易版・縮退版として扱わず、両engineに同じ品質属性、二主体review、trace、DB追従、release evidenceを要求する。
HybridはL5詳細設計までVモデルで凍結した後に実装をslice化し、Forwardはslice化せずL12まで進む。

## 2. 正規layer

| L | 工程 | V字の対 | 完了条件の核 |
|---|---|---|---|
| L1 | 企画 | L12 運用テスト | 価値、目的、対象、非対象、route判断が確定 |
| L2 | 要求＋画面プロト | L11 受入テスト | 要求とプロトを往復し、合意receiptまたは非UI N/A receiptが存在 |
| L3 | 要件定義・凍結 | L10 総合テスト | FR/NFR/AC、出所、優先度、非目標、test oracleが凍結 |
| L4 | 基本設計 | L9 結合テスト | 外部設計、architecture、境界、依存、接続が確定 |
| L5 | 詳細設計＋先行テスト設計 | L8 単体テスト | 内部設計、契約、edge case、test designが対で凍結 |
| L6 | 実装 | L7 TDD closure | L5契約内のproduct code。scope外機能を追加しない |
| L7 | テスト実装・TDD closure | L6 実装 | Red→Green→Refactor、実装とtestの双方向traceを閉じる |
| L8 | 単体テスト | L5 詳細設計 | 合成/局所データで内部設計を検証 |
| L9 | 結合テスト | L4 基本設計 | 接続、依存、transaction、adapter境界を検証 |
| L10 | 総合テスト | L3 要件 | system全体でFR/NFR/ACを検証 |
| L11 | 受入テスト | L2 要求＋画面プロト | 実利用・実データで要求とUXを検証 |
| L12 | 運用テスト・改善還流 | L1 企画 | 運用時間軸、価値、監視、改善を検証し次cycleへ還流 |

本番releaseはL11受入とL12運用テストの間のmilestoneであり、独立layerを増設しない。

正規V-pairは `L1↔L12`、`L2↔L11`、`L3↔L10`、`L4↔L9`、`L5↔L8`、`L6↔L7` の6組だけである。

## 3. L2画面工程

1. UIが存在する案件は、要求⇔画面プロトの反復と合意receiptなしにL3を凍結してはならない。
2. CLI、library、HARNESS等の非UI案件もL2を暗黙に飛ばしてはならない。`not_applicable`、理由、判定者、対象HEAD、要求への影響、再評価条件をreceiptへ残す。
3. ビジュアルDesign HARNESSはUI/UXの生成・評価を担う。L8〜L10の一般検証基盤と混同しない。

## 4. 開発経路

| development style | 適用条件 | 工程規律 |
|---|---|---|
| `FULL_L1_L12_V` | 本格system、高リスク、複数境界、規制、未知または分類衝突 | L1〜L12を完全実施 |
| `PRODUCTION_SCRUM` | 小規模、継続成長、高feedback、段階release、境界既知 | L3 freeze後に要件単位でslice化し、各sliceの正規L4/L5設計、実装、V-pair evidenceを閉じる |
| `V_DESIGN_SCRUM_IMPLEMENTATION` | 大規模・複雑だが段階releaseが適し、system境界を先に固定できる | L1〜L5を凍結後にL6以降をslice実装し、release candidateごとに全V-pairへ再収束する |

V-model、Production Scrum、V設計＋Scrum実装Hybridは同列の開発スタイルである。
`DISCOVERY_POC`はこれらと同列のstyleではなく、案件の不確実性、仮説、実現性を検証するため
case-by-caseで発動するcase-driven route identityである。DiscoveryとPoCをScrumのphase、
variant、内包要素として扱わない。PoCは`poc` kindで非production検証を実行し、S4決定前に
production Forwardへ昇格しない。

全production styleはL1〜L3とユーザー要件承認を共通必須とし、L3 freeze時にstyleを同時合意する。
L3後のslice化は`PRODUCTION_SCRUM`、L5後のslice化は`V_DESIGN_SCRUM_IMPLEMENTATION`、
slice化なしは`FULL_L1_L12_V`とする。unknown、複合、Scrum不適格は`FULL_L1_L12_V`へfail-closeする。
旧入力名`PRODUCTION_SCRUM_REDUCED_V`は既存artifactの読込互換に限って受理し、新規判断、receipt、DB projection、
表示、出力は`PRODUCTION_SCRUM`へ正規化する。Scrumは文書・品質工程の省略機構ではなく、価値slice単位の反復機構である。
TDD、Reverse、受入条件、migration、rollback、security、release evidence、L12運用を省略しない。

HELIXは個人開発を前提とするため、Scrumのteam ceremony、velocity競争、複数人role分担は必須にしない。backlog、slice、DoR/DoD、review、retro、段階releaseだけを必要粒度で使う。

### 4.1 Scrum ReverseによるVモデル回帰

Production Scrumは各sliceを実装して終わらせない。次のcheckpointで`SCRUM_REVERSE`を発火し、実装・実測・運用事実からL1〜L5の設計資産を逆生成・補正してVモデルへ引き戻す。

- sprint review前
- release candidate合流前
- public contract、DB schema、主要dependency、NFR budgetの変更時
- 設計traceのないcode、test、metric、運用判断を検出した時
- 同種finding再発、性能退行、障害、手動回避を検出した時

`SCRUM_REVERSE`は `SR0 evidence capture → SR1 observed contract → SR2 V-layer mapping → SR3 design/refactor proposal → SR4 pair freeze and Forward reentry` の5段階とする。SR4 receiptなしにsliceをrelease-readyにしない。Reverseが作るのは実装の説明書ではなく、次の変更を拘束できる要求・要件・基本設計・詳細設計・test/verification/measurement contractである。

SR0〜SR4の担い手は進捗値ではなく、`FeatureSlice`／`ReverseDerivation`／`ProvisionalVProjection`／
`CanonicalVPublication`の4 entityと各state machineとする（PLAN-L3-16）。SR4 receiptを持たないsliceは
`CanonicalVPublication`へ遷移できず、`ProvisionalVProjection`はcanonical traceの根拠にならない。
正本FR＝`docs/design/helix/L3-requirements/scrum-reverse-entity-model.md`（SRV-FR-101〜112）、
検証oracle＝`docs/test-design/helix/scrum-reverse-entity-model-acceptance.md`（SRV-AC-101〜112＋遷移fixture 16）。

### 4.2 Scrum Reverseからの改善連鎖

SR3は差分を次へexactly oneでrouteする。

1. 外部契約・要求・AC変更: `REDESIGN`
2. 外部挙動を保つ責務/依存/命名/共通化/外部化/DDD境界改善: `DESIGN_REFACTOR`
3. 設計を保ったalgorithm、allocation、I/O、concurrency、cache等の性能改善: `PERFORMANCE_REFACTOR`
4. state/schema/runtime移行: `RETROFIT`

Design Refactorはsemantic similarity、consumer、oracle、dependency graphで判断し、名称類似だけで統合しない。Performance Refactorは変更前baseline、budget、workload、profile、統計条件、回帰oracleを先に凍結し、測定不能な「高速化」を禁止する。どちらも機能追加と同一episodeへ混載しない。

#### 4.2.1 versioned workflow分類registry

workflow分類の意味authorityは本書だけが持ち、machine-readable mirrorを
`docs/design/helix/L3-requirements/workflow-classification-registry.v1.json`に置く。
current machine projectionは、このregistryから生成する
`config/workflow-classification-catalog.v1.json`だけとする。
`config/drive-route-catalog.json`とそこに残る旧15 route exact setは、移行元を凍結した
compatibility inventoryに限り、current projection、current output、意味authorityとして扱わない。
compatibility inventoryの成功でcurrent projectionの欠落、drift、invalidを相殺してはならない。
catalog、runtimeのenum、CLI引数、DB field、README、labelを意味authorityとして本書へ逆流させない。

分類は次の独立axisを保持し、同じenum、CLI引数、DB fieldへ畳み込まない。

- development style: `FULL_L1_L12_V`、`PRODUCTION_SCRUM`、`V_DESIGN_SCRUM_IMPLEMENTATION`
- case-driven model: `DISCOVERY_POC`
- workflow model: `REVERSE`、`RECOVERY`、`INCIDENT`、`REFACTOR`、`RETROFIT`、`RESEARCH`、
  `ADD_FEATURE`、`VERSION_UP`、`REDESIGN`、`DESIGN_REFACTOR`、`PERFORMANCE_REFACTOR`
- subroute: `SCRUM_REVERSE`。親styleは`PRODUCTION_SCRUM`または
  `V_DESIGN_SCRUM_IMPLEMENTATION`とし、`SCRUM_REVERSE_SR0_SR4` state machineを持つ
- state machine: `DISCOVERY_POC_S0_S4`と`SCRUM_REVERSE_SR0_SR4`
- specialist drive: `BE`、`FE`、`FULLSTACK`、`DB`、`AGENT`
- execution mode: `STANDALONE`、`CLAUDE_ONLY`、`CODEX_ONLY`、`HYBRID`
- specialist workflow: `SCREEN_DESIGN`
- specialist capability: `DESIGN_HARNESS`、`UNIVERSAL_WORKFLOW`、`NFR_MEASUREMENT`

signalはtyped axisとregistry identityへ導出する。影響分類前のsignalはdecisionとして未解決のまま保持し、
推測でroute identityを付与しない。曖昧入力はfail-closeする。旧`mode`／`model`／旧catalog routeは
input-only compatibility adapterで一方向変換し、変換元とwarningをreceiptへ残すが、current output、
DB authority、生成文書、PR契約へ再出力しない。全surfaceを無条件に`catalog_route_id`へ統一せず、
registry version、axis、typed identityを正規契約とする。

#### 4.2.2 execution policy分類境界

workflow identityとexecution policyは別契約とする。確定済みの`target_axis`と`target_id`から、
requirements-ownedなversioned policyを一方向導出し、signal文字列や旧`mode`からcommandを直接選ばない。
policyは登録済み`command_id`、`action_stage`、`preflight_policy`、`approval_policy`、
`execution_form`、限定enumの適用条件を独立fieldとして保持する。raw shell、approval boolean、
自由式の条件、旧`mode`／`model`／`catalog_route_id`／`route_class`をcurrent policyへ入れない。

同一identityに複数policyが適用される場合は明示`precedence`を要求する。同一条件・同一precedenceの
重複、複数条件match、未登録command、binding欠落は近似値を選ばずfail-closeする。production impact、
destructive data operation、credential accessのいずれかを含むactionを`approval_policy: none`へ縮退させない。

旧実行構成は次のtyped fieldへ隔離し、workflow identityへ昇格させない。

- pair-agent TDDは`execution_form: pair_cell`であり、development style、workflow model、subrouteではない。
- 旧`design-bottomup`は`SCREEN_DESIGN` specialist workflowへbackend-derived trigger／方向条件を与える
  compatibility inputである。同名workflow modelを新設しない。
- 旧`operation_verification`／`verification`はL7〜L12 right-arm verification scopeとL12運用テストを
  指すcompatibility inputである。同名workflow modelを新設せず、必要なNFR計測は
  `NFR_MEASUREMENT` capabilityへ接続する。
- development styleはL3 freeze時の明示選択であり、signalから`PRODUCTION_SCRUM`等を自動確定しない。

execution policyの実体、command registry、generated projection、consumer移行は本分類境界を満たす
後続versionで追加する。未実装identityへのexecution要求はpolicyを推測せずunsupportedとしてfail-closeする。

初期execution policy registryは、実在するread-only／planning commandだけを登録する。bindingは
`ADD_FEATURE + pair_cell`、`RECOVERY`、`INCIDENT`、`RETROFIT`の検証・計画surfaceから開始し、
未登録identityを近似commandへ送らない。全bindingは4条件
`production_impact`／`destructive_data_operation`／`credential_access`／`backend_derived`を
明示booleanで受け、条件組合せが未登録ならfail-closeする。いずれかの高影響条件がtrueのbindingは
`approval_policy: action_binding`を必須とする。command registryは`program`と固定`argv`のtoken列を持ち、
shell operator、command substitution、absolute executable pathを拒否する。

#### 4.2.3 current routing consumer契約

current routing consumerは、観測`signal`を4.2.1のtyped classificationへ変換した後にだけ、4.2.2の
generated execution policyを解決する。入力は`signal`、`execution_form`、および
`production_impact`／`destructive_data_operation`／`credential_access`／`backend_derived`のexact
boolean setとする。signalから条件、development style、execution formを推測しない。

出力receiptはclassification registry version、policy registry version、requirements／classification
registry／policy registryのsource digest、`target_axis`、`target_id`、`binding_id`、`command_id`、
`action_stage`、`preflight_policy`、`approval_policy`、`execution_form`だけをcurrent identity／policyとして
返す。登録済みcommandの`program`／`argv`は実行境界内部でcommand IDを再検証するために使い、routing
receiptへraw invocationとして出力しない。旧`mode`／`model`／`catalog_route_id`／`route_class`／旧route
名をcurrent JSON、text、DB projectionへ再出力しない。

dispositionは`resolved`、`classification_unknown`、`classification_decision_required`、
`classification_ambiguous`、`policy_unsupported`、`policy_ambiguous`、`approval_required`のexact setとする。
dispositionとprocess exitは次のexact mappingとし、consumerが名称類似でexit classを推測してはならない。

| 処理結果 | 終了区分 | 終了コード |
|---|---|---:|
| `resolved` | `success` | 0 |
| `classification_ambiguous` | `blocked` | 1 |
| `policy_ambiguous` | `blocked` | 1 |
| `approval_required` | `blocked` | 1 |
| `classification_unknown` | `unresolved` | 2 |
| `classification_decision_required` | `unresolved` | 2 |
| `policy_unsupported` | `unresolved` | 2 |

`approval_policy: action_binding`は承認receiptが同一HEAD・同一policy digestへ束縛されるまで
command実行を許さず`approval_required`でfail-closeする。legacy入力は後続input-only adapterで一方向変換し、
current consumer自体は受理しない。

#### 4.2.4 legacy分類input-only adapter契約

旧`mode`／`model`はcompatibility inputとしてだけ受理し、versioned workflow分類registryに定義した
exact contractから一方向変換する。実装内の独自表、名称類似、旧15-route inventoryから変換先を推測しない。
変換可能なtokenとcurrent typed identityは次のexact setとする。tokenはtrim、小文字化、`_`から`-`への
正規化後に照合する。

| legacy token | `target_axis` | `target_id` |
|---|---|---|
| `discovery` | `case_driven_model` | `DISCOVERY_POC` |
| `reverse` | `workflow_model` | `REVERSE` |
| `recovery` | `workflow_model` | `RECOVERY` |
| `incident` | `workflow_model` | `INCIDENT` |
| `refactor` | `workflow_model` | `REFACTOR` |
| `retrofit` | `workflow_model` | `RETROFIT` |
| `research` | `workflow_model` | `RESEARCH` |
| `add-feature` | `workflow_model` | `ADD_FEATURE` |
| `version-up` | `workflow_model` | `VERSION_UP` |

`forward`、`scrum`、`design-bottomup`、`verification`は複数axis、条件、scopeを畳み込んだ曖昧入力なので、
推測せず`ambiguous`／exit 1でfail-closeする。exact set外は`unsupported`／exit 1とし、Forward等へ
fallbackしない。変換成功だけを`converted`／exit 0とする。

registryは各変換先がcurrent entityに存在し、宣言axisと一致すること、変換tokenと曖昧tokenが重複しない
ことを検証する。receiptには入力field、正規化token、deprecation warningを残すが、旧`mode`／`model`を
current fieldとして再出力せず、generated catalog、current DB projection、PR契約へlegacy identityを
投影しない。registry契約が欠損・不整合ならadapter自体をfail-closeし、実装内fallbackを使わない。

### 4.3 検証・計測基盤

設計エンジンはtest caseだけでなく、system完成度を実証する`verification_measurement_contract`を各requirement/NFRから生成する。最低限、性能、信頼性、可用性、回復性、security、privacy、accessibility、互換性、運用性、保守性、cost/resource、data quality、observabilityを対象にする。

各contractはmetric ID、対象requirement/NFR、測定対象、workload/environment/data、baseline、target/SLO、許容差、sampling/window、tool/probe、evidence schema、判定oracle、owner、実行layer、再測定triggerを持つ。code/doc/testがgreenでも必須metricが未測定、stale、非代表環境、閾値未達ならsystem completionを拒否する。

計測はL5で設計し、L7でprobe/fixtureを実装、L8〜L10で局所からsystemへ拡張、L11で利用実態、L12で時間軸/SLO/改善効果を検証する。計測のために本番secret/PIIを露出せず、測定自体のoverheadと再現性も記録する。

### 4.4 Universal Workflow AI判断エンジン

`UNIVERSAL-WORKFLOW-REQUIREMENTS-SKILL_v1.1.0.zip`を、自然言語の業務を要求へ翻訳し、実行時の候補選択を提案するAI判断エンジンのsource packageとして採用する。source SHA-256は`b6fd08f5054930dde8379969bf9a84cb21270d1b7bac8e87be3bc243ad425d26`へ固定し、詳細な採否とhardeningは`docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md`を正とする。

判断の正規形は`current_state × trigger × condition → candidate actions/routes/resources → proposed decision → next_state`とする。AIは業務事実、候補、根拠、confidence、unresolved item、反証可能なoracleを提案できるが、要求の確定、権限付与、high-impact action、正本state更新、gate passを自己承認しない。Node transaction境界がschema、authority、policy、HEAD、evidence digestを再検証して初めてcommitする。

Full Vではsystem全体のworkflow modelをL1〜L5で段階的に凍結し、右腕で全transition、loop、terminal、exception、permission、timeout、notification、audit、data、switching、routing、resource allocationを検証する。Production Scrumではslice deltaだけを先行利用できるが、sprint reviewまたはrelease合流前にScrum Reverseでsystem workflowとL1〜L5設計資産へbackfillし、SR4 pair-freezeなしにrelease-readyとしない。

L1ではtarget、actor、価値、正常/取消/失敗/期限切れterminalを定義する。L2では要求と操作可能prototypeをworkflow state/transitionへ接続し、画面、API、DBを状態遷移より先に独立確定しない。L3ではworkflowからFR、NFR、AC、test scenario、unresolved itemを生成してfreezeする。L4ではscreen/API/data/permission/notification/auditと外部境界を派生する。L5ではversioned schema、loop/exception、switching/routing/allocation、fallback/dead-letter、test/measurement contractを先行凍結する。L6〜L7で実装/TDD、L8〜L10で局所・接続・system判断、L11で利用者受入、L12でSLO、配分効果、誤判断率、drift、改善還流を検証する。

ZIP原文の`workflow-model.schema.json`と`derived-requirements.schema.json`は採用sourceであって、そのままHELIX正本schemaにはしない。5出力を包むenvelope schema、runtime orchestration schema、authority/decision/evidence/measurement fieldを追加する。runtime orchestration exampleがworkflow schema単体へ適合しない既知gapをgreenにせず、schema分離またはversioned compositionをL5で確定する。

### 4.5 AI Vision Design HARNESSエンジン

`HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.1.zip`のDesign HARNESSを、利用者の価値・体験意図を画面表現とfrontend実装へ連続させる **AI Vision Design HARNESSエンジン** の意味sourceとして採用する。正本sourceは再監査済みpackage SHA-256 `1e14a8576715f5a249f270fb5472e02023400526e00866baa709befe9edb48fd`（211 physical files）へ固定し、詳細な採否とhardeningは`docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md`を正とする。

エンジンはExperience Contract（誰が何をなぜ達成するか）、UI Contract（情報、状態、操作、responsive、motion、accessibility）、Frontend Contract（data、state owner、event、permission、logging、error）を、`screen_id / region_id / slot_id / action_id / state_id / binding_id`で連続させる。描画ツール、独立V-model layer、別文書体系、一般検証基盤ではない。

Full VではL1のproduct visionからL12の運用UX改善まで全UI workstreamを閉じる。Production ScrumではUI sliceを反復できるが、review／release合流前にScrum Reverseでprototype agreement、screen ledger、UI profile、frontend binding、mission/oracle、UX evidence、変更deltaをL1〜L5へbackfillし、SR4 pair-freezeを必須とする。非UI案件はL2 N/A receiptを維持する。

Discovery PoCはS0〜S4でvision/prototype仮説を探索できるが、S4の人間判断前に`implemented`、`ux_verified`、production-readyを主張しない。採用する仮説は`FULL_L1_L12_V`、`PRODUCTION_SCRUM`、または`V_DESIGN_SCRUM_IMPLEMENTATION`へ昇格して正規V-pairを閉じる。

AIはprototype、profile、ledger、binding、component role、UX evidence、deltaと改善候補を生成・比較・検査できる。ただしproduct vision、brand、体験上の優先順位、L2 prototype agreement、L3要求凍結、L11利用者受入、L12改善採否を自己承認しない。`implemented`はL6↔L7 receipt、`ux_verified`はL10〜L12のreal-data evidenceと人間評価から別々に導出し、画面数、route数、placeholder、generic table、screenshot単体を完成証拠にしない。

ZIP原文のL0〜L14配置は本書のL1〜L12へexact mappingし、旧L6 missionはL5 test contract、旧L7 implementationはL6↔L7へ再配置する。Design HARNESSの意味判定はADR-010に従いPython意味コアを恒久正本とし、Nodeへ複製しない。Nodeはschema、authority、policy、HEAD、digestを再検証して`harness.db`／Git／GitHubへcommitする唯一のtransaction境界である。既存Python path名は実装authorityにせず、UT CLI/state/DB/PLAN/roleとBun前提は採用しない。

### 4.6 ハイブリッド制御面のReverse backfill

既存runtime／CLI／gateが要件IDなしで先行していた機能を、次の正規要件へbackfillする。実装が存在することだけを要件充足の証拠にせず、各IDをL3設計、test oracle、runtime evidenceへ接続する。

| 要件ID | 機能要件 | 受入条件 |
|---|---|---|
| `HR-FR-HYB-001` | closure authorityはauthority registry、typed review receipt、evidence digest、convergence epoch、CAS、atomic rollback、terminal boundaryを管理する。`close_ready`はreview-bundle digest一致、対象test/gate green、`closure apply --dry-run`成功時だけ自走承認できる | `HR-AC-HYB-001`: 不可逆対象、実成果未完了、digest/HEAD driftをauto-approveせず、generic test evidenceだけでclosureしない |
| `HR-FR-HYB-002` | MCP profile catalogはprofile列挙、設定、safety、read-only probeを型付きで提供し、credential、egress、tool capabilityをprofile単位でfail-closeする | `HR-AC-HYB-002`: 未登録profile、secret要求、write可能probeを拒否する |
| `HR-FR-HYB-003` | Discovery／PoCをScrum非内包のcase-driven modelとして`S0 hypothesis → S1 experiment plan → S2 poc → S3 verify → S4 decide`で実行し、S4人間判断後だけV-model、Production Scrum、またはV設計＋Scrum実装Hybridへ接続する | `HR-AC-HYB-003`: S4 receiptなしのproduction claim、Discovery／PoCのScrum内包、`decideDiscoveryS4`／`routeScrumFullback`迂回を拒否する |
| `HR-FR-HYB-004` | hybrid git laneはforeign worktree、stage、commit、HEAD、one-shot overrideを識別し、`lane status`、work-guard、git-command-guard、`guard_override_transactions`へ同一episodeを記録する | `HR-AC-HYB-004`: foreign hunk混載、未記録override、destructive gitを拒否する |
| `HR-FR-HYB-005` | memory v2はwrite/list/surfaceに加え、expiry、takeover、one-shot deliver/consume、長期層のfenced/idempotent retire、compaction fenceを持つ。active harness/project memoryは正本へ追突後にbody-free receiptへretireし、stale instructionを再提示しない | `HR-AC-HYB-005`: retire前の未反映memory、二重deliver、期限切れtakeover、lost update、terminal receiptのactive再表示を拒否する |
| `HR-FR-HYB-006` | feedback lifecycleはintake、classify、ack、pending、reverse-candidate、resolution、SessionStart surfaceをevent/projectionで管理する | `HR-AC-HYB-006`: 未ack findingの消失、prose handoverだけの解決、source HEAD不一致を拒否する |
| `HR-FR-HYB-007` | skill engineは登録だけでなくtask/drive/layerから推薦し、firing、acceptance、効果、誤推薦、stale versionを計測して改善へ戻す | `HR-AC-HYB-007`: 根拠なし推薦、未計測の有効性主張、旧versionのsilent利用を拒否する |
| `HR-FR-HYB-008` | distributionはdevelopment正本からHELIX-HARNESS-DevOSへ自己適用を除いたmulti-project packageを生成し、plan／sync／package／publish、source／requirements／artifact digest、license、consumer verification、段階promotion、rollback／monitoring evidenceを接続する。旧HELIX-HARNESS-OS identityはcompatibility inputに限り、current outputへ再投影しない。詳細は§4.6.1を正本とする | `HR-AC-HYB-008`: §4.6.1のexact setとconsumer smokeを満たさないartifact、旧identityのcurrent再出力を拒否し、publish、tag、promotion、配布先切替、PLAN-M-02 cutoverはaction-binding approvalなしに実行しない |
| `HR-FR-HYB-009` | VSCode surfaceはmanifest/find/tree-view等をDB由来read modelとして提供し、CLI／DBと同じID・HEAD・redactionを使う | `HR-AC-HYB-009`: IDE独自正本、stale projection、write-capable表示経路を拒否する |
| `HR-FR-HYB-010` | GitHub自走要件`GH-FR-001..029`とCI性能・監査・環境・security admission NFR`GH-NFR-009..022`を正本とし、Issue/PLAN/PR/CI/security/deployment/merge CLI、hook、DB table、acceptanceへtraceする | `HR-AC-HYB-010`: trace edge欠落、main直push、required check bypass、L3ユーザー承認、文脈レビュー、DB追従、監査修正クロスレビュー、性能計測・Recovery receipt欠落、検査縮退、不完全なmain Recovery解除、staging/production境界・promotion receipt欠落、security coverage／finding／permission receipt欠落、Update lifecycle不整合、PLAN model/path/closure receipt欠落、native auto-merge、release境界越えを拒否する |

#### 4.6.1 multi-project配布package

`HR-FR-HYB-008`の配布正本はdevelopment repositoryであり、配布先は
`RetryYN/HELIX-HARNESS-DevOS`とする。旧`RetryYN/HELIX-HARNESS-OS`はcompatibility inputに限り、
current authority、CLI、setup、doctor、receipt、tag pinへ再投影しない。配布artifactはHELIX-HARNESS自身のdogfoodを複製するsnapshotではなく、
任意のconsumer repositoryへ非破壊導入できるmulti-project harness packageである。

1. **authority／manifest**: package manifestはsource repository／HEAD、requirements version／digest、
   package version、artifact digest、include／exclude exact set、generated index、first／third-party区分、
   license／attribution、build environmentを束縛する。manifest外file、重複path、digest driftを拒否する。
2. **自己適用除外**: project固有PLAN／design／test evidence、`harness.db`、`.helix` runtime state／memory、
   credential、PII、absolute machine path、development-only audit／handoverを同梱しない。runtimeに必要な
   schema、method、adapter templateはconsumer-safeな公開assetとして明示列挙し、dogfood除外を理由に
   doctor／gateを縮退しない。
3. **実行境界**:配布CLI、POSIX entrypoint、PowerShell entrypointは同じNode artifactを呼ぶ。Bun、旧UT runtime、
   旧HELIX Python／Bash implementationをconsumer実行authorityへ戻さない。旧HELIXからはsetup／export／guideの
   behavior atomだけを採取し、現行schema・Node transaction境界へ再実装する。
4. **非破壊setup**: clean／既存／monorepo consumerに対し、managed marker内だけをidempotentに投影する。
   consumer所有file／marker外行／`src`／`docs`／test／Git historyを改変・削除せず、upgrade、rollback、uninstallで
   consumer成果とconsumer-owned `.helix` evidenceを保持する。
5. **同梱文書**: READMEはinstall、`helix setup project`、project adapter、status／doctor、minimal workflow、
   upgrade、rollback、uninstall、proxy／CA／mirror、support／security境界を記載する。LICENSE、third-party
   attribution、provenance、免責が欠けるartifactをpublish candidateにしない。
6. **consumer verification**: clean Linuxをprimary fixtureとし、install → setup → status → consumer doctor →
   minimal delegated workflow dry-runをfresh processで再現する。Windows compatibility smokeは同じNode artifactと
   PowerShell entrypointを検証する。自己適用asset混入、未解決bare CLI、package script欠落、network／credential前提、
   non-idempotent再setupをnegative oracleで拒否する。
7. **version／channel**: semverとimmutable tagへsource HEAD／artifact digestを束縛し、release channelを
   `canary → preview → stable`の一方向promotionとする。各channelは同一artifact digest、entry criteria、観測window、
   stop／rollback trigger、promotion receiptを持ち、rebuildによるartifact差替えやstage skipを拒否する。
8. **sync／rollback／monitoring**: developmentからdistribution repositoryへのsyncはdry-run diff、backup、
   restore rehearsal、consumer canary、post-promotion monitoringを持つ。failure時は直前immutable tagへ戻し、
   consumer projectを巻き戻さずengine pinとmanaged projectionだけを復旧する。
9. **approval境界**: package plan／dry-run／local consumer smokeは可逆作業として自走できる。remote sync apply、
   tag、release publish、channel promotion、正式配布先切替、identifier／state cutoverは、actor／tool／target／params、
   reviewed snapshot、期限、rollback、monitoringを束縛したaction-binding approvalなしに実行しない。

受入IDは次のexact setとする。

| 受入ID | 判定oracle |
|---|---|
| `HR-AC-HYB-008-01` | manifestのinclude／exclude exact set、source／requirements／artifact digest、versionが一致する |
| `HR-AC-HYB-008-02` | dogfood／state／credential／PII／absolute path混入mutationを全て拒否する |
| `HR-AC-HYB-008-03` | clean／既存／monorepo consumerへのsetup再実行がidempotentで、consumer所有bytesを保全する |
| `HR-AC-HYB-008-04` | README、LICENSE、third-party attribution、provenance、免責の欠落を拒否する |
| `HR-AC-HYB-008-05` | clean Linuxでinstall→setup→status→consumer doctor→minimal workflow dry-runがgreenになる |
| `HR-AC-HYB-008-06` | Windowsで同一Node artifactとPowerShell entrypointのcompatibility smokeがgreenになる |
| `HR-AC-HYB-008-07` | canary／preview／stableが同一artifact digestをpromotionし、stage skip／rebuild差替えを拒否する |
| `HR-AC-HYB-008-08` | rollback rehearsalが直前tagへengine pinを戻し、consumer所有成果を変更しない |
| `HR-AC-HYB-008-09` | remote sync／tag／publish／promotion／cutoverをapproval snapshot不在またはdrift時に拒否する |

### 4.7 自律Authoring Admission Transaction

AIのAuthoring能力とCanonical化権限を分離する。AIは要件、設計、PLAN、Markdownを自律的に起草・修正・分割・統合・改名できるが、正本化はProposal→Candidate→Canonicalの状態遷移とAdmission Transactionを通す。

| 要件ID | 要件 |
|---|---|
| `HIL-BR-26` | 可逆なAuthoringは自動確定できる。L1目的、安全境界、外部契約、不可逆操作、真正なtrade-offだけを人間へescalateする |
| `HIL-FR-51` | Admission Engineはsemantic diff、authority、revision、trace、pair、impact、security、rollbackを検査し、`auto_admit`／`auto_admit_with_stale_propagation`／`repair_then_retry`／`human_decision_required`／`reject`／`conflict`のexactly oneを返す |
| `HIL-FR-52` | Markdown、asset revision、event ledger、trace、impact、stale propagation、DB projection、Canonicalization ReceiptをCAS付き単一transactionで更新し、部分成功を残さない |
| `HIL-FR-53` | assetはpath非依存のimmutable IDとrevisionを持ち、rename／move／split／merge／supersedeでauthority、AC、oracle、historyを失わない |
| `HIL-NFR-30` | policy内の可逆Authoringは人間入力なしでCanonical化まで自動完走する |
| `HIL-NFR-31` | fault injection後も正本、ledger、trace、projection、receiptの部分current状態が0件である |
| `HIL-NFR-32` | 意味変更はauthority、impact、pair、oracle、rollback、downstream stale propagationが揃うまでCanonical化しない |

同一`command_id`＋同一digestは既存receiptを返し、異digestはconflictとする。Terminal Reviewは対象revisionとHEADへ固定し、review後の変更でstale化する。Authoring失敗時もproposalとfindingを保持し、AIが黙って要求を落とすことを禁止する。

### 4.8 NFR正本台帳と測定契約

`nfr-grade.md`のplaceholder projectionをNFR正本とみなさず、全NFRをtyped registryへ収束する。

| 要件ID | 要件 |
|---|---|
| `HR-NFR-REG-001` | 各NFRはstable ID、quality characteristic、source authority、対象surface、metric、workload、environment、data、baseline、target、error budget、hard limit、window、probe、oracle、owner、evidence path、再測定triggerを持つ |
| `HR-NFR-REG-002` | L1は能力、L3は観測可能な挙動、ADRは技術選択、policyは閾値運用、runtime profileは環境値を担い、実装方式をNFR本文へ混在させない |
| `HR-NFR-REG-003` | 標準品質特性とAI固有特性（判断再現性、worker/verifier独立性、grounding、loop停止性、cost、provider縮退、memory汚染耐性）を分類する |
| `HR-NFR-REG-004` | DB size、query/projection p95/p99、lock待機、busy timeout縮退、rebuild、archive/vacuum、並行runtime、長時間soakを測定する。未再現の単一障害原因を確定事実にしない |
| `HR-NFR-REG-005` | gate、approval、cutover、projection、GitHub、memory、feedbackへfault injection、race、soak、crash recoveryを適用する |
| `HR-NFR-REG-006` | property-based、model-based state machine、differential、mutation、fuzz、snapshot compatibilityをriskに応じて選択し、手法追加自体を完成証拠にしない |
| `HR-NFR-REG-007` | 実測値を時系列保存し、P4 metric event、requirement、release、regression、改善episodeへjoinする |

baseline未取得のNFRは`unknown`として扱い、推測値でgreenにしない。前身source authority未確定の115 draftは一括freezeせず、authority receiptとPO gate成立後に段階昇格する。

### 4.9 統合Design HARNESS

Design HARNESSはProduct Design、Experience Design、System Design、Design Governanceを一つのcapability registryとDesign Registryへ接続する。文書metadata／semantic diffの実装済み能力と、screen applicability／prototype／要求翻訳／design refactorの設計済み能力を同じ完成状態として表示しない。

| 要件ID | 要件 |
|---|---|
| `HR-FR-DHR-001` | `requirement_id`、`screen_id`、`flow_id`、`interaction_id`、`state_id`、`component_id`、`design_token_id`、`content_id`、`analytics_event_id`、`service_id`、`domain_object_id`、`acceptance_id`を共通registryで結ぶ |
| `HR-FR-DHR-002` | 全PLANをUI対象／非対象へ判定し、UI対象はexecutable prototype manifestとwalkthrough receipt、非対象はL2 N/A receiptを要求する |
| `HR-FR-DHR-003` | screen→interaction→permission→command→API→domain event→analytics event→acceptance testを追跡する |
| `HR-FR-DHR-004` | device、input、role、locale、data volume、network、concurrent update、destructive／undo状態をrisk-based pairwiseで選定する |
| `HR-FR-DHR-005` | prototype↔要求、DOM/component、design token↔CSS、interaction↔E2E、content、analytics、accessibilityのdriftを検出する |
| `HR-FR-DHR-006` | 要求原子はUser Task、Business Outcome、scenario、context、success result、decision rationaleの親グラフを保持し、過剰原子化を拒否する |

runtime未実装の能力は`designed`以上へ昇格せず、implementation／test／real UX evidenceが揃うまで`implemented`または`ux_verified`を主張しない。

工程状態はDesign／Runtime／Release／Production Observationの4状態を独立entity・独立state machineとして
管理し、単一進捗値による状態表現をcanonicalとして禁止する（PLAN-L3-17）。各状態は固有のevidence種別からのみ
導出し、設計済みを理由に運用観測済みへ昇格しない（禁止遷移として機械検査する）。
正本FR＝`docs/design/helix/L3-requirements/lifecycle-state-separation.md`（LSS-FR-01〜08）、
検証oracle＝`docs/test-design/helix/lifecycle-state-separation-acceptance.md`（LSAT 8＋LSAC 15）。

### 4.9.1 Requirement Discovery LoopとL3 JSON authority

要求形成はL1人間向けMarkdown、L2 append-only discovery event／candidate projection、L3 strict JSON IRの
三境界へ分離する。L2は質問、回答、multi-surface prototype、reaction、暗黙要件candidate、human agreementを
反復するがcanonical requirementではない。L3 Requirement Compilerが全evidenceをstable-ID JSONへ変換し、
backflow／human decisionを閉じた後、G1/G3人間承認だけがfreezeを許可する。

この契約は`HR-FR-HIL-15/17/19/20`、AI Vision Design HARNESS、Authoring Admission Engineを再利用する。
重複するRequirement Engine、別台帳、別layer、別authoring DBを作らない。3 development styleは全てL1〜L3を
通り、Discovery／PoCはS4前にcanonical化しないcase-driven model、Design HARNESSはprototype／surface生成を
支援するspecialist processとして別軸を維持する。

現行153 requirement、24 system contract、72 HAC、24 HATはshadow JSON migrationとsemantic parityが完了するまで
Markdownをcurrent authorityとして維持する。cutoverはJSON canonical、generated Markdown、DB projection、
lint／doctor／routing／progression readerを一つのtransactionで切り替え、dual authorityを作らない。
正本refinement＝`docs/design/helix/L3-requirements/requirement-discovery-json-authority.md`（RDJ-FR-001〜012）、
検証oracle＝`docs/test-design/helix/requirement-discovery-json-authority-acceptance.md`（RDJ-AC-001〜012）。

### 4.10 外部AI worker runtimeと配布境界

外部AI workerはPython semantic coreとは別のnon-authoritative capability classであり、HELIXのprecedenceとNode単一write境界を変更しない。

| 要件ID | 要件 |
|---|---|
| `HR-FR-P2-05` | 外部AI workerはversioned descriptor、`worker-context-packet.v1`によるcurrent HEAD／authority／rule／task boundary束縛、隔離worktree、secret task deny、non-authoritative outputを満たす場合だけ起動する |
| `HR-FR-P2-06` | delegationはapproval request／tool call／resultをtyped eventで交換し、Node control planeだけがapprovalとwrite transactionを決定する |
| `HR-FR-P2-07` | repository-level permanent bypass denyはone-shot markerやprovider flagより上位で、下位機構から解除できない |
| `HR-FR-P2-08` | worker出力はstrict schema／digest検証を既定とし、緩和には対象、理由、期限、再検証receiptを要求する |
| `HR-FR-P6-06` | 配布packageはcanonical／generated index、first／third-party区分、provenance、license、免責、digestを持ち、publish／cutoverはPLAN-M-02承認境界を維持する |

grok-buildのworktree allocation／recovery／conflict処理は`PLAN-DISCOVERY-12-grok-build-worktree-precedent`でbehavior atomを採取し、直接importしない。

外部AI workerはprovider横断の共通契約（委譲面／sandbox／receipt／blind benchmark）で運用する（PLAN-L3-18、
HR-FR-HIL-22の本書昇格）。Claude・Codex・Kimi・将来のGrokは同一契約のinstanceであり、blind benchmark
（fixed fixture／rubric、重大failureの平均相殺禁止）による用途別admit／retireなしにworkerを採用しない。
Discovery成果（PLAN-DISCOVERY-12/13）はS4 decide前に正本claimへ昇格しない。
正本FR＝`docs/design/helix/L3-requirements/worker-common-contract.md`（WCC-FR-01〜09、HIL-22/HIL-23 trace付き）、
検証oracle＝`docs/test-design/helix/worker-common-contract-acceptance.md`（HAT-WCC-01〜09）。

## 4.11 安全capability brokerとphysical filesystem identity

安全境界は単一のrisk値、禁止command一覧、または`network_allowed` booleanへ畳み込まない。
次のtyped tupleを同一execution ticketとreceiptへ束縛し、未知・欠落・軸混同・複数候補は推測せず
`unresolved`としてfail-closeする。

```text
operation_capability
  + target_identity
  + execution_provenance
  + data_classification
  + sink_authority
  + impact_profile
  + approval_binding
  + postcondition / rollback / expiry
```

### 4.11.1 機能要件と受入条件

| 要件ID | 機能要件 | 受入条件 |
|---|---|---|
| `SEC-FR-CAP-001` | operation capabilityとimpactを独立typed fieldで保持し、未知・混同・欠落を拒否する | `SEC-AC-CAP-001`: 軸混同・未知・欠落をreason付き`unresolved`で拒否する |
| `SEC-FR-CAP-002` | lexical/physical target、target set、TOCTOU identityを実行直前に検証する | `SEC-AC-CAP-002`: exact physical identityとtarget setが一致するliteralだけを許可候補とし、symlink、junction、mount、hardlink、repo外、glob、TOCTOU変更を拒否する |
| `SEC-FR-CAP-003` | direct/bounded/script/generated/unknown provenanceを区別し、未検証間接実行をhostへ渡さない | `SEC-AC-CAP-003`: bounded以外の間接実行をsandboxまたは拒否へ送る |
| `SEC-FR-CAP-004` | data classificationとsink authorityを分離し、credential、PII、archive egressをbroker外で拒否する | `SEC-AC-CAP-004`: data/sinkの直積を検査し、credential、PII、archive、unknownを拒否する |
| `SEC-FR-CAP-005` | external/destructive actionをexact target、dry-run、postcondition、rollback、expiry、action bindingへ束縛する | `SEC-AC-CAP-005`: tupleが揃うまで`approval_required`または`unresolved`で実行を拒否する |
| `SEC-FR-CAP-006` | hook/sandbox coverageをruntime別に検査し、unsupported surfaceをhost実行へfallbackしない | `SEC-AC-CAP-006`: unsupported、trust drift、sandbox unavailableをfail-closeする |
| `SEC-FR-CAP-007` | canonical safety failureをlegacy greenで相殺せず、値非表示のreceiptへ全reasonを記録する | `SEC-AC-CAP-007`: canonical failureをlegacy／別scannerのgreenで相殺せず、redacted receiptだけを残す |

### 4.11.2 初期physical target契約

path targetは入力の字面だけで許可しない。`lexical_target`はrepo-relative POSIX pathまたは
typed external targetとして保持し、`physical_target`はrealpath、祖先symlink/junction、mount、
device/inode、file typeを検証する。`target_set`はexact member list、cardinality、glob・再帰・
生成展開の有無を保持し、単一artifactの初期sliceではcardinality=1かつliteral expansionだけを許可する。

次のいずれかに該当する場合はhost実行を拒否する。

- lexical pathがrepo外、絶対path、`..`、制御文字、Windows alternate pathを含む。
- physical realpathがrepo境界外、path componentにsymlink/junctionがある、またはfile typeが未対応。
- device/inodeが取得できない、rootと異なるdevice、hardlink alias（`nlink > 1`）、mount boundaryが未検証。
- 判定後から実行直前までにtarget identity digestが変化した。

判定結果はraw command、secret、PII、個人absolute pathを含めず、`lexical_target`、target type、
target cardinality（対象数）、physical identity digest（物理識別子digest）、repository identity digest（リポジトリ識別子digest）、
reason code、policy version、expiryだけをreceiptへ記録する。判定と実行の間に変更があれば自動再実行せず、新しいpreflightを要求する。

### 4.11.3 実装分割と境界

実装は次の順で原子的に進める。

1. physical filesystem identity
2. recursive target expansionとexecution provenance
3. credential sinkとGitHub target authority
4. network/cloud destructive typed adapter（ネットワーク／クラウド破壊操作の型付きadapter）
5. Claude/Codex hook parity（hook同等性）、Cursor/hosted unsupported surface（非対応面）、doctor

各sliceは対応するL4/L5設計、L8/L9/L10 oracle、mutation、DB/receipt projection、current HEADの
独立reviewとmain read-afterを持つ。既存の限定guardのgreenで未実装sliceを相殺しない。本版の昇格は
requirements authorityを更新するものであり、credential、外部control plane、network/cloud、sandbox
cutoverを自動許可するものではない。

## 5. Forward・横軸駆動

- Forwardを正方向とする。
- Reverseは実装事実を設計へ戻す先行taskで、Forward合流前にR0〜R4を閉じる。
- 確定設計を変更する場合はRedesignを先行し、その後Forward実装へ戻る。
- 外部挙動不変の構造改善はDesign Refactorとし、機能追加と混載しない。
- Infinity Loopは監査/改善 ⇔ gate ⇔ 自動走行の横軸であり、最終的にForward正本へ収束する。
- Scrum ReverseはScrumの実装・実測をVモデル資産へ戻す横断経路であり、SR4後にForwardへ再合流する。

## 6. GitHub自律運用

`docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md`を既存GitHub要件、`docs/design/helix/L3-requirements/github-merge-admission-requirements.md`を同一HEAD merge admission拡張として採用する。Issue→PLAN→branch→PR→CI→merge→tag→memory/DBを一episodeとして閉じる。mainはPR-only、strict aggregate `harness-check`、bypassなし、人間approval不要、AI-A（作成・blocker修正）とread-only AI-B（監査・finding disposition・merge判断）の2実行主体、同一HEAD文脈レビューreceipt、DB追従receiptを必須とする。AI-Bは編集・push・Ready化を行わず、blockerを一括返却する。current contract内で局所的に閉じるcorrectness/security findingはAI-Aがcurrent PRで修正し、独立責務・別設計・lifecycle・性能改善だけを後続Issueへ送る。CI greenだけではmergeを許可せず、push・base更新・正本digest変更で両receiptをstale化する。Issue closeは同要件GH-FR-017に従い、通常は終端PRの`Closes #N` mergeだけで行う。`resolved / rejected / quarantined / superseded / cancelled`を別outcomeとして保持し、証拠付き不採用も終端decision PRでclose可能とする。AI単独のmanual closeは禁止し、superseded/cancelledはPO decision、全outcomeはcurrent closure receiptと子Issue dispositionを要求する。

2026-07-24のPO判断により、承認前でも非正本Draft PRをreview proposalとして許可するが、Ready化・mergeは必要な承認と
current HEADのAI-B review、CI、DB追従後に限定する。native auto-mergeは禁止し、AI-Bが証拠を再照合して明示mergeする。
Update identityとP0/P1/P2 priorityは直交させる。flat PLANはG3でtarget契約をfreezeし、実移行はL5契約後の
専用migration PLANとdual-greenで行う。cloud契約はprovider非依存を正本とし、最初のreference profileを
AWS ECS Fargate + CDK TypeScript、DB要件があるfixtureだけRDS PostgreSQLとする。production resource作成は
action-binding approval境界を維持する。

工程のGitHub投影は`docs/design/helix/L3-requirements/github-operations-projection.md`
（GOP-FR-01〜14）を正本とする（PLAN-L3-19）。正本はharness.dbのまま、GitHub Projects・sub-issueは
read側projection（一方向同期）であり、GitHub側編集の正本逆流はIssue admission経由のみとする。
Forward/Scrum以外の駆動モデルはIssue起票でForward再合流の流れをGitHub上に可視化し、
人間はProjects boardとIssue階層から追加ツールなしでactive frontierを読める。CIは3段の重み配分
（外部PR CI=typecheck+変更影響targeted+critical gate、full回帰と全gate=merge後内部CI+nightly、
無根拠なgate削除・閾値緩和による軽量化は禁止）とする。
検証oracle＝`docs/test-design/helix/github-operations-projection-acceptance.md`（GOP-T-01〜11）。

原子的開発・CI・リファクタリング・PR排他は
`docs/design/helix/L3-requirements/github-atomic-development-requirements.md`
（GH-FR-024〜028、GH-NFR-015〜018、GH-AC-035〜040）を正本とする。新規実装と既存改修は
`1 behavior contract + 1 responsibility owner`を共通sliceとし、TDD oracle、DDD責務境界、
targeted/critical/full CI、post-merge/nightly回収、契約先行mini-refactor、GitHub/工程表/DB次タスク、
exactly-one PR writer leaseを同一HEADへ束縛する。memory takeover通知だけではwrite ownershipを移譲しない。
検証oracle＝`docs/test-design/helix/github-atomic-development-system-test-design.md`（GH-T-035〜040）。

security evidence admissionは
`docs/design/helix/L3-requirements/github-security-admission-requirements.md`
（GH-FR-029、GH-NFR-019〜022、GH-AC-041）を正本とする。Codex Security、CodeQL、secret scanning／
push protection、Dependabot等を個別authorityにせず、coverage、finding、policy、permission receiptを
同一HEAD／artifactへ束縛してslice／merge／deploymentを判定する。Codex Securityのbeta availabilityや
coverage不完全を他scannerのgreenで相殺せず、GitHub settings applyはaction-binding human approvalへ止める。
検証oracle＝`docs/test-design/helix/github-security-admission-system-test-design.md`（GH-T-041）。

工学規律の正本は`docs/governance/ddd-tdd-rules.md`とする。目的はコード量ではなく契約された振る舞いであり、
すべての新規L3〜L7 PLANは`no_change → delete → configure → reuse → modify → add_code`を順に評価する。
G3でno-code判断・責務owner・complexity budget、L4/L9でDDD境界、L5/L8でDbC
（precondition/postcondition/invariant/failure）、L6/L7でRed→最小Green→Refactorをfreezeする。
Object-oriented DDDはidentity・lifecycle・invariantが必要な責務に限り、`none`と`pure_function`を正規選択肢とする。
コードまたはCIの正味増加には理由と削除条件を必須とし、再発欠陥と既存検出gapがないdetector/gateを追加しない。

## 7. 設計台帳と完了率

各Lは上位/下位の縦edgeとV字の横pairを持つ。要求、要件、設計、test、Issue、PR、evidence、decisionを`harness.db`へ収束し、orphan、dangling、重複ID、未検証findingを分母から隠さない。

完了率100%は、全requirement、AC、必須edge、V pair、gate evidence、finding dispositionが閉じた場合だけ許可する。L単位tagは進捗の補助証拠であり、DB closureなしに完了率を上げない。

## 8. runtime authority境界

Python/Nodeのauthorityは工程層とは独立にADR epochで決める。2026-07-17のADR-010 accepted裁定により、Pythonは恒久意味コア、Nodeは`harness.db`／Git／GitHubの単一transaction境界である。ADR-009のNode 24 LTS、脱Bun、Linux canonical、cutover receipt、network default deny、DB path/credential/`.helix/`非付与は存続する。動作済みPython意味コアのTS一括再実装と、Node実行境界のPython一括移植を禁止し、双方の責務を同一authority epochで検査する。

ADR-009/010のPython worker制約は本書の機械検証要件とする（PLAN-L3-15、2026-07-20）。

- Python workerはnetwork default denyで起動し、DB path、credential、repository write、`.helix/`を渡さない。
- Python出力のcommand、SQL、absolute path、codeを実行せず、proposal bytesをNodeがschema／digest／authority
  policyで再検証する。
- これらはprose宣言ではなく、doctor gateまたはtestで検査可能なACとして実装へ接続する（検査の不在は
  fail-close対象であり、gap一覧へ登録して黙認しない）。

CI OS profileは、Linuxをfull canonical gate、Native Windows／macOSを同一fixtureのcompatibility gateとする。
v1.2由来の「Windows smokeを追加する」は着地済みであり、正本citeを本書に固定する: Windows smoke =
`.github/workflows/harness-check.yml`の`windows-durability-smoke` job（`runs-on: windows-latest`）。
本jobの存在と`harness-check`からの参照（`needs`）をACとし、削除・rename時は本節を同時更新する。

## 9. 互換mapping

| legacy | canonical |
|---|---|
| L0 charter | L1 企画 |
| L1要求＋L2画面 | L2 要求＋画面プロト |
| L3要件 | L3 要件freeze |
| L4基本 | L4 基本設計 |
| L5詳細＋旧L6機能 | L5 詳細設計＋test contract |
| L7実装 | L6 実装 |
| L8〜L12検証 | L7〜L11 TDD・単体・結合・総合・受入 |
| L13/L14 | L12 運用テスト・改善 |

compatibility inputには`legacy_layer`、canonical outputには`canonical_layer`を保持する。旧path名を残すことは旧authorityを残すことを意味しない。

### 9.1 現行sub-docカタログ

`src/schema/index.ts`の`VALID_SUB_DOCS`をmachine authority、本表をcurrent requirements mirrorとする。
compatibility文書の同名表は読込互換用であり、current schema／lint／doctorを拘束しない。

##### G.1 sub-doc 種別 enum

```text
VALID_SUB_DOCS = {
  L1: ["business", "functional", "nfr", "technical", "screen"],
  L2: ["screen-list", "screen-flow", "ui-element", "wireframe"],
  L3: ["business", "functional", "nfr", "screen-functional"],
  L4: ["data", "architecture", "function", "external-if", "ui-standard",
       "report", "batch", "notification", "code-value"],
  L5: ["physical-data", "module-decomposition", "internal-processing", "if-detail",
       "ui-detail"],
  L6: ["function-spec", "class-design", "edge-case", "screen-spec"],
}
```

### 9.2 現行signal routing契約

signalはcase-driven routeまたは選択済みdevelopment style内のchange intakeを起動する。
signalだけでdevelopment styleをProduction Scrumへ変更してはならない。

| signal | mode / routing target | 補足 |
|---|---|---|
| `drift` | Reverse | `drift_type=schema/contract`を正規化する |
| `debt_degradation` / `code_smell` / `structural` | Refactor | 外部挙動を保つ |
| `dependency_outdated` / `upgrade` / `config_drift` | Retrofit | upgradeはpreflight必須 |
| `agent_runaway` / `context_exhaustion` / `regression_dev` / `runaway` / `forced_stop` | Recovery | `runaway`は`agent_runaway`へ正規化する |
| `production_incident` / `hotfix_required` / `regression_prod` | Incident | production境界とapprovalを検証する |
| `feature_addition` / `scope_extension` | Add-feature | current styleのForwardへ再合流する |
| `pair_agent_tdd` / `pair-agent-tdd` / `pair-agent TDD route` / `pair programming` | Add-feature | pair cellを実行形態として選べるがstyleにしない |
| `version_deferral` | version-up | future activationまでparkする |
| `user_feedback_iteration` / `requirement_continuous_refinement` | selected-style change intake | styleを自動変更せず、lifecycleと影響でRedesign／Add-feature／Scrum sliceへrouteする |
| `requirement_undefined` / `feasibility_unknown` / `success_condition_unclear` / `design_uncertain` | Discovery／PoC | Scrum非内包のcase-driven modelとして起動する |
| `tech_decision_required` / `option_comparison_needed` / `adr_required` | Research | 実現性実験が必要ならDiscovery／PoCへ切り替える |
| `interrupt` | subtype分岐 | 暴走はRecovery、未確定はDiscovery／PoC、追加はAdd-feature、層内gapはForwardへrouteする |

## 10. 受入条件

- 新規authoring outputにL0、L13、L14が出ない。
- L1〜L12の全layerと6組のV pairがexactly onceで定義される。
- V-model、Production Scrum、V設計＋Scrum実装Hybridのdevelopment styleがexactly oneで選択され、Discovery／PoCのcase-driven model activationは別fieldで判定される。
- 非UI案件のL2が証拠付きN/Aとなり、暗黙欠落にならない。
- Production Scrumの各sliceからL1〜L12 pair/evidenceを逆引きできる。
- Production Scrumの各release-ready sliceにSR0〜SR4 receiptがある。
- Scrum Reverse findingがRedesign/Design Refactor/Performance Refactor/Retrofitのexactly oneへrouteされる。
- 必須NFRごとにverification/measurement contractとcurrent evidenceがあり、未測定・stale・閾値未達でcompletionを拒否する。
- 全workflow transitionがFR、AC、test scenario、source transition、L1〜L12 pairへ追跡でき、未解決分岐をfreezeへ算入しない。
- AI判断はproposalとcommit authorityが分離され、候補、根拠、confidence、fallback、dead-letter、再評価trigger、測定oracleが欠ければ実行を許可しない。
- Full Vはsystem workflow全体、Production Scrumはslice deltaとSR0〜SR4 backfillの両方を保持する。
- workflow/switching/routing/allocationのschema composition gapとZIP example不整合を解消するまでengine activationを許可しない。
- Vision Designの三契約とsemantic IDがL1〜L12の正規6 V-pairへ閉じ、UI対象でprototype agreement、screen ledger、UI profile、frontend binding、mission/oracle、UX evidenceの欠落を許可しない。
- `implemented`と`ux_verified`を独立判定し、real-data、responsive、motion、accessibility、performance、continuity、人間評価のcurrent evidenceが無ければUX完成を拒否する。
- Scrum UI sliceはSR0〜SR4でsystem visionと設計資産へbackfillされ、AI自己承認、別layer／別文書体系、無断の機能拡張を拒否する。
- `HR-FR-HYB-001..010`が各CLI、hook、DB table、gate、acceptanceへtraceされ、野良実装が0件になる。
- closure自走はtyped evidence条件を全て満たす可逆`close_ready`だけを対象とし、未完了成果や不可逆対象を閉じない。
- distribution packageは自己適用を除いたmanifest exact set、README／LICENSE／attribution、Linux／Windows consumer smoke、canary→preview→stable同一artifact promotion、rollback／monitoringを満たし、remote actionはapproval境界で停止する。
- Authoring AdmissionはProposalを保持したままatomic Canonicalizationを行い、部分write、authority不明、oracle消失を拒否する。
- 全NFRがregistryとcurrent measurementへ結合し、baseline不明、stale、hard limit超過をgreenにしない。
- Design HARNESSの実装済み／設計済み／UX検証済み状態を分離し、screenからacceptanceまでのtrace欠落を拒否する。
- L1 Markdown、L2 discovery event/candidate、L3 strict JSON authorityを分離し、質問回答やhuman agreementの捏造、
  prototypeの要求正本化、generated Markdown直接編集、JSON／Markdown dual authorityを拒否する。
- 3 development styleが同じRequirement Discovery Loop／L3 compile／freezeを通り、Discovery／PoCと
  Design HARNESSをstyleへ混在させない。
- legacy artifactはexact mappingでき、未分類・多対多曖昧が0件になる。
- GitHub episodeとDB closureが同一HEADへ収束する。
- authority文書が本書を参照し、L0〜L14をcurrent canonicalと表示しない。
