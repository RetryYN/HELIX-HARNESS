---
plan_id: PLAN-REVERSE-203-legacy-adoption-decisions
title: "PLAN-REVERSE-203: 旧 HELIX semantic adoption decision の back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/legacy-helix-extension.md
    reason: "HLX-FR-01..12 は既に confirmed。今回の L7 は既存 L6 function contract の pure implementation であり、新規 user requirement を増やさない。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/helix/L4-basic-design/legacy-helix-extension.md
    reason: "runtime building block 内の pure decision helper であり、module boundary / adapter boundary を変えない。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/helix/L5-detail/legacy-helix-extension.md
    reason: "HLX-C01..12 の contract shape は維持。DB schema/API 契約は追加しない。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/legacy-helix-extension.md
    reason: "RuntimeSurface を既存 RUN & Debug 語彙へ同期し、RunDebugTraceDecision / CoreInjectionDecision の返却 sketch を実装事実へ back-fill。"
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-HLX-001..013 を L7 unit oracle として登録。"
agent_slots:
  - role: tl
    slot_label: "TL - legacy adoption reverse back-fill レビュー"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-203-legacy-adoption-decisions.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/legacy-helix-extension.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/legacy-helix-extension.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/legacy-helix-extension.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/legacy-helix-extension.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/legacy-helix-extension.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-203-legacy-adoption-decisions.md
  requires:
    - docs/plans/PLAN-L7-203-legacy-adoption-decisions.md
  references:
    - docs/design/helix/L6-function-design/legacy-helix-extension.md
    - docs/test-design/helix/legacy-helix-extension.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:00:00+09:00"
    tests_green_at: "2026-06-30T03:00:00+09:00"
    verdict: approve
    scope: "Reverse back-fill は、旧 HELIX semantic adoption の L7 pure decision が既存 L3-L6 contract へ対応し、user requirement、L4 module boundary、L5 data/API contract を変えないことを確認した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:00:00+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:8b0a5469d89a2f6632771b0c46a574b99cf7f0f0efe9b24bcdabe3d306b835cf"
---

# PLAN-REVERSE-203: 旧 HELIX semantic adoption decision の back-fill

## R0-R4 要約

- R0: `src/runtime/legacy-adoption.ts` は、L6 へ落とし込まれた旧 HELIX semantic adoption
  decision を実装する。
- R1: 実装は pure であり、旧 Python/Bash runtime code は port しない。
- R2: L3/L4/L5 を確認済み。この slice は新規 user requirement、module boundary、DB schema、
  API contract を追加しない。
- R3: L6 type sketch と L7 unit-test design は、現在の `RuntimeSurface` 語彙および
  `U-HLX-001..013` implementation oracle に合わせて更新済み。
- R4: `PLAN-L7-203-legacy-adoption-decisions` とこの Reverse PLAN は
  `dependencies.requires` で接続されている。

## Back-Fill した意味

この実装により legacy adoption decision は実行可能になる。HELIX は、旧 runtime file、global path、
raw state を現在の truth として扱わずに、legacy capability を採用するか、harden するか、defer するか、
reject するか、新規 PLAN へ route するかを test できる。

## Merge 境界

この Reverse は L6 sketch と L7 unit oracle registration だけを back-fill する。すべての decision helper
について、旧 HELIX runtime parity、public CLI wiring、DB projection が完了したとは主張しない。
