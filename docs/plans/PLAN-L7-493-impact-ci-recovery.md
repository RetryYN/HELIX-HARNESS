---
plan_id: PLAN-L7-493-impact-ci-recovery
title: "PLAN-L7-493 (add-impl): Impact CI Recovery"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-08-01 Issue #93 L3Q-IT-024 implementation"
created: 2026-08-01
updated: 2026-08-01
owner: Codex / TL
github_issue_id: 93
engineering_discipline_required: true
behavior_contract_id: GH-AC-017
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: configure
legacy_retirement_state: consumers_present
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-92がpure selectorとprofile dispatchをpair freezeする"
contract_postconditions: "Draft selected／candidate full／post-merge fullが同じinventory contractで実行される"
contract_invariants: "unknown/high-risk full、exact partition、required gate非縮退、receipt exact HEAD"
contract_failures: "selector／inventory／partition／receipt／workflow driftをfail-closeする"
tdd_red_required: true
red_at: "2026-08-01T13:52:41Z"
green_at: "2026-08-01T13:53:58Z"
mutation_oracle_evidence: "U-IMPACTCI-001でduplicate inventoryを追加するとinvalid_inventory、U-IMPACTCI-004/005でworkflow／unknown pathをknown-lowへ落とすとfull exact set不一致、U-IMPACTCI-008/009でresult欠落／terminal二重登録、U-IMPACTCI-WF-001でsoft-pass／empty selection／snapshot re-read欠落をredにする"
complexity_effect: net_neutral
complexity_justification: "単一pure moduleと既存CLI/workflow接続だけを追加しrunnerを増やさない"
removal_trigger: "恒久profile契約のためなし。unconditional PR full stepはdual-green後に削除する"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-001, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-012, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-WF-001, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — pure selector／CLI／workflow実装" }
  - { role: qa, slot_label: "QA — impact selection／receipt／workflow mutation oracle" }
  - { role: tl, slot_label: "TL — full admission非縮退とscope監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-493-impact-ci-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/impact-ci.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: tests/impact-ci.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-92-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L6-92-impact-ci-recovery.md
    - docs/plans/PLAN-L5-84-impact-ci-recovery.md
---

# PLAN-L7-493: Impact CI Recovery

1. Red: U-IMPACTCI-001〜012とU-IMPACTCI-003B、workflow profile反例を固定する。
2. Green: pure selector、CLI JSON projection、既存workflow dispatchを最小実装する。
3. Refactor: canonical化とfailure codeを一箇所へ集約し、full suite commandを複製しない。
