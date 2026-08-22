---
plan_id: PLAN-L5-102-workflow-switch-route-allocation-schema
title: "PLAN-L5-102 (add-design): workflow switching／routing／allocationのtyped decision schemaを定義する"
kind: add-design
layer: L5
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #188 UWJ-FR/AC-011..015をL4境界からL5 typed decision schemaとL8 unit oracleへForwardする"
created: 2026-08-22
updated: 2026-08-22
owner: Codex / TL
github_issue_id: 188
behavior_contract_id: UWJ-FR-011..015
responsibility_owner: universal-workflow-judgment-engine
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-75がtyped identity、switch／route／allocation、measurement、publicationのcomponent境界を確定している"
contract_postconditions: "helix-workflow-decision-envelope.v1のstrict exact schemaとU-UWJSCHEMA-001..015がL5↔L8で固定される"
contract_invariants: "workflow identity各field、capability／capacity／concurrency／budget／fairness、fallback／dead-letter、measurement／publicationを独立axisとして保持し、proposalへcommit／dispatch authorityを与えない"
contract_failures: "unknown／missing field、legacy identity、constraint drift、cycle、unbounded preemption、stale measurement、部分publicationをtyped failureへ束縛する"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。本sliceはL5/L8 pairのschemaとunit oracleを固定し、production parser／planner／evaluatorは後続L6/L7がRed→Greenを所有する"
complexity_effect: net_negative
complexity_justification: "曖昧な配車objectを一つのstrict envelopeと独立axisへ集約し、provider別schemaと暗黙defaultを禁止する"
removal_trigger: "helix-workflow-decision-envelope.v1の後継へreceipt付きmigrationし、v1 consumerが0になった時"
parent_design: docs/design/helix/L4-basic-design/workflow-switch-route-allocation-boundary.md
pair_artifact: docs/test-design/helix/L8-workflow-switch-route-allocation-schema-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — strict envelope／union／failure schema" }
  - { role: qa, slot_label: "QA — exact field／axis独立／mutation oracle" }
  - { role: tl, slot_label: "TL — requirements identity／proposal authority／measurement再利用境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-102-workflow-switch-route-allocation-schema.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/workflow-switch-route-allocation-schema.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-workflow-switch-route-allocation-schema-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-switch-route-allocation-boundary-design.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-switch-route-allocation-schema-design.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L4-75-workflow-switch-route-allocation-boundary.md
  requires:
    - docs/design/helix/L4-basic-design/workflow-switch-route-allocation-boundary.md
    - docs/design/helix/L5-detail/measurement-evidence-evaluator.md
    - docs/design/helix/L5-detail/ai-decision-proposal-authority.md
  blocks:
    - issue:188-l6-l7-runtime
---

# workflow switching／routing／allocationのL5↔L8 Forward

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | L4 componentをstrict root envelopeへcomposition | root exact setとlegacy拒否が固定される |
| 2 | switch／route／allocationの型、union、constraintを定義 | 各axisの欠落・相殺・cycleが反証可能になる |
| 3 | measurement／publication／proposal receiptを定義 | stale、部分freeze、authority昇格をfail-closeできる |
| 4 | L8 unit oracleとL4 substance oracleを定義 | tokenだけ残す空洞化mutationを拒否する |
| 5 | Claude exact-HEAD独立review | blocker 0、L6/L7未実装claim 0 |

本PLANはschema設計だけを所有する。production parser、planner、evaluator、DB projection、CLI、assignment dispatchは
後続L6/L7へ分離し、文書のfield名存在をruntime greenへ読み替えない。
