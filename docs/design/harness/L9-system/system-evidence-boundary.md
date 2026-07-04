---
title: "Harness L9 総合検証証跡境界"
layer: L9
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
pair_artifact: docs/test-design/harness/L9-system-test-design.md
---

# Harness L9 総合検証証跡境界

L9 は L4 architecture / ADR / system contract を system behavior として検査する層である。現時点では doctor と system-oriented regression により selected behavior を検査する。

## 対象

| 項目 | 証跡 |
|---|---|
| architecture | `docs/design/harness/L4-basic-design/architecture.md` |
| system test design | `docs/test-design/harness/L9-system-test-design.md` |
| system gates | `semantic-frontier-consistency`, `right-arm-verification-strategy`, `completion-decision-packet` |
| regression | `bun run test:local`, `./scripts/ut-tdd doctor` |

## 合否条件

- L4/L5/L6 から L7 実装への trace が切れていない。
- completion packet が未完了 frontier を隠さない。
- system behavior の failure は該当する左腕層へ差し戻す。

## 未完了 blocker

S4 decision、version-up activation、identifier rename cutover は L9 selected green では閉じない。各 blocker は status / handover / completion packet で残す。
