---
plan_id: PLAN-L5-86-worker-descriptor-admission
title: "PLAN-L5-86 (add-design): worker descriptor admission詳細設計"
kind: add-design
layer: L5
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-02 Feature #92の連続dispatchとしてIssue #225 WCC-FR-01をL5/L8へ降下する"
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
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-60のL4/L9 pairがmainへmerge済みで、既存specialist agent registryとPython worker registryが実在する"
contract_postconditions: "descriptor canonicalization、3-tuple resolution、failure、stale、decision digestとL8 mutation oracleが実装可能な精度で一意になる"
contract_invariants: "descriptor digestは自己fieldを除外し、agent/version/capabilityをexact照合し、provider fallbackと新registryを許さない"
contract_failures: "unknown key、digest drift、0/複数/inactive、version/capability不一致、stale decision、後続責務混載をfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存registryをread-only projectionで合成し、新registry、table、workflow、provider別判定器を追加しない"
removal_trigger: "not_applicable: compatibility layerや新ownerを追加しない"
pair_artifact: docs/test-design/helix/L8-worker-descriptor-admission-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — canonical型／digest／3-tuple resolution／stale契約" }
  - { role: qa, slot_label: "QA — strict parser／failure precedence／mutation oracle" }
  - { role: tl, slot_label: "TL — 既存owner再利用と後続責務境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-86-worker-descriptor-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-descriptor-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-worker-descriptor-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/worker-descriptor-admission-detail-design.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L4-60-worker-descriptor-admission.md
  requires:
    - docs/design/helix/L4-basic-design/worker-descriptor-admission.md
    - docs/test-design/helix/L9-worker-descriptor-admission-system-test-design.md
  references:
    - src/runtime/specialist-agent-registry.ts
    - docs/design/helix/L5-detail/python-worker-runtime.md
  blocks:
    - issue:225
---

# PLAN-L5-86: worker descriptor admission詳細設計

## 工程表

### Step 1: inventory [直列]
- 既存registry型、digest helper、Python worker descriptorを確認し、再利用境界を固定する。

### Step 2: L5 contract [直列]
- canonical型、strict validation、digest、3-tuple resolution、failure順序、stale状態を確定する。

### Step 3: 設計リファクタリング [直列]
- 既存owner合成案と新registry案を同一oracleで比較し、機能非縮退の最小案を選ぶ。

### Step 4: L8 oracle [直列]
- positive／negative／mutationをL9 ST-WDA-001..009へexact traceする。

### Step 5: independent review [直列]
- 独立AI-BがL4/L9 descent、実装可能性、弱型化、後続責務混載をread-only検査する。

## 受入条件
- AC-1: WCC-FR-01／worker-descriptor-admissionだけを閉じる。
- AC-2: descriptor digestの自己参照除外とrequest versionを一意に固定する。
- AC-3: launch receipt failureをWCC-FR-02へ委譲し、本ownerへ混載しない。
- AC-4: L8に13 oracleとL9 exact traceを持つ。
- AC-5: 新registry、table、workflow、production codeを追加しない。

## 検証
- `npx --no-install vitest run --project fast tests/worker-descriptor-admission-detail-design.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L5-86-worker-descriptor-admission.md`
