---
plan_id: PLAN-L3-19-github-operations-projection
title: "PLAN-L3-19 (add-design): GitHub 運用への工程投影 — Projects 連携・Issue 階層化・人間可観測性の要件化"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-20 Forward/Scrum以外はIssue起票でForwardへの流れを作り、工程表はProjects連携、Issueは階層化。人間はGitHubを見ればすべてわかる状態にする"
created: 2026-07-20
updated: 2026-07-21
owner: Claude / TL
parent_design: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — Projects/sub-issue projection の一方向同期設計と正本分離のレビュー"
  - role: aim
    slot_label: "AIM — GitHub 側を第二正本化しない境界 (harness.db 正本維持) の監査"
generates:
  - artifact_path: docs/plans/PLAN-L3-19-github-operations-projection.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-operations-projection.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-operations-projection-acceptance.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L7-418-github-self-driving-ops.md
  requires:
    - docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
  references:
    - docs/plans/PLAN-L7-418-github-self-driving-ops.md
    - docs/plans/PLAN-L3-15-requirements-authority-chain-remediation.md
  blocks: []
review_evidence: []
---

# PLAN-L3-19: GitHub 運用への工程投影の要件化

## §0 位置づけ

PO 方針 (2026-07-20): (1) Forward / Scrum 以外の駆動モデル (reverse / recovery / incident / discovery /
redesign 等) は Issue で起票し Forward への再合流の流れを GitHub 運用上でも可視にする、(2) 工程表 (roadmap
gate/span) を GitHub Projects と連携する、(3) Issue は階層化 (parent / sub-issue) で対応する、(4) 人間は
GitHub を見れば工程のすべてが分かる状態にする。

既存被覆: (1) は `github-autonomous-operations-requirements.md` GH-FR-001/002 (`drive_model` +
`reentry_target` 型付き必須、Issue 起点 episode の `Closes #N` 必須) でほぼ被覆済み。
未被覆 = (2) Projects 連携、(3) Issue 階層化、(4) 工程進捗の GitHub 側一覧性。本 PLAN はこの 3 点を
L3 要件として追加する。

## §1 拘束原則 (正本分離)

- **正本は harness.db / repo-owned ledger のまま**とする。GitHub Projects・sub-issue・milestone は
  **read 側 projection (一方向同期)** であり、GitHub 側の編集を正本へ逆流させない (逆流は Issue 経由の
  command candidate として GH-FR-001 admission を通す)。
- projection の stale / drift は doctor で検出し、GitHub 側表示を completion 根拠にしない
  (GH-FR-000「GitHub 上の緑表示だけでは完了にしない」を維持)。

## §工程表

### Step 1: 既存 GitHub 運用要件との差分確定 [直列]
- 直列理由 = **downstream_dependency** (Step 2 の要件設計は差分表に依存)。
- GH-FR-001〜013 と本方針 (2)(3)(4) の被覆差分表を作り、追加 FR の範囲を確定する。
  Projects v2 (GraphQL) / sub-issues API の機能制約も同時に棚卸しする。

### Step 2: projection 要件設計 [直列]
- 直列理由 = **downstream_dependency** (Step 1 が前提)。
- `github-operations-projection.md` に以下の FR/AC を定義する:
  - roadmap gate/span → GitHub Projects (view / status field / iteration) への一方向 projection。
  - PLAN 親子・駆動モデル別 Issue → parent / sub-issue 階層への写像規則
    (層 PLAN = parent、step / 派生 Issue = sub-issue)。
  - 人間可観測性 AC: `helix status` の active frontier (workflow-next-action 相当) が GitHub 側
    (Projects board + Issue 階層) から追加ツールなしで読める。
  - drift 検出: projection と harness.db の不一致を doctor gate で fail-visible にする。

### Step 3: acceptance test design [並列]
- `github-operations-projection-acceptance.md` に oracle (GitHub 側編集の正本逆流拒否、projection stale
  検出、sub-issue 孤児 0、Forward 再合流 route の Issue 上追跡) を設計する。

### Step 4: v1.3 §6 への要件追記 [直列]
- 直列理由 = **file_conflict** (L3-16/17/18 と同一ファイル `helix-harness-requirements_v1.3.md` を編集)。
- 確定 FR/AC を v1.3 §6 (GitHub 自律運用) へ追記する。

### Step 5: 機械検証 + review [直列]
- 直列理由 = **downstream_dependency** (Step 2-4 green が前提)。
- `helix plan lint` / `helix doctor` green。review は branch + PR + CI green + auto-merge 運用
  (PO 運用指示 2026-07-20、harness memory key=`github-flow-replaces-chat-approval`) で担保し、
  cross-runtime review evidence を記録する。

## §進捗注記

- 2026-07-21: Step 1-3 完了 (API 制約棚卸し + 設計 doc + acceptance 起草)。Step 4 の v1.3 §6 追記も同梱。CI 軽量化 FR は実測 (外部 CI 1,300 秒中 vitest 全回帰 1,179 秒 = 91%) を根拠に GOP-FR へ収載。残 = Step 5 review。

## §受入条件 (falsifiable AC)

- AC-1: `github-operations-projection.md` に Projects 連携・Issue 階層化・人間可観測性の FR/AC が存在し、
  GH-FR 既存要件との trace が明記される。
- AC-2: 「GitHub 側は projection であり正本ではない」が AC 化され、GitHub 側編集の逆流拒否 oracle を
  test design が持つ。
- AC-3: v1.3 §6 に本 3 点の要件が追記され、prose claim でなく test design を cite する。
- AC-4: `helix plan lint` exit 0、`helix doctor` exit 0。

## §6 用語更新 (§G.9)

- 新規語: 「GitHub operations projection (GitHub 運用投影)」。design doc 確定時に L0 glossary へ登録する。
