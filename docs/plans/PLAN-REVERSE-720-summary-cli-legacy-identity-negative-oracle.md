---
plan_id: PLAN-REVERSE-720-summary-cli-legacy-identity-negative-oracle
title: "PLAN-REVERSE-720: summary CLI legacy identity negative oracleのReverse vehicle"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1277
behavior_contract_id: SUMMARY-CLI-NEGATIVE-ORACLE-001
responsibility_owner: summary-frontier-workflow-identity
change_slice: atomic
refactor_step: characterize
engineering_discipline_required: true
no_code_decision: no_change
ddd_modeling_decision: value_object
legacy_retirement_state: consumer_migration
forward_routing: L6
promotion_strategy: reuse-as-is
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1277 summary CLI negative oracleのReverse vehicleをForwardと原子的に予約する"
contract_preconditions: "PLAN-L7-724、current-location summary設計、L8 test design、U-CLSO-009が同一scopeへ束縛される"
contract_postconditions: "Forward merge後にlegacy identity不在、mutation kill、typed output境界をR0〜R4で再照合しForwardへ戻す"
contract_invariants: "Reverse vehicle予約を完了証拠として扱わず、canonical mergeとpost-main read-after前にcompletion claimを許可しない"
contract_failures: "Forward双方向link欠落、wrong HEAD、stale review、fixture-only証拠、legacy key再出現をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "実装を持たないpending Reverse vehicleであり、Forward側の実測Redを事後に複製しない"
mutation_oracle_required: true
mutation_oracle_evidence: "Forward PLAN-L7-724のU-CLSO-009がtop-level drive_model seedを1 failed／95 skippedでkillした証拠を、R0採取時にexact HEADへ再束縛する"
complexity_effect: net_neutral
complexity_justification: "runtimeを増やさず、Forward／Reverseのidentityと終端順序だけを予約する"
removal_trigger: "Issue #1277のterminal fullbackが上位workflow migration fullbackへ統合された時"
parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md
pair_artifact: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: pending
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "Forward merge後にtyped workflow identity要求との一致を再照合する"
  - layer: L6-function-design
    decision: pending
    evidence_path: docs/design/helix/L6-function-design/current-location-summary-typed-output.md
    reason: "実CLI summary schemaとlegacy identity不在を再照合する"
  - layer: verification-design
    decision: pending
    evidence_path: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md
    reason: "U-CLSO-009のmutation killをexact HEADへ再束縛する"
dependencies:
  parent: docs/plans/PLAN-L7-714-summary-frontier-typed-workflow.md
  requires:
    - docs/plans/PLAN-L7-724-summary-cli-legacy-identity-negative-oracle.md
  references:
    - issue:1277
    - issue:1264
    - issue:206
    - docs/plans/PLAN-L7-724-summary-cli-legacy-identity-negative-oracle.md
  blocks: []
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-720-summary-cli-legacy-identity-negative-oracle.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: generated_projection }
agent_slots:
  - { role: qa, slot_label: "QA — legacy identity不在とmutation証拠のR0〜R4再照合" }
  - { role: tl, slot_label: "TL — Forward双方向linkとterminal fullback順序" }
---

# summary CLI legacy identity negative oracle Reverse vehicle

## 工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | Forward／Reverse identityを双方向予約 | 直列 | pairing gate green |
| 2 | Forward candidateを独立review・CI・merge | 直列 | exact HEAD evidence |
| 3 | R0〜R4とmain read-afterを採取 | 直列 | backfill complete候補 |

本PLANはpending Reverse vehicleだけを定義する。Forward実装のcanonical merge、Claude exact-HEAD review、
post-main read-afterを採取するまでは`status: draft`、`backfill_state: pending_reverse`、
`completion_claim_allowed: false`を維持する。
