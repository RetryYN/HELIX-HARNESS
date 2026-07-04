---
title: "Harness L10 UX 検証境界"
layer: L10
kind: design
status: confirmed
parent_doc: docs/design/harness/L2-screen/wireframe.md
pair_artifact: docs/design/harness/L2-screen/wireframe.md  # L2↔L10 self-pair (IMP-039/058: wireframe mock 自体が③ペアを担い L10 独立 test-design doc を作らない)。L2 全 sub-doc を束ねた検証は impl 後の本 L10 で行う
related_l0: docs/governance/helix-agent-harness-concept_v3.1.md
related_br: docs/design/harness/L1-requirements/business-requirements.md
plan: docs/plans/PLAN-L4-14-ui-standard.md
superseded_design_role: docs/design/harness/L4-basic-design/ui-standard.md
created: 2026-06-24
updated: 2026-06-24
---

# L10 UX 検証境界 — impl 後の UX 確定 / WCAG 検証

> **層配置是正 (PLAN-L4-14、2026-06-24)**: 本 doc は当初 (`d8a5d2c`) **再利用 FE 設計標準 (部品/色/
> design tokens)** を author していたが、それは impl **前**に要る方式設計/開発標準であり L10 ではなく
> **L4** に降ろすのが正しい (`data` = DB 設計標準の FE 対応物、document-system-map §1b)。よって設計標準の
> substance は [L4 ui-standard.md](../L4-basic-design/ui-standard.md) + [L4 tokens.yaml](../L4-basic-design/tokens.yaml)
> へ re-home した。本 L10 doc は **impl 後の UX 磨き / WCAG 実比検証 (L2 の右腕ペア、`V_MODEL_PAIRS`
> L2↔L10)** の検証境界として残す。現時点で L10 完了を主張せず、完了条件と未完了 blocker を明示する。

## L10 の役割 (impl 後)

L10 = **UX 磨き** (document-system-map §1 L10 行「FE デザイン確定 / UX 検証」、WCAG 2.2 / ISO 9241-110)。
src/web 実装 (L7、PLAN-L7-141) が成立した **後**に、実装済 UI を磨き、a11y/visual を実レンダリングで検証する
工程。L2 ワイヤーモックの右腕ペア (IMP-039/058: mock 自体が ③ pair を担い、`docs/test-design/` に独立
test-design doc は作らない)。

## なぜ今は完了ではないか

- 再利用 FE 設計標準 (部品/色/tokens、impl 前に要る) は [L4 ui-standard](../L4-basic-design/ui-standard.md) が持つ。
- L10 が担うのは **impl 後**の UX 磨きと WCAG 実比検証だが、src/web 実装 (L7-141) が未着手のため、磨く対象が
  まだ存在しない。よって本 doc は実装到達後に author する (forward 順: L4 設計標準 → L7 impl → 本 L10 磨き)。
- G10 完了には UX 磨き完了の PO サインオフ、実レンダリング証跡、accessibility finding の処理、未完了 blocker の表示確認が必要である。

## 合否条件

- 実装済み UI に対する render smoke、主要導線 screenshot、WCAG 2.2 観点、未完了 blocker 表示が証跡化されている。
- L2 screen mock と差異がある場合は、L2/L4/L6 へ backprop route が記録されている。
- `screen-impl-pair-freeze` が L10 到達条件を満たし、S4 / cutover / activation blocker を隠さない。

## trace

- 上流: [L2 wireframe](../L2-screen/wireframe.md) (mock = self-pair) + [L4 ui-standard](../L4-basic-design/ui-standard.md) (FE 設計標準) + L7 src/web 実装。
- 下流: G10 UX 承認 → L11 総合レビュー+UAT。
