---
plan_id: PLAN-L7-584-current-location-workflow-identity
title: "PLAN-L7-584 (impl): current-locationへtyped workflow identity境界を追加する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:0ff1f90cd2e329b52f784ada54c18d06a79253488664290290327b81bef17f47
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #206 current-location legacy consumer migration"]
created: 2026-08-18
updated: 2026-08-18
owner: Codex / TL
github_issue_id: 206
behavior_contract_id: CURRENT-LOCATION-WORKFLOW-IDENTITY-001
responsibility_owner: current-location-workflow-identity
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "current-locationが旧drive modelを保持しているが、requirements registry tupleとの変換境界がない"
contract_postconditions: "current-location routeがtyped identityまたはfail-close receiptを持ち、旧入力のsourceとwarningを監査可能にする"
contract_invariants: "requirements registryが意味authorityであり、旧modelをcurrent identityへ再出力せず、曖昧値をForwardへfallbackしない"
contract_failures: "stale、unknown、unsupported、ambiguousのidentityをexit 1相当で拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "registry-backed adapterとnegative oracleを同一atomic patchで導入し、存在しないRed時刻を記録しない"
complexity_effect: justified_positive
complexity_justification: "後続CLI／DB／visualization consumer移行が共有できる単一のtyped identity境界を導入する"
removal_trigger: "current-locationの全consumerがtyped identityへ移行し、legacy input adapter retention期限が満了した時点"
parent_design: docs/design/helix/L6-function-design/current-location-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-current-location-workflow-identity-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/current-location-workflow-identity.md, oracle_id: U-CLWI-001, test_path: tests/current-location-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-workflow-identity.md, oracle_id: U-CLWI-002, test_path: tests/current-location-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-workflow-identity.md, oracle_id: U-CLWI-003, test_path: tests/current-location-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-workflow-identity.md, oracle_id: U-CLWI-004, test_path: tests/current-location-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-workflow-identity.md, oracle_id: U-CLWI-005, test_path: tests/current-location-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-workflow-identity.md, oracle_id: U-CLWI-006, test_path: tests/current-location-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-workflow-identity.md, oracle_id: U-CLWI-007, test_path: tests/current-location-workflow-identity.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — current-location typed identity composition boundary" }
  - { role: qa, slot_label: "QA — stale／ambiguous legacy identity negative oracle" }
  - { role: tl, slot_label: "TL — requirements registry authorityとconsumer migration順序" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-584-current-location-workflow-identity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/current-location-workflow-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-current-location-workflow-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/workflow/current-location-workflow-identity.ts, artifact_type: source_module }
  - { artifact_path: src/schema/current-location-workflow-identity.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/current-location.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: tests/current-location-workflow-identity.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
  requires:
    - docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
    - docs/plans/PLAN-L7-580-workflow-classification-catalog-doctor.md
  references:
    - docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md
    - docs/process/drive-route-system.md
  blocks: []
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-18T07:24:46Z"
    tests_green_at: "2026-08-18T07:24:46Z"
    verdict: approve
    scope: "current-locationのtyped identityをschema境界へ置き、requirements registry tupleの検証、legacy input-only変換、Forward／Scrumの曖昧値、stale／unknown値のfail-close、CLI compositionでの本番投影を差分・oracle・後続consumer移行境界とともに監査した。Claudeの独立検収、CLI／DB／visualization全consumerのlegacy撤去、merge判断はこの証跡の対象外。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/current-location-workflow-identity.test.ts tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/workflow-classification-legacy-adapter.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T07:24:46Z"
        evidence_path: tests/current-location-workflow-identity.test.ts
        output_digest: "sha256:0abd72ceafde5fb27c37482a7db9bb39cbc418ef8c17cca9eff86e7134863d47"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-18T07:24:46Z"
        evidence_path: src/workflow/current-location-workflow-identity.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: lint
        command: "npx --no-install biome check docs/design/design-catalog.yaml docs/design/helix/L4-basic-design/worker-wrapper-admission.md docs/design/helix/L6-function-design/current-location-workflow-identity.md docs/plans/PLAN-L7-584-current-location-workflow-identity.md docs/test-design/helix/L8-current-location-workflow-identity-unit-test-design.md src/cli.ts src/lint/l3-progression-reviewed-digests.ts src/schema/current-location-workflow-identity.ts src/state-db/current-location.ts src/workflow/current-location-workflow-identity.ts tests/current-location-workflow-identity.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T07:24:46Z"
        evidence_path: src/cli.ts
        output_digest: "sha256:ad52c18f70145823d9cf415ecdbdcc8c9c8b11b4c18fe13aeaab282f2d8f32d1"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-584-current-location-workflow-identity.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-18T07:24:46Z"
        evidence_path: docs/plans/PLAN-L7-584-current-location-workflow-identity.md
        output_digest: "sha256:2a73d19633eefa6e04355271b9196fb3e3beb0f9407ac8b7a9495acbf2b2d8ca"
    evidence_digest: "sha256:3e47ad7245182c5209c9971295798279d8d2d4f87e43b11ecb42ab802564cd7b"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-18T07:24:46Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-18T07:24:46Z"
    evidence_digest: "sha256:fbc74216509c8a2c6963ea476332936de24cc4de0783b960a70d4ac6f52984e3"
  entries: []
---

# current-locationのtyped workflow identity境界

このsliceはcurrent-location routeへregistry tupleを接続する。既存の旧fieldを同じPRで一括削除せず、
typed consumerが利用できるreceiptとfail-close境界を先に固定する。後続PRでCLI、DB、visualization、
doctorのprimary outputを順にtyped化し、legacy fieldはcompatibility input専用へ縮退させる。
