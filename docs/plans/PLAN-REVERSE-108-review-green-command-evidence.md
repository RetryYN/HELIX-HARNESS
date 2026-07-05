---
plan_id: PLAN-REVERSE-108-review-green-command-evidence
title: "PLAN-REVERSE-108: green command evidence の fullback"
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
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "Requirements は、新規 confirmed review_evidence に必須の hard evidence として green_commands を定義した。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "L4 workflow/review contract は、新規 confirmed/completed entry の green review evidence に green_commands が必須であることを明記した。"
  - layer: L5-detailed-design
    decision: updated
    evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
    reason: "L5 physical data は、review_evidence.green_commands を test_runs / quality_signals の green compliance へ写像する。"
agent_slots:
  - role: tl
    slot_label: "TL - green command evidence reverse fullback"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-108-review-green-command-evidence.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-108-review-green-command-evidence.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/test-before-review.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-108-review-green-command-evidence.md
  requires:
    - docs/plans/PLAN-L7-108-review-green-command-evidence.md
---

# PLAN-REVERSE-108: green command evidence の fullback

## R0 証跡

review evidence gate は従来、`tests_green_at <= reviewed_at` だけを確認していた。
そのため green content は prose のまま残り、PLAN は機械可読な command、runner、
scope、exit code、evidence path、digest を持たずに tests が green だったと記述できた。

## R1 観測されたギャップ

これは progress-color DB idea と同じ種類のギャップである。green state は
test evidence に結び付いていなければならず、そうでない場合、database は
label しか保持できない。Reverse path でも、implementation が design documents を
追い越さないよう、requirements/design への明示的な back-propagation が必要である。

## R2 整合

修正箇所は `review-evidence` lint と frontmatter schema である。これは
product runtime feature ではなく、governance/DB readiness invariant である。
Requirements が hard rule を定義し、L6 test-before-review が contract と
GreenDefinition carry を定義する。

## R3 / R4 結果

2026-06-23 以降の新規または更新された confirmed/completed review evidence は、
`green_commands[]` を含めなければならない。各 command は kind、command、runner、
scope、exit code 0、evidence path、SHA-256 digest を記録しなければならない。
command evidence の欠落または不正は、doctor-visible hard violation である。

## DoD

- [x] Requirements を IMP-108 hard gate で更新した。
- [x] L4 basic design を workflow/review contract で更新した。
- [x] L5 detailed design を DB projection semantics で更新した。
- [x] L6 function design を現在の `green_commands[]` invariant で更新した。
- [x] L7 implementation と frontmatter schema を更新した。
- [x] Unit tests は legacy compatibility、missing evidence、valid evidence、
  nonzero exit rejection をカバーする。
