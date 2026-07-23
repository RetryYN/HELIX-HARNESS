---
plan_id: PLAN-L3-31-feedback-test-owner-residual-disposition
title: "PLAN-L3-31 (add-design): residual authority test 35件のsuccessor disposition"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 missing-test-plan-id残件をauthority別にexactly-one dispositionする"
created: 2026-07-23
updated: 2026-07-23
owner: Codex / TL
github_issue_id: 74
parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — authority横断testをL3/ADR/detail authorityへ再接続"
  - role: qa
    slot_label: "QA — 9 file・35 caseのdigest、分母、exactly-one dispositionを検証"
generates:
  - artifact_path: docs/plans/PLAN-L3-31-feedback-test-owner-residual-disposition.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/feedback-test-owner-disposition-residual.json
    artifact_type: config
  - artifact_path: tests/feedback-test-owner-residual-disposition.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-30-feedback-test-owner-direct-disposition.md
  requires:
    - docs/plans/PLAN-L3-13-vmodel-docgen-fit.md
    - docs/plans/PLAN-L3-16-scrum-reverse-entity-requirements.md
  references:
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
    - docs/governance/l3-progression-authority-rebaseline-2026-07-19.md
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
  blocks: []
---

# PLAN-L3-31: residual authority test 35件のsuccessor disposition

## §0 目的

Issue #74のmissing test残9 file・35 caseを、co-change PLANへ推測帰属させず、current authority pathと
G3後の正規pair closureへexactly-one dispositionする。

## §1 分類

- AI Vision / Universal Workflow 12件: L3/L10正本からL4/L9・L5/L8へ新規降下する。
- document semantic diff/report 4件: 既存L5/L8 authorityへadditive ownershipを戻す。
- layer/canonical/runtime/L3 progression 19件: current authority/ADRを起点にL5/L8・L6/L7 gate ownershipを閉じる。

## §工程表

### Step 1: residual disposition固定 [直列]

- 9 test fileのdigest、35 case分母、authority path、required closureをmanifestへ固定する。

### Step 2: drift検証 [直列]

- path重複0、digest一致、authority実在、総数35をtargeted testで検証する。

### Step 3: G3後backprop [直列]

- manifestの分類ごとにL4/L9またはL5/L8へ降下し、L6/L7 test ownershipを閉じる。
- DB空`plan_id` 35件が0になった時点で本PLANを完了できる。

## §受入条件

- AC-1: 9 file・35 caseがexactly-one `successor_backprop` dispositionを持つ。
- AC-2: current digest、case分母、authority pathが全件一致する。
- AC-3: AI Vision / Universal Workflow 12件をG3後の5責務降下へ接続する。
- AC-4: G3承認前に既存authority、test design、test codeを変更しない。
