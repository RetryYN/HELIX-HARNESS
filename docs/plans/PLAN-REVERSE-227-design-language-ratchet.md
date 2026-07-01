---
plan_id: PLAN-REVERSE-227-design-language-ratchet
title: "PLAN-REVERSE-227 (reverse/back-fill): design-language gate を L6/L7 設計へ合流"
kind: reverse
layer: cross
drive: agent
status: confirmed
created: 2026-07-02
updated: 2026-07-02
owner: TL (Codex)
workflow_phase: R4
forward_routing: gap-only
promotion_strategy: reuse-as-is
confirmed_reverse_type: design
review_evidence:
  - reviewer: TL self-review (single-runtime)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-02T04:45:00+09:00"
    tests_green_at: "2026-07-02T04:44:00+09:00"
    verdict: pass
    scope: "PLAN-L7-227 の design-language lint を L6 module-drift addendum と L7 unit test design U-DESLANG に戻し、CLAUDE.md / AGENTS.md のドキュメント言語規則と doctor hard gate の関係を明示した。"
    worker_model: gpt-5.5
    reviewer_model: gpt-5.5
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/design-language.test.ts tests/doctor.test.ts tests/lint-wiring.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T04:40:00+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:f3e049ff2041c48c7c97ebba3018e589d99ead0139ab8e61cb92fe5db31a79fd"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T04:40:00+09:00"
        evidence_path: docs/plans/PLAN-REVERSE-227-design-language-ratchet.md
        output_digest: "sha256:08eec705b4fd27feeed11f8f6935c9f17d12fb25b95037e8f03bc1dfc0bd7f10"
agent_slots:
  - role: tl
    slot_label: "TL - design-language back-fill review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-227-design-language-ratchet.md
    artifact_type: markdown_doc
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/module-drift.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-227-design-language-ratchet.md
---

# PLAN-REVERSE-227: design-language gate を L6/L7 設計へ合流

## 0. 位置づけ

PLAN-L7-227 の bottom-up 実装を設計文書へ戻す Reverse 記録である。今回の要求は新しい product requirement ではなく、
既存の「日本語で報連相・人間向け docs を書く」規律を doctor hard gate にすることなので、L6 module-drift addendum と
L7 unit test design の U-DESLANG oracle へ合流する。

## 1. 逆流反映内容

- `CLAUDE.md` / `AGENTS.md`: ドキュメント言語規則を整理し、`design-language` gate の baseline ratchet を明記。
- `docs/design/harness/L6-function-design/module-drift.md`: design-language lint 追補を追加し、対象、baseline、doctor contract を定義。
- `docs/test-design/harness/L7-unit-test-design.md`: U-DESLANG-001〜004 と trace 行を追加。

## 2. 非変更

- HELIX L3 の confirmed 43 件、amendment frontier、future parked、approval gated cutover の意味分類は変更しない。
- 既存 7131 件の英語 prose debt はこの PLAN では翻訳しない。baseline を下げる作業は別 PLAN とする。
- PLAN-DISCOVERY-07 / PLAN-DISCOVERY-10 / PLAN-L7-146 / PLAN-M-02 の未承認 frontier を完了扱いにしない。

## 3. 完了条件

- [x] L7 add-impl PLAN が本 Reverse PLAN を `dependencies.requires` に持つ。
- [x] 本 Reverse PLAN が L7 add-impl PLAN を `dependencies.requires` に持つ。
- [x] L6 design / L7 test-design / CLAUDE.md の back-fill artifact を `generates` に宣言する。
- [x] `backfill` / `plan-governance` / `impl-plan-trace` が green になる。
