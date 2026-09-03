---
plan_id: PLAN-L3-83-functional-release-slice-composition
title: "PLAN-L3-83 (add-design): Functional Release Slice composition"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals:
  - "feature_addition"
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 1494
behavior_contract_id: FUNCTIONAL-RELEASE-SLICE-COMPOSITION-001
responsibility_owner: release-slice-composition
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "既存RLSの意味を保つ候補Authority Sliceであり、承認前はcurrent authorityへ書き戻さない。"
no_code_decision: no_change
contract_preconditions: "#1073のRelease Module／Bundle authority、#1074のcurrent inventory、#397のRequirement IR admission境界をread-afterできる"
contract_postconditions: "L1／L3／L10 candidate、Slice schema、Module／Bundle差分、promotion／rollback／CI導出条件が同一planへ束縛される"
contract_invariants: "SliceはModule／Bundle／workflow／route／drive／provider／repositoryと別軸、Issue本文は意味authorityでない、未承認candidateはruntime／DB／releaseへ投影しない"
contract_failures: "authority digest不一致、IR未admit、primary ownerの欠落／重複、included／excluded衝突、implicit inclusion、stale channel、unknown影響、未承認writeをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本PLANの初期sliceは未承認のL1／L3／L10 candidateと実装順だけを作成し、runtime／schema／DBの実装は承認後の後続atomic PLANへ分離する。"
complexity_effect: net_negative
complexity_justification: "Module／Bundleへ混在していた昇格、検証、除外の単位をSliceへ分離し、後続の影響閉包とconsumer検証を局所化する。"
removal_trigger: "candidateがplan固有承認、#397 IR admission、canonical promotionを経て、既存RLSのSlice差分へ置換された時"
parent_design: docs/governance/candidates/functional-release-slice-requests.md
pair_artifact: docs/governance/candidates/functional-release-slice-acceptance.md
dependencies:
  parent: docs/design/helix/L3-requirements/release-module-bundle-composition-requirements.md
  requires:
    - docs/plans/PLAN-L3-68-release-module-bundle-composition.md
  references:
    - "issue:1073"
    - "issue:1074"
    - "issue:1075"
    - "issue:1078"
    - "issue:1082"
    - "issue:1084"
    - "issue:1085"
    - "issue:1086"
    - "issue:397"
    - "issue:659"
    - "issue:856"
  blocks:
    - "issue:1075"
generates:
  - { artifact_path: docs/plans/PLAN-L3-83-functional-release-slice-composition.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/functional-release-slice-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/functional-release-slice-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/functional-release-slice-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/release-module-bundle-rollout-roadmap.md, artifact_type: markdown_doc }
agent_slots:
  - { role: se, slot_label: "SE — Slice schema／Module／Bundle composition" }
  - { role: qa, slot_label: "QA — channel／promotion／rollback／mutation oracle" }
  - { role: aim, slot_label: "AIM — consumer／CI影響閉包と配布projection" }
  - { role: tl, slot_label: "TL — RLS authority／#397 IR／非対象境界" }
review_evidence: []
---

# PLAN-L3-83: 機能昇格単位の構成

## 目的

既存のRelease Module／Bundle構成へ、機能を独立して検証・昇格・除外できる`Functional Release Slice`を追加する候補を
L1／L3／L10へ分解する。Module境界を増やすこと、Bundleを分裂させること、workflowやproviderを新設することは目的にしない。

## 実装順

1. #1074のcurrent inventoryと既存RLS-01のownershipをread-afterする。
2. 本PLAN固有のL1要求候補、L3要件候補、L10受入候補を確認し、未承認candidateとして保持する。
3. L3承認後に#397へ一方向admissionし、Requirement IRとsource digestを確定する。
4. Slice schema／registryを独立atomic sliceとして実装する。
5. Module primary／secondary ownership、Bundle included／excluded exact set、dependency／compatibilityを接続する。
6. qualification packet、channel promotion、replacement／rollback、CI impact closure、consumer／DevOS projectionを順に実装する。
7. targeted／mutation／full CI、DB replay、clean Linux／Windows、independent exact-HEAD review、main read-afterを行う。

## 責務分割

| 段階 | 責務 | 後続RLS |
|---|---|---|
| Authority | L1／L3／L10／IRの意味と境界 | RLS-02の前提 |
| Slice registry | 識別子、channel、依存関係、適格性確認 | RLS-02、RLS-04 |
| Composition | Module所有、Bundle収載／除外 | RLS-03、RLS-05 |
| Promotion | preview／rc／stable、復旧、置換 | RLS-09、RLS-10、RLS-12 |
| Verification | changed pathからprofile、local／global closure | RLS-11 |
| Projection | manifest、DB、GitHub、DevOS、consumerのread-after | RLS-07〜12 |

## 開発並列性

Authority candidateと#1074 inventoryを先に固定する。承認後は、Slice registry、static composition verifier、CI impact planner、
consumer／artifact verifierをfile ownershipが重ならないatomic sliceへ分けて並行化できる。RLS-02のschemaが未確定のまま、後続の
runtime、DB、Bundle resolverを先行実装してはならない。

## 完了境界

本PLANはcandidate文書とIssue graphを作成した段階では完了しない。L3承認、L10対、#397 IR admission、後続実装PR、
independent review、全必須CI、DB replay、consumer／rollback、main read-afterまでを別々に記録する。未承認candidateを理由に
existing RLSをstable扱いしたり、tag／publish／cutoverしたりしない。
