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
        output_digest: "sha256:cb42662fea0a96f88625201c32ad2cdc897e1e97c53689cb41acb361277cddb0"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T07:23:12+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:53c05ed5971ec32dd6409e59d52929dbc6206e67cb00bb5ba96d3b10b00a2fa6"
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
- [x] CLI activation packet for `PLAN-L7-146` exposes pending readiness checks.
- [x] Existing plan-only safety flags remain fixed:
      `planOnly=true`, `mustNotApply=true`, `applyCommandAvailable=false`,
      `activationAllowed=false`.
- [x] Design/test-design/process docs describe the gate without claiming whole
      program completion.
