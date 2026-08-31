---
plan_id: PLAN-RECOVERY-73-requirement-material-receipt-ancestry
title: "PLAN-RECOVERY-73: frozen baseline material receiptのancestor接続を復旧する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-08-31
updated: 2026-08-31
owner: Codex / TL
github_issue_id: 1283
behavior_contract_id: REQUIREMENT-MATERIAL-RECEIPT-ANCESTRY-001
responsibility_owner: requirement-json-authority
change_slice: atomic
refactor_step: modify
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: policy
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:current main scheduled harness-checkでrequirement-authorityのmaterial receipt非ancestorを検出"
contract_preconditions: "L4正本はG3 material commit 434ef587とroot digestを二面固定し、Git環境ではcurrent HEAD ancestorを要求する"
contract_postconditions: "固定material commitを加法的merge parentとしてmain履歴へ接続し、到達性、ancestor、manifest、digest failureを個別に返す"
contract_invariants: "固定HEAD／digestを緩めず、履歴を書き換えず、非ancestorをunreachableへ誤分類しない"
contract_failures: "object欠落、non-ancestor、manifest欠落、invalid JSON、digest drift、material parent未接続をfail-closeする"
tdd_red_required: true
red_at: "2026-08-31T23:08:56+09:00"
green_at: "2026-08-31T23:16:20+09:00"
tdd_red_evidence: "tests/requirement-authority.test.ts U-RAC-009を先行し、helper欠落でTypeError、current repoの非ancestorをU-RAC-001が検出して2 failed／9 passedとなった"
tdd_green_evidence: "tests/requirement-authority.test.ts、tests/requirements-binding-config.test.ts、tests/design-language.test.tsは28 passed。typecheck、PLAN lint、checkRequirementsBindingConfigもgreenで、material HEAD 434ef587がcurrent candidate HEADのancestorになった"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/requirement-authority.test.ts U-RAC-009でmaterial objectをzero SHA、unrelated commit、manifest削除、wrong root digestへ個別mutationし、固有finding不一致でredへ戻す"
complexity_effect: net_negative
complexity_justification: "一括catchを四段の明示判定へ分離し、曖昧なunreachable findingとscheduled再調査を除去する"
removal_trigger: "Requirement IR authorityがGit外の署名済みimmutable receiptへ移行し、Git ancestor契約を正式廃止した時"
parent_design: docs/design/helix/L4-basic-design/requirement-refinement-authority.md
pair_artifact: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-RECOVERY-12-requirement-refinement-authority.md
  requires:
    - docs/plans/PLAN-RECOVERY-12-requirement-refinement-authority.md
  references:
    - "issue:1283"
    - "run:33379730532"
    - "run:33380128253"
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L4-basic-design/requirement-refinement-authority.md, oracle_id: U-RAC-009, test_path: tests/requirement-authority.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-73-requirement-material-receipt-ancestry.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/helix/L4-basic-design/requirement-refinement-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/requirements/requirement-authority-gate.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — scheduled main failureの原因分離とForward再合流判定" }
  - { role: qa, slot_label: "QA — Git topologyとreceipt failure taxonomy" }
  - { role: tl, slot_label: "TL — fixed baseline authorityと加法的履歴接続" }
---

# frozen baseline material receiptのancestor接続Recovery

## §工程表

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | non-ancestorと一括catchをRed固定 | 直列 | U-RAC-001／009 red |
| 2 | typed failure判定へ分離 | 直列 | object／ancestor／manifest／digestを個別検出 |
| 3 | fixed material commitを加法的merge parentへ接続 | 直列 | `merge-base --is-ancestor` green |
| 4 | CI、独立review、main read-after | 直列 | scheduled main gate再実行までgreen |

本Recoveryは固定material HEADやroot digestを更新しない。L4正本どおり、既存G3 material commitを
current historyへ追加parentとして接続し、baseline provenanceを現在のmainから機械的に辿れる状態へ戻す。
