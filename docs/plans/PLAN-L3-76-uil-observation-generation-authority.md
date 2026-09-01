---
plan_id: PLAN-L3-76-uil-observation-generation-authority
title: "PLAN-L3-76: UIL observation generation authorityをL3/L10へ追加する"
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
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1344 UIL observationのbaseline／candidate generation分離"
created: 2026-09-01
updated: 2026-09-01
owner: Codex / TL
github_issue_id: 1344
behavior_contract_id: UIL-OBSERVATION-GENERATION-SEPARATION-001
responsibility_owner: universal-improvement-observation-generation-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: consumer_migration
backprop_decision: not_required
backprop_decision_reason: "本PLAN自身がPR #1343のFindingをUIL-R-02の上流要求欠落へ還流してL3を変更するため、これより上流への追加backprop artifactは不要。"
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "UIL-R-01/R-02、TER、immutable Action registry、effective runner/toolchain attestationの責務境界が読める"
contract_postconditions: "baseline／candidate／post_main generation、historical sealing、comparison disposition、post-main promotionがL3/L10で独立契約になる"
contract_invariants: "candidate変更でhistorical baselineを再解釈せず、comparison不能をgreenへ丸めず、post-main read-after前にbaselineを昇格しない"
contract_failures: "generation統合、旧baselineのin-place rewrite、unknown environment補完、first cause消失、candidateのbaseline昇格を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL3/L10 authorityのRecoveryであり、runtime Red/Greenは後続UIL-GEN-01以降へ分離する。"
complexity_effect: justified_positive
complexity_justification: "既存normalized eventへgeneration value objectを追加し、別DB・別scanner・新workflow routeを作らない最小上流補正。"
removal_trigger: "UIL observation normalizerが同じthree-generation authorityを上位versionで完全内包した時。"
parent_design: docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md
pair_artifact: docs/test-design/helix/universal-improvement-loop-acceptance.md
dependencies:
  parent: docs/plans/PLAN-L3-74-universal-improvement-loop.md
  requires: []
  blocks: []
  references:
    - "issue:1344"
    - "issue:1210"
    - "issue:1174"
    - "issue:1185"
    - "issue:1340"
agent_slots:
  - { role: aim, slot_label: "AIM — generation identityとhistorical baseline境界" }
  - { role: qa, slot_label: "QA — three-generation negative oracle" }
  - { role: tl, slot_label: "TL — UIL／TER／toolchain attestation責務分離" }
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-76-uil-observation-generation-authority.md, artifact_type: markdown_doc }
  - { artifact_path: tests/universal-improvement-observation-generation-requirements.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/helix/L3-requirements/universal-improvement-loop-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/universal-improvement-loop-acceptance.md, artifact_type: test_design }
---

# UIL observation generation authorityのRecovery

Issue #1344の実測Findingを、Issue本文だけではなくL3↔L10正本へ還流する。旧baselineをcandidate側の
registry／detector identityで再解釈する経路を廃止し、runtime実装前にgeneration identity、比較不能、
post-main baseline promotionの意味境界をfreezeする。

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | #1343のRedと現行UIL-R-02を照合 | 上流要求欠落と局所実装欠陥を分離する |
| 2 | generation contractをL3へ追加 | baseline／candidate／post_mainが別identityになる |
| 3 | L10 oracleを追加 | historical rewrite、比較不能green化、先行昇格を拒否する |
| 4 | PO L3承認と独立review | current deltaがconfirmedになる |
| 5 | UIL-GEN-01以降へ降下 | runtimeを正本より先行させない |
