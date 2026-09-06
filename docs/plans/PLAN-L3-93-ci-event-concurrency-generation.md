---
plan_id: PLAN-L3-93-ci-event-concurrency-generation
title: "PLAN-L3-93 (add-design): CI event-class generation authorityを候補化する"
kind: add-design
layer: L3
drive: agent
status: draft
completion_claim_allowed: false
review_evidence: []
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive: CI高速化を先行し、必要な検証を落とさず待ち時間と再実行を実測削減する"
created: 2026-09-07
updated: 2026-09-07
owner: Codex / TL
github_issue_id: 1336
behavior_contract_id: CI-EVENT-CONCURRENCY-GENERATION-001
responsibility_owner: ci-system-synthesis
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
backprop_decision: required
backprop_decision_reason: "現行CIS-R-12/13はevent class、generation、main handoff、projection convergenceを閉じていないためL3/L10差分が必要"
no_code_decision: no_change
ddd_modeling_decision: policy
contract_preconditions: "CIS-R-01..15、#908 bounded cancel、CI telemetry、deferred recovery、DB replayが存在する"
contract_postconditions: "4 R／7 ACでevent generation、cancel matrix、main handoff、evidence convergenceを候補としてexact対応する"
contract_invariants: "required obligationを削減せず、別event classを相互cancelせず、cancelled runを成功証拠へ採用しない"
contract_failures: "payload欠落、wrong HEAD/attempt、generation race、handoff欠落、digest divergenceをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL1/L3/L10候補のみ。承認・canonical promotion前にruntime、workflow、DBを変更しない"
complexity_effect: justified_positive
complexity_justification: "GitHub native concurrencyの粗い隔離と既存cancel providerを再利用し、別schedulerや別DB authorityを作らない"
removal_trigger: "canonical CIS authorityへpromotionされ、runtime PLANへtraceが移管された時"
parent_design: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
pair_artifact: docs/governance/candidates/ci-event-concurrency-generation-acceptance.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
dependencies:
  parent: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md
  requires: []
  blocks:
    - issue:1336
  references:
    - issue:93
    - issue:538
    - issue:848
    - issue:908
    - issue:1034
    - issue:1106
    - issue:1137
    - issue:1204
    - issue:1208
    - issue:1322
generates:
  - { artifact_path: docs/governance/candidates/ci-event-concurrency-generation-requests.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/ci-event-concurrency-generation-requirements.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/ci-event-concurrency-generation-acceptance.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L3-93-ci-event-concurrency-generation.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: tl, slot_label: "TL — event generationと既存owner境界" }
  - { role: qa, slot_label: "QA — cancel race、wrong HEAD、projection divergence mutation" }
---

# CI event-class generation authority候補

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | Issue #1336と現行CIS authorityの差を分離 | Issue本文をruntime authorityとして直接利用しない |
| 2 | L1要求、L3要件、L10受入候補を作成 | 4 R／7 ACがexact対応する |
| 3 | 独立技術review | missing cancel class、race、証拠流用を検出する |
| 4 | L3人間確認 | plan固有typed approvalが成立する |
| 5 | canonical promotion | CIS authority、G3 freeze、IRへ束縛する |
| 6 | runtime／workflow／DB実装 | 別PLANでTDD、mutation、GitHub rehearsalを閉じる |

本PLANは相互cancelを緩和するだけのworkflow変更ではない。canonical promotion前に`harness-check.yml`やDBを
変更せず、既存CIS authorityを無断で拡張しない。
