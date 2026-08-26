---
plan_id: PLAN-L7-686-atomic-contract-id-authority
title: "PLAN-L7-686 (fix): atomic contract ID segment authorityを共有parserへ統一する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "po_directive:Issue #1088 atomic contract ID validator segment authority drift"
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
github_issue_id: 1088
behavior_contract_id: ATOMIC-CONTRACT-ID-AUTHORITY-001
responsibility_owner: atomic-contract-id-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
backprop_decision: required
backprop_decision_reason: "L3正本がID文法を未定義のままconsumer regexが6／8 segmentへ分岐していたため、GH-AC-043を追加する"
contract_preconditions: "PR／atomic slice／Issue closureがbehavior contract IDを独立regexで判定している"
contract_postconditions: "L3正本の2〜6 segment文法を共有parserへ投影し、全consumerが同じaccept／reject集合を返す"
contract_invariants: "既存の正規2〜6 segment ID、exactly-one behavior、owner、receipt照合の意味を変更しない"
contract_failures: "7／8 segmentまたは不正文法を一つのsurfaceだけが受理する、あるいは正規6 segmentを拒否する"
tdd_red_required: true
red_test: "U-ATOMIC-ID-002でIssue closureの7 segment受理を再現し、共有parser切替前にredとする"
mutation_oracle_evidence: "2026-08-27T04:47:09+09:00に共有parserの上限を6から8 segmentへ一時拡張し、U-ATOMIC-ID-002とU-ICGRAPH-006が7 segment受理を検出して2 failed／exit 1となるkillを実測した。apply_patchで上限6へ復元し、targeted 53 tests greenを再確認する"
complexity_effect: net_negative
complexity_justification: "3 consumerの重複regexを共有value-object parser 1件へ縮約し、新しいstate／DB／I/Oを追加しない"
removal_trigger: "behavior contract ID schemaのversion-upで新しいrequirements-owned parserへatomic migrationする時"
parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md
pair_artifact: docs/test-design/helix/L8-atomic-slice-admission-runtime-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-ID-001, test_path: tests/atomic-contract-id.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/atomic-slice-admission.md, oracle_id: U-ATOMIC-ID-002, test_path: tests/atomic-contract-id.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-686-atomic-contract-id-authority.md, artifact_type: markdown_doc }
  - { artifact_path: src/schema/atomic-contract-id.ts, artifact_type: source_module }
  - { artifact_path: tests/atomic-contract-id.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/helix/L3-requirements/github-atomic-development-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/atomic-slice-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-atomic-slice-admission-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/github-guards.ts, artifact_type: source_module }
  - { artifact_path: src/lint/issue-closure-graph.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/atomic-slice-admission.ts, artifact_type: source_module }
  - { artifact_path: tests/issue-closure-graph.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-494-atomic-slice-admission.md
  requires:
    - docs/plans/PLAN-L7-494-atomic-slice-admission.md
    - docs/design/helix/L3-requirements/github-atomic-development-requirements.md
  references:
    - issue:1088
  blocks: []
agent_slots:
  - { role: se, slot_label: "SE — shared parser／consumer migration" }
  - { role: qa, slot_label: "QA — 6／7／8 segment boundary mutation oracle" }
  - { role: tl, slot_label: "TL — requirements／PR／Issue closure exact-set監査" }
---

# PLAN-L7-686: atomic contract ID authority統一

## 目的

正本に文法を追加し、最大6 segmentと8 segmentへ分岐しているconsumerを共有parserへ収束させる。
値の推測補正やlegacy outputは追加しない。

## 検証

1. 2 segmentと6 segmentの境界値を受理する。
2. 7／8 segment、小文字、空segment、連続hyphen、空白、underscoreを拒否する。
3. PR scope、atomic slice runtime、Issue closureが同じ共有parserを呼ぶ。
4. targeted suite、typecheck、PLAN lint、doctorをcurrent HEADで実行する。

## 非対象

一般purpose contract ID、semantic contract、tool contract、既存IDの一括renameは変更しない。
