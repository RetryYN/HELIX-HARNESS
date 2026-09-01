---
plan_id: PLAN-L7-727-effective-runner-toolchain-attestation
title: "PLAN-L7-727: effective runner／toolchain attestation"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1340
behavior_contract_id: CI-EFFECTIVE-RUNNER-ATTESTATION-001
responsibility_owner: ci-execution-telemetry
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: compatibility_only
no_code_decision: add_code
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1340 effective runner／toolchain attestationをCI receiptへ束縛する"
contract_preconditions: "Issue #1339のimmutable GitHub Action ref registryがcanonical merge・main read-after済みで、CI execution telemetry v1がcurrent mainに存在する"
contract_postconditions: "CI telemetry v2がsource/base/candidate HEAD、workflow/run/attemptと、observed/current authorityのrunner image、OS、architecture、Node/npm、system dependency、Action registry、toolchain、environmentを一つのattestation digestへ束縛する"
contract_invariants: "別runner／toolchain artifactのgreenを同一再現証拠へ昇格せず、旧v1をcurrent outputへ再生成せず、新しいDB正本・telemetry pipelineを作らない"
contract_failures: "欠落、unknown field、wrong image／OS／architecture／Node／npm／system dependency／Action registry／toolchain／environment、attestation digest drift、batch内identity driftを個別にfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "confirmed済みCI execution telemetryのversioned identity拡張であり、既存11 oracleとmutationによる退行検出を必須とする"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-01T22:32:44+09:00にrunner observed／authority比較を!==から===へ反転し、U-TELE-011が1 failed／10 skipped、exit 1でkillした。mutation除去後に11 tests greenへ復帰した。"
complexity_effect: justified_positive
complexity_justification: "既存runner identityをobserved／authority exact pairへ拡張し、別adapterやDBを増やさず再現証拠の意味を強化する"
removal_trigger: "後継telemetry schemaへ全consumerが移行し、v2 receipt consumerが0になった時"
backprop_decision: required
backprop_decision_reason: "CIS-R-01／R-03とCIS-AC-003へeffective runner authorityの必須fieldとnegative mutationを追記する"
parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md
pair_artifact: docs/test-design/helix/L8-ci-execution-telemetry-unit-test-design.md
dependencies:
  parent: PLAN-L7-704-ci-execution-telemetry
  requires:
    - docs/plans/PLAN-L7-704-ci-execution-telemetry.md
    - docs/plans/PLAN-RECOVERY-74-immutable-github-action-ref-registry.md
  references:
    - "issue:1340"
    - "issue:1339"
    - "issue:1175"
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-001, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-004, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-008, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-010, test_path: tests/ci-execution-telemetry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-execution-telemetry.md, oracle_id: U-TELE-011, test_path: tests/ci-execution-telemetry.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-727-effective-runner-toolchain-attestation.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md, artifact_type: requirements_doc }
  - { artifact_path: docs/design/helix/L6-function-design/ci-execution-telemetry.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/ci-system-synthesis-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-ci-execution-telemetry-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/ci-execution-telemetry.ts, artifact_type: source_module }
  - { artifact_path: tests/ci-execution-telemetry.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — telemetry schema／runner authority exact pair" }
  - { role: qa, slot_label: "QA — image／toolchain／Action registry drift mutation" }
  - { role: tl, slot_label: "TL — requirements backprop／v1 compatibility-only境界" }
review_evidence: []
---

# effective runner／toolchain attestation

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | #1339 main read-afterと既存CI telemetry境界を確認 | dependency解放と重複pipeline 0を確認 |
| 2 | CIS-R-01／R-03、CIS-AC-003をcurrent要件へ還流 | effective runner identityが要求・受入で一致 |
| 3 | telemetry v2 runner attestationを実装 | observed／authority exact pairとdigest再計算がgreen |
| 4 | wrong image／toolchain／Action registry mutationを実測 | U-TELE-011が各退行をkill |
| 5 | targeted、typecheck、Biome、PLAN lint、独立review、main read-after | 全証拠がcurrent HEADへ束縛される |

本PLANはIssue #1340のCI receipt identity拡張だけを所有する。self-hosted runner導入、別telemetry pipeline、
Technology Environment Contractの直接変更、Release／tag／publishは非対象とする。
