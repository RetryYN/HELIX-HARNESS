---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 386e4083f1a47c2d09ea75ea774772421a44b6f5dd9eaa331d6ea773cd683ffa
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: 97a9e0a4cfd5999f5178ec13f758ef71c334191aac51ed43c3bb9570bd762784
rule_id: RUL-OSP-02
group: OS推進
product: OS
atoms_primary: 65
atoms_secondary: 52
issue_projection: #1859
---

# RUL-OSP-02（OS推進／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

作業の性質に応じてmodel・provider・推論の深さを割り当て、結果に応じて調整する。能力が足りない実行環境には割り当てず、上位modelの使用は許可を要する。

## 主として対応づいた規則（65件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-096` | エージェントはモデル別標準effortを既定とし、frontmatterのeffort指定がある場合はoverrideとして使う。 | tooling_runtime | prose／config | n/a | src/team/model-effort.ts、fable/high、opus・sonnet・worker/medium、haiku・spark/low、frontier/high、未知/medium | — | .claude/CLAUDE.md:208-216 | A／gpt-6-astra |
| `RA-097` | runtimeは回答が浅ければeffortを一段上げ、遅すぎれば一段下げ、矛盾・無信号なら維持する。 | tooling_runtime | prose | n/a | adaptReasoningEffort | — | .claude/CLAUDE.md:214-215 | A／gpt-6-astra |
| `RA-098` | advisor-fableはRead・Grep・Glob・Bash、claude-fable-5-1、high、maxTurns 25のprofileで動作する。 | tooling_runtime | config | n/a | advisor-fable frontmatter | `RUL-OSP-03` | .claude/agents/advisor-fable.md:4-8 | A／gpt-6-astra |
| `RA-099` | BE・DB・DevOps・code-reviewer・security-auditはRead・Grep・Glob・Edit・Write・BashとSonnet 5 highを使い、maxTurnsはBE 30、DB・DevOps 25、reviewer・security 20とする。 | tooling_runtime | config | n/a | claude-sonnet-5、各frontmatter | `RUL-OSP-03` | .claude/agents/be-api.md:4-8; .claude/agents/be-logic.md:4-8; .claude/agents/db-schema.md:4-8; .claude/agents/devops-deploy.md:4-8; .claude/agents/code-reviewer.md:4-8; .claude/agents/security-audit.md:4-8 | A／gpt-6-astra |
| `RA-100` | fe-ui・QA・PMO Sonnet・project explorerは基本編集tool群とSonnet 5 mediumを使い、maxTurnsは順に30・25・20・20とする。 | tooling_runtime | config | n/a | Read/Grep/Glob/Edit/Write/Bash、claude-sonnet-5 | `RUL-OSP-03` | .claude/agents/fe-ui.md:4-8; .claude/agents/qa-test.md:4-8; .claude/agents/pmo-sonnet.md:4-8; .claude/agents/pmo-project-explorer.md:4-8 | A／gpt-6-astra |
| `RA-101` | tech-docs・tech-fork・tech-newsは基本編集tool群にWebSearch・WebFetchを加え、Sonnet 5 medium、maxTurns 20を使う。 | tooling_runtime | config | n/a | claude-sonnet-5、各frontmatter | `RUL-OSP-03` | .claude/agents/pmo-tech-docs.md:4-8; .claude/agents/pmo-tech-fork.md:4-8; .claude/agents/pmo-tech-news.md:4-8 | A／gpt-6-astra |
| `RA-102` | Haiku系agentはHaiku 4.5 low、maxTurns 10を使い、refactor-scoutは読取toolだけ、project-scoutは基本編集tool群、pmo-haikuはさらにweb toolを使用可能とする。 | tooling_runtime | config | n/a | claude-haiku-4-5-20251001 | `RUL-OSP-03` | .claude/agents/refactor-scout.md:4-8; .claude/agents/pmo-project-scout.md:4-8; .claude/agents/pmo-haiku.md:4-8 | A／gpt-6-astra |
| `RA-103` | fe-leadとPDM系agentはOpus 5を使い、maxTurnsをfe-lead・tech・marketing 30、manager 40とし、PDM系だけweb toolも使用可能とする。 | tooling_runtime | config | n/a | claude-opus-5、各frontmatter | `RUL-OSP-03` | .claude/agents/fe-lead.md:4-7; .claude/agents/pdm-tech-innovation.md:4-7; .claude/agents/pdm-marketing-innovation.md:4-7; .claude/agents/pdm-innovation-manager.md:4-7 | A／gpt-6-astra |
| `RA-138` | advisor-fableはTL相談後未解決、2回目もruntime対立、高影響操作の承認前、PO質問直前、3回以上失敗・正本矛盾、UX判断のいずれかの場合だけ呼び、日常判断には使わない。 | lane_delegation | prose | n/a | advisor-fable、tl_advisor_evidence | `RUL-OSP-04` | .claude/CLAUDE.md:182-194; .claude/agents/advisor-fable.md:15-32 | A／gpt-6-astra |
| `RB0-169` | 委譲者はriskまたはcostを下げる場合だけ作業を分割し、軽量roleへrepository-state判断を委譲しない。 | lane_delegation | prose | n/a | pmo-haiku等の旧role階層 | `RUL-TKT-02` | docs/skills/agent-cost-design.md:19-22; docs/skills/agent-cost-design.md:40-42; docs/skills/agent-cost-design.md:76-77; docs/skills/agent-teams.md:23-25 | B／gpt-6-astra |
| `RB0-170` | subagent起動者はmodelを明示し、省略や空値で親modelを暗黙継承させない。 | tooling_runtime | prose／hook | n/a | 旧Agent model field、agent-guard | `RUL-OSP-03` | docs/skills/agent-cost-design.md:40-42; docs/skills/agent-design.md:38-38; docs/skills/agent-design.md:65-66; docs/skills/agent-design.md:79-79; docs/skills/agent-teams.md:97-97 | B／gpt-6-astra |
| `RB04-016` | 委譲者は設計判断・要件分解・R4合流・判断gateレビューを、作業AIと別系統の最上位モデルクラスへ依頼する。 | lane_delegation | prose | n/a | frontier-reviewer、G0.5/G2/G4-G7/R4 | `RUL-OSA-01` | docs/governance/helix-harness-concept_v3.1.md:183-185 | B04／gpt-6-astra |
| `RB04-017` | 委譲者は実装・機械的修正・テスト追加・文書整形をworkerへ、軽量lint・要約・差分分類・コマンド生成補助をfast-checkerへ割り当てる。 | lane_delegation | prose | n/a | worker、fast-checker | `RUL-OSP-01` | docs/governance/helix-harness-concept_v3.1.md:186-187 | B04／gpt-6-astra |
| `RB04-018` | 構想書の管理者はモデル実名を固定せず、team定義でprovider・command・model・role・budgetを宣言する。 | tooling_runtime | prose／config | n/a | .helix/teams/*.yaml | `RUL-TKT-02`、`RUL-OSM-02` | docs/governance/helix-harness-concept_v3.1.md:190-190 | B04／gpt-6-astra |
| `RB04-028` | 複数AIが利用可能な場合、委譲者は軽量分類をfast-checkerへ、曖昧なL/XL判定や本番影響を含む見積もりレビューをfrontier-reviewerへ回す。 | lane_delegation | prose | n/a | 旧サイズ分類とモデルクラス | — | docs/governance/helix-harness-concept_v3.1.md:233-233 | B04／gpt-6-astra |
| `RB04-046` | pair-agent TDDのsignalではmodeをAdd-featureのままとし、smart test author・lightweight implementation・smart reviewの経路とhelix pair-agent planを推薦する。 | lane_delegation | config | n/a | helix pair-agent plan | `RUL-FRM-03`、`RUL-OSA-01` | docs/governance/helix-harness-concept_v3.1.md:449-449 | B04／gpt-6-astra |
| `RB06-059` | 提案されたeffort可観測性では、未知modelのfallback使用時にwarningとeffort_source=fallbackのDB記録を残す。 | evidence_claim | prose | warn | medium fallbackの監査提案 | — | docs/governance/rule-enforcement-gap-audit-2026-08-12.md:85-90; docs/governance/rule-enforcement-gap-audit-2026-08-12.md:229-230 | B06／gpt-6-astra |
| `RB06-125` | worker評価はbenchと実taskから用途別decisionを出し、固定fixture・rubricのblind scoreを再現して重大failureの相殺を認めない。 | evidence_claim | prose | fail_close | 未実装WorkerAcceptanceBench | `RUL-FRM-04` | docs/governance/infinity-loop-assertion-coverage-ledger.md:61-61; docs/governance/infinity-loop-assertion-coverage-ledger.md:129-129; docs/governance/infinity-loop-assertion-coverage-ledger.md:193-193 | B06／gpt-6-astra |
| `RB06-158` | EffortRouterはtask・risk・scoreから最小有効model/effort構成を選び、比較receipt欠落を拒否する。 | lane_delegation | prose | fail_close | 未実装EffortRouter | — | docs/governance/infinity-loop-assertion-coverage-ledger.md:131-131; docs/governance/infinity-loop-assertion-coverage-ledger.md:194-194 | B06／gpt-6-astra |
| `RB08-204` | model選択者は機械的subtaskに成立する最軽量modelを使い、frontier modelを判断gate・設計判断へ割り当てる。 | lane_delegation | prose | n/a | low-cost-first、model_runs | — | docs/skills/llm-agent-routing.md:39-41 | B08／gpt-6-astra |
| `RC0-116` | Team runnerは、配置判定がfrontier gateのblockedReasonを持つmemberがいる場合、実行計画を不合格にする。 | lane_delegation | gate | fail_close | T0／--allow-frontier | `RUL-OSP-06` | src/team/run.ts:440-446 | C／gpt-6-astra |
| `RC00-045` | agent正本投影器は、runtime経路が必要能力を満たさなければ警告し、投影をskipする。 | tooling_runtime | gate | warn | runtime-capability-matrixによる判定 | `RUL-OSM-02` | src/runtime/agent-ssot-runtime-projection.ts:56-70; src/runtime/agent-ssot-runtime-projection.ts:86-87 | C00／gpt-6-astra |
| `RC00-166` | runtime能力判定は、runtimeがregistryに存在しなければ不合格としてescalateを返す。 | lane_delegation | config／gate | fail_close | 固定5runtimeのmatrix | `RUL-OSM-02` | src/runtime/runtime-capability-matrix.ts:248-262 | C00／gpt-6-astra |
| `RC00-167` | runtime能力判定は、要求能力にunsupportedが1つでもあれば不合格としてfallbackを返す。 | lane_delegation | config／gate | fail_close | limitedは欠落扱いにしない | `RUL-OSP-03` | src/runtime/runtime-capability-matrix.ts:265-277 | C00／gpt-6-astra |
| `RC00-207` | worker risk admissionは、effortを固定するpolicyに、そのeffortを含むbenchmark receiptのdigestによる正当化がなければ拒否する。 | lane_delegation | gate | fail_close | effort_justification_receipt_digest | `RUL-FRM-04`、`RUL-COR-02` | src/runtime/worker-risk-admission.ts:229-241 | C00／gpt-6-astra |
| `RC00-209` | worker risk admissionは、candidateにsecret_leakのstandalone findingがあれば用途ごとの採用を拒否してretireとする。 | safety_security | gate | fail_close | WORKER_RISK_CRITICAL_SECRET_LEAK | `RUL-OSM-04` | src/runtime/worker-risk-admission.ts:160-163; src/runtime/worker-risk-admission.ts:244-270 | C00／gpt-6-astra |
| `RC00-210` | worker risk admissionは、candidateにschema_violationのstandalone findingがあれば用途ごとの採用を拒否してretireとする。 | tooling_runtime | gate | fail_close | WORKER_RISK_CRITICAL_SCHEMA_VIOLATION | `RUL-COR-04` | src/runtime/worker-risk-admission.ts:160-163; src/runtime/worker-risk-admission.ts:244-270 | C00／gpt-6-astra |
| `RC00-212` | worker risk admissionは、必要risk間の最低blind scoreが用途の最低点を下回る場合に候補をretireとする。 | lane_delegation | gate | fail_close | min_blind_score | — | src/runtime/worker-risk-admission.ts:252-270 | C00／gpt-6-astra |
| `RC00-213` | worker risk admissionは、必要risk間のeffective cost合計が用途上限を超える場合に候補をretireとする。 | lane_delegation | gate | fail_close | max_effective_cost | `RUL-TKT-02` | src/runtime/worker-risk-admission.ts:253-270 | C00／gpt-6-astra |
| `RC00-214` | worker risk admissionは、固定effort指定に対し候補のeffortが一致しない場合に候補をretireとする。 | lane_delegation | gate | fail_close | risk間でeffortが複数ならnull扱い | `RUL-OSP-03` | src/runtime/worker-risk-admission.ts:256-270 | C00／gpt-6-astra |
| `RC01-001` | agent-model-ssotは、agent文書にmodel値がない場合、検査を不合格にする。 | tooling_runtime | lint | fail_close | .claude/agents/*.md | `RUL-OSM-02` | src/lint/agent-model-ssot.ts:61-64 | C01／gpt-6-astra |
| `RC01-002` | agent-model-ssotは、agentのmodelがMODEL_IDSの正本IDまたはそのIDに数字のsnapshot接尾辞を付けた値に一致しない場合、不合格にする。 | tooling_runtime | lint | fail_close | claude-/gpt-で始まるMODEL_IDSと数字接尾辞 | `RUL-OSM-02`、`RUL-COR-01` | src/lint/agent-model-ssot.ts:35-51; src/lint/agent-model-ssot.ts:66-74 | C01／gpt-6-astra |
| `RC04-105` | pair-agentは、frontier使用の明示許可が無ければplanで警告し、execute時には実行を拒否する。 | escalation_authority | gate | fail_close | allowFrontierとT0 | `RUL-OSM-01` | src/orchestration/pair-agent.ts:235-242; src/orchestration/pair-agent.ts:318-319; src/orchestration/pair-agent.ts:483-489 | C04／gpt-6-astra |
| `RC04-148` | drive分類器は、分類confidenceが0.7未満なら警告する。 | process_gate | gate | warn | 既定fullstack分類は0.6 | — | src/workflow/contracts-extras.ts:200-225 | C04／claude_review |
| `RD02-003` | admission検証器は、KimiのPR収束レビュー用v2証跡でなく、許可リスクがlow・mediumの順序付き集合でない場合に拒否する。 | review_merge | gate | fail_close | helix-kimi-review-fallback-admission.v2、pr_convergence_review | `RUL-COR-04` | src/runtime/independent-review-fallback.ts:178-186 | D02／gpt-6-astra |
| `RD02-015` | provider障害分類器は、HEAD・観測時刻が不正、終了コードが0、または既知の障害文言に該当しない場合にfallback障害証跡の発行を拒否する。 | review_merge | gate | fail_close | quota、unavailable、claim timeoutのstderr分類 | `RUL-COR-04`、`RUL-FRM-04` | src/runtime/independent-review-fallback.ts:371-392 | D02／gpt-6-astra |
| `RD02-018` | provider選択器は、task classがfallback許可集合に含まれない場合に拒否する。 | lane_delegation | gate | fail_close | admitted_fallback_task_classes | `RUL-OSP-03` | src/runtime/independent-review-fallback.ts:445-447 | D02／gpt-6-astra |
| `RD02-019` | provider選択器は、リスクがhighまたはcriticalの場合にKimi fallbackを拒否する。 | review_merge | gate | fail_close | ClaudeからKimiへのfallback | `RUL-OSP-03` | src/runtime/independent-review-fallback.ts:448-450 | D02／gpt-6-astra |
| `RD02-024` | リスクadmissionは、申告リスクまたは導出リスクが許可集合の外にある場合に拒否する。 | review_merge | gate | fail_close | admitted_risk_classes | `RUL-COR-04` | src/runtime/independent-review-fallback.ts:583-588 | D02／gpt-6-astra |
| `RD02-149` | role policy判定器は、承認なしの過剰model使用をescalateする。 | escalation_authority | gate | fail_close | overpowered_without_approval flag | `RUL-OSM-01` | src/runtime/legacy-adoption.ts:456-458 | D02／gpt-6-astra |
| `RD03-084` | specialist registry検証は、model classがruntime別MODEL_IDS正本にない場合、不合格にする。 | lane_delegation | gate | fail_close | model_class_not_in_ssot。 | `RUL-OSP-03`、`RUL-COR-01` | src/runtime/specialist-agent-registry.ts:121-123; src/runtime/specialist-agent-registry.ts:175-181 | D03／gpt-6-astra |
| `RD04-102` | isolation brokerは、実行platformがlinux以外の場合に起動準備を拒否する。 | tooling_runtime | gate | fail_close | Linux・bubblewrap・/proc依存 | `RUL-OSP-03` | src/runtime/worker-isolation-broker.ts:514-519 | D04／gpt-6-astra |
| `RD09-132` | proposal-document-coverageは、routing文書にL7・L8・L9・L12・L14・LLM wording・coverage floorの必須markerがいずれか欠ける場合、失敗させる。 | process_gate | lint | fail_close | 旧層番号と英語literal markerのincludes検査 | — | src/lint/proposal-document-coverage-policy.ts:80-88; src/lint/proposal-document-coverage.ts:206-214 | D09／gpt-6-astra |
| `RE01-112` | 委譲設計者はroleを能力で定義し、特定model名に固定せずmodel割当を設定で管理する。 | lane_delegation | config | n/a | role capabilityとmodel mapping | `RUL-OSP-01` | docs/governance/helix-harness-requirements_v1.2.md:1555-1614 | E01／claude-opus |
| `RE01-119` | 委譲者は高価なfrontier modelを判断作業へ集中し、routine作業へ一律に使用しない。 | lane_delegation | prose／config | n/a | frontier modelの用途制限 | `RUL-OSA-08` | docs/governance/helix-harness-requirements_v1.2.md:1555-1614 | E01／claude-opus |
| `RE01-148` | 旧委譲処理はhybrid modeだけで実行し、standaloneでは実行せずguidanceを提供する。 | lane_delegation | config | n/a | hybrid限定の旧委譲仕様 | `RUL-OSP-03` | docs/governance/helix-harness-requirements_v1.2.md:2092-2092 | E01／claude-opus |
| `RE01-151` | 委譲者はreviewerやagentの能力を下げる場合、変更元と変更先を明示し、黙ってdegradeしてはならない。 | lane_delegation | prose | fail_close | agent degradation記録 | `RUL-OSP-03` | docs/governance/helix-harness-requirements_v1.2.md:2124-2186 | E01／claude-opus |
| `RF00-004` | ループadapterは、CodexのworkerにはMODEL_IDS.codex.worker、verifierにはfrontierを指定し、Claudeのworkerにはsonnet、verifierにはopusを指定して実行planを作る。 | lane_delegation | config | n/a | MODEL_IDS.codex.worker/frontier、MODEL_IDS.claude.sonnet/opus | — | src/orchestration/loop-bridge.ts:74-102 | F00／claude-opus |
| `RF00-006` | effort観測器は、verdictFailがtrue、またはoutputCharsが有限の非負数で400未満の場合、shallow=trueを返す。 | tooling_runtime | gate | n/a | SHALLOW_OUTPUT_CHARS_MIN=400、EffortObservation.shallow | — | src/orchestration/loop-effort-budget.ts:13-13; src/orchestration/loop-effort-budget.ts:50-61; src/orchestration/loop-effort-budget.ts:80-82 | F00／claude-opus |
| `RF00-007` | effort観測器は、truncatedがtrueではなく、elapsedMsが有限の非負数で600000を超える場合にだけtooSlow=trueを返す。 | tooling_runtime | gate | n/a | TOO_SLOW_ELAPSED_MS=600000、EffortObservation.tooSlow | — | src/orchestration/loop-effort-budget.ts:14-14; src/orchestration/loop-effort-budget.ts:54-61; src/orchestration/loop-effort-budget.ts:80-82 | F00／claude-opus |
| `RF01-014` | proposalチーム生成器は、model標準effortを起点とし、T2-mini・T2-sparkではlow、T1-workerではxhigh、T0-frontierではhighを上限としてeffortを抑える。 | tooling_runtime | config／gate | n/a | 旧lane tierとeffort上限の対応 | — | src/team/launch-policy.ts:136-145; src/team/model-effort.ts:65-67 | F01／claude-opus |
| `RF01-023` | 標準effort解決器は、model完全一致の登録値を優先し、なければ一意に解決できるfamilyの登録値を使い、それもなければmediumを返す。 | tooling_runtime | config／gate | n/a | EXACT_MODEL_STANDARD_EFFORT・FAMILY_STANDARD_EFFORTとmedium fallback | — | src/team/model-effort.ts:35-56 | F01／claude-opus |
| `RF01-024` | effort適応器は、shallowだけがtrueの場合、lowからmedium、mediumからhighへ一段上げるが、high・xhighは据え置く。 | tooling_runtime | gate | n/a | low・medium・high・xhighのeffort ladder | — | src/team/model-effort.ts:76-82; src/team/model-effort.ts:96-103 | F01／claude-opus |
| `RF01-025` | effort適応器は、tooSlowだけがtrueの場合、effortを一段下げるが、lowより下には下げない。 | tooling_runtime | gate | n/a | xhigh→high→medium→lowの下降順序 | — | src/team/model-effort.ts:84-87; src/team/model-effort.ts:96-103 | F01／claude-opus |
| `RF01-026` | effort適応器は、shallowとtooSlowがともにtrue、またはどちらもtrueでない場合、現在のeffortを変更しない。 | tooling_runtime | gate | n/a | shallow・tooSlowの二値観測 | — | src/team/model-effort.ts:96-103 | F01／claude-opus |
| `RF01-027` | チームmodel選択器は、effortが明示されている場合、その値をmodel標準effortと観測による適応結果より優先する。 | tooling_runtime | config／gate | n/a | selectTeamModelのinput.effort override | — | src/team/model-policy.ts:207-213 | F01／claude-opus |
| `RG10-020` | agent-guardの採用対象規則では、fableをquality gate系roleに限定する。 | lane_delegation | prose | n/a | 上流PR #44、FAMILY_RANK、fable apex-tierの採用台帳 | `RUL-OSM-02` | docs/governance/handover-retirement-memory-audit-2026-07-11.md:86-91 | G10／claude-opus |
| `RG16-001` | 委譲者は、複数sourceのweb調査、文書要約、収集済み事実からの仮説生成、定型status・handover整形をpmo-haikuへ割り当てる。 | lane_delegation | prose | n/a | pmo-haiku | `RUL-OSP-01` | docs/skills/agent-cost-design.md:30-38 | G16／claude-opus |
| `RG16-002` | 委譲者は、ADR作成、gate review、設計判断をprimary session modelへ割り当てる。 | lane_delegation | prose | n/a | primary session model | `RUL-OSP-01` | docs/skills/agent-cost-design.md:32-36 | G16／claude-opus |
| `RG16-011` | agent設計者は、capability classの根拠を示し、必要な能力を満たす最小限のmodel tierを割り当てる。 | lane_delegation | prose | n/a | — | — | docs/skills/agent-design.md:65-66; docs/skills/agent-design.md:81-81 | G16／claude-opus |
| `RG18-007` | Opusへの指示ではスコープ規律を明示的に強調し、subagentの利用を並列実行または独立contextが必要な場合に限定する。grep一回で済む探索を委譲してはならない。 | lane_delegation | prose | n/a | Opus向けモデル別調整 | `RUL-OSP-03` | docs/skills/judgment-core.md:97-97 | G18／claude-opus |
| `RG18-008` | Sonnetへの委譲者は標準mediumで依頼し、推論が浅い場合はreasoning effortを1段上げる。 | lane_delegation | prose | n/a | Sonnetの標準medium指定 | `RUL-OSP-03` | docs/skills/judgment-core.md:98-98 | G18／claude-opus |
| `RG18-009` | Haikuへの委譲者は判断が必要な局面で自己判断させず、エスカレーション先を明記する。 | lane_delegation | prose | n/a | Haiku向けモデル別調整 | `RUL-OSP-03` | docs/skills/judgment-core.md:99-99 | G18／claude-opus |
| `RG37-012` | provider effortの正規化は、"middle"をmediumへ読み替え、"xhigh"はCodex経路でのみ維持しClaude経路ではhighへ落とす。 | tooling_runtime | lint | n/a | normalizeProviderEffort | `RUL-OSM-02` | src/runtime/adapter.ts:654-667 | G37／claude-opus |
| `RG44-011` | runtime能力判定は、limited状態の能力を不足として扱わず、unsupportedだけを不足に数える。 | lane_delegation | prose | warn | runtime-capability-matrix.v1 の固定registry | `RUL-OSM-02` | src/runtime/runtime-capability-matrix.ts:265-277 | G44／claude-opus |

## 副として対応づいた規則（52件）

`RA-113`、`RA-115`、`RA-130`、`RA-133`、`RA-134`、`RA-141`、`RB0-177`、`RB04-013`、`RB04-272`、`RB07-104`、`RB08-062`、`RC0-005`、`RC0-009`、`RC0-010`、`RC0-011`、`RC0-012`、`RC0-013`、`RC00-003`、`RC00-051`、`RC00-172`、`RC00-203`、`RC00-208`、`RC02-065`、`RC03-103`、`RD00-001`、`RD00-028`、`RD00-033`、`RD00-035`、`RD00-036`、`RD01-073`、`RD02-005`、`RD02-009`、`RD02-016`、`RD02-017`、`RD02-021`、`RD02-023`、`RD02-037`、`RD02-064`、`RD02-150`、`RD04-087`、`RD09-115`、`RE01-116`、`RE01-126`、`RE01-237`、`RF01-021`、`RF01-028`、`RG12-002`、`RG16-003`、`RG19-004`、`RG37-009`、`RG46-013`、`RG47-009`
