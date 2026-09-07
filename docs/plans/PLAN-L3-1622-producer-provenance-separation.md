---
plan_id: PLAN-L3-1622-producer-provenance-separation
title: "PLAN-L3-1622: 成果生成・commit・公開・独立review provenance分離"
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
  - "po_directive:実worker成果の独立reviewをcontent producer基準で成立させる"
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 1622
behavior_contract_id: PRODUCER-PROVENANCE-SEPARATION-001
responsibility_owner: requirements-authority-materialization
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "Issue #1622からL1/L3/L10候補へ降ろす要求形成sliceであり、既存runtime意味を変更しない。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "#1605 review真正性、worker lifecycle receipt、assignment／scope／HEAD identityを再利用し、Issue本文をruntime authorityにしない"
contract_postconditions: "PPS-BR-01..04、PPS-R-01..07、PPS-AC-001..010をexact対応で候補化する"
contract_invariants: "producerとGit操作主体の非同一性、unknownの非昇格、第二証拠基盤禁止、runtime先行禁止"
contract_failures: "role欠落、spoof、wrong assignment／HEAD／session、graph digest divergence、推測backfillを拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "L1/L3/L10候補のみ。runtime oracleはcanonical promotion後の実装PLANで所有する。"
complexity_effect: justified_positive
complexity_justification: "既存review/worker/GitHub provenanceを一つのversioned graphへ拡張し、別authorityを作らない。"
removal_trigger: "候補のcanonical promotionとIR admission後"
parent_design: docs/governance/candidates/producer-provenance-separation-requests.md
pair_artifact: docs/governance/candidates/producer-provenance-separation-acceptance.md
dependencies:
  parent: docs/governance/candidates/producer-provenance-separation-requests.md
  requires: []
  references:
    - issue:1605
    - issue:1612
    - issue:1616
    - issue:1622
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-1622-producer-provenance-separation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/producer-provenance-separation-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/producer-provenance-separation-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/producer-provenance-separation-acceptance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: tl, slot_label: "TL — provenance role・既存owner境界" }
  - { role: qa, slot_label: "QA — spoof・wrong identity・旧receipt反例" }
review_evidence: []
---

# 成果生成主体 provenance分離

本PLANはIssue #1622の要求候補化のみを所有する。候補mergeを人間承認、canonical authority、IR admission、
runtime/schema/DB実装として扱わない。PPS-BR、PPS-R、PPS-ACの対応を維持し、content producerをcommit executor、
GitHub actor、PR publisherから推測しない。
