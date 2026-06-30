---
plan_id: PLAN-L7-211-version-up-readiness-gate
title: "PLAN-L7-211 (add-impl): version-up parked readiness gate"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
parent_design: docs/process/modes/version-up.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - version-up parked readiness gate"
  - role: qa
    slot_label: "QA - activation boundary regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-211-version-up-readiness-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/version-up-readiness.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/lint-wiring.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-DISCOVERY-09-version-up-mode.md
  requires:
    - docs/plans/PLAN-DISCOVERY-09-version-up-mode.md
    - docs/plans/PLAN-REVERSE-211-version-up-readiness-gate.md
    - docs/process/modes/version-up.md
  references:
    - docs/plans/PLAN-L7-146-serverless-readonly-share.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T15:47:45+09:00"
    tests_green_at: "2026-06-30T15:47:45+09:00"
    verdict: approve
    scope: "Continuation: activation_decision_record now requires target_version_or_release_trigger and activation_route. Version-up parked work can no longer remain an indefinite future draft or activate without naming the release trigger and add-feature/Forward route."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/version-up-readiness.test.ts tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T15:47:45+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:1c3d499aff26f31b8c4a9c847e97fee4c593e17ce31ada43bed978885620a385"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T15:47:45+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:abdb20819c4bfa0eb94a44bb579e595958e38271e79e8ebd2576280d9f844959"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T14:32:07+09:00"
    tests_green_at: "2026-06-30T14:32:07+09:00"
    verdict: approve
    scope: "Version-up parked PLANs are hard-gated for activation markers, external action-binding approval boundaries, structured parked_review_record, and official source-ledger adoption decisions without activating the parked work."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/version-up-readiness.test.ts tests/lint-wiring.test.ts tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T14:30:08+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:1c3d499aff26f31b8c4a9c847e97fee4c593e17ce31ada43bed978885620a385"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:28:03+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:abdb20819c4bfa0eb94a44bb579e595958e38271e79e8ebd2576280d9f844959"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:29:20+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:1c3d499aff26f31b8c4a9c847e97fee4c593e17ce31ada43bed978885620a385"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:32:07+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:139535e15e8e3557f3bd4c08e1a2406752183e6bf80f7c04640fb1cd7b0defaa"
---

# PLAN-L7-211: version-up parked readiness gate

## Objective

Prevent `version_target` from becoming a vague draft escape hatch. A parked
version-up PLAN must state that it is version-up parked, name its activation
path, and preserve approval/escalation boundaries before future activation.

## Scope

- Add `version-up-readiness` lint and doctor hard gate.
- Check L0 charter, L3 requirements, L4 functional design, the mode catalog,
  the version-up mode document, S4 discovery decision, and current
  `version_target` PLANs as one semantic trace.
- Check the version-up source ledger as a structured table with official URL,
  adopted version/date, latest official status, adoption decision,
  version-up use, and required field impact. Release automation candidates
  (semantic-release / Release Please) stay compare-only until a release ADR.
- Require external activation candidates to mention action-binding approval,
  `escalation_boundaries`, and unapproved `exit 1` behavior.
- Do not activate `PLAN-L7-146` or touch external infrastructure, auth, secrets,
  access control, or Cloudflare configuration.

## Design Trace

| Source | Meaning preserved by this gate |
|---|---|
| L0 charter P1 | version-up keeps now-out-of-release work from being lost |
| L3 `HR-FR-P1-02` / `HAC-P1-02a` | now-out-of-version requirements need `version_target` and rationale |
| L4 `HB-P1 continuous-autonomy` / routing | version-up belongs to continuous autonomy and escalation-aware routing |
| `docs/process/modes/README.md` | `version_deferral` is listed as `version-up`; activation returns through add-feature |
| `docs/process/modes/version-up.md` | parked / activation / approval semantics are the operational SSoT |
| `PLAN-L7-146` | current live parked case remains draft and is not activated by this PLAN |

## Acceptance Criteria

- `doctor` includes `version-up-readiness - OK`.
- `PLAN-L7-146-serverless-readonly-share` remains `status=draft` +
  `version_target: future`, but is checked for activation boundary readiness.
- Dropping L0/L3/L4/mode catalog semantics makes the lint fail.
- Dropping a version-up source ledger row, adoption decision, latest official
  status, or release automation comparison source makes the lint fail.
- Targeted tests, typecheck, lint, DB rebuild, doctor, and full tests pass.
