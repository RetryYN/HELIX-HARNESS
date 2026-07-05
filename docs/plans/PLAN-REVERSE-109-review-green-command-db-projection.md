---
plan_id: PLAN-REVERSE-109-review-green-command-db-projection
title: "PLAN-REVERSE-109: Review green command DB projection fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: db
status: confirmed
created: 2026-06-23
updated: 2026-06-23
owner: Codex
forward_routing: L5
promotion_strategy: reuse-as-is
backprop_scope:
  - layer: requirements
    decision: not_impacted
    reason: "PLAN-L7-108 already added the requirements-level green_commands rule; this slice wires the existing rule into DB projection."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "The external workflow/review contract does not change; only the L5 physical projection implementation is connected."
  - layer: L5-detailed-design
    decision: updated
    evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
    reason: "L5 physical data now records that projectReviewEvidenceRegistry projects review_evidence.green_commands into test_runs."
agent_slots:
  - role: tl
    slot_label: "TL - review green command DB projection fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-109-review-green-command-db-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-109-review-green-command-db-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-109-review-green-command-db-projection.md
  requires:
    - docs/plans/PLAN-L7-109-review-green-command-db-projection.md
---

# PLAN-REVERSE-109: review green command DB projection fullback の反映

## R0 Evidence

PLAN-L7-108 は新規 review evidence に green command evidence を必須化し、
`test_runs.output_digest` を追加した。しかし harness.db rebuild は、該当 frontmatter record から
`test_runs` をまだ生成していなかった。

## R1 観測した Gap

DB は doctor 経由で green command evidence の存在を強制できる一方、どの PLAN / test command /
evidence path が green state を作ったかを回答できなかった。そのため、ユーザーが求める
red / yellow / green の DB progress idea が一部 doc-only のまま残っていた。

## R2 Alignment

projection は `projectReviewEvidenceRegistry` に置く。review evidence が authoring source であり、
`test_runs` は query surface である。これは IMP-109 の狭い実装で、汎用 UT runner ingestion は
future scope に残す。

## R3 / R4 Outcome

rebuild 時に `review_evidence.green_commands[]` を `test_runs` へ投影する。行には command、
runner、scope、exit code、completed timestamp、evidence path、output digest、PLAN id を保持する。

## DoD

- [x] L5 physical data が実装済み projection を記録する。
- [x] L7 projection writer が green command evidence から `test_runs` rows を出力する。
- [x] focused regression test が PLAN-L7-108 の `test_runs` 出現を検証する。
