---
title: "PLAN開始シグナル正本"
layer: L6
artifact_type: design
status: confirmed
created: 2026-09-02
updated: 2026-09-02
owner: plan-entry-routing
plan: docs/plans/PLAN-RECOVERY-88-plan-entry-canonical-signal.md
pair_artifact: docs/test-design/helix/L8-plan-entry-canonical-signal-authority-unit-test-design.md
---

# PLAN開始シグナル正本

## 責務

`entry_signals`の値がDB feedback／issue queueで解決されない場合、requirements-owned catalogへ
exact tokenとして照合する。分類済みtokenだけを`catalog_signal`として返し、人間由来の
directive／approval／ADR decision provenanceを付与しない。

unknown、ambiguous、decision-requiredは既存のtyped fail-closeへ渡す。`po_directive:`は
#1449で廃止範囲を確定するまでcompatibility inputとしてのみ維持する。
