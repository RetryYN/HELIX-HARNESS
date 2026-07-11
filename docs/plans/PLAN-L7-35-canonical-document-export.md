---
plan_id: PLAN-L7-35-canonical-document-export
title: "PLAN-L7-35 (add-impl): canonical document export"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-09
updated: 2026-06-11
owner: Codex TL / PO
review_evidence:
  - reviewer: code-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-11"
    tests_green_at: "2026-06-11"
    verdict: pass
    scope: "U-DOCEXPORT-001..012 promoted to green tests. Canonical document parsing, deterministic dataset building, built-in CSV/Markdown rendering, optional renderer readiness findings, artifact projection rows, derived-artifact boundary, and stale source snapshot detection are implemented as pure functions. Critical 0 / Important 0. No package installation, Office renderer invocation, generated artifact gate truth, or canonical doc mutation is introduced."
    worker_model: codex-gpt-5
    reviewer_model: codex-gpt-5-intra-runtime-review
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T15:05:58+09:00"
    tests_green_at: "2026-07-09T15:05:58+09:00"
    verdict: approve
    scope: "PLAN-L7-35 の過去 failed test evidence を削除せず、現行 fast suite の green evidence を追加して canonical document export 実装の passed test projection を回復した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run test:fast"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T15:05:58+09:00"
        evidence_path: tests/document-export.test.ts
        output_digest: "sha256:7d0cee1ae554c76191023c276a86d4c7de30817e13bfef210199234426869db4"
agent_slots:
  - role: tl
    slot_label: "TL - canonical document export implementation"
  - role: qa
    slot_label: "QA - U-DOCEXPORT oracle"
generates:
  - artifact_path: src/export/document-export.ts
    artifact_type: source_module
  - artifact_path: tests/document-export.test.ts
    artifact_type: test_code
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-34-canonical-document-export.md
  requires:
    - docs/plans/PLAN-L6-34-canonical-document-export.md
    - docs/plans/PLAN-REVERSE-35-canonical-document-export.md
---

# PLAN-L7-35 (add-impl): canonical document export 実装

## §0 位置づけ

これは PLAN-L6-34 の L7 実装 entry である。Phase 3 では canonical document export core を pure TypeScript projection functions として実装する。実行可能な `helix export docs` CLI surface は後続 route とし、この PLAN では claim しない。

## §1 開始条件

実装は次の条件が満たされるまで開始しない。

- PLAN-L6-34 で function contracts と U-DOCEXPORT oracles が confirmed になっている。
- source 変更前に、`tests/document-export.test.ts` へ U-DOCEXPORT behavior の TDD Red case が追加されている。
- review evidence 前に、既存の doctor、typecheck、lint、targeted tests が green である。
- readiness evidence が存在するまで、optional Office renderers は disabled のままにする。

## §2 実装範囲

開始条件を満たした後に許可する実装は次のとおり。

- canonical document structures の pure parser。
- document matrix と deck outline outputs の dataset builders。
- built-in CSV と Markdown summary rendering。
- XLSX/PPTX/D2 profiles の renderer readiness probes。
- CLI surface は Phase 3 scope 外とし、pure export core が安定した後の follow-up として追加する。

対象外:

- 実際の package installation。
- 生成された XLSX/PPTX を source of truth として扱うこと。
- separate approved import workflow なしに Office files から canonical docs へ edits を import すること。

## §3 作業順序

### 手順 1: [serial] TDD Red 検証

source 変更前に、未実装により U-DOCEXPORT behavior が fail する状態を確認する。

### 手順 2: [serial] pure parser と dataset builder

CLI と renderer code は deterministic document projection output に依存する。

### 手順 3: [parallel] built-in render と optional renderer probes

pure functions が green になった後、CSV/Markdown render と external renderer readiness checks を進められる。

### 手順 4: [serial] review

review evidence 前に、typecheck / lint / targeted tests / doctor が green である必要がある。

## §8 DoD

- [x] source implementation 前に Red test が存在する。
- [x] U-DOCEXPORT-001..012 pass.
- [x] `bun run vitest run tests/document-export.test.ts` passes before review.
- [x] `bun run typecheck` と `bun run lint` が review 前に pass する。
- [x] Reverse fullback により governance/backlog additions を close する。
