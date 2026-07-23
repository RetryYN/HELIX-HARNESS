---
plan_id: PLAN-L3-25-github-update-lifecycle
title: "PLAN-L3-25 (add-design): GitHub Update lifecycleのL3要件"
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
parent_design: docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/github-update-lifecycle-system-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL — Update/Feature/Recovery/Incident分類、priority、activation境界のレビュー"
  - role: qa
    slot_label: "QA — 正常openと異常open、label/trace/期限/closure fixtureのレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L3-25-github-update-lifecycle.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-update-lifecycle-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-24-github-environment-promotion.md
  requires:
    - docs/design/helix/L3-requirements/github-environment-promotion-requirements.md
  references:
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
  blocks: []
---

# PLAN-L3-25: GitHub Update lifecycle要件

## §0 目的

将来改善のUpdate Issueを正常な長期backlogとして保持し、Feature、Recovery、Incidentとの分類、priority、trace、activation、closureを
L3↔L10で閉じる。

## §工程表

### Step 1: L3 FRとAC [直列]

- `GH-FR-022`、`GH-AC-029..030`を追加する。

### Step 2: L10 system oracle [直列]

- 正常openと異常open、分類重複、priority/依存不整合、activation/closure欠落をnegative fixture化する。

### Step 3: 正本同期と独立レビュー [直列]

- requirements v1.3、design catalog、objective evidenceを同期する。
- plan lint、targeted test、doctorをgreenにし、current HEADをClaude AI-Bへtakeover memoryで依頼する。

### Step 4: successor PR [後続・本PRに混載しない]

- PLAN workflow-model governance、G3 freezeは別PLANへ分離する。

## §受入条件

- AC-1: `GH-FR-022`、`GH-AC/T-029..030`がL3↔L10でexact pairになる。
- AC-2: 正常なfuture Updateをactive blockerへ誤算入しない。
- AC-3: Update identityをFeatureへ変えず、Recovery/Incidentとの重複分類を拒否する。
- AC-4: plan lint、targeted test、doctorがgreenで、current HEADの独立review receiptが存在する。
