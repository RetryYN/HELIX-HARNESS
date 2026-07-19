---
plan_id: PLAN-L7-210-l0-l8-design-consistency-audit
title: "PLAN-L7-210 (add-impl): L0-L8 設計整合性監査"
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
    scope: "Semantic feature frontier consistency is now a doctor hard gate. The L1 pillar parents, L3 §0.2 meaning-based feature list, 43 confirmed L3 rows, 43 L12 acceptance rows, and live status/handover semanticFeatureFrontierRecords must match bidirectionally. The gate also rejects fake HBR-P5 splitting and frontier drift for design_bottomup_mode, asset_progress_visualization, serverless_readonly_share, and name_cutover."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/semantic-frontier-consistency.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: tests/semantic-frontier-consistency.test.ts
        output_digest: "sha256:002aa5c1f1637fb58589a2fa808983b5484ce2d2ab0fe87b5e9f52cc175f1628"
      - kind: unit_test
        command: "npx --no-install vitest run tests/l0-l8-design-consistency-audit.test.ts --run"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: tests/l0-l8-design-consistency-audit.test.ts
        output_digest: "sha256:ac7fc7499f292d0d0801fa7aa6797618449c851b0a1def0cbb4d11609731e3cc"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: src/lint/semantic-frontier-consistency.ts
        output_digest: "sha256:9d0e706d34897eb6a899fa2f297195ac7008cb5cacc8f83d729f4f15de35b7b0"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:5689cc301bb339b645de5b96c72cbd8689769970006689ab8df136c384f53507"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts db rebuild && npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: docs/governance/helix-l0-l8-design-consistency-audit.md
        output_digest: "sha256:721c9439392ec648d88a59ebad5a38ec86a872fb3fd2651761a2df424cb4b849"
      - kind: unit_test
        command: "npx --no-install vitest run tests/doctor.test.ts --run"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
        output_digest: "sha256:d3a6f8ec5ab4283c26dcd70e0d97778ef7c33aa56ec45435579fa1afc72584b7"
      - kind: unit_test
        command: "npm test"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T01:48:49+09:00"
        evidence_path: docs/plans/PLAN-M-02-helix-identifier-rename.md
        output_digest: "sha256:8a76eada76dea129fe173e62615851e811f3238654c4c00c2e4d81964417247f"
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
        command: "npx --no-install vitest run tests/l0-l8-design-consistency-audit.test.ts --run"
        runner: node
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
        command: "npx --no-install vitest run tests/l0-l8-design-consistency-audit.test.ts tests/vmodel-pair.test.ts --run"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T12:29:00+09:00"
        evidence_path: tests/l0-l8-design-consistency-audit.test.ts
        output_digest: "sha256:09fa27b97e29d5432333096601ae5629b6b9311be08f8c1c3d3f1c2eb2b36769"
---

# PLAN-L7-210: L0-L8 設計整合性監査

## 目的

L0 から L8 までの意味ベース監査を作成し、現在の設計連鎖を検証する。
同時に、未検証の product/runtime 作業を完了扱いにする誤判定と、
post-L8 または version-up 作業が現在の L0-L8 境界を再開したかのように扱う
逆方向の誤判定を防ぐ。

## 範囲

- L0-L6 の HELIX design artifacts と対応する test-design artifacts を読む。
- 現在の doctor、task-classification、team-suggestion、design-drift routing の
  証跡を記録する。
- `proved`、`frontier`、`warning` を区別する governance audit を追加する。
- audit が実在する artifacts を引用し、post-L8 / version-up frontiers を
  可視のまま保つ regression test を追加する。
- 2026-07-01 re-read addendum を維持し、後続の完了主張がどの意味単位を
  確認し、どれが未解決のまま残ったかを追跡できるようにする。

## 非目標

- この PLAN は post-L8 の UX/WCAG declaration、`PLAN-L7-146` の serverless
  delivery、または product/runtime frontiers を実装しない。
- この PLAN は L0 charter file の `v0.1` から `v0.2` への改名を行わない。
- この PLAN は production infrastructure、auth、PII、secrets、license policy、
  external APIs、database schema を変更しない。

## 受入条件

- audit は L0-L6 の semantic design descent が完了しており、対応付け済みで
  あることを示す。
- audit は、2026-06-28 に frozen された L0-L8 境界だけが narrow-complete で
  あり、2026-06-30 の visualization amendment を含む revised request は
  L0-L8 complete ではないことを示す。
- audit は drive-model output として `fullstack`、`low-drive-confidence`、
  `proposal-coverage-team`、`design_drift` -> Reverse、`version_deferral` ->
  version-up を記録する。
- commit 前に、対象 audit tests、plan lint、doctor、full tests がすべて通過する。

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
