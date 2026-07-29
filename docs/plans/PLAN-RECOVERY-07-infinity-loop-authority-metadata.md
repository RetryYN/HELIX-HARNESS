---
plan_id: PLAN-RECOVERY-07-infinity-loop-authority-metadata
title: "PLAN-RECOVERY-07: Infinity Loop要求engineのL1〜L12 authority metadata是正"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-07-29 現行L1〜L12を唯一のauthorityとし旧定義をcompatibility read-onlyへ隔離する"
created: 2026-07-29
updated: 2026-07-29
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: HIL-AUTHORITY-METADATA-FR-001
responsibility_owner: infinity-loop-requirement-authority-metadata
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "HIL 153要求、L3 24要件、L11 HOT 57、L10 HAT 24の意味集合を変更しない"
contract_postconditions: "Infinity Loopのcurrent metadataはL2↔L11とL3↔L10だけをauthorityとして返し、旧ID／物理pathはlegacy fieldだけに残る"
contract_invariants: "要求本文、stable requirement ID、assertion、oracle、component owner、statement digestを変更しない"
contract_failures: "active L1/L14/L12 metadata、L0〜L14 current表現、115件分母、current/legacy field混在をfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "新しいgateやschemaを増やさず、既存metadataと既存oracleのauthority driftだけを是正する"
removal_trigger: "legacy物理pathとPLAN IDのatomic migrationが完了しcompatibility metadata自体が不要になった時点"
irreversible_impact: none
github_issue_id: 264
parent_design: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM — metadataとoracleの原子的是正"
  - role: tl
    slot_label: "TL — current／legacy authority境界を是正"
  - role: qa
    slot_label: "QA — exact denominatorと旧current metadata拒否を検証"
generates:
  - artifact_path: docs/plans/PLAN-RECOVERY-07-infinity-loop-authority-metadata.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L1-infinity-loop-operational-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/infinity-loop-requirement-definition-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/infinity-loop-requirement-coverage-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/infinity-loop-assertion-coverage-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/feedback-test-owner-disposition-direct.json
    artifact_type: json_config
  - artifact_path: src/lint/l3-progression-reviewed-digests.ts
    artifact_type: source_module
  - artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts
    artifact_type: source_module
  - artifact_path: tests/infinity-loop-authority-metadata.test.ts
    artifact_type: test_code
  - artifact_path: tests/infinity-loop-strict-design-contract.test.ts
    artifact_type: test_code
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/l12-hybrid-recognition.test.ts
    artifact_type: test_code
  - artifact_path: tests/plan-id-naming.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L1-07-infinity-loop-platform-requirements.md
  requires:
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
    - docs/governance/infinity-loop-requirement-authority-binding.md
  references:
    - docs/governance/infinity-loop-requirement-definition-ledger.md
    - docs/governance/infinity-loop-requirement-coverage-ledger.md
    - docs/governance/infinity-loop-assertion-coverage-ledger.md
  blocks: []
---

# PLAN-RECOVERY-07: Infinity Loop authority metadata是正

## §工程表

### Step 1: current／compatibility分類 [直列]

- PLAN、L2要求、L11受入、L3要件、L10総合テストのcurrent fieldとlegacy fieldを分離する。
- 物理pathとstable IDは移動せず、current判定への入力から除外する。

### Step 2: denominator同期 [直列]

- HIL要求153件とcategory別33／69／11／40をcoverage台帳へ同期する。
- 古い115件、L1 current集合、L14 pair表現を廃止する。

### Step 3: polarity oracle [直列]

- active metadataへ旧layerを戻すmutationを拒否する。
- requirement、assertion、HOT、HAC、HATのexact setを独立計数する。

### Step 4: independent review [直列]

- authoring runtimeと異なる独立AI-Bがcurrent HEADをread-only検証する。
- Critical／High／Medium 0とfull CI greenを同一HEADへ束縛してからconfirm／mergeする。

## §1 受入条件

- AC-1: L2要求とL11受入、L3要件とL10総合テストがcanonical pairとして双方向一致する。
- AC-2: 旧L1/L14/L12はlegacy fieldまたはcompatibility path説明にだけ存在する。
- AC-3: 153 HIL要求、153 assertion、57 HOT、24 HAC、24 HATのexact denominatorが一致する。
- AC-4: requirement statementとstable IDのsemantic digestを変更しない。
- AC-5: 新しい要件、機能、gate、schema、queue、refactorを混載しない。

## §2 検証コマンド

- `npx vitest run --project fast tests/infinity-loop-authority-metadata.test.ts tests/infinity-loop-strict-design-contract.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-RECOVERY-07-infinity-loop-authority-metadata.md`
- `npm run typecheck`
