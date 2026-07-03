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
  - artifact_path: src/lint/action-binding-approval-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/lint/cutover-readiness.ts
    artifact_type: source_module
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/semantic-frontier-binding.ts
    artifact_type: source_module
  - artifact_path: tests/version-up-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
  - artifact_path: tests/action-binding-approval-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/cutover-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: README.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L00-L06-design-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/discovery.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/scrum.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/version-up.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/pillar-detail-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L4-pillar-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L5-pillar-integration-test-design.md
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
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-02T02:06:00+09:00"
    tests_green_at: "2026-07-02T02:06:00+09:00"
    verdict: approve
    scope: "Decision packets are now bound to the live L3 meaning frontier instead of only to plan kind/prose markers. S4 packets carry `semanticFeatureFrontierRecord` for frontier_pending_decision, version-up activation packets carry parked_future_version, rename/cutover packets carry featureId=name_cutover approval_gated_cutover, and action-binding packets expose sibling `semanticFeatureFrontierRecords[]`; missing records, wrong classification/feature, or detached L3 source paths fail readiness gates."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/s4-decision-readiness.test.ts tests/version-up-readiness.test.ts tests/cutover-readiness.test.ts tests/identifier-rename.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T02:02:00+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:74c3e6f375f25f53d23383fe9cf7081d92da378e285995c00046c541604432ba"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T02:06:00+09:00"
        evidence_path: tests/doctor.test.ts
        output_digest: "sha256:fd4bd4a551d3d9985bc18b3d9afe668d19489d0421908e7e584a000095ea5ab1"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T02:02:00+09:00"
        evidence_path: src/lint/semantic-frontier-binding.ts
        output_digest: "sha256:e82be61f36fc597e7f807c1b9847ca904d5dca922b55e61a517a11ba47d9d50d"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T02:02:00+09:00"
        evidence_path: docs/design/harness/L6-function-design/function-spec.md
        output_digest: "sha256:a564f23ed548028e0a92eda61d43a17285cc9c7acd89a206af3af8d2ae31be9c"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T02:02:00+09:00"
        evidence_path: docs/process/forward/L08-L14-verification-phase.md
        output_digest: "sha256:42af11edc5b7c2a378376c165741bd6d85e4160ad7f6f565780d3504079c5469"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T14:44:49+09:00"
    tests_green_at: "2026-07-01T14:44:49+09:00"
    verdict: approve
    scope: "Cutover approval snapshot binding now compares approval record snapshot ids with the current rename plan cutoverSnapshot.snapshotId. Concrete but stale cutover_snapshot_id / reviewed_snapshot_binding values keep approvalMaterialReady=false, while matching current snapshot ids are required before the non-applying packet can become ready_for_cutover_packet. applyAuthorized remains false on the plan-only packet."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:47c7c0e52546a9badf5989b0617777a315678ce8aeeba65f7ad0233d75b6a820"
      - kind: unit_test
        command: "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: tests/cutover-readiness.test.ts
        output_digest: "sha256:0d8a9fc88a92dbf25405b0723cd342174b1b45fb49d3fb9a994dbd648845e4c3"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:c2d6c04935c47ae79c724b42b86039d227c2cf20971e0e56d4eed2ba60eebf39"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: src/lint/cutover-readiness.ts
        output_digest: "sha256:7e50738b4417b7c9cede44a0b3e06482efcf72c513dca1d0768b896f3a832e36"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
        output_digest: "sha256:ffde01c6c7e939880f684c1f3b8fcdc1c33f2e8a97e13a4020b4a269a4f9f4b6"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:44:49+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:47c7c0e52546a9badf5989b0617777a315678ce8aeeba65f7ad0233d75b6a820"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T14:06:12+09:00"
    tests_green_at: "2026-07-01T14:06:12+09:00"
    verdict: approve
    scope: "Meaning-level workflow alignment was rechecked after the requested requirement correction. Outstanding status handling now uses the same terminal set across readiness gates, packet generation and record validation are explicitly separate, terminal high-impact approval/cutover PLANs cannot hide missing structured records, archived remains closed/historical, and schema-invalid statuses such as merged/rejected/superseded remain fail-closed."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/cutover-readiness.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:b8a386148e488e080ae19a39115df8846ba4afe466783b549124a0354560c464"
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/cutover-readiness.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: tests/cutover-readiness.test.ts
        output_digest: "sha256:40b30521a5100588754498dc404ecc771938e1f913c321f5647532f50c4017bb"
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/cutover-readiness.test.ts tests/outstanding.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:e48134b48bb4819f274be99d9bcbf6f72b29c50d84d1a4eca0cdbd66cbb90324"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: src/lint/shared.ts
        output_digest: "sha256:38bb990f1f920f33ae63db4189a819262b6c1a196a14f3bd7aad36ebfd0fb959"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: src/lint/action-binding-approval-readiness.ts
        output_digest: "sha256:eb99cbfabed61c39b298b79939b022e4037a81457ba98a190b4f23faf8e6b8b2"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
        output_digest: "sha256:008007b4210e26b3540f5aae459c0defd93023a0c511cbaf163df3de92e36192"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T14:06:12+09:00"
        evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
        output_digest: "sha256:af1774585533a80238c8895cd1a7671fe09f548fdb07ad7c9f6132510a57371d"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T13:49:34+09:00"
    tests_green_at: "2026-07-01T13:49:34+09:00"
    verdict: approve
    scope: "Meaning-level alignment was rechecked from L3 requirements through L4/L5/L6 design and test-design to implementation/tests. Snapshot-bound approvals now stay pending until reviewed_snapshot_binding contains the current sha256 snapshot id, and PLAN-M-02 rename cutover cannot set approvalMaterialReady from outcome plus actor/tool/target only. applyAuthorized remains false on the plan-only packet."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/identifier-rename.test.ts tests/cutover-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:c7df34650611cb419049e43e5e00ba3b6fc00fa05b30a1ba487a647d769ddad2"
      - kind: unit_test
        command: "bun test tests/action-binding-approval-readiness.test.ts tests/identifier-rename.test.ts tests/cutover-readiness.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:bd29a7a4a9b534b335fb0da467e1a92118c7fee252cd2dc28f47758697fb45d7"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:7975a17c7475d667a6e015ddd72047e9f4b90c1d917546c51f8f9d56d82ce40a"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: src/lint/action-binding-approval-readiness.ts
        output_digest: "sha256:c14138ebd4e8b5520dc1b6bdc0e152e07a051b206678f90a6e3e0e50b70d22b1"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
        output_digest: "sha256:dbf42c275bf6c2c277977a11fdb85000871f1bb552a53cc4b5d737f8c2e3bd9e"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-01T13:49:34+09:00"
        evidence_path: docs/plans/PLAN-L7-225-approval-snapshot-binding.md
        output_digest: "sha256:65865a33ca83b85778412f3fe17fac4590571deb4902c5359c0165a61f268d98"
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
      - kind: doctor
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
- Bind action-binding approval and completion decision records to those snapshot
  IDs via `reviewed_snapshot_binding`, `activation_snapshot_id`, and
  `cutover_snapshot_id`.
- Keep approval packets from treating `activationSnapshot.snapshotId` /
  `cutoverSnapshot.snapshotId` field-name placeholders as concrete approval
  material; current `sha256:` snapshot IDs are required before a snapshot-bound
  approval check can become concrete.
- Require rename cutover authorization to include the full cutover and
  action-binding approval evidence set, including approved params, current
  cutover snapshot binding, review evidence, expiry, audit, backup, rollback,
  and monitoring evidence.
- Keep L3-L6 requirement/design/test-design wording aligned so the same
  approval meaning is visible at each V-model layer.
- Share terminal PLAN status handling across outstanding, action-binding
  approval readiness, and cutover readiness. Packet generation skips terminal
  work, but record validation still checks terminal high-impact approval/cutover
  PLANs so status changes cannot hide missing decision records; unknown status
  values remain fail-closed.
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
- [x] Completion decision packet requires `activation_snapshot_id` /
      `cutover_snapshot_id` in version-up and cutover decision records.
- [x] Action-binding approval records require `reviewed_snapshot_binding` and
      reject stale/mismatched activation/cutover snapshot references.
- [x] Snapshot digest changes when cutover blast radius changes.
- [x] Action-binding approval packet keeps snapshot field placeholders pending
      until a concrete current `sha256:` snapshot ID is recorded.
- [x] Rename cutover does not set `approvalMaterialReady=true` from outcomes plus
      actor/tool/target alone; full approval evidence is required.
- [x] `rename plan` remains plan-only: `applyAuthorized=false`,
      `applyCommandAvailable=false`, and `mustNotApply=true` even when approval
      material is ready.
- [x] L3-L6 requirements/design/test-design lines carry the same snapshot and
      full-approval semantics.
- [x] Readiness gates share terminal status handling, keep terminal record
      validation active, and do not treat unknown status values as terminal.
- [x] README quickstart uses `ut-tdd setup project` and marks `helix setup project`
      as pending PLAN-M-02 cutover approval.
- [x] Targeted tests cover version-up, rename, and setup README drift.
