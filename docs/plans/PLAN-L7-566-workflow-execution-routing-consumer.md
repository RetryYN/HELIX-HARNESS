---
plan_id: PLAN-L7-566-workflow-execution-routing-consumer
title: "PLAN-L7-566 (impl): current routing consumerをtyped policyへ移行する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
route_mode: version-up
entry_signals: ["po_directive:Issue #704 current routing consumer slice"]
created: 2026-08-15
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 704
behavior_contract_id: WFEXEC-ROUTING-CONSUMER-001
responsibility_owner: workflow-execution-routing-consumer
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "typed classificationとpolicy projectionは存在するが、両者をexact disposition receiptへ接続するcurrent consumerが無い"
contract_postconditions: "signal→typed identity→registered policy→disposition/exitの一方向consumerがstrict receiptを返す"
contract_invariants: "signalからstyle／execution form／riskを推測せず、旧identityとraw invocationをcurrent outputへ出さない"
contract_failures: "classification unknown／decision／ambiguity、policy unsupported／ambiguity、approval未成立をrequirementsのexact mappingでfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "PLAN-L3-58/59とOpus reviewがcurrent consumer未接続を既存Redとして特定済みであり、pure consumerとoracleを同一atomic patchで追加するため未記録Red timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "既存2 resolverをrequirements定義の単一receiptへ合成し、CLI／DBが独自推測する余地を除く"
removal_trigger: "routing receipt major version更新時にversioned successor consumerへ置換する"
parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md
pair_artifact: docs/test-design/helix/L8-workflow-execution-routing-consumer-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md, oracle_id: U-WFEXROUTE-001, test_path: tests/workflow-execution-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md, oracle_id: U-WFEXROUTE-002, test_path: tests/workflow-execution-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md, oracle_id: U-WFEXROUTE-003, test_path: tests/workflow-execution-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md, oracle_id: U-WFEXROUTE-004, test_path: tests/workflow-execution-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md, oracle_id: U-WFEXROUTE-005, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md, oracle_id: U-WFEXROUTE-006, test_path: tests/workflow-execution-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md, oracle_id: U-WFEXROUTE-007, test_path: tests/workflow-execution-routing.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed resolver composition" }
  - { role: qa, slot_label: "QA — disposition／exit／forbidden output反例" }
  - { role: tl, slot_label: "TL — requirements authorityとexecution境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-15T14:19:52Z"
    tests_green_at: "2026-08-15T14:19:52Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #704 current consumer atomic sliceについて、classification→policyの順序、exact 7 disposition/exit map、high-impact approval fail-close、旧identity/raw command非出力をtargeted testで確認した。Claude Code Opus exact-HEAD独立reviewはPR terminal gateとして別途必須。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/workflow-execution-routing.test.ts tests/workflow-execution-policy-registry.test.ts tests/workflow-classification-routing.test.ts tests/workflow-execution-policy-projection.test.ts && npx --no-install tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T14:19:52Z"
        evidence_path: tests/workflow-execution-routing.test.ts
        output_digest: "sha256:f3b441155622be606b12680249352e563852aabaecde080b6324cecec7504c88"
        result: "4 files / 30 tests passed; tsc --noEmit exit 0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T14:19:52Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-15T14:19:52Z"
    evidence_digest: "sha256:04b1e053ca58a75f2c85d3a1a2db8536f5227f56c27743200b7399c2f4d4dd6e"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-566-workflow-execution-routing-consumer.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-execution-routing-consumer.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-workflow-execution-routing-consumer-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/schema/workflow-execution-policy-registry.ts, artifact_type: source_module }
  - { artifact_path: src/workflow/workflow-execution-routing.ts, artifact_type: source_module }
  - { artifact_path: src/workflow/contracts.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-execution-routing.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-58-workflow-execution-policy-consumer-contract.md
  requires:
    - docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
    - docs/plans/PLAN-L7-563-workflow-execution-policy-projection.md
    - docs/plans/PLAN-L7-565-workflow-execution-policy-resolution.md
  references:
    - docs/plans/PLAN-L3-59-workflow-execution-disposition-map.md
    - docs/plans/PLAN-REVERSE-704-workflow-execution-policy-terminal-fullback.md
  blocks: []
---

# current routing consumer typed policy移行

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | classificationとpolicy projectionを一方向合成 | [直列] | U-WFEXROUTE-001 green |
| 2 | classification／policy／approval fail-closeを実装 | [直列] | U-WFEXROUTE-002..004 green |
| 3 | targeted、typecheck、full CI | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

CLI wiring、approval receipt validation、DB projection、legacy input-only adapterは後続原子的sliceとする。
