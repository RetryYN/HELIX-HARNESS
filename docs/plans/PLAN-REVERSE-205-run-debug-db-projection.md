---
plan_id: PLAN-REVERSE-205-run-debug-db-projection
title: "PLAN-REVERSE-205: L7.5 RUN & Debug DB projection back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: be
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "既存の runtime verification / visualization 要件を DB read model へ投影する実装であり、新規 user requirement は増やさない。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/harness/L4-basic-design/data.md
    reason: "DB は既存の projection read model 方針を維持する。authoring source は JSONL のまま。"
  - layer: L5-detailed-design
    decision: updated
    evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
    reason: "`runtime_verification_events` projection table と runtime acceptance read-model invariant を追加。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "`projectRuntimeVerificationEvents` function contract を追加。"
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-RUNDEBUG-007 を L7 unit oracle として登録。"
agent_slots:
  - role: tl
    slot_label: "TL - runtime verification DB projection reverse review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-205-run-debug-db-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L4-basic-design/data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/physical-data.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-205-run-debug-db-projection.md
  requires:
    - docs/plans/PLAN-L7-205-run-debug-db-projection.md
  references:
    - docs/design/harness/L5-detailed-design/physical-data.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T02:53:00+09:00"
    tests_green_at: "2026-06-30T02:53:00+09:00"
    verdict: approve
    scope: "Reverse back-fill confirms runtime verification DB projection updates L5/L6/L7 evidence without changing user requirements or L4 data architecture."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T02:53:00+09:00"
        evidence_path: docs/design/harness/L5-detailed-design/physical-data.md
        output_digest: "sha256:0a1c082db408d7627b0ddce759b6f62c4919dac544bab952124d206d3bc11adf"
---

# PLAN-REVERSE-205: L7.5 RUN & Debug DB projection back-fill の Reverse 記録

## R0-R4 要約

- R0: RUN & Debug JSONL は append-only evidence として存在していたが、`harness.db` では query できなかった。
- R1: DB read model は valid row を `runtime_verification_events` へ projection する。
- R2: L3/L4 は安定維持とする。この変更は既存の verification / visualization read-model 要件を実装する。
- R3: L5 physical data と L6 function contract を、新しい projection table / function に合わせて更新する。
- R4: `PLAN-L7-205-run-debug-db-projection` とこの Reverse PLAN は `dependencies.requires` で接続する。

## back-fill の意味

追加 table は projection row を証明そのものにはしない。append-only の RUN & Debug
event 由来の runtime classification と acceptance status を保持し、deterministic dashboard が raw JSONL を読まず、
LLM-generated summary に依存せずに runtime evidence を表示できるようにする。

## merge 境界

この Reverse は local projection schema と deterministic rebuild path を更新する。
external provider の起動、public CLI behavior の変更、VSCode visualization surface の実装は行わない。
