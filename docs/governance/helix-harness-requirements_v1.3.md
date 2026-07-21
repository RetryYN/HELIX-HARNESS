# HELIX 要件定義書 v1.3 — L1〜L12 Vモデル＋Scrum正本

- **Version**: 1.3.3
- **Status**: confirmed（PO再確認 2026-07-18、全harness memory追突 2026-07-19）
- **設計コア**: `ハイブリッド設計ドキュメントv1-fixed.zip`、`UNIVERSAL-WORKFLOW-REQUIREMENTS-SKILL_v1.1.0.zip`、`HELIX-HYBRID-CORE-REQUIREMENTS-REBASELINE_v0.5.1.zip`
- **旧正本**: `helix-harness-requirements_v1.2.md`（L0〜L14部分はcompatibility referenceへ降格）
- **継承**: v1.2のうち、本書と衝突しない安全・証跡・駆動モデル・agent・DB・GitHub要件は継承する。

## 1. 正本決定

HELIXの工程正本は **L1〜L12のVモデルとScrumのハイブリッド**である。L0〜L14は既存成果物を読み取る期限付きcompatibility inputであり、新規PLAN、template、generator、DB canonical projection、進捗表示、tagはL1〜L12だけを出力する。

VモデルとProduction Scrumは、目的に応じて選択できる**同格の一線級delivery engine**である。
ScrumをVモデルの簡易版・縮退版・例外経路として扱わない。全production経路はL1〜L3を通り、要件定義と
routeをユーザーが同時承認する。その後、Production ScrumはL3確定要件を価値sliceへ分けて進み、
HybridはL5詳細設計まで通してから実装をslice化し、Forwardはslice化せずL12まで進む。いずれも同じ品質属性、二主体review、
trace、DB event/projection/checkpoint/schema追従、release evidenceを満たす。Scrum ReverseはScrumをVモデルへ
格下げする工程ではなく、実測知見をcanonical設計資産へ同期する対等な接続契約である。

本書とv1.2、concept v3.1、旧process文書が衝突する場合、本書と`docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md`を正とする。

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

### 3.1 要件定義の合意決議方式

要件定義は完成packetを突然POへ提示して承認だけを求める方式にしない。次の反復を正規手順とする。

1. authored source、既存回答、DB continuation、Issue/PLAN、外部一次情報を調査し、証拠で確定済みの事項を質問から除く。
2. 現行正本内の齟齬・定義不足をAIが先に是正し、未修正のままPOへ判断を投げない。
3. 独自概念は`目的→選択条件→組合せ→状態遷移→gate→DB追従→最終正本`で検査する。
4. 証拠で解けない論点だけを5問単位で提示し、各回答を個別要件・AC・test oracleへ即時反映する。
5. 回答反映後に未解決事項、反例、非目標、route、性能・安全境界を再監査し、次の5問へ進む。
6. 未解決ゼロとなったcurrent revision、変更要約、反映済み回答、残debt、検証結果をPOへ提示する。
7. POはこの最終revisionへ合意決議を行う。最終承認は対話的な要件形成の終端であり、その代替ではない。

質問と回答は順序、対象revision、反映先ID、未解決状態を持つdecision ledgerとして保存し、
最終freeze receiptはledger digest、requirements digest、HEAD、route合意を同時に束縛する。

### 3.2 要件定義時の実装優先度

L3要件定義はFR/NFR/ACだけでなく、依存、risk、早期実証価値、後続工程への波及を根拠に
実装優先度も確定する。優先度は実装開始を意味せず、L3全体revisionの最終合意後に作成する基本設計・実装backlogの
順序を拘束する。今回のclosure対象はInfinity Loop、GitHub自律運用、内部CIとGitHub Actionsの独立二重検査、
DB event/projection/checkpoint/schema追従、delivery route、deploy境界を含むcurrent L3 revision全体とする。

要件定義中に派生起票する分類は、未知・実現可能性・比較仮説を証拠化する`PoC`、合意済み要件を後続工程で
実現する`Feature`、現行要件の成立を妨げない将来拡張を保持する`Update`とする。`Update`の既定優先度は遅めとし、
open backlogのままでも異常・blockerに数えない。未実装事項、将来改善、質問残を`Recovery`へ送らない。
`Recovery`は実装・実走後に観測された不具合、性能退行、工程findingを正本へ戻す分類であり、要件定義の成果分類ではない。

第三worker／Kimiの共通sandbox、最小払い出し、proposal再検証、audit receiptはFeature Issue #51へ接続し、
実務で早期検証できる先行優先Featureとする。ただし現在は要件定義で優先度を確定する段階であり、L3全体合意前に
実装開始・admit済み・production-readyを主張しない。実践投入後に判明した改善はRecovery Issueへ証拠付きで還流する。

実装優先度の正本は`P0`〜`P3`とする。`P0`はmain復旧、security、data integrity、`P1`は開発速度を
決める基盤と早期実証Feature、`P2`は通常Feature、`P3`はUpdateである。上位作業を解放する依存は根拠付きで
繰り上げる。実装上の不具合・退行・工程findingはRecovery Issue、操作・環境・外部service上のtroubleは
Incident Issueとして起票し、両者を混同しない。

## 4. 開発経路

| route | 適用条件 | 工程規律 |
|---|---|---|
| `FULL_L1_L12_V` | L3承認後もslice化せず、system全体を一貫して設計・実装・検証する方が適する | L1〜L12をForwardで進み、全V-pairを閉じる |
| `PRODUCTION_SCRUM` | L1〜L3とroute承認後、小規模・継続成長・高feedbackのproductを要件単位のsliceで進める方が適する | L3確定要件をbacklog/sliceへ束縛し、各sliceで正規のL4/L5設計、実装、検証を行う。依存関係濃度が高い、または設計上の接続が必要なcheckpointではDesign Refactorで粒度・重複・境界を正規化し、typed traceでVモデル正本へ接着する |
| `V_DESIGN_SCRUM_IMPLEMENTATION` | system共通の基本・詳細設計を先に確定し、その後の実装をslice化する方が適する | L1〜L5とtest designをVモデルで凍結し、その設計境界内のL6以降をScrum sliceで実装・検証する。差分設計はDesign Refactorで親L4/L5へ統合し、typed traceで接着する |
| `DISCOVERY_POC` | 非productionの仮説探索 | S0〜S4。S4決定前にproduction Forwardへ昇格しない |

全production routeでL1〜L3とユーザー要件承認を省略しない。route判定はL3要件確定時に同時合意し、
(1)要求確定度、(2)system/境界/依存の複雑性、(3)実装規模、(4)継続成長とfeedback頻度、
(5)段階release必要性、(6)risk・規制・migration影響を入力にする。単一の「規模」だけでは決めない。
小規模でも要求が固定され複雑なbatch/systemはFull V、大規模でも設計を先に凍結して段階releaseするproductは
`V_DESIGN_SCRUM_IMPLEMENTATION`とする。unknown、複合、route判定不能は`FULL_L1_L12_V`へfail-closeする。
ScrumはTDD、Reverse、受入条件、migration、rollback、security、release evidence、L12運用を省略しない。

HELIXは個人開発を前提とするため、Scrumのteam ceremony、velocity競争、複数人role分担は必須にしない。backlog、slice、DoR/DoD、review、retro、段階releaseだけを必要粒度で使う。

### 4.1 Scrum ReverseによるVモデル回帰

Production Scrumと`V_DESIGN_SCRUM_IMPLEMENTATION`は各sliceを実装して終わらせない。次のcheckpointで
`SCRUM_REVERSE`を発火する。Scrum内でもsliceごとに正規のL4基本設計とL5詳細設計artifactを作るため、Vモデル合流時は既存設計を再生成せず、
source slice、要件、設計、test、実測をtyped traceで対応V-layerへ接着する。この接着の標準工程として
依存関係濃度または設計接続の必要性を判定し、必要なcheckpointでのみ**Design Refactor**を実行する。独立した
単一sliceへ無条件にDesign Refactorを要求しない。発火時は受入済み外部契約を保ったままslice由来の設計粒度、
重複、責務境界、命名、依存をcanonical V設計へ正規化する。外部契約・要求・ACの意味変更を検出した場合は
Design Refactorで吸収せず、影響traceへ到達する差分だけをRedesignとしてL1〜L3のユーザー承認へ戻す。
影響しないsliceは継続でき、承認済み差分はDesign Refactorで構造統合する。実走で判明した工程・判定・性能の
改善はRecovery Issueへ証拠付きで起票し、要件・設計へ還流する。
**最終正本は常にVモデル資産**であり、backlog、sprint、increment、retroは進行・学習の正本であって
最終要求・設計・検証contractの代替にはならない。

- sprint review前
- release candidate合流前
- public contract、DB schema、主要dependency、NFR budgetの変更時
- 設計traceのないcode、test、metric、運用判断を検出した時
- 同種finding再発、性能退行、障害、手動回避を検出した時
- 複雑性・risk・依存境界が増大し、現在routeの設計粒度では安全に継続できない時

旧入力名`PRODUCTION_SCRUM_REDUCED_V`は既存artifactの読込互換に限って受理し、新規判断、receipt、DB projection、
表示、出力は`PRODUCTION_SCRUM`へ正規化する。

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

Discovery PoCはS0〜S4でvision/prototype仮説を探索できるが、S4の人間判断前に`implemented`、`ux_verified`、production-readyを主張しない。採用する仮説は判定6軸により`FULL_L1_L12_V`、`PRODUCTION_SCRUM`、または`V_DESIGN_SCRUM_IMPLEMENTATION`へ昇格して正規V-pairを閉じる。

AIはprototype、profile、ledger、binding、component role、UX evidence、deltaと改善候補を生成・比較・検査できる。ただしproduct vision、brand、体験上の優先順位、L2 prototype agreement、L3要求凍結、L11利用者受入、L12改善採否を自己承認しない。`implemented`はL6↔L7 receipt、`ux_verified`はL10〜L12のreal-data evidenceと人間評価から別々に導出し、画面数、route数、placeholder、generic table、screenshot単体を完成証拠にしない。

ZIP原文のL0〜L14配置は本書のL1〜L12へexact mappingし、旧L6 missionはL5 test contract、旧L7 implementationはL6↔L7へ再配置する。Design HARNESSの意味判定はADR-010に従いPython意味コアを恒久正本とし、Nodeへ複製しない。Nodeはschema、authority、policy、HEAD、digestを再検証して`harness.db`／Git／GitHubへcommitする唯一のtransaction境界である。既存Python path名は実装authorityにせず、UT CLI/state/DB/PLAN/roleとBun前提は採用しない。

### 4.6 ハイブリッド制御面のReverse backfill

既存runtime／CLI／gateが要件IDなしで先行していた機能を、次の正規要件へbackfillする。実装が存在することだけを要件充足の証拠にせず、各IDをL3設計、test oracle、runtime evidenceへ接続する。

| 要件ID | 機能要件 | 受入条件 |
|---|---|---|
| `HR-FR-HYB-001` | closure authorityはauthority registry、typed review receipt、evidence digest、convergence epoch、CAS、atomic rollback、terminal boundaryを管理する。`close_ready`はreview-bundle digest一致、対象test/gate green、`closure apply --dry-run`成功時だけ自走承認できる | `HR-AC-HYB-001`: 不可逆対象、実成果未完了、digest/HEAD driftをauto-approveせず、generic test evidenceだけでclosureしない |
| `HR-FR-HYB-002` | MCP profile catalogはprofile列挙、設定、safety、read-only probeを型付きで提供し、credential、egress、tool capabilityをprofile単位でfail-closeする | `HR-AC-HYB-002`: 未登録profile、secret要求、write可能probeを拒否する |
| `HR-FR-HYB-003` | Discovery Scrumを`S0 backlog → S1 plan → S2 poc → S3 verify → S4 decide`として定義し、S4人間判断後だけFull V、Production Scrum、V設計＋Scrum実装Hybridのいずれかへ昇格する | `HR-AC-HYB-003`: S4 receiptなしのproduction claimと`decideDiscoveryS4`／`routeScrumFullback`迂回を拒否する |
| `HR-FR-HYB-004` | hybrid git laneはforeign worktree、stage、commit、HEAD、one-shot overrideを識別し、`lane status`、work-guard、git-command-guard、`guard_override_transactions`へ同一episodeを記録する | `HR-AC-HYB-004`: foreign hunk混載、未記録override、destructive gitを拒否する |
| `HR-FR-HYB-005` | memory v2はwrite/list/surfaceに加え、expiry、takeover、one-shot deliver/consume、長期層のfenced/idempotent retire、compaction fenceを持つ。active harness/project memoryは正本へ追突後にbody-free receiptへretireし、stale instructionを再提示しない | `HR-AC-HYB-005`: retire前の未反映memory、二重deliver、期限切れtakeover、lost update、terminal receiptのactive再表示を拒否する |
| `HR-FR-HYB-006` | feedback lifecycleはintake、classify、ack、pending、reverse-candidate、resolution、SessionStart surfaceをevent/projectionで管理する | `HR-AC-HYB-006`: 未ack findingの消失、prose handoverだけの解決、source HEAD不一致を拒否する |
| `HR-FR-HYB-007` | skill engineは登録だけでなくtask/drive/layerから推薦し、firing、acceptance、効果、誤推薦、stale versionを計測して改善へ戻す | `HR-AC-HYB-007`: 根拠なし推薦、未計測の有効性主張、旧versionのsilent利用を拒否する |
| `HR-FR-HYB-008` | distributionはdevelopment正本からHELIX-HARNESS-OSへplan／sync／package／publish evidenceを作り、source digest、artifact、rollback、consumer verificationを接続する | `HR-AC-HYB-008`: publish、tag、配布先切替はaction-binding approvalなしに実行しない |
| `HR-FR-HYB-009` | VSCode surfaceはmanifest/find/tree-view等をDB由来read modelとして提供し、CLI／DBと同じID・HEAD・redactionを使う | `HR-AC-HYB-009`: IDE独自正本、stale projection、write-capable表示経路を拒否する |
| `HR-FR-HYB-010` | GitHub自走要件`GH-FR-001..022`を正本とし、各FRをIssue/PR/CI/merge CLI、hook、DB table、acceptanceへtraceする | `HR-AC-HYB-010`: trace edge欠落、main直push、required check bypass、要件ユーザー承認、文脈レビュー、DB追従、監査修正クロスレビュー、main Recovery closure、staging/production promotion、Update backlog分類のreceipt欠落、release境界越えを拒否する |

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

### 4.10 外部AI worker runtimeと配布境界

外部AI workerはPython semantic coreとは別のnon-authoritative capability classであり、HELIXのprecedenceとNode単一write境界を変更しない。

| 要件ID | 要件 |
|---|---|
| `HR-FR-P2-05` | 外部AI workerはversioned descriptor、隔離worktree、secret task deny、non-authoritative outputを満たす場合だけ起動する |
| `HR-FR-P2-06` | delegationはapproval request／tool call／resultをtyped eventで交換し、Node control planeだけがapprovalとwrite transactionを決定する |
| `HR-FR-P2-07` | repository-level permanent bypass denyはone-shot markerやprovider flagより上位で、下位機構から解除できない |
| `HR-FR-P2-08` | worker出力はstrict schema／digest検証を既定とし、緩和には対象、理由、期限、再検証receiptを要求する |
| `HR-FR-P6-06` | 配布packageはcanonical／generated index、first／third-party区分、provenance、license、免責、digestを持ち、publish／cutoverはPLAN-M-02承認境界を維持する |

grok-buildのworktree allocation／recovery／conflict処理は`PLAN-DISCOVERY-12-grok-build-worktree-precedent`でbehavior atomを採取し、直接importしない。

外部AI workerはprovider横断の共通契約（委譲面／sandbox／receipt／blind benchmark）で運用する（PLAN-L3-18、
HR-FR-HIL-22の本書昇格）。Claude・Codex・Kimi・将来のGrokは同一契約のinstanceであり、blind benchmark
（fixed fixture／rubric、重大failureの平均相殺禁止）による用途別admit／retireなしにworkerを採用しない。
Discovery成果（PLAN-DISCOVERY-12/13）はS4 decide前に正本claimへ昇格しない。
正本FR＝`docs/design/helix/L3-requirements/worker-common-contract.md`（WCC-FR-01〜08、HIL-22 trace付き）、
検証oracle＝`docs/test-design/helix/worker-common-contract-acceptance.md`（HAT-WCC-01〜05）。

## 5. Forward・横軸駆動

- Forwardを正方向とする。
- Reverseは実装事実を設計へ戻す先行taskで、Forward合流前にR0〜R4を閉じる。
- 確定設計を変更する場合はRedesignを先行し、その後Forward実装へ戻る。
- 外部挙動不変の構造改善はDesign Refactorとし、機能追加と混載しない。
- Infinity Loopは監査/改善 ⇔ gate ⇔ 自動走行の横軸であり、最終的にForward正本へ収束する。
- Scrum ReverseはScrumの実装・実測をVモデル資産へ戻す横断経路であり、SR4後にForwardへ再合流する。

Infinity LoopはIssue起票・追跡・closureを本線とし、閉じなければcorrectness、安全性、正本整合が壊れるIssueと、
局所的に完結する改善は自走して閉じる。Updateは自然な導入checkpointが到来した場合、または大幅な改善効果が
見込める場合に対象化するが、全体影響が低くcurrent episodeを閉じられるならP3 backlogへ残してloop完了を妨げない。
改善の実装爆発は固定日数だけで判定せず、同種PLANの過去実装速度、見積り分布、変更対象量、組込み依存閉包、
影響L・V-pair・consumer、migration/security riskから予測する。予測が通常episodeの実績上限を有意に超える、
大幅な設計判断を要求する、または派生Issueが連鎖的に増える場合は、予測根拠をIssueへ記録して待機状態にし判断を求める。
履歴不足時だけ保守的な暫定budgetを使い、実績蓄積後に再較正する。無条件再試行や、Updateが残ることだけを理由にした
永久loopを禁止する。

PoCのS4出口は証拠と採用形態から選ぶ。prototypeをそのまま生かす場合と、設計から製本してproduction化する場合を
区別し、Reverse、Forward、Production Scrum、Featureのいずれで起票・再合流するかを決定する。PoCを常にFeatureへ
変換せず、PoC証拠と出口decisionを保持する。UpdateはFeatureへ昇格させない。正本へ取り込む場合はUpdateのidentityを
保ったままForwardまたはProduction Scrumで実行する。

### 5.1 PLAN名・物理pathの駆動モデル拘束

全PLANのcanonical ID、表示名、物理pathは駆動モデルを必須成分にする。`PLAN-L5-<連番>`のようにlayerだけを示す
名称を禁止し、少なくとも`PLAN-L5-FORWARD-<slug>`／`L5-Forward PLAN: <title>`のようにlayerと駆動モデルを
同時に表す。Forward、Reverse、Production Scrum、Scrum Reverse、Redesign、Recovery、Incident、Design Refactor、
Performance Refactor、Retrofit、PoC等の実行経路は同じ規律で固有の`workflow_model` tokenを持つ。
既存frontmatterの`drive`（専門職）とは別概念であり混在させない。FeatureとUpdateはIssue分類であって
駆動モデルではなく、PLAN名の`workflow_model` tokenへ代入しない。Feature／Updateを実行する際は別途選択した
ForwardまたはProduction Scrum等の実際の駆動モデルをPLAN名へ記録する。

authoringは駆動モデル別root＋layer別subdirectoryのschema-owned folderからのみ行う。generatorは選択した駆動モデルに
対応するfolder、ID prefix、frontmatter routeを一体生成し、任意pathへの新規PLAN作成を提供しない。folderと`workflow_model` token、
layer、frontmatterが一致しない作成はwrite前にfail-closeする。後置lintだけに依存せず、生成入口、許可directory、
filesystem write guardの三層で、許可形以外のファイルを作れないようにする。legacy PLANは読込互換に隔離し、新規出力の
命名根拠にしない。

正規物理形は`docs/plans/<workflow_model>/<layer>/PLAN-<layer>-<WORKFLOW_MODEL>-<slug>.md`とする。ただし
DB取込みではpathをidentityにせず、不変`plan_id`を主キー、`workflow_model`、`layer`、`artifact_path`を独立属性として
projectionする。scannerは正規rootを再帰走査し、同一`plan_id`の複数path、path移動の別PLAN化、folderとDB属性の不一致を
fail-closeする。既存flat PLANはcompatibility loaderで読み、canonical nested pathへの段階移行中もevent、trace、dependencyを
失わない。

駆動モデル遷移では既存PLANをrenameせず、遷移先の新PLANと子Issueを作る。元PLAN、遷移先PLAN、要件・設計・実装依存、
block/unblock関係、遷移理由、source/target HEADをdependency edgeとtransition receiptで結び、DB event/projectionから
完全な遷移系列を再生可能にする。依存閉包が算出できない遷移は開始しない。

## 6. GitHub自律運用

`docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md`を本書のGitHub要件として採用する。Issue→PLAN→branch→PR→CI→merge→tag→memory/DBを一episodeとして閉じる。mainはPR-only、strict aggregate `harness-check`、bypassなし、人間approval不要、AI-A（作成・修正）とAI-B（監査・merge判断）の2実行主体、同一HEAD文脈レビューreceipt、DB追従receiptを必須とする。GH-FR-019に従い、作成AIのPR前内部CI、監査AIの修正責務、修正時の別identity・別sessionによる独立差分レビュー、修正後HEADの内部CIとGitHub Actions独立ダブルチェックを要求する。重要検査は各環境p95 60秒、Full verificationはp95 3分を目標とし、correctness greenの性能超過はmergeと分離したRecoveryで改善追跡する。CI greenだけではmergeを許可せず、push・base更新・正本digest変更で両receiptをstale化する。Issue closeは同要件GH-FR-017に従い、通常は終端PRの`Closes #N` mergeだけで行う。`resolved / rejected / quarantined / superseded / cancelled`を別outcomeとして保持し、証拠付き不採用も終端decision PRでclose可能とする。AI単独のmanual closeは禁止し、superseded/cancelledはPO decision、全outcomeはcurrent closure receiptと子Issue dispositionを要求する。

工程のGitHub投影は`docs/design/helix/L3-requirements/github-operations-projection.md`
（GOP-FR-01〜14）を正本とする（PLAN-L3-19）。正本はharness.dbのまま、GitHub Projects・sub-issueは
read側projection（一方向同期）であり、GitHub側編集の正本逆流はIssue admission経由のみとする。
Forward/Scrum以外の駆動モデルはIssue起票でForward再合流の流れをGitHub上に可視化し、
人間はProjects boardとIssue階層から追加ツールなしでactive frontierを読める。CIは3段の重み配分
（外部PR CI=typecheck+変更影響targeted+critical gate、full回帰と全gate=merge後内部CI+nightly、
無根拠なgate削除・閾値緩和による軽量化は禁止）とする。
検証oracle＝`docs/test-design/helix/github-operations-projection-acceptance.md`（GOP-T-01〜11）。

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

## 10. 受入条件

- 新規authoring outputにL0、L13、L14が出ない。
- L1〜L12の全layerと6組のV pairがexactly onceで定義される。
- Full V、Production Scrum、V設計＋Scrum実装Hybrid、Discovery PoCが判定6軸から選択される。
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
- Authoring AdmissionはProposalを保持したままatomic Canonicalizationを行い、部分write、authority不明、oracle消失を拒否する。
- 全NFRがregistryとcurrent measurementへ結合し、baseline不明、stale、hard limit超過をgreenにしない。
- Design HARNESSの実装済み／設計済み／UX検証済み状態を分離し、screenからacceptanceまでのtrace欠落を拒否する。
- legacy artifactはexact mappingでき、未分類・多対多曖昧が0件になる。
- GitHub episodeとDB closureが同一HEADへ収束する。
- authority文書が本書を参照し、L0〜L14をcurrent canonicalと表示しない。
