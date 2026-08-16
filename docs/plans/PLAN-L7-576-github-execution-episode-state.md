---
plan_id: PLAN-L7-576-github-execution-episode-state
title: "PLAN-L7-576 (impl): GitHub execution episode状態をDB正本化する"
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
entry_signals: ["po_directive:Issue #205 execution episode／current-location projection"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 205
behavior_contract_id: GITHUB-EXECUTION-EPISODE-STATE-001
responsibility_owner: github-execution-episode-state
engineering_discipline_required: true
change_slice: atomic
refactor_step: extract_contract
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: entity
contract_preconditions: "workflow identityはIssue／PLAN／PRへ投影済みだが、同じworkを束縛するexecution episode event／outbox／projectionが存在しない"
contract_postconditions: "episode event、transactional outbox、current projectionが単一transactionとreplayでexactly onceに収束する"
contract_invariants: "workflow identityとepisode identityを分離し、resource identityを差替えず、legacy identityをcurrent projectionへ出さない"
contract_failures: "identity欠落、順序飛越し、stale revision、resource差替え、idempotency conflict、partial write、terminal再利用、replay driftを別reasonで閉じる"
tdd_red_required: true
tdd_red_waiver_reason: null
mutation_oracle_evidence: "2026-08-16T00:55:42ZにNEXT_STATE.admittedをplannedからpr_openへ一時変異し、U-GHEP-002／003／006が3 failed・5 passed、exit 1となるkillを実測した。apply_patchで復元後greenを再確認する"
complexity_effect: justified_positive
complexity_justification: "proseと複数surfaceへ散在するwork lifecycleを一つのepisode reducerとtransactional projectionへ集約する"
removal_trigger: "execution episode schema major version更新時にversioned successorへ移管する"
parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md
pair_artifact: docs/test-design/helix/L8-github-execution-episode-state-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-001, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-002, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-003, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-004, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-005, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-006, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-007, test_path: tests/github-execution-episode-state.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-state.md, oracle_id: U-GHEP-008, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — episode reducer／transaction" }
  - { role: qa, slot_label: "QA — replay／fault／conflict oracle" }
  - { role: tl, slot_label: "TL — requirements／DB authority境界" }
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-576-github-execution-episode-state.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-execution-episode-state.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/github-merge-admission-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-github-execution-episode-state-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/harness-db-tables-core.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/github-execution-episode.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/schema-authority.ts, artifact_type: source_module }
  - { artifact_path: tests/github-execution-episode-state.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db-schema-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md
  references:
    - docs/plans/PLAN-L7-574-github-workflow-identity-admission.md
  blocks: []
---

# GitHub execution episode状態

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | GH-FR-021／022とGH-AC-019／020をL3/L10へ追加 | [直列] | requirements pair current |
| 2 | reducerのRed oracleを実装 | [直列] | expected failureを記録 |
| 3 | event／outbox／projection schemaとtransactionを実装 | [直列] | U-GHEP-001..007 green |
| 4 | schema／pair／G3 digestを収束 | [直列] | U-GHEP-008 green |
| 5 | Claude Code Opus exact-HEAD独立review | [review] | blocker 0 |

current-location、right-arm evidence、terminal closure workerは後続の#205原子的sliceで接続する。

## TDD Red証跡

2026-08-16T00:44:25Z、実装moduleが存在しない状態で
`vitest run --project fast tests/github-execution-episode-state.test.ts`を実行し、module resolution error、
test file 1 failed、test 0件、exit 1を確認した。実装後のgreenと混同しない。
