---
title: "設計書artifact_path source_digest照合 L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: confirmed
created: 2026-09-03
updated: 2026-09-03
owner: QA
plan: docs/plans/PLAN-RECOVERY-95-design-artifact-source-digest-gate.md
pair_artifact: docs/design/helix/L6-function-design/design-artifact-source-digest.md
related_l6: docs/design/helix/L6-function-design/design-artifact-source-digest.md
---

# 設計書artifact_path source_digest照合 L8単体テスト設計

| oracle | 正例 | 反例／mutation |
|---|---|---|
| U-DASD-001 | current authority pinと実ファイルdigestが一致 | digestを別値へ変更してdrift |
| U-DASD-002 | baseline外の新規driftを拒否 | stale pinをbaselineへ暗黙追加 |
| U-DASD-003 | 既知baseline debtを可視化して通過 | baseline debtを新規failureと同列に隠す |
| U-DASD-004 | pin先ファイルが存在する | 欠落targetをbaselineで許可 |
| U-DASD-005 | `current_authority: false`をhistoricalとして除外 | compatibility projectionをcurrentへ再解釈 |
| U-DASD-006 | 初期allowlist外のbaseline fingerprintを拒否 | 新しいstaleをbaseline追加で隠す |

全oracleは一時filesystem fixtureで実ファイルbyte digest、baseline fingerprint、path境界を評価する。
doctorは `design-artifact-source-digest` をhard gateとして登録し、baseline debt以外のfindingをfail-closeする。
