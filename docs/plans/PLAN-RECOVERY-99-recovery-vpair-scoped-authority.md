---
plan_id: PLAN-RECOVERY-99-recovery-vpair-scoped-authority
title: "PLAN-RECOVERY-99: Recovery PLANのV-pair bindingをscoped authorityへ移行する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1479
behavior_contract_id: RECOVERY-VPAIR-SCOPED-AUTHORITY-001
responsibility_owner: plan-specific-vpair-binding
engineering_discipline_required: true
change_slice: atomic
refactor_step: strengthen_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: [regression_dev]
contract_preconditions: "authority v3がimpl/add-implのinitial 286件とtombstone chainを固定し、Recovery 87 PLANをeligibilityから除外している"
contract_postconditions: "既存implementation authorityを保持したままRecovery全87 PLANを検査し、対象化delta 260 findingを独立scope・reason別baselineとして0へratchetする"
contract_invariants: "既存gateとfinding identityを再利用し、implementation scopeとRecovery scopeをANDする。legacy greenでRecovery redを相殺せず、他kindを黙示的に対象化しない"
contract_failures: "Recovery除外、scope digest drift、reason count drift、baseline増加、unused exemption、resolved finding再出現、cross-scope ownership findingの欠落をfail-closeする"
tdd_red_required: true
red_at: "2026-09-03T09:33:58Z"
green_at: "2026-09-03T09:39:24Z"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-03T09:39:08ZにisEligiblePlanからrecovery分岐だけを一時除去し、`npx --no-install vitest run --project fast tests/plan-descent-specific-parent-binding.test.ts -t U-PSPB-028`を実行した。checkedPlansが期待1に対して0となりexit 1でmutationをkillした。分岐復元後、2026-09-03T09:39:24Zに同file 24 testsがgreen。U-PSPB-029はproduction authorityのoracle_not_declared reason baselineを1件上方修正するin-test mutationをbaseline_authority_invalidとして拒否する。"
complexity_effect: net_neutral
complexity_justification: "新lintを追加せず既存authorityへscopeを一つ追加し、旧v3実績とRecovery debtを混ぜずに同じanalyzerで評価する"
removal_trigger: "全execution-bearing PLAN kindがtyped eligibility policyへ移行し、scope別baselineが0で統合可能になった時"
backprop_decision: not_required
backprop_decision_reason: "既存V-pair実在要件の検査漏れを回復するもので、要求意味や受入価値を変更しない"
parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
  requires:
    - docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
    - docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
  references: ["issue:1479", "issue:1478", "issue:1468"]
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md, oracle_id: U-PSPB-028, test_path: tests/plan-descent-specific-parent-binding.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md, oracle_id: U-PSPB-029, test_path: tests/plan-descent-specific-parent-binding.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — Recovery対象化で露出する宣言と実体の乖離監査" }
  - { role: se, slot_label: "SE — scoped authority schemaと既存digest chain保持" }
  - { role: qa, slot_label: "QA — eligibility／reason baseline／cross-scope mutation" }
  - { role: tl, slot_label: "TL — Recovery全件対象と他kind非混載の境界監査" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-99-recovery-vpair-scoped-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
modifies:
  - { artifact_path: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/plan-specific-vpair-binding.ts, artifact_type: source_module }
  - { artifact_path: config/plan-specific-vpair-binding-authority.json, artifact_type: json_config }
  - { artifact_path: tests/plan-descent-specific-parent-binding.test.ts, artifact_type: test_code }
---

# Recovery PLANのV-pair binding scoped authority移行

## 目的

`kind: recovery`を検査対象へ加えると、Recovery自身の257 findingに加えて、既存implとのoracle ownership
衝突が3件露出する。この対象化delta 260件を隠さず、既存v3 implementation authorityを保持した
独立scopeへ固定する。

## 実装境界

1. authority schemaをv4へ上げ、既存`initialAuthority`／`resolvedTombstones`は変更しない。
2. `recoveryAuthority`へeligible kind、reason別baseline、initial finding、tombstone chainを持たせる。
3. code-sideでimplementationの既存3 digestとRecovery scopeのinitial／terminal digest、reason別件数を固定する。
4. pure analyzerはimpl／add-impl／recoveryを同時評価し、両scopeのexemptionとfailureをANDする。
5. refactor／troubleshoot／reverse等の棚卸し結果は後続authority sliceへ渡し、本変更へ混載しない。

## 現在のRed

Recoveryをeligibilityへ追加してv3 authorityのまま実repo testを実行すると`checked=572`、
`exempted=0`、546 findingとなる。Recovery 257件だけをscopeへ入れると、
cross-scope ownership 3件が残ってredになる。これをv4 migrationの反証基準とする。

## 完了条件

- [ ] U-PSPB-028がRecovery eligibility除去mutationをkillする。
- [ ] U-PSPB-029がreason別baseline上方修正をkillする。
- [ ] 既存implementation authorityのlegacy／initial／terminal digestが不変である。
- [ ] Recovery対象化delta 260件がreason別に固定され、実repo gateがgreenになる。
- [ ] targeted、typecheck、PLAN lint、全回帰、doctor、Claude exact-HEAD reviewがgreenになる。
- [ ] main read-after後も同じchecked／exempted／finding状態を返す。
