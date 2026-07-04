---
plan_id: PLAN-L7-313-g9-g10-workflow-gate
title: "PLAN-L7-313 (impl): G9 system-workflow / G10 UX-workflow gate 機械化 — right-arm-gate-planning が追跡する自己 carry を閉じる"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-04
updated: 2026-07-04
owner: Claude (Opus) / Codex
parent_design: docs/process/gates.md
related_l0: docs/governance/helix-agent-harness-concept_v3.1.md
agent_slots:
  - role: se
    slot_label: "SE — g9-system-workflow.ts / g10-ux-workflow.ts + 共有 gN-evidence-manifest helper を実装し lint-wiring/doctor へ配線"
  - role: tl
    slot_label: "TL — ST-*/UXV-* family を LOCAL の L9 test-design / L10 visual-design へ接地、verification-profile 経由配線、G8 との一貫性レビュー"
  - role: qa
    slot_label: "QA — evidence manifest schema の fail-close 回帰 (mandatory 未 pass / stale defer / digest 欠落)"
generates:
  - artifact_path: docs/plans/PLAN-L7-313-g9-g10-workflow-gate.md
    artifact_type: markdown_doc
  # draft のため generates は実在する自 doc のみ。生成予定 (g9/g10 lint + 共有 gN-evidence-manifest helper + test) は本文 §スコープ参照。実装着地時に generates へ追加する。
dependencies:
  parent: docs/plans/PLAN-L7-130-right-arm-gate-planning.md
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
    - docs/plans/PLAN-L9-00-system-verification-master.md
    - docs/plans/PLAN-L10-00-ux-verification-master.md
---

# PLAN-L7-313 (impl): G9 / G10 workflow gate 機械化

## Objective

`docs/process/gates.md` §1 が「G9-G14 は evidence profile 定義済・子 PLAN 実装待ち」と明記し、
`src/lint/right-arm-gate-planning.ts` + IMP-052 が fail-close 追跡している自己 carry のうち、
G9（総合テスト品質）と G10（UX 磨き品質）の executable evidence gate を、上流実装を参考に
HELIX 式で機械化する。G8（`g8-integration-workflow.ts`）と同じ profile-driven 配線に揃える。

## スコープ

### IN
- `src/lint/g9-system-workflow.ts`: L9 test-design の必須 marker + ST-* rows（LOCAL family へ接地）+
  `.ut-tdd/evidence/g9-system/*.json` manifest（digest / in-repo evidence path / mandatory 被覆 / stale defer 0 / exit_criteria）を検証。
- `src/lint/g10-ux-workflow.ts`: L10 visual-design の marker + UXV-* rows + `.ut-tdd/evidence/g10-ux/*.json` を同型検証。
- G9/G10 は ~90% ロジック共通のため **共有 helper `gN-evidence-manifest.ts`** を切り出して重複排除。
- `verification-profile.ts` / `verification-profile-catalog.ts` 経由で profile-driven 選択、`lint-wiring.ts` / `doctor/index.ts` へ配線。
- G10 の UXV 判断 item は `advisor-fable` evidence record と紐付け（traceability）。

### OUT
- 上流の ST-*/UXV-* family 語彙を verbatim 流用しない（LOCAL 現行 test-design/visual-design へ再導出）。
- G11-G14 の機械化は本 PLAN 対象外（別 child PLAN）。

## 受入条件
- G9/G10 lint が marker 欠落 / mandatory 未 pass / stale defer / digest 欠落 / evidence path 不在を fail-close。
- `PLAN-L9-00` / `PLAN-L10-00` master を延長（重複 PLAN を作らない）、`right-arm-gate-planning` の carry を減らす。
- targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial。
- Step 1: LOCAL の L9 test-design / L10 visual-design の現行 ST-*/UXV-* 分類を確認し family 語彙を接地（TL）。
- Step 2: 共有 `gN-evidence-manifest.ts` helper を実装（Red→Green）。
- Step 3: g9-system-workflow.ts を実装・配線・test。
- Step 4: g10-ux-workflow.ts を実装・配線・test（advisor-fable evidence 紐付け含む）。
- Step 5: master PLAN 延長 + gates.md 注記更新 → review → confirmed。

## 壊さない / 再発させない
- G8 の profile 配線と一貫させ、独自 flat model を持ち込まない。
- IMP-052 を carry へ戻さない（implemented を維持しつつ子 gate を close）。

## レビュー / 次工程
- 実装は Codex in-flight 着地後に harness workflow で行う。基準点は HEAD。
- 出典: [[upstream-helix-reconciliation]] audit §5 Tier1-#2/#3。
