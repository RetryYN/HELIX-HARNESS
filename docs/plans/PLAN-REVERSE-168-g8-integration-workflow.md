---
plan_id: PLAN-REVERSE-168-g8-integration-workflow
title: "PLAN-REVERSE-168: G8 integration workflow の fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-26
updated: 2026-06-26
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/governance/helix-harness-requirements_v1.2.md
    reason: "requirements は G8-G14 を将来の機械化として既に記録している。この slice は product requirements を変更せず、最初の G8 workflow gate を定義する。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "L4 function model は変更しない。この slice は既存の integration-test design row に対する L8 execution workflow を追加する。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/internal-processing.md
    reason: "L5 contracts は変更しない。G8-WORKFLOW は既存の IT-* coverage を選択し、証跡化する。"
  - layer: test-design
    decision: updated
    evidence_path: docs/test-design/harness/L8-integration-test-design.md
    reason: "L8 には confirmed の IT-* row があったが、G8 workflow layer には strategy/plan/condition/coverage/procedure/evidence/exit の明示的な粒度が必要だった。"
  - layer: process-gates
    decision: updated
    evidence_path: docs/process/gates.md
    reason: "G8 は row の存在だけではなく、integration evidence manifest と選択済み IT-* coverage を要求する。"
  - layer: implementation
    decision: updated
    evidence_path: src/lint/g8-integration-workflow.ts
    reason: "Doctor は L8/G8 workflow marker が欠落している場合に fail する。"
agent_slots:
  - role: tl
    slot_label: "TL - G8 workflow fullback 対応"
  - role: qa
    slot_label: "QA - L8/G8 workflow review 対応"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-168-g8-integration-workflow.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/internal-processing.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/process/gates.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/g8-integration-workflow.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
dependencies:
  parent: docs/plans/PLAN-L7-168-g8-integration-workflow.md
  requires:
    - docs/plans/PLAN-L7-168-g8-integration-workflow.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-26T20:30:00+09:00"
    tests_green_at: "2026-06-26T20:30:00+09:00"
    verdict: approve
    scope: "G8 workflow granularity に対する R4 fullback。L8 row は有効なままとし、欠落していた workflow/evidence gate layer を追加して doctor に接続する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests\\g8-integration-workflow.test.ts tests\\lint-wiring.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-26T20:30:00+09:00"
        evidence_path: tests/g8-integration-workflow.test.ts
        output_digest: "sha256:2eab00f92a5bda76ff43a4b215d4620c117939e3221f808603492b5c7ed77d91"
---

# PLAN-REVERSE-168: G8 integration workflow の fullback

## 目的

最初の L8 ascent に対する back-propagation decision を記録する。G8 は概念だけの gate や
IT-* row の確認リストだけでは成立しない。実行可能な workflow contract と doctor enforcement が必要である。

## スコープ

- confirmed 済みの L8 IT-* case design を維持する。
- IT-* row を選択して実行するために欠落していた workflow layer を追加する。
- 必須 workflow marker と gate marker に対する hard doctor check を接続する。
- full L8 close は後続 slice に残し、この slice は workflow の土台とする。

## 受入条件

- L8 test design が `G8-WORKFLOW` を宣言している。
- G8 process text が integration evidence manifest と選択済み IT-* coverage を要求している。
- `g8-integration-workflow` tests が marker 欠落時に fail することを示している。
- Doctor が `g8-integration-workflow - OK` を報告する。
