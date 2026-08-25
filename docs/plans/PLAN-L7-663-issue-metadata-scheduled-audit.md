---
plan_id: PLAN-L7-663-issue-metadata-scheduled-audit
title: "PLAN-L7-663 (add-impl): Issue metadata live監査のscheduled gate接続"
kind: add-impl
layer: L7
drive: agent
status: confirmed
backfill_state: complete
completion_claim_allowed: true
entry_signals: ["po_directive:Issue起票metadataのlive監査を常時強制する"]
created: 2026-08-24
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 633
engineering_discipline_required: true
behavior_contract_id: ISSUE-METADATA-ENFORCEMENT-001
responsibility_owner: github-issue-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: adapter
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: ADD_FEATURE
contract_preconditions: "GitHub tokenでIssue read権限を持ち、repository名を明示できる"
contract_postconditions: "schedule/workflow_dispatchでlive Issue metadata監査が実行され、finding時にworkflowがfailする"
contract_invariants: "PR required gateへ全Issue監査を混載せず、Issue metadataを推測補完せず、GitHub writeを行わない"
contract_failures: "Issue metadata finding、repository取得失敗、CLI失敗をsuccessへ変換せずfail-closeする"
tdd_red_required: true
red_at: 2026-08-24T10:45:12Z
green_at: 2026-08-24T10:45:25Z
mutation_oracle_evidence: "tests/issue-metadata-audit-workflow.test.ts の U-IMETA-WF-001/002 に対し schedule の cron 23→24改変、continue-on-error式検査の除去、論理ORとtrueの間に空白を持つ変種検査の無効化を実測し、各1 test failedでKILLED。production workflowとoracleを復元した後、issue metadata 2 suiteは6 tests passed。"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-24T20:07:32.000Z"
    tests_green_at: "2026-08-24T19:26:16Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: "c7895aff-da7e-47a0-944a-36c68bb4f251"
    reviewed_head_sha: 3bd6c8ff5a919fb7e40a95cc6122df048cc10966
    scope: "PR #982 final HEAD 3bd6c8ff5a919fb7e40a95cc6122df048cc10966をClaude Codeがread-only独立検収し、issue metadata scheduled workflow、関連回帰、harness-check run 32765795977のsuccess、DB projection/replay、checkpoint/replayを確認してblocker 0と判定した。canonical review: https://github.com/RetryYN/HELIX-HARNESS/pull/982#issuecomment-5400707880"
    receipt_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/982#issuecomment-5400707880"
    green_commands:
      - kind: smoke
        command: "gh run view 32765795977 --repo RetryYN/HELIX-HARNESS --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-24T19:26:16Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:9408e0c4d152556fa6d8c86ab3a0ee5b35fdec60bc51904749da969a83ae34e5"
        result: "completed / success / HEAD 3bd6c8ff5a919fb7e40a95cc6122df048cc10966"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-24T20:07:32.000Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-24T20:07:32.000Z"
    evidence_digest: "sha256:8066a87d2722373944ada2c3be6fba83770fe0a3db92fa2c6bada8fd8d1edb31"
  entries: []
complexity_effect: justified_positive
complexity_justification: "既存のread-only classifier/CLIを独立scheduled workflowへ接続し、別のmetadata authorityやwrite adapterを追加しない"
removal_trigger: "GitHub側の同一taxonomy監査がHELIXの必要受入条件を完全に代替した時"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-IMETA-WF-001, test_path: tests/issue-metadata-audit-workflow.test.ts }
generates:
  - { artifact_path: .github/workflows/issue-metadata-audit.yml, artifact_type: source_module }
  - { artifact_path: tests/issue-metadata-audit-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L7-555-issue-metadata-enforcement.md
  requires:
    - docs/plans/PLAN-L7-555-issue-metadata-enforcement.md
    - docs/plans/PLAN-REVERSE-633-issue-metadata-terminal-fullback.md
  blocks: []
agent_slots:
  - { role: se, slot_label: "SE — scheduled audit wiring" }
  - { role: qa, slot_label: "QA — workflow trigger/permission oracle" }
---

# Issue metadata live監査のscheduled gate接続

既存の `auditIssueMetadata` と `helix github issue-metadata-audit` を、GitHub writeなしの独立workflowへ接続する。PRごとのrequired gateには全open Issueの監査を混載せず、scheduled / workflow_dispatchで全体状態をsurfaceする。

live Issueに既存のmetadata findingが残る間はworkflowをfailureとして可視化し、findingをsuccessへ変換しない。backfillの完了は別の#633終端条件で扱い、この配線sliceのmerge可否やPR required gateへ暗黙に混載しない。

このworkflowをPR／Issueのworkflow identity契約へ接続する場合は、identity markerの次行に単一の`json` fenced blockを置く。本文の宣言値を機械parserが一意に再取得できる形式を契約化し、markerとJSON blockの間に空行を挿入せず、自由記述や未構造化JSONを正本として扱わない。
