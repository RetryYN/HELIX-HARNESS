---
plan_id: PLAN-DISCOVERY-NN-poc-slug   # §1.10 A: PLAN-DISCOVERY-<NN>-<slug> または PLAN-SCRUM-*
title: "PLAN-DISCOVERY-NN (kind=poc): (日本語タイトル placeholder — 見出しは日本語を含める、design-language gate)"
kind: poc
layer: cross                          # poc は layer 制約なし (kind_layer_mismatch 対象外)
workflow_phase: S0                    # S0 backlog → S1 plan → S2 poc → S3 verify → S4 decide
scrum_type: design-spike              # 例: design-spike / feature-spike
drive: fe
status: draft
created: 2026-MM-DD
updated: 2026-MM-DD
owner: PO (人間) / AI
agent_slots:
  - role: aim                         # kind=poc は aim role 必須 (§1.8)
    slot_label: "AIM — Discovery 境界と S1/S4 判断条件の整理"
  - role: tl
    slot_label: "TL — 既存正本との整合レビュー"
  - role: po
    slot_label: "PO — 入口/出口の承認、S4 decide の主体"
generates:
  - artifact_path: docs/plans/PLAN-DISCOVERY-NN-poc-slug.md
    artifact_type: markdown_doc
  # draft の generates は実在する自 doc のみ。成果物は着地時に追加する (relation-graph stale-edge 防止)。
dependencies:
  parent: null
  requires: []
  references: []
---

<!-- S3 へ進める時点で下の s4_decision_record 骨格を必ず埋め始める (plan lint missing_s4_decision_record、
     source_ledger_freshness は S3 pending PLAN で必須)。S4 decide で全 16 フィールドを具体値にし、
     frontmatter に decision_outcome を記録する。 -->

s4_decision_record:
- allowed_outcome: `confirmed` / `rejected` / `pivot`
- decision_owner: (PO、判断日)
- decision_basis: (S2/S3 実走記録に基づく判断根拠)
- verified_evidence: (commit hash、gate green、テスト結果 — prose でなく実測を cite)
- stakeholder_review_or_proxy: (cross-runtime review。不可時は intra_runtime_subagent + 例外理由)
- acceptance_gap: (受入で意図的に残す gap と、その回収経路)
- unresolved_risk: (残リスクと期間限定性)
- external_source_basis: docs/process/modes/discovery.md と docs/process/modes/scrum.md の S4 decision rules。
- source_ledger_freshness: (S4 decision source ledger の確認日と有効性)
- source_status_delta: (外部 source の status 変化と影響)
- adoption_decision_delta: (既存 S4 済み decision との整合 — status=confirmed の PLAN のみ precedent に引く)
- workflow_route_impact: (mode/route 体系への影響)
- route_impact: (confirmed で解禁される descent)
- forward_route: (正本反映先と後続 PLAN)
- reverse_fullback_required: (yes の場合は PLAN-REVERSE-NNN を起票し、正本 artifact を generates に持たせる —
  空 fullback は scrum-reverse gate が fail-close する)
- promotion_strategy_or_rejection_pivot_rationale: (reuse-with-hardening / redesign 等 + 理由)

# PLAN-DISCOVERY-NN (kind=poc): (日本語タイトル)

## 目的

(PO 指示・出典と、検証したい仮説を書く)

## スコープ

### IN
### OUT / 非対象

<!-- 注意: 「不可逆」「cutover」「state dir」等の語の組み合わせは outstanding が
     irreversible_migration_pending に分類する。該当しない場合は言い換える。 -->

## 受入条件

(falsifiable な条件のみ。prose claim は test / command を cite する)

## スケジュール
- mode: serial | parallel (serial の場合は理由)

## 壊さない / 再発させない
