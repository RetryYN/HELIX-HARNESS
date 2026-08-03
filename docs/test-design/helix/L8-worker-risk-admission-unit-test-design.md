---
title: "worker risk admission L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
status: confirmed
created: 2026-08-04
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L5-94-worker-risk-admission.md
pair_artifact: docs/design/helix/L5-detail/worker-risk-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-08
responsibility_owner: worker-risk-admission
---

# worker risk admission L8単体テスト設計

| ID | oracle | test |
|---|---|---|
| U-WRA-001 | critical finding非相殺、用途別selection、sealed receipt | `tests/worker-isolation-broker.test.ts` |
| U-WRA-002 | exact request/unknown field拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WRA-003 | copied receipt、同risk重複を拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WRA-004 | justificationなしfixed effortを拒否 | `tests/worker-isolation-broker.test.ts` |
| U-DRB-022 | critical pre-filter、receipt seal、effort justificationを実source mutationしRed | `tests/design-reality-binding.test.ts` |
