---
plan_id: PLAN-L7-211-version-up-readiness-gate
title: "PLAN-L7-211 (add-impl): version-up parked readiness gate"
kind: add-impl
layer: L7
drive: be
status: confirmed
created: 2026-06-30
updated: 2026-07-01
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
    reviewed_at: "2026-07-01T05:32:31+09:00"
    tests_green_at: "2026-07-01T05:32:31+09:00"
    verdict: approve
    scope: "Continuation: version-up now has a non-destructive dry-run surface for current->target release/tag updates. The dry-run normalizes SemVer, rejects invalid/same/downgrade targets, returns migration/rollback/idempotency/release-gate/source-basis evidence, and keeps planOnly/mustNotApply/applyCommandAvailable=false so version-up planning cannot become apply authority."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T05:32:31+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:9d7703676d7ec020f4f58bd088429263869e3b4f60e42959213d99d760e09169"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:32:31+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:7c9b2575e329ad3c3b9c4e87338e716d702fd60923514a3ddabe64ea4a6ae32a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:32:31+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:2dc2203a548bb09ae270970cc739ce570a96a362108fdbfdb360feecc364aa3a"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:32:31+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:9d7703676d7ec020f4f58bd088429263869e3b4f60e42959213d99d760e09169"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T05:32:31+09:00"
        evidence_path: docs/process/modes/version-up.md
        output_digest: "sha256:75b255306c8448b4b85a307755d186ede0f16f9832834833f1003b98709a8caa"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T03:35:00+09:00"
    tests_green_at: "2026-07-01T03:35:00+09:00"
    verdict: approve
    scope: "Continuation: version-up activation packet now exposes externalRehearsalPlan, costGuardrails, and provenanceRequirements for Cloudflare/GitHub activation candidates. External parked work must carry structured free-tier, HMAC, access-control, no-secret/PII, no-prod-write, rollback, approval, and audit evidence before future activation; the surface remains plan-only and non-applying."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T03:35:00+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:9d7703676d7ec020f4f58bd088429263869e3b4f60e42959213d99d760e09169"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T03:35:00+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:7c9b2575e329ad3c3b9c4e87338e716d702fd60923514a3ddabe64ea4a6ae32a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T03:35:00+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:7c9b2575e329ad3c3b9c4e87338e716d702fd60923514a3ddabe64ea4a6ae32a"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T19:21:30+09:00"
    tests_green_at: "2026-06-30T19:21:30+09:00"
    verdict: approve
    scope: "Continuation: version-up activation records now validate outcome semantics, not just field presence. activate_future_version must name an add-feature/Forward route, reject_or_archive must have an archive route, keep_parked_with_review_date must have a review-date route, and parked review must remain visible through completion/status decision packets."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/version-up-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T19:21:30+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:9d7703676d7ec020f4f58bd088429263869e3b4f60e42959213d99d760e09169"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T19:21:30+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:7c9b2575e329ad3c3b9c4e87338e716d702fd60923514a3ddabe64ea4a6ae32a"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T18:59:06+09:00"
    tests_green_at: "2026-06-30T18:59:06+09:00"
    verdict: approve
    scope: "Continuation: activation_decision_record allowed_outcome is now checked as the exact version-up activation enum set. Parked work cannot pass with an unknown activation outcome or a partial outcome list that diverges from the mode definition."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/s4-decision-readiness.test.ts tests/version-up-readiness.test.ts tests/cutover-readiness.test.ts tests/action-binding-approval-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T18:59:06+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:9d7703676d7ec020f4f58bd088429263869e3b4f60e42959213d99d760e09169"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T18:59:06+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:7c9b2575e329ad3c3b9c4e87338e716d702fd60923514a3ddabe64ea4a6ae32a"
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
        output_digest: "sha256:9d7703676d7ec020f4f58bd088429263869e3b4f60e42959213d99d760e09169"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T15:47:45+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:7c9b2575e329ad3c3b9c4e87338e716d702fd60923514a3ddabe64ea4a6ae32a"
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
        output_digest: "sha256:9d7703676d7ec020f4f58bd088429263869e3b4f60e42959213d99d760e09169"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:28:03+09:00"
        evidence_path: src/lint/version-up-readiness.ts
        output_digest: "sha256:7c9b2575e329ad3c3b9c4e87338e716d702fd60923514a3ddabe64ea4a6ae32a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-06-30T14:29:20+09:00"
        evidence_path: tests/version-up-readiness.test.ts
        output_digest: "sha256:9d7703676d7ec020f4f58bd088429263869e3b4f60e42959213d99d760e09169"
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
- Check the version-up source ledger `checked` date. A future date or a date
  older than 90 days is stale and cannot support parked review, activation, or
  completion packet decisions.
- Parse the `checked` heading by date shape instead of the initial 2026-06-30
  string, so a valid official-source refresh does not break the version-up
  ledger table.
- Require external activation candidates to mention action-binding approval,
  `escalation_boundaries`, and unapproved `exit 1` behavior.
- Require external activation candidates to carry structured
  `external_rehearsal_plan`, `cost_guardrails`, and
  `activation_provenance_requirements` so $0/free-tier, HMAC, access-control,
  secret/PII, no-prod-write, rollback, approval, and audit evidence are not
  left as prose.
- Add `ut-tdd version-up dry-run --current <version> --target <version>` as a
  non-destructive tag/release pin planning surface. It emits
  `version-up-dry-run-plan.v1` with SemVer normalization, migration plan,
  rollback plan, idempotency checks, release gate checks, and official source
  basis; downgrade/invalid targets fail closed and no apply command is exposed.
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
| `PLAN-L7-146` | current live parked case remains draft and exposes external rehearsal, cost, and provenance material without activation |

## Acceptance Criteria

- `doctor` includes `version-up-readiness - OK`.
- `PLAN-L7-146-serverless-readonly-share` remains `status=draft` +
  `version_target: future`, but is checked for activation boundary readiness.
- Dropping L0/L3/L4/mode catalog semantics makes the lint fail.
- Dropping a version-up source ledger row, adoption decision, latest official
  status, release automation comparison source, or freshness within 90 days
  makes the lint fail.
- Refreshing the version-up source ledger to a newer valid `checked` date keeps
  row parsing and readiness green.
- Targeted tests, typecheck, lint, DB rebuild, doctor, and full tests pass.
- `ut-tdd version-up activation-packet --json` includes external rehearsal,
  cost guardrails, and provenance requirements while keeping
  `applyCommandAvailable=false`.
- `ut-tdd version-up dry-run --current v0.1.0 --target v0.2.0 --json` returns
  `planOnly=true`, `mustNotApply=true`, `applyCommandAvailable=false`,
  `semverChange=minor`, and migration/rollback/idempotency/release gate/source
  basis rows. Downgrade or invalid target input returns `ok=false` before any
  apply surface exists.
