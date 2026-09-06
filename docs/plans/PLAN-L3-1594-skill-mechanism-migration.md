---
plan_id: PLAN-L3-1594-skill-mechanism-migration
title: "PLAN-L3-1594: 新Skill機構への責務移行"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
l3_human_approval:
  schema_version: helix-l3-human-approval.v1
  approval_kind: human_po
  decision: approve
  approver: RetryYN
  approved_at: "2026-09-06T20:35:09Z"
  plan_id: PLAN-L3-1594-skill-mechanism-migration
  approval_record_id: L3-PO-1594-001
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1594#issuecomment-5562000029"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:新要求文書を整理して取り込む skill-mechanism-migration"
created: 2026-09-06
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 1594
behavior_contract_id: SKILL-MECHANISM-MIGRATION-001
responsibility_owner: skill-mechanism-migration
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "本PLANが上流要求の取り込みを所有する。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "既存ownerと新要求本文を照合する"
contract_postconditions: "8要求と8受入を独立候補へ束縛する"
contract_invariants: "既存保護維持、第二正本禁止、独立受入"
contract_failures: "未確認能力の完成主張、承認の発明、無根拠削除を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "要求候補のみ。実行oracleは後続の実装PLANで所有する。"
complexity_effect: net_negative
complexity_justification: "既存ownerへ接続して重複供給と二重正本を縮退する。"
removal_trigger: "候補のcanonical昇格とIR admission後"
parent_design: docs/governance/candidates/skill-mechanism-migration-requests.md
pair_artifact: docs/governance/candidates/skill-mechanism-migration-acceptance.md
dependencies:
  parent: docs/governance/candidates/skill-mechanism-migration-requests.md
  requires: []
  references:
    - issue:1382
    - issue:397
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-1594-skill-mechanism-migration.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/skill-mechanism-migration-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/skill-mechanism-migration-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/skill-mechanism-migration-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: tl, slot_label: "TL — 既存owner・意味正本・移行境界を整理" }
  - { role: qa, slot_label: "QA — 要求の保持・独立受入・反例を検証" }
review_evidence: []
---

# 新Skill機構への責務移行

本PLANは新要求候補の整理を所有する。既承認PLANの承認範囲を本差分へ転用しない。
要求・要件・受入の対応をレビューし、canonical merge/read-after、#397 admissionを経て実装する。
S-R01..08とS-AC01..08の追跡を維持する。
別要求の全体完成を前提にせず、同一startup編集・Policy受領だけ対象とdigest付き局所依存にする。
