---
plan_id: PLAN-L7-705-ci-responsibility-registry
title: "PLAN-L7-705: CI Responsibility RegistryとVerification Obligation graph"
kind: add-impl
layer: L7
workflow_phase: implement
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
github_issue_id: 1205
behavior_contract_id: CI-RESPONSIBILITY-REGISTRY-001
responsibility_owner: ci-system-synthesis
change_slice: atomic
refactor_step: introduce_contract
no_code_decision: no_change
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1205 CI Responsibility RegistryとVerification Obligation graph"
contract_preconditions: "#1204 telemetry contractをstack baseとして利用し、CIS-R-04〜06とCIS-AC-004〜006がconfirmedである"
contract_postconditions: "versioned capability registryとsemantic obligation graphがtyped node／edgeから4 classのexact setを決定的に導出する"
contract_invariants: "path／test名／LLM推測を意味authorityにせず、required obligation省略、runner選択、schedule最適化を混載しない"
contract_failures: "unknown identity、orphan、cycle、owner欠落、重複owner、oracle欠落、不完全retirementをfail-closeする"
tdd_red_required: true
tdd_red_evidence: "2026-08-30T12:00:49+09:00 tests/ci-responsibility-registry.test.ts initial red: production contract未成立によりU-CIREG-001／002がfail"
tdd_green_evidence: "2026-08-30T12:02:29+09:00 tests/ci-responsibility-registry.test.ts 9 tests green、typecheck green"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/ci-responsibility-registry.test.ts U-CIREG-001／002／004〜007でrelease defer authority欠落、逆向きrelease混入、unknown／orphan、owner欠落／重複owner、dependency cycle、retirement replacement／rollback／consumer／history欠落を個別mutationし、削除するとredになる"
complexity_effect: net_negative
complexity_justification: "Impact CI、Lite、Module／Bundle adapterの分散path判断を単一typed registryへ収束する"
removal_trigger: "CI System Synthesisがretireされreplacement registryへ全consumerとrollback traceが移行した時"
parent_design: docs/design/helix/L6-function-design/ci-responsibility-registry.md
pair_artifact: docs/test-design/helix/L8-ci-responsibility-registry-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L3-73-ci-system-synthesis.md
  requires:
    - docs/plans/PLAN-L3-73-ci-system-synthesis.md
    - docs/plans/PLAN-L7-704-ci-execution-telemetry.md
  references:
    - "issue:1205"
    - "issue:1204"
    - "issue:1002"
    - "issue:1084"
  blocks:
    - "issue:1206"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ci-responsibility-registry.md, oracle_id: U-CIREG-001, test_path: tests/ci-responsibility-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-responsibility-registry.md, oracle_id: U-CIREG-002, test_path: tests/ci-responsibility-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-responsibility-registry.md, oracle_id: U-CIREG-003, test_path: tests/ci-responsibility-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-responsibility-registry.md, oracle_id: U-CIREG-004, test_path: tests/ci-responsibility-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-responsibility-registry.md, oracle_id: U-CIREG-005, test_path: tests/ci-responsibility-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-responsibility-registry.md, oracle_id: U-CIREG-006, test_path: tests/ci-responsibility-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-responsibility-registry.md, oracle_id: U-CIREG-007, test_path: tests/ci-responsibility-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-responsibility-registry.md, oracle_id: U-CIREG-008, test_path: tests/ci-responsibility-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-responsibility-registry.md, oracle_id: U-CIREG-009, test_path: tests/ci-responsibility-registry.test.ts }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
generates:
  - { artifact_path: docs/plans/PLAN-L7-705-ci-responsibility-registry.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ci-responsibility-registry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-ci-responsibility-registry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/ci-responsibility-registry.v1.json, artifact_type: json_config }
  - { artifact_path: src/runtime/ci-responsibility-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/ci-responsibility-registry.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — typed capability registry／semantic graph" }
  - { role: qa, slot_label: "QA — unknown／orphan／cycle／ownership mutation" }
---

# CI Responsibility Registry

CIS-R-04〜06だけを原子的に実装する。selection plan、scheduler、runner、deferred recoveryは#1206以降へ残す。
