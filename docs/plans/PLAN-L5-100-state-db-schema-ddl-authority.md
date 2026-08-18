---
plan_id: PLAN-L5-100-state-db-schema-ddl-authority
title: "PLAN-L5-100 (add-design): state DB schema DDL authority詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
completion_claim_allowed: true
route_mode: add-feature
entry_signals: ["po_directive:Issue #644 と PLAN-L7-448 #21の自己比較oracleを独立golden authorityへ置換する"]
created: 2026-08-13
updated: 2026-08-13
owner: Codex / TL
review_evidence:
  - reviewer: "Claude Code / claude-fable-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-13T15:20:48Z"
    tests_green_at: "2026-08-13T15:16:09Z"
    verdict: approve
    worker_model: gpt-5.6-luna
    reviewer_model: claude-fable-5
    scope: "PR #652 current HEAD 963757bc9c304b570e8e11f770159a562b0f341dでSTATE-DB-SCHEMA-DDL-AUTHORITY-001のL5/L6設計、L7実装、L8 oracle、Reverse R0-R4、DB convergenceを照合しblocker 0。receipt digest sha256:c44f9bcb1b47330f3ff8329f79bca8bd839f83dc2cb5ca98dc60972760927984、receipt-bound CI run 31709583268 success。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/state-db-schema-authority.test.ts tests/state-db.test.ts tests/goal-evidence-audit.test.ts tests/l3-g3-freeze-packet-v2.test.ts --reporter=dot", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-13T15:16:09Z", evidence_path: tests/state-db-schema-authority.test.ts, output_digest: "sha256:59fc005bfcff3d741611c8e096f93c75ddff6f7a7100579ca91403394de1867b", result: "4 files / 47 tests passed" }
github_issue_id: 644
engineering_discipline_required: true
behavior_contract_id: STATE-DB-SCHEMA-DDL-AUTHORITY-001
responsibility_owner: state-db-schema-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "schemaDdl()はregistryからDDLを生成するが、testは同一関数を自己比較し独立authorityを持たない"
contract_postconditions: "canonical DDL bytesのpinned digestとfresh migration後sqlite_schemaの非内部table/index/trigger exact setを固定する"
contract_invariants: "schema機能、migration順序、SCHEMA_VERSION、DB write behaviorを変更しない。SQLite内部objectは比較対象外とする"
contract_failures: "DDL byte drift、object欠落、余剰object、type/name/sql drift、self-comparison mutationをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。Red/GreenはPLAN-L7-551が記録する"
complexity_effect: net_negative
complexity_justification: "自己参照oracleを単一のrepository-owned authorityとpure comparisonへ置換する"
removal_trigger: "後継schema authorityが同じDDL bytesとSQLite object exact setを担い、全consumer移行後に本authorityを置換できる時"
pair_artifact: docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md
backprop_decision: not_required
backprop_decision_reason: "PLAN-L7-448で測定済みのtest infrastructure debtを詳細化し、schema意味を変更しない"
agent_slots:
  - { role: se, slot_label: "SE — canonical DDL/object authority" }
  - { role: qa, slot_label: "QA — drift/missing/extra mutation oracle" }
  - { role: tl, slot_label: "TL — schema変更非混載監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/state-db-schema-ddl-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-state-db-schema-ddl-authority-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L7-448-qs4-test-infra-inventory.md
  requires: []
  blocks: [docs/plans/PLAN-L6-106-state-db-schema-ddl-authority.md, issue:644]
---

# state DB schema DDL authority詳細設計

`schemaDdl().join(";\n")`のUTF-8 bytesをSHA-256へ固定し、fresh migration後の
`sqlite_schema`から`sqlite_%`を除外したtable/index/triggerをname/type/sqlで正規化して照合する。
golden更新はschema変更PLANとSCHEMA_VERSION更新を伴う場合だけ許可する。

PR #645の実装とPR #646〜#652のReverse R0-R4で、canonical digest、fresh migration exact set、
missing／extra／changed failureが本設計と一致することを確認したため、L5詳細設計をconfirmedとする。
