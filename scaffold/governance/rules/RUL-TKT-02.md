---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-TKT-02
group: チケット
product: OS
atoms_primary: 131
atoms_secondary: 149
issue_projection: none
---

# RUL-TKT-02（チケット／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

作業を始める前に、作業graph、依存、並列と直列、scope、予算、作業者へ渡すcontextの境界を確定する。境界の無い作業者を起動しない。

## 主として対応づいた規則（131件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-125` | エージェントはriskまたはcostを下げる場合だけ作業をrole・runtimeへ分割する。 | lane_delegation | prose | CLAUDE.md:108-108 |
| `RA-202` | PLAN作成者は各schedule stepに並列・直列を明示し、直列にはfile競合・下流依存・共有stateの理由を付ける。 | process_gate | prose／lint | .claude/CLAUDE.md:55-55; .claude/commands/sdd-plan.md:20-21 |
| `RA-203` | PLAN作成者は少なくとも1つreview stepを設ける。 | process_gate | prose | .claude/commands/sdd-plan.md:21-21 |
| `RA-212` | PLAN作成者はstepを設計節または1 source moduleとtestに対応する粒度へ分け、対象fileのない粗いstepを残さない。 | process_gate | prose | .claude/commands/sdd-plan.md:18-19 |
| `RA-214` | PLANのrequires・parentは実在する文書を参照する。 | process_gate | prose／lint | .claude/commands/sdd-plan.md:24-26 |
| `RA-289` | pushを依頼された場合、エージェントは一貫したPLAN・task境界でpushする。 | behavior_discipline | prose | CLAUDE.md:187-187 |
| `RA-299` | /build実行者はactive PLAN scope内に留まる。 | behavior_discipline | prose | .claude/commands/build.md:33-33 |
| `RB0-057` | oracle定義を移設する者は旧pathと新pathを同一原子scopeへ含め、移設後も全oracle IDが解決することを検証する。 | process_gate | prose | docs/governance/ddd-tdd-rules.md:80-83 |
| `RB0-087` | Issue管理者はrootへ親を設定せず、capability・task・findingには親を必須にする。 | process_gate | gate | docs/governance/github-issue-hierarchy-rules.md:10-17 |
| `RB0-088` | Issue階層の管理者は一親の子を100件以下、階層の深さを8以下に制限する。 | process_gate | prose | docs/governance/github-issue-hierarchy-rules.md:17-17 |
| `RB0-091` | 依存を記録する者はblocksとblocked_byを双方向一致させる。 | process_gate | prose | docs/governance/github-issue-hierarchy-rules.md:34-34 |
| `RB0-095` | dispatch担当者はopen・activeなtask/findingで、open childがなく依存先が全てclosedかつ階層不整合のないREADY leafだけを候補にする。 | process_gate | prose | docs/governance/github-issue-hierarchy-rules.md:41-47 |
| `RB0-098` | 依存を持つIssueの管理者は指定dependency blockを記載し、depends_onと依存先のblocksを一致させ、依存先がopenのままcloseしない。 | process_gate | prose | docs/governance/github-issue-hierarchy-rules.md:56-65 |
| `RB0-110` | operatorはboundary JSONをgoal単位で.helix/worker-contextへ置き、追跡対象の設定として管理する。 | tooling_runtime | prose | docs/governance/worker-context-boundary-operator-guide.md:23-31 |
| `RB0-112` | operatorは旧setupのboundaryを手書きし、自動生成を追加する場合は別PLANでsetup契約を拡張する。 | tooling_runtime | prose | docs/governance/worker-context-boundary-operator-guide.md:34-37 |
| `RB0-119` | boundary作成者はtime_msとtoken_limitへ正のsafe integerを指定する。 | tooling_runtime | gate | docs/governance/worker-context-boundary-operator-guide.md:79-81 |
| `RB04-086` | PLAN作成者は機能/doc単位で工程表と実装計画を内蔵し、本文なしの成果物宣言だけでは有効なPLANとしない。 | process_gate | prose／lint | docs/governance/helix-harness-concept_v3.1.md:751-760 |
| `RB04-088` | PLAN作成者は工程表にレビューを固定手順として必ず組み込む。 | review_merge | prose | docs/governance/helix-harness-concept_v3.1.md:764-764 |
| `RB04-108` | workflow/harness YAMLは参照用設計仕様書として扱い、専用interpreterを導入せず、AIはPLAN起票時にstep順序とon_failureを読む。 | tooling_runtime | prose | docs/governance/helix-harness-concept_v3.1.md:974-991 |
| `RB04-128` | roadmap管理者は全Forward bandとcutoverを登録被覆し、未登録workは違反とし、意図的な保留はpark宣言する。 | process_gate | doctor | docs/governance/helix-harness-concept_v3.1.md:1163-1166 |
| `RB04-129` | 人間向けroadmapは機能群の割当・進捗を扱い、AI向けPLANは依存・難易度・agent割当・並列/直列の作り方を扱う。 | lane_delegation | prose | docs/governance/helix-harness-concept_v3.1.md:1163-1165 |
| `RB04-149` | PLAN作成者は各手順に並列/直列と該当条件を明示し、team定義でもstrategy・並列上限・serialization・serialize_afterを宣言する。 | lane_delegation | prose／config | docs/governance/helix-harness-concept_v3.1.md:1244-1245 |
| `RB05-066` | freeze後の追加ownerにはdependency frontierと必要なpair・実装・検証slotをexactly once採番し、既存87 slotへ暗黙に混載しない。 | process_gate | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:256-271; docs/governance/l3-rebaseline-g3-freeze-packet.md:322-323 |
| `RB05-084` | workstreamはcase数だけで束ねずsemantic predecessorまたは直接authorityが一致する単位に分け、異なるpair routeを同一PRへ混ぜない。 | review_merge | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:434-447 |
| `RB05-086` | refactor PRはfamilyとsource pathの組を最小sliceとし、同一pathでもfamilyが異なる変更を別PRに分け、behavior fenceを先行または同一TDD closureへ結ぶ。 | review_merge | prose | docs/governance/l3-rebaseline-g3-freeze-packet.md:476-479 |
| `RB05-202` | Scope Authorityは権威あるrootへ非循環に到達し、acceptance寄与・最小性・代替比較・budgetを満たす場合だけ許可し、同時追加要件による自己循環根拠を拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:167-171; docs/governance/infinity-loop-system-assertion-cases.md:364-364; docs/governance/infinity-loop-system-assertion-cases.md:392-392; docs/governance/infinity-loop-system-assertion-cases.md:434-434 |
| `RB05-207` | loopがiteration・time・token・cost上限に達した場合、停止理由とdurable checkpointを残して停止し、同一点から再開する。 | tooling_runtime | prose | docs/governance/infinity-loop-system-assertion-cases.md:184-184; docs/governance/infinity-loop-system-assertion-cases.md:415-415 |
| `RB05-214` | refactor planはconsumerの列挙漏れまたはrollback target欠落があればfenceせず、将来利用だけを根拠とする汎用base追加を拒否する。 | process_gate | gate | docs/governance/infinity-loop-system-assertion-cases.md:198-200; docs/governance/infinity-loop-system-assertion-cases.md:325-325; docs/governance/infinity-loop-system-assertion-cases.md:334-334 |
| `RB06-101` | Scope Gateはoracle寄与・最小性・代替案・budget・非循環authority rootを満たさない拡張を拒否し、子Issueも同じscope authorityへ拘束する。 | process_gate | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:38-38; docs/governance/infinity-loop-assertion-coverage-ledger.md:74-74; docs/governance/infinity-loop-assertion-coverage-ledger.md:106-106; docs/governance/infinity-loop-assertion-coverage-ledger.md:165-165; docs/governance/infinity-loop-assertion-coverage-ledger.md:181-181 |
| `RB06-263` | 旧core/screen運用では台帳を二レーンに分け、screenはmock後に別レーンで進め、合流時にG1-traceを再検証する。 | lane_delegation | prose | docs/governance/gate-design.md:114-114 |
| `RB07-076` | 探索的テスト担当者は開始前に目的と時間箱を一行で記録する。 | behavior_discipline | prose | docs/skills/test-thinking.md:85-86 |
| `RB07-086` | PoC担当者はS0で仮説を持つdraft PLANを作り、S1で受入条件と時間箱を定めplan lintを通す。 | process_gate | prose／lint | docs/skills/poc.md:39-42 |
| `RB07-108` | 弱点修正担当者はL1〜L12の6対と層外L0、既定のFull V・Scrum・PoC工程を変更対象にしない。 | process_gate | prose | docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md:16-21 |
| `RB07-170` | 依存graphにcycleがあるPLANは前進させず、共有依存を上流PLANへ切り出して解消する。 | process_gate | prose | docs/skills/project-management.md:69-70 |
| `RB07-211` | 計画者はstepを設計とテスト設計の一対で検証できる粒度まで分け、独立文書を作るstepだけをchild PLANとする。 | process_gate | prose | docs/skills/planning-and-task-breakdown.md:22-24; docs/skills/planning-and-task-breakdown.md:33-39 |
| `RB07-212` | 計画者はlint前にPLAN IDの一意性とfilename一致、許可kind・status、主層・drive、全生成物・依存・証跡の記載を確認する。 | process_gate | prose／lint | docs/skills/planning-and-task-breakdown.md:41-54 |
| `RB07-214` | 計画者はend-to-endで検証できる垂直sliceを優先し、DB・API・画面だけの横割りを独立受入stepにせず、大きすぎる場合は設計へ戻る。 | behavior_discipline | prose | docs/skills/planning-and-task-breakdown.md:74-81 |
| `RB07-215` | 計画者は将来stepの詳細設計・受入条件を前倒しで埋めず、次に着手するstepだけを詳細化する。 | behavior_discipline | prose | docs/skills/planning-and-task-breakdown.md:83-88 |
| `RB07-217` | 計画者は層注記なしの全実装step、generatesが空のdesign PLAN、証跡なしのdoneを作らない。 | process_gate | prose／doctor | docs/skills/planning-and-task-breakdown.md:106-113 |
| `RB07-232` | 設計者は案件の規模・領域・制約を先に定め、不明なら妥当な仮定を示すかL1/L2確定事項をPOへ確認する。 | behavior_discipline | prose | docs/skills/design-tailoring.md:34-36 |
| `RB07-304` | queue実行者は各slotのdepends_onを満たしてから対象pair closureまたはimplementation TDDへ進む。 | process_gate | config | docs/governance/l3-downstream-queue.json:17-103 |
| `RB08-022` | PLAN作成者は工程表作成前にSize・Dependency depth・Uncertaintyを採点し、各点と合計をPLAN本文へ記録する。機械分類と違う場合は理由も記す。 | process_gate | prose | docs/skills/estimation.md:28-32; docs/skills/estimation.md:43-51 |
| `RB08-023` | PLAN作成者は合計5〜6を分割またはtimeboxし、7〜9はschedule・委譲前にchild PLANへ分解する。 | process_gate | prose | docs/skills/estimation.md:52-53; docs/skills/estimation.md:82-82 |
| `RB08-024` | 見積担当者は見積値がばらついた場合、平均せず前提・scope解釈の差を特定して再採点する。 | behavior_discipline | prose | docs/skills/estimation.md:55-58 |
| `RB08-026` | 見積担当者は選択したdevelopment styleのslice境界と正規V-pairを含めて採点し、Scrumを品質工程省略として減算しない。 | process_gate | prose | docs/skills/estimation.md:62-63 |
| `RB08-027` | Discovery・PoC担当者はS2だけを見積もり、S3・S4はS2完了まで見積もらず、production styleと別に記録する。 | process_gate | prose | docs/skills/estimation.md:64-65 |
| `RB08-028` | Recovery・Incident担当者はscoreに関係なく1 sessionへtimeboxし、scope縮小判断を監査証跡に記録する。 | process_gate | prose | docs/skills/estimation.md:66-67 |
| `RB08-029` | PLAN作成者はscore 5以上をscheduleする前に、最初のsession終了点と次actionの再確認手順を工程表へ記載する。 | memory_context | prose | docs/skills/estimation.md:69-74 |
| `RB08-031` | 見積担当者はReverse・Retrofitの既存sourceを読む前にUncertainty=1を付けず、小変更でも採点を省略しない。 | behavior_discipline | prose | docs/skills/estimation.md:94-95 |
| `RB08-032` | 見積担当者は単一軸が3なら合計値にかかわらず分解レビューを行う。 | process_gate | prose | docs/skills/estimation.md:96-97 |
| `RB08-040` | 要件担当者はPoCのdecision_outcomeがL3要求に影響する場合、L3 PLANのdependenciesからPoC PLANを参照する。 | evidence_claim | prose | docs/skills/requirements-handover.md:62-63 |
| `RB08-100` | L4設計者はmodule数・state追加・外部境界・テスト経路数・PLAN分割判断をSizingへ記録し、stateを追加する場合はDB設計規則を確認する。 | process_gate | prose | docs/skills/system-design-sizing.md:46-57 |
| `RB08-101` | PLAN作成者はlayer-pair横断ごとに1 PLANを既定とし、複数pairをまとめる場合はsummaryに理由を書く。 | process_gate | prose | docs/skills/system-design-sizing.md:59-63 |
| `RB08-102` | 設計者は異なるlayer・driveの境界または2 sprint超の複雑度が判明した時点でPLANを分割し、childを再見積もりして理由を記録する。 | process_gate | prose | docs/skills/system-design-sizing.md:56-57; docs/skills/system-design-sizing.md:64-65 |
| `RB08-124` | PLAN担当者は実在する依存をrequiresへ明示し、missing PLANを作らず参照だけ削除してlintを通してはならない。 | behavior_discipline | prose | docs/skills/dependency-map.md:82-86 |
| `RB08-170` | context設計者は現在taskに必要な層と文書だけをloadし、full doc treeや主session全体をsubagentへ渡さない。 | memory_context | prose | docs/skills/context-engineering.md:39-49; docs/skills/context-engineering.md:66-67 |
| `RB08-172` | context設計者はresponse用の余裕を確保し、共通CLAUDE文書を重複注入せず、spawn前に注入総量がbudget内か確認する。 | memory_context | prose | docs/skills/context-engineering.md:54-60; docs/skills/context-engineering.md:68-68 |
| `RB08-173` | context設計者はForwardへhistorical snapshot、全PLAN directory、raw DB dump・session logを注入せず、必要PLANとquery結果を使う。 | memory_context | prose | docs/skills/context-engineering.md:70-75 |
| `RB08-178` | R1担当者はscope外fileを読む必要があった場合、scope拡張をr1_notesへ記録する。 | evidence_claim | prose | docs/skills/reverse-r1.md:76-77 |
| `RB08-258` | release実装者は依存の意味成立順に従い、ownership確定後の非重複作業だけを並行化し、新module repositoryや別builderを先行作成しない。 | lane_delegation | prose | docs/governance/release-module-bundle-rollout-roadmap.md:19-39 |
| `RB08-321` | work graph担当者は実作業前にgraph・依存edge・capacity route・delegation-requestを確定し、独立review・worker terminal・親acceptanceを別identity/session/contextかつ同一HEADで順序通り閉じる。 | lane_delegation | gate | docs/governance/issue-213-work-graph-receipt-closure.md:5-8; docs/governance/issue-213-work-graph-receipt-closure.md:20-25 |
| `RB09-031` | System Synthesisの担当者は、各Issueを独立したPLAN／branch／PRで進め、要求正本、semantic kernel、workflow registry、Impact CI、model実験を同一PRへ混載してはならない。 | process_gate | prose | docs/governance/system-synthesis-rollout-roadmap.md:31-34 |
| `RB09-046` | #194の担当者は、MIC-FR-001のwork graph／capacity／projection実装を#92配下の#213〜#215の所有範囲として扱い、本Issueへ含めない。successor #213はopenのまま維持する。 | lane_delegation | prose | docs/governance/issue-194-worker-admission-closure.md:31-32 |
| `RB09-047` | HELIX-Bench task datasetの担当者は、runner、scorer、provider接続、routingを本作業の非対象として維持する。 | lane_delegation | prose | docs/governance/helix-bench-task-dataset-terminal-fullback-evidence.md:26-27 |
| `RB09-063` | hosted preflight nonce順序のfullback担当者は、新要求、runtime、nonce identity、provider境界を追加してはならない。 | lane_delegation | prose | docs/governance/hosted-preflight-nonce-order-terminal-fullback-evidence.md:21-24 |
| `RB09-075` | CI execution telemetryのfullback担当者は、要求意味、外部basic design、内部detailed designを変更せず、CI選定、scheduler、workflow、DB ingestionを本fullbackへ混載してはならない。 | lane_delegation | prose | docs/governance/ci-execution-telemetry-terminal-fullback-evidence.md:19-22 |
| `RC00-161` | hosted preflight判定は、hosted面の編集で対象pathが0件なら拒否する。 | safety_security | gate | src/runtime/hosted-preflight.ts:158-160; src/runtime/hosted-preflight.ts:173-180 |
| `RC01-069` | plan-body-substanceは、archived以外の読取り可能なPLANについて、frontmatter・最初のh1・空行・HTMLコメント開始行を除いた本文が0行の場合、不合格にする。 | process_gate | lint／doctor | src/lint/plan-body-substance.ts:36-60; src/lint/plan-body-substance.ts:63-82 |
| `RC01-083` | placeholder-depsは、statusが空・confirmed・completedの設計またはテスト設計でplaceholder_deps行にwaiting_layerを取得できない場合、不合格にする。 | process_gate | lint | src/lint/placeholder-deps.ts:29-34; src/lint/placeholder-deps.ts:67-81 |
| `RC02-031` | doctorのplan-body-substance checkは、frontmatterとタイトルだけで本文実体がないPLAN、または読込失敗を検出した場合に失敗する。 | evidence_claim | doctor | src/doctor/index.ts:726-749 |
| `RC02-047` | doctorのchange-set-integrity checkは、変更・依存graph・変更PLANの整合検査が不合格、root不在、または読込失敗の場合に失敗する。非Git repositoryでは検査を省略して成功とする。 | process_gate | doctor | src/doctor/index.ts:1211-1257 |
| `RC02-096` | doctorのplan-schedule checkは、全PLANへのlintPlanが不合格、root不在、またはlint例外の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:4730-4748 |
| `RC02-111` | doctorのfr-roadmap-coverage checkは、FR工程表被覆検査が不合格、対象0件、または残件bucket表を読めない場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:5020-5042 |
| `RC02-135` | doctorのroadmap checkは、登録工程表0件、孤児span・構造error、parkedを除くprogram未被覆、feature pack被覆不合格、または読込不能の場合に失敗する。gate未到達自体は進捗として表示する。 | process_gate | doctor | src/doctor/index.ts:5642-5724 |
| `RC03-106` | チームmember実行処理は、admission結果にworker_contextがない場合、provider起動前に失敗する。 | memory_context | gate | src/team/run.ts:506-508; src/team/run.ts:561-579 |
| `RC04-005` | 停止判定器は、反復数がcount規則の閾値以上ならループを停止する。 | process_gate | gate | src/orchestration/loop-stop-rules.ts:52-55 |
| `RC04-006` | 停止判定器は、費用がcost_budget規則の閾値以上ならループを停止する。 | process_gate | gate | src/orchestration/loop-stop-rules.ts:56-59 |
| `RC04-010` | 予算判定器は、反復数の上限が非有限・負数・ゼロ、または使用量が上限以上なら継続とworkerのpassを拒否する。 | process_gate | gate | src/orchestration/loop-effort-budget.ts:113-115; src/orchestration/loop-effort-budget.ts:161-201 |
| `RC04-011` | 予算判定器は、ツール呼出数の上限が非有限・負数・ゼロ、または使用量が上限以上なら継続とworkerのpassを拒否する。 | process_gate | gate | src/orchestration/loop-effort-budget.ts:113-115; src/orchestration/loop-effort-budget.ts:167-201 |
| `RC04-012` | 予算判定器は、費用上限が非有限・負数・ゼロ、または費用が上限以上なら継続とworkerのpassを拒否する。 | process_gate | gate | src/orchestration/loop-effort-budget.ts:113-115; src/orchestration/loop-effort-budget.ts:167-201 |
| `RC04-013` | 予算判定器は、経過時間上限が非有限・負数・ゼロ、または経過時間が上限以上なら継続とworkerのpassを拒否する。 | process_gate | gate | src/orchestration/loop-effort-budget.ts:113-115; src/orchestration/loop-effort-budget.ts:167-201 |
| `RC04-145` | 複雑度評価器は、uncertaintyが未指定なら警告する。 | process_gate | gate | src/workflow/contracts-extras.ts:125-144 |
| `RD00-007` | wrapper admissionは、worker context必須指定時にcontextがない場合、起動を拒否する。 | memory_context | gate | src/runtime/adapter.ts:447-450 |
| `RD00-049` | atomic slice評価は、behavior contractが複数ある場合、multiple_behaviorsとし、他の復旧対象違反がなければsplit_requiredにする。 | process_gate | gate | src/runtime/atomic-slice-admission.ts:297-297; src/runtime/atomic-slice-admission.ts:333-339 |
| `RD00-052` | atomic slice評価は、必須companion path集合と実際の集合が一致しない場合、拒否する。 | process_gate | gate | src/runtime/atomic-slice-admission.ts:313-315 |
| `RD00-053` | atomic slice評価は、期待pathが実際の変更集合から欠けている場合、拒否する。 | process_gate | gate | src/runtime/atomic-slice-admission.ts:316-318 |
| `RD00-054` | atomic slice評価は、追加pathがあるのにscope拡張receiptがない場合、拒否する。 | escalation_authority | gate | src/runtime/atomic-slice-admission.ts:245-251 |
| `RD00-056` | atomic slice評価は、scope拡張receiptの識別情報が不正、作成者とreviewerが空または同一、理由が12文字未満、追加path集合が不一致のいずれかなら拒否する。 | escalation_authority | gate | src/runtime/atomic-slice-admission.ts:256-269 |
| `RD02-092` | native graph監査器は、本文のblocked_byまたはblocksがnative側で欠落している場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:302-307; src/runtime/issue-hierarchy.ts:361-376 |
| `RD02-093` | native graph監査器は、本文にないblocked_byまたはblocksがnative側にある場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:309-315; src/runtime/issue-hierarchy.ts:361-376 |
| `RD02-096` | 階層関係移行器は、candidateのblocksまたはblockedBy配列から既存edgeが削除される場合に拒否する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:506-510 |
| `RD02-100` | 階層・依存整合監査器は、関係を持つactive Issueに依存契約がない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:628-642 |
| `RD02-101` | 階層・依存整合監査器は、blocked_by集合とdepends_on集合が異なる場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:643-651 |
| `RD02-102` | 階層・依存整合監査器は、双方のblocks集合が異なる場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:652-660 |
| `RD02-106` | 依存監査器は、depends_onまたはblocksの対象Issueが母集団に存在しない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:797-806; src/runtime/issue-hierarchy.ts:822-831 |
| `RD02-107` | 依存監査器は、depends_onと相手のblocks、またはblocksと相手のdepends_onに逆関係がない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:807-813; src/runtime/issue-hierarchy.ts:832-838 |
| `RD02-108` | 依存監査器は、closed Issueがopen Issueへ依存している場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:814-820 |
| `RD02-109` | 依存監査器は、requireReferencedPlansがfalseでないとき、Issue参照先PLANが存在しなければ失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:840-847 |
| `RD02-119` | 階層監査器は、root Issueが親を持つ場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1051-1057 |
| `RD02-120` | 階層監査器は、root以外のIssueが親を持たない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1058-1064 |
| `RD02-121` | 階層監査器は、指定された親Issueが存在しない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1065-1072 |
| `RD02-122` | 階層監査器は、blocksまたはblocked_byの対象Issueが存在しない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1075-1083 |
| `RD02-123` | 階層監査器は、blocksとblocked_byの逆関係が存在しない場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1084-1100 |
| `RD02-126` | 階層監査器は、親Issueの子が100件を超える場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1123-1131 |
| `RD02-127` | 階層監査器は、親参照に循環を検出した場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1133-1145 |
| `RD02-128` | 階層監査器は、親参照の深さが8を超える場合に失敗とする。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1146-1155 |
| `RD02-129` | 階層監査器は、open・activeのtaskまたはfindingで、子がなく、全blockerがclosedで、当該Issueにfindingがない場合だけready leafへ選出する。 | process_gate | gate | src/runtime/issue-hierarchy.ts:1160-1172 |
| `RD02-130` | 作業preflightは、目的・工程層・Forward復帰先・受入検証・作業源・許可scopeのいずれかが欠ける場合にblockerを返す。 | process_gate | gate | src/runtime/legacy-adoption.ts:254-268 |
| `RD02-157` | 継続実行判定器は、trigger・queue lock・timebox・budget profile・停止条件・検証証拠のいずれかが欠ける場合に拒否する。 | process_gate | gate | src/runtime/legacy-adoption.ts:498-513 |
| `RD02-277` | resident assignment投影器は、同一repository・scopeに複数のactive branchがある場合に失敗とする。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:210-216; src/runtime/resident-lane-assignment.ts:224-226 |
| `RD03-062` | quota handoverは、消費量がquota threshold以上の場合、拒否する。 | tooling_runtime | gate | src/runtime/slot-scheduler-quota-handover.ts:510-512 |
| `RD05-008` | branch-kindは、docsまたはchore branchでdocs/skills配下のMarkdownを変更し、変更対象PLANがない場合、失敗させる。 | process_gate | lint | src/lint/branch-kind.ts:288-302 |
| `RD05-009` | branch-kindは、PLANを必須とするbranch種別で変更対象PLANが一つもない場合、失敗させる。 | process_gate | lint | src/lint/branch-kind.ts:162-190; src/lint/branch-kind.ts:314-321 |
| `RD06-101` | document-agent-metadata lintは、同一文書への自己参照、または対象文書間の外部参照cycleを検出した場合、errorとして失敗させる。 | memory_context | lint | src/lint/document-agent-metadata.ts:99-109; src/lint/document-agent-metadata.ts:185-202 |
| `RD06-102` | document-agent-metadata lintは、document_agentが未指定または解析不能の場合、失敗させる。 | memory_context | lint | src/lint/document-agent-metadata.ts:134-142; src/lint/document-agent-metadata.ts:277-283 |
| `RD06-103` | document-agent-metadata lintは、文書が実際に定義する宣言IDがdocument_agent.definesに含まれない場合、失敗させる。 | process_gate | lint | src/lint/document-agent-metadata.ts:144-155 |
| `RD06-104` | document-agent-metadata lintは、外部宣言参照から導出した先行文書がread_firstにない場合、失敗させる。 | memory_context | lint | src/lint/document-agent-metadata.ts:156-165 |
| `RD06-105` | document-agent-metadata lintは、read_firstに参照関係から導出されない文書が残っている場合、失敗させる。 | memory_context | lint | src/lint/document-agent-metadata.ts:159-169 |
| `RD08-063` | left-arm carry lintは、元PLANのdependencies.requiresに解消PLANが含まれない場合、失敗させる。 | process_gate | lint | src/lint/left-arm-carry-log.ts:425-432 |
| `RD09-076` | tombstone検証は、解消PLANのgeneratesがauthorityファイルをconfigとして、対象PLANファイルをmarkdown_docとして宣言していない場合、解消証拠を拒否する。 | process_gate | lint | src/lint/plan-specific-vpair-binding.ts:313-327 |
| `RD10-061` | lintは工程表spanのplan_idが既知PLAN集合に存在しない場合、孤児spanとしてerrorを返す。 | process_gate | lint | src/lint/roadmap-registry.ts:73-78 |
| `RD10-063` | lintは登録工程表も明示parkもないprogram bandを未被覆として警告表示する。 | process_gate | lint／doctor | src/lint/roadmap-registry.ts:196-213; src/lint/roadmap-registry.ts:266-284 |
| `RE01-024` | 設計PLANの作成者は一つのPLANで一つのsub-documentを扱い、異なるsub-documentを混載しない。 | behavior_discipline | prose／lint | docs/governance/helix-harness-requirements_v1.2.md:450-450; docs/governance/helix-harness-requirements_v1.2.md:634-650 |
| `RE01-030` | PLAN作成者は工程表と実施手順にレビューを含め、各手順をparallelまたはserialとして理由を記録する。 | lane_delegation | lint | docs/governance/helix-harness-requirements_v1.2.md:512-516 |
| `RE01-123` | 見積担当者は三軸の最大値でsizeを決め、XLは分割し、required skillをPLANへ必ず記録する。 | lane_delegation | prose／lint | docs/governance/helix-harness-requirements_v1.2.md:1732-1738 |
| `RF00-002` | ジョブ取得器はqueued状態だけを取得対象とし、priorityの昇順、同値ならcreated_atの昇順で先頭1件を選ぶ。claimへの更新もqueued状態の行だけに限定する。 | lane_delegation | gate | src/orchestration/job-queue.ts:84-95 |
| `RG09-004` | add-design担当者は、機能追加時にcoding-ruleへの影響をPLANへ記録する。 | process_gate | prose | docs/governance/coding-rules.md:15-15 |
| `RG12-004` | work graphの実行制御は、dependencyの前倒しをfail-closeで拒否する。 | process_gate | gate | docs/governance/issue-213-work-graph-receipt-closure.md:23-25 |
| `RG12-005` | #214のschedulerと#215のevent projection／replayの実装担当者は、#213で実装したwork graph leaseと三段receiptを土台に接続する。 | process_gate | prose | docs/governance/issue-213-work-graph-receipt-closure.md:43-44 |
| `RG14-007` | Functional Release Sliceの導入担当者は、承認後の差分対象をRLS-02／03／05／09／11／12／13に限定する。 | process_gate | prose | docs/governance/release-module-bundle-rollout-roadmap.md:17-17 |
| `RG19-006` | 設計者はPLANのsizeを最適化目標ではなくgate入力として扱い、曖昧な大規模PLANをgovernance違反と判断する。 | behavior_discipline | prose | docs/skills/system-design-sizing.md:66-67 |

## 副として対応づいた規則（149件）

`RA-126`、`RA-127`、`RA-143`、`RA-149`、`RA-150`、`RA-201`、`RA-207`、`RA-211`、`RA-298`、`RB0-061`、`RB0-073`、`RB0-074`、`RB0-089`、`RB0-100`、`RB0-109`、`RB0-113`、`RB0-115`、`RB0-116`、`RB0-118`、`RB0-127`、`RB0-154`、`RB0-155`、`RB0-169`、`RB04-018`、`RB04-027`、`RB04-052`、`RB04-057`、`RB04-068`、`RB04-069`、`RB04-071`、`RB04-087`、`RB04-148`、`RB05-011`、`RB05-074`、`RB05-111`、`RB05-196`、`RB05-203`、`RB06-105`、`RB06-162`、`RB06-259`、`RB06-301`、`RB07-090`、`RB07-093`、`RB07-139`、`RB07-168`、`RB07-169`、`RB07-174`、`RB07-176`、`RB07-177`、`RB07-213`、`RB07-216`、`RB07-234`、`RB07-250`、`RB07-316`、`RB08-025`、`RB08-030`、`RB08-103`、`RB08-104`、`RB08-119`、`RB08-130`、`RB08-166`、`RB08-262`、`RB08-300`、`RB08-319`、`RB08-339`、`RB09-022`、`RB09-023`、`RB09-024`、`RB09-026`、`RB09-027`、`RB09-028`、`RB09-041`、`RB09-042`、`RB09-044`、`RC0-121`、`RC00-075`、`RC00-187`、`RC00-188`、`RC00-213`、`RC01-084`、`RC01-141`、`RC01-142`、`RC01-143`、`RC02-136`、`RC03-095`、`RC03-096`、`RC03-097`、`RC03-101`、`RC03-111`、`RC03-119`、`RC04-002`、`RC04-014`、`RC04-016`、`RC04-032`、`RC04-110`、`RC04-249`、`RC04-250`、`RD00-019`、`RD00-051`、`RD00-055`、`RD01-119`、`RD01-120`、`RD02-080`、`RD02-085`、`RD02-086`、`RD02-087`、`RD02-088`、`RD02-089`、`RD02-090`、`RD02-091`、`RD02-094`、`RD02-095`、`RD02-097`、`RD02-104`、`RD02-114`、`RD02-131`、`RD02-151`、`RD02-270`、`RD02-298`、`RD03-045`、`RD03-046`、`RD03-047`、`RD03-048`、`RD03-049`、`RD03-050`、`RD04-008`、`RD04-010`、`RD04-012`、`RD04-068`、`RD04-069`、`RD04-109`、`RD05-030`、`RD06-110`、`RD06-111`、`RD07-009`、`RD08-153`、`RD09-059`、`RD09-087`、`RD09-088`、`RD09-089`、`RD10-064`、`RD11-138`、`RD11-197`、`RE01-007`、`RE01-015`、`RE01-031`、`RE01-252`、`RF01-009`、`RG16-014`
