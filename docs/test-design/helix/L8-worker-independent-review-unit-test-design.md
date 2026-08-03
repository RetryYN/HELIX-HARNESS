---
title: "worker independent review L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-08-04
owner: QA
plan: docs/plans/PLAN-L5-91-worker-independent-review.md
pair_artifact: docs/design/helix/L5-detail/worker-independent-review.md
github_issue_id: 227
behavior_contract_id: WCC-FR-06
responsibility_owner: worker-independent-review
---

# worker independent review L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WRR-001 | derived receipt | broker origin由来actorだけをcanonical化 | `tests/worker-review-receipt.test.ts` |
| U-WRR-002 | proposal join | copied proposal／digest driftを拒否 | `tests/worker-review-receipt.test.ts` |
| U-WRR-003 | strict schema | actor自己申告／unknown／invalid digestを拒否 | `tests/worker-review-receipt.test.ts` |
| U-WRR-004 | 三軸分離 | identity／session／context collisionを個別拒否 | `tests/worker-review-receipt.test.ts` |
| U-WRR-005 | model metadata | same provider／modelでも三軸独立ならgreen | `tests/worker-review-receipt.test.ts` |
| U-WRR-006 | session分離 | session collisionを固有reasonで拒否 | `tests/worker-review-receipt.test.ts` |
| U-WRR-007 | context分離 | context digest collisionを固有reasonで拒否 | `tests/worker-review-receipt.test.ts` |
| U-WRR-008 | execution origin | broker originのないoutputをsealed reviewへ昇格しない | `tests/worker-review-receipt.test.ts` |
| U-WRR-009 | finding join | 任意digest／copied reviewer outputを拒否しsealed payload digestだけを受理 | `tests/worker-review-receipt.test.ts` |
| U-WIB-007 | 実process隔離 | 実bubblewrapでrepo／state／DB／credential非到達 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-018 | required CI | Ubuntu required jobがbubblewrapを導入し実process testをskip不能で実行 | `tests/harness-check-workflow.test.ts` |
| U-WIB-013 | broker integration | 2実行originからsealed reviewを発行しcopy outputを拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-014 | model binding | model未指定実行をreview originへ昇格しない | `tests/worker-isolation-broker.test.ts` |
| U-DRB-018 | mutation | seal／digest join／三軸分岐除去をRed | `tests/design-reality-binding.test.ts` |
