---
plan_id: PLAN-L7-728-repo-wide-guard-preflight
title: "PLAN-L7-728: repo-wide guard preflight"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 1498
behavior_contract_id: REPO-WIDE-GUARD-PREFLIGHT-001
responsibility_owner: impact-ci-recovery
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: policy
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REFACTOR
entry_signals:
  - "structural"
contract_preconditions: "既存repo-wide guard testとfull-regression-preflightがcurrent mainに存在する"
contract_postconditions: "明示registry、単一entrypoint、preflight配線が同じguard exact setを実行する"
contract_invariants: "既存testの判定、full regression exact inventory、required aggregateを変更せず、guard greenをfull admissionへ昇格しない"
contract_failures: "registry欠落、重複、missing path、未登録guard、entrypoint／workflow配線欠落をfail-closeする"
tdd_red_required: true
tdd_red_evidence: "2026-09-04にregistry testを先行実行し、新設registry test自身の自己検出を含む差集合で1 failed／1 passedを確認した"
tdd_green_evidence: "2026-09-04T03:11+09:00にnpm run test:repo-guardsを実行し、35 files／517 tests green、exit 0を確認した"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-04T03:06+09:00にregistryからtests/coding-rules.test.tsを除去し、U-REPOGUARD-001が1 failed／1 passed、exit 1でkillした。復元後に再greenを要求する"
complexity_effect: justified_positive
complexity_justification: "暗黙grep集合を1 registryと1 runnerへ集約し、review後のfull shard再実行を減らす"
removal_trigger: "CI verification planがrepo-wide guard exact setを同じcontractで生成し、全consumerが移行した時"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
dependencies:
  parent: PLAN-L6-92-impact-ci-recovery
  requires:
    - docs/plans/PLAN-L6-92-impact-ci-recovery.md
  references:
    - "issue:1498"
    - "issue:1493"
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-REPOGUARD-001, test_path: tests/repo-wide-guard-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-REPOGUARD-002, test_path: tests/repo-wide-guard-registry.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-728-repo-wide-guard-preflight.md, artifact_type: markdown_doc }
  - { artifact_path: config/repo-wide-guard-tests.v1.json, artifact_type: json_config }
  - { artifact_path: scripts/run-repo-wide-guards.ts, artifact_type: source_module }
  - { artifact_path: tests/repo-wide-guard-registry.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: package.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: se, slot_label: "SE — registry／single runner" }
  - { role: qa, slot_label: "QA — exact-set mutation／workflow wiring" }
  - { role: tl, slot_label: "TL — existing CI responsibility boundary" }
review_evidence: []
---

# repo-wide guardの事前実行

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 暗黙guard集合をinventory化 | 既存35 testがexact setになる |
| 2 | registry loaderと単一runnerを実装 | duplicate／missing／malformedをfail-closeする |
| 3 | packageとpreflightを同じentrypointへ接続 | full shard前にguard redを検出する |
| 4 | 欠落mutation、targeted、typecheck、PLAN lint | current HEADでgreen evidenceを得る |
| 5 | Claude exact-HEAD review、CI、main read-after | full admissionを代替せず収束する |

本PLANは既存guard testの集合と実行位置だけを所有する。新lint、test判定変更、full regression削減、
required check変更、CI System Synthesisの新authorityは非対象とする。
