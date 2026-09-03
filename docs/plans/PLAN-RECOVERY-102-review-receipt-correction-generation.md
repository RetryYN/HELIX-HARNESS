---
plan_id: PLAN-RECOVERY-102-review-receipt-correction-generation
title: "PLAN-RECOVERY-102: malformed review receiptの訂正世代"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1487
behavior_contract_id: REVIEW-RECEIPT-CORRECTION-001
responsibility_owner: github-cross-review-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "同一generationのimmutable receipt slotがmalformedだと、正しいreviewを再sealできず手動退避が必要になる"
contract_postconditions: "malformed bytesを保持し、prior byte digestと同一PR／HEAD／reviewer／CI generationへ束縛した訂正authorizationとcorrected receiptを別slotへexactly-onceでsealする"
contract_invariants: "valid slot、過去comment、malformed bytesを上書きせず、訂正理由・authorization・corrected receipt・GitHub comment・logical DB digestをexact joinする"
contract_failures: "missing／valid target、別identity、unknown reason、authorization改変、部分write、既存訂正への重複commentをfail-closeする"
tdd_red_required: true
red_test: "U-CPRCONV-041とU-CPRCONV-042が訂正API不在、valid slot上書き、異内容訂正を検出してRedになった"
red_at: "2026-09-03T11:08:52Z"
green_at: "2026-09-03T11:26:42Z"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/claude-pr-convergence.test.ts U-CPRCONV-041で、2026-09-03T11:27:03Zにauthorization reason allowlist検査だけを除去し、unknown reasonへcorrection_idも再計算した反例を投入するとexpected nullに対してreceiptが返りRed／failed／exit 1となった。検査復元後にgreenへ戻した"
complexity_effect: net_negative
complexity_justification: "手動spool退避を廃止し、既存receipt persistence内へtyped correction authorizationと単一current selectorを閉じ込める"
removal_trigger: "全review receiptが共通append-only generation ledgerとgenerated correction schemaへ移行した時"
backprop_decision: not_required
backprop_decision_reason: "既存review receiptの障害回復経路であり、新しい要求意味やreview判断を追加しない"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-002, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-041, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-042, test_path: tests/claude-pr-convergence.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-102-review-receipt-correction-generation.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — malformed immutable slotと手動退避事故の実測" }
  - { role: se, slot_label: "SE — correction authorizationとcurrent selector" }
  - { role: qa, slot_label: "QA — valid overwrite、tamper、duplicate comment mutation" }
  - { role: tl, slot_label: "TL — #1484/#1486とのschema・診断責務分離" }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-101-review-admission-predicate-diagnostics.md
  requires:
    - docs/plans/PLAN-RECOVERY-101-review-admission-predicate-diagnostics.md
  references:
    - "issue:1487"
    - "issue:1484"
    - "issue:1486"
    - "issue:769"
  blocks: []
review_evidence: []
---

# PLAN-RECOVERY-102: malformed review receiptの訂正世代

## 目的

malformedなimmutable receiptを履歴として保持したまま、同じreview generationを正規の訂正証拠へ収束させる。

## 非対象

- review内容・verdictの再判断
- valid receiptまたはGitHub commentの変更・削除
- receipt schema unknown field境界とadmission診断の再設計

## 完了条件

- [ ] U-CPRCONV-041／042のRed→Greenとauthorization tamper mutation killを確認する。
- [ ] CLIが訂正済みslotへの二重commentを投稿前に拒否する。
- [ ] targeted/full test、typecheck、Biome、PLAN lint、Claude exact-HEAD reviewがgreenになる。
- [ ] malformed bytes、authorization、corrected receipt、GitHub comment、logical DB digestのexact joinをread-afterする。
