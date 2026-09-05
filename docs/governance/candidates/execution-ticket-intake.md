---
title: "Execution Ticket要求の取込・衝突台帳"
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
related_issue: 1534
---

# 取込・衝突台帳

照合baseline: `b5178c34fe34c956a70713ad942b1f5b8f64e0ab`。原稿の調査時点と区別する。
本sliceは候補整理のみ。runtime、IR current projection、承認済み要件の上書きは非対象。

## 責務単位の照合結果

| 区分 | 照合先 | 取込方針・終端条件 |
|---|---|---|
| CONFLICT | resident-lane L3 §8 RLO-INV-001／§9、#819/#860 | Issue/PLAN択一からTicketへversioned scope別移行。旧in-flightは出典付き終端。未切替経路へ未知fieldを追加しない |
| REUSE | helix-bench-evaluation L3/L10、#251/#1295 | 5カテゴリ・12指標・4 profileは維持。PLANと文書状態はresolverで照合し、approvedと推測しない |
| REUSE | src/runtime/helix-bench-task-dataset.ts、#1294 | task snapshot15 fieldsを保持。Ticket一致だけで比較可能としない |
| UPLIFT | src/runtime/worker-blind-benchmark.ts、#225 | 同一provenance拒否／judge独立性を維持。反復は上位Experimentのidentityへ |
| GAP | #215/#499、#1295 | live intake・durable observation・checkpoint・coverageを既存event writerへ追加。別queueは作らない |
| REUSE | #861/#188/#214 | qualified evidenceをadvisoryとして渡す。Benchはdispatch／権限を変更しない |
| RETIRE | #865/#1098 | 旧direct engineの存在を要求しない。contextはadmitted execution pathへ。consumer-zeroまで履歴reader保存 |
| REUSE | #1500/#659 | version targetとRelease placementは既存Portfolioへ。未確定versionを作らない |
| CONFLICT | 原稿§2のL1要求表記 | L1企画、L2要求、L11受入、L12運用へ分離。L3↔L10は維持 |
| GAP | 原稿NFR001..014 | 既存90 ACへNFRを明示束縛。SLO値／retention期間は未確定として残す |
| CONFLICT | revision単位一writer | logical workの改版を跨ぐ旧権限失効を追加。二重writerの抜け道を閉じる |

旧HELIX repositoryはread-only tree inventoryを確認した。旧runtimeを採用する根拠にはしない。本差分は現行Assignment／Bench資産の接続でありbulk import対象なし。

## 出典の取扱い

以下の原稿ヘッダと§0/1/13〜18は追跡のため保存する。過去HEADでのIssue状態・完了言及は歴史調査記録であり、current readinessの根拠ではない。
実装順候補はhard dependencyや新しいroadmap正本へ自動昇格しない。

<!-- eta-source:header:start -->
# HELIX Execution Ticket Authority × HELIX-Bench 接続要求定義書

**文書ID:** HELIX-ETA-REQ-v0.2\
**対象:** `RetryYN/HELIX-HARNESS` 本体\
**作成日:** 2026-09-05 JST\
**改訂元:** `HELIX_EXECUTION_TICKET_AUTHORITY_REQUIREMENTS_v0.1.md`\
**今回の照合HEAD:** `16f930c4da06b35be44ae88871dd0f1e572b0c67`\
**状態:** 要求候補。意味承認・正本化・実装・運用開始は別判定。\
**目的:** Ticketを実行契約と測定の共通接続点にし、通常開発の常駐観測、制御実験、限定shadow評価を既存HELIX-Benchへ統合する。

> 通常開発は常時観測する。比較のための追加実行は、認可・予算・再現条件を満たす場合だけ行う。測定結果は既存の配車・能力評価・改善要求へ渡し、Bench自体には実行権限を持たせない。

<!-- eta-source:header:end -->

<!-- eta-source:0:start -->
## 0. 改訂内容と適用範囲

v0.1への追記集ではなく、接続を前提に整合性を見直した統合版である。`HXT-FR-001〜025`、`HXT-NFR-001〜010`、旧受入50件の追跡性を維持し、Bench接続責務を`HXB-FR-001〜020`、追加受入を`HXB-AC-001〜040`として分離する。要求番号・文書版は提案内IDであり、リポジトリの正規採番を代行しない。

| 論点 | v0.2の扱い |
|---|---|
| Benchの位置 | 完成後に行う試験だけでなく、Ticket admission・Attempt開始から観測義務を接続する |
| 常駐の意味 | 既存イベントの継続取り込み・再開可能な集計。常時LLMを追加起動する意味ではない |
| 観測と実験 | `live / formal / shadow`を分離し、相互の結果を混同しない |
| 仕事の同一性 | Ticketに加え、既存task snapshot・fixture・protocol・scorerを束縛する |
| 同一モデル比較 | worker identityを偽装せず、`experiment / treatment / replicate / attempt`を分離する |
| Ticketの生成 | 通常観測には追加Ticket不要。追加実験のみ既存schedulerで扱える作業へ変換する |
| 効果の主張 | 実運用相関と制御実験の効果推定を区別する。Ticket一致だけで因果効果を証明しない |
| 停止条件 | audit/authority欠落と分析基盤遅延を分ける。後者だけで全開発を停止しない |
| 後日不具合 | 元のclosureを改ざんせず、観測期間付きの追補評価として接続する |
| 導入順 | 常駐観測を後回しにしない。Ticket移行前の既存benchも動かせる一方向bridgeを設ける |
| 意味と実行権限 | 観測方針の承認を、外部通信・追加課金・本番実験・公開・merge許可へ拡張しない |

本版はHELIX本体の測定・チューニング要求である。HELIX Web、GPU federation、AWS/RunPod/Vast等の配備構想、特定モデルの採用、価格プランは非対象とする。

<!-- eta-source:0:end -->

<!-- eta-source:1:start -->
## 1. 照合結果と修正すべき前提

### 1.1 今回確認した事実

| 確認対象 | 確認内容 | 要求への影響 |
|---|---|---|
| main [S01] | 上記HEAD。PR #1524のSecurity候補merge | 候補格納とruntime完成を分ける |
| `PLAN-L3-49`／Bench L3 [S02][S03] | 5カテゴリ・12指標・4 profile・再現性・非汚染契約が存在。PLANはconfirmedだがL3ファイルのfrontmatterはdraft | この文書からcurrent authority昇格を推定せず、実装前に正規resolverで確定する |
| `#1294` [S04] | dataset/fixture実装Issueはclosed。runner・scoringは非対象 | dataset完了を常駐測定の完成としない |
| `#1295` [S05] | runner/scorer/raw receiptはopen。scheduled/manual bounded runを要求 | 常駐観測の追加要求を既存ownerへ接続する |
| `helix-bench-task-dataset.ts` [S06] | task ID/version、fixture、base、oracle、seed等のsnapshot契約が既存 | 「Ticketがないと同一仕事を比較できない」は言い過ぎ。欠けるのは通常開発との共通binding |
| `#225` [S07] | worker wrapper/context/blind admissionのIssueはclosed | worker選定ベンチを再実装せず、既存receiptを再利用する |
| `worker-blind-benchmark.ts` [S08] | provenanceが同じ候補の重複を拒否。judgeとworkerの同一性も検査 | 同一モデル・別profile・反復試行は上位の実験identityで扱う。独立review制約は維持 |
| `#861` [S09] | measured Runtime Capability Registryはopen。Bench evidenceはadvisory入力であり配車決定そのものではない | 結果を直接routerへ書き戻さず、既存評価・配車authorityへ渡す |

本版の確認は、改訂元全文と上記リポジトリ契約・コードの静的照合である。全branchの実行検証、CI再実行、provider呼出し、ローカル常駐processの稼働確認は行っていない。したがって「専用workflowがないから一切計測していない」「全repositoryで常駐要求が未定義」といった不在の断定はしない。

### 1.2 既存資産との接続先

以下はv0.1調査から継承する接続候補である。機構の存在・要求と、全経路の運用完成を同一視しない。実装時は対象HEAD・正規owner・最新Requirement revisionを再解決する。

| 責務 | 再利用する既存資産／owner | 本改訂が追加する差分 |
|---|---|---|
| 意味・原子性 | Requirement IR、PLAN、`atomic-slice-admission.ts` | Ticket identityと測定対象binding。PRの原子性を弱めない |
| 割当・排他 | `#860`、Assignment provider、Work Graph `#213`、branch監査`#1110` | Ticket revision/digest、Attempt identity |
| 実行入力 | `PLAN-L3-69`、worker context、startup`#1370` | Ticketからのscope投影と実際に渡したcontextのdigest |
| イベント耐久 | `#215/#499`、orchestration event、既存outbox/checkpoint | 観測イベントの型とconsumer checkpoint。別queue/DBの新設を前提にしない |
| worker検証 | `#225`、lifecycle/review/isolation receipts | 上位measurementとのjoin。既存seal・独立性を再利用 |
| Bench | `#250/#251/#1294/#1295` | live取り込み、実験binding、共通scoringへのbridge |
| 配車・継続 | `#188/#214/#819/#861` | 再評価要求、予算、evidence鮮度。別schedulerを作らない |
| 管理・配布 | `#1500`、Release Module/Bundle、Functional Release Slice | 測定coverage・性能推移・資格証拠のprojection |
| 安全 | Security Engagement、既存execution/risk/Human Authority | formal/shadowの専用境界。候補Security機能を完成済みとして使わない |

<!-- eta-source:1:end -->

<!-- eta-source:13:start -->
## 13. 導入・依存・リリース単位

以下は到達条件と依存であり、実行優先順位の手指定ではない。機械がcurrent dependency/readiness/WIP/priorityから順序を決定する。現在のConvergence Epochや既存Release計画へ配置し、別roadmap正本を作らない。

| slice | 内容 | entry / exit |
|---|---|---|
| A. Authority reconciliation | v0.1、Bench L3、現行IR、PLAN/Assignment/legacyのCollision Ledger。L1/L3/L10候補とowner割当 | 意味承認・正本化・main read-after・Requirement IR admissionが終わるまでruntime authorityは変更しない |
| B. Common binding / shadow_compile | Ticket schemaと既存task snapshot/Attemptへのversioned binding。追加実行なしの比較 | 決定性・旧ID対応・consumer互換・negative oracleを検収 |
| C. Resident observation canary | durableイベント・outbox・consumer・最低限receipt・coverage | Ticket bindingのbounded canaryと同じ段階で観測可能にする。daemon/transport障害・replayを検収 |
| D. Existing formal runner bridge | #1295のrunner/scorerと共通task/experiment/receipt契約を接続 | Ticket未採用taskもlegacy bridgeで継続可能。通常Ticket移行完成を循環依存にしない |
| E. Same-model qualification | profile/component manifest・同一モデル反復・独立採点 | 外側sandbox、汚染防止、cost/欠測、公平性を検収。Full有利な固定加点禁止 |
| F. Bounded shadow / event triggers | eligibility・sampling・dedupe・予算・期限・backpressure | source scopeの明示認可と既存schedulerで実行。全Ticket再実行は非対象 |
| G. Advisory feedback / management | #861/#188/#1500/Releaseへの証拠・coverage・drift projection | 鮮度・適用範囲・責務境界を維持し、Benchから権限を直接書き換えない |
| H. Cutover / retirement | source/consumer propagation、旧direct制御縮退、履歴reader保存 | new work切替、旧in-flight終端、rollback、consumer-zeroをそれぞれ検収 |

**依存を循環させない。** live observerはformal scorerが未完成でもevent/receiptを保存できる。既存formal runnerはTicket全面移行前でも測定できる。Ticketは将来の測定結果を待ってadmitしない。能力評価に最低evidenceが必要なworkerは既存baseline/canaryの正式経路で資格を得るのであり、無権限の本番試行でbootstrappingしない。

**展開の最小単位:** 一つのproject/責務/実行profileを対象とするcanaryを選び、scope別cutover receiptを持つ。全repo・全providerへの一斉有効化を前提にしない。各sliceのversion target、Module/Bundle/Functional Release Sliceは既存Portfolioから解決し、未確定のversion番号を本書で捏造しない。

<!-- eta-source:13:end -->

<!-- eta-source:14:start -->
## 14. v0.1との衝突解消・移行方針

| v0.1の箇所 | 問題 | v0.2での変更 |
|---|---|---|
| §1/§2「仕事identityが存在しない」 | Bench側には既にtask snapshotが存在する | 不足を「通常開発との共通binding」に限定 |
| HXT-FR-003 / Ticket schema | 可変priority/release placementまでTicketのimmutable内容に混在 | 外部policy/projection bindingへ分離 |
| HXT-FR-006 | Ticket生成前にactual diff/candidate HEADを必要とすると未来証拠を要求する | 事前scope検査と実diff後検査を区別 |
| HXT-FR-008 | READYにcapacity等を混ぜると意味revisionと瞬時状況が混在 | semantic readinessとdispatch eligibilityを区別 |
| HXT-FR-010 / 旧AC-010 | benchmarkを複数本番writerの例外と読める | 本番の一writerは不変。実験namespaceのみ並行可 |
| HXT-FR-012 / 旧AC-001 | 全経路にHELIX packet必須ではRaw比較にならない | 外側実験authorityは共通、worker向けHELIX注入はtreatment依存 |
| HXT-FR-015 | GitHub/CI等を非変更評価へ無条件必須化すると完了不能 | 通常変更と評価profileを分け、not_applicableと欠落を区別 |
| HXT-FR-016 / 旧AC-020 | source更新で全Ticketを一律supersedeすると再測定stormになる | affected ref/obligationで再検証。観測policy更新はTicket意味変更ではない |
| HXT-FR-017 | 既存Issue契約を即座に全てprojection扱いすると現行authorityと衝突 | scope別cutover。移行前契約を維持し、移行後はproposal入口＋projection |
| HXT-FR-019 | 全DBをprojection扱いすると耐久journalの正本まで失われ得る | event authorityとDB read modelの責務を明示 |
| HXT-FR-020 / Wave F | A/Bのみ、後段で計測開始 | runtime binding時からlive観測。formal/shadowと還流を別ownerへ接続 |
| 旧比較profile一覧 | 既存4 profileと新profile名が混在 | 4 profileを継承しcomponent ablationはmanifestで表現 |
| 同一Ticket digest比較 | 同じTicketでもmodel/cache/base等で条件が変わる | task/protocol/scorer/treatmentを併せて固定 |
| 下位worker-blind再利用 | 同じworker/modelの反復が重複provenanceとして拒否される | 上位Experimentで反復identityを分離。下位安全検査は維持 |
| 観測常駐化 | collector故障で開発停止、または記録欠損を隠す恐れ | durable auditとanalytics可用性を分離し、影響scope別に扱う |

旧recordは上書きしない。旧受入で使われたfixtureは各IDへ移行し、意味が変わったものにはmigration noteと改訂oracleを残す。未知fieldの追加を既存v1 schemaへ黙って通さず、consumer version検査・adapter・cutoverを設計する。過去receiptを新型へ読み替えただけでcurrent qualificationやHuman Approvalを得たことにしない。

<!-- eta-source:14:end -->

<!-- eta-source:15:start -->
## 15. 非対象・禁止事項

本要件では、別のCyber Harness、別のscheduler/queue、別の意味正本DB、固定4階層Ticket、1 commit=1 Ticket、人間PMだけが割当する構造、provider名をownerにする構造を追加しない。

全Ticketの多モデル再実行、毎commitの全組合せbenchmark、無制限課金、稼働中本番でのno_harness実験、Bench scoreによる自動要件改変、hidden oracleのworker配布、モデルの自己申告によるスコア、成功例だけの集計、測定を通すための独立review弱化を禁止する。

この文書はモデルweightsのfine-tuningや自己学習を要求しない。ここでいうHELIXチューニングはcontext、workflow、検証、実行構成等のシステム設定の効果測定と、正規policyによる改善を意味する。

<!-- eta-source:15:end -->

<!-- eta-source:16:start -->
## 16. 実装担当への投入指示

本書を要求候補として受理し、current Requirement IR、V4 Concept、PLAN-L3-69、HELIX-Bench L3/L10、Assignment/Work Graph、event durability、Runtime Capability、Routing、Portfolio/Releaseと衝突照合すること。

最初にREUSE / UPLIFT / GAP / CONFLICT / RETIREを責務単位で記録し、新しい独立基盤を作らず既存ownerへ割り当てる。Ticketに測定結果やmodelを詰め込まず、subject・execution・treatment・Attempt・measurementをexact refで結ぶ。live観測は追加LLM呼出し0、formal/shadowは有限予算・隔離・明示認可を必須とする。

L1/L3/L10候補、必要な既存要件差分、trace matrix、schema/adapter/migration案、受入fixtureを作成し、既存のplan固有意味承認・独立review・canonical promotion・main read-after・IR admissionを経てからruntimeへ降下する。技術reviewと人間意味承認の順序・必要条件はcurrent authorityへ従う。本書の作成依頼を意味承認済み・課金許可済み・外部公開許可済みと解釈しない。

優先順位・並列数・着手時期・release placementは機械が既存dependency/readiness/WIP/priority policyで決定する。現在の収束域を無断拡張しない。runtime bindingとlive observationのcanaryを整合させる一方、既存#1295のrunnerをTicket全面完成待ちにしない。異常・差分・未実装はtypedに残し、gate緩和や成功申告で埋めない。

<!-- eta-source:16:end -->

<!-- eta-source:17:start -->
## 17. 成果物・完了判定

要求/設計側では、Collision Ledger、L1/L3/L10差分、責務/trace matrix、Ticket/MeasurementBinding/Experiment/MetricReceiptのschema案、既存12metricとの対応、migration/cutover/rollback/retention、Release配置案を作成する。

実装側では、既存event/outbox接続、再開可能consumer、canonical receipt、cohort/scorer bridge、同一モデル反復identity、finite budget/trigger dedupe、source/consumer propagation、read-only運用表示を、scope別の原子的PRで検収する。

運用側では、通常canaryの全event追跡、重複/欠番/順不同/再起動回復、情報漏洩負例、予算強制、same-model比較、後日finding追補、registry/routingへのadvisory還流についてexact HEAD・input digest・実行receiptを提出する。実装完了、測定稼働、性能改善、商用配布可能は別々に判定する。

**本版の納品範囲は要求定義書であり、上記runtime実装・schemaコード・CI合格・性能改善を完了したという報告ではない。**

<!-- eta-source:17:end -->

<!-- eta-source:18:start -->
## 18. 出典と調査記録

元ファイル全文を読んだ上で、本版の差分を作成した。GitHubのIssueは調査時点の状態であり、コード参照は固定HEADに束縛している。Issue closeやPLAN confirmedだけでruntime稼働を証明していない。

- [S01] [main確認／固定commit](https://github.com/RetryYN/HELIX-HARNESS/commit/16f930c4da06b35be44ae88871dd0f1e572b0c67)

- [S02] [PLAN-L3-49: 評価契約の目的・下位bench非重複](https://github.com/RetryYN/HELIX-HARNESS/blob/16f930c4da06b35be44ae88871dd0f1e572b0c67/docs/plans/PLAN-L3-49-helix-bench-evaluation.md)

- [S03] [HELIX-Bench L3: 5カテゴリ・12指標・4 profile・protocol・scoring・cost・integrity](https://github.com/RetryYN/HELIX-HARNESS/blob/16f930c4da06b35be44ae88871dd0f1e572b0c67/docs/design/helix/L3-requirements/helix-bench-evaluation.md)

- [S04] [#1294: task dataset/fixtureの完了Issue](https://github.com/RetryYN/HELIX-HARNESS/issues/1294)

- [S05] [#1295: runner/scorer/raw receiptのopen Issue](https://github.com/RetryYN/HELIX-HARNESS/issues/1295)

- [S06] [task snapshot既存型・dataset validator](https://github.com/RetryYN/HELIX-HARNESS/blob/16f930c4da06b35be44ae88871dd0f1e572b0c67/src/runtime/helix-bench-task-dataset.ts)

- [S07] [#225: worker descriptor/context/blind admission](https://github.com/RetryYN/HELIX-HARNESS/issues/225)（取込補足：下位worker検証の参照）

- [S08] [worker-blind-benchmark: provenance重複判定・独立judge](https://github.com/RetryYN/HELIX-HARNESS/blob/16f930c4da06b35be44ae88871dd0f1e572b0c67/src/runtime/worker-blind-benchmark.ts#L313-L411)

- [S09] [#861: Runtime Capability RegistryとBench advisory境界](https://github.com/RetryYN/HELIX-HARNESS/issues/861)

- [S10] [#251: 既存評価契約のscope/指標/再現性](https://github.com/RetryYN/HELIX-HARNESS/issues/251)

改訂元SHA-256: `f2127de0d6fe31a2aa8e1b547d0988d65568c8c79dd95960aade9b5767ddca02`。

既存Issue番号の接続先は設計時の再確認対象である。本文のHXT/HXB番号は本提案内の追跡IDであり、新規Issueの発行・repoへの書込み・意味承認は実施していない。
<!-- eta-source:18:end -->
