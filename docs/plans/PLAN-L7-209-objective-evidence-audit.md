---
plan_id: PLAN-L7-209-objective-evidence-audit
title: "PLAN-L7-209 (add-impl): active objective evidence audit"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - objective evidence semantics"
  - role: qa
    slot_label: "QA - audit table oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-209-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-209-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/objective-evidence-audit.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-208-codex-hook-feature-enable-gate.md
  requires:
    - docs/plans/PLAN-REVERSE-209-objective-evidence-audit.md
    - docs/plans/PLAN-L7-203-legacy-adoption-decisions.md
    - docs/plans/PLAN-L7-204-upstream-adoption-decisions.md
    - docs/plans/PLAN-L7-205-run-debug-db-projection.md
    - docs/plans/PLAN-L7-206-visualization-read-model-response.md
    - docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md
    - docs/plans/PLAN-L7-208-codex-hook-feature-enable-gate.md
  references:
    - docs/governance/helix-objective-evidence-audit.md
    - src/lint/objective-evidence-audit.ts
    - src/doctor/index.ts
    - tests/goal-evidence-audit.test.ts
    - tests/doctor.test.ts
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T17:06:13+09:00"
    tests_green_at: "2026-06-30T17:06:13+09:00"
    verdict: approve
    scope: "G-10 completion evidence now must enumerate every outstanding PLAN and every completionReadiness.requiredAction, so whole-program/L14 completion cannot hide a blocked decision behind aggregate blocker labels."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/goal-evidence-audit.test.ts tests/doctor.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T17:06:13+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:45b91f37110330ab1b3d4ab51a1c187da8638375caf85b5bc771288c72edc0b8"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T17:06:13+09:00"
        evidence_path: src/lint/objective-evidence-audit.ts
        output_digest: "sha256:ad639cd4b1fe93faf1db9f7affaef4705cdf235a40675101ed3a2d23655f9fb7"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T11:02:00+09:00"
    tests_green_at: "2026-06-30T11:01:00+09:00"
    verdict: approve
    scope: "Active objective evidence is indexed by requirement, with semantic proof links, an explicit blocked row for whole-program/L14 completion while completionReadiness is false, and doctor hard-gate enforcement against false completion claims."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/goal-evidence-audit.test.ts tests/doctor.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T11:01:00+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:45b91f37110330ab1b3d4ab51a1c187da8638375caf85b5bc771288c72edc0b8"
---

# PLAN-L7-209: active objective evidence audit

## Objective

Make the active user objective auditable requirement-by-requirement. The audit
must point to semantic evidence for upstream adoption, old HELIX adoption,
L7.5 RUN & Debug, visualization, feature-pack roadmap, verification strategy,
adapter config, performance NFR, and naming migration.

## Scope

- Add a governance audit table keyed by objective requirement.
- Include current source commit evidence for both referenced GitHub repositories.
- Add a regression test and doctor hard gate that verify every requirement row
  is present, proved rows stay proved, the whole-program completion row stays
  aligned to `completionReadiness`, false full-completion claims are rejected,
  cited current-state artifacts exist in the repo, and the blocked completion
  row enumerates all current outstanding PLANs and required actions.

## Non-Goals

- This PLAN does not add new product behavior.
- This PLAN does not redefine deferred UI implementation as complete.
- This PLAN does not perform the later atomic `ut-tdd` to `helix` identifier
  migration.

## Acceptance Criteria

- The audit has proved rows for implemented/hardened objective requirements and
  a blocked row for L14 / whole-program completion until `completionReadiness`
  is true.
- The blocked completion row cites every outstanding PLAN ID and every
  `completionReadiness.requiredAction`, not only aggregate blocker labels.
- `objective-evidence-audit` is wired into `ut-tdd doctor` hard-gate
  aggregation, so semantic completion drift cannot stay test-only.
- The audit cites both external source commits observed for this continuation.
- The audit distinguishes semantic proof from test count or roadmap count.
- Targeted audit tests, doctor, and full tests pass before commit.
