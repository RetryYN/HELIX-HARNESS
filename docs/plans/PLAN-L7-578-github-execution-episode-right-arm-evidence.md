---
plan_id: PLAN-L7-578-github-execution-episode-right-arm-evidence
title: "PLAN-L7-578 (impl): right-arm evidenceをexecution episodeへexact束縛する"
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
mutation_oracle_evidence: "2026-08-16T03:29:57ZにGATE_ID_PATTERNへG13を一時追加し、tests/github-execution-episode-right-arm.test.tsのU-GHEPRE-004が1 failed／5 passed、exit 1となるkillを実測した。正規G8〜G12へ復元後6 passedを再確認した"
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
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md, oracle_id: U-GHEPRE-005, test_path: tests/github-execution-episode-right-arm.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md, oracle_id: U-GHEPRE-006, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md, oracle_id: U-GHEPRE-007, test_path: tests/l12-hybrid-recognition.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — append-only evidence transaction" }
  - { role: qa, slot_label: "QA — stale identity／immutable negative oracle" }
  - { role: tl, slot_label: "TL — requirements／closure責務境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T04:15:12Z"
    tests_green_at: "2026-08-16T04:15:12Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #205 right-arm evidence deltaとCI self-heal差分を独立reviewした。初回実装reviewのblocker 2件／high 1件、再review high 1件、およびfull CI後のPLAN binding review blocker 1件／medium 2件を是正し、final blocker／high／medium 0。transaction内current episode再照合、append-only trigger、stored digest再計算、全workflow tuple／G8-G12／path／cross-connection反例、U-GHEPRE-001..007のL6/L8/PLAN/test citation、recognition digest、G3 freeze pinを確認した。current exact-HEAD freshnessはPRのClaude Code sealed receiptで別途束縛する。"
    green_commands:
      - kind: unit_test
        command: "npx vitest run --project fast tests/github-execution-episode-right-arm.test.ts tests/l12-hybrid-recognition.test.ts tests/ddd-tdd-rules.test.ts tests/design-language.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/fe-roster-orchestration.test.ts && npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-16T04:15:12Z"
        evidence_path: tests/github-execution-episode-right-arm.test.ts
        output_digest: "sha256:387b8957495611a8f8a8cdb4c4e18a08b55a7e4a6cfae2cc02b1bb071d688265"
        result: "6 files／81 tests green、PLAN lint全gate green、G3は27/28でworkspace cleanだけdirty-only、final review blocker／high／medium 0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-16T04:15:12Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-16T04:15:12Z"
    evidence_digest: "sha256:6ed68885882842c094ec114afec2b75f3d3caba7591e9a419e2722faad5f7d65"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-578-github-execution-episode-right-arm-evidence.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-execution-episode-right-arm-evidence.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-execution-episode-right-arm-evidence-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-test-owner-disposition-recognition.json, artifact_type: config }
  - { artifact_path: src/schema/harness-db-tables-core.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/github-execution-episode-right-arm.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/migration.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/schema-authority.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/github-execution-episode-right-arm.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md
    - docs/plans/PLAN-REVERSE-559-github-typed-workflow-identity-projection-backfill.md
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
