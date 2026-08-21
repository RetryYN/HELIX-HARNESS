---
plan_id: PLAN-RECOVERY-63-cli-surface-bounded-deadline
title: "PLAN-RECOVERY-63: skill injection CLI oracleのbounded deadline余裕を回復する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: true
backfill_state: complete
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:5023a820b8ae786b71c90edaea57812286f7a3091ab22b04f60d8fb2915f7b3f
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: ["po_directive:Issue #902 CLI skill injection CI timeout recovery"]
created: 2026-08-21
updated: 2026-08-22
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
  - { role: aim, slot_label: "AIM — Recovery scopeとbounded deadline是正" }
  - { role: qa, slot_label: "QA — bounded deadlineとassertion不変確認" }
  - { role: tl, slot_label: "TL — production semantics非影響と3 PR再接着判断" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-21T13:37:03Z"
    tests_green_at: "2026-08-21T13:13:42Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    scope: "Claude Code OpusがPR #903 exact HEAD 68ed0ab0325538ff3dc933f9c19a77ea04dd78a2を独立検収した。scope 4 paths、src変更0、assertion集合不変、対象外deadline不変、30秒超過fail-close、PLAN／L8／test citation、snapshot、採番、targeted 2 tests、tdd_red waiverを確認し、実装内容blocker 0としてPLAN confirmをapproveした。review: https://github.com/RetryYN/HELIX-HARNESS/pull/903#issuecomment-5370475677"
    green_commands:
      - kind: unit_test
        command: "npm exec -- vitest run --project fast tests/cli-surface.test.ts -t 'U-CLI-SKILL-DEADLINE-001|U-CLI-SKILL-DEADLINE-002' --reporter=json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-21T13:13:42Z"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:e9aa0ed60b3246066ea2eea07b892325546e12daea70f11822dc7cbcd26cc4cb"
        result: "1 file / 2 tests green"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-21T13:37:03Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-21T13:37:03Z"
    evidence_digest: "sha256:5be3562e72fa0438123696c5f08f5093846078a07c2e6be4370ab93445d6c575"
  entries: []
mutation_oracle_evidence: "30_000を1へ一時変更すると対象oracleがtimeoutでredになる既存Vitest deadline機構を利用する。production code mutationは対象外とし、assertion集合不変をdiffで固定する"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-63-cli-surface-bounded-deadline.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
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

## §終端read-after

修正PR #903はexact HEAD `af5f172de1d9f90044f0d64aa252d615d7483cda`でClaude Opus
blocker 0、Ready CI greenを満たし、canonical merge `e6daf85eba4de063627fe6cbcb6313e068017033`
へ着地した。post-main harness-check run 32491100109とCodeQL run 32491100007もterminal successである。

同修正mainへ起票時の被影響PRを再接着し、#899はmerge `eb463dc8e00c17911ff2457ff98885119df0c43f`、
#890はmerge `a752f2c0d5e41327873c1d808217253ed2b37d2a`、#896はmerge
`52ad0f942649faced70eb79bed38cae60376226c`へそれぞれcurrent-HEAD CIと独立reviewを経て
canonical mergeした。#896のpost-main harness-check run 32496689659とCodeQL run 32496689806も
terminal successであり、2-core full regression laneで同timeoutが再発していない。

以上により、対象2 oracleだけをbounded 30秒へ広げ、production semanticsとassertion集合を変えずに
CI負荷余裕を回復するRecovery contractはmain read-afterまで成立したため、
`backfill_state: complete`および`completion_claim_allowed: true`へ遷移する。
