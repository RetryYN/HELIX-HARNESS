---
plan_id: PLAN-L7-314-l14-close-audit
title: "PLAN-L7-314 (impl): L14 close-system-foundation audit engine 移植 + checklist を HELIX charter へ再設計"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "L14 完了監査 engine を HELIX charter P0-P9 へ接地して doctor hard gate に追加しただけで、上位要求や自律境界の意味を変更していないため。"
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
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/lint-wiring.test.ts
    artifact_type: test_code
  - artifact_path: .helix/audit/A-144-l14-close-audit.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-130-right-arm-gate-planning.md
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
    - docs/design/helix/L0-charter/helix-charter_v0.1.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T04:15:27+09:00"
    tests_green_at: "2026-07-05T04:15:27+09:00"
    verdict: approve
    scope: "L14 完了監査 engine を HELIX charter P0-P9 へ再設計し、audit matrix、required evidence path、境界 marker、non-closed row の差分/次アクションを fail-close にした。PLAN-M-02 cutover、version-up、PO/S4 decision、人間承認 blocker は blocked-human / partial として残し、whole-program completion claim は許可していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/l14-close-audit.test.ts tests/lint-wiring.test.ts tests/doctor.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T04:15:27+09:00"
        evidence_path: tests/l14-close-audit.test.ts
        output_digest: "sha256:ec58bfaeb5316c1eeae4ec58fdbb6752a241c935d9984a407733da10d881974b"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T04:15:27+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:8d536be8810a1ea29ea23ee5de6754cf62f163fc73a0df14e700416ad7195976"
      - kind: doctor
        command: "./scripts/helix doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T04:15:27+09:00"
        evidence_path: .helix/audit/A-144-l14-close-audit.md
        output_digest: "sha256:6eaaa190bac7173603e2681299d45a83e877030ac02f048da8e6a7b299861abc"
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
- `lint-wiring.ts` / `doctor/index.ts` へ配線、対応 audit doc を `.helix/audit/` に用意。

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
- Step 3: HELIX 版 audit-matrix doc を `.helix/audit/` に作成し、実 path を cite。
- Step 4: 配線 + test → review → confirmed。

## 壊さない / 再発させない
- 架空 path cite で自壊する verbatim import を避ける（checklist は必ず LOCAL 実体へ接地）。
- prose claim を test/command で substantiate（PLAN claim 規律）。

## レビュー / 次工程
- 実装は Codex in-flight 着地後、checklist 再設計 gate 通過後に harness workflow で行う。基準点は HEAD。
- 出典: [[upstream-helix-reconciliation]] audit §5 Tier1-#4。
