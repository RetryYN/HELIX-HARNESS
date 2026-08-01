---
plan_id: PLAN-L7-492-development-model-design-admission
title: "PLAN-L7-492 (add-impl): development model設計admission同期"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-08-01 Issue #248 design admissionをcurrent PRで閉じる"
created: 2026-08-01
updated: 2026-08-01
owner: Codex / TL
github_issue_id: 248
engineering_discipline_required: true
behavior_contract_id: AUTH-SURFACE-RUNTIME-001
responsibility_owner: development-model-runtime-routing
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: configure
ddd_modeling_decision: none
contract_preconditions: "PLAN-L5-83がruntime routing詳細設計とL8 oracleを定義している"
contract_postconditions: "新規L5設計が既存detailed-design itemへadmitされ、catalog current digestがreviewed owner、G3 packet、freeze oracleの3者で一致する"
contract_invariants: "design-catalog-baseline.jsonの凍結artifact setへ新規文書を追加せず、catalog本文変更時はG3 packet digestを正規再束縛し、runtime機能を追加しない"
contract_failures: "untracked-design-doc、凍結baseline setへの不正追加、reviewed digest／G3 packet／freeze oracleの不一致をfail-closeする"
tdd_red_required: true
red_at: "2026-08-01T01:36:58Z"
green_at: "2026-08-01T06:05:49Z"
mutation_oracle_evidence: "tests/design-coverage.test.ts::既存U-DESIGNCOV-013のuntracked-design-doc検査とU-DESIGNCOV-015が、catalog item未登録および凍結baselineへ新規文書を追加するseeded mutantをkilledする。reviewed digest driftは既存verifyL3ProgressionAuthorityへ委譲する"
complexity_effect: net_neutral
complexity_justification: "既存3 gateのpinを新規設計artifactへ同期するだけでdetectorや分岐を追加しない"
removal_trigger: "development-model-runtime-routing.mdがcatalogから廃止されconsumer=0になった時点"
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/function-spec.md, oracle_id: U-DESIGNCOV-015, test_path: tests/design-coverage.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — catalog admission pin同期" }
  - { role: qa, slot_label: "QA — design coverage regression" }
  - { role: tl, slot_label: "TL — scopeとdigest境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-492-development-model-design-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/design-coverage.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L5-83-development-model-runtime-routing.md
  requires:
    - docs/design/helix/L5-detail/development-model-runtime-routing.md
    - docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md
    - docs/plans/PLAN-REVERSE-492-development-model-design-admission.md
---

# PLAN-L7-492: development model設計admission同期

## 工程表

1. Red: 新規L5設計をcatalog itemへ登録しない状態で`untracked-design-doc`を再現し、凍結baselineへ追加する回避策も拒否する。
2. Green: 凍結artifact setを変更せず、既存`detailed-design` item、reviewed digest、G3 packet、freeze oracleを同じcatalog digestへ同期する。
3. Refactor: 新gate、新schema、新runtime分岐を追加せず、生成artifact admissionのみに保つ。

## 完了条件

- `U-DESIGNCOV-015`とreviewed digest gateがcurrent HEADでgreenになる。
- PR #327のruntime意味設計以外の機能、detector、schemaを追加しない。
- draft candidateのtargeted oracleと独立AI-B content reviewがgreenになった後だけconfirmedへ遷移し、confirmed最終HEADのfull CI、DB convergence、exact-HEAD reviewをPR admissionで閉じる。
