---
plan_id: PLAN-L7-714-summary-frontier-typed-workflow
title: "PLAN-L7-714: summary・frontierの旧drive identityをtyped workflowへ収束する"
kind: refactor
layer: L7
drive: agent
status: confirmed
backfill_state: complete
completion_claim_allowed: true
created: 2026-08-31
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1264
behavior_contract_id: SUMMARY-FRONTIER-TYPED-WORKFLOW-001
responsibility_owner: summary-frontier-workflow-identity
change_slice: atomic
refactor_step: migrate_one_consumer
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: value_object
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "requirements-owned typed workflow authorityは確定済みで、本sliceは残存summary consumerの一方向移行である。skill applicabilityは#1265へ分離した。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #1264 summary・frontierの旧drive identity収束"
contract_preconditions: "current-location typed workflow identityとregistry receiptがcurrent authorityとして利用可能である"
contract_postconditions: "project-frontier／tree-view summaryとsummary contract command mapがworkflow_identity／workflow_routeだけをprimary identityとして返す"
contract_invariants: "legacy drive model commandはcompatibility surfaceに限定し、current summary failureをlegacy greenで相殺しない"
contract_failures: "drive_model object／command key再混入、registry tuple欠落、wrong navigation commandをfail-closeする"
tdd_red_required: true
tdd_red_evidence: "tests/summary-surface-audit.test.tsとtests/cli-surface.test.tsへ旧drive object／command再混入を拒否するoracleを先行追加する"
mutation_oracle_required: true
mutation_oracle_evidence: "drive_model object、commands.drive_model、旧command literalのいずれかを戻すとU-CLSO-007がfailする"
complexity_effect: net_negative
complexity_justification: "同じtyped identityをdrive_model wrapperへ重複投影する経路と旧navigation keyを除去する"
removal_trigger: "summary surfaceが後継generated view contractへ完全移行し同oracleが移管された時"
parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md
pair_artifact: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md
dependencies:
  parent: issue:206
  requires:
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
  references:
    - docs/plans/PLAN-L7-672-current-location-summary-typed-output.md
    - issue:1264
    - issue:206
    - issue:1265
  blocks:
    - issue:206
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-007, test_path: tests/summary-surface-audit.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, oracle_id: U-CLSO-008, test_path: tests/cli-surface.test.ts }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-31T01:07:03Z"
    tests_green_at: "2026-08-31T01:05:17Z"
    verdict: approve
    worker_model: "codex:gpt-5.6-sol"
    reviewer_model: "claude:claude-opus-5"
    reviewer_session_id: "a02813c9-9bc1-41f4-9c86-0f943ece4270"
    reviewed_head_sha: bc99740b35f14e7466143888edd42f6373e92f22
    scope: "PR #1268 final HEAD bc99740b35f14e7466143888edd42f6373e92f22をClaude Code Opusが独立検収し、summary／frontierのtyped workflow移行、legacy token実減少、digest pin、targeted oracle、CI run 33345301361のsuccessを確認してBLOCKER 0と判定した。実CLI negative oracleの不足はIssue #1277へ分離済み。"
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1268#issuecomment-5472477073"
    green_commands:
      - kind: smoke
        command: "gh run view 33345301361 --repo RetryYN/HELIX-HARNESS --json status,conclusion,headSha,attempt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-31T01:05:17Z"
        evidence_path: tests/summary-surface-audit.test.ts
        output_digest: "sha256:1eb3d1ef70ece391c8d340219794587b08a3e77b7ca4a9a506197ef6399730a5"
        result: "run 33345301361 attempt 1 terminal success / HEAD bc99740b35f14e7466143888edd42f6373e92f22"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-31T01:07:03Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-31T01:07:03Z"
    evidence_digest: "sha256:fd442de107ac09862ea1d90cbc3a821fa288d80cefc40b944e9880381726f532"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-714-summary-frontier-typed-workflow.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: config/workflow-output-consumer-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/current-location-summary-typed-output.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-current-location-summary-typed-output-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/summary-surface-audit.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/summary-surface-audit.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "SE — summary identity projection境界" }
  - { role: qa, slot_label: "QA — legacy object／command再混入mutation" }
---

# summary・frontier typed workflow収束

Issue #1264のsummary／frontier consumerだけを変更する。skill applicability consumerは#1265、DB legacy object retirement、release／cutoverは含めない。

## 終端収束

- Forward candidate HEAD `bc99740b35f14e7466143888edd42f6373e92f22`はCI run `33345301361`でterminal successとなり、Claude Code Opusのexact-HEAD独立レビューとsealed receiptでBLOCKER 0を確認した。
- merge commit `66d001fa457f455925e80314ba284b0de83f5be3`のpost-main `harness-check` run `33347158321`もterminal successであり、main read-afterを完了した。
- 実CLI出力へlegacy `drive_model`が再混入した場合のexact negative oracleはNON-BLOCKERとしてIssue #1277へ分離し、本PLANの完了を偽って相殺しない。
