---
plan_id: PLAN-L7-224-pair-agent-difficulty-budget
title: "PLAN-L7-224 (add-impl): pair-agent difficulty budget"
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
    slot_label: "TL - pair-agent difficulty policy"
  - role: qa
    slot_label: "QA - pair-agent fix-cycle budget regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-224-pair-agent-difficulty-budget.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-224-pair-agent-difficulty-budget.md
    artifact_type: markdown_doc
  - artifact_path: src/orchestration/pair-agent.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/lint/green-command-digest.ts
    artifact_type: source_module
  - artifact_path: tests/pair-agent.test.ts
    artifact_type: test_code
  - artifact_path: tests/green-command-digest.test.ts
    artifact_type: test_code
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
  requires:
    - docs/plans/PLAN-REVERSE-224-pair-agent-difficulty-budget.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T11:26:22+09:00"
    tests_green_at: "2026-07-01T11:26:22+09:00"
    verdict: approve
    scope: "Pair-agent TDD plan now records task difficulty and derives maxFixCycles from difficulty policy when not explicit. CLI plan/run validates --difficulty and strict positive integer --max-fix-cycles, explicit max remains an override, exhausted fix cycles emit max-fix-cycles-exhausted, and green-command digest audit blocks fake evidence without unsafe historical restamping."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: tests/pair-agent.test.ts
        output_digest: "sha256:e3c25acec73df588fc0af2d5faf394dcda56938bcbdc2ceb8c4dfce9fb367e42"
      - kind: unit_test
        command: "bun test tests/pair-agent.test.ts tests/green-command-digest.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: tests/green-command-digest.test.ts
        output_digest: "sha256:7ec41694bfd51a0c778c10486849e58b215747c7e11b824100534b0ad4589ddd"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: src/orchestration/pair-agent.ts
        output_digest: "sha256:a5362ee9f49ad2f5de16a97ad37011aa3311284429e4ed49840c0800ad7fca48"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:c4af538d67f60f0f6650eab92ca5b8f47f6d8e33fdffe584db3ca8eae24f3d78"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: src/lint/green-command-digest.ts
        output_digest: "sha256:86aa20a54cb9b97c97742405d25516794e5267c8e33ce294c850586344664919"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T11:26:22+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:f37048765d4aaa8fb7ddf4776345f27fb1503919db09bf9e02d8314e96f5ea3c"
---

# PLAN-L7-224: pair-agent difficulty budget

## Objective

Close the pair-agent workflow gap where the planner accepted `difficulty` in its
input type but did not use it to size the TDD fix loop. The requested final
system needs task-difficulty-aware orchestration, not a constant retry budget.
The implementation review also found that the green-command digest hard gate
could force unsafe restamping of historical evidence; this PLAN includes the
audit-safe gate correction because it is required before commit/push evidence
can be trusted.

## Scope

- Record pair-agent task difficulty and whether it was explicit or inferred.
- Derive `maxFixCycles` from difficulty when it is not explicitly provided:
  `trivial/simple=1`, `standard=2`, `complex=3`, `critical=4`.
- Keep explicit `--max-fix-cycles` as an override and mark its source.
- Expose `--difficulty` on `ut-tdd pair-agent plan/run`.
- Return `max-fix-cycles-exhausted` when the smart review never reaches
  `VERDICT: pass` inside the allowed loop.
- Reject malformed `--max-fix-cycles` values instead of truncating them with
  `parseInt`.
- Keep `green_commands[].output_digest` as immutable review-time evidence:
  fake / malformed digest and missing evidence files fail-close, while valid
  historical digest drift after later file edits does not force unsafe
  historical PLAN restamping.
- Backfill L3/L6 design and paired test design.

## External Basis

- Martin Fowler, "Test Driven Development" (checked 2026-07-01):
  https://martinfowler.com/bliki/TestDrivenDevelopment.html
- NIST SP 800-218 SSDF v1.1 (checked 2026-07-01):
  https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-218.pdf
- OWASP Code Review Guide (checked 2026-07-01):
  https://owasp.org/www-project-code-review-guide/

## Non-Scope

- Does not execute external provider CLIs.
- Does not change T0 frontier approval requirements.
- Does not activate `.ut-tdd -> .helix` cutover.
- Does not treat pair-agent local pass as a CI/merge gate substitute.

## DoD

- [x] Difficulty is present in pair-agent plan output.
- [x] Missing `maxFixCycles` uses difficulty policy.
- [x] Explicit `maxFixCycles` remains an override.
- [x] CLI validates `--difficulty`.
- [x] CLI validates `--max-fix-cycles` as a positive integer.
- [x] Max cycle exhaustion emits an error finding.
- [x] Green-command digest gate blocks fake/malformed evidence without forcing
      historical digest restamps.
- [x] L3/L6 design and paired test design describe the policy.
