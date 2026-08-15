---
plan_id: PLAN-L7-572-typed-plan-signal-identity-consistency
title: "PLAN-L7-572 (impl): typed PLAN signalとidentityを直交照合する"
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
entry_signals: ["po_directive:Issue #726 typed PLAN signal identity consistency"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 726
behavior_contract_id: TYPED-PLAN-SIGNAL-IDENTITY-CONSISTENCY-001
responsibility_owner: typed-plan-workflow-identity
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "entry signalがDB sourceへ解決済みであり、current catalogとPLAN typed tupleがvalidである"
contract_postconditions: "canonical tokenとtyped tupleを別軸のままexact照合し、一致だけを受理する"
contract_invariants: "PLAN kind、specialist drive、workflow identityを同一enumへ畳み込まず、po_directiveからidentityを推測しない"
contract_failures: "矛盾、unknown、decision待ち、ambiguityを別reasonでfail-closeし、legacy mode greenで相殺しない"
tdd_red_required: false
tdd_red_waiver_reason: "isolated stacked branchでexact token resolverとoracleを同一atomic patchとして作成したため、存在しない実装前Red時刻を捏造しない。confirm前にseeded mutation killを実測する"
mutation_oracle_evidence: "2026-08-15T19:33:59Zにaxis／ID不一致判定をORからANDへ一時変異し、tests/plan-entry-routing.test.tsのU-TPWSIG-002がexpected mismatch／received emptyで1 failed、他22 passed、exit 1となるkillを実測した。apply_patchで復元後、同oracle greenを再確認する"
complexity_effect: net_negative
complexity_justification: "typed PLANでskipされていたsignal整合をrequirements-owned catalog lookupへ統合し、旧mode kind比較への依存を増やさない"
removal_trigger: "typed PLAN entry admissionがversioned successorへ置換された時に同じsignal binding契約を移管する"
parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWSIG-001, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWSIG-002, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWSIG-003, test_path: tests/plan-entry-routing.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, oracle_id: U-TPWSIG-004, test_path: tests/plan-entry-routing.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — exact typed signal binding" }
  - { role: qa, slot_label: "QA — mismatch／unknown／decision／ambiguity反例" }
  - { role: tl, slot_label: "TL — requirements authorityと軸分離境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-572-typed-plan-signal-identity-consistency.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-typed-plan-workflow-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/workflow-classification-catalog.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-entry-routing.ts, artifact_type: source_module }
  - { artifact_path: tests/plan-entry-routing.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-571-typed-plan-authority-failure.md
  references:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
  blocks: []
---

# typed PLAN signal／identity整合

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | canonical signal tokenのexact resolverを追加 | [直列] | U-TPWSIG-001／003 green |
| 2 | PLAN tupleとの直交照合をgateへ接続 | [直列] | U-TPWSIG-002／004 green |
| 3 | targeted、全回帰、doctor | [直列] | 同一HEAD green |
| 4 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

Issue／PR／DB projectionへのtyped identity投影は#205の後続原子的sliceとする。
