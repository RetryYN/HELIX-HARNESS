---
plan_id: PLAN-REVERSE-56-artifact-progress-state
title: "PLAN-REVERSE-56: artifact progress state fullback の記録"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: db
status: confirmed
created: 2026-06-22
updated: 2026-06-23
owner: Codex
forward_routing: L5
promotion_strategy: reuse-as-is
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "requirements が artifact progress の色判定 contract を定義する。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "basic design が artifact progress projection の building block を記録する。"
  - layer: L5-detailed-design
    decision: updated
    evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
    reason: "detailed design が物理的な artifact progress state の意味を記録する。"
agent_slots:
  - role: tl
    slot_label: "TL - artifact progress fullback review の確認"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-56-artifact-progress-state.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L1-requirements/functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L1-requirements/screen-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L3-functional/functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/fr-unit-coverage.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L7-56-artifact-progress-state.md
  requires:
    - docs/plans/PLAN-L7-56-artifact-progress-state.md
---

# PLAN-REVERSE-56: artifact progress state fullback の記録

## R0 証跡

PLAN-L7-56 は `artifact_progress` を再構築可能な harness.db projection として追加した。実装は
relation graph の source node、紐づく `covered-by` test edge、未解決の impact result から
red/yellow/green の行を導出する。

## R1 観測した差分

実装により、`physical-data` だけではなく上位設計にも次の差分があることが分かった。

- L1 functional requirements に artifact 単位の進捗色 requirement がなかった。
- L1 screen requirements で red/yellow/green の artifact state をどこに表示するかが未定義だった。
- L3 carry と L4 function building block に progress projection が含まれていなかった。
- L6 function/unit coverage に progress color decision の決定的 contract がなかった。
- governance requirements §6.8.6/§6.8.7 が color contract を定義していなかった。
- `physical-data.md` は table を宣言していたが、明示的な color invariant が必要だった。

## R2 整合

この projection は引き続き derived data として扱う。authoring truth は source file、test、
PLAN frontmatter、relation graph projection、impact result、recovery/fullback PLAN に残す。新しい
product workflow phase は導入しない。ただし color contract は隠れた DB 実装詳細ではなく、
ユーザーに見える progress management の意味を持つため、新しい P1 requirement として FR-L1-51 を登録する。

## R3 / R4 結果

fullback は完了した。requirements §6.8.6/§6.8.7、L1 FR-L1-51、screen trace、L3 carry、
L4 function building block、L5 physical-data の color invariant は、schema/projection/CLI/test
実装と同じ contract を記述している。

L6 follow-up も完了した。`function-spec.md` は `deriveArtifactProgressDecision` /
`projectArtifactProgress` を定義し、`fr-unit-coverage.md` は FR-L1-51 を U-FR-L1-51 へ対応づける。

2026-06-23 の hardening により、同じ fullback scope 内で workflow-coupling の差分を閉じた。
`artifact_progress` は green 判定に紐づく passing `test_runs` 証跡を要求し、relation-impact check の
metadata を記録し、source/design/test-design/plan/requirement node を対象に含める。また recovery PLAN
link を記録し、red/yellow の行を DB から trigger 可能な workflow input として `feedback_events` へ反映する。

## DoD

- [x] Forward L7 implementation を特定した。
- [x] 下位 layer と上位 layer の design impact を分類した。
- [x] requirements level の更新を適用した。
- [x] basic design と detailed design の更新を適用した。
- [x] L6 function contract と FR unit coverage を適用した。
- [x] この DB read model に追加 backlog item は不要であり、差分は fullback で閉じた。
