---
title: "worker context authority L8単体テスト設計"
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L5-92-worker-context-authority.md
pair_artifact: docs/design/helix/L5-detail/worker-context-authority.md
github_issue_id: 225
behavior_contract_id: WCC-FR-09
responsibility_owner: worker-context-authority
---

# worker context authority L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WCP-001 | authority/rule binding | current file bytesをexact HEAD digestへ束縛 | `tests/worker-context-packet.test.ts` |
| U-WCP-002 | HEAD/compatibility | drift、v1.2を固有failureで拒否 | `tests/worker-context-packet.test.ts` |
| U-WCP-003 | scope/budget | overlap、0 budgetを拒否 | `tests/worker-context-packet.test.ts` |
| U-WCP-004 | runtime drift | payload、role、task、HEAD driftを拒否 | `tests/worker-context-packet.test.ts` |
| U-WCP-005 | seal/schema | copied capability、output schema driftを拒否 | `tests/worker-context-packet.test.ts` |
| U-WCP-006 | authority missing | missing authorityを拒否 | `tests/worker-context-packet.test.ts` |
| U-WCP-007 | rule missing | missing ruleを拒否 | `tests/worker-context-packet.test.ts` |
| U-WCP-008 | schema invalid | invalid digestを拒否 | `tests/worker-context-packet.test.ts` |
| U-WCP-009 | axes invalid | 非直交axesを拒否 | `tests/worker-context-packet.test.ts` |
| U-WCP-010 | authority再検証 | compile前後のdirty authority・ruleを拒否 | `tests/worker-context-packet.test.ts` |
| U-WIB-015 | broker join | context無しlegacy wrapperを起動前拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WIB-016 | broker re-attestation | attestation後dirty authorityをspawn前拒否 | `tests/worker-isolation-broker.test.ts` |
| U-WWA-008 | process admission | CLI/team/pair/loop共通admissionがcontext無しを拒否 | `tests/worker-wrapper-admission.test.ts` |
| U-WWA-009 | direct sink re-attestation | compile後dirty authorityを共通admissionでspawn前拒否 | `tests/worker-wrapper-admission.test.ts` |
| U-WCP-011 | team sink | context-bound team実行を維持し、共通admissionを通す | `tests/team-run.test.ts` |
| U-WCP-012 | pair sink | context-bound pair実行を維持し、共通admissionを通す | `tests/pair-agent.test.ts` |
| U-WCP-013 | loop sink | context無しloop executeをprocess生成前に拒否 | `tests/orchestration/loop-bridge.test.ts` |
| U-DRB-019 | mutation | failure比較／seal分岐除去をRed | `tests/design-reality-binding.test.ts` |

文言一致だけを合格にせず、actual git HEAD、file bytes、process-local seal、broker prepareを実行する。
