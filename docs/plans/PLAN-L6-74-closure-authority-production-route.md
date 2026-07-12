---
plan_id: PLAN-L6-74-closure-authority-production-route
title: "PLAN-L6-74 (add-design): closure authority production route"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-12 ハーネスメモリと起票を潰し、設計基準へ検出力を追従させる継続指示。PR #19 merge後のcurrent mainでproduction入口欠落を検出"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
irreversible_impact: none
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-73の既存contractをproduction CLIへ到達させるadditive設計であり、L0-L3要求とhuman/action-binding境界を変更しない。"
pair_artifact: docs/test-design/harness/closure-authority-production-route.md
agent_slots:
  - { role: se, slot_label: "SE - current-main proposal bundle生成とcanonical allowlist配線" }
  - { role: qa, slot_label: "QA - clean HEAD、全候補保存則、read-only、欠落source fail-close検証" }
generates:
  - { artifact_path: docs/design/harness/L6-function-design/closure-authority-production-route.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/closure-authority-production-route.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
dependencies:
  parent: docs/plans/PLAN-L6-73-closure-authority-backfill.md
  requires: [docs/plans/PLAN-L6-73-closure-authority-backfill.md]
---

# PLAN-L6-74: closure authority本番経路

## 1. 目的

`buildClosureAuthorityBackfill`のpure policyと厳密verifierの間に欠けているproduction bundle生成routeを補い、
current mainの全`close_ready`候補を、推測なしの6分類へ実測可能にする。

## 2. 完了条件

- canonical gate allowlistがrepo-owned、strict、HEAD tracked sourceとして存在する。
- public loaderがcurrent review scopeの全候補を100件以下のwindowで再構築する。
- `helix closure authority-backfill --dry-run --from-db --expected-head <sha> --json`がread-only bundleを返す。
- clean current `HEAD == origin/main`、persistent DB、全候補保存則、source digestをfail-closeで強制する。
- `U-CABF-011..018`がL8で一対一に定義される。

## 3. 非目標

- 本設計だけでregistry row、closure status、approvalを変更しない。
- authority blockが無いPLANへcapability/gateを推測・一括注入しない。
- human/action-binding対象を自動承認しない。
