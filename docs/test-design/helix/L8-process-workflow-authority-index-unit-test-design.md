---
title: "process workflow索引 authority再接着単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-17
updated: 2026-08-17
owner: QA / TL
plan: docs/plans/PLAN-REVERSE-560-process-workflow-authority-index.md
pair_artifact: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
pair_freeze_exempt: true
pair_freeze_exempt_kind: cross_layer_meta
pair_freeze_exempt_reason: "workflow-classification-generated-catalogのcanonical pairは既存のL8 runtime test-designが占有しているため、本書はPLAN-REVERSE-560固有のauthority oracleを補助するcross-layer test-designとして明示的に除外する。pair slotの暗黙上書きや孤児化は許可しない。"
---

# process workflow索引 authority再接着単体テスト設計

process索引がrequirements-owned registryを意味authorityとして案内し、異なる分類軸を
旧15-route enumへ戻さないことを検証する。legacy値はinput-only compatibility adapterとして
扱い、current surfaceへ再出力しない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-PWFA-001 | authority pointer | requirements、registry、generated catalog、compatibility inventoryの役割を取り違えたらred | `tests/process-workflow-authority.test.ts` |
| U-PWFA-002 | typed axis | development style／case-driven model／workflow model／subrouteを共通route enumへ畳み込んだらred | `tests/process-workflow-authority.test.ts` |
| U-PWFA-003 | state-machine parent | DiscoveryとScrumのstate machineを同一親へ束ねたらred | `tests/process-workflow-authority.test.ts` |
| U-PWFA-004 | legacy boundary | legacy identityをcurrent PLAN、Issue、PR、DB、doctor、CLI、生成文書へ再出力したらred。曖昧値はfail-closeする | `tests/process-workflow-authority.test.ts` |

current側の失敗をcompatibility側のgreenで相殺しない。テスト実行時はcommand、exit code、
output digestをPLAN review evidenceへ記録する。
