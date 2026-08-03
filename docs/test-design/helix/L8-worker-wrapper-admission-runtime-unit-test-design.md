---
title: "worker wrapper admission L7 runtime単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L6-95-worker-wrapper-admission.md
pair_artifact: docs/design/helix/L6-function-design/worker-wrapper-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
---

# worker wrapper admission L7 runtime単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WWA-001 | sealed capability | spread copyをauthority扱いするとRed | `tests/worker-wrapper-admission.test.ts` |
| U-WWA-002 | route origin | raw／copy planをadmitするとRed | `tests/worker-wrapper-admission.test.ts` |
| U-WWA-003 | plan digest | args driftを許可するとRed | `tests/worker-wrapper-admission.test.ts` |
| U-WWA-004 | provider | provider driftをdigestへ潰すとRed | `tests/worker-wrapper-admission.test.ts` |
| U-WWA-005 | direct route | raw provider routeを許可するとRed | `tests/worker-wrapper-admission.test.ts` |
| U-WWA-006 | plan branch | plan digest比較を削除するとRed | `tests/worker-wrapper-admission.test.ts` |
| U-WWA-007 | invocation branch | invocation digest比較を削除するとRed | `tests/worker-wrapper-admission.test.ts` |

正規plan、raw plan、copy、provider drift、args drift、direct route、invocation driftを実行し、4 failureの全分岐へ到達する。
capability spread copyは`isWrapperLaunchCapability=false`であり、field一致をauthorityにしない。既存adapter／team／pair／loop testも回帰greenを要求する。
