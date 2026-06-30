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
        output_digest: "sha256:2e1bf073c735701c9b54ae4424f4943faccfe3a6aae1d592c5cc765459a28b46"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:34:44+09:00"
        evidence_path: src/lint/codex-hook-adapter.ts
        output_digest: "sha256:2e1bf073c735701c9b54ae4424f4943faccfe3a6aae1d592c5cc765459a28b46"
      - kind: unit_test
        command: "bun run vitest run tests/codex-hook-adapter.test.ts tests/setup.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:31:29+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:02fd2183588a41a05eb94357196c35bb7c95bad96addb52f97bc1b29afe14d74"
      - kind: unit_test
        command: "bun run vitest run tests/codex-hook-adapter.test.ts tests/setup.test.ts tests/doctor.test.ts tests/plan-lint.test.ts tests/impl-plan-trace.test.ts tests/oracle-test-trace.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:35:02+09:00"
        evidence_path: tests/codex-hook-adapter.test.ts
        output_digest: "sha256:b46958ac82b8c8f7ad31b3fafe20a7991fc992c52979abe60999893b69b7fb03"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:35:22+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:02fd2183588a41a05eb94357196c35bb7c95bad96addb52f97bc1b29afe14d74"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:36:14+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:e08f31126509b5f74ba82cf503b3dc9263536ac6ab3e6d19cf6ece755d1751a4"
---

# PLAN-REVERSE-208: Codex hook feature enablement back-fill

## R0-R4 Summary

- R0: Adapter parity work checked `.codex/hooks.json` structure and shared
  entrypoints.
- R1: As-built evidence still allowed a false green state: the hook file could
  be present while Codex hooks were disabled.
- R2: The correct as-is model is a two-file direct Codex adapter:
  `.codex/config.toml` enables hooks, and `.codex/hooks.json` declares the hook
  wiring.
- R3: Intent is to make "preimplemented Codex adapter config" mean both declared
  and enabled.
- R4: Route to L6 setup/adapter design and L7 lint/test implementation.

## Gap Closed

The adapter check now proves the direct Codex hook path is enabled, not merely
documented. This is a semantic correction to the feature list: "Codex hook
adapter" consists of both config and hook wiring.
