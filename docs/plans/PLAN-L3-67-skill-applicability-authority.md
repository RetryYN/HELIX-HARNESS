---
plan_id: PLAN-L3-67-skill-applicability-authority
title: "PLAN-L3-67 (add-design): skill applicabilityをtyped identity参照へ正本化する"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:Issue #1044 requirements-owned skill applicability authority"
created: 2026-08-26
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 1044
behavior_contract_id: SKILL-APPLICABILITY-AUTHORITY-001
responsibility_owner: requirements-owned-skill-applicability
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "workflow classification registry v1.1.5がtyped axis／identityの意味正本である"
contract_postconditions: "skill applicabilityがtyped pair、極性、input-only legacy adapterへL3↔L10で束縛される"
contract_invariants: "workflow identityを複製せず、legacy successでcurrent failureを相殺しない"
contract_failures: "axis mismatch、unknown identity、polarity conflict、implicit default、legacy再出力をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはrequirements、versioned registry、acceptance設計だけを追加し、実行可能なtests/配下のoracleはL3 PLAN確認後の#248/#1047へ分離する"
complexity_effect: net_neutral
complexity_justification: "旧混在enumを増やさず、既存classification identityへのtyped参照を定義する"
removal_trigger: "skill applicability contractが後続requirements major versionへ統合された時"
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
pair_artifact: docs/test-design/helix/skill-applicability-authority-acceptance.md
agent_slots:
  - { role: tl, slot_label: "TL — authority境界と移行順" }
  - { role: qa, slot_label: "QA — axis／polarity／legacy mutation" }
generates:
  - { artifact_path: docs/plans/PLAN-L3-67-skill-applicability-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/skill-applicability-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L3-requirements/skill-applicability-registry.v1.json, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/skill-applicability-authority-acceptance.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
  requires: []
  blocks:
    - issue:248
    - issue:322
    - issue:243
---

# skill applicability authority正本化

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 旧runtimeとL5設計の軸混同を棚卸し | current／compatibility／supersededが分離される |
| 2 | L3 requirementsとversioned registryを追加 | typed pair、極性、legacy adapterがexact化される |
| 3 | L10 acceptance設計へnegative oracleを束縛 | axis mismatch、default、再出力を検出する。実行可能なoracleは#248/#1047へ分離する |
| 4 | targeted test、PLAN lint、独立review | blocker 0、#248の実装入力が確定する |

#248のruntime／DB／CLI実装と#322のmetadata backfillは本PLANへ混載しない。
本PLANはL3 requirements・registry・L10受入設計のfreezeだけを担当する。`tests/`配下の実行可能な
requirements oracleは、draft PLANがmainへmerged deliverableを持たないよう本sliceから分離し、L3 PLANの
確認後に#248/#1047のruntime sliceで追加する。ここでテスト実装を分離することはoracleの破棄ではなく、
承認境界を越えないための所有権分離である。
