---
plan_id: PLAN-L3-1610-conversation-lifetime-reconstruction
title: "PLAN-L3-1610: 会話寿命管理と外部状態からの継続再構成"
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
  - "po_directive:会話寿命管理と外部状態からの継続再構成を要求へ取り込む"
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 1610
behavior_contract_id: CONVERSATION-LIFETIME-RECONSTRUCTION-001
responsibility_owner: requirements-authority-materialization
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "本PLANが上流要求候補の取り込みを所有する。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "#1608候補、既存continuation／memory／handover／provider capability ownerと原文を照合し、#1608 canonical化前は本候補も昇格させない"
contract_postconditions: "CLR-R01..08とCLR-AC01..08を独立候補へ束縛する"
contract_invariants: "第二正本禁止、論理作業継承、二重副作用禁止、候補とruntime完成の分離"
contract_failures: "未保存情報の切捨て、sessionによる予算reset、private context混入、非対応方式の成功扱いを拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "要求候補のみ。実行oracleは後続の実装PLANで所有する。"
complexity_effect: net_negative
complexity_justification: "長大会話と反復要約への依存を既存正本からの再構成へ収束する。"
removal_trigger: "候補のcanonical昇格とIR admission後"
parent_design: docs/governance/candidates/conversation-lifetime-reconstruction-requests.md
pair_artifact: docs/governance/candidates/conversation-lifetime-reconstruction-acceptance.md
dependencies:
  parent: docs/governance/candidates/conversation-lifetime-reconstruction-requests.md
  requires: []
  references:
    - docs/plans/PLAN-L3-1608-instruction-path-change-resilience.md
    - issue:1370
    - issue:397
    - issue:873
    - issue:1448
    - issue:1594
    - issue:1595
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-1610-conversation-lifetime-reconstruction.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/conversation-lifetime-reconstruction-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/conversation-lifetime-reconstruction-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/conversation-lifetime-reconstruction-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: tl, slot_label: "TL — 既存ownerと継続identity境界を整理" }
  - { role: qa, slot_label: "QA — 未保存情報、二重副作用、stale注入反例を検証" }
review_evidence: []
---

# 会話寿命管理と外部状態からの継続再構成

本PLANは#1610の要求候補化だけを所有する。候補作成を人間承認、canonical authority、IR admission、
runtime実装、session自動切替、provider履歴削除として扱わない。CLR-R01..08とCLR-AC01..08の1対1追跡を維持する。
Issue-levelの#1608依存は維持し、#1608がcanonical化されるまでは本候補も承認・昇格させない。
ただし未承認候補同士をPLANのhard `requires`で循環停止させず、候補段階では明示参照として照合する。

原文 `01_REQUIREMENTS_DIRECTIVE.md` は候補mergeとdigest read-after後にroot intakeから退役させ、
SHA-256 `970e40bd1566318349a0f8198f47cb5924f3b2aba59020cfa0a2e00b02654cb5` で履歴を追跡する。
