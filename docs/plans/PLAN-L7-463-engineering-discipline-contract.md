---
plan_id: PLAN-L7-463-engineering-discipline-contract
title: "PLAN-L7-463 (impl): no-code-first・DDD・DbC・TDD工学規律契約"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-25 思想を整備し、契約で拘束する"
created: 2026-07-25
updated: 2026-07-25
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: U-EDISC-001..004
responsibility_owner: ddd-tdd-rules-policy
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "2026-07-25以降に作成するL3-L7 PLANはcanonical layerとcreatedを宣言する"
contract_postconditions: "対象PLANはno-code、DDD modeling、DbC、TDD、net complexityの判断を機械可読に保持する"
contract_invariants: "none/no_change/pure_functionを正規選択として保ち、不要なclass化やcode追加を強制しない"
contract_failures: "必須field、許容値、code増加理由、削除条件の欠落をdoctorでfail-closeし、repository stateは変更しない"
tdd_red_required: true
complexity_effect: justified_positive
complexity_justification: "既存DDD/TDD lintへ一つのPLAN契約検査を追加し、別detectorや別CI jobを増やさず将来の規律逸脱を防ぐ"
removal_trigger: "PLAN schemaの共通validatorが同じ契約を型付きで強制した時点で本lintの重複parserを統合または削除する"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-EDISC-001, test_path: tests/ddd-tdd-rules.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-EDISC-002, test_path: tests/ddd-tdd-rules.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-EDISC-003, test_path: tests/ddd-tdd-rules.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-EDISC-004, test_path: tests/ddd-tdd-rules.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — PLAN契約lintとtargeted test"
  - role: tl
    slot_label: "TL — no-code-first・DDD・DbC・TDD工程配置review"
generates:
  - { artifact_path: docs/plans/PLAN-L7-463-engineering-discipline-contract.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/ddd-tdd-rules.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/coding-rules.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/helix-harness-requirements_v1.3.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/github-atomic-development-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/design/harness/L6-function-design/governance-enforcement.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/process/forward/L00-L06-design-phase.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/add-feature.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/ddd-tdd-rules.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/ddd-tdd-rules.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/governance/helix-harness-requirements_v1.3.md
  references:
    - docs/governance/coding-rules.md
  blocks: []
---

# PLAN-L7-463: no-code-first・DDD・DbC・TDD工学規律契約

## 目的

「実装すること」を成果にせず、契約された振る舞いを最小の仕組みで実現する判断規律をG3からL7まで通す。
Object-oriented DDDを必要な責務だけに使い、DbCとTDDで実装・検証を拘束する。

## 実装範囲

1. no-code-first、選択的object-oriented DDD、DbC、Red→Green→Refactor、net complexityを一つのSSoTへ定義する。
2. G3、L4/L9、L5/L8、L6/L7の各freeze責務へ配置する。
3. 新規L3〜L7 PLANの機械可読contractをDDD/TDD lintでfail-closeする。
4. `none`、`no_change`、`pure_function`を正規判断としてtestし、overengineeringを防ぐ。

## 非対象

- 既存PLAN全件への一括backfill。
- 全domain logicのclass化、repository pattern化、または新しいDI framework導入。
- 独立したdetector、CI job、runtime state、dependencyの追加。

## 完了条件

- DDD/TDDとcoding-ruleの正本、要件正本、Forward/Add-feature workflowが同じ契約を参照する。
- 欠落PLAN、no-code判断、code/complexity増加のnegative/positive oracleがgreenになる。
- typecheck、targeted lint、DDD/TDD/coding-rule tests、doctorの当該gateがgreenになる。
- cross-runtime review後にreview evidenceを記録し、confirmedへ遷移する。
