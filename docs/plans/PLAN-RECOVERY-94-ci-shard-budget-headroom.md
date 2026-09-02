---
plan_id: PLAN-RECOVERY-94-ci-shard-budget-headroom
title: "PLAN-RECOVERY-94: CI shard実行予算と負荷再分配のRecovery"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1467
behavior_contract_id: CI-SHARD-TIME-BUDGET-001
responsibility_owner: impact-ci-recovery
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - regression_dev
contract_preconditions: "PLAN-L7-685の3独立shard契約は存在するが、bulk-1とstatefulの実測時間が各job timeout 20分へ張り付き、timeout発火によるcancelledがmerge経路を不安定化している"
contract_postconditions: "fast bulkを3 shardへ再分配し、bulk各25分、stateful 30分、preflight 35分、finalize 15分の有限budgetを適用する。各shardのconfigured budgetとjob resultをsummaryへ投影し、同一generationのjob result／receipt exact setが一致した場合だけ既存aggregateを通過させる"
contract_invariants: "#1461のcancelled／skipped／missing fail-close、過去generation greenによる補完禁止、receiptのHEAD／base／partition／files exact binding、tracked inventory exact union、same-head reuse契約を緩めない。always uploadされたreceiptの存在だけで完走を推測しない"
contract_failures: "timeout、cancel、skip、missing receipt、wrong generation、wrong HEAD／base／partition／files、bulk partition欠落／重複、budget telemetry欠落をfail-closeする"
tdd_red_required: true
red_test: "U-FULLSHARD-WF-003のbulk budget mutation、4-shard exact partition mutation、budget telemetry欠落mutationがexit 1になることを実測する"
red_at: "2026-09-03T00:00:00Z"
green_at: null
mutation_oracle_required: true
mutation_oracle_evidence: "CIでfull regressionが完走するまで更新する"
complexity_effect: justified_positive
complexity_justification: "20分境界へ張り付く3系統を有限budgetへ再設定し、fast bulkを3系統へ分けてcritical pathの負荷偏りを下げ、job resultを原因調査可能なsummaryへ残す"
removal_trigger: "CI System Synthesisのdynamic schedulerが同じinventory／receipt／budget telemetry契約を提供し、固定shard budgetのconsumerが0になった時"
backprop_decision: not_required
backprop_decision_reason: "既存CI execution contractの容量Recoveryであり、新しいユーザー価値・要求意味を追加しない"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L7-685-full-regression-shard-jobs.md
  requires:
    - docs/plans/PLAN-L7-685-full-regression-shard-jobs.md
  references:
    - "issue:1461"
    - "issue:1467"
    - "issue:1071"
    - "issue:1207"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-94-ci-shard-budget-headroom.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/runtime/full-regression-shards.ts, artifact_type: source_module }
  - { artifact_path: tests/full-regression-shards.test.ts, artifact_type: test_code }
  - { artifact_path: tests/full-regression-shards-cli.test.ts, artifact_type: test_code }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: aim, slot_label: "AIM — timeout根因と既存fail-close境界の監査" }
  - { role: se, slot_label: "SE — 4-shard workflow／artifact／telemetry配線" }
  - { role: qa, slot_label: "QA — timeout／cancel／receipt／partition mutation" }
  - { role: tl, slot_label: "TL — #1467 Recoveryと#1207 schedulerの境界" }
review_evidence: []
---

# CI shard実行予算と負荷再分配 Recovery

statefulとbulk-1が20分のjob timeoutへ張り付くことで、同じHEAD・同じtreeでもtimeout由来の
cancelledが発生し、required aggregateが不安定になる問題を是正する。receiptを救済根拠へ変更せず、
fast bulkを3系統へ分割して負荷を再配分する。各jobのconfigured budgetと実際のjob resultを
summaryへ残し、timeout／cancel／test failureの切り分け材料を同じgenerationへ束縛する。

## 非対象

- cancelled／skipped／missing shardを過去generationのgreenで補完すること
- `always()` uploadされたreceiptだけで完走を推定すること
- test削除、assertion緩和、`continue-on-error`、targeted選択によるFull代替
- CI System Synthesisのdynamic scheduler実装、release／publish
