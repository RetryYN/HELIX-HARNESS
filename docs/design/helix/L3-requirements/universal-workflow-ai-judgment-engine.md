---
title: "Universal Workflow AI判断エンジン要件"
layer: L3
kind: add-design
status: confirmed
created: 2026-07-19
updated: 2026-07-19
owner: PO / TL
authority: docs/governance/helix-harness-requirements_v1.3.md
pair_artifact: docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md
---

# Universal Workflow AI判断エンジン要件

## 1. 入力正本の結合と採否

- source: `UNIVERSAL-WORKFLOW-REQUIREMENTS-SKILL_v1.1.0.zip`
- SHA-256: `b6fd08f5054930dde8379969bf9a84cb21270d1b7bac8e87be3bc243ad425d26`
- inventory: 14ファイル（README、SKILL、カタログ3、契約4、schema 2、prompt 1、example 2）
- authority: source packageは意味source。HELIX要件、versioned schema、gate、Node transaction境界が実行authorityである。

Exact inventoryは次の14 pathとする。

`README.md`、`SKILL.md`、`catalogs/base-question-catalog.md`、`catalogs/conditional-question-catalog.yaml`、`catalogs/runtime-orchestration-question-catalog.md`、`contracts/derived-mapping.md`、`contracts/requirement-contract.schema.json`、`contracts/runtime-orchestration-contract.md`、`contracts/workflow-to-requirement-contract.md`、`examples/approval-workflow.example.json`、`examples/runtime-orchestration.example.json`、`prompts/workflow-extraction-prompt.md`、`schemas/derived-requirements.schema.json`、`schemas/workflow-model.schema.json`。

| source atom | disposition | HELIX判断 |
|---|---|---|
| `current_state × trigger × condition → action → next_state` | adopt | workflow判断の意味コア |
| target/actor/state/loop/terminal/exception/permission/timeout/notification/audit/data | adopt | atomic workflow obligationへ分解 |
| Phase A core interview / Phase B conditional drill-down | adopt-with-hardening | question provenance、回答authority、unresolvedを必須化 |
| workflow→FR/AC/test conversion | adopt-with-hardening | stable source transition IDとL1〜L12 edgeを追加 |
| screen/API/data/permission/notification/audit/test派生 | adopt-with-hardening | 派生候補に限定し、各layer gateで確定 |
| switching/routing/resource allocation/reallocation | adopt-with-hardening | AI proposalとcommit authorityを分離しmeasurement contractを追加 |
| `workflow-model.schema.json` | redesign | HELIX envelope、authority、decision、evidence、versionを追加 |
| `derived-requirements.schema.json` | redesign | source edge、layer、status、oracle、N/A receiptを追加 |
| `requirement-contract.schema.json` | redesign | BR/FR/NFR、modality、priority、risk、revision、pairを追加 |
| runtime orchestration Markdown contract | redesign | 専用JSON SchemaがないためL5で型を新設 |
| examples | reference-only | runtime exampleのworkflow schema不適合を正例にしない |

## 2. 機能要件

| ID | 要件 | 受入ID |
|---|---|---|
| UWJ-FR-001 | source packageのfilename、version、SHA-256、14-file inventory、atom dispositionをimmutable intake receiptへbindする | UWJ-AC-001 |
| UWJ-FR-002 | 自然言語入力をtarget、actor、state、trigger、condition、action、transition、loop、terminal、exception、permission、timeout、notification、audit、dataへ原子的に正規化する | UWJ-AC-002 |
| UWJ-FR-003 | interview engineはcore questionを常時、approval/金額/期限/外部連携/PII/添付/通知/自動実行/AI判断/複数担当/差戻し/再実行/削除/公開/課金の質問をsignal時だけ発火する | UWJ-AC-003 |
| UWJ-FR-004 | 不明、矛盾、回答authority不足、分岐欠落を推測確定せず、source spanと質問履歴付き`unresolved_items`へ保存する | UWJ-AC-004 |
| UWJ-FR-005 | 各transitionから最低1件のFR、AC、test scenarioを生成し、stable `source_transition_id`で双方向traceする | UWJ-AC-005 |
| UWJ-FR-006 | loopはreturn、continue、stop、上限、上限到達時、terminalは正常/取消/失敗/期限切れ、終了後更新、通知、audit、再開可否を契約化する | UWJ-AC-006 |
| UWJ-FR-007 | conditionで使うdataはtype、required、validation、nullable、SSoT、mutable、sensitive、retentionを持つ | UWJ-AC-007 |
| UWJ-FR-008 | workflowからbusiness flow、screen flow、API、data、permission、notification、audit、test scenarioを派生候補として生成し、個別先行設計を禁止する | UWJ-AC-008 |
| UWJ-FR-009 | AI判断を`facts → candidates → policy constraints → scored proposal → confidence → counterevidence → unresolved → proposed next state`として記録する | UWJ-AC-009 |
| UWJ-FR-010 | AIはproposal-onlyとし、要求freeze、permission、high-impact action、gate pass、DB/Git/GitHub commitを自己承認しない | UWJ-AC-010 |
| UWJ-FR-011 | switchingはdecision point、candidate set、enable/disable、selection rule、fallback、reassessment triggerを必須にする | UWJ-AC-011 |
| UWJ-FR-012 | routingはsource、destinations、capability/capacity constraint、rule、fallback、dead-letterを必須にする | UWJ-AC-012 |
| UWJ-FR-013 | allocationはpriority、deadline、capability、capacity、concurrency、cost/budget、objective、fairness/preemption、reallocation、degradation、fallbackを必須にする | UWJ-AC-013 |
| UWJ-FR-014 | 判断・配分はverification/measurement contractへbindし、quality、latency、cost、queue、failure、fallback率、誤判断率、human override、driftをL10〜L12で評価する | UWJ-AC-014 |
| UWJ-FR-015 | Full Vはsystem workflow全体をL1〜L5でfreezeし、Production Scrumはslice deltaを許す代わりにreview/release前のSR0〜SR4でsystem workflowへbackfillする | UWJ-AC-015 |
| UWJ-FR-016 | workflow obligationをL1〜L12へ配置し、正規6 V-pair、同一revision/snapshot/oracleを保持する | UWJ-AC-016 |
| UWJ-FR-017 | HELIX envelope schemaはworkflow model、unresolved items、derived requirements、coverage report、contract candidatesをversioned fieldとして一つに束ねる | UWJ-AC-017 |
| UWJ-FR-018 | runtime orchestration専用schemaをworkflow schemaから分離または明示compositionし、ZIP runtime exampleの現行不適合を解消するまでactivationを拒否する | UWJ-AC-018 |

## 3. L1〜L12配置

| 層 | 判断エンジン義務 | 対となる証拠 |
|---|---|---|
| L1 | target、actor、価値、scope/non-goal、terminal、route | L12価値/SLO/改善 |
| L2 | 業務要求、workflow、操作可能prototypeまたはN/A | L11利用者workflow受入 |
| L3 | FR/NFR/AC、unresolved disposition、decision policy | L10全transition/system oracle |
| L4 | screen/API/data/permission/notification/audit、外部境界 | L9接続/権限/transaction |
| L5 | state/loop/exception schema、switch/route/allocation、fallback/dead-letter、test/measurement設計 | L8の局所判断・unit oracle |
| L6 | engine、adapter、probe実装 | L7 TDD closure |
| L7 | schema/decision/policy/probe test実装 | L6 implementation trace |
| L8 | normalization、scoring、loop、fallbackの局所検証 | L5 detail contract |
| L9 | API/DB/queue/resource/authority境界の結合検証 | L4 basic design |
| L10 | end-to-end workflow、FR/NFR、misroute、degradation検証 | L3 requirements |
| L11 | actor権限、操作、説明可能性、human override受入 | L2 requirements/prototype |
| L12 | 時間軸SLO、cost、queue、drift、誤判断、改善効果 | L1 value |

## 4. 完了式

`workflow_freeze = all_transitions_complete ∧ unresolved_blocking=0 ∧ derived_edges_closed ∧ schema_composition_valid ∧ V_pairs_current`

`ai_decision_executable = proposal_valid ∧ authority_separated ∧ policy_pass ∧ fallback_present ∧ measurement_contract_current ∧ commit_verifier_pass`

`scrum_slice_ready = slice_workflow_current ∧ SR0..SR4_current ∧ system_workflow_backfill_closed ∧ L1..L12_pairs_current`
