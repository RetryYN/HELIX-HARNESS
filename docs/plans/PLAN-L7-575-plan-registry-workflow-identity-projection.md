---
plan_id: PLAN-L7-575-plan-registry-workflow-identity-projection
title: "PLAN-L7-575 (impl): PLAN registryへtyped workflow identityをexact投影する"
kind: impl
layer: L7
drive: db
status: confirmed
backfill_state: complete
completion_claim_allowed: true
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #205 PLAN registry typed identity DB projection"]
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
  - { parent_design: docs/design/helix/L6-function-design/plan-registry-workflow-identity-projection.md, oracle_id: U-DBWID-006, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — PLAN identity DB projection" }
  - { role: qa, slot_label: "QA — partial tuple／legacy re-output反例" }
  - { role: tl, slot_label: "TL — requirements authority／後続episode境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T00:11:49Z"
    tests_green_at: "2026-08-16T00:11:49Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #205 PLAN registry DB projection sliceについて、requirements-owned typed identity、独立5列、all-or-none、legacy全NULL、旧分類列非投影、schema／projection、L6／L8／G3 traceを独立Codex subagentが確認した。初回reviewで検出したregistry version／digest authority drift反例欠落はU-DBWID-002aで是正され、current HEAD 45dbb743の再reviewはblocker 0。Claude Code Opus exact-HEAD独立reviewとsealed receiptはPR terminal gateとして別途必須。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/state-db.test.ts tests/l3-g3-freeze-packet-v2.test.ts --project slow tests/slow/projection-writer.test.ts && npm run typecheck && npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-16T00:11:49Z"
        evidence_path: tests/slow/projection-writer.test.ts
        output_digest: "sha256:bdb511086b993743aaf3ab3f006efd3682633341da6e227b5e67e37090dd3a1c"
        result: "3 files／78 tests passed、typecheck green、PLAN lint green、review worktree clean"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-16T00:11:49Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-16T00:11:49Z"
    evidence_digest: "sha256:2b78971efbcab7100840b3a2dc6a8be401cb23056886c4c6b6632fe5b8076475"
  entries: []
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
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/projection-writer.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-569-typed-plan-workflow-identity.md
    - docs/plans/PLAN-L7-573-github-workflow-identity-ingest.md
    - docs/plans/PLAN-REVERSE-559-github-typed-workflow-identity-projection-backfill.md
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
| 4 | Claude Code Opusによるcurrent HEAD独立レビュー | [review] | blocker 0 |

current-location、execution episode、right-arm evidenceは#205の後続原子的PRへ分離する。
