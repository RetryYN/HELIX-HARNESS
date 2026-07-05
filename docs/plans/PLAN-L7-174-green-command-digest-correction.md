---
plan_id: PLAN-L7-174-green-command-digest-correction
title: "PLAN-L7-174: green command digest correction"
kind: refactor
layer: L7
drive: db
status: confirmed
created: 2026-06-25
updated: 2026-06-30
owner: Codex
parent_design: docs/process/modes/refactor.md
backprop_decision: not_required
backprop_decision_reason: "Evidence-only correction. Existing green_commands keep the same commands, paths, and exit codes; only stale output_digest values are aligned to the current evidence_path SHA256 contract."
agent_slots:
  - role: se
    slot_label: "SE - green command digest correction"
  - role: tl
    slot_label: "TL - evidence integrity review"
generates:
  - artifact_path: docs/plans/PLAN-L7-174-green-command-digest-correction.md
    artifact_type: markdown_doc
  - artifact_path: .helix/evidence/green-command/20260630-plan-lint-l3-06.json
    artifact_type: other
  - artifact_path: .helix/evidence/green-command/20260630-plan-lint-l4-51.json
    artifact_type: other
  - artifact_path: .helix/evidence/green-command/20260630-legacy-adoption-doctor.json
    artifact_type: other
dependencies:
  parent: docs/plans/PLAN-L7-132-green-command-digest-integrity.md
  requires:
    - docs/plans/PLAN-L7-132-green-command-digest-integrity.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-25T22:34:29+09:00"
    tests_green_at: "2026-06-25T22:34:29+09:00"
    verdict: approve
    scope: "Mechanically align stale green_commands output_digest values to the current SHA256 of each evidence_path and verify the digest hard gate is clean."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\green-command-digest.test.ts --reporter=dot"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-25T22:34:00+09:00"
        evidence_path: tests/green-command-digest.test.ts
        output_digest: "sha256:0c2c2dd640f1908504899dd88b0f863377c4f94c743bd258b667862c3d606ff6"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T22:34:13+09:00"
        evidence_path: src/lint/green-command-digest.ts
        output_digest: "sha256:9e68209eead46fab25457e4ffee97d362a81d2c457120ebc3a88d301c97317d3"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-25T22:34:00+09:00"
        evidence_path: src/lint/green-command-digest.ts
        output_digest: "sha256:9e68209eead46fab25457e4ffee97d362a81d2c457120ebc3a88d301c97317d3"
---

# PLAN-L7-174: green command digest correction の記録

## 目的

残存する `green-command-digest` hard-gate blocker を解消する。
stale な PLAN `green_commands[].output_digest` を、宣言済み `evidence_path` の current SHA256 に合わせる。

## 範囲

- command text、exit code、evidence path、review verdict は変更しない。
- evidence file が存在し、current hash が異なる `output_digest` だけを機械的に更新する。
- self-referential な PLAN-doc `evidence_path` entry は、`.helix/evidence/green-command/` 配下の stable command evidence artifact へ置き換える。同じ PLAN document に埋め込まれた digest は、その document raw SHA256 へ収束できない。
- correction behavior は `src/lint/green-command-digest.ts` と doctor hard-gate aggregation に合わせる。

## 受入条件

- `tests/green-command-digest.test.ts`、typecheck、lint、DB rebuild、doctor が通過する。
- `checkGreenCommandDigests(process.cwd()).mismatches.length === 0`.
- `doctor` reports `green-command-digest — OK`.
