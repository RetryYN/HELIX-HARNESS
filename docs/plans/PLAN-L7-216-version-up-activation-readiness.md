---
plan_id: PLAN-L7-216-version-up-activation-readiness
title: "PLAN-L7-216 (add-impl): version-up activation readiness evidence"
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
    slot_label: "TL - version-up activation readiness gate"
  - role: qa
    slot_label: "QA - activation packet regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-216-version-up-activation-readiness.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-216-version-up-activation-readiness.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L3-06-helix-pillar-descent.md
  requires:
    - docs/plans/PLAN-REVERSE-216-version-up-activation-readiness.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T12:35:56+09:00"
    tests_green_at: "2026-07-01T12:35:56+09:00"
    verdict: approve
    scope: "Continuation: activationReadinessChecks now distinguish concrete evidence from prose-only requirements. Rehearsal/provenance text without a path, audit id, digest, execution log, result/exit code, or report artifact remains pending_evidence, so PLAN-L7-146 cannot look activation-ready merely because the PLAN says evidence will be recorded. This preserves the plan-only/version-up blocker and does not activate external infrastructure or bypass action-binding approval."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T12:35:56+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:848c78bc623fec0b0f838497f4acaf57042122ff71c5e0d10db5b0889f1e03a1"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T12:35:56+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:197e0bb048126d3ae3593a122a2b25679204774bf1769dcb5512309a4e9575eb"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T12:35:56+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T07:23:12+09:00"
    tests_green_at: "2026-07-01T07:23:12+09:00"
    verdict: approve
    scope: "Version-up activation packets now classify external rehearsal/provenance evidence as present or pending_evidence and surface pending items as blockedReasons. This strengthens the activation-preflight workflow without executing serverless activation, lifting version_target, or bypassing PO/action-binding approval."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T07:23:12+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:24c2bfc018a575b92ef493f7bf13a9c28c77945fc695797741d416232eb748e4"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:23:12+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:e5281e9eab7e257930c135cc1aafbca2884cd83f0ef3988035852271ddf27f5a"
---

# PLAN-L7-216: version-up activation readiness evidence

## Objective

Close the workflow hole where `version-up-activation-packet.v1` listed external
rehearsal and provenance requirements but did not classify each requirement as
evidence-present or still pending. A parked external activation must remain
plan-only and must show exactly which rehearsal evidence is still blocking
approval.

## Scope

- Add `activationReadinessChecks[]` to version-up activation packets.
- Classify external rehearsal/provenance evidence as `present` or
  `pending_evidence`.
- Treat prose-only instructions, planned checks, and "recorded" claims without a
  concrete evidence locator (path, audit id, digest, run log, result/exit code,
  report artifact) as `pending_evidence`.
- Add `activation rehearsal evidence pending: <check>` blocked reasons for
  pending checks.
- Update version-up process, L6 function design, and paired L3/L6 test design.
- Preserve the existing serverless/version-up activation blocker.

## Non-Scope

- Does not activate `PLAN-L7-146-serverless-readonly-share`.
- Does not grant apply permission, deployment permission, secret access, or
  action-binding approval.
- Does not execute `.ut-tdd -> .helix` cutover.

## External Basis

The process doc cites Google Cloud Deploy deployment verification, canary, and
rollback docs as official operational analogs: deployment activation should be
verified, limited/progressive, and reversible before approval.

## DoD

- [x] External activation packets include `activationReadinessChecks[]`.
- [x] Pending external rehearsal/provenance evidence becomes a blocked reason.
- [x] Prose-only rehearsal/provenance claims without concrete evidence locators
      remain `pending_evidence`.
- [x] CLI activation packet for `PLAN-L7-146` exposes pending readiness checks.
- [x] Existing plan-only safety flags remain fixed:
      `planOnly=true`, `mustNotApply=true`, `applyCommandAvailable=false`,
      `activationAllowed=false`.
- [x] Design/test-design/process docs describe the gate without claiming whole
      program completion.
