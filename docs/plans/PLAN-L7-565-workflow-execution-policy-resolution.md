---
plan_id: PLAN-L7-565-workflow-execution-policy-resolution
title: "PLAN-L7-565 (impl): policy resolverをrequirements dispositionへ収束する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
route_mode: version-up
entry_signals: ["po_directive:Issue #704 typed policy resolver slice"]
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
github_issue_id: 704
behavior_contract_id: WFEXEC-POLICY-RESOLUTION-001
responsibility_owner: workflow-execution-policy-resolution
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "policy resolverがrequirements contract外のunsupported／ambiguous短縮tokenを返している"
contract_postconditions: "resolverがresolved／policy_unsupported／policy_ambiguousのexact dispositionだけを返す"
contract_invariants: "requirements registryだけが意味authorityであり、旧token、旧mode、旧catalog identityをcurrent outputへ出さない"
contract_failures: "未登録policyと同率複数bindingを推測せず、それぞれexact fail-close dispositionへ分離する"
tdd_red_required: false
tdd_red_waiver_reason: "Opus exact-HEAD reviewがruntime token不一致をImportantとして検出した既存Redであり、resolverとoracleを同一atomic patchで是正するため未記録Red timestampを捏造しない"
complexity_effect: net_neutral
complexity_justification: "既存2短縮tokenをrequirements定義済み2 exact tokenへ置換し、identity軸や分岐数を増やさない"
removal_trigger: "policy registry major versionでdisposition名称を変更する場合にversioned successorへ置換する"
parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-resolution.md
pair_artifact: docs/test-design/helix/L8-workflow-execution-policy-resolution-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-resolution.md, oracle_id: U-WFEPOLRES-001, test_path: tests/workflow-execution-policy-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-resolution.md, oracle_id: U-WFEPOLRES-002, test_path: tests/workflow-execution-policy-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-resolution.md, oracle_id: U-WFEPOLRES-003, test_path: tests/workflow-execution-policy-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-resolution.md, oracle_id: U-WFEPOLRES-004, test_path: tests/workflow-execution-policy-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-policy-resolution.md, oracle_id: U-WFEPOLRES-005, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — exact disposition resolver" }
  - { role: qa, slot_label: "QA — unsupported／ambiguity mutation oracle" }
  - { role: tl, slot_label: "TL — requirements authority境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-15T11:44:03Z"
    tests_green_at: "2026-08-15T11:44:03Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #704のresolver atomic sliceについて、未登録policyがpolicy_unsupported、同率複数bindingがpolicy_ambiguousを返し、旧短縮tokenをcurrent outputへ出さないこと、およびdesign/test design登録がG3 freeze digestへ伝播することをtargeted testとdoctor design-coverageで確認した。Claude Code Opus exact-HEAD独立reviewはPR terminal gateとして別途必須。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/workflow-execution-policy-registry.test.ts tests/l3-g3-freeze-packet-v2.test.ts -t 'workflow execution policy|U-WFEPOLRES-005' && npx --no-install vitest run --project slow tests/slow/doctor.test.ts -t 'U-DESIGNCOV-014' && npx --no-install tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T11:44:03Z"
        evidence_path: tests/workflow-execution-policy-registry.test.ts
        output_digest: "sha256:6a952b0d0f911adb7f33c7f3618346622da58fd26ae5763794ae9cdb6f275fee"
        result: "resolver 14 tests、freeze propagation 1 test、doctor design coverage 1 test passed; tsc --noEmit exit 0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T11:44:03Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-15T11:44:03Z"
    evidence_digest: "sha256:7a46fa33a9ea6003d062f3d5969d5787fd527bff364109f54cd387169b07a6e3"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-565-workflow-execution-policy-resolution.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-execution-policy-resolution.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-workflow-execution-policy-resolution-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/schema/workflow-execution-policy-registry.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-execution-policy-registry.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-58-workflow-execution-policy-consumer-contract.md
  requires:
    - docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json
    - docs/plans/PLAN-L3-59-workflow-execution-disposition-map.md
  references:
    - docs/plans/PLAN-L7-563-workflow-execution-policy-projection.md
    - docs/plans/PLAN-REVERSE-704-workflow-execution-policy-terminal-fullback.md
  blocks: []
---

# policy resolver exact disposition収束

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | unsupported short tokenをexact dispositionへ置換 | [直列] | U-WFEPOLRES-002 green |
| 2 | ambiguityとlegacy token mutationを反証 | [直列] | U-WFEPOLRES-003..004 green |
| 3 | targeted、typecheck、full CI | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

route CLI、approval audit、DB projection、legacy input-only adapterは後続原子的sliceとする。
