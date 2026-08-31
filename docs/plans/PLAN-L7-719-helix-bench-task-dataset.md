---
plan_id: PLAN-L7-719-helix-bench-task-dataset
title: "PLAN-L7-719: HELIX-Bench task datasetを実装する"
kind: add-impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1294
behavior_contract_id: HELIX-BENCH-DATASET-001
responsibility_owner: helix-bench-task-dataset
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: aggregate
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Issue #1294 HELIX-Bench task datasetとfixture registry"
contract_preconditions: "confirmed HELIX-Bench L3/L10 contractと既存worker blind benchmarkが存在する"
contract_postconditions: "10 task、5カテゴリ、15-field snapshot、public／fixture／hidden registryをdataset digestへ束縛する"
contract_invariants: "runner／scorer／provider／routingを実装せず、future answer／secret／PII／private review contextをpublicへ含めない"
contract_failures: "missing fixture、digest drift、hidden leakage、historical reuse、provider authority化をfail-closeする"
tdd_red_required: true
red_at: "2026-09-01T04:32+09:00"
green_at: "2026-09-01T04:32+09:00"
red_test: "U-HBDATA-001..008をdataset実装前に追加し、registry欠落と型・denominator・nested entry driftでRedになる"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-01T04:32+09:00にsrc/runtime/helix-bench-task-dataset.tsのfixture digest drift checkを一時除去すると、npx vitest run tests/helix-bench-task-dataset.test.tsでU-HBDATA-002が1 failed／4 passedとなりmutationをkillした。直後に復元し同command 5 tests greenを実測した。"
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    worker_model: codex:gpt-5.6-sol
    reviewer_model: codex-intra-runtime
    reviewer_session_id: 5b70e3ff-952f-428f-a2ba-87e20c8e342d
    reviewed_head_sha: 7027f0a70de4767a6a67e3b1f180dd9ee30f45d0
    reviewed_at: "2026-08-31T21:40:29Z"
    tests_green_at: "2026-08-31T21:40:09Z"
    verdict: approve
    scope: "PR #1303 exact HEAD再レビュー。15-field型境界、カテゴリexact 2、fixture／oracle物理件数、nested malformed entry、hidden oracle分離、provider非authority、design catalog、digest inventory、left-arm／freeze pinを再検証しBLOCKER 0。旧review evidenceは再利用しない。cross-runtime receiptの代替とはしない。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/digest.test.ts tests/helix-bench-task-dataset.test.ts --reporter=verbose", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-31T21:40:09Z", evidence_path: tests/helix-bench-task-dataset.test.ts, output_digest: "sha256:ecceae6cdff3cde571e0d69eb14f39eed593c6504f7e8f4fa489b700e0767c90" }
complexity_effect: justified_positive
complexity_justification: "3 registryの物理分離でblind境界を守り、runner／scorerとの責務混載を防ぐ"
removal_trigger: "versioned benchmark packageが同一contractを置換しconsumer移行が完了した時"
parent_design: docs/design/helix/L6-function-design/helix-bench-task-dataset.md
pair_artifact: docs/test-design/helix/L8-helix-bench-task-dataset-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L3-49-helix-bench-evaluation.md
  requires:
    - docs/plans/PLAN-L3-49-helix-bench-evaluation.md
  references:
    - issue:1294
    - issue:1287
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/helix-bench-task-dataset.md, oracle_id: U-HBDATA-001, test_path: tests/helix-bench-task-dataset.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/helix-bench-task-dataset.md, oracle_id: U-HBDATA-002, test_path: tests/helix-bench-task-dataset.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/helix-bench-task-dataset.md, oracle_id: U-HBDATA-003, test_path: tests/helix-bench-task-dataset.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/helix-bench-task-dataset.md, oracle_id: U-HBDATA-004, test_path: tests/helix-bench-task-dataset.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/helix-bench-task-dataset.md, oracle_id: U-HBDATA-005, test_path: tests/helix-bench-task-dataset.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/helix-bench-task-dataset.md, oracle_id: U-HBDATA-006, test_path: tests/helix-bench-task-dataset.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/helix-bench-task-dataset.md, oracle_id: U-HBDATA-007, test_path: tests/helix-bench-task-dataset.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/helix-bench-task-dataset.md, oracle_id: U-HBDATA-008, test_path: tests/helix-bench-task-dataset.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-719-helix-bench-task-dataset.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/helix-bench-task-dataset.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-helix-bench-task-dataset-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/runtime/helix-bench-task-dataset.ts, artifact_type: source_module }
  - { artifact_path: tests/helix-bench-task-dataset.test.ts, artifact_type: test_code }
  - { artifact_path: config/helix-bench/public-tasks.v1.json, artifact_type: json_config }
  - { artifact_path: config/helix-bench/fixtures.v1.json, artifact_type: json_config }
  - { artifact_path: config/helix-bench/hidden/hidden-oracles.v1.json, artifact_type: json_config }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: se, slot_label: "SE — dataset schema／digest／physical separation" }
  - { role: qa, slot_label: "QA — missing／drift／leakage／historical mutation" }
---

# HELIX-Benchタスクデータセット

## 工程表

1. 10 taskを5カテゴリへexact配分する。
2. public、fixture、hidden oracleを物理分離する。
3. exact snapshotとdigestを検証するpure loaderを実装する。
4. mutation、CI、Claude exact-HEAD review後にconfirmする。
