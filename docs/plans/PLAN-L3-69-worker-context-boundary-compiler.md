---
plan_id: PLAN-L3-69-worker-context-boundary-compiler
title: "PLAN-L3-69 (add-design): worker context boundary compiler CLIを正本化する"
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
  - "po_directive:Issue #1098 worker-context-packet.v1生成CLIの正規入口を要求へ分解する"
created: 2026-08-27
updated: 2026-09-05
owner: Codex / TL
github_issue_id: 1098
behavior_contract_id: WCTXCLI-FR-001
responsibility_owner: worker-context-boundary-compiler
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "WCC-FR-09のboundary loader／authority attestation／in-memory packet compilerが現行runtimeへ存在する"
contract_postconditions: "WCTXCLI-FR-001..002、WCTX-R-01..08、WCTX-AC-001..016がL3↔L10へ束縛され、L6実装入力が明確になる"
contract_invariants: "boundary fileとsealed packetを分離し、欠落値を推測せず、registry-admitted execution pathを同じwrapper authorityへ接続する"
contract_failures: "scope／owner／budget推測、path escape、authority drift、packet永続化、secret出力、raw provider fallbackをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはrequirementsとL10受入設計だけを追加し、実行可能なCLI／wrapper oracleはL3確認後のL6実装PRへ分離する"
complexity_effect: net_neutral
complexity_justification: "既存WCC-FR-09 compilerを再利用するため、新しいpacket／authority／provider経路を増やさない"
removal_trigger: "boundary compilerが上位のcurrent task packet authorityへ統合され、後続consumerが0になった時"
parent_design: docs/design/helix/L3-requirements/worker-common-contract.md
pair_artifact: docs/test-design/helix/worker-context-boundary-compiler-acceptance.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - { role: tl, slot_label: "TL — WCC-FR-09 authority、boundary／packet分離、CLI契約" }
  - { role: qa, slot_label: "QA — fail-close、path／secret、全wrapper共通経路mutation" }
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-69-worker-context-boundary-compiler.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/worker-context-boundary-compiler.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/worker-context-boundary-compiler-acceptance.md, artifact_type: test_design }
  - { artifact_path: tests/worker-context-boundary-compiler-requirements.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-progression-authority.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/feedback-test-owner-disposition-residual.json, artifact_type: json_config }
  - { artifact_path: tests/feedback-test-owner-residual-disposition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/design/helix/L3-requirements/worker-common-contract.md
  requires: []
  references:
    - docs/governance/worker-context-boundary-operator-guide.md
    - docs/plans/PLAN-L7-503-worker-context-authority.md
    - issue:865
  blocks:
    - issue:1098
---

# worker context boundary compiler CLI要求authority

## §工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | #1098の実行不能経路とWCC-FR-09を照合 | boundary fileとsealed packetの責務が分離される |
| 2 | L3要件を追加 | 明示入力、plan exact接続、path／secret／legacy境界が固定される |
| 3 | L10受入設計を追加 | 16件の正常／異常oracleとregistry-admitted path共通利用が定義される |
| 4 | catalog／snapshotを接続 | PLAN、設計、受入設計の正本参照が機械追跡できる |
| 5 | targeted lintと独立レビュー | blocker 0、L6実装入力がcurrent HEADへ束縛される |

本PLANはrequirements・受入設計のfreezeだけを担当する。CLI実装、provider起動、registry-admitted execution pathの
配線、実行可能test、secret／network policy変更は後続PRへ分離し、`completion_claim_allowed: false`を維持する。
L3確認前に実行可能なtest deliverableを追加してgateを先取りしてはならない。
