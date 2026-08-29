---
plan_id: PLAN-REVERSE-570-vmodel-legacy-guidance-boundary
title: "PLAN-REVERSE-570: V-model legacy guidanceをL1-L12 authorityへ隔離する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: normalization
forward_routing: L3
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
backprop_decision: not_required
backprop_decision_reason: "既存のL1-L12 canonical directiveとrequirements authorityをprocess guidanceへ再接着する文書正規化であり、上位要件・設計の意味を変更しないため、upstream artifactの生成は不要。"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #206のprocess surfaceが旧requirements／legacy layer pathをcurrent guidanceとして再出力している"
created: 2026-08-19
updated: 2026-08-20
owner: Codex / TL
github_issue_id: 206
behavior_contract_id: PROCESS-VMODEL-LEGACY-BOUNDARY-001
responsibility_owner: process-vmodel-legacy-boundary
engineering_discipline_required: true
agent_slots:
  - role: se
    slot_label: "SE — process文書のlegacy/current boundaryを正本へ照合"
  - role: qa
    slot_label: "QA — 旧requirements・L0-L14再出力のnegative audit"
  - role: tl
    slot_label: "TL — L1-L12 authorityとR4終端の適用判定"
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "process gate／Forward文書がrequirements v1.2またはL0-L14 physical pathをcurrent authorityとして案内している"
contract_postconditions: "requirements v1.3.12とL1-L12 directiveがcurrent authorityとして明示され、旧path／旧layerはcompatibility evidenceに限定される"
contract_invariants: "L0は層外anchor、正規pairはL1↔L12からL6↔L7、legacy greenでcurrent failureを相殺しない"
contract_failures: "requirements v1.2、L13/L14、旧G13/G14、legacy physical pathをcurrent gate・生成物・completion判定へ戻す表記を受理しない"
tdd_red_required: false
tdd_red_waiver_reason: "文書authorityの既存driftをcurrent-mainで是正し、対象surfaceのcompatibility-only markerと旧authority参照のnegative auditを同一sliceで閉じる"
mutation_oracle_evidence: "U-PWFA-005はcurrent Forward／L1設計文書のV-pairとdownstream routeをL1-L12へ固定し、L14／L8-L14への再昇格を実測でfailさせる。compatibility-only本文の旧表記は許容する。"
complexity_effect: net_negative
complexity_justification: "旧layerとcurrent layerの参照境界を明示し、requirements／directiveからprocessへ一方向に整理する"
pair_artifact: docs/test-design/helix/L8-process-workflow-authority-index-unit-test-design.md
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-570-vmodel-legacy-guidance-boundary.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/gates.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/forward/L00-L06-design-phase.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/forward/overview.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-process-workflow-authority-index-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/process-vmodel-legacy-boundary.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
dependencies:
  parent: issue:206
  requires:
    - docs/plans/PLAN-REVERSE-563-process-readme-typed-authority.md
    - docs/plans/PLAN-REVERSE-565-workflow-model-process-typed-authority.md
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
blocks: []
---

# PLAN-REVERSE-570: V-model legacy guidanceをL1-L12 authorityへ隔離する

## 目的

Issue #206のprocess surfaceに残る、requirements v1.2参照とL0-L14 physical pathの現役参照を、
current requirements v1.3.12とL1-L12 directiveへ再接着する。旧ファイルを削除・改名せず、監査・移行に必要な
compatibility evidenceとして保持するが、current gate、生成物、completion判定の入力へ戻さない。

## 対象と受入条件

- `docs/process/gates.md`はG8-G12とL1-L12 directiveをright-arm evidenceのcurrent sourceとして案内する。
- `docs/process/forward/L00-L06-design-phase.md`はlegacy physical pathと旧layer表記をcompatibility-onlyと明示する。
- `docs/process/forward/overview.md`はL1-L12 pairをcurrentとし、旧L0-L14要点を参照専用へ隔離する。
- 対象surfaceのrequirements参照はv1.3.12へ更新し、旧v1.2をcurrent authorityとして残さない。
- 旧path／旧layer名が必要な箇所は、compatibility evidenceであることとcurrent判定へ使わないことを同じsurfaceに記録する。

文書変更だけで完了を主張せず、PLAN lint、design-language、authority drift、targeted surface audit、
全回帰、doctor、DB convergence、独立exact-HEAD review、main read-afterを同一HEADへ束縛する。

## 非対象

- legacy physical fileの削除・改名・state移行
- runtime／CLI／DB identityの意味変更
- #679の安全境界、#659のpublish／tag／cutover
