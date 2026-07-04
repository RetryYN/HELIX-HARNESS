---
title: "HELIX L13 デプロイ後検証境界"
layer: L13
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
---

# HELIX L13 デプロイ後検証境界

L13 は実環境 smoke、監視、rollback 判断の層である。現時点の HELIX は local engine / consumer setup / distribution smoke の証跡を持つが、実 remote / production 相当の全デプロイ後検証は未完了である。

## 現在の証跡

| 項目 | 証跡 |
|---|---|
| current distribution smoke | `bun run build && ./dist/ut-tdd doctor` |
| consumer setup smoke | `ut-tdd doctor --profile consumer` |
| rename rehearsal | `bun run src/cli.ts rename dist-smoke --no-write --target helix --json` |
| rollback planning | `rename plan` の rollback / monitoring plan |

## 証跡対応

| L13 観点 | source / surface | test / oracle | 境界 |
|---|---|---|---|
| current distribution smoke | `src/lint/identifier-rename.ts` の `verificationCommandMatrix` `current-dist-smoke` | `tests/identifier-rename.test.ts` の rename plan / evidence pack assertion | 現行配布 artifact の dry-run 証跡。実 release/tag publish は含めない。 |
| renamed HELIX dist smoke | `bun run src/cli.ts rename dist-smoke --no-write --target helix --json` | `tests/identifier-rename.test.ts` の `renamed-helix-dist-smoke` command / adoption decision assertion | HELIX 名称への rehearsal のみ。`.ut-tdd` state move や alias enable は実行しない。 |
| consumer setup smoke | rename plan の `post-cutover-consumer-setup-smoke` row | `tests/identifier-rename.test.ts` の verification matrix / runbook evidence assertion | consumer template が post-cutover で壊れないことを事前検査する。実 consumer repo への適用は approval 後。 |
| package/version binding | `package.json` と CLI `--version` | `tests/cli-surface.test.ts` の package version binding assertion | Pack latest tag adoption は version-up activation まで保留する。 |

## 未完了境界

`.ut-tdd` -> `.helix` の irreversible cutover、GitHub rulesets の実適用、PR/CI auto-fix、release/tag publication は、action-binding approval と cutover decision なしに L13 完了へ進めない。
