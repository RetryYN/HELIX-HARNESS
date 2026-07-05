---
plan_id: PLAN-L7-136-harness-db-journal-status-filter
title: "PLAN-L7-136 (troubleshoot): transient harness DB journal status paths の filter"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
backprop_decision: not_required
backprop_decision_reason: "transient local SQLite sidecar files だけを対象にした実装上の filter であり、requirements と design contracts は変更しない。"
agent_slots:
  - role: aim
    slot_label: "AIM - transient DB journal feedback triage"
  - role: tl
    slot_label: "TL - close transient DB journal feedback"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-136-harness-db-journal-status-filter.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/change-impact.ts
    artifact_type: source_module
  - artifact_path: tests/change-impact.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-76-review-remediation-reliability.md
  requires:
    - docs/plans/PLAN-L7-44-harness-db-master.md
    - docs/plans/PLAN-L7-76-review-remediation-reliability.md
review_evidence:
  - reviewer: codex
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23T20:22:27+09:00"
    tests_green_at: "2026-06-23T20:22:27+09:00"
    verdict: pass
    scope: "change-impact と relation-impact projection の前段で、git porcelain input から transient .helix/harness.db journal/WAL/SHM paths を filter した。targeted Vitest、typecheck、DB rebuild、status、doctor で検証した。"
    worker_model: gpt-5-codex
    reviewer_model: gpt-5-codex
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\change-impact.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23T20:22:27+09:00"
        evidence_path: tests/change-impact.test.ts
        output_digest: "sha256:f583ee4eec1487c557b21220de3732663e670b8ae6e6c6bc058a9f5e82cdb7ae"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-23T20:22:27+09:00"
        evidence_path: src/lint/change-impact.ts
        output_digest: "sha256:c9364b56f5a1e2189536c5a5ad4ff9e760e8d435487bbfe650760cdd016a7f2f"
---

# PLAN-L7-136 (troubleshoot): transient harness DB journal status paths の filter

## 0. 目的

`helix db rebuild` が current working tree を projection している間に、
`.helix/harness.db-journal` が `git status --porcelain` に現れ得ることで発生する
誤検知の `missing-projection` feedback を閉じる。SQLite journal family は runtime state であり、
project artifact ではないため、relation-impact evidence として表示しない。

## 1. スコープ

- `parseGitPorcelain` / `loadChangedFiles` の input handling を更新し、downstream gates が
  changed-file set を受け取る前に transient `.helix/harness.db-journal`、
  `.helix/harness.db-wal`、`.helix/harness.db-shm` paths を除外する。
- `.helix/harness.db` 自体は対象外のままとし、active write 中に現れ得る SQLite sidecar files
  だけを filter する。
- 他 runtime が所有する handover markdown changes を含め、non-transient paths はすべて保持する。

## 2. 受入条件

- [x] `parseGitPorcelain` が modified、renamed、untracked paths を引き続き parse できる。
- [x] Transient harness DB journal/WAL/SHM paths が無視される。
- [x] Targeted `change-impact` tests が pass する。
- [x] `helix db rebuild`、`helix status --json`、`helix doctor` が transient journal feedback を
      再導入せずに完了する。

## 3. 検証

- `bun run vitest run tests\change-impact.test.ts`
- `bun run tsc --noEmit`
- `bun run src\cli.ts db rebuild --json`
- `bun run src\cli.ts status --json`
- `bun run src\cli.ts doctor`
