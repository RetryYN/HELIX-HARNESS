---
plan_id: PLAN-L7-575-plan-registry-workflow-identity-projection
title: "PLAN-L7-575 (impl): PLAN registryへtyped workflow identityをexact投影する"
kind: impl
layer: L7
drive: db
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.3
  registry_source_digest: sha256:240060052c365a6c4f339bd4b634e1c8cb2a194f33e489ed36672338a91f6c8b
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["issue:205 PLAN registry typed identity DB projection"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 205
behavior_contract_id: PLAN-REGISTRY-WORKFLOW-IDENTITY-PROJECTION-001
responsibility_owner: state-db-projection-writer
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN workflow_identityはfrontmatterでtyped化済みだが、plan_registryがidentityを投影せずDB consumerが旧分類へ戻り得る"
contract_postconditions: "PLAN sourceのtyped identity exact tupleをplan_registryの独立5列へatomicかつdeterministicに投影する"
contract_invariants: "requirementsとPLAN sourceがauthorityであり、legacy identityをcurrent DBへ再出力しない"
contract_failures: "部分tuple、schema不正、余分fieldをidentityなしへ丸めずDB rebuildをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "isolated worktreeでschema・projection・oracleを同一atomic patchとして実装し、confirm前にtargetedと全projection回帰を実行する"
mutation_oracle_evidence: "2026-08-15T22:25:01Zにunknown identity拒否条件を!entities.someからentities.someへ一時反転し、U-DBWID-002bがexpected throw／received undefinedで1 failed、33 skipped、exit 1となるkillを実測した。apply_patchで復元後に同oracle greenを再確認する"
complexity_effect: justified_positive
complexity_justification: "既存PLAN parserとplan_registry rowへ5列を追加し、別DB identity tableや重複resolverを増やさない"
removal_trigger: "PLAN workflow identity schema major version更新時にversioned successorへ移管する"
parent_design: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md
pair_artifact: docs/test-design/helix/L8-plan-registry-workflow-identity-projection-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md, oracle_id: U-DBWID-001, test_path: tests/slow/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md, oracle_id: U-DBWID-002, test_path: tests/slow/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md, oracle_id: U-DBWID-003, test_path: tests/slow/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md, oracle_id: U-DBWID-004, test_path: tests/state-db.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md, oracle_id: U-DBWID-005, test_path: tests/slow/projection-writer.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — PLAN identity DB projection" }
  - { role: qa, slot_label: "QA — partial tuple／legacy re-output反例" }
  - { role: tl, slot_label: "TL — requirements authority／後続episode境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-plan-registry-workflow-identity-projection-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/harness-db-tables-core.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/schema-authority.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/projection-writer.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
    - docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md
  references:
    - docs/plans/PLAN-L7-572-typed-plan-signal-identity-consistency.md
  blocks: []
---

# PLAN registry typed workflow identity投影

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | requirementsとL6/L8 pairを確定 | [直列] | 5 oracleがexact trace |
| 2 | schema v42とprojectionを実装 | [直列] | U-DBWID-001..005 green |
| 3 | migration／全projection／DB convergence | [直列] | regression green |
| 4 | Claude Code Opus exact-HEAD review | [review] | blocker 0 |

current-location、execution episode、right-arm evidenceは#205の後続原子的PRへ分離する。
