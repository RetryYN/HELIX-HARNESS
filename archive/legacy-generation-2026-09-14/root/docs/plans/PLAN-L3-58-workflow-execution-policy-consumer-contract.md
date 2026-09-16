---
plan_id: PLAN-L3-58-workflow-execution-policy-consumer-contract
title: "PLAN-L3-58 (add-design): current routing consumer契約を要求正本化する"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
route_mode: version-up
entry_signals:
  - "po_directive:Issue #704 runtime/CLI consumer prerequisite"
created: 2026-08-15
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 704
behavior_contract_id: WFEXEC-CONSUMER-CONTRACT-001
responsibility_owner: workflow-execution-policy-consumer-contract
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: configure
ddd_modeling_decision: value_object
contract_preconditions: "typed classificationとgenerated policy projectionは存在するが、current runtime／CLI receiptのinput、output、disposition、exit code境界が要求正本に無い"
contract_postconditions: "requirements v1.3.8とpolicy registryがtyped classificationからpolicyを一方向解決するcurrent consumer receiptをexact fieldで固定する"
contract_invariants: "signalから条件／style／execution formを推測せず、command ID以外のinvocationとlegacy identityをcurrent outputへ出さない"
contract_failures: "unknown／decision待ち／ambiguity／unsupported／approval_requiredを別dispositionでfail-closeし、commandはpolicy resolutionの非実行出力に留める"
tdd_red_required: false
tdd_red_waiver_reason: "requirements／strict registry／generated projection／negative fixtureを同一atomic patchで追加し、未記録Red timestampを捏造しない"
complexity_effect: net_neutral
complexity_justification: "既存requirements-owned registryへconsumer contractを追加し、runtime実装前の語彙をexact setへ限定する"
removal_trigger: "consumer receipt v2へversion migrationしv1 consumerが0になった時"
parent_design: docs/governance/helix-harness-requirements_v1.3.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: tests/workflow-execution-policy-registry.test.ts
agent_slots:
  - { role: tl, slot_label: "TL — current consumer authorityとlegacy隔離境界" }
  - { role: qa, slot_label: "QA — disposition／exit code／forbidden output反例" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-15T07:49:14Z"
    tests_green_at: "2026-08-15T07:49:14Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #704 consumer prerequisiteとして、requirements registryのみを意味authorityとし、typed target_axis/target_idからpolicyを一方向解決する契約を確認した。current outputにlegacy mode/model/catalog_route_id/route_classやraw invocationを出さず、ambiguityとapproval_requiredをfail-closeする。Claude Code Opus exact-HEAD独立reviewはPR terminal gateとして別途必須であり、本証跡はPLAN confirm用に限定する。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/workflow-execution-policy-registry.test.ts tests/workflow-execution-policy-projection.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-15T07:49:14Z"
        evidence_path: tests/workflow-execution-policy-registry.test.ts
        output_digest: "sha256:ed22f4df69b03fe30f01bb46fe008a0643e8631ee5aa1731b6c70cb0cf657ef2"
        result: "2 files / 17 tests passed"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-15T07:49:14Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-15T07:49:14Z"
    evidence_digest: "sha256:f47bc48b50ead2a2f8abafb067173c8fbcb1a491ff400a911d8659fd3e63df32"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-58-workflow-execution-policy-consumer-contract.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json, artifact_type: design_doc }
  - { artifact_path: config/workflow-classification-catalog.v1.json, artifact_type: config }
  - { artifact_path: config/workflow-execution-policy.v1.json, artifact_type: config }
  - { artifact_path: src/schema/workflow-execution-policy-registry.ts, artifact_type: source_module }
  - { artifact_path: src/schema/workflow-execution-policy-projection.ts, artifact_type: source_module }
  - { artifact_path: tests/workflow-execution-policy-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/workflow-execution-policy-projection.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: config }
dependencies:
  parent: docs/governance/helix-harness-requirements_v1.3.md
  requires:
    - docs/plans/PLAN-L3-57-workflow-execution-policy-registry.md
    - docs/plans/PLAN-L7-563-workflow-execution-policy-projection.md
  references:
    - config/drive-route-catalog.json
    - src/cli/commands/route.ts
    - docs/plans/PLAN-REVERSE-704-workflow-execution-policy-terminal-fullback.md
  blocks: []
---

# current routing consumer契約

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | requirements v1.3.8へinput／receipt／dispositionを追加 | [直列] | current consumerの意味authorityがrequirementsだけにある |
| 2 | policy registryとgenerated projectionへexact contractを投影 | [直列] | source digestとlossless projectionが一致 |
| 3 | legacy field／raw invocation／approval bypassを反証 | [直列] | negative oracle green |
| 4 | Claude Code Opusによるexact-HEAD独立レビュー | [review] | blocker 0 |

runtime／CLI／DB実装とlegacy input-only adapterは後続の別sliceとする。
