---
title: "distribution Lite clean consumer canary単体テスト設計"
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

# distribution Lite clean consumer canary単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DISTCANARY-001 | setup dry-run／idempotency | dry-run write 0、再apply writes 0 | `tests/distribution-lite-consumer-services.test.ts` |
| U-DISTCANARY-002 | ownership | consumer bytes競合時に全write 0 | `tests/distribution-lite-consumer-services.test.ts` |
| U-DISTCANARY-003 | completion | statusとpacket／bundleを同じstateへ束縛 | `tests/distribution-lite-consumer-services.test.ts` |
| U-DISTCANARY-004 | hook | recursive deletionをbundle内共有guardでblock | `tests/distribution-lite-consumer-services.test.ts` |
| U-DISTCANARY-005 | lifecycle | rollback rehearsalはplan-onlyでbytes不変 | `tests/distribution-lite-consumer-services.test.ts` |
| U-DISTCANARY-007 | Linux E2E | checksum→install→build→setup→status→doctor→delegation→completion→rehearsal | `tests/slow/distribution-lite-consumer-canary.test.ts` |
| U-DISTCANARY-008 | contamination | PLAN／memory／DB実データ／credential／absolute path／excluded capabilityがarchiveにない | `tests/slow/distribution-lite-consumer-canary.test.ts` |
| U-DISTCANARY-009 | identity mutation | checksum／HEAD／profile差替えをinstall前に拒否 | `tests/slow/distribution-lite-consumer-canary.test.ts` |
| U-DISTCANARY-010 | Windows |同一tarball／Node artifactをPowerShell smokeへ渡す | `tests/harness-check-workflow.test.ts` |
| U-DISTCANARY-006 | G3 freeze | L6/L8 pairとcatalog digestを同一transactionへ束縛 | `tests/l3-g3-freeze-packet-v2.test.ts` |
| U-DISTCANARY-011 | command admission | lifecycle rehearsal exact commandだけを受理 | `tests/distribution-consumer-command-registry.test.ts` |
| U-DISTCANARY-012 | composition | lifecycle rehearsalを専用handlerへdispatch | `tests/distribution-consumer-command-composition.test.ts` |
| U-DISTCANARY-013 | Node adapter | lifecycle serviceへ一方向接続 | `tests/distribution-consumer-node-adapter.test.ts` |
| U-DISTCANARY-014 | dependency closure | Full CLIではなくconsumer entrypointへ閉じる | `tests/distribution-dependency-closure.test.ts` |
