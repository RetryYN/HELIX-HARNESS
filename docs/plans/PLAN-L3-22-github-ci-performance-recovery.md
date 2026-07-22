---
plan_id: PLAN-L3-22-github-ci-performance-recovery
title: "PLAN-L3-22 (add-design): GitHub CI性能とRecoveryのL3要件"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 branch/PRを工程別の小粒sliceへ分割する"
created: 2026-07-23
updated: 2026-07-23
owner: Codex / TL
parent_design: docs/design/helix/L3-requirements/github-ci-performance-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/github-ci-performance-system-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL — correctnessと性能判定の分離、検査集合非縮退、Recovery境界のレビュー"
  - role: qa
    slot_label: "QA — p50/p95母集団、環境・cache・区間receipt、negative fixtureのレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L3-22-github-ci-performance-recovery.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-ci-performance-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-ci-performance-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-21-contextual-pr-review-db-convergence.md
  requires:
    - docs/design/helix/L3-requirements/github-merge-admission-requirements.md
  references:
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
  blocks: []
---

# PLAN-L3-22: GitHub CI性能とRecovery

## §0 目的

merge admissionの正確性を維持したまま、内部CIとGitHub Actionsの重要検査、Full verificationの性能目標と計測証拠を定義する。
correctness greenで性能だけを超過した場合はmerge判定とRecoveryを分離し、検査縮退を許さず改善closureまで追跡する。

## §工程表

### Step 1: L3 NFRとACの追加 [直列]

- `GH-NFR-009..011`、`GH-AC-017..018`を追加する。

### Step 2: L10 system oracleの追加 [直列]

- 別環境・別receipt、p95母集団、correctness/performance分離、Recovery Issue、非縮退をnegative fixtureで検査する。

### Step 3: 正本同期と独立レビュー [直列]

- requirements v1.3、design catalog、objective evidenceを同期する。
- plan lint、targeted test、doctorをgreenにし、current HEADをClaude AI-Bへtakeover memoryで依頼する。

### Step 4: successor PR [後続・本PRに混載しない]

- 要件承認・動的監査・main Recovery、staging/production、Update/PLAN governanceは別L3 PLANへ分離する。

## §受入条件

- AC-1: `GH-NFR-009..011`と`GH-AC/T-017..018`がL3↔L10でexact pairになる。
- AC-2: 性能超過だけでcorrectnessをredにせず、Recovery Issueの必須証拠とclosureを要求する。
- AC-3: 検査省略、閾値緩和、GitHub Actionsへの先送りを性能改善として拒否する。
- AC-4: plan lint、targeted test、doctorがgreenで、current HEADの独立review receiptが存在する。
