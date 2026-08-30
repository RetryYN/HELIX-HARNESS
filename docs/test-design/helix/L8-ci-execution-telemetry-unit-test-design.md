---
title: "CI execution telemetry L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-08-30
updated: 2026-08-30
owner: QA
plan: docs/plans/PLAN-L7-704-ci-execution-telemetry.md
pair_artifact: docs/design/helix/L6-function-design/ci-execution-telemetry.md
---

# CI execution telemetry L8単体テスト設計

実行テストは `tests/ci-execution-telemetry.test.ts` に1対1で束縛する。すべての反例は入力をgreenへ縮退させず、
固定failure codeまたはprojectionのerrorとして観測できることを確認する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-TELE-001 | typed eventがschema、identity、runner、時刻、結果、digestを持つ | 必須field欠落、schema version差替えを拒否する | `tests/ci-execution-telemetry.test.ts` |
| U-TELE-002 | payload/evidence digestをcanonical bytesから再計算する | operation、HEAD、evidence digestだけを改竄したeventを拒否する | `tests/ci-execution-telemetry.test.ts` |
| U-TELE-003 | queue、wall、runner時間が日時差と一致する | 時刻逆転、queue/wall差替え、runner time超過を拒否する | `tests/ci-execution-telemetry.test.ts` |
| U-TELE-004 | allowlist済みrunner、profile、attemptを受理する | 未知OS、未知profile、0 attempt、同一batch内のNode version driftを拒否する | `tests/ci-execution-telemetry.test.ts` |
| U-TELE-005 | strict event shapeを投影する | raw log、credential、unknown key、通常nodeを含むartifact field欠落を拒否する | `tests/ci-execution-telemetry.test.ts` |
| U-TELE-006 | setup、test、artifact upload/downloadを別cost nodeへ分類する | artifact field欠落で例外化せず、方向・operation・lockfile／transfer digest欠落を拒否する | `tests/ci-execution-telemetry.test.ts` |
| U-TELE-007 | statusとexit code、first detectorを整合させる | passed非0、failed detector欠落、timeout非null exit、非failure detectorを拒否する | `tests/ci-execution-telemetry.test.ts` |
| U-TELE-008 | 一つのrun/attemptの依存DAGとartifact edgeを検証する | cache/resource drift、時間逆転、cycle、artifact input/output／lockfile不一致を拒否する | `tests/ci-execution-telemetry.test.ts` |
| U-TELE-009 | critical path、重複setup、rerun failureを保持する | 重複setupを1回へ潰さず、過去failureをrerun successで消さない。全nodeが0msでも最長依存鎖を空pathへ縮退させず、同値時のnode数／bytewise順を決定的に適用する | `tests/ci-execution-telemetry.test.ts` |
| U-TELE-010 | profile/surface/runner/environment/cache/resource別にp50/p95/p99を算出する | 有効標本やfailureがない状態を0ms／検出率100%と表示しない | `tests/ci-execution-telemetry.test.ts` |

このtest設計はselector、scheduler、workflow、DB、GitHub APIの実行証明ではない。それらの接続は後続Issue #1205〜#1208
で、同じevent schemaとprojectionを再利用して検証する。
