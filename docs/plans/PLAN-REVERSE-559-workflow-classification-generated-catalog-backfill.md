---
plan_id: PLAN-REVERSE-559-workflow-classification-generated-catalog-backfill
title: "PLAN-REVERSE-559: workflow分類generated catalogの設計backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
route_mode: reverse
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-08-15
updated: 2026-08-15
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: WFCLASS-CATALOG-001
responsibility_owner: workflow-classification-generated-catalog
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-workflow-classification-generated-catalog-runtime-unit-test-design.md
entry_signals:
  - "po_directive:Issue #694 generated catalog implementationをrequirements registryへReverse照合する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    reason: "全31 identity、9 typed axis、parent relation、signal bindingがgenerated catalogへ等価投影される。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
    reason: "deterministic projection、digest binding、legacy identity非出力が実装と一致する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-workflow-classification-generated-catalog-runtime-unit-test-design.md
    reason: "U-WFCAT-001..004が無損失投影、source binding、axis分離、manual driftを反証する。"
agent_slots:
  - { role: se, slot_label: "SE — R0 implementation／projection trace採取" }
  - { role: qa, slot_label: "QA — R1 digest／drift／axis混同反証" }
  - { role: tl, slot_label: "TL — R2設計、R3要求意図、R4再入判断" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-559-workflow-classification-generated-catalog-backfill.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md
  requires:
    - docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md
  references:
    - docs/plans/PLAN-L7-561-workflow-classification-generated-catalog.md
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - docs/design/helix/L6-function-design/workflow-classification-generated-catalog.md
    - docs/test-design/helix/L8-workflow-classification-generated-catalog-runtime-unit-test-design.md
    - src/schema/workflow-classification-catalog.ts
    - tests/workflow-classification-catalog.test.ts
---

# workflow分類generated catalogの設計backfill

## R0 現状採取

requirements-owned registry、generated catalog、projection module、U-WFCAT-001..004を採取した。
旧`drive-route-catalog.v1`の15件はcompatibility inventoryとして残り、current projectionのidentityへ
再出力されていない。

## R1 観測テスト設計

- registryとcatalogのentity、axis、relation、signal bindingを完全一致で比較する。
- requirements digestとregistry bytes digestのstale化を拒否する。
- common route identity、legacy identity emission、旧`FORWARD_FULL_V`混入を拒否する。
- committed projectionへの手編集を再生成比較でfail-closeする。

## R2 As-Is設計

実装はL3 registryの意味を追加・変更せず、全typed identityを順序込みで投影する。L6設計が定める
deterministic projectionと二重digest bindingに一致し、runtime routing、CLI、DB、legacy adapterを先取りしない。

## R3 意図照合

Issue #694の本線は旧15-route体系を新正本へ固定することではなく、新要求のtyped registryから下流surfaceを
Forward生成することである。本sliceはその最初のgenerated catalog境界を実装し、旧catalogを意味authorityに
戻していないため意図に一致する。

## R4 Forward再入

L3、L6、L8の各scopeは`preserve`とする。新しい要求gapはなく、次のForward再入先はregistry-backed typed
runtime routingである。本PLAN単独では#694を完了せず、runtime／CLI／DB／adapter／doctorの後続sliceを維持する。
