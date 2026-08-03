---
title: "worker context authority L6/L7実装oracle設計"
layer: L6
executed_at_layer: L7
artifact_type: test_design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L6-100-worker-context-authority.md
pair_artifact: docs/design/helix/L6-function-design/worker-context-authority.md
github_issue_id: 225
behavior_contract_id: WCC-FR-09
responsibility_owner: worker-context-authority
---

# worker context authority L6/L7実装oracle設計

| U-ID | 実行oracle |
|---|---|
| U-WCP-001 | authority/rule exact HEAD digest |
| U-WCP-002 | HEAD/compatibility拒否 |
| U-WCP-003 | scope/budget exact failure |
| U-WCP-004 | payload/role/task drift |
| U-WCP-005 | copy/schema drift |
| U-WCP-006 | authority unresolved |
| U-WCP-007 | rule unresolved |
| U-WCP-008 | schema invalid |
| U-WCP-009 | axes invalid |
| U-WIB-015 | legacy wrapper broker拒否 |
| U-DRB-019 | source mutation kill |

compile→context-bound wrapper→broker prepareの実結線とfailure reachabilityを検証する。mutationは比較／seal分岐を
実sourceから除去し、対応fixtureがRedになることを要求する。
