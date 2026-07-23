---
plan_id: PLAN-L3-24-github-environment-promotion
title: "PLAN-L3-24 (add-design): GitHub環境分離・promotionのL3要件"
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
parent_design: docs/design/helix/L3-requirements/github-environment-promotion-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/github-environment-promotion-system-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL — environment分離、promotion、provider contract、action-binding approval境界のレビュー"
  - role: qa
    slot_label: "QA — artifact/secret/OIDC/migration/rollback negative fixtureと一次資料採否のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L3-24-github-environment-promotion.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-environment-promotion-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-environment-promotion-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/devops-external-source-research-2026-07-23.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-23-github-approval-recovery.md
  requires:
    - docs/design/helix/L3-requirements/github-approval-recovery-requirements.md
  references:
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
  blocks: []
---

# PLAN-L3-24: GitHub環境分離・promotion

## §0 目的

stagingからproductionへの同一artifact promotion、GitHub正式操作面、provider非依存contract、AWS reference、DB migration安全性を
L3↔L10で閉じる。production resourceやcredentialへのwriteは行わない。

## §工程表

### Step 1: 一次資料とL3要件 [直列]

- GitHub/AWS公式資料の採否を記録し、`GH-FR-021`、`GH-NFR-013..014`、`GH-AC-023..028`を追加する。

### Step 2: L10 system oracle [直列]

- environment/secret/artifact交差、承認欠落、migration不完全、OIDC trust過大、reference profile逸脱をnegative fixture化する。

### Step 3: 正本同期と独立レビュー [直列]

- requirements v1.3、design catalog、objective evidenceを同期する。
- plan lint、targeted test、doctorをgreenにし、current HEADをClaude AI-Bへtakeover memoryで依頼する。

### Step 4: successor PR [後続・本PRに混載しない]

- Update/PLAN governance、G3 freeze、L4/L9 environment designは別PLANへ分離する。

## §受入条件

- AC-1: `GH-FR-021`、`GH-NFR-013..014`、`GH-AC/T-023..028`がL3↔L10でexact pairになる。
- AC-2: staging receipt、同一artifact、action-bound approval、backup/rollback/health evidenceなしのproductionを拒否する。
- AC-3: GitHub機能可用性、OIDC trust、role/secret/concurrency分離をpreflight契約へ含める。
- AC-4: migration停止見積りと追加承認を要求し、虚偽zero-downtime claimを拒否する。
- AC-5: plan lint、targeted test、doctorがgreenで、current HEADの独立review receiptが存在する。
