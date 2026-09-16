---
plan_id: PLAN-L3-39-po-decision-reflection
title: "PLAN-L3-39 (add-design): G3 freeze前PO判断の正本反映"
kind: add-design
layer: L3
drive: agent
status: confirmed
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
review_evidence:
  - reviewer: "Claude Code / claude-fable-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-24T00:56:24Z"
    tests_green_at: "2026-07-24T00:38:20Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-fable-5
    scope: "PR #116 review HEAD c140046b4690a4da3d575cb4a3ff97003ead1422 のPO承認済み5判断の正本反映だけをconfirmする。GitHub Actions run 30055664298 green、Claude AI-B same-HEAD review Critical/Important 0を束縛した。merge commit 8bf9c52f95b911b73108373965bce4cedbead3c5 はreview HEADと同一tree 3734eba9edf42669219cad319a813c814fc6f295 を持つ。Claude receipt記載のDB rows=48651はmerge HEAD再測定で再現せず、merge HEAD source-only rebuild 2回一致（schemaVersion=39、tables=90、rows=48652、orphanTraceEdges=0）を採用する。これはG1/G3 freeze、definition frozen、pair closure、L6/L7実装、L8〜L12実行証拠の完了ではない。review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/116#issuecomment-5065024615"
    green_commands:
      - kind: unit_test
        command: "npm test"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-07-24T00:38:20Z"
        evidence_path: tests/l3-g3-freeze-packet-v2.test.ts
        output_digest: "sha256:a52e060354316120a32a8855d4ad6d9e824ef3bb19a3c1736dcecacc08ef7d86"
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
