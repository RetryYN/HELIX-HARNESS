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
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:34:03+09:00"
        evidence_path: src/lint/codex-hook-adapter.ts
        output_digest: "sha256:90ac4dbc6ae3c9bb1ff59c7dddb4801216dd0a673be8bb8046bb8a60f2932102"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:34:44+09:00"
        evidence_path: src/lint/codex-hook-adapter.ts
        output_digest: "sha256:90ac4dbc6ae3c9bb1ff59c7dddb4801216dd0a673be8bb8046bb8a60f2932102"
      - kind: unit_test
        command: "npx --no-install vitest run tests/codex-hook-adapter.test.ts tests/setup.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:31:29+09:00"
        evidence_path: tests/codex-hook-adapter.test.ts
        output_digest: "sha256:298920e10466ce19b7994d8e061b79c99d8bbc62cbc537d0ffe83a2367c3912a"
      - kind: unit_test
        command: "npx --no-install vitest run tests/codex-hook-adapter.test.ts tests/setup.test.ts tests/doctor.test.ts tests/plan-lint.test.ts tests/impl-plan-trace.test.ts tests/oracle-test-trace.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:35:02+09:00"
        evidence_path: tests/codex-hook-adapter.test.ts
        output_digest: "sha256:298920e10466ce19b7994d8e061b79c99d8bbc62cbc537d0ffe83a2367c3912a"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts db rebuild && npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:35:22+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:8b0a5469d89a2f6632771b0c46a574b99cf7f0f0efe9b24bcdabe3d306b835cf"
      - kind: unit_test
        command: "npm test"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:36:14+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:489ffab05e118deb404f475310a65dd58650da75465bc3124ad007fa45f567f4"
---

# PLAN-L7-208: Codex hook feature enablement gate（有効化 gate）

## 目的

Claude/Codex adapter adoption work に残っていた semantic gap を close する。
repo に `.codex/hooks.json` があるだけでは、direct Codex CLI/IDE hooks が発火する証跡として不十分である。
Codex では repo-local `.codex/config.toml` に `[features].hooks=true` が必要である。

## Scope

- `codex-hook-adapter` input を拡張し、`.codex/hooks.json` だけでなく `.codex/config.toml` も読む。
- `.codex/config.toml` が missing、または hooks feature が enabled でない場合は fail closed する。
- doctor messages に enablement proof を表示する。
- U-CXHOOK と U-SETUP oracle を追加し、setup templates と direct-repo doctor evidence の両方が config file を cover する。
- L6/L7 design text を back-fill し、function list が "hook file exists" と "hook adapter is enabled" を区別するようにする。

## Non-Goals（対象外）

- 新しい Codex hook surface は導入しない。
- global `~/.codex/` config は書かず、必須にもしない。
- Hosted API/developer tool calls は repo-local Codex hook enforcement の外側に残し、引き続き explicit preflight を要求する。

## 受入条件

- `doctor` は `.codex/config.toml` hook feature enablement を `codex-hook-adapter` の一部として報告する。
- `.codex/config.toml` missing、disabled `hooks = false`、または `[features]` 外の `hooks = true` は fail closed になる。
- Setup templates は brownfield consumers 向けに `.codex/config.toml` と `.codex/hooks.json` を together に expose する。
- commit 前に targeted tests、typecheck、lint、doctor、full tests が pass する。
