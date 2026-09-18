---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-FRM-03
group: 枠
product: HARNESS
atoms_primary: 210
atoms_secondary: 134
issue_projection: #1858
---

# RUL-FRM-03（枠／HARNESS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

変更の種類（新規、追加、修正、refactor、retrofit、reverse、PoC、research）ごとに進む経路を一つに決め、途中で意味の変更を検出したら正しい経路へ戻す。

## 主として対応づいた規則（210件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-116` | Refactor Scoutはbehavior-invariantと判断できない候補やpublic API変更をrefactorとして提案せず、Add-feature・Retrofit・Troubleshoot・Reverseへ振り分ける。 | escalation_authority | prose | .claude/agents/refactor-scout.md:18-18; .claude/agents/refactor-scout.md:54-55 |
| `RA-194` | エージェントはScrum・PoCをS0 backlog→S1 plan→S2 poc→S3 verify→S4 decideの順で進める。 | process_gate | prose | AGENTS.md:158-158; CLAUDE.md:295-295 |
| `RA-196` | product要求・設計・実装は正規Forwardで進め、管理Scrumを実装の近道にしない。 | process_gate | prose | AGENTS.md:161-161; CLAUDE.md:297-297 |
| `RA-198` | 追加変更では既存設計を保ち、add-design・add-implでdeltaを追加する。 | process_gate | prose | AGENTS.md:164-164 |
| `RA-204` | kind=add-implのPLANは必要なReverse pairingを持つ。 | process_gate | prose／lint | .claude/CLAUDE.md:56-56 |
| `RA-231` | refactor実行者は新behaviorやそのtestを追加せず、既存test網を変更なくgreenに保つ。 | process_gate | prose | .claude/commands/code-simplify.md:21-22 |
| `RB0-024` | refactor担当者はcharacterization→契約導入→dual-green→consumer個別移行→consumerゼロ確認→旧削除の順に可逆stepで進める。 | process_gate | prose | docs/governance/coding-rules.md:29-31; docs/governance/ddd-tdd-rules.md:31-33 |
| `RB0-059` | refactor担当者は公開behavior・schema・migration・失敗意味の変更を検出したらrefactorを止め、該当する開発経路へ戻す。 | process_gate | prose | docs/governance/ddd-tdd-rules.md:31-33; docs/governance/ddd-tdd-rules.md:119-120 |
| `RB0-114` | boundary作成者はDiscoveryやPoCを実施することだけを理由にworkflow_styleを変えてはならない。 | process_gate | prose | docs/governance/worker-context-boundary-operator-guide.md:67-68 |
| `RB02-001` | PLAN別V-pair bindingのrecoveryAuthorityを適用する側は、適格なPLAN種別をrecoveryに限定する。 | process_gate | config | config/plan-specific-vpair-binding-authority.json:2303-2306 |
| `RB04-027` | タスク分類は実装を止めるgateにせず、経路・orchestration・レビュー強度・skill選択の事前分類に使用する。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:225-233 |
| `RB04-034` | harness自身の開発にはHELIX Wを適用せず、単一Vで進める。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:354-361 |
| `RB04-039` | 各開発modeの作業者は出口をForward主線へ合流させ、screen-design/frontend-designは独立経路でなく工程専門として運用する。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:408-429 |
| `RB04-040` | 設計の実現性・妥当性が紙上で確定できない場合、作業者は確証を装ってfreezeせずDiscoveryを起票し、設計・仮実装・検証を経て確定する。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:428-428 |
| `RB04-041` | 将来版へ能力を保全する作業者は新kindを作らず、既存kindとstatus=draft限定のversion_targetで表し、活性化時にAdd-featureへ合流する。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:423-430 |
| `RB04-042` | routing機構はschema/contract driftをReverse、構造的負債をRefactor、依存・基盤・設定更新をRetrofitへ振り分け、upgradeではpreflightを要求する。 | process_gate | config | docs/governance/helix-harness-concept_v3.1.md:439-445 |
| `RB04-043` | routing機構は暴走・context枯渇・開発中回帰・強制停止をRecoveryへ振り分け、提案まで自動化し起票は人間のyesを待つ。 | escalation_authority | prose／config | docs/governance/helix-harness-concept_v3.1.md:446-446 |
| `RB04-044` | routing機構は本番障害・hotfix・本番回帰を承認必須のIncidentへ振り分け、prodやregression系を優先してIncident/Recoveryへ倒す。 | escalation_authority | prose／config | docs/governance/helix-harness-concept_v3.1.md:447-456 |
| `RB04-045` | routing機構は機能追加をAdd-feature、将来保全をversion-up、要件・成功条件・設計の不確実性をDiscovery、机上の技術比較をResearchへ振り分ける。 | process_gate | config | docs/governance/helix-harness-concept_v3.1.md:448-453 |
| `RB04-047` | routing機構は継続的feedbackのsignalだけでProduction Scrumへ切り替えず、選択済みstyle・lifecycle・影響に従って変更を振り分ける。 | process_gate | config | docs/governance/helix-harness-concept_v3.1.md:451-451 |
| `RB04-048` | 割込み検出時は、重大・暴走をRecovery、要件未確定をDiscovery、軽微追加をAdd-feature、設計ギャップを該当Forward層へ戻す。 | process_gate | config | docs/governance/helix-harness-concept_v3.1.md:454-454; docs/governance/helix-harness-concept_v3.1.md:503-503 |
| `RB04-049` | 優先度判定は不確実性低・影響低を提案のみ、不確実性低・影響高を即PLAN、不確実性高・影響低をDiscovery先行、双方高を緊急routingとする。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:458-463 |
| `RB04-073` | 実装者は着手前に既存資産の流用候補を確認し、同等機能がある場合は再実装せずAdd-featureまたはRefactorへ回す。 | behavior_discipline | prose／lint | docs/governance/helix-harness-concept_v3.1.md:643-645; docs/governance/helix-harness-concept_v3.1.md:747-747 |
| `RB04-076` | UATで要求変更が生じた場合、作業者はL3要件をadd-design、L1業務要求をkind=designで扱い、既存docを直接変更しない。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:654-654 |
| `RB04-077` | デプロイ後検証で本番回帰が出た場合はIncidentへ、軽微な設定ミスは再デプロイへ接続する。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:656-656 |
| `RB04-107` | CIはpocからmainへの直接PRをブロックし、S4 confirmed後にReverse R0-R4を経由したfeature経路へ接続させる。 | review_merge | ci | docs/governance/helix-harness-concept_v3.1.md:964-966 |
| `RB05-065` | 設計判断ではdevelopment style、case-driven model、専門工程を直交させ、旧L0–L14分類やPRODUCTION_SCRUM_REDUCED_Vをcurrent判定へ戻さない。 | process_gate | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:240-246 |
| `RB05-078` | flat PLAN実移行はG3でtarget契約をfreezeし、L5契約成立後に専用migration PLANとdual-greenを使って実施する。 | process_gate | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:383-384 |
| `RB05-085` | refactor warningはpredecessorを方式参照に留めて実装済み扱いせず、新規sliceでbehavior fence、implementedまたはaccepted-debt receipt、feedback dispositionを順に閉じる。 | process_gate | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:470-474 |
| `RB05-106` | 既存設計を修正してForward実装へ進む場合は、第一級Redesign駆動モデルを経由する。 | process_gate | prose | docs/governance/infinity-loop-source-capability-ledger.md:48-48 |
| `RB05-138` | Redesign routerはL1/L2へ影響する変更でpairとscreen receiptをstale化し、再freeze前の実装claim・Forward合流を拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:32-33; docs/governance/infinity-loop-system-assertion-cases.md:363-363; docs/governance/infinity-loop-system-assertion-cases.md:387-387 |
| `RB05-212` | 設計refactorでobservable behavior・public contractが変わる場合はRedesignへ、DB state semantics・schema migrationが変わる場合はRetrofitへ再振り分けする。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:195-196; docs/governance/infinity-loop-system-assertion-cases.md:217-218; docs/governance/infinity-loop-system-assertion-cases.md:326-327; docs/governance/infinity-loop-system-assertion-cases.md:333-333; docs/governance/infinity-loop-system-assertion-cases.md:355-355 |
| `RB05-245` | Ledger Design Refactorはbefore/after diffとprovenance・consumer oracleから最小candidateを生成し、空diff・provenance欠落・pairを壊すsplitを拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:322-324; docs/governance/infinity-loop-system-assertion-cases.md:332-332; docs/governance/infinity-loop-system-assertion-cases.md:401-401 |
| `RB05-314` | workflow分類はtyped axisだけを使い、共通route identityとlegacy identityの出力を禁止し、曖昧な分類をfail-closeする。 | process_gate | config | config/workflow-classification-catalog.v1.json:12-17 |
| `RB05-316` | Discovery/PoCはS0〜S4で不確実性と実現性を検証し、S4判断後だけ選択済みdevelopment styleへ接続する。 | process_gate | config | config/workflow-classification-catalog.v1.json:43-51 |
| `RB05-317` | 外部契約・要求・受入条件を変更するRedesignでは再freezeし、Performance Refactorは設計を保ちmeasurement契約付きで実施する。 | process_gate | config | config/workflow-classification-catalog.v1.json:119-143 |
| `RB05-319` | workflow分類器はdriftをREVERSEへ、debt_degradation・code_smell・structuralをREFACTORへ振り分ける。 | process_gate | config | config/workflow-classification-catalog.v1.json:292-308 |
| `RB05-320` | workflow分類器はdependency_outdated・upgrade・config_driftをRETROFITへ振り分ける。 | process_gate | config | config/workflow-classification-catalog.v1.json:309-317 |
| `RB05-321` | workflow分類器はagent暴走・context枯渇・開発退行・強制停止をRECOVERYへ、本番incident・hotfix・本番退行をINCIDENTへ振り分ける。 | process_gate | config | config/workflow-classification-catalog.v1.json:318-337 |
| `RB05-322` | workflow分類器はfeature追加・scope拡張・指定pair-agent TDD関連signalをADD_FEATUREへ、version_deferralをVERSION_UPへ振り分ける。 | process_gate | config | config/workflow-classification-catalog.v1.json:338-356 |
| `RB05-323` | workflow分類器は要求未定義・実現性不明・成功条件不明・設計不確実をDISCOVERY_POCへ、技術判断・選択肢比較・ADR要求をRESEARCHへ送る。 | process_gate | config | config/workflow-classification-catalog.v1.json:357-375 |
| `RB05-324` | user feedback反復・要求継続改訂・interruptはIMPACT_CLASSIFICATIONへ送り、判断が出るまでunresolvedを維持する。 | process_gate | config | config/workflow-classification-catalog.v1.json:376-384 |
| `RB05-354` | bottom-up Add-featureは実装・test後にR0〜R4とV-model整合を行い、implementation green・Reverse fullback・G7 trace閉包を終了条件とする。 | process_gate | config | config/drive-route-catalog.json:110-122 |
| `RB05-355` | Refactorはbaseline・micro change・regression・設計refactor gateの順に進め、挙動不変・複雑性非増加・regression greenを終了条件とする。 | process_gate | config | config/drive-route-catalog.json:127-139 |
| `RB05-370` | 外部契約または挙動変更を検出した場合はRefactorを停止し、Forward・Add-feature・Reverseのいずれかへ再分類する。 | process_gate | config | config/drive-route-catalog.json:288-294 |
| `RB05-371` | 設計freeze前は機能・性能を落とさず設計と見込みcode量を最小化し、意味変更はredesignへ送る。 | process_gate | config | config/drive-route-catalog.json:297-312 |
| `RB05-372` | 性能改善をRefactorで扱うのは外部意味とSLOを保つ場合だけとし、SLO変更はAdd-featureへ送る。 | process_gate | config | config/drive-route-catalog.json:315-321 |
| `RB05-373` | security findingは本番影響ならIncident、開発中correctnessならRecovery、正本driftならReverse、予防強化ならAdd-featureへ送る。 | process_gate | config | config/drive-route-catalog.json:324-330 |
| `RB05-374` | NFR failureは影響と契約変更の有無でIncident・Recovery・Refactor・Add-featureへ分岐する。 | process_gate | config | config/drive-route-catalog.json:333-339 |
| `RB05-375` | measurement findingはcorrectness failure・性能改善・契約変更へ分類して対応routeへ送る。 | process_gate | config | config/drive-route-catalog.json:342-348 |
| `RB06-098` | routingは既存設計欠陥の修正をRedesign経由にし、Redesignを経ないForward実装を拒否する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:35-35 |
| `RB06-105` | intakeはGitHub eventとuser差し込み指示を、mode・Reverse・Forward target付きcontractへ正規化する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:42-42 |
| `RB06-114` | Design Refactorはbehaviorとpairを保存する最小変換だけを受理し、contract・state・public契約変更を別routeへ送る。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:51-51; docs/governance/infinity-loop-assertion-coverage-ledger.md:118-118 |
| `RB06-122` | WorkflowContractRouterは工程bindingのedge欠落を拒否し、ScrumからForwardへはS4後だけ戻す。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:58-58; docs/governance/infinity-loop-assertion-coverage-ledger.md:124-124 |
| `RB06-138` | screen適用判定はno-UIに完全receiptを要求し、UI scopeをPrototype Discovery taskへrouteする。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:85-85 |
| `RB06-148` | semantic rename判定はI/O・副作用・failure・state・call graph・consumer oracleで同義と異義を判定し、文字列類似だけの候補を拒否する。 | behavior_discipline | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:107-107; docs/governance/infinity-loop-assertion-coverage-ledger.md:182-182 |
| `RB06-182` | Refactor Gateはsemantic・構造証拠、全consumer、最小性、behavior invariant、rollbackを欠く共通化・外部化候補を拒否する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:182-182 |
| `RB06-198` | route graph検査はForwardへの有限到達、終端、内部一意性、工程専門exact setを検査し、出口があってもcycle・self-loopを拒否する。 | process_gate | doctor | docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md:33-36 |
| `RB06-200` | Design Refactor担当者は意味変更をsilentに吸収せず、Redesignの判断へ送る。 | process_gate | prose | docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md:54-54 |
| `RB06-202` | 分類者は類似名だけで新modeを増やさず、入口状況を変えるものをroute、特定層の必須成果物を作るものを工程専門、成果物選択やruntime構成を補助軸にする。 | behavior_discipline | prose | docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md:93-104 |
| `RB06-259` | PLAN作成者は必須task/docの固定スケルトンと該当駆動モデルを合成し、駆動成果をForwardへ合流させる。 | process_gate | prose | docs/governance/gate-design.md:46-54 |
| `RB06-261` | fail routingは障害をIncident、暴走をRecovery、driftをReverse、劣化をRefactorへ送り、優先度をIncident、Recovery、Reverse、Refactorの順とする。 | process_gate | prose | docs/governance/gate-design.md:77-77 |
| `RB06-309` | routingはdesign_driftをReverseへ送りpreflightなしでauto-applyせず、version_deferralをversion-upのfuture backlogとして保持する。 | process_gate | prose | docs/governance/helix-l0-l8-design-consistency-audit.md:89-91 |
| `RB07-005` | 担当者はgovernance障害を重大度に応じてRecovery PLANまたはinline fixへ送り、関連設計文書を更新する。 | process_gate | prose | docs/skills/debugging-and-error-recovery.md:69-72 |
| `RB07-006` | 担当者は実装不具合を重大度に応じてRecovery PLANまたはerror-fixのinline修正へ送る。 | process_gate | prose | docs/skills/debugging-and-error-recovery.md:69-74 |
| `RB07-019` | GitHub運用guardはpoc/*からmainへの直接mergeを禁止する。 | review_merge | prose／gate | docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:94-104; docs/governance/helix-harness-upstream-reconciliation-audit-2026-07-07.md:151-151 |
| `RB07-032` | API callが外部IF設計と一致しない場合、担当者は継続前に契約差分のadd-design PLANを起票し、相違を黙認しない。 | process_gate | prose | docs/skills/browser-testing-and-screen-verification.md:91-94 |
| `RB07-085` | PoC担当者はproduction工程へ進む前にdecision outcomeをPLAN stateと.helixへ記録する。 | process_gate | prose | docs/skills/poc.md:24-28 |
| `RB07-087` | PoC担当者はS2でtests/pocまたは隔離branchに実験を作り、S3で受入条件に照らしたreviewとhelix reviewを行う。 | process_gate | prose | docs/skills/poc.md:43-44 |
| `RB07-090` | PoCがconfirmedの場合、担当者は選択済みdevelopment styleの後続PLANを作成してPoCへの依存を記し、PoC自体をdevelopment styleへ読み替えない。 | process_gate | prose | docs/skills/poc.md:98-100 |
| `RB07-092` | 担当者はconfirmed判断に基づく正式PLANが作られるまでspikeをsrcへmergeしない。 | review_merge | prose | docs/skills/poc.md:105-106; docs/skills/poc.md:119-120 |
| `RB07-137` | debt解消担当者は欠けた設計・テストを修復してからdebt_reason内の修正を行い、型・lint・test・doctor・reviewの確認後に完了と継続状態を更新する。 | process_gate | prose | docs/skills/debt-register.md:89-100 |
| `RB07-141` | Refactor PLANは新しいFR機能を追加せず、必要なら別add-impl PLANを作る。 | behavior_discipline | prose | docs/skills/debt-register.md:120-121 |
| `RB07-174` | 管理者はForwardの層降下順を守り、Add-featureへReverse back-fill依存を付け、Recoveryでは影響PLANと解除順を先に定める。 | process_gate | prose | docs/skills/project-management.md:102-104 |
| `RB07-176` | 管理者はDiscoveryをS0〜S4でtime-box化しS4 outcomeを必須とし、Scrum境界では継続projectionをコードと照合する。 | process_gate | prose | docs/skills/project-management.md:106-107 |
| `RB07-216` | 計画者はFRごとに1 PLANとし、Add-featureへReverse back-fill依存を付け、PoC工程をS2・S3へ明示対応させる。 | process_gate | prose／lint | docs/skills/planning-and-task-breakdown.md:90-95 |
| `RB07-233` | 設計者は3種development styleとDiscovery・PoCを別軸で適用し、case-driven証拠をproduction工程の代用品にしない。 | process_gate | prose | docs/skills/design-tailoring.md:37-39 |
| `RB07-236` | PoC設計者は仮説と成功判定に粒度を限定し、productionではFR・BRをID化してtestへtraceし、高信頼案件ではthreat model・incident runbook・rollback設計を省略しない。 | process_gate | prose | docs/skills/design-tailoring.md:59-64 |
| `RB07-328` | 修正担当者は設計を読んでlogic error・誤spec・missing guardを分類し、誤specは設計から、missing guardは設計とtest設計から先に修正する。 | process_gate | prose | docs/skills/error-fix.md:47-56 |
| `RB08-012` | Refactor担当者は外部観測可能な挙動を変更せず、public API・state・DB schemaを変える変更はAdd-featureまたはRetrofitへ送る。 | process_gate | prose | docs/skills/refactoring.md:19-22; docs/skills/refactoring.md:82-84 |
| `RB08-017` | Refactor担当者はrefactor中にテストを追加・削除せず、baselineと同じgreen件数を確認する。テスト追加は別のTDD・Add-feature・Reverse作業へ送る。 | behavior_discipline | prose | docs/skills/refactoring.md:64-65; docs/skills/refactoring.md:93-94 |
| `RB08-025` | PLAN作成者はUncertainty=3のまま実行を約束せず、先にresearchまたはPoC PLANへ切り出す。 | process_gate | prose | docs/skills/estimation.md:57-58 |
| `RB08-103` | Discovery担当者はS1で入口層・W-model要否・主要unknown3件をmemoにし、S3前に正式設計書へ昇格する。 | process_gate | prose | docs/skills/system-design-sizing.md:69-77 |
| `RB08-154` | Reverse担当者は実装のみならcode、設計と実装のずれならdesign、依存更新の影響不明ならupgrade、名称構造driftならnormalization、Scrum等の昇格ならfullbackを選ぶ。 | process_gate | prose | docs/skills/reverse-analysis.md:30-38 |
| `RB08-169` | PoC担当者はS2の境界sketchをS3前に検証証拠へ束縛し、採択後に正規L2/L3設計へ昇格してgeneratesから参照する。 | process_gate | prose | docs/skills/api-and-interface-design.md:78-83 |
| `RB08-220` | 工程選択者はForward spine・delivery route・drive model・kind・専門職drive・execution mode・専門workflowを混同せず、Feature/Updateでrouteを代替しない。 | process_gate | prose | docs/governance/drive-route-catalog.md:10-24 |
| `RB08-221` | route管理者は機械catalogを経路集合の正本とし、Forward・Scrum・Hybrid・Discovery・Reverse・Add-feature A/B・Refactor・Retrofit・Recovery・Incident・Research・version-up・OperationVerification・design-bottomupをexact setで保持する。 | tooling_runtime | prose | docs/governance/drive-route-catalog.md:26-44 |
| `RB08-222` | 工程選択者はsignal競合時、production障害、開発状態破損、正本不一致、不確実性、基盤移行・構造改善、新機能の順でrouteを判断し、該当signalなしはForwardを既定とする。 | process_gate | prose | docs/governance/drive-route-catalog.md:46-57 |
| `RB08-223` | design-bottomup担当者はこれを実装先行Route Bと同一視せず、不確かな体験意味をDiscovery S4へ送り、確定後に正規設計とpairへ接続する。 | process_gate | prose | docs/governance/drive-route-catalog.md:59-61 |
| `RB08-227` | drive担当者はmerge_targetsへ必ず接続し、mode内だけで完成を主張せず、next_routes外の遷移を暗黙実行しない。 | process_gate | prose | docs/governance/drive-route-catalog.md:79-82 |
| `RB08-231` | 工程管理者はscreen-designをL2/L11の要求・prototype工程、frontend-designを実装後L10/L3の実測review工程として扱い、独立modeへしない。 | process_gate | prose | docs/governance/drive-route-catalog.md:88-93 |
| `RB08-288` | 新規・更新conditional-kind PLANの担当者はReverse backfillを結ぶか、backprop不要の判断と具体理由を宣言する。欠落はbackfill-pairingで拒否する。 | process_gate | lint | docs/governance/conditional-backfill-decision-audit-2026-06-22.md:3-10; docs/governance/conditional-backfill-decision-audit-2026-06-22.md:64-66 |
| `RB09-025` | #1040の担当者は、#204・#234・#235のaxis／lifecycle接続成立を入口条件としてREFACTORING specialist workflowを進め、終端証拠としてRF0〜RF6 exact setとroute混同拒否を揃える。 | process_gate | prose | docs/governance/system-synthesis-rollout-roadmap.md:9-15 |
| `RC01-087` | propagationは、Conceptとrequirementsのrouting表から抽出したsignal集合が双方向に一致しない場合、不合格にする。interrupt行は比較対象から除く。 | process_gate | lint | src/lint/propagation.ts:27-50; src/lint/propagation.ts:61-74 |
| `RC01-094` | coding-rulesは、workflow文書の検査入力がある場合、必須のcoding-rules・Forward・Add-feature文書のいずれかが存在しないと不合格にする。 | process_gate | lint | src/lint/coding-rules.ts:206-249; src/lint/coding-rules.ts:526-539; src/lint/coding-rules.ts:559-562 |
| `RC01-095` | coding-rulesは、検査対象の規律正本文書にWorkflow Placement・Forward L6・Add-featureの必須patternが欠ける場合、不合格にする。 | process_gate | lint | src/lint/coding-rules.ts:207-217; src/lint/coding-rules.ts:540-547 |
| `RC01-097` | coding-rulesは、検査対象のAdd-feature文書に規律marker・正本path・add-design・add-implの必須patternが欠ける場合、不合格にする。 | process_gate | lint | src/lint/coding-rules.ts:231-248; src/lint/coding-rules.ts:540-547 |
| `RC01-157` | 共有source-ledger意味検査は、workflow_route_impactに値がある場合、noneまたは指定workflow・gate・layer名を含まなければ違反を返す。 | process_gate | lint | src/lint/shared.ts:135-137; src/lint/shared.ts:203-209 |
| `RC02-029` | doctorのscrum-reverse checkは、redesignを除くconfirmed PoCのReverse孤児、未confirmed PoCへのReverse参照、または読込失敗がある場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:675-699 |
| `RC02-077` | doctorのdrive-model-binding checkは、必須12候補・登録入口10件・選択状態・trigger・action・依存関係・Forwardのblocked状態・Reverse復帰情報・運用検証被覆・再検証commandの契約違反、または投影不能で失敗する。 | process_gate | doctor | src/doctor/index.ts:2719-2941 |
| `RC02-100` | doctorのplan-entry-routing checkは、DB由来PLAN・baseline・旧workflow identity inventoryを使うrouting検査が不合格、またはlint不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4806-4829 |
| `RC02-108` | doctorのdrive-route-catalog checkは、root不在、または現行workflow catalogとdrive route catalogの判定を渡したadmissionがfalseの場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4961-4980 |
| `RC02-169` | doctorのforward-convergence checkは、spine外の新規implが未集約でlandedするなど検査が不合格、またはPLAN読込不能の場合に失敗する。legacy debt allowlistは表示しても失敗理由にしない。 | process_gate | doctor | src/doctor/index.ts:6802-6820 |
| `RC02-180` | doctorのproposal-document-coverage checkは、文書被覆routing検査が不合格、または検査不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:7250-7271 |
| `RC02-187` | full doctorは、workflow分類のterminal fullback oracleが不合格の場合、総合判定を失敗にする。 | process_gate | doctor | src/doctor/index.ts:7518-7519; src/doctor/index.ts:7670-7670; src/doctor/index.ts:7692-7719 |
| `RC03-057` | historical V-pair移行分類処理は、候補のclassificationがneeds_designでない場合、admissionを拒否する。 | process_gate | gate | src/policy/historical-vpair-migration-authority.ts:106-120 |
| `RC03-059` | historical V-pair移行分類処理は、候補kindがimplまたはadd-implでない場合、admissionを拒否する。 | process_gate | gate | src/policy/historical-vpair-migration-authority.ts:109-120 |
| `RC04-133` | workflow分類器は、一致候補が無いsignalをunknownとして警告し、exit code 2を返す。 | process_gate | gate | src/workflow/workflow-classification-routing.ts:69-86 |
| `RC04-134` | workflow分類器は、最長一致で複数のtyped identityが残る場合、ambiguousとして失敗する。 | process_gate | gate | src/workflow/workflow-classification-routing.ts:55-66; src/workflow/workflow-classification-routing.ts:89-109 |
| `RC04-135` | workflow分類器は、unresolved_until_decisionが指定された候補を確定せず、decision_requiredの警告とexit code 2を返す。 | escalation_authority | gate | src/workflow/workflow-classification-routing.ts:112-130 |
| `RC04-138` | workflow実行route評価器は、分類またはpolicyが未解決なら実行bindingを出さず、そのdispositionに対応する非成功終了を返す。 | process_gate | gate／config | src/workflow/workflow-execution-routing.ts:130-176; config/workflow-execution-policy.v1.json:57-86 |
| `RC04-174` | Refactor検証器は、beforeとafterが異なる、または回帰試験が非ゼロ終了なら失敗する。 | process_gate | gate | src/workflow/contracts.ts:718-732 |
| `RC04-186` | Discovery合成器は、design_uncertainがcase_driven_model=DISCOVERY_POCへ一意に分類されなければ失敗する。 | process_gate | gate | src/workflow/design-elicitation.ts:268-283 |
| `RC04-187` | route評価器は、一致routeの無いsignalを警告し、推薦commandを返さずexit code 2にする。 | process_gate | gate | src/workflow/routing-contracts.ts:29-47; src/workflow/routing-contracts.ts:506-526 |
| `RC04-190` | D-CONTRACT検証器は、route signalが重複していれば失敗する。 | process_gate | gate | src/workflow/routing-contracts.ts:288-295 |
| `RC04-192` | D-CONTRACT検証器は、next参照に循環があれば失敗する。 | process_gate | gate | src/workflow/routing-contracts.ts:310-318 |
| `RC04-228` | workflow guide生成器は、指定signalが未登録なら失敗する。 | process_gate | gate | src/workflow/workflow-guide.ts:166-180; src/workflow/workflow-guide.ts:276-279 |
| `RC04-230` | workflow guide生成器は、signalが複数typed identityに一致すれば失敗する。 | process_gate | gate | src/workflow/workflow-guide.ts:191-196; src/workflow/workflow-guide.ts:276-279 |
| `RC04-231` | workflow guide生成器は、signalのaxisがworkflow_modelでない、または対象workflow IDと異なれば失敗する。 | process_gate | gate | src/workflow/workflow-guide.ts:198-206; src/workflow/workflow-guide.ts:276-279 |
| `RC04-232` | workflow guide生成器は、指定workflowがregistryのworkflow_model集合に無ければguideを返さずexit code 2にする。 | process_gate | gate | src/workflow/workflow-guide.ts:234-249 |
| `RC04-233` | workflow guide生成器は、指定されたdevelopment_style・case_driven_model・subrouteが対応axisのregistryに無ければ失敗する。 | process_gate | gate | src/workflow/workflow-guide.ts:252-279 |
| `RC04-287` | workflow分類catalogは、legacy identity出力と共通route identityを禁止し、曖昧な分類をfail-closeとする。 | process_gate | config | config/workflow-classification-catalog.v1.json:12-17 |
| `RD01-162` | PLAN authoring処理は、workflow catalogを読めない、registry情報が不正、またはADD_FEATUREとREVERSEの定義がなければ拒否する。 | process_gate | gate | src/runtime/forward-plan-authoring-transaction.ts:533-551 |
| `RD02-151` | workflow対応付け器は、未知workflowの場合にnew_plan_requiredとする。 | process_gate | gate | src/runtime/legacy-adoption.ts:474-476 |
| `RD03-224` | drive entry評価は、signalまたはkindがmatrixで解決できない場合、fail_closeにする。 | process_gate | gate | src/runtime/upstream-adoption.ts:265-272 |
| `RD03-225` | drive entry評価は、signalから期待されるmodeと指定modeが異なる場合、自動routeせずdeferにする。 | process_gate | gate | src/runtime/upstream-adoption.ts:269-273 |
| `RD03-226` | drive entry評価は、kindに対してdriveが許可されていない場合、人間reviewへ回す。 | escalation_authority | gate | src/runtime/upstream-adoption.ts:274-276 |
| `RD04-229` | backfill lintは、条件付き種別のrefactor・retrofit・troubleshootにReverseが無く、not_requiredと10文字以上の理由も無く、施行日以降かつ旧債務allowlist外なら違反とする。 | process_gate | lint | src/lint/backfill-pairing.ts:8-12; src/lint/backfill-pairing.ts:179-187; src/lint/backfill-pairing.ts:272-276 |
| `RD05-010` | branch-kindは、変更PLANのkindがbranch種別の許可集合にない、または欠落している場合、失敗させる。recovery branchの限定的なsuperseded_by移行またはterminal PLANのreviewer帰属訂正は例外とする。 | process_gate | lint | src/lint/branch-kind.ts:162-190; src/lint/branch-kind.ts:323-336; src/lint/branch-kind.ts:381-493 |
| `RD05-030` | change-set-integrityは、source変更がありplanDocsが提供された場合、変更された適格な実装PLANが一つもなければ失敗させる。 | process_gate | lint | src/lint/change-impact.ts:110-143; src/lint/change-impact.ts:228-241 |
| `RD05-203` | ddd-tdd-rulesは、policy文書にAdd-featureがない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:102-102; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-205` | ddd-tdd-rulesは、ForwardまたはAdd-feature工程文書にDDD-TDD-WORKFLOW markerがない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:107-125; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-208` | ddd-tdd-rulesは、Add-feature工程文書にadd-designがない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:131-131; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-209` | ddd-tdd-rulesは、Add-feature工程文書にadd-implがない場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:132-132; src/lint/ddd-tdd-rules.ts:354-362 |
| `RD05-221` | ddd-tdd-rulesは、対象PLANのrefactor_stepが所定の段階集合外の場合、違反にする。 | process_gate | lint | src/lint/ddd-tdd-rules.ts:471-479; src/lint/ddd-tdd-rules.ts:606-614 |
| `RD06-054` | design-reality-binding lintは、planned_newと宣言した成果物が既に存在する場合、失敗させる。 | evidence_claim | lint | src/lint/design-reality-binding.ts:849-850 |
| `RD06-130` | drive-model-passage lintは、対象文書に所定見出しの通過証明sectionがない、またはその本文が空の場合、失敗させる。 | process_gate | lint | src/lint/drive-model-passage.ts:35-35; src/lint/drive-model-passage.ts:84-89 |
| `RD06-131` | drive-model-passage lintは、通過証明sectionにheaderと少なくとも1件のデータ行を持つ表がない場合、失敗させる。 | process_gate | lint | src/lint/drive-model-passage.ts:90-94 |
| `RD06-132` | drive-model-passage lintは、表にentry mode列またはcertificate columns列がない場合、失敗させる。 | process_gate | lint | src/lint/drive-model-passage.ts:95-103 |
| `RD06-133` | drive-model-passage lintは、表の行でmodeまたはrequired certificate columnsが空の場合、失敗させる。 | process_gate | lint | src/lint/drive-model-passage.ts:105-111 |
| `RD06-134` | drive-model-passage lintは、required certificate columnsにForward先を表す所定語がない場合、失敗させる。 | process_gate | lint | src/lint/drive-model-passage.ts:72-74; src/lint/drive-model-passage.ts:112-114 |
| `RD06-136` | drive-model-passage lintは、各文書の通過証明表に期待する10種類のmodeが揃わない場合、失敗させる。 | process_gate | lint | src/lint/drive-model-passage.ts:37-48; src/lint/drive-model-passage.ts:121-125 |
| `RD06-147` | drive-route-catalog lintは、next_routesが未登録routeを参照する場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:272-280 |
| `RD06-148` | drive-route-catalog lintは、routeの対応文書が存在しない場合、失敗させる。 | evidence_claim | lint | src/lint/drive-route-catalog.ts:281-288 |
| `RD06-149` | drive-route-catalog lintは、Forward spineに該当するrouteが存在し、そのnext_routesが空でない場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:290-297 |
| `RD06-150` | drive-route-catalog lintは、Forward spine以外のrouteからnext_routesを辿ってForward spineへ到達できない場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:144-161; src/lint/drive-route-catalog.ts:298-309 |
| `RD06-151` | drive-route-catalog lintは、Forward spineで探索を打ち切る経路graphにcycleがある場合、そのcycleに属するrouteを違反として失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:163-187; src/lint/drive-route-catalog.ts:310-316 |
| `RD06-154` | drive-route-catalog lintは、classified constructが未登録のparent routeを参照する場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:332-341 |
| `RD06-157` | drive-route-catalog lintは、specialist workflowのparent_routeが未登録の場合、失敗させる。 | process_gate | lint | src/lint/drive-route-catalog.ts:357-364 |
| `RD06-158` | drive-route-catalog lintは、specialist workflowの対応文書が存在しない場合、失敗させる。 | evidence_claim | lint | src/lint/drive-route-catalog.ts:365-371 |
| `RD06-171` | forward-convergence lintは、backprop_decision=not_requiredによる集約免除を、trim後の理由が10文字以上の場合に限って認める。local_impl_onlyにはこの理由長検査を適用しない。 | process_gate | lint | src/lint/forward-convergence.ts:128-136 |
| `RD07-168` | identifier-renameの切替計画は、PLAN-M-02に対するsemantic frontier binding検査の違反があればblockedReasonsへ加え、準備完了にしない。 | process_gate | lint | src/lint/identifier-rename.ts:2381-2397; src/lint/identifier-rename.ts:2519-2524 |
| `RD09-033` | legacyKindAllowedは、kind未指定、未知のmode、またはmodeの許可集合にないkindを不許可として返す。 | process_gate | lint | src/lint/plan-entry-routing-legacy-input.ts:122-125 |
| `RD09-036` | plan-entry-routingは、archived・PLAN-DISCOVERY-*・PLAN-M-*を除く検査対象でentry_signalsが空の場合、baseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:19-19; src/lint/plan-entry-routing.ts:294-305; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-037` | plan-entry-routingは、検査対象の非PO指示signalに解決済みtokenがない場合、baseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:306-315; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-038` | plan-entry-routingは、typed workflow_identityがない検査対象でsignalのrouteが見つからないか、そのrouteでkindが許可されない場合、baseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:317-326; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-042` | plan-entry-routingは、workflow_identityのschema、registry version・digest、target axis/idがcatalogと整合しない場合、baseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:216-230; src/lint/plan-entry-routing.ts:337-343; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-044` | plan-entry-routingは、有効なworkflow_identityを持つ検査対象のtyped signalがunknownの場合、baseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:127-131; src/lint/plan-entry-routing.ts:353-362; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-046` | plan-entry-routingは、有効なworkflow_identityを持つ検査対象のtyped signalがambiguousの場合、baseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:127-131; src/lint/plan-entry-routing.ts:353-362; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-047` | plan-entry-routingは、classifiedなtyped signalのtarget axisまたはidが宣言workflow_identityと異なる場合、baseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:364-373; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-048` | plan-entry-routingは、workflow_identityがない検査対象にroute_modeもない場合、baseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:377-378; src/lint/plan-entry-routing.ts:429-442 |
| `RD09-049` | plan-entry-routingは、workflow_identityがない検査対象のroute_modeでkindが許可されない場合、baseline免除対象以外を失敗させる。 | process_gate | lint | src/lint/plan-entry-routing.ts:379-385; src/lint/plan-entry-routing.ts:429-442 |
| `RD10-088` | S4 lintはconfirmed判断のroute_impactがconfirmedに言及していなければ失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:434-439 |
| `RD10-089` | S4 lintはconfirmed判断のforward_routeが具体的なForward／Reverse昇格先を示すpatternに合わなければ失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:440-446; src/lint/s4-decision-readiness.ts:745-750 |
| `RD10-093` | S4 lintはrejected判断のroute_impactに却下またはarchiveを表す語がなければ失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:479-484 |
| `RD10-094` | S4 lintはrejected判断のforward_routeにForward昇格なしを表す規定語がなければ失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:485-490; src/lint/s4-decision-readiness.ts:753-764 |
| `RD10-097` | S4 lintはpivot判断のroute_impactがpivotに言及していなければ失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:506-511 |
| `RD10-098` | S4 lintはpivot判断のforward_routeとrationaleに新PoC、S0、backlog、retry等の再投入先を表す語がなければ失敗させる。 | process_gate | lint | src/lint/s4-decision-readiness.ts:512-527 |
| `RD10-132` | frontier binding検証は一致recordのrequiredRouteが空白だけなら違反を返す。 | process_gate | lint | src/lint/semantic-frontier-binding.ts:81-86 |
| `RD10-134` | frontier整合lintはL3文書に意味ベース機能一覧と要求修正境界の所定節がなければ失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:280-282 |
| `RD10-166` | frontier整合lintはlive frontierのrequiredRouteが空白だけなら失敗させる。 | process_gate | lint | src/lint/semantic-frontier-consistency.ts:493-495 |
| `RD11-073` | version-up lintは、functional designに指定された機能・routing・escalationのmarkerがない場合に違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:405-410; src/lint/version-up-readiness.ts:969-973 |
| `RD11-132` | parked PLAN意味検査は、activation_routeにadd-featureと具体的PLAN・L2〜L7・指定docs pathのいずれかが揃わなければ違反にする。 | process_gate | lint | src/lint/version-up-readiness.ts:2618-2627; src/lint/version-up-readiness.ts:2753-2758 |
| `RD11-175` | workflow catalog lintは、前後空白除去・小文字化後に同じsignalが異なるaxis:idへ割り当てられた場合に違反にする。 | process_gate | lint | src/lint/workflow-classification-catalog.ts:82-95 |
| `RE01-008` | PoC担当者はS4で採否を決定してから終了し、confirmedだけをReverseへ接続する。rejectedはarchiveし、pivotはarchive後に新しいPoCとして開始する。 | process_gate | prose／lint | docs/governance/helix-harness-requirements_v1.2.md:143-173 |
| `RE01-013` | PLAN作成者はdriveを専門領域の分類として扱い、workflowの代わりにしてはならない。追加PLANのdriveは、規定されたfullstack例外を除き親PLANと一致させる。 | process_gate | prose／lint | docs/governance/helix-harness-requirements_v1.2.md:261-284 |
| `RE01-020` | refactor担当者は既存の振る舞いを維持し、回帰テストがgreenになってからレビューへ進む。契約変更が必要なら対応する設計変更経路を使用する。 | process_gate | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:417-429; docs/governance/helix-harness-requirements_v1.2.md:1835-1844 |
| `RE01-055` | 作業者はPoCをmainへ直接取り込んではならず、採用する場合もReverseと正規Forward gateを通す。 | review_merge | prose／ci／gate | docs/governance/helix-harness-requirements_v1.2.md:880-884; docs/governance/helix-harness-requirements_v1.2.md:918-932; docs/governance/helix-harness-requirements_v1.2.md:1142-1142 |
| `RE01-060` | refactor・retrofit・troubleshoot担当者はReverseが不要と判断する場合、要求意味の変更がないことを確認し、明示的なnot-required理由を残す。 | process_gate | prose／gate | docs/governance/helix-harness-requirements_v1.2.md:968-973 |
| `RE01-061` | add-design担当者は既存設計を削除・変更せず、新しい設計とテスト設計を追加し、既存回帰検証を通す。 | process_gate | lint／ci | docs/governance/helix-harness-requirements_v1.2.md:984-1016 |
| `RE01-062` | add-impl担当者は実装と対応テストを追加し、親PLANとの双方向参照を用意する。 | process_gate | lint／gate | docs/governance/helix-harness-requirements_v1.2.md:1006-1016 |
| `RE01-067` | 作業者はdocs/skillsの変更をdocs/chore例外にせず、designまたは追加変更のPLANを用意する。 | process_gate | lint／ci | docs/governance/helix-harness-requirements_v1.2.md:1107-1107; docs/governance/helix-harness-requirements_v1.2.md:1857-1881 |
| `RE01-143` | 分類器は未知の要求をexit 2で上流へ戻し、曖昧な入力を既定の実装経路へ流してはならない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.2.md:2007-2031 |
| `RE01-166` | delivery担当者はFull VとHybridの双方に同じ品質・二者レビュー・trace・DB・release条件を適用する。HybridはL5 freeze後にsliceへ分け、Full Vをslice運用に置き換えない。 | process_gate | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:23-25; docs/governance/helix-harness-requirements_v1.3.md:73-75 |
| `RE01-172` | delivery担当者は高risk・未知条件などの適用条件に従ってFull Vを選び、ScrumでもL3 freeze後にsliceごとのL4/L5を作る。 | process_gate | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:73-75 |
| `RE01-173` | Discovery/PoC担当者は実験をdelivery styleやScrumの部品とせず、独立したcase routeで管理し、S4以前にproductionへ昇格させない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:78-81; docs/governance/helix-harness-requirements_v1.3.md:273-273; docs/governance/helix-harness-requirements_v1.3.md:436-439 |
| `RE01-175` | delivery担当者はstyleにかかわらずTDD・Reverse・AC・migration・rollback・security・release・L12検証を省略しない。旧縮小Scrum表現は入力で正規化するだけにする。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:83-88 |
| `RE01-177` | Scrum担当者は公開契約・DB・依存・NFR budgetの変更、未追跡成果、反復finding・regression・incident・workaroundを検出した場合、sprint reviewやRCの前にScrum Reverseを開始する。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:94-102 |
| `RE01-179` | SR3判断者は変更の意味に基づきREDESIGN・DESIGN_REFACTOR・PERFORMANCE_REFACTOR・RETROFITの一つを選び、名前が似ているだけで経路を統合しない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:112-119 |
| `RE01-183` | workflow実装者は独立した分類軸を同じenum・CLI値・DB欄へ混在させず、未解決signalからrouteを推定しない。曖昧な分類はfail-closeする。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:132-150 |
| `RE01-187` | 分類者はpair-agentをexecution form、verificationを右腕scopeとして扱い、独立workflow styleへ変換しない。styleは人間がL3で決め、signalから変更しない。 | process_gate | prose／gate | docs/governance/helix-harness-requirements_v1.3.md:164-175; docs/governance/helix-harness-requirements_v1.3.md:617-633 |
| `RE01-190` | 実行処理はtyped分類をpolicy解決より先に行い、欠けた条件・style・execution formを推測で補わない。 | process_gate | gate | docs/governance/helix-harness-requirements_v1.3.md:187-197 |
| `RG05-001` | 互換Forward経路を扱う処理は、作業kindをdesignまたはimplに限定する。 | process_gate | config | config/drive-route-catalog.json:8-12 |
| `RG05-002` | Production ScrumおよびHybrid経路を扱う処理は、作業kindをdesign、impl、add-design、add-implに限定する。 | process_gate | config | config/drive-route-catalog.json:25-29; config/drive-route-catalog.json:42-46 |
| `RG05-003` | Discovery経路を扱う処理は、作業kindをpocに限定する。 | process_gate | config | config/drive-route-catalog.json:59-63 |
| `RG05-004` | Reverse経路を扱う処理は、作業kindをreverseに限定する。 | process_gate | config | config/drive-route-catalog.json:76-80 |
| `RG05-005` | top-downおよびbottom-upのAdd-feature経路を扱う処理は、作業kindをadd-designまたはadd-implに限定する。 | process_gate | config | config/drive-route-catalog.json:93-97; config/drive-route-catalog.json:110-114 |
| `RG05-006` | Refactor経路を扱う処理は、作業kindをrefactorに限定する。 | process_gate | config | config/drive-route-catalog.json:127-131 |
| `RG05-007` | Retrofit経路を扱う処理は、作業kindをretrofitに限定する。 | process_gate | config | config/drive-route-catalog.json:144-148 |
| `RG05-008` | Recovery経路を扱う処理は、作業kindをrecoveryに限定する。 | process_gate | config | config/drive-route-catalog.json:161-165 |
| `RG05-009` | Incident経路を扱う処理は、作業kindをtroubleshootまたはrecoveryに限定する。 | process_gate | config | config/drive-route-catalog.json:178-182 |
| `RG05-010` | Research経路を扱う処理は、作業kindをresearchに限定する。 | process_gate | config | config/drive-route-catalog.json:195-199 |
| `RG05-011` | version-up経路を扱う処理は、作業kindをdesign、impl、add-design、add-impl、refactor、retrofit、research、reverse、recovery、troubleshoot、pocに限定する。 | process_gate | config | config/drive-route-catalog.json:212-216 |
| `RG05-012` | Operation Verification経路を扱う処理は、作業kindをdesign、impl、add-design、add-impl、refactor、retrofitに限定する。 | process_gate | config | config/drive-route-catalog.json:229-233 |
| `RG05-013` | design-bottomup経路を扱う処理は、作業kindをdesignまたはadd-designに限定する。 | process_gate | config | config/drive-route-catalog.json:246-250 |
| `RG05-015` | 外部契約または挙動変更によるredesign判断を終了する処理は、再分類先の代替経路がcurrentであることを要求する。 | process_gate | config | config/drive-route-catalog.json:288-294 |
| `RG10-001` | 工程選択者はproductionのdelivery単位をFull V・Production Scrum・Hybridから選ぶ。 | process_gate | prose | docs/governance/drive-route-catalog.md:56-56 |
| `RG14-020` | RLOのintake routeを確定する担当者は、#819に#502のupdate／requirement_ir_release_minus_1ルートを流用せず、新規orchestration capabilityとしてrouteとIR分類を別途確定する。 | process_gate | prose | docs/governance/rlo-819-approval-packet-2026-08-20.md:31-38 |
| `RG18-023` | Reverse担当者はupgrade typeでRGCを使ってはならない。 | process_gate | prose | docs/skills/reverse-analysis.md:36-36 |
| `RG19-005` | Discovery／PoC担当者は、S2の軽量仕様経路をproduction development styleの工程省略として扱ってはならない。 | process_gate | prose | docs/skills/spec-driven-development.md:93-96 |

## 副として対応づいた規則（134件）

`RA-193`、`RA-195`、`RA-227`、`RA-228`、`RA-229`、`RB0-101`、`RB0-102`、`RB04-033`、`RB04-046`、`RB04-050`、`RB04-078`、`RB04-096`、`RB04-097`、`RB04-098`、`RB04-100`、`RB04-153`、`RB04-190`、`RB05-032`、`RB05-084`、`RB05-105`、`RB05-211`、`RB05-214`、`RB05-249`、`RB05-315`、`RB05-318`、`RB05-353`、`RB05-362`、`RB05-363`、`RB05-366`、`RB06-066`、`RB06-067`、`RB06-069`、`RB06-205`、`RB06-257`、`RB06-260`、`RB07-001`、`RB07-004`、`RB07-044`、`RB07-086`、`RB07-088`、`RB07-091`、`RB07-134`、`RB07-138`、`RB07-224`、`RB07-244`、`RB07-266`、`RB07-267`、`RB07-269`、`RB07-342`、`RB08-013`、`RB08-015`、`RB08-027`、`RB08-053`、`RB08-099`、`RB08-102`、`RB08-123`、`RB08-157`、`RB08-176`、`RB08-182`、`RB08-230`、`RB08-289`、`RB08-312`、`RB09-013`、`RC0-144`、`RC0-145`、`RC0-146`、`RC0-147`、`RC0-148`、`RC00-181`、`RC00-182`、`RC00-184`、`RC02-110`、`RC04-136`、`RC04-139`、`RC04-170`、`RC04-173`、`RC04-175`、`RC04-176`、`RC04-191`、`RC04-198`、`RC04-229`、`RC04-242`、`RC04-245`、`RC04-285`、`RD00-090`、`RD02-130`、`RD02-153`、`RD04-227`、`RD05-009`、`RD05-196`、`RD06-074`、`RD06-138`、`RD06-139`、`RD06-140`、`RD06-141`、`RD06-142`、`RD06-143`、`RD06-145`、`RD06-155`、`RD06-159`、`RD06-160`、`RD06-170`、`RD06-172`、`RD06-194`、`RD07-189`、`RD08-047`、`RD08-056`、`RD09-026`、`RD09-034`、`RD09-035`、`RD09-039`、`RD09-040`、`RD09-041`、`RD09-043`、`RD09-045`、`RD09-071`、`RD10-057`、`RD10-058`、`RD10-083`、`RD10-103`、`RD10-117`、`RD11-071`、`RD11-074`、`RE01-009`、`RE01-012`、`RE01-018`、`RE01-052`、`RE01-056`、`RE01-176`、`RE01-181`、`RE01-254`、`RE01-263`、`RG10-004`、`RG19-002`
