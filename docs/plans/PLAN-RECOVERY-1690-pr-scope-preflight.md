---
plan_id: PLAN-RECOVERY-1690-pr-scope-preflight
title: "PLAN-RECOVERY-1690: push前PR scope検査の第一slice"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-09
updated: 2026-09-09
github_issue_id: 1690
behavior_contract_id: PR-SCOPE-PREFLIGHT-001
responsibility_owner: pr-scope-preflight
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: policy
contract_preconditions: "PR本文または本文file、base/HEAD、git diff、既存analyzePrContextとoutstanding snapshot再生成関数が読める"
contract_postconditions: "push前入口がCIと同じundeclared/absent/companion/Allowed外typed findingを返し、PLAN status由来のsnapshot net-diffを観測する"
contract_invariants: "新しい判定器、CI job、gate緩和、自動commit/push、GitHub write、Allowed外の自動宣言、#1670/#1563/#1688再実装を行わない"
contract_failures: "local入口がCIと異なるfindingを返す、Allowed外をsuggested Expectedへ足す、PLAN status変更でsnapshot影響を報告しない"
tdd_red_required: true
red_at: "2026-09-09T18:40:00Z"
green_at: "2026-09-09T18:47:05Z"
mutation_oracle_evidence: "2026-09-09T18:49:51ZにcollectAllowedAwareSuggestionのsuggested集合をAllowed外込みのactual全集合へ変異させると、U-PRSCOPE-PRE-003が1 failed（outstanding-snapshot.jsonをsuggestedへ混入）／U-PRSCOPE-PRE-006が1 failed（docs/secret.mdをsuggestedへ混入）、exit 1。復元後7 passed。"
complexity_effect: net_neutral
complexity_justification: "既存analyzePrContextとsnapshot再生成関数をpush前CLIへ接続し、新しいclassifier/job/stateを増やさない"
removal_trigger: "全push経路が同じanalyzePrContext呼び出しを必須化し、独立preflight commandが不要になった時"
entry_signals: [regression_dev]
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-PRE-001, test_path: tests/pr-scope-preflight.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-PRE-002, test_path: tests/pr-scope-preflight.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-PRE-003, test_path: tests/pr-scope-preflight.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-PRE-004, test_path: tests/pr-scope-preflight.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-PRE-005, test_path: tests/pr-scope-preflight.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-PRE-006, test_path: tests/pr-scope-preflight.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-PRE-007, test_path: tests/cli-surface.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-PRSCOPE-PRE-008, test_path: tests/pr-scope-preflight.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references:
    - issue:1690
    - issue:1091
    - docs/plans/PLAN-L7-466-pr-scope-contract.md
    - docs/plans/PLAN-L7-677-outstanding-snapshot-semantic-merge-guard.md
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1690-pr-scope-preflight.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/pr-scope-preflight.ts, artifact_type: source_module }
  - { artifact_path: tests/pr-scope-preflight.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/evidence/PR-1699/vitest-targeted.json, artifact_type: json_config }
modifies:
  - { artifact_path: docs/design/harness/L6-function-design/governance-enforcement.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/github-guards.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
agent_slots:
  - { role: se, slot_label: "SE — 既存analyzePrContextをpush前CLIへ接続" }
  - { role: qa, slot_label: "QA — undeclared/absent/Allowed外/snapshot mutation" }
  - { role: aim, slot_label: "AIM — 新判定器禁止とAllowed外自動追加禁止を監査" }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-09T19:35:00Z"
    tests_green_at: "2026-09-09T19:22:59Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 44a875e0-4347-4802-8e8a-87cb4f105537
    reviewed_head_sha: feb956a81c746ac0c8a5b890051d0b29cb7dc980
    scope: "PR #1699 exact-HEAD review。CI guard pr-context と同一の analyzePrContext 経路、Allowed外の permission required 分離、snapshot 3 者観測、GitHub write なし、dogfood --pr 1699 findings=0。worker_model は assignment の author runtime を codex として記録。根拠: https://github.com/RetryYN/HELIX-HARNESS/pull/1699#issuecomment-5607614576"
    green_commands:
      - kind: unit_test
        command: "npx vitest run tests/pr-scope-preflight.test.ts --reporter=json --outputFile=.helix/evidence/review-1699/vitest-targeted.json"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-09T19:22:59Z"
        evidence_path: docs/governance/evidence/PR-1699/vitest-targeted.json
        output_digest: "sha256:ad53079d7b2e0c096ac55fe99a2d52697f8e0c2713f08e8c7dffed35189247ce"
---

# push前PR scope検査（第一slice）

Issue #1690は、PLAN status変更で`outstanding-snapshot.json`がnet-zero／新規に変化し、
PR本文のExpected changed pathsとずれる往復をpush後CIで初めて検出している。
#1091は診断を改善してclosedしたが、事前検出入口は残っていない。
Issue本文の`PR-SCOPE-STATUS-DERIVED-PATH-PREFLIGHT-001`はatomic IDの6 segment上限を超えるため、
本PLANの機械IDは受理可能な`PR-SCOPE-PREFLIGHT-001`とする。

## 対象

- `helix github pr-scope-preflight`を追加し、CIと同じ`analyzePrContext`を`eventName=pull_request`で呼ぶ。
- 入力はlive PR本文またはbody file、base、HEAD、`git diff --name-only base...HEAD`。
- 出力は同じtyped finding（undeclared / absent / required companion / Allowed外）。
- PLAN status変更時は既存snapshot再生成関数でnet-diffを観測する。
- Allowed外pathはsuggested Expectedへ自動追加しない。

## 非対象

- snapshot再生成の自動commit。
- pin追従の事前導出（#1670）。
- preflight stepの直列fail-fast（#1688）。
- 新しいCI job、gate緩和、GitHub write、意味変更。

## 工程

1. Red: U-PRSCOPE-PRE-001..008で同一finding、Allowed外非自動追加、snapshot観測、eventName固定を行う。
2. Green: 既存関数を再利用する薄い入口とCLIを接続する。
3. Mutation: `analyzePrContext`結果を捨ててAllowed外をsuggestedへ足す退行をkillする。
4. PLAN statusをconfirmedへ上げる前に、snapshot net-diffをこの入口で観測する。
