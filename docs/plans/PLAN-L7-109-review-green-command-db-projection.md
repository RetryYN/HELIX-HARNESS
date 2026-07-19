---
plan_id: PLAN-L7-109-review-green-command-db-projection
title: "PLAN-L7-109: review green command の DB projection"
kind: add-impl
layer: L7
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
parent_design: docs/design/harness/L5-detailed-design/physical-data.md
agent_slots:
  - role: tl
    slot_label: "TL - review green command の test_runs projection"
related_l0: docs/governance/helix-harness-concept_v3.1.md
generates:
  - artifact_path: docs/plans/PLAN-L7-109-review-green-command-db-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-109-review-green-command-db-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: tests/review-green-command-projection.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-108-review-green-command-evidence.md
  requires:
    - docs/plans/PLAN-L7-108-review-green-command-evidence.md
    - docs/plans/PLAN-REVERSE-109-review-green-command-db-projection.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-23"
    tests_green_at: "2026-06-23"
    verdict: approve
    scope: "review_evidence.green_commands を harness.db の test_runs へ projection し、green review evidence を PLAN、evidence path、digest で照会可能にする。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests\\review-green-command-projection.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-23"
        evidence_path: tests/review-green-command-projection.test.ts
        output_digest: "sha256:d288dc9ff7118c9cb76e83d2c5357e0312a66a2430a3774933f35f671a227009"
---

# PLAN-L7-109: review green command の DB projection

## 目的

PLAN-L7-108 で導入した `green_commands[]` evidence を PLAN frontmatter だけに残さず、
harness.db から照会できるようにする。

## スコープ

- deterministic な `rebuildHarnessDb` 中に `review_evidence.green_commands[]` を `test_runs` へ projection する。
- command、runner、scope、exit code、evidence path、output digest、completed timestamp を保持する。
- PLAN-L7-108 の green command evidence が `test_runs` に現れることを示す focused regression test を追加する。
- L5 physical data に implementation note を記録する。

## 受入条件

- rebuild は `PLAN-L7-108-review-green-command-evidence` の `test_runs` row を作成する。
- projection された row は exit code 0、evidence path、SHA-256 output digest を持つ。
- `bun test tests\review-green-command-projection.test.ts` が pass する。
- `bun run typecheck`、`bun run lint`、`bun run src\cli.ts doctor` が pass する。
