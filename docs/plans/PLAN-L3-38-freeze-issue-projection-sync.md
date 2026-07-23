---
plan_id: PLAN-L3-38-freeze-issue-projection-sync
title: "PLAN-L3-38 (add-design): G3 freeze前のIssue projection同期"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 /goalのL3 freeze前監査としてIssue #30/#73/#74/#75をcurrent L3分母とdownstream dispositionへ同期する"
created: 2026-07-24
updated: 2026-07-24
owner: Codex / TL
github_issue_id: 30
parent_design: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — Issue本文・dispositionとfreeze packetの分母・境界を照合"
  - role: qa
    slot_label: "QA — GitHub再観測snapshot、packet pending gate、digestを検証"
review_evidence:
  - reviewer: "Claude Code / claude-fable-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-23T22:31:36Z"
    tests_green_at: "2026-07-23T22:21:04Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-fable-5
    scope: "PR #114 review HEAD 0f47ea04fd59183efc4a0e7bd0303d0279aa5181 のIssue #30/#73/#74/#75 projection、PR #113 material HEAD/tree pin、draft-not-approvable境界、PO freeze非主張だけをconfirmする。GitHub Actions run 30048193951、clean detached DB rebuild 2回一致（schemaVersion=39、tables=90、rows=48614、orphanTraceEdges=0）、Claude AI-B read-only review approveを束縛した。これは5問のPO回答、G1/G3 freeze、pair closure、L6/L7実装、L8〜L12実行証拠の完了ではない。review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/114#issuecomment-5064177750"
    green_commands:
      - kind: unit_test
        command: "npm test"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-07-23T22:21:04Z"
        evidence_path: tests/l3-g3-freeze-packet-v2.test.ts
        output_digest: "sha256:d68dd56027edfcea01ca787bdf3e0a392893f6b8938e3a12999f34eeb3a9c799"
generates:
  - artifact_path: docs/plans/PLAN-L3-38-freeze-issue-projection-sync.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/plans/PLAN-L3-37-atomic-downstream-queue.md
  references:
    - docs/governance/l3-downstream-queue.json
    - tests/l3-g3-freeze-packet-v2.test.ts
  blocks: []
---

# PLAN-L3-38: G3 freeze前のIssue projection同期

## §0 目的

Issue #30本文の旧18 FR / 54 AC / 19 slice / 旧PLAN名を、PR #113 merge後の
153 definition、24 FR / 72 AC / 24 HAT、24責務、84 downstream予約slot、
正式`PLAN-L3-20`へ同期する。#73/#74/#75には採用範囲、予約済みdownstream、
未実装境界を記録し、GitHub再観測snapshotをfreeze packetへ固定する。

## §工程表

### Step 1: GitHub Issue同期 [直列]

- #30本文をcurrent分母、正規実行順、未完Gateへ更新する。
- #73/#74/#75へ、adopted / reserved / pending implementationを混同しないdispositionを記録する。

### Step 2: GitHub再観測snapshot固定 [直列]

- 4 Issueのstate、`updatedAt`、URLをGitHubから再読取する。
- #30本文をUTF-8＋終端LFへ正規化したSHA-256をpacketへ固定する。

### Step 3: freeze packet preflight更新 [直列]

- material HEAD/treeをPR #113 merge後のmainへ進める。
- Issue同期済みを記録するが、5問回答、packet同一HEAD review、DB convergenceが未完のため
  `draft-not-approvable`と`PENDING_*`を維持する。

## §1 受入条件

- AC-1: #30が153 definition、24 FR / 72 AC / 24 HAT、24責務、45/27/12=84 slot、
  `PLAN-L3-20`、L4〜L12の未完境界を持つ。
- AC-2: #73/#74/#75が採用済みL3/L10と未完downstreamを分離する。
- AC-3: packetが4 Issueの再観測時刻、URL、#30本文digestを持つ。
- AC-4: packetはPO判断、G1/G3 freeze、pair closure、実装、実行証拠を主張しない。

## §2 非目標

- 5問へのPO回答を推測または代行しない。
- packet review HEADやDB convergence receiptを先取りしない。
- requirements definitionをfrozenへ遷移させない。

## §3 検証コマンド

- `npm run helix -- plan lint docs/plans/PLAN-L3-38-freeze-issue-projection-sync.md`
- `npx vitest run --project fast tests/l3-g3-freeze-packet-v2.test.ts tests/l3-downstream-queue.test.ts`
- `npm run typecheck`
