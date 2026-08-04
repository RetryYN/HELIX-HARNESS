---
title: "worker lifecycle receipt L8 unit test設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-04
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L5-95-worker-lifecycle-receipt.md
pair_artifact: docs/design/helix/L5-detail/worker-lifecycle-receipt.md
github_issue_id: 227
behavior_contract_id: WCC-FR-05
responsibility_owner: worker-output-admission
---

# worker lifecycle receipt L8 unit test設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WLIFE-001 | receipt chain | sealed run/output/review、current HEAD、parentからseven-state exact chainを再生でき、copyは非seal | `tests/worker-isolation-broker.test.ts` |
| U-WLIFE-002 | capability join | copied run receiptまたは別proposal reviewをunsealed／proposal mismatchとして拒否する | `tests/worker-isolation-broker.test.ts` |
| U-WLIFE-003 | terminal整合 | reject reviewをacceptedへ昇格するmutantを拒否する | `tests/worker-isolation-broker.test.ts` |
| U-DRB-023 | mutation reachability | run/review seal、proposal join、terminal、hash-chain、receipt digestを除去するmutantをRedにする | `tests/design-reality-binding.test.ts` |
