---
title: "distribution Lite clean consumer canary単体・接合テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-23
updated: 2026-08-23
owner: QA / TL
plan: docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md
pair_artifact: docs/design/helix/L6-function-design/distribution-lite-consumer-canary.md
---

# distribution Lite clean consumer canary単体・接合テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DISTCAN-001 | manifest chain | builder receiptとtarball／manifest／checksum／exact setが一致した場合だけadmit | `tests/distribution-lite-consumer-canary.test.ts` |
| U-DISTCAN-002 | artifact replacement | tarball 1 byte差替えをextract前に拒否 | `tests/distribution-lite-consumer-canary.test.ts` |
| U-DISTCAN-003 | checksum drift | checksum bytes／filename／tarball digestの不一致を独立failureで拒否 | `tests/distribution-lite-consumer-canary.test.ts` |
| U-DISTCAN-004 | source／profile identity | 別HEADまたは別profile receiptを拒否 | `tests/distribution-lite-consumer-canary.test.ts` |
| U-DISTCAN-005 | physical artifact | symlink／hardlink／ancestor symlinkをread前に拒否 | `tests/distribution-lite-consumer-canary.test.ts` |
| U-DISTCAN-006 | Linux E2E | clean processでinstall→consumer build→setup→status→doctor→workflow→CI→completion evidenceが順序どおりgreen | `tests/distribution-lite-consumer-canary.test.ts` |
| U-DISTCAN-006a | consumer service | setup／status／doctor／completionをconsumer-local stateへ接続 | `tests/distribution-lite-consumer-services.test.ts` |
| U-DISTCAN-006b | minimal delegation | provider dry-runはtask本文を保存せずdigest receiptだけを返す | `tests/distribution-lite-consumer-services.test.ts` |
| U-DISTCAN-007 | setup ownership | dry-run／apply／再実行でconsumer所有bytesが不変 | `tests/distribution-lite-consumer-canary.test.ts` |
| U-DISTCAN-007a | ownership conflict | 既存consumer CIを上書きせずfail-close | `tests/distribution-lite-consumer-services.test.ts` |
| U-DISTCAN-008 | Windows same artifact | Linux receiptと同じtarball／Node digestでPowerShell setup／status／doctor／minimal workflow smokeがgreen | `tests/distribution-lite-consumer-canary.test.ts` |
| U-DISTCAN-008a | Windows CI wiring | Linux jobが生成・検証・uploadしたexact artifactをrequired Windows jobがdownloadしてLite canaryを実行 | `tests/harness-check-workflow.test.ts` |
| U-DISTCAN-009 | lifecycle rehearsal | upgrade／rollback／uninstallでconsumer成果とevidence digestを保全 | `tests/distribution-lite-consumer-lifecycle.test.ts` |
| U-DISTCAN-009a | direct rollback | 直前pin以外とsymlink pinを拒否 | `tests/distribution-lite-consumer-lifecycle.test.ts` |
| U-DISTCAN-010 | exclusion | PLAN、memory、DB実データ、credential、absolute path、除外capabilityが存在・到達しない | `tests/distribution-lite-consumer-canary.test.ts` |

U-DISTCAN-001..005をartifact実行前のpure admission、006..010をfresh process接合として分離する。
