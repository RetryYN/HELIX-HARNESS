---
plan_id: PLAN-L7-724-summary-cli-legacy-identity-negative-oracle
title: "PLAN-L7-724: summary実CLIのlegacy identity不在をnegative oracle化する"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1277
behavior_contract_id: SUMMARY-CLI-LEGACY-IDENTITY-NEGATIVE-ORACLE-001
responsibility_owner: summary-frontier-workflow-identity
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #1277 summary実CLI出力のlegacy drive_model不在をnegative oracle化する"
contract_preconditions: "PLAN-L7-714のsummary／frontier typed workflow実装と実CLI fixtureが利用可能である"
contract_postconditions: "progress frontier --summary-jsonの実出力top-levelへdrive_modelが再出現するとnegative oracleがfailする"
contract_invariants: "fixtureだけの検証やtoMatchObjectの部分一致をcurrent outputのlegacy不在証拠として扱わない"
contract_failures: "top-level keyへdrive_modelが現れた場合をfail-closeし、別責務のnested compatibility観測を誤検出しない"
tdd_red_required: true
tdd_red_evidence: "2026-09-01T16:20:40+09:00にbuildProjectFrontierSummaryへdrive_modelを一時seedし、npm exec vitest run -- tests/cli-surface.test.ts -t U-CLSO-009でtop-level key negative assertionが1 failed／95 skippedとなることを実測した。直後にseedを除去した。"
mutation_oracle_required: true
mutation_oracle_evidence: "buildProjectFrontierSummaryへlegacy drive_modelをseedしたmutantを、tests/cli-surface.test.ts:U-CLSO-009がexpected keys not to include drive_modelとしてkillした（1 failed／95 skipped）。"
complexity_effect: net_neutral
complexity_justification: "既存CLI E2Eへtop-level keyのnegative assertionを追加するだけでruntime ownerやstateを増やさない"
removal_trigger: "summary schema validatorがtop-level exact key setをproduction contractとして同等以上に強制する時"
backprop_decision: not_required
backprop_decision_reason: "既存typed workflow要求の検証漏れを閉じるtest-only sliceであり、要求意味は変更しない。"
parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md
pair_artifact: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-714-summary-frontier-typed-workflow.md
  requires:
    - docs/plans/PLAN-L7-714-summary-frontier-typed-workflow.md
  references:
    - issue:1277
    - issue:1264
    - issue:206
  blocks:
    - issue:206
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-009, test_path: tests/cli-surface.test.ts }
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-724-summary-cli-legacy-identity-negative-oracle.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: qa, slot_label: "QA — actual CLI exact negative oracle" }
  - { role: tl, slot_label: "TL — fixtureと実出力証拠の境界" }
---

# summary実CLI legacy identity negative oracle

Issue #1277だけを扱い、`progress frontier --summary-json`の実出力top-level keyへ`drive_model`が再混入した場合を直接拒否する。summary以外のlegacy consumer移行、nested compatibility観測、runtime変更は行わない。
