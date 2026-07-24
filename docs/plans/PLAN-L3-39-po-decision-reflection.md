---
plan_id: PLAN-L3-39-po-decision-reflection
title: "PLAN-L3-39 (add-design): G3 freeze前PO判断の正本反映"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-24 G1/G3 freeze前5問をすべて推奨案で承認"
created: 2026-07-24
updated: 2026-07-24
owner: Codex / TL
github_issue_id: 30
parent_design: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — 5件のPO判断をpacket・L3要件・運用正本へ同じ意味で反映"
  - role: qa
    slot_label: "QA — 旧auto-merge、P3=Update固定、承認後PR限定、移行時期の矛盾を検出"
generates:
  - artifact_path: docs/plans/PLAN-L3-39-po-decision-reflection.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/plans/PLAN-L3-38-freeze-issue-projection-sync.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L3-requirements/github-approval-recovery-requirements.md
    - docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md
    - docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md
    - docs/design/helix/L3-requirements/github-environment-promotion-requirements.md
  blocks: []
---

# PLAN-L3-39: G3 freeze前PO判断の正本反映

## §0 目的

Issue #30の5問batchに対するPO回答「5件すべて推奨案で承認」を、freeze packet、requirements v1.3、
L3要件、GitHub運用ルール、監査framework、対応oracleへ同じ意味で反映する。

## §工程表

### Step 1: 判断source固定 [直列]

- PO回答をIssue #30 receiptとharness memory decisionへ束縛する。
- 回答そのものとG1/G3最終freezeを分離する。

### Step 2: 正本・adapter同期 [直列]

- Draft PR、AI-B明示merge、Update priority直交、flat PLANのL5後dual-green移行、
  provider非依存＋AWS reference profileを関連正本へ反映する。
- 旧auto-merge、P3=Update固定、承認後だけPR作成という矛盾を除去する。

### Step 3: packet preflight更新 [直列]

- PR #114 merge後のmaterial HEAD/treeへ進め、5問decision unresolvedを0にする。
- packet PR自身の同一HEAD reviewとDB convergenceが未完の間は
  `draft-not-approvable`と`PENDING_*`を維持する。

## §1 受入条件

- AC-1: 5件の判断がIssue receiptと同じ意味でpacket・requirements・L3要件へ反映される。
- AC-2: AGENTS.md、CLAUDE.md、audit-frameworkがnative auto-mergeを許可しない。
- AC-3: Update identityとpriorityが直交し、P3=Update固定対応を正本に残さない。
- AC-4: flat PLAN実移行はL5契約後、dual-green、専用migration PLANを要求する。
- AC-5: provider非依存契約、AWS ECS Fargate/CDK TypeScript、必要fixtureだけRDS、
  production action-binding approval境界を維持する。
- AC-6: G1/G3 freeze、definition frozen、pair closure、実装、実行証拠を先取りしない。

## §2 検証コマンド

- `npm run helix -- plan lint docs/plans/PLAN-L3-39-po-decision-reflection.md`
- `npx vitest run --project fast tests/l3-g3-freeze-packet-v2.test.ts tests/harness-memory-reconciliation-binding.test.ts`
- `npm run typecheck`
