---
plan_id: PLAN-L7-314-l14-close-audit
title: "PLAN-L7-314 (impl): L14 close-system-foundation audit engine 移植 + checklist を HELIX charter へ再設計"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-04
updated: 2026-07-04
owner: Claude (Opus) / Codex
parent_design: docs/process/gates.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — 単一 audit-matrix doc の表 parser + evidence-path 実在 check + 境界語彙強制 lint を実装"
  - role: tl
    slot_label: "TL — 17 項目 checklist を HELIX 10 本柱 charter + 現行 PLAN inventory へ再導出 (上流 verbatim は不存在 path を cite して自壊するため禁止)"
generates:
  - artifact_path: docs/plans/PLAN-L7-314-l14-close-audit.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/l14-close-audit.ts
    artifact_type: source_module
  - artifact_path: tests/l14-close-audit.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-130-right-arm-gate-planning.md
  requires: []
  references:
    - docs/governance/upstream-uttdd-reconciliation-audit-2026-07-04.md
    - docs/design/helix/L0-charter/helix-charter_v0.1.md
---

# PLAN-L7-314 (impl): L14 完了監査 engine

## Objective

上流の `l14-close-audit.ts`（単一 audit-matrix doc に対する固定 checklist・evidence-path 実在強制・
境界語彙強制の fail-close lint）は LOCAL に等価な aggregate 機構が無い（部分機能が
`right-arm-gate-planning` / `improvement-backlog` / `green-command-digest` へ散在）。**engine（parser +
evidence-check + 境界語彙 check）は低リスク再利用**する一方、**17 項目 checklist は上流固有で verbatim
コピー不可**（LOCAL に存在しない path を cite し即 fail-close＝自壊する）ため、HELIX charter へ再設計する。

## スコープ

### IN
- `src/lint/l14-close-audit.ts`: audit-matrix doc（Item/監査質問/現 evidence/Gap/境界/次アクション/Status）の
  markdown 表を parse、`EXPECTED_ITEMS` 全行存在、status enum、`REQUIRED_EVIDENCE_BY_ITEM` の cite path 実在、
  `REQUIRED_BOUNDARY_MARKERS_BY_ITEM` の語彙強制、partial-without-gap / open-without-next-action の fail-close。
- checklist（EXPECTED_ITEMS / REQUIRED_EVIDENCE / BOUNDARY_MARKERS）を HELIX 10 本柱 charter + 現行 PLAN
  inventory へ再導出（TL 判断 gate）。
- `lint-wiring.ts` / `doctor/index.ts` へ配線、対応 audit doc を `.ut-tdd/audit/` に用意。

### OUT
- 上流の 17 項目・evidence path を verbatim 流用しない。
- checklist 再設計は pmo-sonnet 判断 gate を先に通す（架空 path cite の自壊防止）。

## 受入条件
- 実 LOCAL path のみを cite し、doc 欠落 / 表崩れ / 項目欠落 / evidence path 不在 / 境界語彙欠落を fail-close。
- targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial。
- Step 1: pmo-sonnet 判断 gate で HELIX 版 checklist（EXPECTED_ITEMS 等）を charter + PLAN inventory から再導出。
- Step 2: parser + evidence-path check + 境界語彙 check の engine を実装（Red→Green）。
- Step 3: HELIX 版 audit-matrix doc を `.ut-tdd/audit/` に作成し、実 path を cite。
- Step 4: 配線 + test → review → confirmed。

## 壊さない / 再発させない
- 架空 path cite で自壊する verbatim import を避ける（checklist は必ず LOCAL 実体へ接地）。
- prose claim を test/command で substantiate（PLAN claim 規律）。

## レビュー / 次工程
- 実装は Codex in-flight 着地後、checklist 再設計 gate 通過後に harness workflow で行う。基準点は HEAD。
- 出典: [[upstream-uttdd-reconciliation]] audit §5 Tier1-#4。
</content>
