---
plan_id: PLAN-L7-707-setup-guide-node-runtime-guidance
title: "PLAN-L7-707: setup guideをNode.js 24＋npm authorityへ収束する"
kind: refactor
layer: L7
drive: agent
status: draft
backfill_state: pending_reverse
completion_claim_allowed: false
created: 2026-08-30
updated: 2026-08-30
owner: Codex / TL
github_issue_id: 1253
behavior_contract_id: CURRENT-RUNTIME-GUIDANCE-002
responsibility_owner: current-runtime-guidance
change_slice: atomic
refactor_step: migrate_consumer_guidance
engineering_discipline_required: true
no_code_decision: modify
ddd_modeling_decision: value_object
legacy_retirement_state: retired
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REFACTOR
entry_signals:
  - "po_directive:Issue #1253 setup guideのactive Bun guidanceをcurrent Node/npm authorityへ収束"
contract_preconditions: "ADR-009、package.json engines/scripts/bin、既存current-runtime-guidance L6/L8 pairがcurrent authorityである"
contract_postconditions: "consumer setup guideがNode.js >=24.15.0 <25、npm ci、npm run helix --だけをactive guidanceとして返す"
contract_invariants: "runtime behavior、CLI identity、cutover approval、compatibility-only historical proseを変更しない"
contract_failures: "Bun guidance残存、package authority drift、npm separator欠落、別runtime再導入をfail-closeする"
tdd_red_required: true
red_at: "2026-08-30T19:36:17+09:00"
green_at: "2026-08-30T19:36:51+09:00"
tdd_red_evidence: "tests/current-runtime-guidance.test.ts U-CRG-004が旧setup guideのNode/npm authority欠落を検出して1 failed／3 passed"
tdd_green_evidence: "2026-08-30T19:36:51+09:00にU-CRG-001..004の4 tests greenを実測し、setup guideのNode engine、npm ci、npm run helix --、Bun不在を確認した"
mutation_oracle_required: true
mutation_oracle_evidence: "U-CRG-004がNode engine、npm ci、setup/doctor command、全inline／fenced package-local commandのseparator、Bun残存を別々に拘束し、fenced commandからseparatorだけを除くmutationを検出する"
complexity_effect: net_negative
complexity_justification: "旧Bun command 11件とactive Bun token 12件を削除し、package authorityへ案内を一元化する"
removal_trigger: "setup guide自体がgenerated consumer documentationへ完全移行し、同oracleがreplacementへ移った時"
parent_design: docs/design/helix/L6-function-design/current-runtime-guidance.md
pair_artifact: docs/test-design/helix/L8-current-runtime-guidance-test-design.md
dependencies:
  parent: docs/plans/PLAN-REVERSE-567-current-runtime-guidance.md
  requires:
    - docs/plans/PLAN-REVERSE-567-current-runtime-guidance.md
  references:
    - issue:1253
    - issue:206
    - issue:204
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/current-runtime-guidance.md, oracle_id: U-CRG-004, test_path: tests/current-runtime-guidance.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-707-setup-guide-node-runtime-guidance.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/reference/setup-guide.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-current-runtime-guidance-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/current-runtime-guidance.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: generated_evidence }
agent_slots:
  - { role: se, slot_label: "SE — package runtime authorityとconsumer guidance境界" }
  - { role: qa, slot_label: "QA — Bun残存とnpm command mutation" }
---

# setup guide Node/npm収束

Issue #1253のruntime guidance責務だけを実施し、旧L08-L14、dynamic workflow guide、Release/cutoverへ責務を広げない。L8 oracleとL12 reviewed dispositionは同じ意味契約の派生projectionとして同一HEADへ束縛する。
