---
plan_id: PLAN-L7-562-workflow-classification-typed-routing
title: "PLAN-L7-562 (impl): workflow signalをrequirements由来typed identityへ分類する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
route_mode: version-up
entry_signals: ["po_directive:Issue #694 typed runtime Forward slice"]
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: WFCLASS-ROUTING-001
responsibility_owner: workflow-classification-typed-routing
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "requirements由来generated catalogは存在するが、runtime分類は旧mode identityを返している"
contract_postconditions: "signalをtyped axis／identityへ分類し、decision待ち、ambiguity、unknownを推測せず閉じるcurrent resolverが存在する"
contract_invariants: "requirements registryだけが意味authorityであり、current resolverはmode／model／catalog_route_id／route_classを出力しない"
contract_failures: "同率複数identity、decision待ち確定、unknownのlegacy推測、generated catalog driftをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "isolated dependent branchでresolverとoracleを同一atomic patchとして作成し、実在しないRed timestampを捏造しない"
complexity_effect: justified_positive
complexity_justification: "legacy runtime consumerを一括破壊せず、current typed resolverを先に確立して後続adapter移行の単一境界にする"
removal_trigger: "全runtime／CLI／DB consumerがtyped resolverへ移行し、compatibility adapterが廃止された時にdual-green補助だけを除去する"
parent_design: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-typed-routing-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md, oracle_id: U-WFROUTE-001, test_path: tests/workflow-classification-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md, oracle_id: U-WFROUTE-002, test_path: tests/workflow-classification-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md, oracle_id: U-WFROUTE-003, test_path: tests/workflow-classification-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-typed-routing.md, oracle_id: U-WFROUTE-004, test_path: tests/workflow-classification-routing.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed signal resolver" }
  - { role: qa, slot_label: "QA — ambiguity／decision／legacy推測反例" }
  - { role: tl, slot_label: "TL — requirements authorityと後続adapter境界" }
generates:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: src/workflow/workflow-classification-routing.ts, artifact_type: source_module }
  - { artifact_path: src/workflow/contracts.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-classification-routing.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-55-workflow-classification-registry.md
  requires:
    - config/workflow-classification-catalog.v1.json
    - docs/design/helix/L6-function-design/workflow-classification-typed-routing.md
  references:
    - docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - src/workflow/routing-contracts.ts
    - src/schema/route-map.ts
  blocks: []
---

# workflow分類typed routing実装

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | generated catalog bindingからtyped resolverを実装 | [直列] | U-WFROUTE-001 green |
| 2 | decision待ち、ambiguity、unknown／legacy推測を反証 | [直列] | U-WFROUTE-002..004 green |
| 3 | targeted、typecheck、full CI | [直列] | 同一HEAD green |
| 4 | Claude Code Opus独立review | [review] | blocker 0 |

旧runtime outputの廃止、legacy input-only adapter、CLI／schema／DB切替、doctor gateは後続原子的sliceとする。
