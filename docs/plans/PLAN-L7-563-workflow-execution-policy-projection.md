---
plan_id: PLAN-L7-563-workflow-execution-policy-projection
title: "PLAN-L7-563 (impl): execution policyをrequirements registryから生成する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
route_mode: version-up
entry_signals: ["po_directive:Issue #704 generated execution-policy projection slice"]
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
github_issue_id: 704
behavior_contract_id: WFEXEC-POLICY-PROJECTION-001
responsibility_owner: workflow-execution-policy-projection
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "requirements-owned policy registryは存在するが、下流consumer向けの生成projectionが無い"
contract_postconditions: "registered command IDとtyped bindingをsource digest付きで損失なく再生成するpolicy projectionが存在する"
contract_invariants: "requirements registryだけが意味authorityであり、projectionはraw command、legacy identity、旧modeを出力しない"
contract_failures: "source digest drift、command／binding欠落、raw command、legacy identity、manual driftをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "isolated branchでprojection moduleとoracleを同一atomic patchとして作成し、未記録Red timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "runtime consumer切替前にrequirements registryとcurrent projectionの一方向境界を固定する"
removal_trigger: "policy registry schema successorへ移行しv1 projection consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md
pair_artifact: docs/test-design/helix/L8-workflow-execution-policy-projection-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md, oracle_id: U-WFEPROJ-001, test_path: tests/workflow-execution-policy-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md, oracle_id: U-WFEPROJ-002, test_path: tests/workflow-execution-policy-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md, oracle_id: U-WFEPROJ-003, test_path: tests/workflow-execution-policy-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md, oracle_id: U-WFEPROJ-004, test_path: tests/workflow-execution-policy-projection.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-projection.md, oracle_id: U-WFEPROJ-005, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — deterministic policy projectionとdigest binding" }
  - { role: qa, slot_label: "QA — raw command、legacy identity、manual drift反例" }
  - { role: tl, slot_label: "TL — requirements authorityとcompatibility境界" }
generates:
  - { artifact_path: config/workflow-execution-policy.v1.json, artifact_type: config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/schema/workflow-execution-policy-registry.ts, artifact_type: source_module }
  - { artifact_path: src/schema/workflow-execution-policy-projection.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-execution-policy-projection.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-57-workflow-execution-policy-registry.md
  requires:
    - docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json
    - docs/design/helix/L6-function-design/workflow-execution-policy-projection.md
  references:
    - src/schema/route-map.ts
  blocks: []
---

# workflow execution policy generated projection実装

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | projection schemaと三重digest bindingを実装 | [直列] | U-WFEPROJ-001..002 green |
| 2 | raw command／legacy identity／manual driftを反証 | [直列] | U-WFEPROJ-003..004 green |
| 3 | targeted、typecheck、full CI | [直列] | 同一HEAD green |
| 4 | Claude Code Opus独立review | [review] | blocker 0 |

runtime、CLI、DB、legacy adapterの切替は後続sliceとし、本PLANでは旧route-mapを削除しない。
