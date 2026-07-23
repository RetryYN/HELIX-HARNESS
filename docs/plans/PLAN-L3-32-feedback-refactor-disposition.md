---
plan_id: PLAN-L3-32-feedback-refactor-disposition
title: "PLAN-L3-32 (add-design): refactor warning 20件のsuccessor disposition"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 Issue #74 refactor warning 20件をexactly-one successor familyへ接続"
created: 2026-07-23
updated: 2026-07-23
owner: Codex / TL
github_issue_id: 74
parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — detector warningをbehavior-invariant successor queueへ分類"
  - role: qa
    slot_label: "QA — 20 signal・source digest・9/6/5分母を検証"
generates:
  - artifact_path: docs/plans/PLAN-L3-32-feedback-refactor-disposition.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/feedback-refactor-disposition.json
    artifact_type: config
  - artifact_path: tests/feedback-refactor-disposition.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-31-feedback-test-owner-residual-disposition.md
  requires:
    - docs/plans/PLAN-L7-150-refactor-candidate-closure-sweep.md
    - docs/plans/PLAN-L7-349-cli-split-slice.md
    - docs/plans/PLAN-L7-351-literal-policy-externalization.md
  references:
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
    - docs/process/modes/refactor.md
  blocks: []
---

# PLAN-L3-32: refactor warning 20件のsuccessor disposition

## §0 目的

Issue #74のrefactor warning 20件を、完了済みPLANへ実施済みとして誤帰属させず、現行source digestを
固定した上でexactly-one successor familyへ接続する。

## §1 分類

- literal / policy externalization 9件: `PLAN-L7-351` の方式を継承する新規additive slice。
- CLI split / helper extraction 6件: `PLAN-L7-349` のbehavior fenceを継承する新規CLI slice。
- non-CLI module split 5件: `PLAN-L7-150` 台帳からmodule単位の新規additive sliceへ分割する。

既存3 PLANはpredecessorであり、今回の20件を実装済みと宣言するownerではない。

## §工程表

### Step 1: disposition固定 [直列]

- DB snapshot由来の20 `source_id`、signal type、source path、source digest、familyをmanifestへ固定する。

### Step 2: drift検証 [直列]

- signal重複0、source digest一致、family分母9/6/5、合計20をtargeted testで検証する。

### Step 3: G3後refactor obligationの引継ぎ [並列]

- 3 familyごとに新規L7 refactor PLANを起票し、public behavior不変のtest fenceを先に置く
  後続obligationをmanifestへ固定し、freeze packet successorで集約する。
- 各candidateを実装またはaccepted-debt receiptのいずれかで閉じ、feedback eventへplan/dispositionを戻す
  まではrefactor実施完了を主張しない。

## §完了境界

本PLANが閉じるのは、20 signalのcurrent source digestを再照合し、各signalをexactly-one successor familyへ
束縛するL3判断までである。L7 refactor PLAN起票、behavior fence、実装またはaccepted-debt receipt、
feedback event更新は本PLANの完了条件へ混載せず、manifestとfreeze packet successorが追跡する
downstream obligationとする。本PLANの`confirmed`はrefactor実施済みまたはG1/G3 freeze済みを意味しない。

## §受入条件

- AC-1: 20 signalがexactly-one familyを持ち、分母が9/6/5である。
- AC-2: source pathとSHA-256が現行HEADに一致する。
- AC-3: completed predecessor PLANへ今回のwarningを実装済みとしてattachしない。
- AC-4: G3承認前にsource moduleやdetector ruleを変更しない。
- AC-5: PLAN closureとdownstream refactor closureを分離し、後者を実施済みと表示しない。
