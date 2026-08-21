---
plan_id: PLAN-L7-648-cli-surface-bounded-deadline
title: "PLAN-L7-648 (test): skill injection CLI oracleのbounded deadline余裕を回復する"
kind: recovery
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: ["po_directive:Issue #902 CLI skill injection CI timeout recovery"]
created: 2026-08-21
updated: 2026-08-21
owner: Codex / TL
github_issue_id: 902
behavior_contract_id: CI-CLI-SURFACE-BOUNDED-DEADLINE-001
responsibility_owner: impact-ci-stateful-lane
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "skill injection CLI oracle 2件が隔離実行ではgreenだが、2-core full regression laneで20秒deadlineを僅かに超えて無関係PRを停止する"
contract_postconditions: "同じassertionを維持したまま各oracleへbounded 30秒deadlineを明示し、CI負荷余裕を確保する"
contract_invariants: "production CLI／manifest／routing semanticsを変更せず、30秒超過は引き続きfail-closeする"
contract_failures: "deadline無制限化、assertion削除、CLI出力変更、対象外oracleへの一括timeout緩和を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "GitHub Actions runs 32478093192／32478105685／32478091669で同じ2 oracleの20秒timeoutを実測済みであり、未記録Redを捏造しない"
complexity_effect: net_neutral
complexity_justification: "既存2 oracleのbounded deadline定数だけを隣接長時間oracleと同じ30秒へ揃え、runtime分岐を追加しない"
removal_trigger: "CLI startupがCI p95で10秒未満へ短縮され、30秒deadline不要を測定証拠で確認した時点"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-CLI-SKILL-DEADLINE-001, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-CLI-SKILL-DEADLINE-002, test_path: tests/cli-surface.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — bounded deadlineとassertion不変確認" }
  - { role: tl, slot_label: "TL — production semantics非影響と3 PR再接着判断" }
mutation_oracle_evidence: "30_000を1へ一時変更すると対象oracleがtimeoutでredになる既存Vitest deadline機構を利用する。production code mutationは対象外とし、assertion集合不変をdiffで固定する"
generates:
  - { artifact_path: docs/plans/PLAN-L7-648-cli-surface-bounded-deadline.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L6-function-design/impact-ci-recovery.md
  requires: []
  references:
    - docs/plans/PLAN-L7-333-impact-ci-profile-selection.md
  blocks: []
---

# skill injection CLI oracle bounded deadline回復

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | 3 CI runの同一timeoutを採取 | [直列] | Issue #902 evidence |
| 2 | 対象2 oracleだけを30秒へ固定 | [直列] | assertion diff 0 |
| 3 | targeted／full CI／doctor | [直列] | current HEAD green |
| 4 | Claude Opus exact-HEAD独立review | [review] | blocker 0 |

## §境界

production CLI、skill manifest、task routing、full regression shard構造は変更しない。deadlineは無制限化せず、
隣接するcurrent-location skill oracleと同じ30秒を上限とする。
