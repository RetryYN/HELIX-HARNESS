---
title: "HELIX L11 UX 受入検証境界"
layer: L10
canonical_vmodel: L1-L12
canonical_layer: L11
canonical_pair: L2
legacy_physical_layer: L10
kind: design
status: draft
freeze_blocking: true
created: 2026-07-04
updated: 2026-09-14
owner: Codex
pair_artifact: docs/test-design/helix/L2-screen-ux-test-design.md
---

# HELIX L11 UX 受入検証境界

L11はL2要求を実データ・実操作・accessibilityで受入検証する層である。L3要件を検証するL10総合テストとは責務が異なる。
本revisionは現行層への整備案であり、旧confirmedは引き継がない。物理pathと`layer: L10`は旧projectionとして保持する。
以下は参照先の一覧であり、現在の実行結果や受入済みを示す証拠ではない。

## 検証対象と証跡の参照先

| 項目 | 証跡 |
|---|---|
| component-derived slice | `src/web/**`, `tests/web.test.ts`, `docs/plans/PLAN-L7-141-web-dashboard-component-derived.md` |
| L2 boundary | `docs/design/helix/L2-screen/screen-mock-boundary.md` |
| test-design | `docs/test-design/helix/L2-screen-ux-test-design.md` |
| 旧doctor出力の扱い | 旧`next_pair_freeze=L10`や単独のOK表示を、現行L11受入の証拠にしない |

## 証跡対応

| L11への証跡の適用範囲 | source / surface | test / oracle | 境界 |
|---|---|---|---|
| selected G10 workflow | `src/lint/g10-ux-workflow.ts` | `tests/g10-ux-workflow.test.ts` | selected / mandatory UXV case を検査する。手動 accessibility review や S4 後 visualization route の代替にはしない。 |
| L2 mock boundary | `docs/design/helix/L2-screen/screen-mock-boundary.md` / `docs/test-design/helix/L2-screen-ux-test-design.md` | `tests/vmodel-pair.test.ts` | 文書間のpairの存在を検査する。L2要求の合意やL11実操作受入を証明するテストではない。 |
| component-derived UI slice | `src/web/**` / `PLAN-L7-141-web-dashboard-component-derived` | `tests/web.test.ts` / `frontend-design-coverage` doctor gate | component-derived slice の deterministic behavior を見る。whole UI delivery や UAT pass は claim しない。 |

## 完了条件

L11受入には、実データでの主要操作確認、WCAG 観点、未収束 blocker の表示、action surface の approval-bound 化、S4 confirmed 後の visualization route が必要である。

各結果をL2要求ID・要求revision・合意済みプロトrevisionへ結び付ける。GitHub IssueやPRの状態で合意・受入を代用しない。対テスト設計のcanonical再利用禁止は、個別delta・oracle・独立review evidence・digest更新まで維持する。
