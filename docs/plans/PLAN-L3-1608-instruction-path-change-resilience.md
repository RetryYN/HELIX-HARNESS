---
plan_id: PLAN-L3-1608-instruction-path-change-resilience
title: "PLAN-L3-1608: 指示経路の変更耐性と更新・縮退追従"
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
  target_id: REDESIGN
entry_signals:
  - "po_directive:指示経路の変更耐性と更新・縮退追従を要求へ取り込む"
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 1608
behavior_contract_id: INSTRUCTION-PATH-CHANGE-RESILIENCE-001
responsibility_owner: requirements-authority-materialization
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "本PLANが上流要求候補の取り込みを所有する。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "既存startup・provider・Rule・Skill ownerと原文を照合する"
contract_postconditions: "IPC-R01..08とIPC-AC01..08を独立候補へ束縛する"
contract_invariants: "第二正本禁止、旧新混在拒否、承認とruntime完成の分離"
contract_failures: "未読資料の推測、生成と読込の混同、取消済み権限の復活を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "要求候補のみ。実行oracleは後続の実装PLANで所有する。"
complexity_effect: net_negative
complexity_justification: "既存ownerをversion付き導出経路へ接合し、手動同期と二重正本を縮退する。"
removal_trigger: "候補のcanonical昇格とIR admission後"
parent_design: docs/governance/candidates/instruction-path-change-resilience-requests.md
pair_artifact: docs/governance/candidates/instruction-path-change-resilience-acceptance.md
dependencies:
  parent: docs/governance/candidates/instruction-path-change-resilience-requests.md
  requires: []
  references:
    - issue:1370
    - issue:397
    - issue:1594
    - issue:1595
  blocks:
    - issue:1610
generates:
  - { artifact_path: docs/plans/PLAN-L3-1608-instruction-path-change-resilience.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/instruction-path-change-resilience-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/instruction-path-change-resilience-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/instruction-path-change-resilience-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: tl, slot_label: "TL — 既存owner・version・更新境界を整理" }
  - { role: qa, slot_label: "QA — 旧新混在・wrong digest・load unknown反例を検証" }
review_evidence: []
---

# 指示経路の変更耐性と更新・縮退追従

本PLANは#1608の要求候補化だけを所有する。候補の作成を人間承認、canonical authority、IR admission、
runtime実装、consumer移行、旧経路退役として扱わない。IPC-R01..08とIPC-AC01..08の1対1追跡を維持する。

原文 `01_REQUIREMENTS_AMENDMENT_DIRECTIVE.md` は候補mergeとdigest read-after後にroot intakeから退役させ、
SHA-256 `c8888d4cf3d03f5c5a39a0ae6905bb76d03ddcc02fbf9cb21238e6516d9eced0` で履歴を追跡する。
