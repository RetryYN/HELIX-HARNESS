---
plan_id: PLAN-L3-23-github-approval-recovery
title: "PLAN-L3-23 (add-design): GitHub要件承認・動的監査・RecoveryのL3要件"
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
parent_design: docs/design/helix/L3-requirements/github-approval-recovery-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/github-approval-recovery-system-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL — 人間承認境界、動的影響閉包、Recovery merge stopのレビュー"
  - role: qa
    slot_label: "QA — stale approval、未知graph、DB/GitHub不一致、main回帰negative fixtureのレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L3-23-github-approval-recovery.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-approval-recovery-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-approval-recovery-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-22-github-ci-performance-recovery.md
  requires:
    - docs/design/helix/L3-requirements/github-ci-performance-requirements.md
  references:
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
  blocks: []
---

# PLAN-L3-23: GitHub要件承認・動的監査・Recovery

## §0 目的

L3意味変更のユーザー承認、影響graphからの動的監査scope、DB/GitHub不一致とmain merge後回帰のRecoveryをL3↔L10で閉じる。

## §工程表

### Step 1: L3 FR/NFRとACの追加 [直列]

- `GH-FR-020`、`GH-NFR-012`、`GH-AC-019..022`を追加する。

### Step 2: L10 system oracleの追加 [直列]

- stale approval、未知graph、DB/GitHub不一致、main回帰closure欠落をnegative fixtureで検査する。

### Step 3: 正本同期と独立レビュー [直列]

- requirements v1.3、design catalog、objective evidenceを同期する。
- plan lint、targeted test、doctorをgreenにし、current HEADをClaude AI-Bへtakeover memoryで依頼する。

### Step 4: successor PR [後続・本PRに混載しない]

- staging/production境界、Update/PLAN governance、G3 freezeは別L3 PLANへ分離する。

## §受入条件

- AC-1: `GH-FR-020`、`GH-NFR-012`、`GH-AC/T-019..022`がL3↔L10でexact pairになる。
- AC-2: current revisionのユーザー承認なしでL3 freeze/mergeできない。
- AC-3: 監査scopeをgraphから導出し、未知edge/cycle/consumerをfail-closeする。
- AC-4: DB/GitHub不一致とmain回帰を自動上書きせずRecovery closureへ接続する。
- AC-5: plan lint、targeted test、doctorがgreenで、current HEADの独立review receiptが存在する。
