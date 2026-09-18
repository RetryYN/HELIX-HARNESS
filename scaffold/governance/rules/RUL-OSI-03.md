---
status: scaffold
authority_effect: none
generated_by: scaffold/governance/tools/gen_rulebook.py
source_candidate: docs/governance/candidates/legacy-rule-derived-requirements.md
source_candidate_sha256: 1c9891cbf76d7a28a6cf64b75e907e6ddad41c0aac5c9fa0a9196421211407a5
source_inventory: docs/governance/legacy-rule-atom-inventory.jsonl
source_inventory_sha256: e265b57e50d4c0f2f161c89a7dadbde12738bd84eab21de3fb5745d7741ef125
rule_id: RUL-OSI-03
group: OS改善
product: OS
atoms_primary: 27
atoms_secondary: 26
issue_projection: #1861
---

# RUL-OSI-03（OS改善／OS）

仮のルール。正本は[要求候補](../../../docs/governance/candidates/legacy-rule-derived-requirements.md)であり、本fileはその機械的な写しである。採否・承認・完了を生成しない。

## 要求

driftの検出、振り返り、訓練を定期に運転し、未割当の資産や規則の乖離を工程へ戻す。

## 主として対応づいた規則（27件）

| atom | 規則 | 種類 | 強制 | 出どころ |
|---|---|---|---|---|
| `RB04-060` | 技術要求のdrift運用はdetectorを週次以上起動し、inventoryで工程を双方向対応させ、新規assetの工程未割当を許容せずReverse normalizationへ接続する。 | process_gate | prose | docs/governance/helix-harness-concept_v3.1.md:567-567 |
| `RB04-113` | 週次点検では90日違反なしを降格推奨、30日未使用を警告、90日未使用をarchive候補として示し、降格・無効化はPO/TL確認後に限る。 | escalation_authority | prose | docs/governance/helix-harness-concept_v3.1.md:1012-1020 |
| `RB04-157` | 運用ルール管理者は月次レトロで本書を見直し、変更をPRで提出してTLとQAの承認を得る。 | review_merge | prose | docs/governance/ai-dev-team-operations_v1.1.md:56-60 |
| `RB04-271` | AI品質劣化にはharness・観点リスト強化と複数AI比較、属人化には文書・pair作業・知識移転で対処する。 | behavior_discipline | prose | docs/governance/ai-dev-team-concept_v1.1.md:513-516 |
| `RB04-273` | 採用難には副業・委託と育成を活用し、process硬直化には定期retroとharness改善で対処する。 | behavior_discipline | prose | docs/governance/ai-dev-team-concept_v1.1.md:520-521 |
| `RB04-286` | 安定後はTL主導でharnessを改善し、QA主導で知識を整備し、incident訓練と定例retroを継続する。 | behavior_discipline | prose | docs/governance/ai-dev-team-concept_v1.1.md:705-717 |
| `RB07-167` | program管理者はreview開始時にstatusとgraphを実行し、1 sprintを超えてactiveのままtrace-freezeへ進まないPLANをstall信号とする。 | process_gate | prose | docs/skills/project-management.md:47-48 |
| `RB07-306` | 担当者はIR・workflow registry・provider/CLI・native schema・hook能力・agent/model方針・層pair・公開権限・setup profileの変更時にstartup follow-upを起動する。 | process_gate | config | docs/governance/effective-agent-startup-followup-registry.json:26-35 |
| `RB08-046` | command・flag・state pathを変更する担当者は旧参照を検索し、実装と同じcommitで文書を更新する。 | doc_language | prose | docs/skills/documentation.md:53-54; docs/skills/documentation.md:78-81 |
| `RB09-029` | #1035の担当者は、NOW実装を2 project以上で実測したことを入口条件としてobservation／pattern promotionを進め、終端証拠としてcounterexample、mutation、human approvalを揃える。 | process_gate | prose | docs/governance/system-synthesis-rollout-roadmap.md:9-19 |
| `RC00-041` | skill衛生検査は、推薦実績があるのに呼出実績が0のskillを隔離候補として警告する。 | memory_context | gate | src/runtime/skill-memory-hygiene.ts:73-83; src/runtime/skill-memory-hygiene.ts:116-120 |
| `RC00-260` | agent catalog監査は、未分類candidateが1件以上あればエラーとして不合格を返す。 | process_gate | gate | src/runtime/agent-catalog-watch.ts:173-181; src/runtime/agent-catalog-watch.ts:191-193 |
| `RC01-066` | module-driftは、実在するsrc top-level moduleがarchitectureの一覧にない場合、不合格にする。 | process_gate | lint | src/lint/module-drift.ts:88-98 |
| `RC01-077` | tracked-canonicalは、Git追跡ファイルのtop-level名がrepository-structure文書に含まれずbaselineにもない場合、不合格にする。 | process_gate | lint | src/lint/tracked-canonical.ts:16-36 |
| `RC02-039` | doctorのmodule-drift checkは、実在source moduleと設計moduleの検査が不合格、または設計・sourceを読めない場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:980-982; src/doctor/index.ts:1038-1057 |
| `RC02-043` | doctorのskill-assignment checkは、skill割当検査が不合格、または割当metadataを読めない場合に失敗する。 | lane_delegation | doctor | src/doctor/index.ts:1112-1131 |
| `RC02-133` | doctorのtracked-canonical checkは、Git追跡top-levelがrepository-structureのcanonical定義で被覆されないなど検査が不合格、または読込不能の場合に失敗する。 | process_gate | doctor | src/doctor/index.ts:5598-5618 |
| `RC02-136` | doctorのdependency-drift checkは、依存graph検査が不合格、または読込不能の場合に失敗し、読込不能時は結果をnullとする。 | process_gate | doctor | src/doctor/index.ts:5726-5748 |
| `RC04-143` | asset catalog生成器は、資産が0件なら警告する。 | tooling_runtime | gate | src/workflow/contracts-extras.ts:62-72 |
| `RC04-149` | command catalog生成器は、文書のcommandがCLI surfaceに無ければ警告する。 | tooling_runtime | gate | src/workflow/contracts-extras.ts:257-275 |
| `RD06-027` | design-coverage lintは、実在する設計文書がどのitemのartifactにもbaselineにも登録されていない場合、失敗させる。 | process_gate | lint | src/lint/design-coverage.ts:360-380 |
| `RD06-072` | design-reality-binding lintは、空failure bindingの文書本文に失敗方針を示す見出しと節内の語が見つかる場合、本文と機械bindingの差の候補としてadvisoryを出す。 | evidence_claim | lint | src/lint/design-reality-binding.ts:272-297; src/lint/design-reality-binding.ts:1047-1057 |
| `RD07-002` | frontend-design-coverageは、FE設計slugがdocument-system-map本文に記載されていなければ失敗する。 | process_gate | lint | src/lint/frontend-design-coverage.ts:125-131 |
| `RD10-180` | skill quality lintはskillのslugまたはnameがSKILL_MAPのTrigger tableのPack列tokenに完全一致で登録されていなければ失敗させる。 | tooling_runtime | lint | src/lint/skill-quality.ts:202-218 |
| `RD10-181` | skill quality lintはTrigger tableのPack列tokenが実在するskillのslug／nameと一致しなければ失敗させる。 | tooling_runtime | lint | src/lint/skill-quality.ts:219-227 |
| `RD10-202` | telemetry closure lintは所定の9計測要求について、有効なstatusを持つ表行が欠ける場合に失敗させる。 | process_gate | lint | src/lint/telemetry-closure.ts:45-55; src/lint/telemetry-closure.ts:172-177 |
| `RE01-154` | 管理者は90日間失敗がない場合も自動で統制を下げず、未使用30日を警告、90日のarchiveを人間のPO/TL判断とする。 | escalation_authority | prose／doctor | docs/governance/helix-harness-requirements_v1.2.md:2240-2244 |

## 副として対応づいた規則（26件）

`RA-273`、`RB0-042`、`RB04-117`、`RB04-132`、`RB04-158`、`RB04-220`、`RB04-254`、`RB04-270`、`RB08-273`、`RC00-046`、`RC00-185`、`RC01-067`、`RC02-040`、`RC02-091`、`RC02-127`、`RC04-253`、`RD00-105`、`RD02-266`、`RD03-092`、`RD03-093`、`RD03-094`、`RD06-028`、`RD06-073`、`RD08-150`、`RG10-007`、`RG14-002`
