---
plan_id: PLAN-RECOVERY-1707-cursor-v1-run-authority
title: "Cursor v1 run authorityとagent_busy回復境界"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-10
updated: 2026-09-12
github_issue_id: 1707
behavior_contract_id: CURSOR-V1-RUN-AUTHORITY-001
responsibility_owner: cursor-cloud-provider-adapter
engineering_discipline_required: true
no_code_decision: add_code
ddd_modeling_decision: value_object
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
contract_preconditions: "#1293のbounded external workerと3L-R-03/05/11/14/23/24がcanonicalで、v1 run一覧とv0 summaryの意味差が実測済み"
contract_postconditions: "v1 run一覧からactive/cancellable/phantom/terminal/staleを型付き分類し、single-active read-afterと409 no-retryを既存adapter境界へ提供する"
contract_invariants: "別scheduler・別DB・別queueを作らず、v0 summaryをdispatch authorityにせず、cancel不能run・成果branch・PR・terminal履歴を削除しない"
contract_failures: "active重複、cancel候補複数、unknown、不正timestamp、409、provider停止をfail-closeまたはCursor lane限定degradedにする"
tdd_red_required: true
red_test: "tests/cursor-cloud-run-authority.test.tsはclassifier実装前にmodule missingでred"
red_at: "2026-09-10T07:27:03+09:00"
green_at: "2026-09-10T07:28:34+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/cursor-cloud-run-authority.test.ts::U-CURSOR-RUN-009で、stale RUNNINGのcancellable=trueをCREATING扱いへ変異すると、cancel候補の誤生成とfollow-up許可を1 failedでkillすることを実測する。U-CURSOR-RUN-001..008はfresh/stale、cancellable true/false、409、active件数、expected run ID、provider availabilityの境界を独立に拘束する。外部API E2Eは未実証。"
complexity_effect: net_neutral
complexity_justification: "既存runtime adapter内の副作用なしclassifierとdecisionだけを追加し、provider専用control planeを増やさない"
removal_trigger: "Cursor v1 run stateがprovider-neutral worker run authorityへ同じ分類・回復契約で吸収された時"
backprop_decision: not_required
backprop_decision_reason: "canonical #1293と3L要件の実測P0 recoveryであり、要求意味や並列上限を変更しない"
entry_signals:
  - regression_dev
parent_design: docs/design/helix/L6-function-design/cursor-v1-run-authority.md
pair_artifact: docs/test-design/helix/L7-cursor-v1-run-authority-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  parent: PLAN-L3-78-three-lane-cloud-governance-authority
  requires:
    - docs/plans/PLAN-L3-78-three-lane-cloud-governance-authority.md
  references:
    - "issue:1707"
    - "issue:1293"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/cursor-v1-run-authority.md, oracle_id: U-CURSOR-RUN-001, test_path: tests/cursor-cloud-run-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-v1-run-authority.md, oracle_id: U-CURSOR-RUN-002, test_path: tests/cursor-cloud-run-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-v1-run-authority.md, oracle_id: U-CURSOR-RUN-003, test_path: tests/cursor-cloud-run-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-v1-run-authority.md, oracle_id: U-CURSOR-RUN-004, test_path: tests/cursor-cloud-run-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-v1-run-authority.md, oracle_id: U-CURSOR-RUN-005, test_path: tests/cursor-cloud-run-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-v1-run-authority.md, oracle_id: U-CURSOR-RUN-006, test_path: tests/cursor-cloud-run-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-v1-run-authority.md, oracle_id: U-CURSOR-RUN-007, test_path: tests/cursor-cloud-run-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-v1-run-authority.md, oracle_id: U-CURSOR-RUN-008, test_path: tests/cursor-cloud-run-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/cursor-v1-run-authority.md, oracle_id: U-CURSOR-RUN-009, test_path: tests/cursor-cloud-run-authority.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — v0/v1 status意味差と既存adapter境界を照合" }
  - { role: se, slot_label: "SE — pure classifier、dispatch decision、read-afterを実装" }
  - { role: qa, slot_label: "QA — phantom、cancel、409、lane degradation反例を拘束" }
  - { role: tl, slot_label: "TL — #1293・3L要件・外部E2E境界を維持" }
generates:
  - { artifact_path: src/runtime/cursor-cloud-run-authority.ts, artifact_type: source_module }
  - { artifact_path: tests/cursor-cloud-run-authority.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L6-function-design/cursor-v1-run-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L7-cursor-v1-run-authority-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/plans/PLAN-RECOVERY-1707-cursor-v1-run-authority.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
review_evidence:
  - reviewer: "Claude Code / claude-fable-5-1"
    review_kind: cross_agent
    reviewed_at: "2026-09-11T16:39:38Z"
    tests_green_at: "2026-09-11T16:30:23Z"
    verdict: approve
    worker_model: codex-gpt-5
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: fe061343-6172-4db5-8837-ef9aa5fd3af6
    reviewed_head_sha: e97968c681afc2b02ecdf594bfeb1bfa68d1a4a3
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1742#issuecomment-5637651418"
    ci_evidence_generation: "run:34622643539:attempt:1:failure"
    receipt_id: "claude-pr-review:RetryYN/HELIX-HARNESS#1742:e97968c681afc2b02ecdf594bfeb1bfa68d1a4a3:claude:run:34622643539:attempt:1:failure"
    receipt_digest: "sha256:7d989669501c643be0dafb7e8d1fee8cf270d7c611f84086d1b53b4216bbc4f9"
    scope: "修正版exact HEADを独立監査しblocker 0 / approve。invalid terminal timestampはunknownへfail-closeしU-CURSOR-RUN-007が旧順序変異をkill。CI failureはdraft PLANのpost_merge_plan循環のみでmerge admissionは付与しない。外部Cursor API E2E、#1293 transport配線、回復receipt永続化、7日WIP3は未実証のまま保持する。"
    green_commands:
      - kind: unit_test
        command: "npx vitest run tests/cursor-cloud-run-authority.test.ts --reporter=json --outputFile=.helix/evidence/review-1742/vitest-cursor-invalid-terminal.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-11T16:30:23Z"
        evidence_path: .helix/evidence/review-1742/vitest-cursor-invalid-terminal.json
        output_digest: "sha256:77be4a2c8398a627dd6bf492c08e7ed5b900bdd4e02b50564255e49a8582f1c8"
---

# Cursor v1 run authorityの復旧

## 実装範囲

v1 run listを入力にするpure classifier、follow-up／cancel decision、409 no-retry、single-active read-after、
Cursor lane限定degradedを実装する。外部Cursor API、credential、HTTP transport、DB、schedulerは変更しない。

## 未実証

- 外部Cursor APIを使うcancel→IDLE→同一agent・同一PR head follow-up
- 既存#1293 transport consumerへの実配線と回復receipt永続化
- 7日観測および3L-R-11のCursor 3レーン昇格条件

自己reviewやreceipt補作はせず、fresh CI後に別runtimeのexact-HEAD reviewを要求する。
