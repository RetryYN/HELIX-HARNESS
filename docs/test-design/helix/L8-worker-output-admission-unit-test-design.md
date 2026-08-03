---
title: "worker output admission L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L5-90-worker-output-admission.md
pair_artifact: docs/design/helix/L5-detail/worker-output-admission.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker output admission L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WOA-001 | known schema／contract | unknown digestとcontract欠落を拒否 | `tests/worker-output-admission.test.ts` |
| U-WOA-002 | sealed capability | copied／forged capabilityを拒否 | `tests/worker-output-admission.test.ts` |
| U-WOA-003 | AST evaluator | unknown key、literal、型、constraint違反を拒否 | `tests/worker-output-admission.test.ts` |
| U-WOA-004 | dynamic digest | descriptor／schema／payload driftを拒否 | `tests/worker-output-admission.test.ts` |
| U-WOA-005 | byte canonicalization | oversize、invalid UTF-8、非canonicalを拒否 | `tests/worker-output-admission.test.ts` |
| U-WOA-006 | resource bound | depth／node上限超を拒否 | `tests/worker-output-admission.test.ts` |
| U-WIB-010 | broker出力境界 | Buffer encoding、raw stdout／stderr非公開 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-011 | broker強制結線 | contract欠落、schema違反でcapability 0 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-012 | process failure | nonzeroでcapability 0 | `tests/worker-isolation-broker.test.ts` |
| U-DRB-016 | output admission mutation | schema／canonical／digest／capability分岐除去をRed | `tests/design-reality-binding.test.ts` |
| U-DRB-017 | broker ingress mutation | contract／process／admission／Buffer／raw非公開の退行をRed | `tests/design-reality-binding.test.ts` |
