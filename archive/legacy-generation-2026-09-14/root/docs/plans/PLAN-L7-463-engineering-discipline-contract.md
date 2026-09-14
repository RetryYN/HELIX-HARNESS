---
plan_id: PLAN-L7-463-engineering-discipline-contract
title: "PLAN-L7-463 (impl): no-code-first・DDD・DbC・TDD工学規律契約"
kind: impl
layer: L7
drive: agent
status: confirmed
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
red_at: "2026-07-24T16:06:47Z"
green_at: "2026-07-24T16:15:00Z"
mutation_oracle_evidence: "tests/ddd-tdd-rules.test.ts U-EDISC-001..004 seeded invalid-contract mutants killed by targeted Vitest"
complexity_effect: justified_positive
complexity_justification: "既存DDD/TDD lintへ一つのPLAN契約検査を追加し、別detectorや別CI jobを増やさず将来の規律逸脱を防ぐ"
removal_trigger: "PLAN schemaの共通validatorが同じ契約を型付きで強制した時点で本lintの重複parserを統合または削除する"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-24T16:20:23Z"
  review_binding:
    reviewer: claude-tl
    reviewed_at: "2026-07-24T16:20:23Z"
    evidence_digest: "sha256:10c7da24a23c2fed1f61ef26f98c23a353f53a015f42f68581bc22f22a2514a6"
  entries: []
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
review_evidence:
  - reviewer: claude-tl
    review_kind: cross_agent
    worker_model: gpt-5.6
    reviewer_model: claude-opus-4-8
    tests_green_at: "2026-07-24T16:15:00Z"
    reviewed_at: "2026-07-24T16:20:23Z"
    verdict: approve_after_fixes
    scope: "PR #121 content HEAD d61ddf30をseverity-firstで再監査。oracle結線、digest追従、artifact binding、日本語化deltaを確認し、selective DDD・no-code-first・DbC・net complexityのcontent approvalを維持。mergeはfull harness-check greenを条件とする。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/design-language.test.ts tests/ddd-tdd-rules.test.ts tests/oracle-test-trace.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/fe-roster-orchestration.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-24T16:15:00Z", evidence_path: tests/ddd-tdd-rules.test.ts, output_digest: "sha256:2e35c803e1a3b832b219747d6fce6349c216c755af8e9f11a7e44d0270436801" }
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
