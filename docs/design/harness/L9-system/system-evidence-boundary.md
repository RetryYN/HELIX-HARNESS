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

## G9-WORKFLOW

| marker | 内容 |
|---|---|
| system_test_strategy | L4 architecture / function / external-if / UI standard を selected system behavior として検査する。 |
| system_test_plan | ST family ごとに mandatory item と regression command を選ぶ。 |
| system_test_conditions | ST-* rows は L4 design / process / adapter / UI 境界と対応する。 |
| system_coverage_items | ST-DATA / ST-ARCH / ST-FUNC / ST-EXT / ST-UI / ST-ASSET を最低 family とする。 |
| system_test_procedures | mapped command を実行し、exit code と digest を manifest に記録する。 |
| system_execution_evidence | `g9-system-evidence-v1` manifest が command、ST item、path、result を持つ。 |
| system_exit_criteria | mandatory ST は全 pass、stale defer は 0。 |
| system_defect_routing | failure は L9 修正、Reverse、Refactor、Incident へ route する。 |

### G9 選定 ST coverage

| ST-ID | family | 現在の selected evidence |
|---|---|---|
| ST-DATA-01 | ST-DATA | `doctor` / `impl-plan-trace` / `oracle-test-trace` |
| ST-ARCH-01 | ST-ARCH | `dependency-drift` / `module-drift` |
| ST-FUNC-01 | ST-FUNC | `workflow-contracts` / `semantic-frontier-consistency` |
| ST-EXT-01 | ST-EXT | `runtime-adapter` / `codex-wrapper-parity` |
| ST-UI-01 | ST-UI | `frontend-design-coverage` / `screen-impl-pair-freeze` |
| ST-ASSET-01 | ST-ASSET | `asset-drift` / `skill-assignment` |

## 未完了 blocker

S4 decision、version-up activation、identifier rename cutover は L9 selected green では閉じない。各 blocker は status / handover / completion packet で残す。
