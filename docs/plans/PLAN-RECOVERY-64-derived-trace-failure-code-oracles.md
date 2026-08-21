---
plan_id: PLAN-RECOVERY-64-derived-trace-failure-code-oracles
title: "PLAN-RECOVERY-64: derived trace failure identity oracleをsite別に回復する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: ["po_directive:Issue #892 derived requirement trace failure-code mutation survivors"]
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 892
behavior_contract_id: DERIVED-TRACE-FAILURE-CODE-ORACLE-002
responsibility_owner: derived-requirement-trace
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "既存validatorの7 failure codeとvalidator側source_envelope_invalid siteがcode substitution mutationを生存させる"
contract_postconditions: "8 failure siteを原因固有fixture、exact code、exact pathへ束縛し、site別mutationを全てkillする"
contract_invariants: "production compiler／validator semanticsを変更せず、compile入口2 codeの#877 oracleを再実装しない"
contract_failures: "別guardの同一codeによる偽kill、code集合だけの弱いassertion、production semantics変更、旧ADD_FEATURE identityへの回帰を拒否する"
tdd_red_required: true
red_at: "2026-08-21T07:03:10Z"
green_at: "2026-08-21T21:29:24Z"
mutation_oracle_evidence: "PR #890で既存7 codeのsubstitution survivorを実測し、同PRの追加reviewでvalidator側source_envelope_invalid siteのsubstitution survivorも実測した。2026-08-21T21:27:53Z〜21:29:24Zにgraph_source_mismatch、artifact_id_duplicate、artifact側source_snapshot_mismatch、requirement_cardinality_invalid、derived_system_cardinality_invalid、layer_placement_missing、pair_edge_noncanonical、validator側source_envelope_invalidを1 siteずつmutant_*へ置換し、U-DTRACE-006〜013が各1 failed／exit 1となる8/8 killを実測した。各注入後にsourceを復元し、最終13 tests greenおよびproduction source diff 0を確認した"
complexity_effect: net_neutral
complexity_justification: "既存pure validatorを変更せず、L8 fixtureとexact assertionだけを追加する"
removal_trigger: "failure identityを型付きdiscriminated unionへ移行し、同等以上のsite別mutation oracleを後継suiteが所有した時点"
parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md
pair_artifact: docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-006, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-007, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-008, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-009, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-010, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-011, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-012, test_path: tests/derived-requirement-trace.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/derived-requirement-trace.md, oracle_id: U-DTRACE-013, test_path: tests/derived-requirement-trace.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — Issue #892 Recovery authorityとfailure identity境界" }
  - { role: qa, slot_label: "QA — 8 failure siteの原因固有fixtureとmutation kill" }
  - { role: se, slot_label: "SE — production semantics不変監査" }
  - { role: tl, slot_label: "TL — #186／#188 dependency解放判断" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-64-derived-trace-failure-code-oracles.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-derived-requirement-trace-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/derived-requirement-trace.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-559-derived-requirement-trace.md
  requires:
    - docs/plans/PLAN-L7-559-derived-requirement-trace.md
    - docs/plans/PLAN-L7-645-derived-trace-entry-failure-oracle.md
  references:
    - docs/plans/PLAN-REVERSE-186-derived-requirement-trace-backfill.md
  blocks: [issue:188]
---

# derived trace failure identity oracleのRecovery

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | Issue #892の旧ADD_FEATURE identityとstale dependencyをRecovery正本へ是正 | [直列] | Issue authority一致 |
| 2 | 8 failure siteの原因固有fixtureとexact assertionを追加 | [直列] | U-DTRACE-006〜013 green |
| 3 | code substitution／guard removal／condition inversionをsite別注入 | [直列] | mutation survivor 0 |
| 4 | targeted／全回帰／doctor／DB convergence | [直列] | current HEAD green |
| 5 | Claude Opus exact-HEAD独立review | [review] | blocker 0 |

## §責務境界

本Recoveryは`src/workflow/derived-requirement-trace.ts`を変更しない。#877が固定したcompile入口の
`source_envelope_invalid`とvalidate入口の`trace_schema_invalid`を再実装せず、同じcode文字列を返す
validator側envelope不正分岐は別siteとしてU-DTRACE-013で固定する。
