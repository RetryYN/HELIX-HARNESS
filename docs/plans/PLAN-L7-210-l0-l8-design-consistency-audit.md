---
plan_id: PLAN-L7-210-l0-l8-design-consistency-audit
title: "PLAN-L7-210 (add-impl): L0-L8 semantic design consistency audit"
kind: add-impl
layer: L7
drive: fullstack
status: confirmed
created: 2026-06-30
updated: 2026-07-02
owner: Codex
parent_design: docs/design/helix/L0-charter/helix-charter_v0.1.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - semantic design consistency audit"
  - role: qa
    slot_label: "QA - false-completion oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-210-l0-l8-design-consistency-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-REVERSE-210-l0-l8-design-consistency-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-l0-l8-design-consistency-audit.md
    artifact_type: markdown_doc
  - artifact_path: tests/l0-l8-design-consistency-audit.test.ts
    artifact_type: test_code
  - artifact_path: src/lint/semantic-frontier-consistency.ts
    artifact_type: source_module
  - artifact_path: tests/semantic-frontier-consistency.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L4-pillar-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/pillar-detail-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-pillar-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-209-objective-evidence-audit.md
  requires:
    - docs/plans/PLAN-REVERSE-210-l0-l8-design-consistency-audit.md
    - docs/design/helix/L0-charter/helix-charter_v0.1.md
    - docs/design/helix/L1-requirements/pillar-requirements.md
    - docs/design/helix/L3-requirements/pillar-functional-requirements.md
    - docs/design/helix/L4-basic-design/pillar-basic-design.md
    - docs/design/helix/L5-detail/pillar-detail-design.md
    - docs/design/helix/L6-function-design/pillar-function-design.md
    - docs/test-design/helix/L5-pillar-integration-test-design.md
    - docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md
  references:
    - docs/governance/helix-l0-l8-design-consistency-audit.md
    - tests/l0-l8-design-consistency-audit.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-02T01:48:49+09:00"
    tests_green_at: "2026-07-02T01:48:49+09:00"
    verdict: approve
    scope: "Semantic feature frontier consistency is now a doctor hard gate. The L3 §0.2 meaning-based feature list and live status/handover semanticFeatureFrontierRecords must match bidirectionally for design_bottomup_mode, asset_progress_visualization, serverless_readonly_share, and name_cutover; extra live records, missing L3 markers, misclassification, completionClaimAllowed=true, or missing L3 sourcePaths fail the gate. PLAN-M-02 cutover snapshot material was refreshed to the current non-approving snapshot id after the L3 source changed."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/semantic-frontier-consistency.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: tests/semantic-frontier-consistency.test.ts
        output_digest: "sha256:8ed6159da3605aa1c9c503343592cc5ffb8431fdcb6ae1d6c6ab5f265d1980b7"
      - kind: unit_test
        command: "bun run vitest run tests/l0-l8-design-consistency-audit.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: tests/l0-l8-design-consistency-audit.test.ts
        output_digest: "sha256:ac7fc7499f292d0d0801fa7aa6797618449c851b0a1def0cbb4d11609731e3cc"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: src/lint/semantic-frontier-consistency.ts
        output_digest: "sha256:a50adfbdc36dd7c1ae05995c68eb0cb38cdeb539307321c4436ce60d205f3640"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:5689cc301bb339b645de5b96c72cbd8689769970006689ab8df136c384f53507"
      - kind: doctor
        command: "bun run src/cli.ts db rebuild && bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: docs/governance/helix-l0-l8-design-consistency-audit.md
        output_digest: "sha256:721c9439392ec648d88a59ebad5a38ec86a872fb3fd2651761a2df424cb4b849"
      - kind: unit_test
        command: "bun run vitest run tests/doctor.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
        output_digest: "sha256:d3a6f8ec5ab4283c26dcd70e0d97778ef7c33aa56ec45435579fa1afc72584b7"
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
        output_digest: "sha256:e7cb3b1319050f4d367b163951e57dbd037ed45ff4100ed704d2bc031d47aa9c"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T04:50:00+09:00"
    tests_green_at: "2026-07-01T04:49:14+09:00"
    verdict: approve
    scope: "2026-07-01 re-read: meaning-based feature list check for pair-agent TDD, setup/rename command availability, visualization amendment frontier, and outstanding workflow blockers."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/l0-l8-design-consistency-audit.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T04:49:14+09:00"
        evidence_path: tests/l0-l8-design-consistency-audit.test.ts
        output_digest: "sha256:09fa27b97e29d5432333096601ae5629b6b9311be08f8c1c3d3f1c2eb2b36769"
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T12:30:00+09:00"
    tests_green_at: "2026-06-30T12:29:00+09:00"
    verdict: approve
    scope: "L0-L8 semantic audit distinguishes the 2026-06-28 frozen narrow-complete boundary from the 2026-06-30 visualization amendment frontier, P5 HNFR absorption, post-L8 work, and PLAN-L7-146 version-up parking."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/l0-l8-design-consistency-audit.test.ts tests/vmodel-pair.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T12:29:00+09:00"
        evidence_path: tests/l0-l8-design-consistency-audit.test.ts
        output_digest: "sha256:09fa27b97e29d5432333096601ae5629b6b9311be08f8c1c3d3f1c2eb2b36769"
---

# PLAN-L7-210: L0-L8 semantic design consistency audit

## Objective

Create a meaning-based audit from L0 through L8 that verifies the current design
chain and prevents two opposite false claims: treating unverified product/runtime
work as complete, and treating post-L8 or version-up work as if it reopened the
current L0-L8 boundary.

## Scope

- Read L0-L6 HELIX design artifacts and paired test-design artifacts.
- Record current doctor, task-classification, team-suggestion, and design-drift
  routing evidence.
- Add a governance audit that distinguishes `proved`, `frontier`, and `warning`.
- Add a regression test that requires the audit to cite real artifacts and keep
  post-L8 / version-up frontiers visible.
- Maintain a 2026-07-01 re-read addendum so later completion claims can see
  exactly which meaning units were checked and which remained blocked.

## Non-Goals

- This PLAN does not implement post-L8 UX/WCAG declaration, `PLAN-L7-146`
  serverless delivery, or product/runtime frontiers.
- This PLAN does not rename the L0 charter file from `v0.1` to `v0.2`.
- This PLAN does not change production infrastructure, auth, PII, secrets,
  license policy, external APIs, or database schema.

## Acceptance Criteria

- The audit states that L0-L6 semantic design descent is complete and paired.
- The audit states that only the 2026-06-28 frozen L0-L8 boundary is
  narrow-complete, and that the revised request with the 2026-06-30
  visualization amendment is not L0-L8 complete.
- The audit records drive-model output: `fullstack`, `low-drive-confidence`,
  `proposal-coverage-team`, `design_drift` -> Reverse, and
  `version_deferral` -> version-up.
- Targeted audit tests, plan lint, doctor, and full tests pass before commit.

## §3 工程表 (Step + 進捗)

### Step 1: [直列] L0-L8正本の再読
直列理由: downstream_dependency

L0/L1/L3/L4/L5/L6設計、L1/L3/L4/L5/L6テスト設計、L8/G8 workflow、L7 roadmapを読む。

### Step 2: [直列] 駆動モデルの実行と判定
直列理由: downstream_dependency

`task classify`、`team suggest`、`route eval design_drift`、`doctor` を実行し、設計監査の入力にする。

### Step 3: [直列] 監査文書とfalse-completion oracleを追加
直列理由: downstream_dependency

`proved` / `frontier` / `warning` を使い、freeze 済み L0-L8 境界、2026-06-30 L1 amendment frontier、
post-L8 / version-up 未了を混同しないテストを追加する。

### Step 4: [直列] review
直列理由: downstream_dependency

self / intra-runtime reviewで、監査が「意味ベース」になっているか、L0-L8完了境界と post-L8 未了を混同していないか確認する。

### Step 5: [直列] 検証・commit・push
直列理由: downstream_dependency

targeted vitest、plan lint、typecheck、lint、DB rebuild、doctor、full testを実行し、明示pathだけstageしてcommit/pushする。

### Step 6: [直列] 2026-07-01 semantic re-read追補
直列理由: downstream_dependency

L1/L3/L6/L7 実装・DB projection・handover outstanding を再読し、pair-agent / setup rename /
visualization amendment / L14 completion blocker の意味対応を監査表 C-17 と addendum に追記する。

## §3.1 実装計画

- 情報源: `docs/design/helix/L0-charter/helix-charter_v0.1.md`、`docs/design/helix/L1-requirements/pillar-requirements.md`、`docs/design/helix/L3-requirements/pillar-functional-requirements.md`、`docs/design/helix/L4-basic-design/pillar-basic-design.md`、`docs/design/helix/L5-detail/pillar-detail-design.md`、`docs/design/helix/L6-function-design/pillar-function-design.md`、`docs/test-design/helix/L5-pillar-integration-test-design.md`、`docs/test-design/harness/L8-integration-test-design.md`、`docs/plans/PLAN-L7-207-l7-feature-pack-roadmap-definition.md`。
- 変更対象: governance audit doc、audit test、PLAN/REVERSE docs、L3-L6 design/test-design の amendment frontier 注記。
