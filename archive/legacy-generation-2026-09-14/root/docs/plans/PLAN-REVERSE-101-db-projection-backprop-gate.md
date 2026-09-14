---
plan_id: PLAN-REVERSE-101-db-projection-backprop-gate
title: "PLAN-REVERSE-101: DB projection backprop gate fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: db
status: confirmed
created: 2026-06-22
updated: 2026-06-22
owner: Codex
forward_routing: L5
promotion_strategy: reuse-as-is
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "Requirements define the DB projection backprop gate."
  - layer: L4-basic-design
    decision: not_impacted
    reason: "The governance gate does not change external runtime function design."
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "The governance gate does not change detailed runtime data or module design."
agent_slots:
  - role: tl
    slot_label: "TL - regression gate fullback review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-101-db-projection-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-101-db-projection-backprop-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-101-db-projection-backprop-gate.md
  requires:
    - docs/plans/PLAN-L7-101-db-projection-backprop-gate.md
---

# PLAN-REVERSE-101: DB projection backprop gate fullback（DB projection backprop gate の fullback）

## R0 証跡

artifact progress color slice は最初に L7 implementation として入り、その後に requirements、
basic design、detailed design、L6 coverage を受け取った。復元された design state は現在
PLAN-L7-56 と PLAN-REVERSE-56 に記録されているが、再発防止の仕組みも Reverse/fullback outcome
として表現しなければならない。

## R1 観測された gap

欠けていた gate は source-code bug ではなかった。governance の blind spot だった:

- `descent-obligation` は upstream FR が存在した後でしか、欠けている downstream coverage を捕捉しない。
- `plan-governance` は user-visible progress color DB projections を、upstream backprop evidence が必要な対象として
  分類していなかった。
- そのため PLAN は `harness-db.ts` / `projection-writer.ts` に触れ、requirements と design artifacts を伴わずに
  `artifact_progress` color semantics を定義できた。

## R2 整合

修正は projection writer ではなく plan governance に残す。source artifact、relation graph、DB projection behavior は
変わらない。将来の progress color projection work に対する PLAN admissibility だけが変わる。

## R3 / R4 結果

`plan-governance` は現在、DB schema/projection writer に触れ、次を伴わずに progress color semantics を導入する
L7 DB implementation plans に対して `db_projection_backprop_missing` を出す:

- a generated or required `PLAN-REVERSE-*`;
- requirements;
- L1 functional requirements と screen requirements;
- L3 functional carry;
- L4 function design;
- L5 physical-data semantics;
- L6 function spec と FR/unit coverage.

2026-06-22 に追加された follow-up R4 gate は、fullback Reverse PLANs に対し、実際の
design/governance/test-design backprop target を `generates` に記名することも要求する。これにより、自身の
markdown record だけを生成しながら PLAN が fullback を主張することを防ぐ。

## DoD（完了条件）

- [x] Root cause を文書化した。
- [x] backprop なしの regression fixture は fail closed する。
- [x] Reverse と L1-L6 coverage を持つ fixture は pass する。
- [x] PLAN-L7-101 は implementation と test artifacts を記録する。
