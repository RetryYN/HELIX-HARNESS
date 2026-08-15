---
plan_id: PLAN-L7-571-typed-plan-authority-failure
title: "PLAN-L7-571 (impl): typed PLAN authority読込失敗をreason付きで閉じる"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.3
  registry_source_digest: sha256:240060052c365a6c4f339bd4b634e1c8cb2a194f33e489ed36672338a91f6c8b
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #725 typed PLAN authority failure remediation"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 725
behavior_contract_id: TYPED-PLAN-AUTHORITY-FAILURE-001
responsibility_owner: typed-plan-workflow-identity
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "typed PLAN loaderがauthority読込例外をcatalog=nullへ畳み、失敗原因とlocatorを失う"
contract_postconditions: "missing／invalid／projection driftを別reasonとrepository-relative authority pathで返す"
contract_invariants: "requirements registryが唯一の意味authorityであり、canonical failureをlegacy greenで相殺しない"
contract_failures: "authority欠落、parse／schema不正、generated projection driftをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "isolated branchでfailure classifierと反例oracleを同一atomic patchとして作成したため、存在しない実装前Red時刻を捏造しない。確認前にseeded mutationを実測してkill evidenceを記録する"
mutation_oracle_evidence: "2026-08-15T19:12:20ZにENOENT分類をworkflow_identity_authority_missingからworkflow_identity_authority_invalidへ一時変異し、tests/plan-entry-routing.test.tsのU-TPWLOAD-001がexpected missing／received invalidで1 failed、他18 passed、exit 1となるkillを実測した。apply_patchで復元後、同oracle greenを再確認する"
complexity_effect: net_negative
complexity_justification: "例外握り潰しを単一typed failure classifierへ置換し、diagnostic分岐を明示する"
removal_trigger: "typed PLAN identity loaderがversioned successorへ置換された場合に同じfailure contractを移管する"
parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWLOAD-001, test_path: tests/plan-entry-routing.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed authority failure classifier" }
  - { role: qa, slot_label: "QA — missing／invalid／drift反例" }
  - { role: tl, slot_label: "TL — requirements authority fail-close境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-571-typed-plan-authority-failure.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/plan-entry-routing.ts, artifact_type: source_module }
  - { artifact_path: tests/plan-entry-routing.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  references:
    - docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
  blocks: []
---

# typed PLAN authority failure収束

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | authority load failureをtyped reasonへ分類 | [直列] | U-TPWLOAD-001 green |
| 2 | repository-relative locatorをdiagnosticへ投影 | [直列] | U-TPWLOAD-001 green |
| 3 | targeted、全回帰、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

Issue／PR／DB projectionへのfailure reason伝播は#205の後続原子的sliceとする。
