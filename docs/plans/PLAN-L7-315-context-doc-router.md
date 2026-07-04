---
plan_id: PLAN-L7-315-context-doc-router
title: "PLAN-L7-315 (impl): context/doc-router — canonical doc の section-index 動的注入 (pillar4 動的コンテキスト注入に直結)"
kind: impl
layer: L7
drive: agent
status: draft
created: 2026-07-04
updated: 2026-07-04
owner: Claude (Opus) / Codex
parent_design: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — canonical docs の heading/section index を構築し task-classify kind に応じて関連 section のみ注入 (fail-open = no-match なら全 doc)"
  - role: tl
    slot_label: "TL — CLAUDE.md Read Order との整合・fail-open 設計・注入対象の正本性レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-315-context-doc-router.md
    artifact_type: markdown_doc
  # draft のため generates は実在する自 doc のみ。生成予定 (context/doc-router + test) は本文 §スコープ参照。実装着地時に generates へ追加する。
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
---

# PLAN-L7-315 (impl): context/doc-router 動的コンテキスト注入

## Objective

CLAUDE.md が自称する設計 pillar 4「動的コンテキスト/スキル注入 = relevant context と skills だけを load」を
機械化する。上流 `src/context/doc-router.ts`（canonical doc の heading/section index を task-classify kind で
引き、全 doc ではなく関連 section だけ注入）に LOCAL 等価物が無い（`sub-doc-section-structure.ts` は別目的、
`tier-router.ts`/`vmodel/injection.ts` は role/skill 経路）。fail-open・read-only・安全境界非接触で HELIX 式に実装。

## スコープ

### IN
- `src/context/doc-router.ts`: CLAUDE.md 等 canonical doc の `DocSection`/`DocIndex` を構築、
  `src/task/classify.ts` の kind をキーに関連 section を選択して注入用に返す。
- no-match / parse 失敗時は **fail-open**（該当 doc 全体を読む指示に fallback）。
- 既存 injection 経路（`vmodel/injection.ts` / `tier-router.ts`）とは責務分離（doc section 注入のみ）。

### OUT
- role/skill routing は変更しない。
- 注入する doc を正本化しない（正本は元 doc、router は view）。

## 受入条件
- task kind に応じ関連 section を返し、no-match で fail-open。
- CLAUDE.md Read Order の正本性を壊さない。
- targeted test green、doctor / lint / typecheck / plan lint green。confirmed 前に review evidence 記録。

## スケジュール
- mode: serial。
- Step 1: canonical doc 集合と task-classify kind の対応を確定（TL）。
- Step 2: DocIndex 構築 + kind→section 選択 + fail-open を実装（Red→Green）。
- Step 3: 注入 hook / CLI との結線点を最小で用意し test。
- Step 4: 検証 → review → confirmed。

## 壊さない / 再発させない
- fail-open を厳守（router 障害で context が欠落しない）。
- 全 doc 読みの既定動作を回帰させない。

## レビュー / 次工程
- 実装は Codex in-flight 着地後に harness workflow で行う。基準点は HEAD。
- 出典: [[upstream-helix-reconciliation]] audit §5 Tier2-#5。
