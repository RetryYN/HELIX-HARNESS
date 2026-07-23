---
plan_id: PLAN-L3-34-residual-responsibility-recount
title: "L3残存責務の再集計と下流キュー欠落監査"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 /goal『残存責務を再集計して欠落を閉鎖』に基づきIssue #73/#75の下流予約を再監査"
created: 2026-07-23
updated: 2026-07-23
owner: Codex
github_issue_id: 30
pair_artifact: docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md
agent_slots:
  - role: tl
    slot_label: "TL — requirement setと下流責務境界の再集計"
  - role: qa
    slot_label: "QA — 監査分母と欠落workstreamの機械検証"
generates:
  - artifact_path: docs/governance/l3-residual-responsibility-audit.json
    artifact_type: config
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/governance/l3-downstream-queue.json
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
    - docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md
    - docs/test-design/helix/predecessor-harness-mechanism-hardening-acceptance.md
  references:
    - docs/governance/infinity-loop-requirement-definition-ledger.md
    - docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
---

# PLAN-L3-34: L3残存責務の再集計

## 目的

G3 packetと51枠の下流キューを再照合し、Issue #73の前身harness hardening差分とIssue #75の
model effort policyがL4以降へ降下するための予約を持つかを検査する。既存51枠を正しい分母と仮定せず、
要件・受入oracle・下流artifactの実在から再集計する。

## 判定

- 153件のprimary definition集合にIssue #75の意味は`HIL-FR-63`として含まれるが、
  `EffortRouter`のL4/L9、L5/L8、L6/L7 artifactは存在しない。
- Issue #73の`UTH-FR-001..035`と`UTH-NFR-001..005`は、153件とは別のL3/L10 hardening差分である。
  L10の5 oracle節を責務境界として降下すると、5 workstreamすべてでL4/L9、L5/L8、L6/L7が未予約である。
- 不足は6 workstream、pair closure 12枠、L6/L7 6枠、合計18枠である。
- 正しいpre-execution分母は、既存51枠に18枠を加えた69枠である。次PRでqueue IDと依存DAGを追補する。
- 監査対象のmerge済みHEADではcanonical oracle在庫は1,246件であり、元workspaceの未コミット値を
  freeze packetへ混入させない。

## 受入条件

- primary 153件とUTH 40件を混同せず、それぞれのfreeze対象を明記する。
- UTHの全40要件が5つのL10 oracle責務群へ重複なく被覆される。
- Issue #75がL3要件済みでも下流未降下であることを機械検査する。
- 51枠をG3 downstream denominatorとして再利用不可にする判定と、69枠への補正根拠を残す。

## Green commands

- `npx vitest run --project fast tests/l3-residual-responsibility-audit.test.ts`
- `npm run typecheck`
