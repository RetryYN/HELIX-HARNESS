---
title: "HELIX L10 UX 検証境界"
layer: L10
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
pair_artifact: docs/test-design/helix/L2-screen-ux-test-design.md
---

# HELIX L10 UX 検証境界

L10 は L2 モックを実データ・実操作・accessibility で検証する層である。現時点では component-derived UI slice があるが、L10 完了ではない。

## 現在の証跡

| 項目 | 証跡 |
|---|---|
| component-derived slice | `src/web/**`, `tests/web.test.ts`, `docs/plans/PLAN-L7-141-web-dashboard-component-derived.md` |
| L2 boundary | `docs/design/helix/L2-screen/screen-mock-boundary.md` |
| test-design | `docs/test-design/helix/L2-screen-ux-test-design.md` |
| doctor signal | `screen-impl-pair-freeze - OK (実装宣言なし = mock 段階, next_pair_freeze=L10)` |

## 証跡対応

| L10 観点 | source / surface | test / oracle | 境界 |
|---|---|---|---|
| selected G10 workflow | `src/lint/g10-ux-workflow.ts` | `tests/g10-ux-workflow.test.ts` | selected / mandatory UXV case を検査する。手動 accessibility review や S4 後 visualization route の代替にはしない。 |
| L2 mock boundary | `docs/design/helix/L2-screen/screen-mock-boundary.md` / `docs/test-design/helix/L2-screen-ux-test-design.md` | `tests/vmodel-pair.test.ts` | L2 mock と L10 UX test-design の pair を保持する。mock 段階を実装完了に読み替えない。 |
| component-derived UI slice | `src/web/**` / `PLAN-L7-141-web-dashboard-component-derived` | `tests/web.test.ts` / `frontend-design-coverage` doctor gate | component-derived slice の deterministic behavior を見る。whole UI delivery や UAT pass は claim しない。 |

## 完了条件

L10 完了には、実データでの主要操作確認、WCAG 観点、未収束 blocker の表示、action surface の approval-bound 化、S4 confirmed 後の visualization route が必要である。
