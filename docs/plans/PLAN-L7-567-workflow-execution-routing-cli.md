---
plan_id: PLAN-L7-567-workflow-execution-routing-cli
title: "PLAN-L7-567 (impl): route eval CLIをtyped consumerへ移行する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
route_mode: version-up
entry_signals: ["po_directive:Issue #704 current route CLI migration slice"]
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
github_issue_id: 704
behavior_contract_id: WFEXEC-ROUTING-CLI-001
responsibility_owner: workflow-execution-routing-cli
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: adapter
contract_preconditions: "route eval CLIが旧mode、RecommendedCommand、raw command、signal由来risk推測をcurrent outputに残している"
contract_postconditions: "route evalがexact typed inputを要求し、current consumer receiptだけをJSON／text／auditへ出力する"
contract_invariants: "CLIはsignalからexecution form／riskを推測せず、registered command IDからraw invocationを再構成しない"
contract_failures: "input不足／未知値をexit 2、consumer ambiguity／approvalをrequirements exit mapでfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Opus reviewが旧route eval outputをImportantとして検出した既存Redであり、CLIとoracleを同一atomic patchで置換するため未記録Red timestampを捏造しない"
complexity_effect: net_negative
complexity_justification: "route-map／approval YAML／RecommendedCommandのCLI独自分岐を削除し、pure current consumerへ一本化する"
removal_trigger: "routing CLI major version更新時にversioned successor commandへ置換する"
parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md
pair_artifact: docs/test-design/helix/L8-workflow-execution-routing-cli-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md, oracle_id: U-WFEXCLI-001, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md, oracle_id: U-WFEXCLI-002, test_path: tests/route-action-approval-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md, oracle_id: U-WFEXCLI-003, test_path: tests/route-action-approval-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md, oracle_id: U-WFEXCLI-004, test_path: tests/route-action-approval-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md, oracle_id: U-WFEXCLI-005, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md, oracle_id: U-WFEXCLI-006, test_path: tests/route-action-approval-cli.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — Commander typed input／receipt wiring" }
  - { role: qa, slot_label: "QA — omission／legacy output／audit反例" }
  - { role: tl, slot_label: "TL — current/compatibility CLI境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-15T14:10:35Z"
    tests_green_at: "2026-08-15T14:10:35Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #704 CLI atomic sliceについて、exact execution form／4 boolean、typed JSON output、raw command非出力、approval auditのlegacy identity非出力をtargeted testで確認した。Claude Code Opus exact-HEAD独立reviewはPR terminal gateとして別途必須。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/cli-surface.test.ts tests/route-action-approval-cli.test.ts -t 'U-WFEXCLI|route action approval CLI' && npx --no-install vitest run --project fast tests/workflow-execution-routing.test.ts tests/workflow-execution-policy-registry.test.ts && npx --no-install tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T14:10:35Z"
        evidence_path: tests/route-action-approval-cli.test.ts
        output_digest: "sha256:c22462e3568fc6bb2b5583e4c61aefa6790174c11b450401c8761df19b8c2657"
        result: "current CLI 5 tests, compatibility 1 test, and consumer 19 tests passed; tsc --noEmit exit 0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T14:10:35Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-15T14:10:35Z"
    evidence_digest: "sha256:3b45aa0da4ff87f643b311809535b1738e01f054d08668fcdd8dcaeaa6166f57"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-567-workflow-execution-routing-cli.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-execution-routing-cli.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-workflow-execution-routing-cli-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L4-basic-design/function.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/cli/commands/route.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/route-action-approval-cli.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-58-workflow-execution-policy-consumer-contract.md
  requires:
    - docs/plans/PLAN-L7-566-workflow-execution-routing-consumer.md
  references:
    - docs/plans/PLAN-L3-59-workflow-execution-disposition-map.md
    - docs/plans/PLAN-L7-477-route-action-approval-stage.md
    - docs/plans/PLAN-REVERSE-704-workflow-execution-policy-terminal-fullback.md
  blocks: []
---

# route eval CLI typed consumer移行

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | exact inputとtyped receipt outputへ置換 | [直列] | U-WFEXCLI-001..003 green |
| 2 | approval auditからlegacy／raw invocationを除去 | [直列] | U-WFEXCLI-004 green |
| 3 | targeted、Node24 full CI、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

legacy input-only adapterとDB projectionは後続原子的sliceとする。
