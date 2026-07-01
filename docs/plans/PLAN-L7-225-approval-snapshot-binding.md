---
plan_id: PLAN-L7-225-approval-snapshot-binding
title: "PLAN-L7-225 (add-impl): approval snapshot binding"
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
    slot_label: "TL - approval snapshot binding"
  - role: qa
    slot_label: "QA - stale approval material regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-225-approval-snapshot-binding.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-225-approval-snapshot-binding.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/identifier-rename.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: README.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-224-pair-agent-difficulty-budget.md
  requires:
    - docs/plans/PLAN-REVERSE-225-approval-snapshot-binding.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T11:42:19+09:00"
    tests_green_at: "2026-07-01T11:42:19+09:00"
    verdict: approve
    scope: "Version-up activation and L14 rename/cutover packets now expose snapshot binding IDs for stale approval material detection. README setup guidance now routes through ut-tdd setup project and keeps helix/.helix as PLAN-M-02 cutover targets."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/version-up-readiness.test.ts tests/identifier-rename.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:fcc5119a55d4c7be6b5df582ca3ea7ccc1c541b2209fd881f1319810e1ec9bbd"
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/version-up-readiness.test.ts tests/identifier-rename.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:2b688c6463155b830dec8520e54bc8a1db3288a00b63d3fa7c285d603d4bedd1"
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/version-up-readiness.test.ts tests/identifier-rename.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:bb5fd7cb6167cb77bc478973d29269aac2d8000553f90d432813605a26daf40d"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:15649f77a49b299c00204994189d16d28aacab7200e1377b46e0cad3748929fd"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:f6531489dd82d03dd5a6a696c1537310f4aac66512bf417fd134c39aef3176a9"
      - kind: lint
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
        output_digest: "sha256:6c90be507f082b023458cca6e24f0506fb25cc5ed2784a98cad9ec3ce6f37936"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:42:19+09:00"
        evidence_path: README.md
        output_digest: "sha256:ee838131a9d6c805abd1efe3fcf3c458818b467f913ce9e59c58f8498e6fb907"
---

# PLAN-L7-225: approval snapshot binding

## Objective

Prevent approval-gated work from reusing stale decision material. Version-up
activation and L14 identifier cutover already emit plan-only packets, but the
packet did not expose a stable digest binding for the exact release trigger,
approval scope, blast radius, source ledger, rehearsal, backup, and provenance
evidence being reviewed.

## Scope

- Add `activationSnapshot` to `version-up-activation-packet.v1`.
- Add `cutoverSnapshot` to `identifier-rename-cutover-plan.v1`.
- Keep both surfaces plan-only: no apply command, no activation permission, no
  cutover execution, and no approval recording.
- Update process/design/test docs so snapshot IDs are treated as approval
  material binding IDs, not approval substitutes.
- Update README setup guidance so new users start with `ut-tdd setup project`
  and do not confuse future `helix setup project` / `.helix` with the current
  pre-cutover `.ut-tdd` baseline.

## Non-Scope

- Does not activate PLAN-L7-146.
- Does not perform `.ut-tdd -> .helix` rename/cutover.
- Does not record human approval or action-binding approval.
- Does not change package/bin aliases.

## DoD

- [x] Version-up activation packet exposes `activationSnapshot.snapshotId`.
- [x] Rename plan exposes `cutoverSnapshot.snapshotId`.
- [x] Snapshot digest changes when cutover blast radius changes.
- [x] README quickstart uses `ut-tdd setup project` and marks `helix setup project`
      as pending PLAN-M-02 cutover approval.
- [x] Targeted tests cover version-up, rename, and setup README drift.
