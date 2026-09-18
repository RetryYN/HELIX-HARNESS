---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 9d0c95976a9295bccdaf7df223c5f15cd4cae4295ad84d4f54afb9aeda34016c
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSP-06
group: OS推進
product: OS
atoms_primary: 69
atoms_secondary: 34
issue_projection: #1859
---

# RUL-OSP-06（OS推進／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

複数agentの実行計画を検証する。並列の上限、直列化の依存、実行modeを確かめ、不整合な計画を実行しない。

## 主として対応づいた規則（69件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-095` | runtime modeはstandalone・claude-only・codex-only・hybridのいずれかとする。 | tooling_runtime | prose | n/a | 旧runtime mode enum | — | AGENTS.md:172-177; .claude/CLAUDE.md:106-106 | A／gpt-6-astra |
| `RA-146` | /ship実行者はcode-reviewer・security-audit・qa-testの3 specialistを同じturnで並列起動する。 | lane_delegation | prose | n/a | /ship Phase A | `RUL-OSP-01` | .claude/commands/ship.md:8-10; .claude/commands/ship.md:18-32; .claude/commands/ship.md:57-57 | A／gpt-6-astra |
| `RA-148` | /shipのfan-out省略は2files以下・diff50行未満・auth/payments/data access/config/env非変更をすべて満たす場合だけ許す。 | lane_delegation | prose | n/a | /ship省略閾値 | — | .claude/commands/ship.md:61-62 | A／gpt-6-astra |
| `RA-149` | teamはfile_conflict・downstream_dependency・shared_stateのいずれかがtrueならstrategyをsequentialにする。 | lane_delegation | prose／config | n/a | teamDefinitionSchema serialization | `RUL-TKT-02` | .helix/teams/example-review-team.yaml:4-12 | A／gpt-6-astra |
| `RA-150` | example-review-teamはmax_parallel 8とし、seの実装後にtl review、その後qaを実行する。 | lane_delegation | config | n/a | codex-se、pmo-sonnet、qa-test、serialize_after | `RUL-TKT-02` | .helix/teams/example-review-team.yaml:6-24 | A／gpt-6-astra |
| `RA-151` | agent-guardは許可済かつ種別ありの呼出しだけslot記録し、並列上限超過は警告に留め、slot記録失敗で呼出しを止めない。 | lane_delegation | hook | n/a | recordGuardFire、DEFAULT_MAX_PARALLEL、IMP-050 | `RUL-COR-04` | .claude/hooks/agent-guard.ts:71-90 | A／gpt-6-astra |
| `RB04-148` | 同一fileへの書込み・前段成果への依存・共有state変更のいずれかがあるtaskは直列化し、すべてない場合だけ上限8で並列化する。 | lane_delegation | prose | n/a | mustSerialize、最大並列8 | `RUL-TKT-02`、`RUL-OSM-06` | docs/governance/helix-harness-concept_v3.1.md:1244-1244 | B04／gpt-6-astra |
| `RB05-115` | 当該調査の実行者は利用可能slot最大でsubagentを並列利用し、全体と項目別の進捗を百分率で報告する。 | lane_delegation | prose | n/a | HC-CHAT-033の作業限定execution contract | `RUL-FRM-04` | docs/governance/infinity-loop-source-capability-ledger.md:67-67; docs/governance/infinity-loop-source-capability-ledger.md:269-271 | B05／gpt-6-astra |
| `RB06-124` | specialist編成は最小team以外と自己検証を拒否する。 | lane_delegation | prose | fail_close | 未実装SpecialistMusterGate | `RUL-OSA-01` | docs/governance/infinity-loop-assertion-coverage-ledger.md:60-60; docs/governance/infinity-loop-assertion-coverage-ledger.md:128-128 | B06／gpt-6-astra |
| `RB07-169` | 管理者は並列委譲前にcritical pathと共有書込み・generates非重複を確認し、直列・並列の分担を工程表とreview_evidenceへ記録する。 | lane_delegation | prose | n/a | PLAN工程表 | `RUL-TKT-02` | docs/skills/project-management.md:62-67 | B07／gpt-6-astra |
| `RB07-178` | 管理者はpair-freeze・trace-freeze・acceptを常に直列stepとして配置する。 | process_gate | prose | n/a | 旧gate工程表 | `RUL-FRM-01` | docs/skills/project-management.md:116-117 | B07／gpt-6-astra |
| `RB07-213` | 計画者は工程を番号付きで直列・並列に分類し、直列を順に完了させ、pair-freezeとtrace-freezeの周辺へ直列gateを置く。 | process_gate | prose | n/a | §工程表 | `RUL-TKT-02`、`RUL-FRM-01` | docs/skills/planning-and-task-breakdown.md:56-72 | B07／gpt-6-astra |
| `RB08-292` | schedulerはcapacity範囲外・依存前倒し・無制限queue・lease二重所有・遅いhandover・packet欠落・ack再配送・failure隔離違反・不足capacity証拠・時刻逆行を拒否する。 | process_gate | gate | fail_close | capacity 1〜8、SCHEDULER_* | `RUL-COR-03`、`RUL-COR-04` | docs/governance/issue-214-slot-scheduler-closure.md:26-29 | B08／gpt-6-astra |
| `RC0-109` | Team runnerは、hybrid以外のmodeによるteam runを不合格にする。 | lane_delegation | gate | fail_close | helix team run／hybrid | — | src/team/run.ts:316-322; src/team/run-policy.ts:11-11 | C／gpt-6-astra |
| `RC0-110` | Team runnerは、hybrid teamにClaudeとCodexの両方が含まれない場合、不合格にする。 | lane_delegation | gate | fail_close | claude／codex provider | — | src/team/run.ts:324-333; src/team/run-policy.ts:12-13 | C／gpt-6-astra |
| `RC0-111` | Team runnerは、同じrole/providerが重複し、ownershipが欠落または既存ownershipと重複する場合、不合格にする。 | lane_delegation | gate | fail_close | duplicate role/provider assignment | `RUL-OSP-03` | src/team/run.ts:335-346 | C／gpt-6-astra |
| `RC0-113` | Team runnerは、serialize_afterの依存先が見つからない場合、実行計画を不合格にする。 | lane_delegation | gate | fail_close | serialize_after target not found | — | src/team/run.ts:280-285; src/team/run.ts:438-457 | C／gpt-6-astra |
| `RC0-114` | Team runnerは、serialize_afterが複数memberへ解決される場合、実行計画を不合格にする。 | lane_delegation | gate | fail_close | serialize_after target is ambiguous | — | src/team/run.ts:253-262; src/team/run.ts:286-289 | C／gpt-6-astra |
| `RC0-115` | Team runnerは、member依存関係のcycleを検出した場合、実行計画を不合格にする。 | lane_delegation | gate | fail_close | team dependency cycle detected | — | src/team/run.ts:273-277; src/team/run.ts:438-457 | C／gpt-6-astra |
| `RC0-117` | Team runnerは、execute指定時にruntime adapter経由で実行できないmemberがいる場合、実行計画を不合格にする。 | lane_delegation | gate | fail_close | member is not executable through runtime adapter | `RUL-OSP-03` | src/team/run.ts:448-457 | C／gpt-6-astra |
| `RC0-118` | Team runnerは、dry-runとして作成した計画の実行を拒否する。 | lane_delegation | gate | fail_close | execute=trueによるplan再構築 | — | src/team/run.ts:584-599; src/team/run-policy.ts:16-17 | C／gpt-6-astra |
| `RC0-119` | Team runnerは、計画のokまたはexecutableがfalseの場合、memberを起動せず実行失敗を返す。 | lane_delegation | gate | fail_close | TEAM_RUN_NOT_EXECUTABLE_MESSAGE | `RUL-OSP-03` | src/team/run.ts:600-610 | C／gpt-6-astra |
| `RC0-120` | Team runnerは、serialize_afterの依存先が失敗した場合、依存memberを実行せずfailedとして記録する。 | lane_delegation | gate | fail_close | dependency failed | — | src/team/run.ts:619-649 | C／gpt-6-astra |
| `RC00-137` | session board生成器は、未解放running slotが起動からstale閾値を超えている場合に警告する。 | lane_delegation | gate | warn | fired_at起点のstale判定 | `RUL-OSA-06` | src/runtime/agent-session-command-center.ts:55-64; src/runtime/agent-session-command-center.ts:134-139 | C00／gpt-6-astra |
| `RC02-027` | doctorのagent-slots checkは、既定期限を超えてreleaseされていないslotがあれば警告し、doctorの成功判定は落とさない。 | lane_delegation | doctor | warn | DEFAULT_STALE_MINUTESを使用し、コメント上は5分 | `RUL-OSA-06` | src/doctor/index.ts:633-647 | C02／gpt-6-astra |
| `RC02-147` | consumer doctorのconsumer-team-run-surface checkは、team schema不合格、nameがdefault-hybrid以外、Codex seまたはpmo/Claude tl・qa不足、hybrid実行計画不合格、dry-runでない、または両provider不足の場合に失敗する。 | lane_delegation | doctor | fail_close | default-hybrid、engine prefix codex/pmo-/claude、provider codex/claude | `RUL-OSA-06` | src/doctor/index.ts:6241-6266 | C02／gpt-6-astra |
| `RC03-095` | チーム実行計画の依存関係検査は、serialize_afterの依存先を辿って循環が見つかった場合、計画を不適格とする。 | lane_delegation | gate | fail_close | team dependency cycle detected | `RUL-TKT-02` | src/team/run.ts:265-300; src/team/run.ts:457-466 | C03／gpt-6-astra |
| `RC03-096` | チーム実行計画の依存関係検査は、serialize_afterが指すroleまたはengineに一致するmemberが存在しない場合、計画を不適格とする。 | lane_delegation | gate | fail_close | serialize_after target not found | `RUL-TKT-02` | src/team/run.ts:253-262; src/team/run.ts:280-285; src/team/run.ts:457-466 | C03／gpt-6-astra |
| `RC03-097` | チーム実行計画の依存関係検査は、serialize_afterに一致するmemberが複数ある場合、計画を不適格とする。 | lane_delegation | gate | fail_close | serialize_after target is ambiguous | `RUL-TKT-02` | src/team/run.ts:253-262; src/team/run.ts:286-289; src/team/run.ts:457-466 | C03／gpt-6-astra |
| `RC03-099` | チーム実行検証処理は、実行modeがhybridでない場合、チーム実行を不適格とする。 | lane_delegation | gate | fail_close | 旧team runのhybrid専用制約 | — | src/team/run.ts:316-322; src/team/run.ts:362-362 | C03／gpt-6-astra |
| `RC03-100` | チーム実行検証処理は、hybrid modeでClaudeとCodexの両providerがmemberに含まれない場合、不適格とする。 | lane_delegation | gate | fail_close | runtimeProvidersはclaudeとcodexに固定 | — | src/team/run.ts:324-333 | C03／gpt-6-astra |
| `RC03-101` | チーム実行検証処理は、同じrole/providerのmemberが再登場し、そのmemberのownershipが空か同じownershipが既出である場合、不適格とする。 | lane_delegation | gate | fail_close | ownershipの文字列一致を検査し、実パスの非重複までは検証しない | `RUL-TKT-02` | src/team/run.ts:335-346 | C03／gpt-6-astra |
| `RC03-116` | チームmember実行処理は、起動・実行・slot操作のtry区間で例外が発生した場合、失敗結果を返し、取得済みslotがあればfailedとして解放する。 | tooling_runtime | gate | fail_close | catch内のreleaseSlotとstatus=failed | `RUL-DEV-01` | src/team/run.ts:504-579 | C03／gpt-6-astra |
| `RC03-117` | チーム計画実行処理は、planがdry-runである場合、memberを起動せず失敗を返す。 | tooling_runtime | gate | fail_close | execute=trueで再構築することを要求するメッセージ | `RUL-OSP-03` | src/team/run.ts:584-598 | C03／gpt-6-astra |
| `RC03-118` | チーム計画実行処理は、plan.okまたはplan.executableが偽の場合、memberを起動せず失敗を返す。 | process_gate | gate | fail_close | TEAM_RUN_NOT_EXECUTABLE_MESSAGE | `RUL-OSP-03` | src/team/run.ts:600-609 | C03／gpt-6-astra |
| `RC03-119` | 逐次チーム実行処理は、serialize_afterが示す依存memberが失敗している場合、後続memberを起動せずfailedとする。 | lane_delegation | gate | fail_close | roleとengineをfailedDependenciesへ登録して伝播 | `RUL-TKT-02` | src/team/run.ts:619-650 | C03／gpt-6-astra |
| `RC04-109` | pair-agentは、実行対象のphaseが存在しなければ例外を送出する。 | process_gate | gate | fail_close | — | `RUL-COR-04` | src/orchestration/pair-agent.ts:500-505 | C04／gpt-6-astra |
| `RC04-179` | 二段階agent設計の統合器は、phase1・phase2・handoffが揃わなければ統合を拒否する。 | lane_delegation | gate | fail_close | — | `RUL-OSP-01` | src/workflow/contracts.ts:783-798 | C04／gpt-6-astra |
| `RC04-211` | workflow envelope検証器は、concurrency_limitがcapacity_limitを超えたらactivationを拒否する。 | tooling_runtime | gate | fail_close | — | — | src/workflow/universal-workflow-envelope.ts:397-404; src/workflow/universal-workflow-envelope.ts:425-429 | C04／gpt-6-astra |
| `RD00-001` | adapterは、実行モードが対象providerを含まない場合、そのproviderを利用不可と判定する。 | tooling_runtime | config | fail_close | claude-only／codex-only／hybrid | `RUL-OSP-02` | src/runtime/adapter.ts:175-178 | D00／gpt-6-astra |
| `RD00-043` | slot管理は、active数が並列上限以上の場合、超過判定を返す。guard記録経路ではagent_guard由来のactive数を用い、既定上限は8とする。 | lane_delegation | hook | warn | DEFAULT_MAX_PARALLEL=8 | — | src/runtime/agent-slots.ts:54-55; src/runtime/agent-slots.ts:261-270; src/runtime/agent-slots.ts:310-315 | D00／gpt-6-astra |
| `RD03-043` | schedulerは、queue_limitが正の整数でない場合、dispatchとqueue追加を拒否する。 | tooling_runtime | gate | fail_close | SCHEDULER_QUEUE_UNBOUNDED。 | `RUL-COR-04` | src/runtime/slot-scheduler-quota-handover.ts:364-371; src/runtime/slot-scheduler-quota-handover.ts:402-404; src/runtime/slot-scheduler-quota-handover.ts:444-447 | D03／gpt-6-astra |
| `RD03-044` | dispatch admissionは、capacityが1から8の整数でない場合、拒否する。 | tooling_runtime | gate | fail_close | MAX_SCHEDULER_CAPACITY=8。 | `RUL-COR-04` | src/runtime/slot-scheduler-quota-handover.ts:25-26; src/runtime/slot-scheduler-quota-handover.ts:405-411 | D03／gpt-6-astra |
| `RD03-045` | dispatch admissionは、候補または実行中taskのconflict scopeが不正、あるいはready dependency一覧が不正な場合、拒否する。 | lane_delegation | gate | fail_close | validConflictScopeとvalidIdList。 | `RUL-TKT-02`、`RUL-COR-04` | src/runtime/slot-scheduler-quota-handover.ts:333-342; src/runtime/slot-scheduler-quota-handover.ts:412-423 | D03／gpt-6-astra |
| `RD03-046` | dispatch admissionは、候補taskの依存IDがすべてready一覧に含まれない場合、拒否する。 | process_gate | gate | fail_close | SCHEDULER_DEPENDENCY_NOT_READY。 | `RUL-TKT-02` | src/runtime/slot-scheduler-quota-handover.ts:415-418 | D03／gpt-6-astra |
| `RD03-047` | dispatch admissionは、候補と実行中taskが同じIssue IDを持つ場合、競合として拒否する。 | lane_delegation | gate | fail_close | issue_idの完全一致。 | `RUL-TKT-02` | src/runtime/slot-scheduler-quota-handover.ts:351-352; src/runtime/slot-scheduler-quota-handover.ts:424-425 | D03／gpt-6-astra |
| `RD03-048` | dispatch admissionは、候補と実行中taskが同じbehavior contract IDを持つ場合、競合として拒否する。 | lane_delegation | gate | fail_close | behavior_contract_idの完全一致。 | `RUL-TKT-02` | src/runtime/slot-scheduler-quota-handover.ts:351-353; src/runtime/slot-scheduler-quota-handover.ts:424-425 | D03／gpt-6-astra |
| `RD03-049` | dispatch admissionは、候補と実行中taskが同じresponsibility ownerを持つ場合、競合として拒否する。 | lane_delegation | gate | fail_close | responsibility_ownerの完全一致。 | `RUL-TKT-02` | src/runtime/slot-scheduler-quota-handover.ts:351-354; src/runtime/slot-scheduler-quota-handover.ts:424-425 | D03／gpt-6-astra |
| `RD03-050` | dispatch admissionは、候補と実行中taskのshared authority IDが重なる場合、競合として拒否する。 | lane_delegation | gate | fail_close | shared_authority_idsの集合交差。 | `RUL-TKT-02` | src/runtime/slot-scheduler-quota-handover.ts:355-356; src/runtime/slot-scheduler-quota-handover.ts:424-425 | D03／gpt-6-astra |
| `RD03-051` | dispatch admissionは、候補と実行中taskのallowed pathが一致または親子関係にある場合、競合として拒否する。 | lane_delegation | gate | fail_close | slash区切りの文字列prefix比較。 | `RUL-OSM-06` | src/runtime/slot-scheduler-quota-handover.ts:345-356; src/runtime/slot-scheduler-quota-handover.ts:424-425 | D03／gpt-6-astra |
| `RD03-052` | dispatch admissionは、実行中row数がcapacity以上の場合、新規dispatchを拒否する。 | tooling_runtime | gate | fail_close | SCHEDULER_CAPACITY_EXCEEDED。 | — | src/runtime/slot-scheduler-quota-handover.ts:428-430 | D03／gpt-6-astra |
| `RD03-057` | queue追加は、待機件数がqueue_limit以上の場合、既存entriesを変更せずbackpressureを返す。 | tooling_runtime | gate | fail_close | SCHEDULER_QUEUE_BACKPRESSURE。 | — | src/runtime/slot-scheduler-quota-handover.ts:440-458 | D03／gpt-6-astra |
| `RD03-239` | Windows canary queue評価は、既存active数またはwaiting数がpolicy上限を超えている場合、不確実状態として拒否する。 | tooling_runtime | gate | fail_close | max_active/max_waitingとの比較。 | `RUL-COR-04` | src/runtime/windows-lite-canary-admission.ts:305-307 | D03／gpt-6-astra |
| `RD03-241` | Windows canary queue評価は、activeが満杯でwaitingも上限に達している場合、backpressureで候補を拒否する。 | tooling_runtime | gate | fail_close | backpressure_dispositionにかかわらず同じ失敗コードを返す。 | — | src/runtime/windows-lite-canary-admission.ts:316-329 | D03／gpt-6-astra |
| `RD04-010` | 委譲判定器は、必須依存edgeのいずれかがlane ready receiptの完了集合に無い場合に拒否する。 | process_gate | gate | fail_close | dependency_edge_ids | `RUL-TKT-02` | src/runtime/work-graph-receipt-acceptance.ts:331-334 | D04／gpt-6-astra |
| `RD09-128` | proposal-document-coverageは、agent-orchestrationを期待するシナリオでagent-runtime-reviewがrequired_gatesにない場合、失敗させる。 | lane_delegation | lint | fail_close | agent-runtime-review | `RUL-OSM-02` | src/lint/proposal-document-coverage-policy.ts:76-76; src/lint/proposal-document-coverage.ts:169-178 | D09／gpt-6-astra |
| `RE01-031` | 計画者はファイル競合・依存・共有状態がなければ最大8並列を活用し、「重い」という理由だけで直列化してはならない。 | lane_delegation | prose | n/a | 最大8並列という旧運用上限 | `RUL-TKT-02` | docs/governance/helix-harness-requirements_v1.2.md:512-516 | E01／claude-opus |
| `RF01-004` | pair-agentは、executeがfalseの場合、executorを呼ばずplannedの工程一覧を返し、最終判定をnullにする。 | tooling_runtime | gate | n/a | executeフラグとplanned結果 | — | src/orchestration/pair-agent.ts:463-480 | F01／claude-opus |
| `RF01-016` | proposalチーム生成器は、生成対象laneのparallel_slotsが1未満の場合も、member生成用slot数を最低1にする。 | lane_delegation | gate | n/a | Math.max(1, lane.parallel_slots)による下限 | — | src/team/launch-policy.ts:159-162 | F01／claude-opus |
| `RF01-017` | proposalチーム生成器は、serialize_afterを持たないmember数からmax_parallelを求め、最低1・最高8に制限する。 | tooling_runtime | gate | n/a | proposal-coverage-teamの並列数1〜8 | — | src/team/launch-policy.ts:196-201 | F01／claude-opus |
| `RF01-018` | 通常の自動チーム生成器は、難易度がcomplexまたはcriticalの場合、tlのレビューをseの後に直列化する。 | lane_delegation | config | n/a | se・tlのroleとserialize_after | `RUL-OSA-01` | src/team/launch-policy.ts:79-96 | F01／claude-opus |
| `RF01-021` | チーム起動推薦器は、hybrid modeでproposal lane指定がなく、risk語に一致せず難易度がtrivialまたはsimpleの場合、チーム起動を推薦しない。 | lane_delegation | config／gate | n/a | RISK_TERMSと旧難易度区分 | `RUL-OSP-02` | src/team/launch-policy.ts:214-261 | F01／claude-opus |
| `RF01-022` | チーム起動推薦器は、hybrid modeでproposal lane指定がなく、taskがrisk語に一致するか難易度がstandard・complex・criticalの場合、cross-providerチームの起動を推薦する。 | lane_delegation | config／gate | n/a | RISK_TERMSの部分文字列一致とauto-speed-team | `RUL-OSA-01` | src/team/launch-policy.ts:32-54; src/team/launch-policy.ts:225-274 | F01／claude-opus |
| `RF01-030` | チーム実行計画生成器は、mustSerializeがtrueを返すかserialize_afterの指定が一件でもある場合、要求されたstrategyにかかわらずsequentialへ切り替える。 | lane_delegation | gate | n/a | mustSerialize判定とチーム全体のsequential化 | — | src/team/run.ts:377-386 | F01／claude-opus |
| `RF01-031` | チーム実行処理は、parallel strategyの場合、memberをmax_parallel件ずつのbatchで実行し、当該batchの全実行が返るまで次のbatchを開始しない。 | tooling_runtime | gate | n/a | max_parallel単位のPromise.all batch | — | src/team/run.ts:612-617 | F01／claude-opus |
| `RG16-007` | 委譲者は、適切に構造化した並列分割の方が安い場合、逐次委譲を行わない。 | lane_delegation | prose | n/a | — | `RUL-OSA-08` | docs/skills/agent-cost-design.md:74-78 | G16／claude-opus |
| `RG16-014` | team設計者は、順序依存のない独立成果物を生成する場合はparallelを使い、後続stepが先行stepの検証済み出力を必要とする場合はserialを使う。 | lane_delegation | prose | n/a | team definitionのparallel／serial mode | `RUL-TKT-02` | docs/skills/agent-teams.md:74-78; docs/skills/agent-teams.md:95-96 | G16／claude-opus |
| `RG16-015` | team設計者は、parallelとserialの両modeが必要な場合、単一team definitionに混在させず二つのteam runへ分割する。 | tooling_runtime | prose | n/a | 単一team definitionでmodeを混在できない旧team runner | — | docs/skills/agent-teams.md:77-79 | G16／claude-opus |
| `RG16-016` | team実行担当者は、初回のlive実行前にteam definitionを指定した実行をdry-run相当でtestする。 | process_gate | prose | n/a | helix team run --definition <path>、--dry-run相当 | `RUL-FRM-05` | docs/skills/agent-teams.md:88-88 | G16／claude-opus |

## 副として対応づいた規則（34件）

`RA-091`、`RA-125`、`RA-135`、`RA-202`、`RB04-012`、`RB04-015`、`RB04-024`、`RB04-149`、`RB04-241`、`RB06-102`、`RB07-170`、`RB08-258`、`RB08-321`、`RC0-112`、`RC0-116`、`RC03-098`、`RC03-102`、`RC03-103`、`RC03-104`、`RC03-120`、`RC04-034`、`RC04-104`、`RD03-041`、`RD03-042`、`RD03-053`、`RD03-056`、`RD03-062`、`RD03-074`、`RD03-075`、`RD03-232`、`RD03-237`、`RD03-240`、`RD09-134`、`RE01-030`
