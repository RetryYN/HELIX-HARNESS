---
plan_id: PLAN-L7-208-codex-hook-feature-enable-gate
title: "PLAN-L7-208 (add-impl): Codex hook feature enablement gate"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - Codex adapter enablement semantic review"
  - role: se
    slot_label: "SE - codex-hook-adapter doctor hardening"
  - role: qa
    slot_label: "QA - U-CXHOOK / U-SETUP oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-208-codex-hook-feature-enable-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-208-codex-hook-feature-enable-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/codex-hook-adapter.ts
    artifact_type: source_module
  - artifact_path: tests/codex-hook-adapter.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-05-setup-solo-team.md
  requires:
    - docs/plans/PLAN-REVERSE-208-codex-hook-feature-enable-gate.md
    - docs/plans/PLAN-L7-139-codex-hook-adapter.md
    - docs/plans/PLAN-L7-157-distribution-clean-pull.md
  references:
    - docs/design/harness/L6-function-design/setup-solo-team.md
    - docs/test-design/harness/L7-unit-test-design.md
    - .codex/config.toml
    - .codex/hooks.json
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:36:14+09:00"
    tests_green_at: "2026-06-30T03:36:14+09:00"
    verdict: approve
    scope: "Codex adapter evidence now proves the hook file is both declared and enabled. This closes the semantic gap where `.codex/hooks.json` could exist but never fire because `[features].hooks=true` was absent."
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
        evidence_path: tests/codex-hook-adapter.test.ts
        output_digest: "sha256:b46958ac82b8c8f7ad31b3fafe20a7991fc992c52979abe60999893b69b7fb03"
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
        output_digest: "sha256:74fe3ba297a217bb24177e56c26b1c3e75d99f9e589ae6a8b36a97ddf52a154e"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:36:14+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:f49f2b2becf20cc7b6994556fd5ff2c446d6ea73046f18a40aa0bd5eeaa0c550"
---

# PLAN-L7-208: Codex hook feature enablement gate

## Objective

Close the remaining semantic gap in the Claude/Codex adapter adoption work:
having `.codex/hooks.json` in the repo is not enough evidence that direct Codex
CLI/IDE hooks will fire. Codex also requires repo-local `.codex/config.toml`
with `[features].hooks=true`.

## Scope

- Extend `codex-hook-adapter` input to read `.codex/config.toml` as well as
  `.codex/hooks.json`.
- Fail closed when `.codex/config.toml` is missing or the hooks feature is not
  enabled.
- Surface the enablement proof in doctor messages.
- Add U-CXHOOK and U-SETUP oracles so setup templates and direct-repo doctor
  evidence both cover the config file.
- Back-fill L6/L7 design text so the function list distinguishes "hook file
  exists" from "hook adapter is enabled".

## Non-Goals

- No new Codex hook surface is introduced.
- No global `~/.codex/` config is written or required.
- Hosted API/developer tool calls remain outside repo-local Codex hook
  enforcement and continue to require explicit preflight.

## Acceptance Criteria

- `doctor` reports `.codex/config.toml` hook feature enablement as part of
  `codex-hook-adapter`.
- Missing `.codex/config.toml`, disabled `hooks = false`, or `hooks = true`
  outside `[features]` fails closed.
- Setup templates expose `.codex/config.toml` and `.codex/hooks.json` together
  for brownfield consumers.
- Targeted tests, typecheck, lint, doctor, and full tests pass before commit.
