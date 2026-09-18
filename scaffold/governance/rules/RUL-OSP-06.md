---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
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

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-095` | runtime modeはstandalone・claude-only・codex-only・hybridのいずれかとする。 | tooling_runtime | prose | AGENTS.md:172-177; .claude/CLAUDE.md:106-106 |
| `RA-146` | /ship実行者はcode-reviewer・security-audit・qa-testの3 specialistを同じturnで並列起動する。 | lane_delegation | prose | .claude/commands/ship.md:8-10; .claude/commands/ship.md:18-32; .claude/commands/ship.md:57-57 |
| `RA-148` | /shipのfan-out省略は2files以下・diff50行未満・auth/payments/data access/config/env非変更をすべて満たす場合だけ許す。 | lane_delegation | prose | .claude/commands/ship.md:61-62 |
| `RA-149` | teamはfile_conflict・downstream_dependency・shared_stateのいずれかがtrueならstrategyをsequentialにする。 | lane_delegation | prose／config | .helix/teams/example-review-team.yaml:4-12 |
| `RA-150` | example-review-teamはmax_parallel 8とし、seの実装後にtl review、その後qaを実行する。 | lane_delegation | config | .helix/teams/example-review-team.yaml:6-24 |
| `RA-151` | agent-guardは許可済かつ種別ありの呼出しだけslot記録し、並列上限超過は警告に留め、slot記録失敗で呼出しを止めない。 | lane_delegation | hook | .claude/hooks/agent-guard.ts:71-90 |
| `RB04-148` | 同一fileへの書込み・前段成果への依存・共有state変更のいずれかがあるtaskは直列化し、すべてない場合だけ上限8で並列化する。 | lane_delegation | prose | docs/governance/helix-harness-concept_v3.1.md:1244-1244 |
| `RB05-115` | 当該調査の実行者は利用可能slot最大でsubagentを並列利用し、全体と項目別の進捗を百分率で報告する。 | lane_delegation | prose | docs/governance/infinity-loop-source-capability-ledger.md:67-67; docs/governance/infinity-loop-source-capability-ledger.md:269-271 |
| `RB06-124` | specialist編成は最小team以外と自己検証を拒否する。 | lane_delegation | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:60-60; docs/governance/infinity-loop-assertion-coverage-ledger.md:128-128 |
| `RB07-169` | 管理者は並列委譲前にcritical pathと共有書込み・generates非重複を確認し、直列・並列の分担を工程表とreview_evidenceへ記録する。 | lane_delegation | prose | docs/skills/project-management.md:62-67 |
| `RB07-178` | 管理者はpair-freeze・trace-freeze・acceptを常に直列stepとして配置する。 | process_gate | prose | docs/skills/project-management.md:116-117 |
| `RB07-213` | 計画者は工程を番号付きで直列・並列に分類し、直列を順に完了させ、pair-freezeとtrace-freezeの周辺へ直列gateを置く。 | process_gate | prose | docs/skills/planning-and-task-breakdown.md:56-72 |
| `RB08-292` | schedulerはcapacity範囲外・依存前倒し・無制限queue・lease二重所有・遅いhandover・packet欠落・ack再配送・failure隔離違反・不足capacity証拠・時刻逆行を拒否する。 | process_gate | gate | docs/governance/issue-214-slot-scheduler-closure.md:26-29 |
| `RC0-109` | Team runnerは、hybrid以外のmodeによるteam runを不合格にする。 | lane_delegation | gate | src/team/run.ts:316-322; src/team/run-policy.ts:11-11 |
| `RC0-110` | Team runnerは、hybrid teamにClaudeとCodexの両方が含まれない場合、不合格にする。 | lane_delegation | gate | src/team/run.ts:324-333; src/team/run-policy.ts:12-13 |
| `RC0-111` | Team runnerは、同じrole/providerが重複し、ownershipが欠落または既存ownershipと重複する場合、不合格にする。 | lane_delegation | gate | src/team/run.ts:335-346 |
| `RC0-113` | Team runnerは、serialize_afterの依存先が見つからない場合、実行計画を不合格にする。 | lane_delegation | gate | src/team/run.ts:280-285; src/team/run.ts:438-457 |
| `RC0-114` | Team runnerは、serialize_afterが複数memberへ解決される場合、実行計画を不合格にする。 | lane_delegation | gate | src/team/run.ts:253-262; src/team/run.ts:286-289 |
| `RC0-115` | Team runnerは、member依存関係のcycleを検出した場合、実行計画を不合格にする。 | lane_delegation | gate | src/team/run.ts:273-277; src/team/run.ts:438-457 |
| `RC0-117` | Team runnerは、execute指定時にruntime adapter経由で実行できないmemberがいる場合、実行計画を不合格にする。 | lane_delegation | gate | src/team/run.ts:448-457 |
| `RC0-118` | Team runnerは、dry-runとして作成した計画の実行を拒否する。 | lane_delegation | gate | src/team/run.ts:584-599; src/team/run-policy.ts:16-17 |
| `RC0-119` | Team runnerは、計画のokまたはexecutableがfalseの場合、memberを起動せず実行失敗を返す。 | lane_delegation | gate | src/team/run.ts:600-610 |
| `RC0-120` | Team runnerは、serialize_afterの依存先が失敗した場合、依存memberを実行せずfailedとして記録する。 | lane_delegation | gate | src/team/run.ts:619-649 |
| `RC00-137` | session board生成器は、未解放running slotが起動からstale閾値を超えている場合に警告する。 | lane_delegation | gate | src/runtime/agent-session-command-center.ts:55-64; src/runtime/agent-session-command-center.ts:134-139 |
| `RC02-027` | doctorのagent-slots checkは、既定期限を超えてreleaseされていないslotがあれば警告し、doctorの成功判定は落とさない。 | lane_delegation | doctor | src/doctor/index.ts:633-647 |
| `RC02-147` | consumer doctorのconsumer-team-run-surface checkは、team schema不合格、nameがdefault-hybrid以外、Codex seまたはpmo/Claude tl・qa不足、hybrid実行計画不合格、dry-runでない、または両provider不足の場合に失敗する。 | lane_delegation | doctor | src/doctor/index.ts:6241-6266 |
| `RC03-095` | チーム実行計画の依存関係検査は、serialize_afterの依存先を辿って循環が見つかった場合、計画を不適格とする。 | lane_delegation | gate | src/team/run.ts:265-300; src/team/run.ts:457-466 |
| `RC03-096` | チーム実行計画の依存関係検査は、serialize_afterが指すroleまたはengineに一致するmemberが存在しない場合、計画を不適格とする。 | lane_delegation | gate | src/team/run.ts:253-262; src/team/run.ts:280-285; src/team/run.ts:457-466 |
| `RC03-097` | チーム実行計画の依存関係検査は、serialize_afterに一致するmemberが複数ある場合、計画を不適格とする。 | lane_delegation | gate | src/team/run.ts:253-262; src/team/run.ts:286-289; src/team/run.ts:457-466 |
| `RC03-099` | チーム実行検証処理は、実行modeがhybridでない場合、チーム実行を不適格とする。 | lane_delegation | gate | src/team/run.ts:316-322; src/team/run.ts:362-362 |
| `RC03-100` | チーム実行検証処理は、hybrid modeでClaudeとCodexの両providerがmemberに含まれない場合、不適格とする。 | lane_delegation | gate | src/team/run.ts:324-333 |
| `RC03-101` | チーム実行検証処理は、同じrole/providerのmemberが再登場し、そのmemberのownershipが空か同じownershipが既出である場合、不適格とする。 | lane_delegation | gate | src/team/run.ts:335-346 |
| `RC03-116` | チームmember実行処理は、起動・実行・slot操作のtry区間で例外が発生した場合、失敗結果を返し、取得済みslotがあればfailedとして解放する。 | tooling_runtime | gate | src/team/run.ts:504-579 |
| `RC03-117` | チーム計画実行処理は、planがdry-runである場合、memberを起動せず失敗を返す。 | tooling_runtime | gate | src/team/run.ts:584-598 |
| `RC03-118` | チーム計画実行処理は、plan.okまたはplan.executableが偽の場合、memberを起動せず失敗を返す。 | process_gate | gate | src/team/run.ts:600-609 |
| `RC03-119` | 逐次チーム実行処理は、serialize_afterが示す依存memberが失敗している場合、後続memberを起動せずfailedとする。 | lane_delegation | gate | src/team/run.ts:619-650 |
| `RC04-109` | pair-agentは、実行対象のphaseが存在しなければ例外を送出する。 | process_gate | gate | src/orchestration/pair-agent.ts:500-505 |
| `RC04-179` | 二段階agent設計の統合器は、phase1・phase2・handoffが揃わなければ統合を拒否する。 | lane_delegation | gate | src/workflow/contracts.ts:783-798 |
| `RC04-211` | workflow envelope検証器は、concurrency_limitがcapacity_limitを超えたらactivationを拒否する。 | tooling_runtime | gate | src/workflow/universal-workflow-envelope.ts:397-404; src/workflow/universal-workflow-envelope.ts:425-429 |
| `RD00-001` | adapterは、実行モードが対象providerを含まない場合、そのproviderを利用不可と判定する。 | tooling_runtime | config | src/runtime/adapter.ts:175-178 |
| `RD00-043` | slot管理は、active数が並列上限以上の場合、超過判定を返す。guard記録経路ではagent_guard由来のactive数を用い、既定上限は8とする。 | lane_delegation | hook | src/runtime/agent-slots.ts:54-55; src/runtime/agent-slots.ts:261-270; src/runtime/agent-slots.ts:310-315 |
| `RD03-043` | schedulerは、queue_limitが正の整数でない場合、dispatchとqueue追加を拒否する。 | tooling_runtime | gate | src/runtime/slot-scheduler-quota-handover.ts:364-371; src/runtime/slot-scheduler-quota-handover.ts:402-404; src/runtime/slot-scheduler-quota-handover.ts:444-447 |
| `RD03-044` | dispatch admissionは、capacityが1から8の整数でない場合、拒否する。 | tooling_runtime | gate | src/runtime/slot-scheduler-quota-handover.ts:25-26; src/runtime/slot-scheduler-quota-handover.ts:405-411 |
| `RD03-045` | dispatch admissionは、候補または実行中taskのconflict scopeが不正、あるいはready dependency一覧が不正な場合、拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:333-342; src/runtime/slot-scheduler-quota-handover.ts:412-423 |
| `RD03-046` | dispatch admissionは、候補taskの依存IDがすべてready一覧に含まれない場合、拒否する。 | process_gate | gate | src/runtime/slot-scheduler-quota-handover.ts:415-418 |
| `RD03-047` | dispatch admissionは、候補と実行中taskが同じIssue IDを持つ場合、競合として拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:351-352; src/runtime/slot-scheduler-quota-handover.ts:424-425 |
| `RD03-048` | dispatch admissionは、候補と実行中taskが同じbehavior contract IDを持つ場合、競合として拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:351-353; src/runtime/slot-scheduler-quota-handover.ts:424-425 |
| `RD03-049` | dispatch admissionは、候補と実行中taskが同じresponsibility ownerを持つ場合、競合として拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:351-354; src/runtime/slot-scheduler-quota-handover.ts:424-425 |
| `RD03-050` | dispatch admissionは、候補と実行中taskのshared authority IDが重なる場合、競合として拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:355-356; src/runtime/slot-scheduler-quota-handover.ts:424-425 |
| `RD03-051` | dispatch admissionは、候補と実行中taskのallowed pathが一致または親子関係にある場合、競合として拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:345-356; src/runtime/slot-scheduler-quota-handover.ts:424-425 |
| `RD03-052` | dispatch admissionは、実行中row数がcapacity以上の場合、新規dispatchを拒否する。 | tooling_runtime | gate | src/runtime/slot-scheduler-quota-handover.ts:428-430 |
| `RD03-057` | queue追加は、待機件数がqueue_limit以上の場合、既存entriesを変更せずbackpressureを返す。 | tooling_runtime | gate | src/runtime/slot-scheduler-quota-handover.ts:440-458 |
| `RD03-239` | Windows canary queue評価は、既存active数またはwaiting数がpolicy上限を超えている場合、不確実状態として拒否する。 | tooling_runtime | gate | src/runtime/windows-lite-canary-admission.ts:305-307 |
| `RD03-241` | Windows canary queue評価は、activeが満杯でwaitingも上限に達している場合、backpressureで候補を拒否する。 | tooling_runtime | gate | src/runtime/windows-lite-canary-admission.ts:316-329 |
| `RD04-010` | 委譲判定器は、必須依存edgeのいずれかがlane ready receiptの完了集合に無い場合に拒否する。 | process_gate | gate | src/runtime/work-graph-receipt-acceptance.ts:331-334 |
| `RD09-128` | proposal-document-coverageは、agent-orchestrationを期待するシナリオでagent-runtime-reviewがrequired_gatesにない場合、失敗させる。 | lane_delegation | lint | src/lint/proposal-document-coverage-policy.ts:76-76; src/lint/proposal-document-coverage.ts:169-178 |
| `RE01-031` | 計画者はファイル競合・依存・共有状態がなければ最大8並列を活用し、「重い」という理由だけで直列化してはならない。 | lane_delegation | prose | docs/governance/helix-harness-requirements_v1.2.md:512-516 |
| `RF01-004` | pair-agentは、executeがfalseの場合、executorを呼ばずplannedの工程一覧を返し、最終判定をnullにする。 | tooling_runtime | gate | src/orchestration/pair-agent.ts:463-480 |
| `RF01-016` | proposalチーム生成器は、生成対象laneのparallel_slotsが1未満の場合も、member生成用slot数を最低1にする。 | lane_delegation | gate | src/team/launch-policy.ts:159-162 |
| `RF01-017` | proposalチーム生成器は、serialize_afterを持たないmember数からmax_parallelを求め、最低1・最高8に制限する。 | tooling_runtime | gate | src/team/launch-policy.ts:196-201 |
| `RF01-018` | 通常の自動チーム生成器は、難易度がcomplexまたはcriticalの場合、tlのレビューをseの後に直列化する。 | lane_delegation | config | src/team/launch-policy.ts:79-96 |
| `RF01-021` | チーム起動推薦器は、hybrid modeでproposal lane指定がなく、risk語に一致せず難易度がtrivialまたはsimpleの場合、チーム起動を推薦しない。 | lane_delegation | config／gate | src/team/launch-policy.ts:214-261 |
| `RF01-022` | チーム起動推薦器は、hybrid modeでproposal lane指定がなく、taskがrisk語に一致するか難易度がstandard・complex・criticalの場合、cross-providerチームの起動を推薦する。 | lane_delegation | config／gate | src/team/launch-policy.ts:32-54; src/team/launch-policy.ts:225-274 |
| `RF01-030` | チーム実行計画生成器は、mustSerializeがtrueを返すかserialize_afterの指定が一件でもある場合、要求されたstrategyにかかわらずsequentialへ切り替える。 | lane_delegation | gate | src/team/run.ts:377-386 |
| `RF01-031` | チーム実行処理は、parallel strategyの場合、memberをmax_parallel件ずつのbatchで実行し、当該batchの全実行が返るまで次のbatchを開始しない。 | tooling_runtime | gate | src/team/run.ts:612-617 |
| `RG16-007` | 委譲者は、適切に構造化した並列分割の方が安い場合、逐次委譲を行わない。 | lane_delegation | prose | docs/skills/agent-cost-design.md:74-78 |
| `RG16-014` | team設計者は、順序依存のない独立成果物を生成する場合はparallelを使い、後続stepが先行stepの検証済み出力を必要とする場合はserialを使う。 | lane_delegation | prose | docs/skills/agent-teams.md:74-78; docs/skills/agent-teams.md:95-96 |
| `RG16-015` | team設計者は、parallelとserialの両modeが必要な場合、単一team definitionに混在させず二つのteam runへ分割する。 | tooling_runtime | prose | docs/skills/agent-teams.md:77-79 |
| `RG16-016` | team実行担当者は、初回のlive実行前にteam definitionを指定した実行をdry-run相当でtestする。 | process_gate | prose | docs/skills/agent-teams.md:88-88 |

## 副として対応づいた規則（34件）

`RA-091`、`RA-125`、`RA-135`、`RA-202`、`RB04-012`、`RB04-015`、`RB04-024`、`RB04-149`、`RB04-241`、`RB06-102`、`RB07-170`、`RB08-258`、`RB08-321`、`RC0-112`、`RC0-116`、`RC03-098`、`RC03-102`、`RC03-103`、`RC03-104`、`RC03-120`、`RC04-034`、`RC04-104`、`RD03-041`、`RD03-042`、`RD03-053`、`RD03-056`、`RD03-062`、`RD03-074`、`RD03-075`、`RD03-232`、`RD03-237`、`RD03-240`、`RD09-134`、`RE01-030`
