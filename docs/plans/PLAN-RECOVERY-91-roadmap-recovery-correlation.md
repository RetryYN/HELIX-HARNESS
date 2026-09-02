---
plan_id: PLAN-RECOVERY-91-roadmap-recovery-correlation
title: "PLAN-RECOVERY-91: roadmap矛盾とcurrent-location Recoveryをexact相関する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1421
behavior_contract_id: ROADMAP-RECOVERY-CORRELATION-001
responsibility_owner: vmodel-fit
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "roadmap contradictionとcurrent-location Recoveryは独立したtyped projectionとして存在する"
contract_postconditions: "Recovery免除は両projectionがneeds_recoveryで対象PLAN集合が交差するときだけ成立する"
contract_invariants: "roadmap blocker数を常時reasonへ出し、相関不能な矛盾をV-model fit blockerとして保持する"
contract_failures: "alignedをRecovery相関と誤認する恒真式、別PLANのRecoveryによる免除、silent passを拒否する"
tdd_red_required: true
red_test: "current-locationがpassでroadmap blockerを持つfixtureがrecovery_correlation=current_location_recoveryとなりroadmap_current blockerを欠く"
red_at: "2026-09-02T21:25:00+09:00"
green_at: "2026-09-02T21:27:00+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-02T21:26+09:00にRecovery相関条件を旧aligned恒真式へ戻すmutationを適用し、tests/current-location.test.tsのU-CURRENT-LOCATION-001が1 failed／21 passed、exit 1となった。exact PLAN相関へ復元後は22 tests green／exit 0。"
complexity_effect: net_neutral
complexity_justification: "既存roadmap gate IDとRecovery runway sample PLAN IDを集合照合し、新しい状態authorityを追加しない"
removal_trigger: "なし。roadmapとcurrent-locationの恒久的な相関境界"
backprop_decision: not_required
backprop_decision_reason: "Issue #1421の既存V-model fit要件に対するfail-open Recoveryで、新要求意味を追加しない"
parent_design: docs/design/helix/L6-function-design/roadmap-recovery-correlation.md
pair_artifact: docs/test-design/helix/L8-roadmap-recovery-correlation-unit-test-design.md
dependencies:
  parent: null
  requires: []
  references:
    - "issue:1392"
    - "issue:1413"
    - "issue:1421"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-91-roadmap-recovery-correlation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/roadmap-recovery-correlation.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-roadmap-recovery-correlation-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/design/helix/L5-detail/operation-scope.md, artifact_type: design_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: src/state-db/vmodel-fit.ts, artifact_type: source_module }
  - { artifact_path: tests/current-location.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — roadmap整合とRecovery相関の意味境界監査" }
  - { role: se, slot_label: "SE — roadmap／Recovery相関境界" }
  - { role: qa, slot_label: "QA — 恒真式と別PLAN相関の反例" }
  - { role: tl, slot_label: "TL — #1421 Recovery収束" }
review_evidence: []
---

# Roadmap Recovery相関

roadmapの整合とRecovery実行中という別概念を分離し、対象PLANが一致するRecoveryだけを免除する。
