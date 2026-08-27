---
plan_id: PLAN-L7-692-workflow-output-consumer-inventory
title: "PLAN-L7-692: workflow output consumerの旧model fieldをexact inventory化する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1119 current output legacy field inventory"
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1119
behavior_contract_id: WORKFLOW-OUTPUT-CONSUMER-INVENTORY-001
responsibility_owner: workflow-output-consumer-inventory
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "requirements v1.3と#204/#206がtyped workflow identityとlegacy input-only境界を既に所有する。本sliceは未分類consumerをexact inventoryへ投影し、意味要件を重複追加しない。"
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "current mainの6 runtime／CLI／schema／DB／visualization sourceとlegacy field exact setが読める"
contract_postconditions: "各path＋field tokenの実出現数、disposition、owner、producer、consumer、successorが一意に照合される"
contract_invariants: "文字列hitを意味判定へ直結せず、provider model語彙をworkflow identityへ畳み込まず、unknownを推測しない"
contract_failures: "source drift、未分類、重複、unknown disposition、owner／producer／consumer／successor欠落をfail-closeする"
tdd_red_required: true
red_test: "U-WFOCI-001..004を先行追加し、inventory未存在／count drift／duplicate／unknown dispositionでRedを確認する"
red_at: "2026-08-28T06:43:19+09:00"
green_at: "2026-08-28T06:47:52+09:00"
mutation_oracle_evidence: "2026-08-28T06:48:00+09:00にconfig/workflow-output-consumer-inventory.jsonのsrc/cli.ts:selected_model expected_occurrencesを32から31へseedし、tests/workflow-output-consumer-inventory.test.tsのU-WFOCI-002がactual 32との差を検出して1 fail／3 passとなった。値を32へ戻し、同一oracleを再green化する。"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-27T23:11:37Z"
    tests_green_at: "2026-08-27T23:05:54Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: c18c830c-b048-4a74-8821-23282016d4db
    reviewed_head_sha: 7e357d6ed15d6701569d6029dbeb2a585c074f1f
    scope: "PR #1122 exact HEAD 7e357d6ed15d6701569d6029dbeb2a585c074f1fをClaude Codeが独立検収し、6 surface x 7 token、22 entry、152 occurrence、producer symbol、disposition allowlist、5 suite 126 testsを確認して内容blocker 0 approveとした。PLAN draftとPR draftはmerge readiness blockerとして本commitで解消する。review: https://github.com/RetryYN/HELIX-HARNESS/pull/1122#issuecomment-5446313108"
    green_commands:
      - kind: smoke
        command: "gh run view 33123541390 --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-27T23:05:54Z"
        evidence_path: tests/workflow-output-consumer-inventory.test.ts
        output_digest: "sha256:258f98016ec5d61854d2bf1439729bcd2cd1a36b683724389f2a8fc36291bb22"
        result: "terminal success / HEAD 7e357d6ed15d6701569d6029dbeb2a585c074f1f / all required lanes green"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-27T23:11:37Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-27T23:11:37Z"
    evidence_digest: "sha256:9a743d2985c16ee7056972e549a8f01c22b86d9289bddf87f6a736d968e0eb43"
  entries: []
complexity_effect: justified_positive
complexity_justification: "既存sourceを変更せずmachine-readable台帳と単一oracleで後続migration scopeを固定する"
removal_trigger: "#206の全successor migrationがmain到達し、legacy workflow output fieldのcurrent consumerが0になった時"
parent_design: docs/design/helix/L6-function-design/workflow-output-consumer-inventory.md
pair_artifact: docs/test-design/harness/L8-workflow-output-consumer-inventory.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-output-consumer-inventory.md, oracle_id: U-WFOCI-001, test_path: tests/workflow-output-consumer-inventory.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-output-consumer-inventory.md, oracle_id: U-WFOCI-002, test_path: tests/workflow-output-consumer-inventory.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-output-consumer-inventory.md, oracle_id: U-WFOCI-003, test_path: tests/workflow-output-consumer-inventory.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-output-consumer-inventory.md, oracle_id: U-WFOCI-004, test_path: tests/workflow-output-consumer-inventory.test.ts }
dependencies:
  parent: PLAN-L7-482-drive-model-closure
  requires:
    - docs/plans/PLAN-L7-482-drive-model-closure.md
  blocks: []
  references:
    - "issue:1119"
    - "issue:206"
    - "issue:204"
agent_slots:
  - { role: aim, slot_label: "AIM — #204/#206 current output境界とsuccessor責務を監査" }
  - { role: qa, slot_label: "QA — surface×token閉包とcount drift mutation" }
  - { role: tl, slot_label: "TL — workflow identityとprovider model語彙の分離" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-692-workflow-output-consumer-inventory.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-output-consumer-inventory.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-workflow-output-consumer-inventory.md, artifact_type: test_design }
  - { artifact_path: config/workflow-output-consumer-inventory.json, artifact_type: json_config }
  - { artifact_path: tests/workflow-output-consumer-inventory.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/design-coverage.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
---

# PLAN-L7-692: workflow output consumer棚卸し

## 目的

#204/#206のcurrent typed identity収束を、raw token件数ではなくproducer／consumer責務に束縛した
machine-readable inventoryから進める。初期6 surfaceをexact固定し、後続schema／DB／CLI／visualization
migrationを原子的に分割できる状態にする。

## 非対象

本sliceではruntime fieldのrename／delete、旧値期待値の緩和、#188／#635／#659の実装を行わない。
