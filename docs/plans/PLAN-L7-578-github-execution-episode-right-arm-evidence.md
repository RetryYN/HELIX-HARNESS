---
plan_id: PLAN-L7-578-github-execution-episode-right-arm-evidence
title: "PLAN-L7-578 (impl): right-arm evidenceをexecution episodeへexact束縛する"
kind: impl
layer: L7
drive: db
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.3
  registry_source_digest: sha256:240060052c365a6c4f339bd4b634e1c8cb2a194f33e489ed36672338a91f6c8b
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #205 right-arm evidence binding"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 205
behavior_contract_id: GITHUB-EXECUTION-EPISODE-RIGHT-ARM-001
responsibility_owner: github-execution-episode-right-arm-evidence
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: aggregate
contract_preconditions: "episode state/current-locationは存在するが、right-arm evidenceを同一episode／HEADへexact束縛する台帳がない"
contract_postconditions: "G8〜G12 evidenceをappend-only recordとしてcurrent episode identityへexact束縛する"
contract_invariants: "requirementsとcurrent episode projectionがauthorityであり、legacy／prose／branchからidentityを補完しない"
contract_failures: "別episode、旧HEAD、旧owner、別contract／workflow identity、同一ID改変、unsafe artifact pathをfail-closeする"
tdd_red_required: true
tdd_red_waiver_reason: null
red_at: "2026-08-16T03:08:00Z"
green_at: "2026-08-16T03:30:11Z"
mutation_oracle_evidence: "2026-08-16T03:29:57ZにGATE_ID_PATTERNへG13を一時追加し、U-GHEPRE-004が1 failed／5 passed、exit 1となるkillを実測した。正規G8〜G12へ復元後6 passedを再確認した"
complexity_effect: justified_positive
complexity_justification: "terminal evidenceへ可変verification payloadを混載せず、append-only台帳一表へ正規化する"
removal_trigger: "execution episode schema major version更新時にversioned successorへ移管する"
parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md
pair_artifact: docs/test-design/helix/L8-github-execution-episode-right-arm-evidence-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md, oracle_id: U-GHEPRE-001, test_path: tests/github-execution-episode-right-arm.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md, oracle_id: U-GHEPRE-002, test_path: tests/github-execution-episode-right-arm.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md, oracle_id: U-GHEPRE-003, test_path: tests/github-execution-episode-right-arm.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md, oracle_id: U-GHEPRE-004, test_path: tests/github-execution-episode-right-arm.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md, oracle_id: U-GHEPRE-005, test_path: tests/state-db-schema-authority.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — append-only evidence transaction" }
  - { role: qa, slot_label: "QA — stale identity／immutable negative oracle" }
  - { role: tl, slot_label: "TL — requirements／closure責務境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T03:29:20Z"
    tests_green_at: "2026-08-16T03:29:20Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #205 right-arm evidence deltaを独立reviewした。初回blocker 2件／high 1件と再review high 1件を是正し、final blocker／high 0。replayを含む全受理経路のtransaction内current episode再照合、append-only trigger、stored digest再計算、全workflow tuple／G8-G12／path／cross-connection反例を確認した。current exact-HEAD freshnessはPRのClaude Code sealed receiptで別途束縛する。"
    green_commands:
      - kind: unit_test
        command: "npm run typecheck && npx vitest run tests/github-execution-episode-right-arm.test.ts tests/github-execution-episode-state.test.ts tests/github-execution-episode-location.test.ts tests/state-db-schema-authority.test.ts tests/projection-writer.test.ts tests/digest.test.ts tests/review-evidence.test.ts tests/left-arm-carry-log.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-16T03:29:20Z"
        evidence_path: tests/github-execution-episode-right-arm.test.ts
        output_digest: "sha256:958c7957fef1ae38f5d158331ddc3c111ab66d187d16f4b7921c4cbeeb9f3548"
        result: "8 files／87 tests green、typecheck／schema authority／digest authority／PLAN governance green、G3 semantic 26/27 dirty-only、final review blocker／high 0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-16T03:29:20Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-16T03:29:20Z"
    evidence_digest: "sha256:774eb65910c21f666f976d477c766ac7c591f0cb49efe062c51b7c5506ddccf7"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-execution-episode-right-arm-evidence-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: design_doc }
  - { artifact_path: src/schema/harness-db-tables-core.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/github-execution-episode-right-arm.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/migration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/schema-authority.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/github-execution-episode-right-arm.test.ts, artifact_type: test_code }
  - { artifact_path: tests/state-db-schema-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/digest.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md
  references:
    - docs/plans/PLAN-L7-576-github-execution-episode-state.md
  blocks: []
---

# Execution episode right-arm evidence束縛

## TDD Red証跡

2026-08-16T03:08:00Z、schema authority targeted testで新table／indexによりpinned DDL digestと
SQLite object digestが不一致となる2 failureを確認した。digest更新前のRedとして固定する。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | GH-FR-023／GH-AC-021をrequirementsへ追加 | [直列] | authority current |
| 2 | exact binding／immutable retryのRed oracle | [直列] | expected failure記録 |
| 3 | schema／admission transactionを実装 | [直列] | U-GHEPRE-001..004 green |
| 4 | schema authority／pair／freezeを収束 | [直列] | U-GHEPRE-005 green |
| 5 | 独立reviewとClaude exact-HEAD gate | [review] | blocker 0 |

evidence生成runnerとterminal closure policyは本sliceへ混載しない。
