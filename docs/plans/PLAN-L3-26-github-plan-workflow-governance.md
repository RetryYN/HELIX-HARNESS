---
plan_id: PLAN-L3-26-github-plan-workflow-governance
title: "PLAN-L3-26 (add-design): GitHub PLAN workflow-model governanceのL3要件"
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
parent_design: docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/github-plan-workflow-governance-system-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL — workflow-model identity/path/admission、migration、明示merge境界のレビュー"
  - role: qa
    slot_label: "QA — invalid path/model/transition、Issue closure、PoC昇格、auto-merge fixtureのレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L3-26-github-plan-workflow-governance.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-plan-workflow-governance-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-25-github-update-lifecycle.md
  requires:
    - docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md
  references:
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
  blocks: []
---

# PLAN-L3-26: GitHub PLAN workflow-model統制

## §0 目的

PLANのworkflow model、identity、path、route、DB projection、model遷移、Issue closure、明示mergeをL3↔L10で閉じる。

## §工程表

### Step 1: L3 FRとAC [直列]

- `GH-FR-023`、`GH-AC-031..034`を追加する。

### Step 2: L10 system oracle [直列]

- invalid model/path/route、rename遷移、Issue closure欠落、PoC昇格、native auto-mergeをnegative fixture化する。

### Step 3: 正本同期と独立レビュー [直列]

- requirements v1.3、design catalog、objective evidenceを同期する。
- plan lint、targeted test、doctorをgreenにし、current HEADをClaude AI-Bへtakeover memoryで依頼する。

### Step 4: successor PR [後続・本PRに混載しない]

- G3 freeze、nested PLAN詳細設計・migration実装は別PLANへ分離する。

## §受入条件

- AC-1: `GH-FR-023`、`GH-AC/T-031..034`がL3↔L10でexact pairになる。
- AC-2: model付きidentity/path/routeとDB projectionをwrite前にfail-closeする。
- AC-3: Issue closure、PoC昇格、Incident/Recovery traceを同一HEAD evidenceへ束縛する。
- AC-4: native auto-mergeと自己merge判断を拒否する。
- AC-5: plan lint、targeted test、doctorがgreenで、current HEADの独立review receiptが存在する。
