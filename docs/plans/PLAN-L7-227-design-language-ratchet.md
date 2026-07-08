---
plan_id: PLAN-L7-227-design-language-ratchet
title: "PLAN-L7-227 (add-impl): design-language gate による設計文書の日本語 prose ラチェット"
kind: add-impl
layer: L7
drive: agent
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
created: 2026-07-02
updated: 2026-07-09
backprop_decision: not_required
backprop_decision_reason: "CLAUDE/AGENTS の既存ルールと HELIX L3 の意味ベース機能一覧を機械 enforcement へ落とす add-impl。新しい product requirement や外部 API/DB contract は追加しない。設計/test-design への戻しは PLAN-REVERSE-227 で記録する。"
owner: TL (Codex)
review_evidence:
  - reviewer: TL self-review (single-runtime)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-02T04:45:00+09:00"
    tests_green_at: "2026-07-02T04:44:00+09:00"
    verdict: pass
    scope: "PLAN / 設計 / テスト設計 / process / governance / handover / adapter ルールを含む人間向け docs の日本語 prose 原則を doctor hard gate に接続。既存英語 debt は 7131 件 baseline として可視化し、増加だけを fail-close する。CLAUDE.md 重複規則を除去し、L6 design / L7 test-design / doctor / lint / tests / PLAN trace を同期。"
    worker_model: gpt-5.5
    reviewer_model: gpt-5.5
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/design-language.test.ts tests/doctor.test.ts tests/lint-wiring.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T04:40:00+09:00"
        evidence_path: tests/design-language.test.ts
        output_digest: "sha256:f3e049ff2041c48c7c97ebba3018e589d99ead0139ab8e61cb92fe5db31a79fd"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T04:40:00+09:00"
        evidence_path: src/lint/design-language.ts
        output_digest: "sha256:bf3952366d4eac2233d6e3f017ffb7ad681b28da0f639e1660da00de1186de83"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T04:40:00+09:00"
        evidence_path: src/lint/design-language.ts
        output_digest: "sha256:d70140fb130d8a9ecba8ff31a84823cfd44b12b03d5d04b281cb4cbe94636f05"
agent_slots:
  - role: tl
    slot_label: "TL - design-language gate trace and implementation review"
generates:
  - artifact_path: docs/plans/PLAN-L7-227-design-language-ratchet.md
    artifact_type: markdown_doc
  - artifact_path: CLAUDE.md
    artifact_type: markdown_doc
  - artifact_path: AGENTS.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/module-drift.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/design-language.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/design-language.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-15-module-drift.md
  requires:
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/test-design/helix/L3-pillar-acceptance-test-design.md
    - docs/design/harness/L6-function-design/module-drift.md
    - docs/test-design/harness/L7-unit-test-design.md
    - docs/plans/PLAN-REVERSE-227-design-language-ratchet.md
---

# PLAN-L7-227: design-language gate による設計文書の日本語 prose ラチェット

## 0. 目的

PO 指摘「意味ベースで設計し、要求修正・機能一覧・中身を精読して合わせる」に対し、チャット/adapter 規則だけでなく
設計成果物そのものを機械検査する。人間向け docs は日本語を正本とし、英語 prose を新規追加して完了扱いにする
運用 drift を doctor で fail-close する。

## 1. 要求・設計との対応

- L3 `§0.2 意味ベース機能一覧と要求修正境界` は、confirmed 46 件、frontier、future parked、approval gated
  cutover を分けて扱う。今回の gate はこの「完了僭称を防ぐ」横断規律の docs 言語版である。
- `CLAUDE.md` / `AGENTS.md` の報連相・ドキュメント言語規則は、日本語を原則とし、識別子/コマンド/URL/コード片を
  原語許可する。`design-language` はこの例外を尊重し、英語だけの見出し・説明文を対象にする。
- 既存 debt 7131 件を一括翻訳して別の巨大作業にしない。baseline は免罪ではなくラチェットであり、将来 PLAN で
  段階的に下げる。対象は PLAN / 設計 / テスト設計 / process / governance / handover / adapter ルールを含む
  人間向け docs とする。

## 2. 実装

- `src/lint/design-language.ts` は、`docs/adr/`、`docs/design/`、`docs/governance/`、`docs/test-design/`、
  `docs/process/`、`docs/plans/`、`docs/handover/` と adapter ルール markdown を走査する。
- inline code、URL、frontmatter、コードブロック、日本語を含む行、許可された技術語は除外する。
- `docs/handover/session-handover-YYYY-MM-DD.md` は `.gitignore` 済みの機械生成 session packet であり、
  human-authored handover 正本ではないため走査対象から外す。`docs/handover/SESSION-...` など手書き・正本の
  handover docs は引き続き検査対象に残し、handover 配下全体の抜け道にはしない。
- 英語だけの見出しを `english-heading`、英語だけの説明文を `english-prose` として数える。
- `DESIGN_LANGUAGE_BASELINE_VIOLATIONS=7131` を固定し、baseline 超過時だけ `ok=false` にする。
- `src/doctor/index.ts` の `checkDesignLanguage` で doctor hard gate へ接続する。

## 3. 受入条件

- [x] 日本語 prose と技術識別子は violation にしない。
- [x] 英語だけの見出し・説明文を検出する。
- [x] baseline 以内は OK、baseline 超過は violation にする。
- [x] 実 repo の人間向け docs が baseline を超えない。
- [x] 生成 session handover は対象外にし、手書き handover docs は対象に残す。
- [x] `helix doctor` に `design-language` が表示され、`runDoctor.ok` に連動する。
- [x] `impl-plan-trace` が `src/lint/design-language.ts` を PLAN 紐付きとして扱う。
- [x] PLAN-REVERSE-227 で設計 / test-design への back-fill を記録する。

## 4. 範囲外

- 既存 7131 件の英語 prose 一括翻訳。
- code/test/CLI machine surface の日本語化。
- PLAN-DISCOVERY-10、PLAN-DISCOVERY-07、PLAN-L7-146、PLAN-M-02 の承認待ち frontier を完了扱いにすること。
