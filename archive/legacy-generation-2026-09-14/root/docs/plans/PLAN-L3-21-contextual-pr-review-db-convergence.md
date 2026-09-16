---
plan_id: PLAN-L3-21-contextual-pr-review-db-convergence
title: "PLAN-L3-21 (add-design): PR文脈レビューと同一HEAD DB追従のL3要件"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-22 CI greenだけでなく別AIの文脈レビューとharness.db追従をmerge必須要件にする"
  - "po_directive:2026-07-23 branch/PRを工程別の小粒sliceへ分割する"
created: 2026-07-22
updated: 2026-07-22
owner: Codex / TL
parent_design: docs/design/helix/L3-requirements/github-merge-admission-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/github-merge-admission-system-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL — 文脈入力閉包、AI-A/AI-B identity・session・context分離、同一HEAD receipt stale規則のレビュー"
  - role: qa
    slot_label: "QA — event/projection/checkpoint/schema追従と隔離rebuild oracleのレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L3-21-contextual-pr-review-db-convergence.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-merge-admission-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-merge-admission-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/design/helix/L3-requirements/github-merge-admission-requirements.md
  references:
    - docs/plans/PLAN-L3-19-github-operations-projection.md
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
  blocks: []
---

# PLAN-L3-21: PR文脈レビューと同一HEAD DB追従

## §0 目的

CIを意味判断の代替にせず、作成者と別identity・別session・独立contextのAIが上位正本と変更文脈を読み、同じPR HEADに対して
`harness.db`のevent、projection、checkpoint、schema revisionが追従していることを確認してからmerge可能にする。
本変更により既存G1/G3 freeze packetのsnapshotはstaleとなるため、review後にpacketを再生成する。

## §工程表

### Step 1: L3要件とACの追加 [直列]

- `GH-FR-018..019`、`GH-AC-014..016`を追加し、CI green単独merge、自己承認、修正後の旧HEAD receipt利用を拒否する。

### Step 2: 正本同期と独立レビュー [直列]

- plan lint、design coverage、L12 recognition、doctorを実行する。
- 作成側と別identity・別session・独立contextのAI-Bが文脈とDB追従契約をreviewし、current HEADへreceiptを束縛する。

### Step 3: successor PR [後続・本PRに混載しない]

- 要件承認・動的監査・Recovery優先、CI性能、staging/production境界は別L3 PLANへ分離する。
- G3 freeze packet、L4/L9、L5/L8、L6/L7、L8〜L12実行証拠は、それぞれ専用PLAN・専用branch・専用PRで順に閉じる。

## §受入条件

- AC-1: CI greenだけのPR fixtureがmerge不可になる要件とoracleが存在する。
- AC-2: reviewerが読む正本・Issue/PLAN・diff・trace・consumer・security/blast radiusが列挙される。
- AC-3: DB追従receiptがsource HEAD、event head、projection/checkpoint digest、schema revision、stale/orphan件数、隔離rebuild結果を持つ。
- AC-4: push、base更新、CI self-heal、正本digest変更で両receiptがstaleになる。
- AC-5: plan lint、targeted test、doctorがgreenで、別identity・別session・独立contextのreview evidenceが記録される。

## §6 用語更新 (§G.9)

- `contextual PR review`: PRの機械検証とは別に、上位正本と変更文脈を読む意味レビュー。
- `PR database convergence`: current PR HEADとharness.dbのevent/projection/checkpoint/schema整合。
