---
plan_id: PLAN-L7-215-hosted-preflight
title: "PLAN-L7-215 (add-impl): hosted API preflight enforcement"
kind: add-impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: Codex
parent_design: docs/design/helix/L6-function-design/pillar-function-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - HC-AC hosted/API preflight enforcement"
  - role: qa
    slot_label: "QA - hosted preflight evidence regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-215-hosted-preflight.md
    artifact_type: markdown_doc
  - artifact_path: src/runtime/hosted-preflight.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/hosted-preflight.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L1-pillar-operational-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L5-09-helix-pillar-detail-design.md
  requires:
    - docs/plans/PLAN-L3-06-helix-pillar-descent.md
    - docs/plans/PLAN-L5-09-helix-pillar-detail-design.md
    - docs/plans/PLAN-REVERSE-215-hosted-preflight.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:20:00+09:00"
    tests_green_at: "2026-07-01T07:20:00+09:00"
    verdict: approve
    scope: "HC-AC hosted/API preflight: direct Claude/Codex hook surfaces and hosted/API preflight-only surfaces now have a pure adapter parity decision. Hosted/API edits require hook non-enforcement acknowledgement, git status preflight, target paths, work-guard decision, preflight command, and audit evidence. The CLI JSON surface exposes hostedPreflight with apiToolPathEnforced=false so repo hook coverage is not overstated. This closes the core hosted/API preflight gap but does not close whole-program approval or all-agent memory/rule generalization."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/hosted-preflight.test.ts tests/work-guard.test.ts tests/codex-hook-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:20:00+09:00"
        evidence_path: tests/hosted-preflight.test.ts
        output_digest: "sha256:766166f6df5163bb6cc964b8307a37f0139633fefd1b79be5265fb92c1aaf98b"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:20:00+09:00"
        evidence_path: src/runtime/hosted-preflight.ts
        output_digest: "sha256:48f085cf1bd5ad251e641b68ad6bc9a5a1d3c2d04a27cfb5c0b4340b70296964"
---

# PLAN-L7-215: hosted API preflight enforcement

## Objective

Close the HC-AC / HR-FR-P2-03 / HR-NFR-AC-02 gap where hosted API and
developer-tool surfaces were described as preflight-only but did not have a
first-class pure contract. The implementation must prevent hosted/API edits from
being classified as repo-hook-covered and must require concrete preflight
evidence before accepting the surface.

## Scope

- Add `src/runtime/hosted-preflight.ts` with:
  - `validateAdapterParityMap` for direct hook vs hosted preflight-only
    classification.
  - `requireHostedSurfacePreflight` for hook non-enforcement acknowledgement,
    git status, target path, work-guard, command, and audit evidence.
- Wire `ut-tdd guard preflight --json` to emit adapter parity and hosted
  preflight decisions with `apiToolPathEnforced=false`.
- Add tests for direct hook coverage, hosted preflight-only classification,
  unknown surface drift/defer, missing evidence reject, dry-run no-target, and
  work-guard block propagation.
- Update L1/L3/L6 and paired test-design text so hosted/API preflight is no
  longer listed as an open P2 core gap.

## Non-Scope

- This PLAN does not make hosted/API developer tools mechanically hook-covered.
- This PLAN does not generalize rule-drift and shared-memory enforcement to every
  future agent surface.
- This PLAN does not activate `.ut-tdd -> .helix` cutover.

## Design Notes

Hosted/API tools do not execute repo-local `.codex/hooks.json`. The correct
state is therefore not "covered by hook"; it is "preflight required". The CLI
keeps `apiToolPathEnforced=false` in JSON so downstream review cannot confuse a
manual/preflight discipline with mechanical hook interception.

## DoD

- [x] Hosted/API surfaces classify as `preflight_required`, never
      `covered_by_hook`.
- [x] Direct Claude/Codex known hook surfaces classify as `covered_by_hook`.
- [x] Hosted/API edit rejects missing hook non-enforcement acknowledgement, git
      status, target path, work-guard, command, or audit evidence.
- [x] Hosted/API dry-run can be no-target, while edit cannot.
- [x] `ut-tdd guard preflight --json` exposes `hostedPreflight` and
      `apiToolPathEnforced=false`.
- [x] L1/L3/L6 design and paired test-design are updated without claiming whole
      program completion.
