---
plan_id: PLAN-RECOVERY-11-impact-ci-stateful-deadline
title: "PLAN-RECOVERY-11 (recovery): Impact CI stateful deadline"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-04 CI高速化を優先し、PR #387を直接停止する反復timeoutをself-healする"
created: 2026-08-04
updated: 2026-08-04
owner: Codex / TL
github_issue_id: 139
engineering_discipline_required: true
behavior_contract_id: GH-AC-017
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: modify
legacy_retirement_state: retained
no_code_decision: configure
ddd_modeling_decision: none
contract_preconditions: "full admissionが2-core Ubuntu runner上でbulkとstatefulの2 laneを並列実行する"
contract_postconditions: "stateful CLIの有限deadlineへCPU応答性を譲りつつ、full exact inventoryと並列実行を維持する"
contract_invariants: "timeout延長、test除外、retry、直列化、runner/job追加を行わず、2 laneのstatusをfail-close集約する"
contract_failures: "bulkの低優先度起動欠落、lane欠落、status未集約、soft-passをworkflow oracleで拒否する"
tdd_red_required: true
red_at: "2026-08-04T04:23:46Z"
green_at: "2026-08-04T04:49:31Z"
mutation_oracle_evidence: "tests/harness-check-workflow.test.ts::U-IMPACTCI-WF-002でbulk commandからnice -n 10を除去した場合、およびstateful failureの最終判定だけを除去した場合にisolated_shard_dispatch_invalidとなりRedへ戻る"
complexity_effect: net_neutral
complexity_justification: "既存bulk commandへOS標準のprocess priority指定を付け、既存oracleを強化するだけでworkflow/job/dependencyを増やさない"
removal_trigger: "runner CPU容量またはstateful command startupが、同優先度並列でもp95 deadlineを継続的に満たすと同一oracleで証明された時"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-WF-002, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — 反復timeoutとFeature差分の原因分離" }
  - { role: se, slot_label: "SE — bulk process priorityの最小workflow修正" }
  - { role: qa, slot_label: "QA — priority除去mutationと2 lane fail-close確認" }
  - { role: tl, slot_label: "TL — Feature #92阻害Recoveryと非対象境界" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-11-impact-ci-stateful-deadline.md, artifact_type: markdown_doc }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-493-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L7-493-impact-ci-recovery.md
review_evidence:
  - reviewer: "Codex CLI / independent verify runtime"
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-04T05:56:06Z"
    tests_green_at: "2026-08-04T05:55:01Z"
    verdict: approve
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-sol
    scope: "PR #388 HEAD a652bc5b36f6d890b6ae18bc53912fa4d6d7bdc2と許可3 path内のremediation差分をworker-context-packet.v1へ束縛し、独立Codex verify session 019fcb57-3ebc-7393-a262-e1c1d6afee49がread-only再検証した。先行Mediumのstateful failure判定oracle欠落を修正後、Critical／High／Medium blocker 0、APPROVE。bulkだけnice -n 10、stateful通常優先度、2 lane並列、両status fail-close、timeout延長・retry・除外・直列化・job／runner追加0を確認した。本entryはcross_agentではなくintra_runtime_subagentであり、merge前のClaude exact-HEAD reviewは別途必須。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --configLoader runner --project fast tests/harness-check-workflow.test.ts tests/design-language.test.ts tests/ci-governance-self-heal.test.ts tests/review-evidence.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-04T05:55:01Z", evidence_path: tests/harness-check-workflow.test.ts, output_digest: "sha256:0631d03b8df8a3369f24e1358d49f34a3912e467df1d0aa75ef2ae77b196c018", result: "4 files / 77 tests passed" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-04T05:55:01Z", evidence_path: tsconfig.json, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
---

# PLAN-RECOVERY-11: Impact CIのstateful期限超過Recovery

## 根本原因

PR #387のrequired CI run `30876565411` attempt 1／2では、bulk laneが各回3211/3211 greenの一方、
stateful laneの同一`skill suggest` CLI caseが15秒timeoutを反復した。CLI実processは平常時にも約8秒を要し、
2-core runner上でbulkと同じCPU優先度に置くとfinite deadlineを超えるため、単純rerunでは収束しない。

## 修復

並列2 laneとfull exact inventoryを維持し、bulk processだけを`nice -n 10`で起動する。
timeout延長、test除外、retry、直列化、runner/job追加は行わない。priority指定を除去するmutationをRedにし、
両laneのexit status exact集約を維持する。

## Featureレーン復帰

本Recovery merge後はPR #387を最新mainへ一度だけ再束縛し、Feature #92のworker lifecycle closureへ戻る。
