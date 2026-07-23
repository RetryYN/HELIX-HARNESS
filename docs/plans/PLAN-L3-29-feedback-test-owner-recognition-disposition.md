---
plan_id: PLAN-L3-29-feedback-test-owner-recognition-disposition
title: "PLAN-L3-29 (add-design): L12 hybrid recognition test 9件のsemantic owner disposition"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 missing-test-plan-idをsemantic ownerへexactly-one dispositionする"
created: 2026-07-23
updated: 2026-07-23
owner: Codex / TL
github_issue_id: 74
parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — source generator、co-change候補、semantic ownerを比較監査"
  - role: qa
    slot_label: "QA — 安定test identity、source digest、9 case分母のdriftを検証"
generates:
  - artifact_path: docs/plans/PLAN-L3-29-feedback-test-owner-recognition-disposition.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/feedback-test-owner-disposition-recognition.json
    artifact_type: config
  - artifact_path: tests/feedback-test-owner-recognition-disposition.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-28-feedback-test-owner-closure-disposition.md
  requires:
    - docs/plans/PLAN-L3-13-vmodel-docgen-fit.md
  references:
    - docs/plans/PLAN-L7-461-requirements-doc-registry.md
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
  blocks: []
---

# PLAN-L3-29: L12 hybrid recognition test 9件のsemantic owner disposition

## §0 目的

Issue #74の`l12-hybrid-recognition.test.ts` 9 caseを、同時変更だけでL7-461へ帰属させず、
source moduleを`generates`へ登録したL3-13をsemantic predecessorとするsuccessor backpropへ
exactly-one dispositionする。

## §1 判断

- L7-461はrequirements文書path registryの実装ownerであり、recognition scannerを生成していない。
- L3-13は`src/lint/l12-hybrid-recognition.ts`を明示的に生成し、L1-L12 authority recognitionを責務に持つ。
- ただしL3 add-designはL6/L7 test implementation ownerではないため、L3-13へtest pathを直接接着しない。
- G3後にL5/L8 recognition oracleを追加設計し、L6/L7 additive PLANでtest ownershipを閉じる。

## §工程表

### Step 1: semantic disposition固定 [直列]

- 数値期待値を正規化したtest case identity digest、source digest、catalog case分母9、採用predecessor、
  棄却co-change候補をmanifestへ固定する。

### Step 2: drift検証 [直列]

- current test/source、L3-13 `generates`、L7-461非ownershipをtargeted testで検証する。

### Step 3: G3後backprop [直列]

- L5/L8 oracleとL6/L7 ownershipをadditive pairで閉じ、DB空`plan_id` 9件を0にする。

## §受入条件

- AC-1: 9 caseがexactly-one `successor_backprop` dispositionを持つ。
- AC-2: 安定test identity、source digest、case分母がcurrent treeへ一致する。
- AC-3: L3-13をsemantic predecessor、L7-461を棄却co-change候補として機械検証する。
- AC-4: G3承認前に既存L3/L7 PLAN、L8 oracle、test/source codeを変更しない。
