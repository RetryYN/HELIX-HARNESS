---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: fa4ac4b7a3e9e4f70e0dc4d83926036bc38b60b1920256405e48a51e0151834c
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSI-02
group: OS改善
product: OS
atoms_primary: 32
atoms_secondary: 14
issue_projection: #1861
---

# RUL-OSI-02（OS改善／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

skill、知識、判断の基準を版で管理し、agentとcommandの定義が現行の版を参照していることを確かめる。

## 主として対応づいた規則（32件）

| atom | 規則 | 種類 | 強制 | 失敗時 | 旧実装固有の部分 | 副 | 出どころ | 由来 |
|---|---|---|---|---|---|---|---|---|
| `RA-297` | advisor定義の保守者はjudgment-core正本を改訂したらfrontmatter markerを追随させる。 | behavior_discipline | prose | n/a | judgment_core marker | `RUL-OSM-02` | .claude/agents/advisor-fable.md:34-38 | A／gpt-6-astra |
| `RB0-146` | 判断コア改訂者はversionを上げ、全agent/commandのmarkerを同一commitで追随させる。 | tooling_runtime | doctor／gate | n/a | judgment_core_version、judgment-core-coverage | — | docs/skills/judgment-core.md:37-40; docs/skills/judgment-core.md:181-182; docs/skills/SKILL_MAP.md:77-79 | B／gpt-6-astra |
| `RB04-109` | skill移管者は個人向け原文をそのまま使わずHELIX向けpackへ再記述し、workflow・harness・gateへの接続先を明示する。 | tooling_runtime | prose | n/a | docs/skills/*.md | `RUL-OSM-07` | docs/governance/helix-harness-concept_v3.1.md:993-995 | B04／gpt-6-astra |
| `RB04-138` | agent/commandは判断コアのversion markerと正本pathを参照し、同期不整合や対象ゼロはcoverage lintでfail-closeする。 | process_gate | lint | fail_close | judgment_core:vN、.claude/agents・commands | `RUL-OSA-06` | docs/governance/helix-harness-concept_v3.1.md:1203-1204 | B04／gpt-6-astra |
| `RB04-158` | AGENTS.mdまたはSKILL.mdを更新した場合、管理者は運用ルール書にも反映する。 | memory_context | prose | n/a | AGENTS.md/SKILL.md | `RUL-OSI-03` | docs/governance/ai-dev-team-operations_v1.1.md:62-62 | B04／gpt-6-astra |
| `RB05-192` | learning promotionは再現fixture・shadow効果測定・rollback targetを揃えて正順で進め、recipe生成直後のblocking gate化や段階飛越を拒否する。 | process_gate | gate | fail_close | 未実装learning promotion | `RUL-FRM-02`、`RUL-FRM-05` | docs/governance/infinity-loop-system-assertion-cases.md:133-138; docs/governance/infinity-loop-system-assertion-cases.md:345-345; docs/governance/infinity-loop-system-assertion-cases.md:372-372 | B05／gpt-6-astra |
| `RB05-193` | shadow runで一件でも退行が出た場合、promotion担当はrollbackしactive化しない。 | process_gate | gate | fail_close | 未実装shadow promotion | `RUL-FRM-02` | docs/governance/infinity-loop-system-assertion-cases.md:136-136 | B05／gpt-6-astra |
| `RB05-230` | template candidateはdraftのままactive Gateへ束縛せず、shadow sample不足ならauditへ進めず、既存oracle退行時はrollbackする。 | process_gate | gate | fail_close | 未実装template shadow promotion | `RUL-FRM-02`、`RUL-FRM-05` | docs/governance/infinity-loop-system-assertion-cases.md:262-264 | B05／gpt-6-astra |
| `RB05-232` | active templateの同version内容を書き換えず、shadow・独立audit・migration・rollbackが有効なcandidateだけを新versionへ昇格し、旧instanceをstaleにする。 | process_gate | gate | fail_close | 未実装template version lifecycle | `RUL-COR-02`、`RUL-OSA-01` | docs/governance/infinity-loop-system-assertion-cases.md:268-269 | B05／gpt-6-astra |
| `RB06-104` | learning昇格は再現fixtureとshadow効果測定前にrecipeをblocking gateへ昇格させず、段階順序とrollback対象を記録する。 | process_gate | prose | fail_close | 未実装LearningPromotionLedger | `RUL-OSI-01` | docs/governance/infinity-loop-assertion-coverage-ledger.md:41-41; docs/governance/infinity-loop-assertion-coverage-ledger.md:82-82 | B06／gpt-6-astra |
| `RB06-117` | template改善はshadow評価、独立監査、migration、rollback、role分離を満たすまでcandidateをactive化しない。 | process_gate | prose | fail_close | 未実装TemplateImprovementCoordinator | `RUL-OSA-01` | docs/governance/infinity-loop-assertion-coverage-ledger.md:112-112; docs/governance/infinity-loop-assertion-coverage-ledger.md:185-185 | B06／gpt-6-astra |
| `RB06-123` | judgment pack改善はconflictを露出し、shadow・独立review未完了のpackをactive化しない。 | process_gate | prose | fail_close | 未実装JudgmentPackRegistry | `RUL-OSA-01` | docs/governance/infinity-loop-assertion-coverage-ledger.md:59-59; docs/governance/infinity-loop-assertion-coverage-ledger.md:125-126 | B06／gpt-6-astra |
| `RB06-151` | template registryはimmutable active versionと決定的な適用ruleだけをcurrentにする。 | process_gate | prose | fail_close | 未実装DesignTemplateRegistry | — | docs/governance/infinity-loop-assertion-coverage-ledger.md:109-109 | B06／gpt-6-astra |
| `RB07-095` | skill作成者は普遍原則をjudgment-coreへ集約し、packには工程固有の差分と参照だけを置く。共通原則を昇格するときはversionと全markerを更新する。 | memory_context | prose | n/a | judgment-core／marker同期 | `RUL-COR-01`、`RUL-OSM-02` | docs/skills/skill-authoring.md:35-36; docs/skills/skill-authoring.md:108-109 | B07／gpt-6-astra |
| `RB07-106` | skill作成者は新規・改修packのfrontmatter lintとdoctor greenを確認し、SKILL_MAPへtriggerを追加する。 | process_gate | prose／lint／doctor | fail_close | skill.v1／SKILL_MAP | `RUL-OSA-06` | docs/skills/skill-authoring.md:103-104 | B07／gpt-6-astra |
| `RC00-039` | skill効果検証は、regression指定または評価差分が負なら隔離候補として警告し、昇格を許可しない。 | process_gate | gate | warn | quarantine_candidate | `RUL-FRM-04` | src/runtime/skill-efficacy-evaluation.ts:61-78 | C00／gpt-6-astra |
| `RC00-040` | skill効果検証は、証拠が揃っていても評価差分が正でなければ昇格を許可しない。 | process_gate | gate | fail_close | grade_deltaは小数4桁へ丸める | `RUL-FRM-04` | src/runtime/skill-efficacy-evaluation.ts:61-65 | C00／gpt-6-astra |
| `RC00-042` | skill衛生検査は、呼出実績があり受入率が1未満の改善候補をallowed=falseとし、変更前後の評価と検証済みfailureまたはPO指示を要求する。 | evidence_claim | gate | fail_close | 改善許可を判定する証拠入力はこの関数にない | `RUL-OSI-01`、`RUL-FRM-04` | src/runtime/skill-memory-hygiene.ts:84-96 | C00／gpt-6-astra |
| `RC01-032` | judgment-core-coverageは、判断コア正本の数値versionが得られない場合、不合格にする。 | behavior_discipline | lint | fail_close | docs/skills/judgment-core.mdのjudgment_core_version | — | src/lint/judgment-core-coverage.ts:55-61; src/lint/judgment-core-coverage.ts:81-90 | C01／gpt-6-astra |
| `RC01-033` | judgment-core-coverageは、agentまたはcommand文書にjudgment_core markerがない場合、不合格にする。 | behavior_discipline | lint | fail_close | .claude/agentsと.claude/commands | — | src/lint/judgment-core-coverage.ts:91-97 | C01／gpt-6-astra |
| `RC01-034` | judgment-core-coverageは、文書のjudgment_core markerが正本versionから導いたvNに一致しない場合、不合格にする。 | behavior_discipline | lint | fail_close | vN形式のmarker | — | src/lint/judgment-core-coverage.ts:98-103 | C01／gpt-6-astra |
| `RC01-035` | judgment-core-coverageは、agentまたはcommand文書が判断コア正本pathを含まない場合、不合格にする。 | behavior_discipline | lint | fail_close | docs/skills/judgment-core.mdの文字列検査 | `RUL-COR-01` | src/lint/judgment-core-coverage.ts:105-111 | C01／gpt-6-astra |
| `RC01-036` | judgment-core-coverageは、検査対象文書が0件の場合、不合格にする。 | tooling_runtime | lint | fail_close | agents/commandsの合計件数 | `RUL-OSA-06` | src/lint/judgment-core-coverage.ts:113-119 | C01／gpt-6-astra |
| `RC02-042` | doctorのjudgment-core-coverage checkは、判断コア被覆検査が不合格、または文書を読めない場合に失敗する。 | behavior_discipline | doctor | fail_close | analyzeJudgmentCoreCoverage | `RUL-OSA-06` | src/doctor/index.ts:1097-1110 | C02／gpt-6-astra |
| `RC02-078` | doctorのproject-skill-binding checkは、bindingのready状態・source package・command・選択model・workflow/layer被覆・依存関係・source binding・非空候補・required skill・連番rank・before_work注入・match・skill pathの契約違反、または投影不能で失敗する。 | lane_delegation | doctor | fail_close | hybrid-vmodel-source.v1、SKILL_MAP.md、automation_assets/skill_recommendations | `RUL-OSA-06` | src/doctor/index.ts:2943-3064 | C02／gpt-6-astra |
| `RC04-141` | skill推薦器は、catalogが空なら警告する。 | tooling_runtime | gate | warn | — | — | src/workflow/contracts-extras.ts:44-48; src/workflow/contracts-extras.ts:237-244 | C04／gpt-6-astra |
| `RD03-036` | session logは、skill注入の成功・不一致・欠落・失敗を記録するが、記録失敗でprovider起動や作業を止めない。 | memory_context | hook | fail_open | skill_injection event。failedのみoutcome=error。 | `RUL-COR-04` | src/runtime/session-log.ts:335-357 | D03／gpt-6-astra |
| `RD04-225` | asset drift lintは、登録rootがあるのにdocs/skillsが存在しない、または.gitkeep以外の対象assetが無い場合に違反とする。 | process_gate | lint | fail_close | docs/skillsとskillDocCount | `RUL-OSA-06` | src/lint/asset-drift.ts:59-63; src/lint/asset-drift.ts:93-112; src/lint/asset-drift.ts:171-177 | D04／gpt-6-astra |
| `RE01-125` | skill管理者は未canonical化のskillをgateの根拠にせず、vendor由来のskillをcandidateとして扱う。 | process_gate | prose | fail_close | vendor skill candidate管理 | `RUL-OSA-06` | docs/governance/helix-harness-requirements_v1.2.md:1775-1775 | E01／claude-opus |
| `RE01-140` | skill設計者はskillを知識・checklistとして管理し、実行条件はworkflowに所有させる。vendor本文をそのままcanonical skillとして使わない。 | process_gate | prose | n/a | docs/skillsとworkflowの責務分離 | `RUL-OSP-08` | docs/governance/helix-harness-requirements_v1.2.md:1952-1990 | E01／claude-opus |
| `RE01-209` | skill推薦者はtask・drive・layerと測定結果に基づいて推薦し、効果の裏付けのない主張やstaleな旧versionの黙示利用をしない。 | evidence_claim | prose／gate | fail_close | skill efficacyとversion管理 | `RUL-OSP-08` | docs/governance/helix-harness-requirements_v1.3.md:291-291 | E01／claude-opus |
| `RG09-012` | add-design担当者は、domain boundary・invariant・workflow evidence・test granularityを変更する機能について、DDD/TDD規約正本を更新するか影響なしを明示する。 | process_gate | prose | n/a | Add-feature add-design、docs/governance/ddd-tdd-rules.md | `RUL-COR-01` | docs/governance/ddd-tdd-rules.md:151-151 | G09／claude-opus |

## 副として対応づいた規則（14件）

`RB04-110`、`RB04-271`、`RB06-043`、`RB06-153`、`RB06-183`、`RB08-171`、`RC00-038`、`RC00-041`、`RC04-149`、`RD05-008`、`RG03-008`、`RG09-004`、`RG09-013`、`RG18-004`
