---
plan_id: PLAN-L4-60-worker-descriptor-admission
title: "PLAN-L4-60 (add-design): worker descriptor admission基本設計"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-02 P1 Feature #92の強制dispatchとしてIssue #225のWCC-FR-01をL4/L9へ降下する"
created: 2026-08-02
updated: 2026-08-02
owner: Codex / TL
github_issue_id: 225
engineering_discipline_required: true
behavior_contract_id: WCC-FR-01
responsibility_owner: worker-descriptor-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: reuse
ddd_modeling_decision: domain_service
contract_preconditions: "worker共通L3/L10契約、AgentRegistry、PythonWorkerRegistryの既存authorityが存在する"
contract_postconditions: "provider-neutral descriptorを登録・解決・起動前判定するL4 componentとL9 oracleが一意になる"
contract_invariants: "全workerは同じversioned descriptor面を通り、provider固有I/O、unknown descriptor、複数解決を起動前に拒否する"
contract_failures: "descriptor欠落、unknown key/version/capability、0件・複数件解決、inactive、digest driftをfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存AgentRegistryとPythonWorkerRegistryのdescriptor解決を共通admissionへ合成し、新registry、DB table、detector、workflowを追加しない"
removal_trigger: "not_applicable: 本sliceは新しい互換層を追加せず既存ownerを再利用する"
pair_artifact: docs/test-design/helix/L9-worker-descriptor-admission-system-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — descriptor projection／registry resolution／起動前admission境界" }
  - { role: qa, slot_label: "QA — unknown／重複／inactive／digest driftのL9反例" }
  - { role: tl, slot_label: "TL — 既存registry再利用と設計リファクタリング" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-60-worker-descriptor-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-descriptor-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-worker-descriptor-admission-system-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/worker-descriptor-admission-design.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
  requires:
    - docs/design/helix/L3-requirements/worker-common-contract.md
    - docs/test-design/helix/worker-common-contract-acceptance.md
  references:
    - docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
    - docs/design/helix/L5-detail/python-worker-runtime.md
    - docs/design/helix/L6-function-design/python-worker-runtime.md
  blocks:
    - issue:225
---

# PLAN-L4-60: worker descriptor admission基本設計

## 工程表

### Step 1: inventoryとauthority境界 [直列]

- `AgentRegistry`と`PythonWorkerRegistry`の既存descriptor／resolution責務を確認する。
- provider固有CLI、sandbox、context packet、blind benchmarkを本sliceへ混載しない。

### Step 2: L4 componentとdata flow [直列]

- provider出力を共通descriptor projectionへ正規化し、registry snapshotからexactly-one解決する。
- 起動前admission、stale条件、failureを固定する。

### Step 3: 設計リファクタリング [直列]

- 新registry案と既存owner合成案を同じoracleで比較する。
- component、state、永続化、production codeの増分が小さい既存owner合成案を選ぶ。

### Step 4: L9 negative oracle [直列]

- descriptor欠落、unknown、重複、inactive、version／capability／digest driftを起動前に拒否する。
- provider固有I/Oやraw CLI結果をdescriptorの代替にしない。

### Step 5: independent review [直列]

- authoring runtimeと異なる独立AI-Bがexact HEADをread-onlyで検査する。

## 受入条件

- AC-1: `WCC-FR-01`と`worker-descriptor-admission`だけを閉じ、WCC-FR-02以降を完了扱いにしない。
- AC-2: versioned descriptorとregistry snapshotからexactly-one active workerを解決する。
- AC-3: invalid descriptorではprovider processのspawnを0件にする。
- AC-4: 既存registry ownerを再利用し、新registry、DB table、detector、workflowを追加しない。
- AC-5: targeted test、PLAN lint、typecheck、独立AI-B reviewがcurrent HEADでgreenである。

## 検証

- `npx --no-install vitest run --project fast tests/worker-descriptor-admission-design.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L4-60-worker-descriptor-admission.md`
