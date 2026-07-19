---
plan_id: PLAN-REVERSE-169-g8-integration-evidence-manifest
title: "PLAN-REVERSE-169: G8 evidence manifest の fullback"
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
    reason: "requirements はすでに gate evidence と mechanization を要求しているため、requirement set を変更せずに G8 manifest enforcement を追加する。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/harness/L4-basic-design/function.md
    reason: "functional boundary は変更せず、この slice で L8 evidence selection と state verification を harden する。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/internal-processing.md
    reason: "既存の L5 contracts は有効なままであり、新しい checks により IT-MODULE と IT-STATE evidence を executable にする。"
  - layer: test-design
    decision: updated
    evidence_path: docs/test-design/harness/L8-integration-test-design.md
    reason: "L8 が machine-readable な G8 manifest location を明示する。"
  - layer: implementation
    decision: updated
    evidence_path: src/lint/g8-integration-workflow.ts
    reason: "G8 workflow lint が integration evidence manifests を load して validate する。"
  - layer: runtime-state
    decision: updated
    evidence_path: src/runtime/agent-slots.ts
    reason: "IT-STATE-01 deficiency は、agent slot state の schema validation により close された。"
  - layer: workflow-state
    decision: updated
    evidence_path: src/workflow/contracts-extras.ts
    reason: "IT-STATE-02 deficiency は、drive partition contamination detection により close された。"
  - layer: evidence
    decision: updated
    evidence_path: .helix/evidence/g8-integration/20260626-it-module-state-minimum.json
    reason: "選択された IT-MODULE + IT-STATE coverage は machine-readable になった。"
agent_slots:
  - role: tl
    slot_label: "TL - G8 evidence fullback 確認"
  - role: qa
    slot_label: "QA - IT-MODULE/IT-STATE gap review 確認"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-169-g8-integration-evidence-manifest.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.2.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L4-basic-design/function.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/internal-processing.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-integration-test-design.md
    artifact_type: test_design
  - artifact_path: .helix/evidence/g8-integration/20260626-it-module-state-minimum.json
    artifact_type: json_config
  - artifact_path: src/lint/g8-integration-workflow.ts
    artifact_type: source_module
  - artifact_path: src/runtime/agent-slots.ts
    artifact_type: source_module
  - artifact_path: src/workflow/contracts-extras.ts
    artifact_type: source_module
  - artifact_path: tests/g8-integration-workflow.test.ts
    artifact_type: test_code
  - artifact_path: tests/agent-slots.test.ts
    artifact_type: test_code
  - artifact_path: tests/workflow-contracts.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-169-g8-integration-evidence-manifest.md
  requires:
    - docs/plans/PLAN-L7-169-g8-integration-evidence-manifest.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-26T21:20:00+09:00"
    tests_green_at: "2026-06-26T21:20:00+09:00"
    verdict: approve
    scope: "G8 evidence manifest enforcement の R4 fullback。IT-STATE direct evidence の deficiencies は implementation/test hardening として扱った。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests\\dependency-drift.test.ts tests\\lint-wiring.test.ts tests\\agent-slots.test.ts tests\\workflow-contracts.test.ts tests\\g8-integration-workflow.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-26T21:20:00+09:00"
        evidence_path: tests/g8-integration-workflow.test.ts
        output_digest: "sha256:2eab00f92a5bda76ff43a4b215d4620c117939e3221f808603492b5c7ed77d91"
---

# PLAN-REVERSE-169: G8 evidence manifest の fullback

## 目的

G8 を workflow marker check から evidence-bearing な integration gate へ変更するための
back-propagation decision を記録する。

## 範囲

- confirmed 済みの L8 integration test design を保持する。
- 選択された IT-* coverage に machine-readable な manifest enforcement を追加する。
- 発見された IT-STATE gaps を executable な state tests と partition tests で backfill する。

## 受入条件

- manifest が存在しない場合は G8 violation とする。
- mandatory IT coverage が failed の場合は G8 violation とする。
- IT-MODULE-01/02 と IT-STATE-01/02 は direct executable evidence を持つ。
- `doctor` が `g8-integration-workflow - OK` を report する。
