---
plan_id: PLAN-L3-30-feedback-test-owner-direct-disposition
title: "PLAN-L3-30 (add-design): direct authority test 27件のlayer別successor disposition"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 missing-test-plan-idをauthorityとV-pairへexactly-one dispositionする"
created: 2026-07-23
updated: 2026-07-23
owner: Codex / TL
github_issue_id: 74
parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — test pathから設計・test design authorityを直接逆引き"
  - role: qa
    slot_label: "QA — 27 case分母、digest、V-pair別routeを検証"
generates:
  - artifact_path: docs/plans/PLAN-L3-30-feedback-test-owner-direct-disposition.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/feedback-test-owner-disposition-direct.json
    artifact_type: config
  - artifact_path: tests/feedback-test-owner-direct-disposition.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-29-feedback-test-owner-recognition-disposition.md
  requires:
    - docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
    - docs/plans/PLAN-L7-450-state-db-vscode-decoupling.md
  references:
    - docs/design/helix/L6-function-design/document-agent-metadata-contract.md
    - docs/test-design/helix/L8-document-agent-metadata-contracts.md
    - docs/test-design/helix/L9-source-boundary-integration.md
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
  blocks: []
---

# PLAN-L3-30: direct authority test 27件のlayer別successor disposition

## §0 目的

Issue #74のmissing testから、設計またはtest designを直接逆引きできる3 file・27 caseを、
V-pairを混在させずG3後のsuccessor backpropへexactly-one dispositionする。

## §1 判断

- document agent metadata 6件はL6 contractとL8 oracleへ追跡できるが、現test pathのowner bindingはない。
- Infinity Loop strict contract 20件はL1-07とL5/L6 test design fixtureへ追跡できるが、単一L7 PLANへ帰属しない。
- source boundary 1件はL9の`IT-SBOUND-001`へ直接記載済みだが、L7-450のL8 unit bindingへ混ぜられない。
- 既存PLANへpathだけを追加せず、L4/L9とL5/L8の正規pair別に後続closureを要求する。

## §工程表

### Step 1: authority固定 [直列]

- test digest、catalog case分母、直接authority path、activation phaseをmanifestへ固定する。

### Step 2: route検証 [直列]

- 3 file・27 caseのexactly-one dispositionとauthority実在をtargeted testで検証する。
- source boundaryだけをL4/L9 route、残26件をL5/L8 routeとして扱う。

### Step 3: G3後backprop [直列]

- 指定V-pairでoracle/test citationを追加し、L6/L7 PLAN projectionまで閉じる。
- DB空`plan_id` 27件が0になった時点で本PLANを完了できる。

## §受入条件

- AC-1: 3 file・27 caseがexactly-one `successor_backprop` dispositionを持つ。
- AC-2: current source digest、case分母、authority pathが全件一致する。
- AC-3: L4/L9対象1件とL5/L8対象26件を混在させない。
- AC-4: G3承認前に既存PLAN、test design、test codeを変更しない。
