---
title: "Execution TicketとHELIX-Bench接続要件候補"
layer: L3
canonical_layer: L3
canonical_pair: L10
canonical_vmodel: L1-L12
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
related_issue: 1534
plan: PLAN-L3-88-execution-ticket-bench-authority
pair_artifact: docs/governance/candidates/execution-ticket-acceptance.md
---

# 要件候補

上位: [L2要求](execution-ticket-requests.md)。照合・責務・移管記録: [取込台帳](execution-ticket-intake.md)、[trace](execution-ticket-trace.md)。

## 取込時の明確化

- 現行AssignmentのIssue／PLAN択一は未切替scopeで存続する。Ticket採用scopeは新schema versionで一つの導出契約へ束縛し、三つを同時にscope authorityにしない。
- Ticket内allowed/forbidden pathsは計画上の制約であり、physical identityと実行時targetの解決は既存broker／Assignmentが担う。自由文字列pathを実行許可にしない。
- 異なるTicket revision間も同一logical workの旧変更Assignmentをfenceしてから新revisionをclaimする。revision別一writerだけで旧新二重writerを許さない。
- L3承認・canonical freeze・IR admission前に本候補を実行判定へ使用しない。既存BenchのPLAN confirmedと文書draftの不一致は自動昇格せず#251で解決する。
- HXT/HXBは本候補内追跡ID。既存FRとの同義重複はtraceの再利用先へ接続し、current FRを二重定義しない。登録／改版はcanonical化時に行う。
- measurement modeはworkflow identityやexecution modeとは別軸。Ticket revisionとscorer／policy revisionを混同しない。
- 本取込は新規API、課金、認証設定、公開、production操作、旧engine切替を実施しない。

<!-- eta-source:3:start -->
## 3. 接続アーキテクチャ

```text
要求・要件正本 / Design / PLAN
           ↓ compile
     ExecutionTicket ──── measurement obligation（参照のみ）
           ↓ bind
 Assignment / Lease / Fence
           ↓
     ExecutionAttempt → Test / CI / Independent Review / Closure
           │                         │
           └── 既存durable event / outbox ──┘
                               ↓
                 Resident Measurement Consumer
                   追加LLM呼出しなし
                               ↓
                MeasurementEpisode / MetricReceipt
                               ↓
                        HELIX-Bench
              ┌────────────────┴───────────────┐
              ↓                                ↓
      live観測・coverage・drift         formal / shadow実験候補
                                               ↓ policy/admission
                                  既存scheduler・予算・sandbox
                                               ↓
                                  独立したExperiment Attempt
                                               ↓
                                     共通scorer / receipt
              └────────────────┬───────────────┘
                               ↓ typed proposal/evidence
       Runtime Capability Registry / Dynamic Routing / Portfolio
                    / Requirement Re-entry
```

### 3.1 三つの測定mode

| mode | 入力 | 追加モデル実行 | 権限と結果の意味 |
|---|---|---|---|
| `live` | 通常開発のdurable event・既存receipt | 観測処理からは0回 | 実運用事実。単独ではHELIXによる因果効果を証明しない |
| `formal` | 固定task snapshot・独立oracle・事前固定protocol | 予算付きで実行 | 条件を制御した比較。通常repoのmerge/publish/deploy権限なし |
| `shadow` | 許可された実Ticketの隔離snapshot | 抽出した対象だけ実行 | 本線に影響しない校正。formal相当の条件を満たさなければ探索的評価 |

常駐consumerは常時専用processでも、既存Supervisorの再開可能なconsumerでもよい。常駐の要件は「イベントを取り逃さず追い付き、再起動後に継続すること」であり、特定deployment方式を要求しない。

<!-- eta-source:3:end -->

<!-- eta-source:4:start -->
## 4. 責務と正本の境界

| 資産 | 所有する意味 | 所有しないもの |
|---|---|---|
| 要求・要件正本 | 満たすべき価値・制約・承認境界 | 現在の実行担当・スコア |
| Design / PLAN | 正本に従う設計・原子的変更統制 | 別の要求正本、瞬間的な配車状態 |
| ExecutionTicket | 導出された実行契約：目的・責務・scope・受入義務 | provider、assignee、branch、lease、進捗、score |
| Assignment | 実行者・実行場所・予算・lease/fenceとTicketのbinding | Ticketの目的・scopeの独自変更 |
| ExecutionAttempt | 一回の実行条件・観測・結果・retry lineage | 永続的な仕事の意味 |
| TaskSnapshot / ExperimentDefinition | 比較対象・fixture・protocol・treatment・共通採点基準 | 本番Ticketの意味変更・本番権限 |
| MeasurementEpisode / MetricReceipt | 観測事実・集計入力・欠測・採点version・証拠 | dispatch、merge、要求承認、Ticket close authority |
| GitHub | collaboration inputと、移行済み対象の外部projection | 独自Ticket正本。既存Issue契約を一括廃止する理由にもならない |
| journal / event writer | 正規runtime eventの耐久記録 | 人間意味承認の代用 |
| `harness.db` read model | canonical record/eventから再生成する検索・集計projection | 直接SQLによる意味・完了の改ざん |
| 能力評価・配車・Release owner | 既存policyに基づく利用可否・配車・配布の判断 | Bench scoreだけによる権限昇格 |

canonical event journalの物理実装に既存SQLite transactionが使われる場合、それを否定しない。「DBはprojection」とはread modelを意味する。journalとread modelの役割、バックアップ、再構築元を明示し、唯一のruntime eventをDB削除で失う設計にしない。

<!-- eta-source:4:end -->

<!-- eta-source:5:start -->
## 5. 不変条件

1. 切替済みの通常開発経路では、admitted Ticket・有効Assignment・必要なlease/fenceなしに変更実行しない。bootstrap、read-only診断、formal/shadowは別の明示的実行profileで扱い、抜け道にしない。
2. Ticketは要求・要件へ遡及する導出契約であり、要求・要件正本を置き換えない。PLANのatomic change規律をTicket細分化で弱めない。
3. Ticketはimmutable/revisioned。exactly-one primary responsibilityとbehavior contractを持つ。曖昧な分解は候補・backflowに留める。
4. actor、provider、model、session、branch、worktree、lease、現時点の優先順位・進捗・measurement値はTicket本文へ入れない。
5. Ticket revision、Assignment revision、Attempt、treatment、replicate、event IDは別identityとする。
6. `ticket_digest`一致だけでは比較可能性を成立させない。実験ではtask/fixture/base/protocol/scorer等も照合する。
7. provider変更・観測方針変更・配車順位変更だけでTicketの意味revisionを増やさない。
8. 全modeの観測対象に成功だけでなく失敗・拒否・中断・quarantine・取得不能を含める。未実行を成功/失敗Attemptへ捏造しない。
9. 通常観測の追加model invocationは0。解析のCPU/I/O・保存費用は別途計測する。
10. 観測は本線へ逆書込みしない。追加実験には別の認可・有限予算・隔離境界を要求する。
11. 一つのTicket revisionにつき、通常repoへ変更権限を持つactive Assignmentは一つ。formal/shadowにも複数本番writerの例外を与えない。
12. benchmarkの共通評価基準は事前固定し、HELIX Fullに固有の内部receipt数を品質の固定加点にしない。
13. 受動観測だけで効果の因果関係を断定しない。異なる条件のデータは識別し、欠測・標本数・観測窓を表示する。
14. secret/PII/非公開artifact/hidden oracleは最小権限で隔離する。digestは内容同一性であり、発行者認証や実行事実の証明の代用ではない。
15. 分析の遅延だけで全開発を停止しない。必要なaudit eventを耐久記録できない場合は、該当する新規変更・危険操作をfail-closeする。
16. 結果は既存ownerへtyped evidence/proposalとして渡す。優先度・配車・承認の決定を本要求書の列挙順から推測しない。
17. source変更はaffected ref/obligation単位に評価する。無関係なmain更新で全Ticketをsupersedeしない。
18. 条件付き安全fallback・recoveryは既存policyから決定する。未知の状態を「正常」「0円」「初回」「現行性能」と推測しない。

<!-- eta-source:5:end -->

<!-- eta-source:6:start -->
## 6. データ契約とTicket合成

以下はL3で必要な意味fieldであり、最終JSON Schema・物理table・pathはL4/L5で既存schemaへ統合する。既存strict schemaに未知fieldを黙って追加せず、versioned wrapperまたはmigrationを設ける。

### 6.1 ExecutionTicket

| field群 | 必須の意味 |
|---|---|
| identity | schema version、project ID、stable ticket ID、revision、canonical digest （取込補足：識別と版）|
| source | requirement/design/PLANのexact ID・revision・digest。source HEADは出典であり実行HEADとは別 |
| work | primary responsibility、behavior contract、objective、scope、allowed/forbidden paths、artifact refs （取込補足：作業の意味と範囲）|
| dependency | predecessor Ticket ID/revision/digest、必要なterminal disposition、typed relation |
| acceptance | obligation refs、check/review/evidence/security policyのversion/digest付き参照 |
| constraints | 必要capability、risk、変更してよい範囲、approved budget ceiling等の上位制約への参照 |
| compiler | compiler policy/version/digest、入力source set digest |

`priority_class`の可変実行順位、release placement、測定policy、測定結果は外部bindingへ移す。上位要求が納期・risk等を意味制約として持つ場合のみ、その正規refをTicketへ含める。Release配置変更やscorer更新だけで仕事の意味が変わらないようにする。

### 6.2 Assignment / Attempt（取込補足：割当と試行）

AssignmentはTicket ref、owner/lane/runtime descriptor、execution namespace、branch/worktree、base/head、予算、capability snapshot、lease/fenceを持つ。read-only/evaluation経路で不要なbranch等は、明示的なprofile上の`not_applicable`として扱い、欠落と区別する。

Attemptは`attempt_id / assignment_ref / ticket_ref / started_at / completed_at / outcome / retry_lineage / actual_execution_snapshot / receipt_refs`を持つ。起動前拒否は`InvocationDenied`等として記録し、実際にproviderが起動したというreceiptを作らない。実行後にmodelやprofileが判明した場合は出典付き追補を行い、当初のrequested値を上書きしない。

### 6.3 MeasurementBinding / Episode / Receipt（取込補足：測定の束縛と証拠）

| record | 必須field群 |
|---|---|
| MeasurementBinding | subject Ticket ref、measurement policy/version/digest、capture mode、適用開始event/epoch、observation obligation ref |
| MeasurementEpisode | episode ID、mode、subject ref、execution ref、Assignment/Attempt refs、event sequence/checkpoint、source refs、availability/integrity state （取込補足：測定episodeの構成）|
| ActualExecutionSnapshot | requested/resolved model、provider/runtime/adapter versions、effort、team composition、profile/component digests、context/payload/toolchain/fixture/base refs、cache/seed/hardware/time window （取込補足：実際の実行条件）|
| MetricReceipt | episode/subject/Attempt refs、scorer/protocol/cohort refs、input event/receipt digest set、各metricの値/単位/分子/分母/欠測理由、観測窓、発行者provenance、receipt digest |
| OutcomeAmendment | 元closure/receipt ref、後日finding/rollback/recovery、帰属根拠と確度、観測日時、new assessment ref |

値の取得状態は`measured / estimated / unavailable / not_applicable / pending / censored`等で区別する。modelのsnapshot IDをproviderが公開しない場合は、requested alias、観測可能なdescriptor、時点、`version_unknown`を保持し、厳密な同一weightsの主張をしない。authoritative判断に必要な情報が不足する場合はqualificationを保留するが、観測そのものは破棄しない。

### 6.4 ExperimentDefinition / MeasurementRequest（取込補足：実験定義と測定要求）

ExperimentDefinitionは、subject/task snapshot、control/treatments、変更するfactor、固定条件、repeat/seed、allocation method、評価基準、scorer/protocol、warmup/cache、予算、stop rule、汚染policyを実行前に固定する。

MeasurementRequestは、trigger/event ref、subject snapshot、reason、requested mode、実験定義ref、scope/security eligibility、dedupe key、max attempts、予算予約ref、deadline、状態を持つ。ここから既存schedulerへ渡す際、新規実行が必要な場合だけ作業Ticket/Assignmentを合成する。

**二つのTicketを混同しない。** 追加評価を独立した作業としてTicket化した場合、`execution_ticket_ref`は評価作業、`subject_ticket_ref`は評価対象の開発仕事である。別の責務を同じTicketへ足さず、評価作業の完了で対象Ticketをcloseしない。既存runnerへsubject bindingを渡すだけで足りる場合、新しいTicket種別を増やさない。

### 6.5 一つの仕事からの接続例

```text
通常開発 T-42@r3
  └ A-1 → Attempt-1（失敗） → live Episode
          Attempt-2（修正） → live Episode → 正規closure

追加実験要求 MR-7（予算・権限あり）
  └ subject = T-42@r3 の作業開始前snapshot
     └ Experiment E-7
        ├ treatment=control, replicate=1 → 隔離Attempt-X
        ├ treatment=helix,   replicate=1 → 隔離Attempt-Y
        └ treatment=helix,   replicate=2 → 隔離Attempt-Z
           └ formal/shadow MetricReceipt
```

同じTicketから新たな実験を生成できるが、`live`の全eventが自動的に追加実験になるわけではない。完了後の修正patch、review答え、hidden oracleを再実行workerへ渡さない。

<!-- eta-source:6:end -->

<!-- eta-source:7:start -->
## 7. Execution Ticket機能要件（既存ID継承）

### HXT-FR-001 Canonical Ticket Record（取込補足：実行契約の正規記録）

Ticketはrepo/project-ownedなmachine-readable immutable recordとして保持する。logical ID、revision、source refs、scope、acceptance、digestを持ち、保存pathと分割は既存authority/migration規約に従う。GitHub viewやread-model rowを独立編集可能な正本にしない。

### HXT-FR-002 Semantic / Execution Contract分離

要求・要件正本、Design/PLAN、Ticket、Assignment、Attempt、Measurementを分離する。PLANの原子的変更統制は維持する。1 PLANから複数Ticketへ分解する場合も、各責務・成果物・受入・集約条件を明示し、Ticketを理由に巨大なPRや新しいWBS正本を正当化しない。

### HXT-FR-003 Deterministic Ticket Compiler（取込補足：決定的なTicket合成）

確定したRequirement IR、Design/PLAN、Responsibility、Verification Obligationとcompiler policyから同一入力に同一byte/digestのcandidateを生成する。AIによる分解案は候補であり、未確定objective/scope/acceptance/dependencyをcompilerが推測しない。Release配置・可変priority・measurement policyは生成物への外部bindingとする。

### HXT-FR-004 Ticket Admission（取込補足：実行契約の適格性検査）

candidateを既存policyでadmitする。承認済み意味の低リスク分解はpolicy委譲で自動化可能とする。意味変更・scope拡張・例外は必要なHuman Authorityへ戻す。個別の危険操作承認と意味承認を分け、一覧承認から実行順や追加課金の許可を推測しない。admit時に観測obligationを同時に束縛する。

### HXT-FR-005 Identity / Idempotency（取込補足：同一性と冪等性）

logical ID、contract revision、digest、source provenanceを分ける。同一確定入力の再生成を重複Ticketにしない。provider/model、割当、現在priority、scorerの変更はTicket改版理由にしない。意味変更・split・recoveryは新revision/lineageまたはtyped conflictとする。

### HXT-FR-006 Atomicity Admission接続

既存atomic-slice admissionのexactly-one behavior/responsibility、path/companion、scope expansion、no-code order、current blocker検査を再利用する。事前Ticketでは実diffや未来candidate HEADを捏造せず、計画scopeを検査する。実装後のactual pathとの照合は実diffを入力に再検査する。

### HXT-FR-007 Dependency Graph（取込補足：依存関係）

requires/split_from/integrates/verifies/supersedes/recovery_forをtyped relationとして扱う。missing、cycle、自己依存、stale revision/receipt、方向不整合はfail-closeする。単なるIssue closeではなく、その依存契約が要求する完了dispositionと証拠を解決する。固定4階層や全順序を導入しない。

### HXT-FR-008 READY Projection（取込補足：実行準備状態の投影）

admitted current contract、解決済み必要依存・gate・acceptance・riskを満たす集合を導出する。優先順位、現在capacity、競合lease、予算、capability freshnessによるdispatch可否は別projectionとし、取得不能をREADY/dispatch可へ推測しない。既存Work Graph/schedulerを使用する。

### HXT-FR-009 Assignment Exact Binding（取込補足：割当の厳密な束縛）

Assignmentはexactly-one Ticket revision/digestへ束縛し、actor/lane/runtime、実行場所、base/head、予算、lease/fence、capabilityを所有する。scopeやacceptanceを独自変更しない。provider交代は旧lease失効とhandoverを要求し、同一仕事ならTicketを作り直さない。

### HXT-FR-010 Lease / Fence（取込補足：排他と失効）

通常repoの一branch一writerとTicket revisionあたり一active変更Assignmentを維持する。expired/stale/foreign/wrong branch/worktree/headを拒否する。formal/shadowは別namespace・sandbox資源への権限しか持たず、本番leaseを借用しない。scope拡張はTicket再admissionを要する。

### HXT-FR-011 Work Graph接続

cell/delegation/acceptance receiptへTicket ID/revision/digestをversionedに結合する。Issueやbehaviorが同じでもTicketが違えば別仕事とする。既存dependency/conflict/parent acceptanceを複製せず、旧receiptは明示adapterで読む。

### HXT-FR-012 Startup Packet接続

通常HELIX実行ではTicket/Assignment/current authority/head/worktree/lease/rule/output schemaを起動直前に再照合し、sealed contextへ束縛する。formalのno_harness等では実験authorityと外側sandboxを共通に保ちながら、評価対象外のHELIX contextをworkerへ注入しない。各treatmentで実際に渡したpayload/構成のdigestを計測する。

### HXT-FR-013 ExecutionAttempt（取込補足：一回の実行試行）

一回の実行を独立recordとし、Ticket/Assignment、実際のruntime/model/effort/profile、input/packet/fixture/base/head、時刻、outcome、output/test/egress/review refs、retry lineageを保持する。requested/admitted/deniedと実際のprovider起動を区別し、全状態を観測イベントへ接続する。

### HXT-FR-014 Retry / Recovery（取込補足：再試行と復旧）

連続失敗・retry budgetはdurable eventと既存Recovery policyから導出する。session再開を初回扱いしない。台帳取得不能・上限超過は新規retryを止め、理由に応じてRecovery/Reverse/Requirement Re-entry/Human Requiredへ戻す。実験retryは本線retryと別budgetで数える。

### HXT-FR-015 Review / Evidence Closure（取込補足：検証証拠による終端）

通常変更のcloseはcurrent Ticket/Assignment、必要なexact-head CI/oracle/独立review、scope/lease/fence、証拠本体、必要なGitHub/DB read-afterで判定する。PR merge、CI green、LLM申告だけでは閉じない。測定eventのdurable記録は必要だが、分析dashboard更新・shadow結果・後日観測窓の終了は一般closeの待ち条件にしない。明示Release qualificationは既存Release policyに従う。

### HXT-FR-016 Lifecycle / Invalidation（取込補足：状態遷移と失効）

immutable contractと、admission/readiness/execution/dispositionの状態軸を分離し、eventからcurrent viewを導出する。BLOCKED/HUMAN_REQUIRED/RECOVERY_REQUIRED/QUARANTINED等を成功と混同しない。参照要求・scope変更はaffected範囲をstale化し、旧権限をfence後に再admitする。無関係更新や観測policy変更で全Ticketをsupersedeしない。

### HXT-FR-017 GitHub Projection（取込補足：GitHubへの投影）

Ticket採用済みscopeのIssue/Projectsは外部viewとし、編集はactor・対象revision付きproposalとして既存admissionへ戻す。現行Issue本文のhierarchy/dependency契約は明示cutover前まで維持する。一つのIssueが複数Ticketを示す場合はexact setを投影し、IssueとTicketを恒久1対1に固定しない。partial/pagination/raceは未収束として記録する。

### HXT-FR-018 Progress Projection（取込補足：進捗の投影）

正規Ticket/Assignment/Attempt/PR/CI/review/closure factsから進行を導出する。LLM申告、コメント時刻、Issue open率、branch数、手入力%を完成根拠にしない。Bench measurement coverage、実行成功率、要求完成率は異なる分母として表示する。

### HXT-FR-019 DB / Replay（取込補足：台帳と再生）

Ticket/event/dependency/assignment/attempt/closure/measurementのread modelを既存schema registryとwriterへ統合する。canonical source/eventから再構築してdigest一致を検証する。追加の独立authority DBや恒久dual-writeを作らない。read model再生成時に、別途保全されるべきcanonical journalを削除しない。

### HXT-FR-020 HELIX-Bench常設接続

HXB-FR-001〜020を本機能の必須接続とする。live観測をruntime bindingと同じ段階で開始可能にし、formal/shadowは別権限で起動する。既存task snapshotとTicketをversioned MeasurementBindingで結び、Ticketなしの既存benchはlegacy bridgeで継続可能とする。単一測定フラグや単発A/Bだけで本要件を完了としない。

### HXT-FR-021 Provider / Deployment Neutrality（取込補足：環境への非依存）

Ticketや比較カテゴリに特定provider/model/クラウド製品名を固定しない。実行時の選択・version・effortはAssignment/Attemptへ保持する。本改訂はHELIX本体の能力測定であり、Web化や計算資源federationを導入依存にしない。

### HXT-FR-022 Security（取込補足：安全境界）

Ticket・通常観測ログにsecret、credential値、PII、private transcript、hidden oracleを入れない。目的に必要なraw artifactはrestricted storeで管理し、redacted view/refを使う。危険操作・production・credential・外部通信等は既存Human/Execution/Security policyに従う。候補Security機構の未実装を許可と解釈しない。

### HXT-FR-023 Release接続

Release側がTicket exact set、system acceptance、compatibility、Bundle/Module/version、rollback、配布artifactを評価する。Ticket closeやBench scoreだけでqualifiedにしない。性能SLOが明示されたReleaseのみ、鮮度・coverage・比較可能性を満たすmeasurement receiptをrelease obligationに束縛する。

### HXT-FR-024 Portfolio / Management接続

READY/blocked/active、lead time、retry、cost、coverage、measurement integrity、placementを別軸でprojectionする。管理側はreclassify/split/replan/backflow等のproposalを作成できるが、Ticketの意味を直接上書きしない。評価結果の利用可否・配車順は既存policyから説明可能に導出する。

### HXT-FR-025 Compatibility / Retirement（取込補足：互換と廃止）

既存Issue/PLAN直接Assignment、旧team/pair/loop等は、実装とconsumerの確認後に一方向adapterへ縮退する。新規Ticket-required経路へのcutoverと旧in-flight完了を分ける。consumer-zero・損失ゼロ・replay/rollbackを証明後に旧direct authorityを削除し、historical reader/evidenceは保存する。不要な旧CLIの存在を要求しない。

<!-- eta-source:7:end -->

<!-- eta-source:8:start -->
## 8. HELIX-Bench接続機能要件（追加）

### HXB-FR-001 Resident Observationの全件接続

切替対象のTicket admission、dispatch待ち、InvocationDenied、Attempt開始・終了・失敗・中断、review/CI/closureを既存eventから継続取り込みする。観測処理は新しいLLM評価を暗黙起動しない。追加のAI判定が必要ならformal/shadowまたは通常の認可済み検証作業として明示する。観測対象総数、到達件数、欠測、遅延、対象外理由を常に出す。

### HXB-FR-002 Durable Event / Outbox / Checkpoint（取込補足：契約項目）

event ID、source stream/sequence、causation/correlation、subject/Attempt refs、payload digest、occurred_at/observed_atを保持する。既存writer/outboxへ接続し、at-least-once配信とconsumer冪等処理で二重計上を防ぐ。sequence gap、同一ID別payload、順不同を区別し、replayで収束させる。GitHub・filesystem・DB・providerを跨ぐexactly-once transactionを仮定しない。

### HXB-FR-003 Measurement Identityと実行条件

subject Ticket refと実行作業refを分ける。liveは通常同一、評価作業をTicket化した場合は別となる。experiment_id、treatment_id、replicate_id、attempt_idを固有に保持する。runtime/model/effort/profile/component/context/fixture/base/toolchain/cache/hardware/pricingの実測可能な状態をsnapshot化し、欠測を明示する。output/candidate HEADは処理結果であり、比較前の共通baseと混同しない。

### HXB-FR-004 観測義務の先行束縛とepisode終端

Ticket admissionまたはlegacy bridge登録時に、観測対象・policy・開始eventを束縛する。将来の測定結果を先に作らない。Attempt終了時に取得済みの最低限receiptを確定し、遅着CI/review/costは追補する。episodeにはprovisional/final/incomplete/quarantinedと観測窓を持たせる。分析完了を通常Ticket closeの循環依存にしない。

### HXB-FR-005 既存5カテゴリ・12指標の継承

HELIX-BENCH-R-01/R-02のexact setを維持し、意味・分母・window・採点versionを既存ownerへ追突する。新しいlive運用指標は補助telemetryとして分離し、12指標を勝手に置換しない。計算可能なmetricだけ値を出し、不適用/欠測/観測途中は理由付きにする。重大scope/security/data-loss/leakageは平均点で相殺しない。

### HXB-FR-006 Cost / Tokenの正規化

親・worker・verifier・CI・再試行・sandbox・観測処理の費用とtokenを取得可能な範囲で区分する。API実請求、subscription配賦、API相当推計、compute/CI/保存コストを混ぜず、source/currency/effective time/課金区分を記録する。欠測を0円へ変換しない。accepted changeが0のとき成功あたり費用や削減率を有限の成功値にしない。共有CI費用は配賦policyを固定し、二重加算しない。

### HXB-FR-007 Post-closure品質観測

閉じたTicketに後日見つかった不具合、rollback、Recovery、Requirement Re-entryを証拠付きrelationで接続する。時間的近接や同じpathだけで原因Ticketを断定しない。元のclosureは保存し、追補assessmentを新発行する。観測窓未満、未追跡、打切りを0 defectsとしない。一般Ticket closeを長期観測窓待ちにしない。

### HXB-FR-008 Cohort / 統計 / 因果境界

formalは同一task snapshot・fixture・共通base・protocol・scorer等の比較条件を満たすものだけを比較する。複数Ticketの集計は事前定義したresponsibility/task family/risk/難度等のcohort規則に従い、同じTicketと偽らない。割当方法、標本数、欠測、選択確率、反復のクラスタ、効果量/信頼区間、観測窓を記録する。liveの難しい仕事だけが高性能モデルへ回る選択biasを無視しない。前後比較だけで効果を断定しない。

### HXB-FR-009 Controlled Experimentとtreatment境界

既存4 profile(no_harness/rule_file_only/helix_partial/helix_full)とteam axisを維持する。Context Compilerのみ等はpartialのcomponent manifestとして表し、根拠なく第五profileを作らない。外側の安全sandboxと共通評価は全群に適用し、no_harness workerへHELIX task-lens/作業規律を注入しない。Fullから独立reviewを抜く実験はpartial/ablationとして隔離し、本番gateを弱めない。結果を見てoracle・scorer・stop ruleを有利に変更しない。

### HXB-FR-010 同一モデル反復と下位benchの再利用

同じprovider/model/worker identityでも、別treatment・別replicateを上位Experimentで識別して反復できること。既存worker-blind選定のprovenance重複拒否やworker/judge独立性を削除して対応しない。下位のsealed output/observation/judge検証を再利用し、同一候補の二重取り込みと正当な反復を区別する。同一結果を複製して標本数を増やさない。

### HXB-FR-011 Shadow Eligibility / 非汚染

実Ticketの作業開始前base・context許可集合・fixtureを保存し、適格性policyを通ったものだけ再実行する。本線のpatch、正解review、成功ログ、shared memory、他群cache、hidden oracleをworkerへ渡さない。既に解答を見たsessionを使わない。production/customer/secret/security-sensitive対象は原則除外し、追加認可されたsanitized fixtureだけを許す。snapshot化不能はskip reasonを残す。

### HXB-FR-012 イベント起点の測定要求合成

profile/context/adapter/model descriptor/scorer/fixture変更、evidence期限切れ、drift、明示Release obligation、manual request等をpolicyで分類し、必要なMeasurementRequestを生成する。subjectと変更digest、reason、measurement policy、time windowをdedupe keyへ束縛する。短時間の関連変更はcoalesceできる。measurement自身の完了を同じ実験の再発火原因にせず、cause/depth/budgetで再帰増殖を防ぐ。毎commit・毎Ticketの全組合せ再試験を強制しない。

### HXB-FR-013 予算・WIP・Backpressure

既存#214/#188のcapacity・quota・priorityへ接続し、本線と実験のbudget/queue classを分離する。sampling、max attempts/repeats、token/課金/CI時間、期限、最小evidence条件を事前policyに束縛する。追加実行前に上限を予約し、retryも累積予算へ算入する。料金/実行量上限を安全に評価できない場合は新規課金実験を保留する。無制限catch-up、無限retry、review lane占有を禁止する。

### HXB-FR-014 Projection / Rebuild / Reconciliation（取込補足：契約項目）

raw measurement eventとoriginal receipt参照から、Ticket別・responsibility別・profile別・model別・Release別read modelを再構築する。metric receiptはscorer/input set/as-ofへ束縛し、再採点は新versionとして保持する。legacy/current、live/formal/shadow、provisional/finalを分ける。event欠番や未照合参照を、取得不能のままconverged表示しない。

### HXB-FR-015 Capability / Routingへの証拠昇格

Benchはobserved/scored/qualified/expired等の証拠状態と改善候補を返す。既存registry/admission ownerが、task/risk/profile/descriptor、標本数、重大failure、鮮度、独立性を検査し、#188が現在capacity等と合わせて配車を決める。適切に委譲済みpolicy内の評価・更新は自動化でき、人間に毎回順序決定を要求しない。Benchから直接model切替・権限拡大を行わない。aliasしか不明な過去結果を現行weightsの保証にしない。

### HXB-FR-016 Degraded Measurement境界

分析sink/dashboard停止時は、audit eventが耐久記録できる限り本線を継続し、degraded/pendingとlagを表示する。上限付きspoolと再開処理を持つ。audit/authority/lease/必要evidenceを記録・検証できない場合は影響する新規変更を停止する。すでに行われた外部操作は未確定状態として照合し、失敗と決め付けた盲目的retryをしない。

### HXB-FR-017 測定データと評価権限の保護

source artifactを未信頼dataとして扱い、payload内の指示でcollector/judgeのpolicyを変更しない。redaction、secret scanning、最小data scope、restricted store、retention、access auditを適用する。hidden oracleは単に同じrepoの別directoryへ置くだけでなく、worker sandboxから読めないことを確認する。formal/shadowは隔離fixtureに必要なwriteのみを持ち、通常repo/credential/storeへ到達しない。

### HXB-FR-018 Legacy Bridge / Consumer Propagation（取込補足：契約項目）

既存Bench task snapshotには当初Ticket refがなくても、元task identityを保持したlegacy_subjectとして測定可能にする。後から正規mappingできた場合だけprovenance付きbridgeを追加し、過去結果を新Ticket時代の現行qualificationへ自動昇格しない。sourceと配布consumerでschema/policy/feature availabilityを整合し、未実装observerを稼働済みとして生成しない。

### HXB-FR-019 観測の運用性能と継続性

collector/replay/計算をbounded batch・incremental処理とし、開発critical pathに全履歴scanや全件実験を直列追加しない。CPU/I/O/保存量、durable append遅延、consumer lag、処理backlog、recovery時間を測る。規模baselineに基づくSLOを正本化し、未測定の閾値を確定値として扱わない。常駐性は再起動・重複配信・長時間運用の試験で検収する。

### HXB-FR-020 管理表示・成果判定・Release

managementへ成功率だけでなく母数、欠測率、mode、model/profile確度、revision、observation window、actual vs estimated cost、性能差の判定可能性を表示する。要求完成率と混同しない。性能改善、無効果、劣化、inconclusiveを全て有効な結果とする。Release性能要件を満たさない場合はそのownerへblocker/proposalを渡し、Bench自体がreleaseを許可しない。

<!-- eta-source:8:end -->

<!-- eta-source:9:start -->
## 9. 指標・比較・採点の契約

### 9.1 既存12指標を変えず接続する

以下の算式は、既存Bench契約へ接続するための明確化候補である。既存scorerとの意味差分があれば、同名で変更せずscoring versionを上げて承認・再freezeする。[S03]

| 既存metric | 入力／分母の固定 | live/formalでの注意 |
|---|---|---|
| Task Success Rate | declared evaluation unitの成功数／開始した評価unit数。retry内包のtask結果とAttempt成功率を別表示 | 未実行・起動前拒否もintake母数として併記。実行したと捏造しない |
| Scope Violation Rate | scope監査済みの評価unitにおける違反数／対象数 | 監査不能を無違反にしない。重大違反は独立flag |
| Requirement Drift Rate | pinned requirement refsとoutputの検証結果 | Requirement Re-entryの正規変更と無断逸脱を分ける |
| Design Trace Completeness | required traceの被覆数／対象obligation数 | 分母0はnot_applicable。リンク存在だけで妥当性を推測しない |
| Test Adequacy | versioned adequacy oracle、mutation set、対象test/behavior | テスト本数だけで品質を判定しない。共通oracleと内部工程を分ける |
| Review Blocker Count | unique finding IDとreview context/revision | 再掲を重複計上しない。review未実施を品質保証にしない |
| Review Rounds | protocolで定義したsubmitted candidate→reviewの往復 | 同一HEADのtransport retryは新roundでない |
| CI Rerun Count | workflow/attempt/input HEADと実行receipt | CI transport再配信と実rerunを区別する |
| Time to Lane Ready | 事前定義した開始event→Lane Readyまで | queue/依存/Human/capacity待ちを内訳化。未到達はcensored |
| Parent Token Reduction | paired baselineと同一task/protocol下の差 | baselineなし・分母0を削減成功にしない |
| Cost per Accepted Change | 対象cohortの総費用／accepted change数 | 失敗/再試行/検証費用も含める。費用欠測・accepted=0は未確定/undefined |
| Merge Acceptance Rate | declaredなeligible change数に対する正規受入数 | formalで本番mergeしない。実mergeと隔離acceptabilityを別fieldで扱う |

### 9.2 補助運用telemetry

追加するのは、first-pass acceptance、Attempt count、repair rounds、queue/active/review/Human待ち時間、escaped defects、rollback/Recovery、coverage、observer overhead、evidence freshnessなどである。これらは既存12指標のsilent renameではない。First-passの「初回」は最初のeligible candidateとし、内部で何度も修正した後の提出を隠さないためAttempt/repair回数を併記する。

跨process時間は`occurred_at`と`observed_at`を分け、process内のdurationは利用可能なmonotonic計測を優先する。clock skewで負の時間になる場合は0へ丸めずinvalid/unavailableを記録する。遅延した外部請求・CI・reviewは追補する。

### 9.3 効果比較の不変条件

同一モデルのHELIX効果を調べる実験では、model descriptor/effort、task/fixture/base、tools、hardware/resource budget、timeout/retry/cache、共通評価条件を固定し、harness/profile/componentだけを変更する。実際にresolvedされたmodel versionが不明な場合はその限界を表示する。チーム構成を変える場合は別factorとして記録する。

Ticket compilerそのものを変更して比較する場合、出力Ticket digestが異なることがある。この場合は同一digestだと偽らず、独立したtask snapshot、比較対象contract、意味等価性の検証refを実験定義に束縛する。scorer/protocolを同時変更した結果を旧scoreへ継ぎ足さない。

同一task内の反復を独立task数に水増ししない。比較方法、割当方法、minimum evidence、停止条件は事前定義する。shadowの選択bias、liveのrouting bias、時間依存のAPI変更を明示する。結果が弱い場合は`inconclusive`とする。

### 9.4 共通評価と本番の受入を分離する

通常HELIXのmergeには正規gateと独立reviewが必要である。一方、formalの全群は外側の共通evaluatorで同一rubricを採点する。raw workerがHELIX内部receiptを生成できないことだけを理由に品質0点へしない。

内部reviewの有無・traceの生成能力・統制遵守は、それぞれ宣言された評価軸として測定する。no_harnessが生成した変更にも、実験用外側evaluatorが行うテスト・独立審査を同条件で適用できる。ただし、そのreceiptを通常repoのmerge authorityとして流用しない。実験内でmerge rehearsalが必要なら隔離repositoryで行い、実mergeとは区別する。

<!-- eta-source:9:end -->

<!-- eta-source:10:start -->
## 10. Trigger・常駐継続・還流

### 10.1 Trigger matrix（取込補足：契約項目）

| event/条件 | 常駐consumer | 追加実験 |
|---|---|---|
| Ticket admission/dispatch/拒否 | 観測obligationと状態を記録 | それだけでは生成しない |
| Attempt/CI/review/closure | episodeを更新・追補 | sampling/drift policyが適用される場合のみ |
| compiler/context/rule/profileの変更 | affected execution条件を区別 | 影響task familyのbounded regression候補 |
| runtime/adapter/model descriptor変更 | 旧証拠の適用範囲・鮮度を再評価 | 必要なqualificationだけ生成 |
| 費用急変・failure drift | 観測根拠とcohortを保存 | policyで定義した校正候補 |
| 観測証拠の期限切れ | expired/pendingを表示 | 許可された再評価候補 |
| Releaseの性能受入要求 | receipt不足/不適合をownerへ報告 | 該当obligationの不足分のみ |
| 手動測定要求 | actor/provenanceを保存 | budget/権限を満たす場合のみ |
| measurement終了・consumer再配信 | 結果/チェックポイントを冪等更新 | 同じcauseから無制限に再生成しない |

### 10.2 最低限の運用可視性

consumer cursor、最後のdurable event、処理済みsequence、gap exact set、lag、pending episode、最古未処理event、retry/dead-letter、spool使用量をread-onlyで取得できること。単にprocessがaliveであることを「全Ticketを測定中」の証拠にしない。

### 10.3 障害時の境界

| 状態 | 通常開発 | formal/shadow | 証拠の扱い |
|---|---|---|---|
| dashboard/集計sink停止、durable journal正常 | 継続可 | 予算・必要記録条件を満たす場合のみ | pending/degraded。復旧後replay |
| cost実額の遅着 | 必要な実行権限は既存policyで判断 | 事前に安全な上限予約ができない追加課金は保留 | estimated/unavailableを併記。0円にしない |
| observer event gap | 正規auditが残るなら既存policyで継続 | 不足証拠に依存する新規実験は保留 | gapを記録しqualifiedにしない |
| 必須audit/lease/authority記録不能 | 影響する新規変更・危険操作を停止 | 新規起動停止 | scope限定incident/recovery |
| provider timeout・終了不明 | 状態照合まで盲目的再実行禁止 | 同左。累積予算を解放済みと推測しない | outcome_unknown/pending reconciliation |
| hidden oracle漏洩 | 影響実験を隔離。本線への漏洩も別incident | 結果失効・資格証拠から除外 | 記録は削除せず汚染理由付き保持 |

<!-- eta-source:10:end -->

<!-- eta-source:11:start -->
## 11. 非機能要件

### HXT-NFR-001 Determinism（取込補足：決定性）

確定入力のTicket生成・event再生・cohort/metric集計はbyte/digestで再現可能とする。LLM出力そのものの決定性を保証する要件ではない。

### HXT-NFR-002 Fail-close（取込補足：不明時の拒否）

identity/権限/scope/lease/必要受入証拠の不明は影響操作を拒否する。分析遅延の扱いはHXB-FR-016に従い、全開発停止へ広げない。

### HXT-NFR-003 Atomicity（取込補足：原子性）

admission/claim/lease/取消/closeは既存transaction/CAS等を使用する。外部I/Oはoutbox・idempotency・照合で扱い、分散exactly-onceを仮定しない。

### HXT-NFR-004 Replayability（取込補足：再生可能性）

Ticket、正規event、原receiptからcurrent read modelを再構築する。歴史証拠と現在資格を区別し、再生で権限や時刻を捏造しない。

### HXT-NFR-005 Portability（取込補足：環境間の可搬性）

Windows/Linux、source/consumerで同じ意味契約を検査できる。特定SaaS・クラウド・GPUを前提としない。

### HXT-NFR-006 Security（取込補足：安全性）

機密最小化、redaction、access audit、retention、sandbox境界、worker/judge独立性を強制する。fixture由来の指示をauthorityとしない。

### HXT-NFR-007 Observability（取込補足：観測可能性）

停滞・待ち・失敗・rework・測定欠損・鮮度・observer状態をtypedに観測し、運用者が対象Ticket/Attemptまで追跡できる。

### HXT-NFR-008 Migration Safety（取込補足：移行の安全性）

inventory-only → shadow_compile → dual-read/比較 → bounded canary → cutover → rollback window → consumer-zeroの条件を定義する。実験mode shadowとは命名を分ける。恒久dual-writeを作らない。

### HXT-NFR-009 Performance Evidence（取込補足：性能の実測証拠）

compile/admission、durable append、collector lag、READY再計算、DB rebuild、GitHub照合のSLOはbaseline測定後に確定する。計測器自身の負荷・費用も報告する。

### HXT-NFR-010 No Duplicate Authority（取込補足：正本の非重複）

要求、PLAN、Ticket、Assignment、Issue、read model、Benchの間に独立編集可能な同義正本を増やさない。現行ownerのparser/scorer/queue/schedulerを再利用する。

### HXT-NFR-011 Statistical Integrity（取込補足：統計の妥当性）

全試行の母数、repeatの関連、sampling/割当、欠測/打切り、観測窓を示す。事後除外や継続的な覗き見による恣意的停止で結果を盛らない。

### HXT-NFR-012 Bounded Cost（取込補足：有限費用）

追加実験は有限budget・最大retry・期限・capacity reservationを必須とする。unknown chargeを無料とせず、overrun/未確定請求も後続予約へ反映する。

### HXT-NFR-013 Provenance / Integrity（取込補足：出所と整合性）

canonical digest、issuer identity、source receipt検証、event sequence、clock/protocolを分離する。hash一致だけで実行・署名・許可を証明したとしない。

### HXT-NFR-014 Data Lifecycle（取込補足：データの保存期間）

raw/restricted artifact、metric receipt、event、derived viewそれぞれにretentionと削除権限を定義する。期限後にreplay可能な範囲と不可能な範囲を明示し、再現不能を隠さない。

<!-- eta-source:11:end -->
