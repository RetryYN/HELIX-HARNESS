---
title: "Harness L8 結合検証証跡境界"
layer: L8
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
pair_artifact: docs/test-design/harness/L8-integration-test-design.md
---

# Harness L8 結合検証証跡境界

本書は L5 詳細設計と L8 結合検証の対応を示す。現在の L8 は selected integration profile を証跡化しており、外部環境や本番相当の全結合を完了扱いにしない。

## 対象

| 項目 | 証跡 |
|---|---|
| test-design | `docs/test-design/harness/L8-integration-test-design.md` |
| G8 workflow | `tests/g8-integration-workflow.test.ts` |
| DB / projection | `tests/db-projection-coverage.test.ts`, `tests/db-projection-ingestion.test.ts` |
| relation graph / export | `tests/relation-graph.test.ts`, `tests/document-export.test.ts` |

## 合否条件

- `g8-integration-workflow - OK`。
- selected IT IDs と manifest が stale でない。
- 結合対象の source docs、tests、DB projection が相互参照できる。

## 未完了 blocker

外部 API、GitHub branch protection apply、配布先 publish、state dir cutover は L8 の selected local profile では実行しない。必要な場合は action-binding approval と別 PLAN に分離する。
