---
plan_id: PLAN-L5-105-cursor-cloud-independent-execution-contract
title: "PLAN-L5-105 (add-design): Cursor Cloud第三者実行レーンのtyped契約"
kind: add-design
layer: L5
drive: agent
status: draft
completion_claim_allowed: false
runtime_activation_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: ADD_FEATURE
entry_signals: ["po_directive:親Feature完了に依存しない第三者レーンをL5/L8へ降下する"]
created: 2026-09-12
owner: Codex / TL
github_issue_id: 1293
engineering_discipline_required: true
behavior_contract_id: CURSOR-CLOUD-INDEPENDENT-EXECUTION-001
responsibility_owner: cursor-cloud-execution
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "confirmed PLAN-L4-77とcanonical L4/L9 pairが成立している"
contract_postconditions: "assignment、ownership、pre/post external read-after、budget/deadline、remote output、review returnのexact schemaとfailure順序をL5/L8で固定する"
contract_invariants: "Issue/PLAN択一、事前発行branch、single writer、bounded retry、worker自己申告非正本、他レーン非停止を維持し、第二台帳・第二scheduler・第二approvalを作らない"
contract_failures: "schema、authority、ownership、identity、budget、launch ambiguity、output provenance、review stale、safe releaseの不成立を対象assignmentだけfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。L5/L8 pairのexact contractを固定し、実装Red/Greenは後続L6/L7が所有する"
complexity_effect: net_negative
complexity_justification: "既存portを一つのtyped envelopeと決定的failure順へ収束し、親Issue完了への偽依存とCursor専用管理基盤を除く"
removal_trigger: "後継schemaへ全consumerがreceipt付き移行しv1 consumerが0になった時"
pair_artifact: docs/test-design/helix/L8-cursor-cloud-independent-execution-contract-unit-test-design.md
backprop_decision: not_required
backprop_decision_reason: "confirmed L4境界を型とunit oracleへ具体化し、L3要求の意味を変更しない"
review_evidence: []
agent_slots:
  - { role: se, slot_label: "SE — envelope／ownership／external receipt schema" }
  - { role: qa, slot_label: "QA — failure precedence／mutation／replay oracle" }
  - { role: tl, slot_label: "TL — 既存owner再利用と独立着手境界" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/cursor-cloud-independent-execution-contract.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-cursor-cloud-independent-execution-contract-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/cursor-cloud-independent-execution-contract-design.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L4-77-cursor-cloud-independent-execution-boundary.md
  requires:
    - docs/design/helix/L4-basic-design/cursor-cloud-independent-execution-boundary.md
    - docs/test-design/helix/L9-cursor-cloud-independent-execution-boundary.md
  blocks:
    - issue:1293-l6-l7-runtime
---

# Cursor Cloud第三者実行レーン typed契約

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | assignment／ownership schemaを固定 | [直列] | Issue/PLAN択一とsingle writerが決定的 |
| 2 | launch／read-after／output schemaを固定 | [直列] | worker自己申告だけではreceipt 0 |
| 3 | L8 failure／mutationを固定 | [直列] | U-CCI-001..018 orphan 0 |
| 4 | 独立レビュー | [review] | current HEAD blocker 0 |

本PLANはL5/L8 pairだけを所有する。runtime、provider credential、課金操作、実cloud dispatchを開始せず、
#1358／#1362／#860 Phase B全体の完了を着手条件へ戻さない。
