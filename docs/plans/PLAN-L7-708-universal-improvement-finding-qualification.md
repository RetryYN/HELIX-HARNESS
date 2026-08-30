---
plan_id: PLAN-L7-708-universal-improvement-finding-qualification
title: "PLAN-L7-708: Universal Improvement finding適格化・dedupe・expiry"
kind: add-impl
layer: L7
drive: agent
status: confirmed
backfill_state: pending_reverse
completion_claim_allowed: false
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
github_issue_id: 1246
behavior_contract_id: UNIVERSAL-IMPROVEMENT-FINDING-QUALIFICATION-001
responsibility_owner: universal-improvement-loop
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: add_code
ddd_modeling_decision: domain_service
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1246 UIL-03 finding適格化・dedupe・expiry"
contract_preconditions: "#1232のnormalized exact setとUIL-R-03／UIL-AC-004..005がcurrent authorityである"
contract_postconditions: "detector／evidence exact set／recurrence lineage-bound trigger evidenceを決定的findingへ適格化し、dedupe、expiry、supersession、counterevidenceを分離する"
contract_invariants: "scheduled単独、AI感想、Issue件数、file overlapをfinding正本にせず、semantic impact／candidate／authority writeを混載しない"
contract_failures: "normalized schema／内部event digest／重複／unknown field、unknown event／detector、wrong baseline、digest drift、欠落invariant、時刻不正、同一identity矛盾をfail-closeする"
tdd_red_required: true
red_at: "2026-08-30T19:07:13+09:00"
green_at: "2026-08-30T19:09:04+09:00"
tdd_red_evidence: "2026-08-30T19:07:13+09:00 tests/universal-improvement-finding-qualification.test.ts initial red: production module未作成でimport failure"
tdd_green_evidence: "2026-08-30T21:17:35+09:00 pre-confirm blocker修正後にfinding qualification 7＋#1236 normalizer 7の14 tests、typecheckをgreen実測した。PLANはdraft／completion falseを維持する"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-08-30T21:13..21:14+09:00に単一mutationをapply_patchで適用し、各targetedを実測後に復元した。trigger kindのfinal identity除去→U-UILFQ-003、source evidence dedupe除去→U-UILFQ-002、expiry分岐除去→U-UILFQ-005、normalized counterevidence集約除去→U-UILFQ-005、baseline照合除去→U-UILFQ-004がそれぞれ1 failed／6 skippedで個別killした。復元後のgreen commandを再実測し、PLANはdraft／completion falseを維持する"
complexity_effect: net_negative
complexity_justification: "分散した再発／budget／drift判定の重複生成を一つのtyped qualification境界へ収束する"
removal_trigger: "Universal Improvement Loopがretireされ、finding lineageと全consumerがreplacementへ移行した時"
parent_design: docs/design/helix/L6-function-design/universal-improvement-finding-qualification.md
pair_artifact: docs/test-design/helix/L8-universal-improvement-finding-qualification-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L3-74-universal-improvement-loop.md
  requires:
    - docs/plans/PLAN-L7-705-universal-improvement-observation-normalizer.md
  references:
    - issue:1210
    - issue:1232
    - issue:1246
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-finding-qualification.md, oracle_id: U-UILFQ-001, test_path: tests/universal-improvement-finding-qualification.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-finding-qualification.md, oracle_id: U-UILFQ-002, test_path: tests/universal-improvement-finding-qualification.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-finding-qualification.md, oracle_id: U-UILFQ-003, test_path: tests/universal-improvement-finding-qualification.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-finding-qualification.md, oracle_id: U-UILFQ-004, test_path: tests/universal-improvement-finding-qualification.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-finding-qualification.md, oracle_id: U-UILFQ-005, test_path: tests/universal-improvement-finding-qualification.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-finding-qualification.md, oracle_id: U-UILFQ-006, test_path: tests/universal-improvement-finding-qualification.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/universal-improvement-finding-qualification.md, oracle_id: U-UILFQ-007, test_path: tests/universal-improvement-finding-qualification.test.ts }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
generates:
  - { artifact_path: docs/plans/PLAN-L7-708-universal-improvement-finding-qualification.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/universal-improvement-finding-qualification.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-universal-improvement-finding-qualification-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/universal-improvement-finding-qualification.ts, artifact_type: source_module }
  - { artifact_path: tests/universal-improvement-finding-qualification.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — trigger evidence／finding identity／dedupe" }
  - { role: qa, slot_label: "QA — wrong baseline／digest／lifecycle／conflict mutation" }
---

# Universal Improvement finding適格化

UIL-R-03とUIL-AC-004..005だけを実装する。semantic impact、candidate synthesis、counterfactual、routeは後続へ残す。
