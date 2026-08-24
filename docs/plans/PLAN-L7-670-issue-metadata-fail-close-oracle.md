---
plan_id: PLAN-L7-670-issue-metadata-fail-close-oracle
title: "PLAN-L7-670 (impl): Issue metadata監査のfail-open shell構文をoracleで拒否する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #988 metadata監査のfail-close oracleを補強する"
created: 2026-08-25
updated: 2026-08-25
owner: Codex / TL
github_issue_id: 988
behavior_contract_id: ISSUE-METADATA-AUDIT-FAIL-CLOSE-001
responsibility_owner: issue-metadata-governance
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "scheduled metadata audit workflowのrun commandを検査する"
contract_postconditions: "代表的なshell失敗握り潰し構文をoracleが個別に拒否する"
contract_invariants: "workflow実体、cron、stale-hours、CLI挙動を変更しない"
contract_failures: "|| true、|| :、; true、set +eのいずれかを見逃す"
tdd_red_required: true
red_test: "U-IMETA-WF-003が既存|| true専用regexでは|| :をfalse negativeとしてfailする"
red_at: "2026-08-24T20:29:59Z"
green_at: "2026-08-24T20:30:11Z"
mutation_oracle_evidence: "tests/issue-metadata-audit-workflow.test.ts のU-IMETA-WF-003へ|| :、|| :;、|| true;、; true、set +eの5変異をseedし、旧regexのfalse negativeと初回拡張の|| true;退行を捕捉し、修正後5 passedを実測した"
complexity_effect: net_neutral
complexity_justification: "既存pure oracleのregexをAC exact setへ拡張するtest-only slice"
removal_trigger: "workflow commandをtyped argvへ移行しshell fallback構文が表現不能になった時"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-IMETA-WF-003, test_path: tests/issue-metadata-audit-workflow.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-670-issue-metadata-fail-close-oracle.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/issue-metadata-audit-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: PLAN-L7-663-issue-metadata-scheduled-audit
  requires:
    - docs/plans/PLAN-L7-663-issue-metadata-scheduled-audit.md
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — fail-open shell mutation oracle" }
  - { role: tl, slot_label: "TL — test-only scope監査" }
---

# Issue metadata監査fail-close oracle

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 3反例を追加してRed | 既存regexがfalse negativeを示す |
| 2 | oracleをGreen | 4種のfail-open構文を拒否 |
| 3 | 既存workflow oracle回帰 | U-IMETA-WF-001/002/003 green |
| 4 | typecheck／Biome／PLAN lint | 全green |
| 5 | Claude同一HEAD検収 | blocker 0 |

workflow実体とCLIは変更せず、L8が既に宣言したfail-closeの反証力だけを補強する。
