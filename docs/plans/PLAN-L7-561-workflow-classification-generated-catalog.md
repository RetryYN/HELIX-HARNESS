---
plan_id: PLAN-L7-561-workflow-classification-generated-catalog
title: "PLAN-L7-561 (impl): workflow分類catalogをrequirements registryから生成する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
route_mode: version-up
entry_signals: ["po_directive:Issue #694 generated catalog Forward slice"]
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: WFCLASS-CATALOG-001
responsibility_owner: workflow-classification-generated-catalog
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "requirements v1.3.5 registryはcanonicalだが、下流catalogは旧15-route compatibility inventoryだけである"
contract_postconditions: "registryの全typed identity、relation、signal bindingを損失なく再生成するversioned catalog projectionが存在する"
contract_invariants: "requirements registryだけが意味authorityであり、projectionは共通route identityやlegacy identityを出力しない"
contract_failures: "registry byte drift、entity／axis／relation／signal欠落、legacy identity再出力、共通route identityへの畳み込みをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "isolated branchでprojection moduleとoracleを同一atomic patchとして作成し、実在しないRed timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "旧catalog consumerを一括破壊せず、requirementsからcurrent projectionへ移行する単一生成境界を追加する"
removal_trigger: "registry schema successorへ移行しv1 projection consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-generated-catalog-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md, oracle_id: U-WFCAT-001, test_path: tests/workflow-classification-catalog.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md, oracle_id: U-WFCAT-002, test_path: tests/workflow-classification-catalog.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md, oracle_id: U-WFCAT-003, test_path: tests/workflow-classification-catalog.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md, oracle_id: U-WFCAT-004, test_path: tests/workflow-classification-catalog.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — deterministic projectionとdigest binding" }
  - { role: qa, slot_label: "QA — axis混同、legacy再出力、manual drift反例" }
  - { role: tl, slot_label: "TL — requirements authorityとcompatibility境界" }
generates:
  - { artifact_path: config/workflow-classification-catalog.v1.json, artifact_type: config }
  - { artifact_path: src/schema/workflow-classification-catalog.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-classification-catalog.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-55-workflow-classification-registry.md
  requires:
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
  references:
    - docs/governance/route-classification-surface-inventory-2026-08-15.md
    - config/drive-route-catalog.json
  blocks: []
---

# workflow分類generated catalog実装

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | registry projection schemaとdigest bindingを実装 | [直列] | U-WFCAT-001..002 green |
| 2 | common route／legacy再出力とmanual driftを反証 | [直列] | U-WFCAT-003..004 green |
| 3 | targeted、typecheck、full CI | [直列] | 同一HEAD green |
| 4 | Claude Code Opus独立review | [review] | blocker 0 |

runtime、CLI、DB、legacy adapterの切替は後続sliceとし、本PLANでは旧catalogを削除しない。
