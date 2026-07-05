---
plan_id: PLAN-REVERSE-107-reverse-fullback-scope-gate
title: "PLAN-REVERSE-107: Reverse fullback scope gate の fullback"
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
    reason: "Requirements は明示的な Reverse fullback scope gate を定義している。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "governance gate は外部 runtime function design を変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "governance gate は詳細な runtime data や module design を変更しない。"
agent_slots:
  - role: tl
    slot_label: "TL - Reverse fullback scope rule review の確認"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-107-reverse-fullback-scope-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-107-reverse-fullback-scope-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-107-reverse-fullback-scope-gate.md
  requires:
    - docs/plans/PLAN-L7-107-reverse-fullback-scope-gate.md
---

# PLAN-REVERSE-107: Reverse fullback scope gate の fullback

## R0 証跡

progress-color fullback は requirements と design layer を正しく更新したが、
汎用 gate は fullback が upstream artifact を 1 件以上生成したことだけを確認していた。
そのため、将来の fullback が requirements を更新しながら、L4 basic design または
L5 detailed design の影響分類を黙って省略できる抜け穴が残っていた。

## R1 観測された gap

PLAN-REVERSE-56 以後の既存 2026-06-22 fullback PLAN は requirements evidence を
生成していたが、L4/L5 が更新済み、影響なし、または deferred のどれかを明示していなかった。
作業の大半は governance-only だったため L4/L5 変更は必須ではなかったが、
no-impact 判断が machine-readable ではなかった。

## R2 整合

この修正は `plan-governance` に属する。対象の invariant は runtime behavior ではなく
PLAN の admissibility に関するものだからである。Fullback R4 は、ユーザーが求めた
requirements、basic design、detailed design と同じ layer 粒度で照会可能でなければならない。

## R3 / R4 結果

`plan-governance` は R4 fullback に `backprop_scope` を要求するようになった。
各 fullback は `requirements`、`L4-basic-design`、`L5-detailed-design` を
`updated`、`not_impacted`、`deferred` のいずれかに分類しなければならない。
`updated` entry は生成された evidence path を示す必要がある。現行の 2026-06-22
fullback には、明示的な scope decision を backfill 済みである。

## DoD

- [x] Requirements が新しい gate を記録している。
- [x] 現行 fullback PLAN が requirements/L4/L5 の scope decision を公開している。
- [x] scope 欠落と stale evidence fixture が失敗する。
- [x] green fixture が成功する。
