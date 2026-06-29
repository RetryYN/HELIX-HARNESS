---
plan_id: PLAN-L7-207-l7-feature-pack-roadmap-definition
title: "PLAN-L7-207 (add-impl): L7 feature-pack roadmap definition"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/design/harness/L6-function-design/function-spec.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - L7 feature-pack semantic roadmap review"
  - role: se
    slot_label: "SE - roadmap schema/doctor hard gate implementation"
  - role: qa
    slot_label: "QA - U-ROADMAP feature-pack oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-207-l7-feature-pack-roadmap-definition.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/schema/roadmap.ts
    artifact_type: source_module
  - artifact_path: src/lint/roadmap-registry.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/roadmap.test.ts
    artifact_type: test_code
dependencies:
  parent: PLAN-REVERSE-44-roadmap-definition-design
  requires:
    - PLAN-REVERSE-207-l7-feature-pack-roadmap-definition
    - docs/plans/PLAN-REVERSE-44-roadmap-definition-design.md
    - docs/plans/PLAN-L7-44-harness-db-master.md
    - docs/plans/PLAN-L7-177-helix-orchestration-runtime-bridge.md
    - docs/plans/PLAN-L7-206-visualization-read-model-response.md
  references:
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/design/helix/L4-basic-design/pillar-basic-design.md
    - docs/plans/PLAN-RECOVERY-04-roadmap-definition.md
    - docs/plans/PLAN-REVERSE-44-roadmap-definition-design.md
    - docs/plans/PLAN-L7-141-web-dashboard-component-derived.md
roadmap:
  layer: L7
  feature_packs:
    - id: fp-db
      name: database and projection pack
      layer: database
      owns:
        - src/state-db
        - src/schema
        - ".ut-tdd/harness.db"
      exit_criteria: "harness.db projection, schema registry, and read-only DB rebuild paths are represented by L7 roadmap spans."
    - id: fp-service
      name: service and orchestration pack
      layer: service
      owns:
        - src/orchestration
        - src/runtime
        - src/workflow
      exit_criteria: "runtime bridge, workflow routing, and service orchestration spans are registered separately from DB/UI work."
    - id: fp-frontend
      name: frontend response and adapter pack
      layer: frontend
      owns:
        - src/state-db/visualization-read-model.ts
        - "ut-tdd progress snapshot --json"
        - VSCode Webview/View response contract
      exit_criteria: "UI-facing responses are deterministic read models and do not count as UI implementation by themselves."
    - id: fp-ui
      name: UI and screen implementation pack
      layer: ui
      owns:
        - src/web
        - docs/design/harness/L2-screen
        - docs/design/harness/L4-basic-design/ui-standard.md
      exit_criteria: "component-derived UI implementation remains visible as deferred work, not silently closed by DB/front response coverage."
    - id: fp-verification
      name: runtime verification pack
      layer: verification
      owns:
        - ".ut-tdd/evidence/run-debug"
        - runtime_verification_events
      exit_criteria: "RUN & Debug evidence is classified separately from projection-only evidence."
  gates:
    - id: G-L7PACK.A
      name: semantic packs registered
      exit_criteria: "database/service/frontend/ui packs are registered as roadmap feature_packs and span references resolve."
    - id: G-L7PACK.B
      name: response and runtime verification packs routed
      exit_criteria: "frontend read model and RUN & Debug verification spans are routed without treating UI as complete."
    - id: G-L7PACK.C
      name: UI implementation carry remains explicit
      exit_criteria: "deferred UI implementation remains a visible L7 feature-pack frontier."
  spans:
    - plan_id: PLAN-L7-44-harness-db-master
      after_gate: entry
      before_gate: G-L7PACK.A
      feature_pack: fp-db
    - plan_id: PLAN-L7-177-helix-orchestration-runtime-bridge
      after_gate: entry
      before_gate: G-L7PACK.A
      feature_pack: fp-service
    - plan_id: PLAN-L7-205-run-debug-db-projection
      after_gate: G-L7PACK.A
      before_gate: G-L7PACK.B
      feature_pack: fp-verification
    - plan_id: PLAN-L7-206-visualization-read-model-response
      after_gate: G-L7PACK.A
      before_gate: G-L7PACK.B
      feature_pack: fp-frontend
    - plan_id: PLAN-L7-141-web-dashboard-component-derived
      after_gate: G-L7PACK.B
      before_gate: G-L7PACK.C
      feature_pack: fp-ui
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T03:21:36+09:00"
    tests_green_at: "2026-06-30T03:21:36+09:00"
    verdict: approve
    scope: "L7 roadmap now exposes database/service/frontend/ui feature packs as semantic responsibility units. UI remains visible as deferred work; DB/read-model coverage cannot close it."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: src/schema/roadmap.ts
        output_digest: "sha256:73749efaeb3af6128b684ed337acd670ebf02e45e998175c81916dba46de4fed"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: src/lint/roadmap-registry.ts
        output_digest: "sha256:1c384fa0fddd7d2f5581f5c9044508db28ef8c994857e4d96e6a7cf933202fc8"
      - kind: unit_test
        command: "bun run vitest run tests/roadmap.test.ts tests/doctor.test.ts tests/plan-lint.test.ts tests/impl-plan-trace.test.ts tests/oracle-test-trace.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T03:21:36+09:00"
        evidence_path: tests/roadmap.test.ts
        output_digest: "sha256:cb04ffee9b6eb398b877ae3c4f2b98c17b482b5ccfaae2667b44f23f7f4a7f86"
---

# PLAN-L7-207: L7 feature-pack roadmap definition

## Objective

Fix the roadmap gap where L7 progress could be counted by gate/span volume while
the meaning of the work was not represented. L7 must show database, service,
frontend response, and UI implementation as separate responsibility packs.

## Scope

- Extend the roadmap schema with `feature_packs[]` and `span.feature_pack`.
- Add doctor coverage for required L7 feature-pack layers:
  `database`, `service`, `frontend`, and `ui`.
- Register the current L7 work as semantic packs:
  DB projection (`PLAN-L7-44`), service/runtime bridge (`PLAN-L7-177`),
  frontend response (`PLAN-L7-206`), and deferred UI (`PLAN-L7-141`).
- Add U-ROADMAP oracles and L6/L7 design trace.

## Non-Goals

- This PLAN does not mark UI complete. `PLAN-L7-141` remains draft/deferred.
- This PLAN does not introduce a DB migration, external API, auth change, or new
  production runtime.
- This PLAN does not infer feature packs from `drive`; packs are explicit
  roadmap semantics.

## Acceptance Criteria

- `doctor` emits `l7-feature-pack-roadmap` and fails if any required pack layer
  is absent.
- Unknown `span.feature_pack` and duplicate `feature_pack.id` are structural
  roadmap issues.
- The real repo has database/service/frontend/ui feature-pack coverage.
- Typecheck, lint, targeted roadmap tests, doctor, and full tests pass before
  commit.
