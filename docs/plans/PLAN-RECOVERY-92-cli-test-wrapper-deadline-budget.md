---
plan_id: PLAN-RECOVERY-92-cli-test-wrapper-deadline-budget
title: "PLAN-RECOVERY-92: CLI childより先に切れるtest wrapper deadlineを是正する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1463
behavior_contract_id: CLI-TEST-WRAPPER-DEADLINE-BUDGET-001
responsibility_owner: impact-ci-stateful-lane
engineering_discipline_required: true
change_slice: atomic
refactor_step: strengthen_contract
legacy_retirement_state: canonical_only
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: [regression_dev]
contract_preconditions: "CLI childは45秒boundedだが対象2 test wrapperが30秒で先に切れる"
contract_postconditions: "対象wrapperをchild deadline＋有限marginへ束縛し、順序を静的oracleで固定する"
contract_invariants: "production child deadline、assertion、CLI出力、skill routing semanticsを変更しない"
contract_failures: "無制限化、child deadline緩和、literal 30秒復帰、対象外oracle一括変更を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "GitHub Actions run 33634710580 attempt 1〜3と33634877671で同じ2 oracleの30秒timeoutを実測済み"
mutation_oracle_required: true
mutation_oracle_evidence: "wrapper marginを0へ戻すmutationと対象oracleを30秒literalへ戻すmutationをU-CLI-SKILL-DEADLINE-003が検出する"
complexity_effect: net_neutral
complexity_justification: "既存child定数から有限wrapper budgetを導出し、重複literalを除去する"
removal_trigger: "CLI p95短縮後もchildよりwrapperが長い順序契約は維持する"
backprop_decision: not_required
backprop_decision_reason: "既存#93 CI性能契約の局所Recoveryで新しい要求意味を追加しない"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
dependencies:
  parent: null
  requires: []
  references: ["issue:93", "issue:902", "issue:1458", "issue:1459"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-92-cli-test-wrapper-deadline-budget.md, artifact_type: markdown_doc }
  - { artifact_path: tests/cli-surface-deadline-contract.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: qa, slot_label: "QA — deadline順序と対象exact setの反例" }
  - { role: tl, slot_label: "TL — #1463 Recovery収束" }
review_evidence: []
---

# CLI test wrapper deadline budget Recovery

production childの停止境界を変えず、test harnessが先に切れるbudget inversionだけを是正する。
