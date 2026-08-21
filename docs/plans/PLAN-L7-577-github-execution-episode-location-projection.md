---
plan_id: PLAN-L7-577-github-execution-episode-location-projection
title: "PLAN-L7-577 (impl): execution episodeをcurrent-locationへ多重度保持で投影する"
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
entry_signals: ["po_directive:Issue #205 execution episode current-location projection"]
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 205
behavior_contract_id: GITHUB-EXECUTION-EPISODE-LOCATION-001
responsibility_owner: github-execution-episode-location
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: aggregate
contract_preconditions: "episode state正本は存在するが、単一global rowへ複数episodeを損失なく投影できない。global row未生成時は他fieldを推測せずuninitialized bootstrapを同一transactionで生成する"
contract_postconditions: "episode別locationを同一transactionで全件投影し、global snapshotは件数とcanonical set digestだけを返す"
contract_invariants: "requirementsとepisode eventがauthorityであり、代表episode推測とlegacy identity再出力を行わない"
contract_failures: "partial write、projection drift、旧HEAD、旧owner、event digest不一致、legacy列、複数episodeの単一化を別reasonで閉じる"
tdd_red_required: true
tdd_red_waiver_reason: null
red_at: "2026-08-16T02:07:44Z"
green_at: "2026-08-16T02:22:11Z"
mutation_oracle_evidence: "2026-08-16T02:22:11Zにactive_countのclosed判定を反転し、tests/github-execution-episode-location.test.tsのU-GHEPL-004／005が2 failed・5 passed、exit 1となるkillを実測した。apply_patchで復元後greenを再確認する"
complexity_effect: justified_positive
complexity_justification: "global snapshotへ可変episode列を増殖させず、episode cardinalityを独立projection一表へ正規化する"
removal_trigger: "execution episode schema major version更新時にversioned successorへ移管する"
parent_design: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md
pair_artifact: docs/test-design/helix/L8-github-execution-episode-location-projection-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md, oracle_id: U-GHEPL-001, test_path: tests/github-execution-episode-location.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md, oracle_id: U-GHEPL-002, test_path: tests/github-execution-episode-location.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md, oracle_id: U-GHEPL-003, test_path: tests/github-execution-episode-location.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md, oracle_id: U-GHEPL-004, test_path: tests/github-execution-episode-location.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md, oracle_id: U-GHEPL-005, test_path: tests/github-execution-episode-location.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md, oracle_id: U-GHEPL-006, test_path: tests/github-execution-episode-location.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md, oracle_id: U-GHEPL-007, test_path: tests/github-execution-episode-location.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md, oracle_id: U-GHEPL-008, test_path: tests/l3-g3-freeze-packet-v2.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — episode/location transaction" }
  - { role: qa, slot_label: "QA — cardinality／drift negative oracle" }
  - { role: tl, slot_label: "TL — requirements多重度／right-arm境界" }
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T02:54:00Z"
    tests_green_at: "2026-08-16T02:54:00Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: codex-intra-runtime
    scope: "Issue #205 episode-keyed current-location deltaを独立reviewした。初回blocker 1件／high 2件を是正後、architecture gateで検出したstate-db→runtime逆依存もcanonical digest正本のshared層移動とruntime compatibility re-exportで解消した。global未生成時はuninitialized bootstrapを同一transactionで生成し、hash／全field convergenceとrollback反例を固定した。最終再reviewはblocker／high 0件。current exact-HEAD freshnessはPRのClaude Code sealed receiptで別途束縛する。"
    green_commands:
      - kind: unit_test
        command: "npm run typecheck && npx vitest run tests/github-execution-episode-location.test.ts tests/github-execution-episode-state.test.ts tests/projection-writer.test.ts tests/state-db-schema-authority.test.ts tests/digest.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-16T02:54:00Z"
        evidence_path: tests/github-execution-episode-location.test.ts
        output_digest: "sha256:aaac9047905a9997356b73fa004975244ebd4f268d5ac9d08703971e7006dc06"
        result: "targeted tests green、typecheck green、PLAN lint／design-reality／source-boundary／digest compatibility green、再review blocker／high 0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-16T02:54:00Z"
  review_binding:
    reviewer: codex-intra-runtime
    reviewed_at: "2026-08-16T02:54:00Z"
    evidence_digest: "sha256:e17a8d184836058ddca1018fd8157b521a2e4aca589b923ba971151e8da4829a"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-577-github-execution-episode-location-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/github-execution-episode-location-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-github-execution-episode-location-projection-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-blind-benchmark.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-context-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/event-projection-checkpoint-replay.md, artifact_type: design_doc }
  - { artifact_path: src/schema/harness-db-tables-design.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/github-execution-episode.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/github-execution-episode-location.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/schema-authority.ts, artifact_type: source_module }
  - { artifact_path: src/shared/canonical-digest.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/digest.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: tests/github-execution-episode-location.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-576-github-execution-episode-state.md
    - docs/plans/PLAN-REVERSE-559-github-typed-workflow-identity-projection-backfill.md
  references:
    - docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md
  blocks: []
---

# Execution episode current-location投影

## TDD Red証跡

2026-08-16T02:07:44Z、`tests/github-execution-episode-location.test.ts`を実行し、
未実装module `src/state-db/github-execution-episode-location.ts` のmodule resolution error、
test file 1 failed、test 0件、exit 1を確認した。Green実装前のRedとして固定する。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | GH-FR-021／GH-AC-019へ多重度契約を追加 | [直列] | requirements current |
| 2 | location projectionのRed oracleを実装 | [直列] | expected failureを記録 |
| 3 | schema／transaction／aggregate／verifierを実装 | [直列] | U-GHEPL-001..007 green |
| 4 | catalog／G3 digestを収束 | [直列] | U-GHEPL-008 green |
| 5 | 独立reviewとClaude exact-HEAD gate | [review] | blocker 0 |

right-arm evidence admissionは後続sliceへ分離する。
