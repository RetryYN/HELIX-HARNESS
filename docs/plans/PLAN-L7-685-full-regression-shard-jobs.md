---
plan_id: PLAN-L7-685-full-regression-shard-jobs
title: "PLAN-L7-685 (impl): Full regression shard jobsとfinalize aggregate"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:Issue #1071 Full regression shard jobsとfinalize aggregate"
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
github_issue_id: 1071
behavior_contract_id: FULL-REGRESSION-SHARD-JOBS-001
responsibility_owner: impact-ci-recovery
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-27T02:30:55.000Z"
    tests_green_at: "2026-08-27T02:28:30Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: "c7895aff-da7e-47a0-944a-36c68bb4f251"
    reviewed_head_sha: 95b2a0ef713fac63c613fc7e28a1cfb0a3456b92
    scope: "PR #1093 current HEAD 95b2a0ef713fac63c613fc7e28a1cfb0a3456b92をClaude Code Opusが独立検収し、full regression shard DAG、exact inventory partition、trigger-safe ref、timeout、finalize gate、DB projection/replayを実測して内容blocker 0と判定した。merge前のPLAN confirmed化を収束条件とした。canonical receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/1093#issuecomment-5433614448"
    green_commands:
      - kind: smoke
        command: "gh run view 33032561763 --repo RetryYN/HELIX-HARNESS --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-27T02:28:30Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:f7e70303c1bfb92feee07e0b8e02bb0f05568f59d5cb6144ad2bbf31e52e098b"
        result: "terminal success / HEAD 95b2a0ef713fac63c613fc7e28a1cfb0a3456b92"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-27T02:30:55.000Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-27T02:30:55.000Z"
    evidence_digest: "sha256:36c75c4d703146d6895881c5e9bb21709ba2f2a1d652ae92b36c125640a8fb15"
  entries: []
backprop_decision: not_required
backprop_decision_reason: "既存GH-NFR-010／GH-AC-017とL6設計を変更せず、確定済みpartition contractをGitHub Actionsへ配線するL7 sliceである"
contract_preconditions: "#1070のtyped partition／receipt contract、Impact CI full decision、candidate HEAD／base SHAが存在する"
contract_postconditions: "preflight、bulk-1、bulk-2、stateful、finalizeが独立jobとなり、各jobのbounded timeoutを適用し、全receiptのexact validation後だけDB／Biome／doctor／full receiptへ進む"
contract_invariants: "tracked test inventory exact union、same HEAD／base、required harness-check、main／nightly／RC full、targeted selection、same-HEAD reuse、各jobのbounded timeout、schedule／workflow_dispatchでもPR由来のcandidate HEADをcheckout refへ流さないtrigger-safe refを維持する。初期timeout値のbudget overlayはPLAN-RECOVERY-94-ci-shard-budget-headroomが所有する"
contract_failures: "missing／duplicate／wrong identity／nonzero／cancel／timeout／artifact欠落を相殺せずfail-closeする"
tdd_red_required: true
red_test: "U-FULLSHARD-CLI-001..004、U-FULLSHARD-WF-001..003、およびU-FULLSHARD-001..006がadapter／job／receipt／aggregate欠落を検出する"
red_at: "2026-08-27T00:50:51Z"
green_at: "2026-08-27T00:51:13Z"
mutation_oracle_evidence: "tests/harness-check-workflow.test.ts::U-FULLSHARD-WF-003でfull-regression-bulk-1のtimeout-minutes 20→21 mutationを投入し、job_timeout_invalid:full-regression-bulk-1を期待するRed testがexit 1になることを実測した。validator復元後、同一targeted suiteがexit 0となるGreenを確認した"
complexity_effect: justified_positive
complexity_justification: "同一runner内process管理を削除し、typed plan／receiptを介する独立job DAGへ置換してcritical pathを短縮する"
removal_trigger: "GitHub native matrixが同じtyped partition／receipt／finalize contractを直接表現でき、custom adapter consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-CLI-001, test_path: tests/full-regression-shards-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-CLI-002, test_path: tests/full-regression-shards-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-CLI-003, test_path: tests/full-regression-shards-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-CLI-004, test_path: tests/full-regression-shards-cli.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-WF-001, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-WF-002, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-FULLSHARD-WF-003, test_path: tests/harness-check-workflow.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-685-full-regression-shard-jobs.md, artifact_type: markdown_doc }
  - { artifact_path: src/cli/full-regression-shards.ts, artifact_type: source_module }
  - { artifact_path: tests/full-regression-shards-cli.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/plans/PLAN-RECOVERY-11-impact-ci-stateful-deadline.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-14-impact-ci-cancel-propagation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-18-lane-inventory-partial-logs.md, artifact_type: markdown_doc }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-493-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L7-684-full-regression-shard-contract.md
  references:
    - issue:1069
    - issue:1071
  blocks: []
supersedes:
  - PLAN-RECOVERY-11-impact-ci-stateful-deadline
  - PLAN-RECOVERY-14-impact-ci-cancel-propagation
  - PLAN-RECOVERY-18-lane-inventory-partial-logs
agent_slots:
  - { role: se, slot_label: "SE — workflow DAG／artifact handoff／finalize" }
  - { role: qa, slot_label: "QA — wrong HEAD／receipt欠落／cancel／timeout mutation" }
  - { role: tl, slot_label: "TL — required check／reuse／post-test gate非縮退" }
---

# PLAN-L7-685: Full regression shard jobsとfinalize aggregate

## 工程表

| Step | 作業 | 完了条件 |
|---:|---|---|
| 1 | pure contractをCLI adapterへ接続 | plan／files／receipt／validateがtyped JSONとexit codeを返す |
| 2 | preflightでinventoryとpartitionをseal | candidate HEAD／base／partition artifactが一意 |
| 3 | bulk-1／bulk-2／statefulを独立job化 | exact file set、同一Node install、job overlap成立 |
| 4 | finalizeでreceipt exact setを再検証 | 欠落、重複、wrong identity、nonzeroを拒否 |
| 5 | DB／Biome／doctor／full receiptを後段化 | 全shard green後だけ実行 |
| 6 | Actions read-after | wall-clock、overlap、required check、reuse非縮退を確認 |

## 非対象

test削除、`continue-on-error`、targetedをFull代替にする変更、release／publishは含めない。初期20分budgetの是正、shard再分配、budget telemetryは後継のPLAN-RECOVERY-94が所有し、本PLANのexact receipt／fail-close契約を緩めない。
