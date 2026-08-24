---
plan_id: PLAN-L7-663-issue-metadata-scheduled-audit
title: "PLAN-L7-663 (add-impl): Issue metadata live監査のscheduled gate接続"
kind: add-impl
layer: L7
drive: agent
status: draft
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals: ["po_directive:Issue起票metadataのlive監査を常時強制する"]
created: 2026-08-24
updated: 2026-08-24
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
  requires: [docs/plans/PLAN-L7-555-issue-metadata-enforcement.md]
  blocks: []
agent_slots:
  - { role: se, slot_label: "SE — scheduled audit wiring" }
  - { role: qa, slot_label: "QA — workflow trigger/permission oracle" }
---

# Issue metadata live監査のscheduled gate接続

既存の `auditIssueMetadata` と `helix github issue-metadata-audit` を、GitHub writeなしの独立workflowへ接続する。PRごとのrequired gateには全open Issueの監査を混載せず、scheduled / workflow_dispatchで全体状態をsurfaceする。

live Issueに既存のmetadata findingが残る間はworkflowをfailureとして可視化し、findingをsuccessへ変換しない。backfillの完了は別の#633終端条件で扱い、この配線sliceのmerge可否やPR required gateへ暗黙に混載しない。

このworkflowをPR／Issueのworkflow identity契約へ接続する場合は、identity markerの次行に単一の`json` fenced blockを置く。本文の宣言値を機械parserが一意に再取得できる形式を契約化し、markerとJSON blockの間に空行を挿入せず、自由記述や未構造化JSONを正本として扱わない。
