---
plan_id: PLAN-RECOVERY-100-review-receipt-schema-boundary
title: "PLAN-RECOVERY-100: review receipt schema境界の厳格化"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1484
behavior_contract_id: REVIEW-RECEIPT-SCHEMA-BOUNDARY-001
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
contract_preconditions: "Claude v4 receipt inputへprovider-neutral fieldが混入すると、producerがunknown fieldを保存し、admissionがproperty presenceで別schemaへ誤分類する"
contract_postconditions: "producerはinput unknown fieldを拒否してcanonical fieldだけを射影し、decoderとadmissionはexact schema valueでreceipt familyを識別する"
contract_invariants: "unknown fieldをcurrent receiptへ再出力せず、Claude schemaとprovider-neutral schemaをproperty presenceで切り替えない"
contract_failures: "unknown field混入、空summary、wrong schema value、別schemaへの再解釈をfail-closeする"
tdd_red_required: true
red_test: "U-CPRCONV-040とU-GCRA-010がunknown schema fieldの保存と誤分類を検出する"
red_at: "2026-09-03T10:19:07Z"
green_at: "2026-09-03T10:21:05Z"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-03T10:21:19Zにproducerへinput spreadを再導入するとU-CPRCONV-040がextra schema_versionを検出してexit 1となった。2026-09-03T10:34:44Zには入口exact field検査全体を無効化すると同oracleがexpected throwなしでexit 1となり、検査復元後にgreenへ戻した"
complexity_effect: net_negative
complexity_justification: "曖昧なproperty-presence discriminatorとinput spreadを、exact schema valueとcanonical projectionへ収束する"
removal_trigger: "全review providerが単一のversioned discriminated unionとgenerated exact-field decoderへ移行した時"
backprop_decision: not_required
backprop_decision_reason: "既存review receipt authorityの実装Recoveryであり、新しい要求意味を追加しない"
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-CPRCONV-040, test_path: tests/claude-pr-convergence.test.ts }
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-010, test_path: tests/github-cross-review-admission.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-100-review-receipt-schema-boundary.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/runtime/claude-pr-convergence.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/github-cross-review-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/claude-pr-convergence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-cross-review-admission.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — receipt schema familyと実測failureの差分監査" }
  - { role: se, slot_label: "SE — canonical projectionとexact discriminator" }
  - { role: qa, slot_label: "QA — unknown field spreadと誤分類mutation" }
  - { role: tl, slot_label: "TL — #769 review generation authorityとの境界" }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-61-review-receipt-producer-causality.md
  requires:
    - docs/plans/PLAN-RECOVERY-61-review-receipt-producer-causality.md
  references:
    - "issue:1484"
    - "pr:1482"
  blocks: []
review_evidence: []
---

# PLAN-RECOVERY-100: review receipt schema境界の厳格化

## 目的

PR #1482で実測した、Claude receiptへのunknown field混入によるprovider-neutral schema誤分類を回復する。

## 非対象

- review generation identityやsupersession規則の変更
- historical receiptの書換え
- provider-neutral receipt schemaの再設計

## 完了条件

- [ ] U-CPRCONV-040とU-GCRA-010のRed→Greenおよびinput spread mutation killを確認する。
- [ ] typecheck、Biome、PLAN lint、targeted/full test、Claude exact-HEAD reviewがgreenになる。
- [ ] current receiptだけがReady admissionへ到達し、unknown field付きreceiptが別schemaへ誤分類されない。
