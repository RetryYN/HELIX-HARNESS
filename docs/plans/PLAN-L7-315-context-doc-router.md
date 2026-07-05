---
plan_id: PLAN-L7-315-context-doc-router
title: "PLAN-L7-315 (impl): context/doc-router — canonical doc の section-index 動的注入 (pillar4 動的コンテキスト注入に直結)"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-04
updated: 2026-07-05
backprop_decision: not_required
backprop_decision_reason: "動的 context section selection の L7 実装であり、新規 product requirement や上位設計の意味変更を追加しない。既存 task-classify と canonical docs を read-only view として利用し、CLI/hook の副作用ある配線は後続に残す。"
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
  - artifact_path: src/context/doc-router.ts
    artifact_type: source_module
  - artifact_path: tests/context-doc-router.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L4-basic-design/architecture.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    artifact_type: design_doc
dependencies:
  parent: null
  requires: []
  references:
    - docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-05T02:04:45+09:00"
    tests_green_at: "2026-07-05T02:04:45+09:00"
    verdict: approve
    scope: "canonical doc の heading/section index と task kind による section selection を pure module として実装し、architecture / module-decomposition に context module を backfill した。no-match / unknown task は whole doc へ fail-open し、元 doc text を書き換えない。CLI/hook への副作用ある配線、role/skill routing、PLAN-M-02 rename cutover は実施していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/context-doc-router.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T02:04:45+09:00"
        evidence_path: tests/context-doc-router.test.ts
        output_digest: "sha256:387305bb8ae6b276b05a6b71919c58bad704380ebfa51f8eb201a02eaaec5020"
      - kind: unit_test
        command: "bun test tests/design-language.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-05T02:04:45+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:c19def4deedbba5683830fae299d9b2f7fce31166b81711806476257ea54f322"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T02:04:45+09:00"
        evidence_path: src/context/doc-router.ts
        output_digest: "sha256:3f81be5a6df0d34b6a2167dfbcc0fc7876a84215effcb7273a182a16cbd1c187"
      - kind: doctor
        command: "./scripts/helix doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-05T02:04:45+09:00"
        evidence_path: docs/governance/upstream-helix-reconciliation-audit-2026-07-04.md
        output_digest: "sha256:60bf2d5d0ec278ab5795f7deecc93d9a377134c3799dd853daa21cfe1d49717b"
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
- Step 1: canonical doc 集合と task-classify kind の対応を確定（TL）→ `CanonicalDocInput` と `TaskKind` mapping へ接地。
- Step 2: DocIndex 構築 + kind→section 選択 + fail-open を実装（Red→Green）→ `src/context/doc-router.ts` へ着地済み。
- Step 3: 注入 hook / CLI との結線点を最小で用意し test → 副作用なしの exported `routeDocContext` として用意。
- Step 4: 検証 → review → confirmed → 本 PLAN で confirmed。

## 壊さない / 再発させない
- fail-open を厳守（router 障害で context が欠落しない）。
- 全 doc 読みの既定動作を回帰させない。

## 着地結果

- `buildDocIndex` は Markdown heading から deterministic な section index を作る。heading が無い doc は whole doc section として扱う。
- `routeDocContext` は `classifyTask` の `TaskKind` を使い、design / add-feature / refactor / troubleshoot / poc / reverse の関連 section を選ぶ。
- unknown task、empty index、no matching section は whole canonical docs へ fail-open する。
- router は canonical doc を正本化せず、元 text を書き換えない read-only view として扱う。
- `tests/context-doc-router.test.ts` が section index、task kind selection、no-match fail-open を固定する。

## 名称 / rename 境界

- current prose と新規 module は HELIX context doc router として扱う。
- `.helix` / `helix` / `area=helix` の物理 rename、ファイル名 rename、distribution cutover は
  PLAN-M-02 の cutover approval と action-binding approval がそろうまで実行しない。

## レビュー / 次工程
- 実装・targeted test・typecheck・doctor は green。PLAN-L7-315 は confirmed。
- 出典: [[upstream-helix-reconciliation]] audit §5 Tier2-#5。
