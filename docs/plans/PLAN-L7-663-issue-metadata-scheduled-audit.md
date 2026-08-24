---
plan_id: PLAN-L7-663-issue-metadata-scheduled-audit
title: "PLAN-L7-663 (add-impl): Issue metadata live監査のscheduled gate接続"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["issue:633", "po_directive:Issue起票metadataのlive監査を常時強制する"]
created: 2026-08-24
updated: 2026-08-24
owner: Codex / TL
github_issue_id: 633
engineering_discipline_required: true
behavior_contract_id: ISSUE-METADATA-ENFORCEMENT-001
responsibility_owner: github-issue-admission
change_slice: atomic
refactor_step: introduce_adapter
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: adapter
contract_preconditions: "GitHub tokenでIssue read権限を持ち、repository名を明示できる"
contract_postconditions: "schedule/workflow_dispatchでlive Issue metadata監査が実行され、finding時にworkflowがfailする"
contract_invariants: "PR required gateへ全Issue監査を混載せず、Issue metadataを推測補完せず、GitHub writeを行わない"
contract_failures: "Issue metadata finding、repository取得失敗、CLI失敗をsuccessへ変換せずfail-closeする"
tdd_red_required: true
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
dependencies:
  parent: docs/plans/PLAN-L7-555-issue-metadata-enforcement.md
  requires: [docs/plans/PLAN-L7-555-issue-metadata-enforcement.md]
  blocks: []
agent_slots:
  - { role: se, slot_label: "SE — scheduled audit wiring" }
  - { role: qa, slot_label: "QA — workflow trigger/permission oracle" }
---

# Issue metadata live監査のscheduled gate接続

既存の `auditIssueMetadata` と `helix github issue-metadata-audit` を、GitHub writeなしの独立workflowへ接続する。PRごとのrequired gateには全open Issueの監査を混載せず、scheduled / workflow_dispatchで全体状態をsurfaceする。
