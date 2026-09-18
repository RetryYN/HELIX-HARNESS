---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSP-03
group: OS推進
product: OS
atoms_primary: 151
atoms_secondary: 118
issue_projection: #1859
---

# RUL-OSP-03（OS推進／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

委譲には目的・出力形式・tool方針・境界を必ず付ける。許可された役割とmodelの組合せだけを起動し、検証できない状態では起動しない。

## 主として対応づいた規則（151件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RA-029` | エージェントはPython workerへDB path、credential、repository、.helixを渡さず、DB・Git・GitHubへのwrite権限を与えない。 | safety_security | prose | AGENTS.md:121-123; CLAUDE.md:62-63; .claude/CLAUDE.md:246-247 |
| `RA-083` | Claude設定はAgent・Taskの直前にagent-guardをtimeout 5秒、blockOnFailure=trueで呼ぶ。 | tooling_runtime | config／hook | .claude/settings.json:4-16; .claude/CLAUDE.md:36-36 |
| `RA-086` | Codex設定はspawn_agent・spawn_agents_on_csv・Agentの直前にagent-guardをtimeout 5秒、blockOnFailure=trueで呼ぶ。 | tooling_runtime | config／hook | .codex/hooks.json:4-16 |
| `RA-126` | worker起動者はexecute時にworker-context-fileを必須とし、未指定ならproviderを起動せずWORKER_CONTEXT_UNSEALEDで拒否する。 | lane_delegation | prose／gate | AGENTS.md:191-201; CLAUDE.md:265-275; .claude/CLAUDE.md:90-100 |
| `RA-127` | worker起動者はboundaryを.helix/worker-contextのgoal別JSONとして手書きし、operator guideのschemaに従う。 | lane_delegation | prose | AGENTS.md:203-205; CLAUDE.md:277-279; .claude/CLAUDE.md:102-104 |
| `RA-128` | 委譲受領者はobjective・output format・tool guidance・task boundaryが欠ける場合、推測で補わず明示を求める。 | lane_delegation | prose | AGENTS.md:225-226 |
| `RA-129` | Agent guardはallowlistにないsubagent_typeを拒否する。 | lane_delegation | prose／hook | .claude/CLAUDE.md:148-148; .claude/CLAUDE.md:162-180; .claude/commands/ship.md:21-24 |
| `RA-130` | Agent guardはmodel未指定またはagent frontmatter familyと異なるmodelの呼出しを拒否する。 | lane_delegation | prose／hook | .claude/CLAUDE.md:149-150; .claude/commands/ship.md:21-22; .claude/hooks/agent-guard.ts:27-35 |
| `RA-131` | Agent guardのbypassはHELIX_ALLOW_RAW_AGENT=1の場合だけ認め、証跡を残す。 | lane_delegation | prose／hook | .claude/CLAUDE.md:151-151; .claude/hooks/agent-guard.ts:64-67 |
| `RA-132` | 委譲者はpromptに目的・出力形式・tool方針・境界の4 markerを含め、Agent guardは欠落時に拒否する。 | lane_delegation | prose／hook | AGENTS.md:229-231; .claude/CLAUDE.md:153-156; .claude/agents/fe-lead.md:25-26; .claude/commands/ship.md:22-24 |
| `RA-133` | Agent guardはFableをapex allowlistのadvisor-fableだけに許可し、frontmatter記載だけのworker利用を拒否する。 | lane_delegation | prose／hook | .claude/CLAUDE.md:157-160 |
| `RA-134` | Codex guardはagent_typeが渡された場合だけallowlistを検査し、model・effortは検証済policyが導出したexact pairとの一致時だけ許可する。 | lane_delegation | prose／hook | AGENTS.md:257-261 |
| `RA-135` | Codex guardはtask bodyを必須にし、bulk spawnを常に拒否する。 | lane_delegation | prose／hook | AGENTS.md:261-261 |
| `RA-136` | 委譲受領者はadapter注入のrole判断briefをtask本文と同格の拘束として扱う。 | lane_delegation | prose | AGENTS.md:227-231 |
| `RA-137` | 委譲受領者は注入された設計・検証・test戦略・troubleshootingの思考lensを作業へ織り込み、必要に応じて参照packを読む。 | lane_delegation | prose | AGENTS.md:232-235 |
| `RA-147` | /shipのspecialistはsubagentをspawnせず互いを呼ばず、main agentへreportだけを返す。 | lane_delegation | prose | .claude/commands/ship.md:34-34; .claude/commands/ship.md:58-58 |
| `RA-303` | project scoutはcwd配下の初期sweepと候補抽出だけを行い、探索objective外を推測で補わない。 | behavior_discipline | prose | .claude/agents/pmo-project-scout.md:16-16; .claude/agents/pmo-project-scout.md:21-22; .claude/agents/pmo-project-scout.md:47-47 |
| `RA-304` | PMO Haikuとmarketing scoutは現在の外部公開情報が必要な場合だけweb調査する。 | behavior_discipline | prose | .claude/agents/pmo-haiku.md:26-26; .claude/agents/pdm-marketing-innovation.md:25-25 |
| `RB0-109` | worker起動者はexecute時およびloopの非dry-run時にworker-context-fileを指定し、未指定・未解決・schema不正ならproviderを起動しない。 | tooling_runtime | gate | docs/governance/worker-context-boundary-operator-guide.md:3-21 |
| `RB0-145` | workerへの委譲者は検証可能なobjective・出力形式・tool guidance・task boundaryの四点をtaskへ必ず含める。 | lane_delegation | prose／hook | docs/skills/judgment-core.md:143-151; docs/skills/agent-design.md:77-78 |
| `RB0-171` | 委譲者はsubagent callをraw provider起動ではなくhelix claude・codex・team run経由へrouteする。 | tooling_runtime | prose | docs/skills/agent-cost-design.md:51-52 |
| `RB0-176` | agent起動側はsubagent_typeをallowlistへ完全一致させ、未登録roleを拒否し、team利用時もagentのmodel familyとの一致を要求する。 | tooling_runtime | hook | docs/skills/agent-design.md:42-53; docs/skills/agent-teams.md:51-52 |
| `RB04-052` | layer-context生成者はdrive×layerごとにowner・mandatory agents・推奨skill/command・orchestration modeを注入する。 | lane_delegation | config | docs/governance/helix-harness-concept_v3.1.md:483-495 |
| `RB04-139` | subagent委譲者はobjective・output format・tool guidance・task boundaryをpromptに含め、Claude Agent起動時にmarkerが欠ければguardがブロックする。 | lane_delegation | hook | docs/governance/helix-harness-concept_v3.1.md:1205-1205 |
| `RB04-140` | adapterはroleに応じた判断ブリーフを委譲promptへ注入し、設計・検証等の該当領域がある場合だけ思考レンズを追加する。 | lane_delegation | prose | docs/governance/helix-harness-concept_v3.1.md:1206-1207 |
| `RB04-151` | adapterはPLAN指定をharness/session metadataとして保持し、provider CLIへ--plan-idを転送しない。 | tooling_runtime | prose | docs/governance/helix-harness-concept_v3.1.md:1248-1248 |
| `RB04-187` | AI実装依頼者は実装内容・期待動作・制約・テスト要件を提示し、完了条件をテスト全通過・CI pass・AGENTS.md準拠とする。 | lane_delegation | prose | docs/governance/ai-dev-team-operations_v1.1.md:404-429 |
| `RB05-159` | musterは完全なruntime中立contractだけを登録対象とし、taskに一致するeligible agentがなければmemberを作らずblocked reasonを返す。 | lane_delegation | prose | docs/governance/infinity-loop-system-assertion-cases.md:65-65; docs/governance/infinity-loop-system-assertion-cases.md:369-369 |
| `RB06-056` | native subagent注入の設計者は先にadmission surface matrixを作り、未対応surfaceをdenyまたはwrapperへ振り分けてから設計する。 | lane_delegation | prose | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:216-217 |
| `RB06-058` | 提案されたKimi防御では、guardがraw起動を拒否し、worker共通契約acceptanceを実gate化するまでKimi実装PLAN着手を許可しない。 | lane_delegation | prose | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:76-83 |
| `RB06-065` | route_evalはmode、model、catalog_route_id、route_class、program、argv、raw_commandを出力しない。 | tooling_runtime | config | config/workflow-execution-policy.v1.json:87-97 |
| `RB06-134` | agent registryは必須fieldが完全なruntime中立contractだけを受理し、委譲四点とguardを要求する。 | lane_delegation | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:79-79; docs/governance/infinity-loop-assertion-coverage-ledger.md:127-127 |
| `RB06-160` | 委譲環境検査は入れ子CLIの未浄化envとtimeout欠落を検出する。 | safety_security | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:133-133 |
| `RB06-183` | 生成pack・agentのauthority検査は未監査・未許可のものを拒否する。 | lane_delegation | prose | docs/governance/infinity-loop-assertion-coverage-ledger.md:192-192 |
| `RB06-250` | 委譲担当者はPythonへrepository、DB path、credential、.helix、Git/GitHub write権限を渡さない。 | safety_security | prose | docs/governance/python-semantic-migration-ledger.v1.yaml:19-19 |
| `RB07-104` | 委譲者はobjective・output format・tool guidance・task boundaryに加え、軽量workerには低裁量のchecklist・再検証loop・escalation先を与える。 | lane_delegation | prose | docs/skills/skill-authoring.md:91-95 |
| `RB07-105` | 委譲者は標準workerへ観点カタログと根拠先行判定を与え、reviewerには独立検証と役割分離を必須とし、同等に正しい簡潔な所見を不利に採点しない。 | lane_delegation | prose | docs/skills/skill-authoring.md:96-99 |
| `RB07-191` | agent guardはallowlist外のsubagent_type、model欠落、frontmatterと異なるmodel family、不正stdin JSONを拒否する。 | safety_security | hook | docs/skills/security.md:54-65 |
| `RB07-192` | 担当者はraw-agent bypassを緊急時に限り環境変数で指定して毎回auditを残し、committed scriptへ残さない。 | safety_security | prose／hook | docs/skills/security.md:62-62; docs/skills/security.md:77-77; docs/skills/security.md:113-114 |
| `RB07-240` | AIを含む設計ではprompt・tool・権限境界と出力検証を対にし、AIへ任せる範囲をADRへ記録し、委譲briefに判断の記録先も含める。 | lane_delegation | prose | docs/skills/design-tailoring.md:97-102 |
| `RB07-312` | startup是正担当者はworker contextを生成・seal・read-afterしてassignmentとHEADへ束縛し、review・merge・release・deployを別receiptとし、旧team経路をcurrent出力から除く。 | lane_delegation | config | docs/governance/effective-agent-startup-followup-registry.json:90-92 |
| `RB08-004` | agent guardは未知のsubagent_typeまたはmodel欠落を非ゼロ終了で拒否する。 | safety_security | hook | docs/skills/threat-model.md:66-67 |
| `RB08-030` | 委譲者は自由文だけでなくPLAN pathを渡し、委譲前に対象PLANのlint成功を確認する。 | lane_delegation | prose | docs/skills/estimation.md:78-81 |
| `RB08-062` | 複数source調査の委譲者はdry-runでpromptを確認し、目的・一次source最低2件・出力形式・URL本文確認を指定して軽量roleへ委譲する。 | lane_delegation | prose | docs/skills/research.md:78-85 |
| `RB08-136` | agent呼出し追加担当者はraw spawnを使わずwrapper経由とし、runtime・model・role・drive・PLAN・時刻をmodel_runsへ記録する。 | lane_delegation | prose | docs/skills/harness-observability.md:55-60 |
| `RB08-171` | 委譲者はprompt作成前にPLAN向けskill推薦を取得し、関連上位1〜3件をloadして、複数層なら最もriskの高い層を優先する。 | lane_delegation | prose | docs/skills/context-engineering.md:51-52; docs/skills/context-engineering.md:64-65 |
| `RB08-203` | agent delegation実装者はPLAN agent_slotsの呼出しをwrapperへrouteし、allowlist外typeやfrontmatterと不一致modelをguardで拒否する。 | lane_delegation | prose／hook | docs/skills/llm-agent-routing.md:29-38 |
| `RB09-044` | 外部workerへの委譲担当者は、DB path、credential、repository stateを外部workerへ渡してはならない。 | safety_security | prose | docs/governance/issue-194-worker-admission-closure.md:28-29 |
| `RC0-001` | Agent guardは、Codexのspawn_agents_on_csvによる一括起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:97-103 |
| `RC0-002` | Agent guardは、Codex native worker policyの解決に失敗した場合、worker起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:110-119 |
| `RC0-003` | Agent guardは、Codexのagent_typeが指定され、default・explorer・worker以外である場合に起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:121-128; src/runtime/agent-guard-policy.ts:65-69 |
| `RC0-004` | Agent guardは、Codex spawn_agentのmessageとitemsに有効な本文・path・nameが一つもない場合、起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:77-85; src/runtime/agent-guard.ts:129-135 |
| `RC0-005` | Agent guardは、Codex workerのmodelとreasoning_effortがpolicyの要求する組と一致しない場合、起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:136-147 |
| `RC0-006` | Agent guardは、ClaudeのAgent／Task呼び出しにsubagent_typeがない場合、起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:157-167; src/runtime/agent-guard-policy.ts:59-60 |
| `RC0-007` | Agent guardは、Claudeのsubagent_typeがSUBAGENT_ALLOWLISTに登録されていない場合、起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:169-175; src/runtime/agent-guard-policy.ts:6-24 |
| `RC0-008` | Agent guardは、指定されたClaude agentの定義ファイルが存在しない場合、起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:177-183 |
| `RC0-009` | Agent guardは、Claude agent定義からmodel familyを解決できない場合、起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:184-189 |
| `RC0-010` | Agent guardは、Claudeの委譲呼び出しにmodelが指定されていない場合、起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:191-196 |
| `RC0-011` | Agent guardは、指定modelを一意なmodel familyへ正規化できない場合、Claude agentの起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:63-72; src/runtime/agent-guard.ts:198-203 |
| `RC0-012` | Agent guardは、指定modelのfamilyがagent定義のfamilyと異なる場合、起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:204-211 |
| `RC0-013` | Agent guardは、advisor-fable以外のsubagentによるfableモデルの使用を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:213-222; src/runtime/agent-guard-policy.ts:29-35 |
| `RC0-014` | Agent guardは、Claude agentへのpromptに目的・出力形式・ツール方針・境界の必須markerが欠ける場合、起動を拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:224-230; src/runtime/agent-guard-policy.ts:44-57 |
| `RC0-015` | Agent guardは、存在する委譲ブリーフmarkerの本文が空白を除いて20文字未満の場合、警告して起動を許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:232-240; src/runtime/agent-guard.ts:279-296; src/runtime/agent-guard-policy.ts:37-37 |
| `RC0-121` | Team runnerは、wrapper admissionがfailureを返す場合、またはworker contextがない場合、member起動を拒否する。 | lane_delegation | gate | src/team/run.ts:504-508 |
| `RC00-051` | roster能力解決器は、role・要求capability・指定時のslot sourceに適合するentryがなければ失敗する。 | lane_delegation | gate | src/runtime/agent-slots-roster.ts:71-90 |
| `RC00-143` | hook authority consumerは、admitted receiptが生成されなかった場合にprovider dispatchを許可しない。 | escalation_authority | gate | src/runtime/project-hook-authority-consumer.ts:49-62; src/runtime/project-hook-authority-consumer.ts:83-96 |
| `RC00-194` | 相談receipt記録器は、providerがcodexでなければ発行を拒否する。 | lane_delegation | gate | src/runtime/escalation-consult-gate.ts:63-65; src/runtime/escalation-consult-gate.ts:220-225 |
| `RC00-195` | 相談receipt記録器は、roleがtlでなければ発行を拒否する。 | lane_delegation | gate | src/runtime/escalation-consult-gate.ts:67-68; src/runtime/escalation-consult-gate.ts:225-226 |
| `RC00-205` | worker risk admissionは、benchmark receiptの封緘されたriskを取得できなければ拒否する。 | evidence_claim | gate | src/runtime/worker-risk-admission.ts:222-225 |
| `RC00-208` | worker risk admissionは、candidateにscope_violationのstandalone findingがあれば用途ごとの採用を拒否してretireとする。 | safety_security | gate | src/runtime/worker-risk-admission.ts:160-163; src/runtime/worker-risk-admission.ts:244-270 |
| `RC00-211` | worker risk admissionは、用途が要求するrisk classの候補評価が1つでもなければ候補をretireとする。 | evidence_claim | gate | src/runtime/worker-risk-admission.ts:166-179; src/runtime/worker-risk-admission.ts:250-270 |
| `RC01-004` | allowlist-syncは、policyからSUBAGENT_ALLOWLISTを抽出できない場合、不合格にする。 | lane_delegation | lint | src/lint/allowlist-sync.ts:37-43; src/lint/allowlist-sync.ts:75-82 |
| `RC03-103` | チーム実行計画生成処理は、placementにblockedReasonがあるmemberを実行不可とし、計画を不適格とする。 | escalation_authority | gate | src/team/run.ts:389-435; src/team/run.ts:440-466 |
| `RC03-104` | チーム実行処理は、memberにadapterがないか実行可能でない場合、そのmemberを失敗とする。execute付き計画生成でも、blockedReasonがない実行不能memberを検出すると計画を不適格とする。 | tooling_runtime | gate | src/team/run.ts:448-466; src/team/run.ts:479-503 |
| `RC03-105` | チームmember実行処理は、wrapper admissionがfailure_codeを返す場合、provider起動前に失敗する。 | lane_delegation | gate | src/team/run.ts:504-513; src/team/run.ts:561-579 |
| `RC04-032` | ループadapterは、worker context必須の起動admissionが失敗すれば起動を拒否する。 | safety_security | gate | src/orchestration/loop-bridge.ts:111-115 |
| `RC04-034` | ループadapterは、workerまたはverifierのplanがavailableでなければ実行を拒否する。 | tooling_runtime | gate | src/orchestration/loop-bridge.ts:183-221 |
| `RC04-103` | pair-agent plan生成器は、PLAN IDまたはtask本文が空ならplanをblockedにする。 | lane_delegation | gate | src/orchestration/pair-agent.ts:213-225; src/orchestration/pair-agent.ts:310-318 |
| `RC04-107` | pair-agentは、phaseに対応するagent identityが無い場合、adapter生成または実行を失敗させる。 | lane_delegation | gate | src/orchestration/pair-agent.ts:351-355; src/orchestration/pair-agent.ts:504-507 |
| `RC04-108` | pair-agentは、execute=trueでexecutorが無ければ実行をblockedにする。 | tooling_runtime | gate | src/orchestration/pair-agent.ts:491-497 |
| `RC04-110` | pair-agentは、worker context必須のwrapper admissionが失敗した場合、executorを呼ばず失敗結果を生成する。 | safety_security | gate | src/orchestration/pair-agent.ts:522-537 |
| `RC04-286` | workflow実行policy設定は、mode・model・catalog_route_id・route_class・program・argv・raw_commandをconsumer出力に含めることを禁止する。 | tooling_runtime | config | config/workflow-execution-policy.v1.json:87-98 |
| `RD00-003` | wrapper admissionは、direct_provider_cli経路または登録された起動originを持たないplanを拒否する。 | lane_delegation | gate | src/runtime/adapter.ts:400-405; src/runtime/adapter.ts:421-428 |
| `RD00-004` | wrapper admissionは、登録originとplanのproviderが異なる場合、起動を拒否する。 | lane_delegation | gate | src/runtime/adapter.ts:429-431 |
| `RD00-008` | wrapper admissionは、必須worker contextのauthorityを再証明できない場合、起動を拒否する。 | escalation_authority | gate | src/runtime/adapter.ts:451-455 |
| `RD00-015` | adapterは、providerのversion probeが非0終了または例外になった場合、起動可能とは判定しない。 | tooling_runtime | gate | src/runtime/adapter.ts:627-651 |
| `RD00-019` | adapterは、worker context packetのcompileが失敗した場合、context付きplanの構築を失敗させ、wrapper planを利用不可にする。 | memory_context | gate | src/runtime/adapter.ts:721-733; src/runtime/adapter.ts:759-768 |
| `RD00-020` | adapterは、全委譲promptにrole判断ブリーフを追加する。 | lane_delegation | config | src/runtime/adapter.ts:795-809 |
| `RD00-024` | agent guardは、CodexのCSV一括spawnを拒否する。allowRaw有効時は警告付きで許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:97-103; src/runtime/agent-guard-policy.ts:62-63 |
| `RD00-025` | agent guardは、Codex native worker policyの解決が例外になった場合、spawnを拒否する。allowRaw有効時は警告付きで許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:110-119 |
| `RD00-026` | agent guardは、Codex spawnでagent_typeが指定され、default・explorer・workerのいずれでもない場合、拒否する。allowRaw有効時は警告付きで許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:121-128; src/runtime/agent-guard-policy.ts:65-69 |
| `RD00-027` | agent guardは、Codex spawnのmessageもitems内のtext・path・nameもすべて空の場合、拒否する。allowRaw有効時は警告付きで許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:77-84; src/runtime/agent-guard.ts:129-135 |
| `RD00-028` | agent guardは、Codex spawnのmodelまたはreasoning_effortがpolicyの値と完全一致しない場合、拒否する。allowRaw有効時は警告付きで許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:136-147 |
| `RD00-029` | agent guardは、ClaudeのAgent・Task呼出しでsubagent_typeがない場合、拒否する。allowRaw有効時は警告付きで許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:157-167; src/runtime/agent-guard-policy.ts:59-60 |
| `RD00-030` | agent guardは、Claudeのsubagent_typeがallowlist外の場合、拒否する。allowRaw有効時は警告付きで許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:169-175; src/runtime/agent-guard-policy.ts:6-24 |
| `RD00-031` | agent guardは、対象Claude agent定義ファイルがない場合、allowRawにかかわらず拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:177-183 |
| `RD00-032` | agent guardは、対象agentのfrontmatterからmodel familyを解決できない場合、allowRawにかかわらず拒否する。 | lane_delegation | hook | src/runtime/agent-guard.ts:184-189 |
| `RD00-033` | agent guardは、Claude agent呼出しでmodelが指定されていない場合、拒否する。allowRaw有効時は警告付きで許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:191-196 |
| `RD00-034` | agent guardは、要求modelからhaiku・sonnet・opus・fableのfamilyを一意に抽出できない場合、拒否する。allowRaw有効時は警告付きで許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:63-71; src/runtime/agent-guard.ts:198-203 |
| `RD00-035` | agent guardは、要求model familyがagent定義のfamilyと異なる場合、拒否する。allowRaw有効時は警告付きで許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:204-211 |
| `RD00-036` | agent guardは、advisor-fable以外のagentがfableを要求した場合、拒否する。allowRaw有効時は警告付きで許可する。 | lane_delegation | hook | src/runtime/agent-guard.ts:213-222; src/runtime/agent-guard-policy.ts:29-35 |
| `RD00-037` | agent guardは、Claude委譲promptに目的・出力形式・ツール方針・境界のいずれかのmarkerがない場合、拒否する。各markerは対応する英語または日本語ラベルを認め、allowRaw時は警告付き許可とする。 | lane_delegation | hook | src/runtime/agent-guard.ts:224-230; src/runtime/agent-guard.ts:246-255; src/runtime/agent-guard-policy.ts:40-57 |
| `RD00-038` | agent guardは、存在する委譲marker区間の本文が空白除去後20文字未満の場合、呼出しを許可したまま警告する。 | lane_delegation | hook | src/runtime/agent-guard.ts:232-240; src/runtime/agent-guard.ts:271-296; src/runtime/agent-guard-policy.ts:37-37 |
| `RD00-211` | Claude inboxは、実測済みPR review dispatch以外の入口が予約pr namespaceを生成・publishしようとした場合、拒否する。 | lane_delegation | gate | src/runtime/claude-memory-wake.ts:281-291; src/runtime/claude-memory-wake.ts:851-859 |
| `RD01-073` | Cursor follow-up判定は、providerを利用できない場合、laneをdegradedとしてPOSTを拒否する。 | lane_delegation | gate | src/runtime/cursor-cloud-run-authority.ts:133-141 |
| `RD01-074` | Cursor follow-up判定は、状態不明のrunが1件でもある場合にPOSTを拒否する。 | lane_delegation | gate | src/runtime/cursor-cloud-run-authority.ts:142-150 |
| `RD01-076` | Cursor follow-up判定は、stale分類のrunがある場合にPOSTを拒否する。 | lane_delegation | gate | src/runtime/cursor-cloud-run-authority.ts:160-168 |
| `RD01-077` | Cursor follow-up判定は、取消可能なstale runが複数ある場合にPOSTを拒否する。 | lane_delegation | gate | src/runtime/cursor-cloud-run-authority.ts:169-177 |
| `RD01-270` | Kimi provenance検証は、leaseのdigest・repository・PR・HEAD・provider・発行期限がreceiptと一致しなければ失敗する。 | lane_delegation | gate | src/runtime/github-cross-review-admission.ts:386-398; src/runtime/github-cross-review-admission.ts:413-420 |
| `RD01-271` | Kimi provenance検証は、provider失敗観測がlease発行以前であると確認できなければ失敗する。 | evidence_claim | gate | src/runtime/github-cross-review-admission.ts:421-421 |
| `RD02-036` | ACP transcript検証器は、選択modeがplanでない場合に拒否する。 | lane_delegation | gate | src/runtime/independent-review-fallback.ts:971-973 |
| `RD02-037` | ACP transcript検証器は、選択modelが要求modelと異なる場合に拒否する。 | lane_delegation | gate | src/runtime/independent-review-fallback.ts:974-976 |
| `RD02-042` | ACP実行器は、permission要求をrejectまたはcancelし、その他のID付きmethod要求にもdeniedを返す。 | safety_security | gate | src/runtime/independent-review-fallback.ts:1057-1070 |
| `RD02-057` | レビュー出力検証器は、permission・filesystem・terminal要求やtool更新通知を検出した実行の出力を拒否する。 | safety_security | gate | src/runtime/independent-review-fallback.ts:981-993; src/runtime/independent-review-fallback.ts:1452-1454 |
| `RD02-148` | role policy判定器は、自己レビューまたは無境界の委譲を拒否する。 | lane_delegation | gate | src/runtime/legacy-adoption.ts:453-455 |
| `RD02-150` | role policy判定器は、role・model family・slot・委譲境界・review substituteのいずれかが欠ける場合に拒否する。 | lane_delegation | gate | src/runtime/legacy-adoption.ts:445-452; src/runtime/legacy-adoption.ts:459-460 |
| `RD02-268` | resident assignment検証器は、mainまたはmasterへのworker割当を拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:58-61 |
| `RD02-270` | resident assignment検証器は、Issue scopeのrepositoryが割当repositoryと大文字小文字を無視して一致しない場合に拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:65-74 |
| `RD02-279` | review返却判定器は、返却対象branchが割当branchと異なる場合に拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:253-255 |
| `RD02-285` | assignment引継ぎ判定器は、次lane IDが前lane IDと同じ場合に拒否する。 | lane_delegation | gate | src/runtime/resident-lane-assignment.ts:297-299 |
| `RD03-059` | quota handoverは、packetのlane・task・candidate HEAD・writer lease・remaining scopeが揃わず有効性を確認できない場合、拒否する。 | memory_context | gate | src/runtime/slot-scheduler-quota-handover.ts:469-484; src/runtime/slot-scheduler-quota-handover.ts:497-499 |
| `RD03-061` | quota handoverは、packetのlane・target reviewer・candidate HEADが期待値と一致しない場合、拒否する。 | lane_delegation | gate | src/runtime/slot-scheduler-quota-handover.ts:503-509 |
| `RD03-083` | specialist registry検証は、launch IDがruntimeのallowlistにない場合、不合格にする。 | lane_delegation | gate | src/runtime/specialist-agent-registry.ts:115-118; src/runtime/specialist-agent-registry.ts:168-174 |
| `RD03-087` | specialist team選択は、registry評価が不合格またはregistryがない場合、workerとverifierを選ばず失敗する。 | lane_delegation | gate | src/runtime/specialist-agent-registry.ts:248-254 |
| `RD03-088` | specialist team選択は、指定driveと全required capabilityを満たすworkerがいない場合、失敗する。 | lane_delegation | gate | src/runtime/specialist-agent-registry.ts:255-280 |
| `RD04-007` | 委譲判定器は、required cell bindingのキー集合・HEAD・digest・パス一覧・lease・lane ready情報が検証を満たさない場合に委譲を拒否する。 | lane_delegation | gate | src/runtime/work-graph-receipt-acceptance.ts:205-249; src/runtime/work-graph-receipt-acceptance.ts:309-315 |
| `RD04-008` | 委譲判定器は、lane・Issue・behavior contract・責任者・reviewerの識別子、期待base HEAD、変更パスが不正な場合に拒否する。 | lane_delegation | gate | src/runtime/work-graph-receipt-acceptance.ts:316-326 |
| `RD04-012` | 委譲判定器は、変更パスが許可パス配下に無い、または禁止パス配下にある場合に拒否する。 | lane_delegation | gate | src/runtime/work-graph-receipt-acceptance.ts:251-260; src/runtime/work-graph-receipt-acceptance.ts:338-340 |
| `RD04-068` | context packet作成器は、goal・behavior contract・責任者が空、許可pathが空、pathが不正・重複、または許可と禁止のpathが包含関係で重なる場合に拒否する。 | lane_delegation | gate | src/runtime/worker-context-packet.ts:311-336; src/runtime/worker-context-packet.ts:362-362 |
| `RD04-072` | context envelope検証器は、packetに束縛した出力schemaと要求schemaが異なる場合に拒否する。 | memory_context | gate | src/runtime/worker-context-packet.ts:423-425 |
| `RD04-087` | descriptor解決器は、一致entryのcapability classが要求と異なる場合に拒否する。 | lane_delegation | gate | src/runtime/worker-descriptor-admission.ts:405-407 |
| `RD04-103` | isolation brokerは、isolation authorityが封印台帳に無い場合に起動準備を拒否する。 | safety_security | gate | src/runtime/worker-isolation-broker.ts:520-522 |
| `RD04-104` | isolation brokerは、wrapper launchが正規capabilityとして認められない場合に起動準備を拒否する。 | lane_delegation | gate | src/runtime/worker-isolation-broker.ts:523-525 |
| `RD04-106` | isolation brokerは、descriptor admissionがadmittedでない、または現在の要求・snapshotに対してcurrentでない場合に拒否する。 | lane_delegation | gate | src/runtime/worker-isolation-broker.ts:532-541 |
| `RD04-107` | isolation brokerは、許可descriptorを特定できない、またはstdinがdescriptorと出力schemaに対応する出力契約を持たない場合に拒否する。 | lane_delegation | gate | src/runtime/worker-isolation-broker.ts:542-555 |
| `RD04-109` | isolation brokerは、worker contextが無い、またはそのauthority rootが対象repositoryと異なる場合に拒否する。 | memory_context | gate | src/runtime/worker-isolation-broker.ts:572-575 |
| `RD04-110` | isolation brokerは、context authorityの再認証に失敗した場合に起動準備を拒否する。 | memory_context | gate | src/runtime/worker-isolation-broker.ts:576-579 |
| `RD04-111` | isolation brokerは、現在HEAD・role・task・登録出力schemaによるcontext envelope検証に失敗した場合に拒否する。 | memory_context | gate | src/runtime/worker-isolation-broker.ts:580-590 |
| `RD04-136` | isolation policy認証器は、wrapper launchが正規capabilityでない場合に拒否する。 | lane_delegation | gate | src/runtime/worker-isolation-policy.ts:94-99 |
| `RD04-147` | scope監査器は、追加・削除・size変更・digest変更したpathの一つでも書込許可範囲外なら失敗する。 | lane_delegation | gate | src/runtime/worker-isolation-policy.ts:88-91; src/runtime/worker-isolation-policy.ts:219-228 |
| `RD09-115` | proposal-document-coverageは、agent-orchestrationを期待するシナリオでruntime_routingがrequired_evidenceにない場合、失敗させる。 | lane_delegation | lint | src/lint/proposal-document-coverage-policy.ts:62-62; src/lint/proposal-document-coverage.ts:157-166 |
| `RD09-134` | proposal-document-coverageは、routing文書にT2-mini・T2-spark・T0-frontier・parallel_slots・ownership・closing_authority=false・cannot close G4/G5 riskのいずれかがない場合、失敗させる。 | lane_delegation | lint | src/lint/proposal-document-coverage-policy.ts:105-113; src/lint/proposal-document-coverage.ts:224-232 |
| `RE01-114` | workerは委譲された作業中に要求・設計・受入条件を独断で変更してはならない。 | lane_delegation | prose | docs/governance/helix-harness-requirements_v1.2.md:1555-1614 |
| `RE01-126` | 委譲者はL/XL、confidence 0.7未満、規定の見積倍率、production条件に応じて上位レビューへ上げ、required skill不足やvendor skill利用はTLへ上げる。 | lane_delegation | prose／config | docs/governance/helix-harness-requirements_v1.2.md:1803-1805 |
| `RE01-238` | worker起動者はdescriptor・context・HEAD・authority・rulesを束縛し、隔離worktreeとsecret拒否の条件を満たしてから起動する。 | safety_security | gate | docs/governance/helix-harness-requirements_v1.3.md:428-428 |
| `RF01-005` | ツール契約検証器は、登録契約のdispositionがdeferであり、他の契約違反がない場合、allowではなくdeferを返す。 | tooling_runtime | gate | src/orchestration/tool-contract.ts:170-182 |
| `RF01-032` | チームmember実行処理は、provider起動時の時間予算として、admission済みworker contextのpacket.budget.time_msをrunCommandへ渡す。 | tooling_runtime | gate | src/team/run.ts:506-522 |
| `RG16-004` | 委譲者は、調査を委譲するpromptにsource数の下限を含める。 | lane_delegation | prose | docs/skills/agent-cost-design.md:54-58 |
| `RG16-005` | 委譲者は、promptに単なる要約ではなく「観測事実→解釈→仮説→検証方法」の推論chainを要求する。 | lane_delegation | prose | docs/skills/agent-cost-design.md:56-58 |
| `RG16-009` | agent guardは、agent定義で宣言されたtool listを許可されたsurfaceと照合する。 | safety_security | hook | docs/skills/agent-design.md:35-40 |
| `RG18-014` | workerへの委譲者は出力形式として要約を指定し、全文dumpを返させてはならない。 | memory_context | prose | docs/skills/judgment-core.md:146-149 |

## 副として対応づいた規則（118件）

`RA-022`、`RA-027`、`RA-046`、`RA-098`、`RA-099`、`RA-100`、`RA-101`、`RA-102`、`RA-103`、`RA-112`、`RA-139`、`RA-144`、`RA-302`、`RB0-140`、`RB0-170`、`RB04-244`、`RB05-151`、`RB05-156`、`RB05-157`、`RB05-160`、`RB06-126`、`RB06-161`、`RB06-163`、`RB06-293`、`RB07-042`、`RB07-313`、`RB08-170`、`RB08-172`、`RB09-043`、`RB09-045`、`RC0-016`、`RC0-111`、`RC0-117`、`RC0-119`、`RC00-003`、`RC00-004`、`RC00-049`、`RC00-050`、`RC00-144`、`RC00-167`、`RC00-200`、`RC00-214`、`RC01-005`、`RC01-006`、`RC01-007`、`RC02-041`、`RC03-106`、`RC03-117`、`RC03-118`、`RC03-133`、`RC04-020`、`RC04-030`、`RD00-005`、`RD00-006`、`RD00-007`、`RD00-009`、`RD00-213`、`RD00-219`、`RD00-245`、`RD00-262`、`RD01-075`、`RD01-078`、`RD01-084`、`RD02-006`、`RD02-008`、`RD02-018`、`RD02-019`、`RD02-025`、`RD02-027`、`RD02-029`、`RD02-031`、`RD02-032`、`RD02-033`、`RD02-065`、`RD02-073`、`RD02-247`、`RD02-254`、`RD02-269`、`RD02-271`、`RD02-272`、`RD02-274`、`RD02-275`、`RD03-001`、`RD03-077`、`RD03-084`、`RD03-089`、`RD03-090`、`RD04-009`、`RD04-011`、`RD04-013`、`RD04-014`、`RD04-018`、`RD04-023`、`RD04-057`、`RD04-073`、`RD04-074`、`RD04-084`、`RD04-085`、`RD04-086`、`RD04-088`、`RD04-102`、`RD04-105`、`RD04-108`、`RD04-113`、`RD04-114`、`RD04-115`、`RD04-125`、`RD04-127`、`RD04-134`、`RD04-157`、`RD09-138`、`RE01-127`、`RE01-148`、`RE01-151`、`RG18-007`、`RG18-008`、`RG18-009`、`RG19-010`
