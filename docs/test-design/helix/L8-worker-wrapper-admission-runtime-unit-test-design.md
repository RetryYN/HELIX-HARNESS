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
| U-WWA-010 | provider process env | token／HELIX state envを子processへ継承するとRed | `tests/worker-wrapper-admission.test.ts` |
| U-WWA-010b | proxy／private CA env | proxy userinfoを除去せず渡す、malformed proxyを渡す、またはproxy／CA経路を黙って失うとRed | `tests/worker-wrapper-admission.test.ts` |
| U-WWA-011 | env digest | seal後のenv追加をadmitするとRed | `tests/worker-wrapper-admission.test.ts` |
| U-WWA-012 | provider failure | stderr本文を例外へ含めるとRed | `tests/orchestration/loop-bridge.test.ts` |

正規plan、raw plan、copy、provider drift、args drift、direct route、invocation driftを実行し、4 failureの全分岐へ到達する。
capability spread copyは`isWrapperLaunchCapability=false`であり、field一致をauthorityにしない。既存adapter／team／pair／loop testも回帰greenを要求する。

## 実行 sink の admission fence（Issue #362 §1、PLAN-RECOVERY-47）

U-WWA-001..007 は `admitWrapperLaunch` という pure function 自体の 4 failure を固定する。
上記の「既存 adapter／team／pair／loop test も回帰 green を要求する」は sink の回帰検出を
既存 test の副作用に委ねており、fence として不足していた。実測では各 sink から admission を
外しても既存 test は green のまま通過する（Issue #362 §1 の M5、および本節追加前の M8／M9／M10／M11）。

以下は sink 単独の regression fence である。いずれも「**拒否が起動前に起きること**」を、
起動側 spy が一度も呼ばれないことで固定する（例外型や message だけに依存しない）。

| U-ID | 対象 sink | 反例と期待結果 | test citation |
|---|---|---|---|
| U-TSAF-001 | `src/team/run.ts` | wrapper 未登録の生 adapter plan を渡すと `runCommand` を一度も呼ばずに全 member が failed | `tests/team-run.test.ts` |
| U-TSAF-002 | `src/team/run.ts` | worker context 無しの wrapper plan を渡すと `runCommand` を一度も呼ばずに全 member が failed | `tests/team-run.test.ts` |
| U-PSAF-001 | `src/orchestration/pair-agent.ts` | worker context 無しで `executor` が一度も呼ばれず `WRAPPER_CONTEXT_REQUIRED` が transcript へ出る | `tests/pair-agent.test.ts` |
| U-LSAF-001 | `src/orchestration/loop-bridge.ts` | worker context 無しで provider process を spawn せず `WRAPPER_CONTEXT_REQUIRED` で reject | `tests/orchestration/loop-bridge.test.ts` |

U-LSAF-001 は `PATH` を marker 記録専用の偽 provider だけへ絞った上で実行する。admission が
外れた mutant が実 provider を起動しないことと、起動そのものが起きていないことの両方を
同時に担保するためである。U-WCP-013 は CLI 段の `WORKER_CONTEXT_UNSEALED` を固定しており
sink 手前で止まるため、この fence を代替しない。
