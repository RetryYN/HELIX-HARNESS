---
plan_id: PLAN-L7-218-version-up-reapproval-triggers
title: "PLAN-L7-218 (add-impl): version-up activation reapproval triggers"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - version-up reapproval triggers"
  - role: qa
    slot_label: "QA - activation packet drift regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-218-version-up-reapproval-triggers.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-218-version-up-reapproval-triggers.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-211-version-up-readiness-gate.md
  requires:
    - docs/plans/PLAN-REVERSE-218-version-up-reapproval-triggers.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:50:58+09:00"
    tests_green_at: "2026-07-01T07:50:58+09:00"
    verdict: approve
    scope: "Version-up activation packets now expose reapprovalTriggers[] so HEAD/scope/source/evidence drift invalidates stale activation packets, dry-runs, and action-binding approvals. The packet remains plan-only and does not activate PLAN-L7-146, lift version_target, or touch external infra/secrets."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:50:58+09:00"
        evidence_path: docs/process/modes/version-up.md
        output_digest: "sha256:a2be76547fa5120719aafcbd12f5acb6c7e250fa0f3ae88a1a3693fb87ecc5a2"
---

# PLAN-L7-218: version-up activation reapproval triggers

## Objective

Close the version-up activation workflow hole where a packet, dry-run, or
approval evidence could be reviewed once and then reused after HEAD, scope,
source ledger, or rehearsal evidence drifted. Future activation must re-check
the exact evidence snapshot before any action-binding execution.

## Scope

- Add `reapprovalTriggers[]` to `version-up-activation-packet.v1`.
- Cover HEAD/release trigger drift, approval scope/params drift, source/external
  limit drift, and rehearsal/rollback evidence drift.
- Backfill version-up mode docs and HR-FR-P1-02 / HC-P1 / HAT/HU test design.

## Non-Scope

- Does not activate `PLAN-L7-146`.
- Does not remove `version_target`.
- Does not add any apply command or external Cloudflare/GitHub/secret action.

## External Basis

The rule follows the existing source ledgers: release work must be tied to a
specific version/release trigger, concurrency and approval scope must not drift,
rollback/provenance evidence must be reproducible, and source ledger changes
must route back through the workflow instead of date-only refresh.

## DoD

- [x] Activation packet JSON includes `reapprovalTriggers[]`.
- [x] CLI activation packet smoke covers the trigger list.
- [x] Version-up process docs and paired L3/L6 design/test-design are updated.
- [x] Packet remains plan-only with no activation/apply permission.
