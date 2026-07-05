---
plan_id: PLAN-REVERSE-208-codex-hook-feature-enable-gate
title: "PLAN-REVERSE-208: Codex hook feature enablement back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: fullstack
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L1-requirements/pillar-requirements.md
    reason: "Codex runtime parity and adapter preimplementation are already required. This back-fill hardens the enablement proof."
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    reason: "No block or external boundary changes. The change is a repo-local adapter gate."
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    reason: "No module split changes. Existing lint/doctor and setup modules are reused."
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/setup-solo-team.md
    reason: "Setup/adapter contract now states that `.codex/config.toml` enables direct Codex hooks and doctor verifies it."
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-CXHOOK-010 and U-SETUP assertions cover config enablement and template projection."
agent_slots:
  - role: tl
    slot_label: "TL - adapter enablement back-fill review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-208-codex-hook-feature-enable-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-208-codex-hook-feature-enable-gate.md
  requires:
    - docs/plans/PLAN-L7-208-codex-hook-feature-enable-gate.md
  references:
    - docs/plans/PLAN-L7-139-codex-hook-adapter.md
    - docs/design/harness/L6-function-design/setup-solo-team.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:36:14+09:00"
    tests_green_at: "2026-06-30T03:36:14+09:00"
    verdict: approve
    scope: "Back-fill confirms this is an adapter enablement gate, not a new requirement, API contract, or production environment change."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:34:03+09:00"
        evidence_path: src/lint/codex-hook-adapter.ts
        output_digest: "sha256:90ac4dbc6ae3c9bb1ff59c7dddb4801216dd0a673be8bb8046bb8a60f2932102"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:34:44+09:00"
        evidence_path: src/lint/codex-hook-adapter.ts
        output_digest: "sha256:90ac4dbc6ae3c9bb1ff59c7dddb4801216dd0a673be8bb8046bb8a60f2932102"
      - kind: unit_test
        command: "bun run vitest run tests/codex-hook-adapter.test.ts tests/setup.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:31:29+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:8b0a5469d89a2f6632771b0c46a574b99cf7f0f0efe9b24bcdabe3d306b835cf"
      - kind: unit_test
        command: "bun run vitest run tests/codex-hook-adapter.test.ts tests/setup.test.ts tests/doctor.test.ts tests/plan-lint.test.ts tests/impl-plan-trace.test.ts tests/oracle-test-trace.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:35:02+09:00"
        evidence_path: tests/codex-hook-adapter.test.ts
        output_digest: "sha256:298920e10466ce19b7994d8e061b79c99d8bbc62cbc537d0ffe83a2367c3912a"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:35:22+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:8b0a5469d89a2f6632771b0c46a574b99cf7f0f0efe9b24bcdabe3d306b835cf"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:36:14+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:489ffab05e118deb404f475310a65dd58650da75465bc3124ad007fa45f567f4"
---

# PLAN-REVERSE-208: Codex hook feature enablement back-fill（Codex hook 有効化 back-fill）

## R0-R4 概要

- R0: Adapter parity 作業では `.codex/hooks.json` の構造と共有 entrypoint を確認した。
- R1: As-built 証跡には、hook file が存在しても Codex hooks が無効のまま green になる偽陽性が残っていた。
- R2: 正しい現状 model は 2 file の direct Codex adapter である。`.codex/config.toml` が hooks を有効化し、
  `.codex/hooks.json` が hook wiring を宣言する。
- R3: 意図は、"preimplemented Codex adapter config" を宣言済みかつ有効化済みの両方を満たす意味にすること。
- R4: L6 setup/adapter design と L7 lint/test implementation へ routing する。

## 解消したギャップ

adapter check は、direct Codex hook path が単に文書化されているだけでなく、有効化されていることを証明するようになった。
これは feature list の意味補正であり、"Codex hook adapter" は config と hook wiring の両方で構成される。
