---
plan_id: PLAN-L7-568-workflow-classification-legacy-adapter
title: "PLAN-L7-568 (impl): legacy mode／modelをinput-only adapterへ隔離する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
route_mode: version-up
entry_signals: ["po_directive:Issue #694 legacy input-only compatibility slice"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: WFCLASS-LEGACY-ADAPTER-001
responsibility_owner: workflow-classification-legacy-adapter
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: adapter
contract_preconditions: "旧mode／model consumerがcurrent typed registryと並存し、legacy入力の変換境界が未定義"
contract_postconditions: "bounded adapterだけがlegacy入力を受け、exact typed identity、source warning、fail-close dispositionを返す"
contract_invariants: "requirements registryが唯一の意味authorityであり、legacy identityをcurrent output／DB／生成物へ再出力しない"
contract_failures: "ambiguous／unknown legacy値を推測せずexit 1で拒否し、Forwardへfallbackしない"
tdd_red_required: true
complexity_effect: net_negative
complexity_justification: "後続consumer移行で旧mode分岐を削除できる単一compatibility boundaryを置く"
removal_trigger: "旧mode／model input consumerが0になりcompatibility retention期限が満了した時点"
parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-legacy-adapter-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-001, test_path: tests/workflow-classification-legacy-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-002, test_path: tests/workflow-classification-legacy-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-003, test_path: tests/workflow-classification-legacy-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-004, test_path: tests/workflow-classification-legacy-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-005, test_path: tests/workflow-classification-legacy-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, oracle_id: U-WFLEG-006, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — bounded conversion tableとreceipt境界" }
  - { role: qa, slot_label: "QA — ambiguity／unknown／legacy再出力反例" }
  - { role: tl, slot_label: "TL — requirements authorityと後続consumer migration境界" }
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-classification-legacy-adapter.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-workflow-classification-legacy-adapter-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/workflow/workflow-classification-legacy-adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-classification-legacy-adapter.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
dependencies:
  parent: docs/plans/PLAN-L3-55-workflow-classification-registry.md
  requires:
    - docs/plans/PLAN-L7-562-workflow-classification-typed-routing.md
    - docs/plans/PLAN-L7-567-workflow-execution-routing-cli.md
  references:
    - docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md
  blocks: []
---

# 旧分類input-only adapter

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | exact conversion／ambiguity tableを実装 | [直列] | U-WFLEG-001..004 green |
| 2 | receiptのlegacy再出力禁止を固定 | [直列] | U-WFLEG-005 green |
| 3 | targeted、全回帰、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

既存consumer除去、DB projection、doctor全surface gateは後続原子的sliceとする。
