---
title: "Windows Lite canary bounded admission L8単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-27
updated: 2026-08-27
owner: QA / Codex TL
plan: docs/plans/PLAN-L3-70-windows-lite-canary-admission.md
pair_artifact: docs/design/helix/L6-function-design/windows-lite-canary-admission.md
related_l9: docs/test-design/helix/L9-windows-lite-canary-admission-integration-test-design.md
---

# Windows Lite canary bounded admission L8単体テスト設計

本書はL3要件とL6 pure kernelの反証oracleを定義する。U-WLCA-001／005／009／014は
`tests/windows-lite-canary-admission.test.ts`へ実装済みであり、残るoracleは#1135以降が依存順に引き継ぐ。
既存scheduler／measurementのoracleを再定義せず、Windows lane固有の差分だけを持つ。

| U-ID | 対象 | 正例 | 反例／mutation | 実行先 |
|---|---|---|---|---|
| U-WLCA-001 | policy exact schema | 明示された上限、TTL、heartbeat、windowを受理 | 欠落、unknown、zero、負値、heartbeat≥TTLを拒否 | `tests/windows-lite-canary-admission.test.ts` |
| U-WLCA-002 | active bound | activeが`max_active`以下ならadmit | 上限超過をsuccessへ投影しない | 同上 |
| U-WLCA-003 | waiting bound | waitingが`max_waiting`未満ならqueueへ追加 | 満杯をdrop／無制限待機／暗黙skipにしない | 同上 |
| U-WLCA-004 | deterministic queue | 同じ入力順から同じqueue／digest | 入力順以外の暗黙rank、重複assignmentを拒否 | 同上 |
| U-WLCA-005 | lease binding | assignment、PR、HEAD、artifact、lane、attempt、owner、lease、fenceが一致 | 各fieldのwrong／missing／duplicateを個別fail-close | 同上 |
| U-WLCA-006 | expiry／heartbeat | 有効期限内のheartbeatだけを更新 | expired owner、未来時刻、heartbeat遅延をadmitしない | 同上 |
| U-WLCA-007 | fence ownership | current owner／fenceだけがcompletion可能 | stale owner、古いfence、別laneのcompletionを拒否 | 同上 |
| U-WLCA-008 | same artifact | Linux receiptのartifact／profile／HEADとWindows入力が一致 | Windows再build、artifact／profile／HEAD mismatchを拒否 | 同上 |
| U-WLCA-009 | attempt identity | positive run attemptを同一leaseへ束縛 | missing、zero、別attempt、rerun上書きを拒否 | 同上 |
| U-WLCA-010 | state uncertainty | queue／lease stateが完全ならtyped result | state読出し不能、矛盾、stale digestをsuccessにしない | 同上 |
| U-WLCA-011 | disposition mapping | admitted／backpressured／expired等をexact dispositionへ変換 | boolean skip、unknown disposition、Full green相殺を拒否 | 同上 |
| U-WLCA-012 | percentile population | 同じmeasurement keyのterminal durationから固定rank p95／p99 | timeout、cancel、backpressure、別artifact、重複を母集団へ混入しない | 同上 |
| U-WLCA-013 | measurement append-only | event sequence、前digest、母集団digestが再生一致 | update／delete、順序改変、同一ID重複を拒否 | 同上 |
| U-WLCA-014 | input immutability | evaluatorが入力を変更せず、返却値をdeep freeze | shallow alias、入力凍結、副作用を拒否 | 同上 |
| U-WLCA-015 | failure precedence | policy→queue→lease→binding→measurementの順で最初のfailureを返す | 後段successやretryで先行failureを相殺しない | 同上 |

## PLAN-L7-696 executable oracle binding

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-WLCA-001 | policy exact schema | missing／unknown key、zero／negative bound、heartbeat≥TTLを拒否する | `tests/windows-lite-canary-admission.test.ts` |
| U-WLCA-005 | lease binding | wrong HEAD／artifact／owner／fenceとextra keyを拒否する | `tests/windows-lite-canary-admission.test.ts` |
| U-WLCA-009 | attempt identity | zero／fraction／missing attemptとtime inversionを拒否する | `tests/windows-lite-canary-admission.test.ts` |
| U-WLCA-014 | input immutability | 入力を変更せずdeep-frozen copyとcanonical digestを返す | `tests/windows-lite-canary-admission.test.ts` |

## Red／Green／mutation の実行方針

L3 confirmationは成立済みである。L6実装PRではU-WLCA-001〜015をRed先行で固定し、
policy上限、lease fence、same-artifact binding、percentile母集団、append-only chainの各チェックを一件ずつ
弱めるmutationが最低一つずつkillされることを要求する。timeoutを延長してRedを回避した場合は失敗とする。
