---
plan_id: PLAN-L6-106-state-db-schema-ddl-authority
title: "PLAN-L6-106 (add-design): state DB schema authority検証関数"
kind: add-design
layer: L6
drive: agent
status: confirmed
completion_claim_allowed: true
route_mode: add-feature
entry_signals: ["po_directive:Issue #644 と L5-100のDDL/object authorityをpure validatorへ降下する"]
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
    scope: "PR #652 current HEAD 963757bc9c304b570e8e11f770159a562b0f341dでSTATE-DB-SCHEMA-DDL-AUTHORITY-001のpure validator、L8 mutation oracle、Reverse R0-R4、DB convergenceを照合しblocker 0。receipt digest sha256:c44f9bcb1b47330f3ff8329f79bca8bd839f83dc2cb5ca98dc60972760927984、CI run 31713547299 success。"
github_issue_id: 644
engineering_discipline_required: true
behavior_contract_id: STATE-DB-SCHEMA-DDL-AUTHORITY-001
responsibility_owner: state-db-schema-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L5-100がcanonical bytesとsqlite_schema exact setを定義する"
contract_postconditions: "schemaDdlDigest、readSqliteSchemaObjects、compareSchemaAuthorityが決定的なtyped resultを返す"
contract_invariants: "validatorはDBを変更せず、network/command/filesystem writeを行わない"
contract_failures: "digest不一致とmissing/extra/changed objectを別failureとして返す"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。実装検証はPLAN-L7-551が担う"
complexity_effect: net_negative
complexity_justification: "test内のad-hoc自己比較をpure validatorへ集約する"
removal_trigger: "後継validatorが同等以上のdigest／missing／extra／changed診断を担い、全consumer移行後に本関数群を置換できる時"
pair_artifact: docs/plans/PLAN-L7-551-state-db-schema-ddl-authority.md
backprop_decision: not_required
backprop_decision_reason: "L5 authorityを関数境界へ降下するだけで上位意味を変更しない"
agent_slots:
  - { role: se, slot_label: "SE — digest/object comparison function" }
  - { role: qa, slot_label: "QA — exact failure ordering" }
  - { role: tl, slot_label: "TL — read-only boundary" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/state-db-schema-ddl-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L6-state-db-schema-ddl-authority-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/plans/PLAN-L7-551-state-db-schema-ddl-authority.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L5-100-state-db-schema-ddl-authority.md
  requires: [docs/design/helix/L5-detail/state-db-schema-ddl-authority.md]
  blocks: [docs/plans/PLAN-L7-551-state-db-schema-ddl-authority.md, issue:644]
---

# state DB schema authority検証関数

production registryのDDL digestとfresh migrated DBの実object集合を別々に観測し、双方がgoldenへ一致した場合だけ成功する。

PR #645の実装とPR #646〜#652のReverse R0-R4で、read-only validatorとfailure orderingが本設計へ
一致することを確認したため、L6機能設計をconfirmedとする。
