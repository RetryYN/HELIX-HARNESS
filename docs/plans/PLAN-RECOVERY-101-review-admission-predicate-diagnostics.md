---
plan_id: PLAN-RECOVERY-101-review-admission-predicate-diagnostics
title: "PLAN-RECOVERY-101: review admission失敗predicateの型付き診断"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1486
behavior_contract_id: REVIEW-ADMISSION-PREDICATE-DIAGNOSTICS-001
responsibility_owner: github-cross-review-admission
engineering_discipline_required: true
change_slice: atomic
refactor_step: separate_responsibility
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
contract_preconditions: "invalid receipt候補のschema、identity、CI、DB、時系列predicateが単一のgeneric reasonへ畳み込まれ、原因特定に手動評価を要する"
contract_postconditions: "候補ごとの最初の失敗predicateを安定したtyped reasonとcomment URLへ射影し、valid exactly-one規則を維持する"
contract_invariants: "診断へreceipt本文、secret、provider sessionを出力せず、valid候補の受理条件とconflict規則を緩和しない"
contract_failures: "reason取り違え、generic reasonだけへの退行、invalid候補によるvalid候補の相殺、機微値の診断流出をfail-closeする"
tdd_red_required: true
red_test: "U-GCRA-012がDB provenance不一致とwrong schemaをgeneric reasonから区別できずRedになった"
red_at: "2026-09-03T10:58:48Z"
green_at: "2026-09-03T10:59:46Z"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-03T10:58:48ZにDB provenance failureをschema failureへ取り違えるmutationを入れるとU-GCRA-012がexit 1となり、正しいtyped reason復元後にgreenへ戻した"
complexity_effect: net_negative
complexity_justification: "巨大なboolean filterを順序付きpredicate evaluatorへ分解し、同じ受理条件を診断可能な値へする"
removal_trigger: "review admission全体がgenerated predicate registryと共通Claim Substance verifierへ移行した時"
backprop_decision: not_required
backprop_decision_reason: "既存review admission契約の観測可能性Recoveryであり、新しい要求意味や受理条件を追加しない"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-012, test_path: tests/github-cross-review-admission.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-101-review-admission-predicate-diagnostics.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/runtime/github-cross-review-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/github-cross-review-admission.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — generic failure familyと実測predicateの棚卸し" }
  - { role: se, slot_label: "SE — typed predicate evaluatorと安全な診断projection" }
  - { role: qa, slot_label: "QA — reason取り違えとgeneric退行mutation" }
  - { role: tl, slot_label: "TL — #1484 schema境界と#1487 correction generationの責務分離" }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-100-review-receipt-schema-boundary.md
  requires:
    - docs/plans/PLAN-RECOVERY-100-review-receipt-schema-boundary.md
  references:
    - "issue:1486"
    - "issue:1484"
  blocks: []
review_evidence: []
---

# PLAN-RECOVERY-101: review admission失敗predicateの型付き診断

## 目的

review receipt候補の不受理理由をtyped predicateへ分解し、受理規則を緩和せずRecoveryの診断可能性を上げる。

## 非対象

- receipt schemaの変更
- verdictの再判断
- malformed receiptの訂正世代生成（Issue #1487）

## 完了条件

- [ ] U-GCRA-012のRed→Greenとreason退行mutationを確認する。
- [ ] targeted/full test、typecheck、Biome、PLAN lint、Claude exact-HEAD reviewがgreenになる。
- [ ] current outputでcandidateごとのtyped reasonを返し、receipt本文やsecretを出力しない。
