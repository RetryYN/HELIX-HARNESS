---
plan_id: PLAN-L7-1614-project-hook-authority-consumer-wiring
title: "project hook authorityを4つのcurrent consumerへ実配線する"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backprop_decision: not_required
backprop_decision_reason: "CNW-R-06..08とCNW-AC-009..013、L4/L5/L6のconfirmed契約をcurrent consumerへ接続する実装sliceであり、要求意味を変更しない。"
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 1614
responsibility_owner: project-hook-authority
behavior_contract_id: CNW-HOOK-AUTHORITY-CONSUMER-WIRING-001
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: application_service
contract_preconditions: "Control Planeがsessionまたはassignment authority snapshotを明示し、PLAN-L7-667/668/669のprovider/projectorが利用可能である"
contract_postconditions: "SessionStart、doctor、status、dispatchが一度だけ解決された同一canonical receipt/failure bytesを消費する"
contract_invariants: "cwd、env、primary root、origin/main fallback禁止、surface別再計算禁止、foreign dirty root変更禁止"
contract_failures: "snapshot unavailable、stale root、wrong HEAD、wrong source digestを4 surface同一failureへ閉じ、dispatch side effectを0にする"
tdd_red_required: true
tdd_red_evidence: "2026-09-07T03:06:50Z、tests/project-hook-authority-consumer-wiring.test.tsがmodule不在でsuite load failure、exit 1となるRedを実測した。"
mutation_oracle_required: true
mutation_oracle_evidence: "未採取。surface欠落、dispatchだけ再計算、cwd fallback、failure時dispatchを独立変異としてkillする。"
complexity_effect: net_negative
complexity_justification: "実装済みpure部品の未接続を単一composition rootへ集約し、4 surfaceの個別推測を除去する。"
removal_trigger: "4 surfaceがControl Planeのnative typed envelopeを直接共有しadapter consumerが0になった時"
entry_signals: [regression_dev]
agent_slots:
  - { role: se, slot_label: "SE — composition rootとconsumer adapter" }
  - { role: qa, slot_label: "QA — stale／unavailable／surface equality反例" }
  - { role: tl, slot_label: "TL — no-fallbackとdispatch admission監査" }
parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md
pair_artifact: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKWIRE-001, test_path: tests/project-hook-authority-consumer-wiring.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKWIRE-002, test_path: tests/project-hook-authority-consumer-wiring.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKWIRE-003, test_path: tests/project-hook-authority-consumer-wiring.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKWIRE-004, test_path: tests/project-hook-authority-consumer-wiring.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKWIRE-005, test_path: tests/project-hook-authority-consumer-wiring.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, oracle_id: U-CNWHOOKWIRE-006, test_path: tests/project-hook-authority-consumer-wiring.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires:
    - PLAN-L7-667-project-hook-authority-input-provider
    - PLAN-L7-668-project-hook-authority-surface-projector
    - PLAN-L7-669-project-hook-assignment-provider
  references: ["issue:895", "issue:1614"]
generates:
  - { artifact_path: docs/plans/PLAN-L7-1614-project-hook-authority-consumer-wiring.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/project-hook-authority-consumer-wiring.ts, artifact_type: source_module }
  - { artifact_path: tests/project-hook-authority-consumer-wiring.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L6-function-design/project-hook-authority-resolver.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-project-hook-authority-resolver-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
---

# project hook authorityのconsumer配線

既存resolver/provider/projectorを再実装せず、Control Planeから明示されたsnapshotを一度だけ解決する。
4 surfaceは同じbytesを受け取り、failure時のdispatchはworkerを起動しない。SessionStart入力不足を
cwdやremote HEADで補う暫定実装は作らない。Red、Green、mutation、clean-main Luna read-after、
exact-HEAD独立review、CIを完了するまでconfirmedまたはcompletionへ進めない。
