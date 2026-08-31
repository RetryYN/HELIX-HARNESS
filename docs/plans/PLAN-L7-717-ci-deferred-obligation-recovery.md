---
plan_id: PLAN-L7-717-ci-deferred-obligation-recovery
title: "PLAN-L7-717: CI deferred obligation exactly-once回収"
kind: add-impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-31
updated: 2026-08-31
owner: Codex / TL
github_issue_id: 1208
behavior_contract_id: CI-DEFERRED-OBLIGATION-RECOVERY-001
responsibility_owner: ci-system-synthesis
change_slice: atomic
refactor_step: introduce_contract
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: domain_service
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:CI System Synthesisのdeferred obligation回収を実workflowへ接続する"
contract_preconditions: "#1206 Verification Planがdeferred obligationとexact targetを生成し、#1207 schedulerがrequired obligationを変更しない"
contract_postconditions: "origin PR、candidate HEAD、obligation、最初のterminal run、result、finding dispositionをexact receiptへ束縛する"
contract_invariants: "延期義務を削除せず、後段failureからauthorityを直接変更せず、安全性低下を時間短縮で相殺しない"
contract_failures: "missing、duplicate、expired、cancelled、stale HEAD、wrong profile、wrong origin、invalid quarantineをfail-closeする"
tdd_red_required: true
red_at: "2026-08-31T23:31:00+09:00"
green_at: "2026-08-31T23:34:10+09:00"
tdd_red_evidence: "U-CIDEFER-001..006を先行作成し、ci-deferred-obligation-recovery module欠落でimport failureとなった"
tdd_green_evidence: "npx vitest run tests/ci-deferred-obligation-recovery.test.ts tests/ci-verification-plan.test.ts tests/ci-critical-path-scheduler.test.ts tests/ci-responsibility-registry.test.tsで46 passed、npm run typecheckもgreen"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/ci-deferred-obligation-recovery.test.ts のU-CIDEFER-002..006に加え、U-CIDEFER-010でselector edge削除、risk downgrade、Module closure欠落、test owner誤配線、artifact reuse誤りのexact 5 mutationをRegistry→Verification Plan→Scheduler実合成へ注入し全件killした。npx vitest run tests/ci-deferred-obligation-recovery.test.tsで11 passedを実測した。"
complexity_effect: net_neutral
complexity_justification: "schedulerへ回収責務を混載せず、既存Verification Plan出力を単一domain projectionへ閉じる"
removal_trigger: "Verification Planと実行journalが同じexactly-once state machineへ統合された時"
parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md
pair_artifact: docs/test-design/helix/L8-ci-deferred-obligation-recovery-unit-test-design.md
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-31T16:58:10Z"
    tests_green_at: "2026-08-31T16:58:10Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "9867601a-a3ad-4369-980c-11757d63a7de"
    reviewed_head_sha: dc21b5628abe9f61f1262912a32449a020e8ba15
    scope: "PR #1290 pre-confirm exact HEADについて、5 mutation exact set、exactly-once recovery、main/nightly/release full contract、origin backprop、quarantine、metricsを独立reviewし、実装BLOCKER 0を確認した。"
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1290#issuecomment-5481632156"
    green_commands:
      - kind: test
        command: "npx vitest run tests/ci-deferred-obligation-recovery.test.ts tests/ci-verification-plan.test.ts tests/ci-critical-path-scheduler.test.ts tests/ci-responsibility-registry.test.ts"
        runner: local
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-31T16:58:10Z"
        evidence_path: tests/ci-deferred-obligation-recovery.test.ts
        output_digest: "sha256:599b179737a829fdcd38a5a19df8d03b16745977290da6ee45c6d3c0e6088d46"
        result: "Claude独立reviewで4 files / 46 tests green。Codex TLも同一commandを再実行して同件数greenを確認した。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-31T16:58:10Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-31T16:58:10Z"
    evidence_digest: "sha256:599b179737a829fdcd38a5a19df8d03b16745977290da6ee45c6d3c0e6088d46"
  entries: []
dependencies:
  parent: docs/plans/PLAN-L7-706-ci-verification-plan.md
  requires:
    - docs/plans/PLAN-L7-706-ci-verification-plan.md
    - docs/plans/PLAN-L7-707-ci-critical-path-scheduler.md
  references:
    - issue:1208
    - issue:1206
    - issue:1207
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-001, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-002, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-003, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-004, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-005, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-006, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-007, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-008, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-009, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-010, test_path: tests/ci-deferred-obligation-recovery.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, oracle_id: U-CIDEFER-011, test_path: tests/ci-deferred-obligation-recovery.test.ts }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/ci-deferred-obligation-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/plans/PLAN-L7-717-ci-deferred-obligation-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-ci-deferred-obligation-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/ci-deferred-obligation-recovery.ts, artifact_type: source_module }
  - { artifact_path: tests/ci-deferred-obligation-recovery.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
agent_slots:
  - { role: se, slot_label: "SE — exactly-once recovery domain設計" }
  - { role: qa, slot_label: "QA — selector fault injectionと安全性oracle" }
---

# CI deferred obligation exactly-once回収

## §工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | typed recovery contractと反例oracle | 並列 | U-CIDEFER-001..009 green |
| 2 | workflow adapterとjournal／receipt接続 | 直列 | main／nightly／release candidate E2E green |
| 3 | selector fault injection exact set | 直列 | 5 mutation全検出 |
| 4 | Reverse fullbackとmain read-after | 直列 | #1208 terminal closure |

Step 1は依存PRの検収待ち中に先行できる。Step 2以降とPLAN confirmed化は#1207 canonical merge後に行う。
