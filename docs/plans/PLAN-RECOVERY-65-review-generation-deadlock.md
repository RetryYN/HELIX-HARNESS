---
plan_id: PLAN-RECOVERY-65-review-generation-deadlock
title: "PLAN-RECOVERY-65 (recovery): review CI generation deadlockを解消する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #949 PR #945 Ready admission generation deadlockを回復する"
created: 2026-08-23
updated: 2026-08-23
owner: Codex / TL
github_issue_id: 949
behavior_contract_id: GITHUB-REVIEW-CI-GENERATION-001
responsibility_owner: github-review-convergence
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "同一HEADのterminal success CIとexact receiptが存在し、その後のadmission-only failureがlatest runになる"
contract_postconditions: "producerとadmissionが同じlatest successful generation authorityを使い、#945 Ready E2Eが回復する"
contract_invariants: "HEAD／PR／workflow／path／attempt／success exact bindingとrequired check redを維持する"
contract_failures: "success不在、別HEAD、別PR、別workflow、newer success、invalid timestampをfail-closeする"
tdd_red_required: true
red_at: 2026-08-23T06:35:20+09:00
green_at: 2026-08-23T06:39:53+09:00
mutation_oracle_evidence: "U-GCRA-032でnon-success除外を削除するとPR #945と同型のnewer failureにより旧success receiptがstale化してred、U-GRCIGEN-001でsuccess predicateを削除するとnewer failureを選んでredになる"
complexity_effect: net_negative
complexity_justification: "CLI producerとadmission consumerの重複selectionを共有pure functionへ集約する"
removal_trigger: "GitHub workflowがreviewとReady admissionを単一generation transactionとして提供する時"
parent_design: docs/design/helix/L6-function-design/orchestration-memory.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-GCRA-032, test_path: tests/github-cross-review-admission.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-GRCIGEN-001, test_path: tests/github-review-ci-generation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-GRCIGEN-002, test_path: tests/github-review-ci-generation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-GRCIGEN-003, test_path: tests/github-review-ci-generation.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/orchestration-memory.md, oracle_id: U-CPRCONV-023, test_path: tests/claude-pr-convergence.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — deadlock事象とreopen point管理" }
  - { role: se, slot_label: "SE — shared generation selector実装" }
  - { role: qa, slot_label: "QA — failure／cancelled／new success mutation" }
  - { role: tl, slot_label: "TL — required check非緩和監査" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-65-review-generation-deadlock.md, artifact_type: markdown_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: src/runtime/github-review-ci-generation.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/github-cross-review-admission.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/github-cross-review-admission.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-review-ci-generation.test.ts, artifact_type: test_code }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-473-claude-pr-convergence.md
  requires: []
  references:
    - issue:949
    - pr:945
  blocks:
    - pr:945
review_evidence: []
---

# PLAN-RECOVERY-65: review CI generation deadlock回復

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | PR #945のrun／receipt世代を実測 | admission-only failure循環を再現 |
| 2 | latest success selector共有 | producer／consumerが同じ純関数を使用 |
| 3 | mutation／targeted回帰 | non-success除外とnew success stale化を固定 |
| 4 | #945のread-after | Ready後のCI成功と正規マージ |

## 非対象

required checkのfailure無視、admin bypass merge、review要件の緩和は行わない。
