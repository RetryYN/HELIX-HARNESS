---
plan_id: PLAN-RECOVERY-71-skill-applicability-oracle-closure
title: "PLAN-RECOVERY-71: skill applicability registry bindingとrebuild oracleをpost-merge回収する"
kind: recovery
layer: cross
drive: db
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:CI self-healとClaude Code独立レビューに従い、PR #1213 post-merge reviewで検出したregistry bindingとdeterministic rebuildのmutation生存をRecoveryする"
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 1220
behavior_contract_id: SKILL-APPLICABILITY-ORACLE-RECOVERY-001
responsibility_owner: typed-skill-db-projection
engineering_discipline_required: true
change_slice: atomic
refactor_step: add_oracle
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "本Recovery内でL8 test designと実testを同時に是正し、別の上流backprop episodeを残さない。"
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "PR #1213はmainへmerge済みだが、registry version／digest定数化とrebuild projection block削除の3 mutationが既存testを生存する"
contract_postconditions: "catalogとdeterministic rebuildの両経路がregistry version／digestを含む同じtyped exact row setを投影し、3 mutationを個別にkillする"
contract_invariants: "期待値を緩めずcurrent registry実値へ照合し、catalog-only greenをDB正本rebuildの証拠へ再解釈しない"
contract_failures: "wrong registry version、wrong registry digest、rebuild row欠落、polarity／axis／identity driftを個別に検出する"
tdd_red_required: true
red_test: "Opus review session 953a7541-86b2-46e2-877d-8cb55bb22a0dがM2 registry digest定数化、M3 registry version定数化、M5 rebuild投影block削除の生存を独立実測した"
red_at: "2026-08-29T22:02:42+09:00"
green_at: "2026-08-29T22:08:25+09:00"
mutation_oracle_evidence: "2026-08-29T22:10:12+09:00に隔離copyで再実測。M2 registry_source_digestをsha256:0へ固定するとasset-catalog 1 failed／1 passed、M3 registry_versionを0.0.0へ固定すると1 failed／1 passed、M5 deterministic rebuildのskill applicability投影blockを削除するとslow projection-writer 1 failed／41 skippedで個別killした。依存解決前に起きたimport failureは証拠へ採用しない。復元不要の隔離copyであり、canonical worktree baselineはasset-catalog 2 passed、slow U-SKAPP-005 1 passed。"
complexity_effect: net_negative
complexity_justification: "production実装を増やさず、既存U-SKAPP-005へ欠落oracleだけを追加して過大claimを除去する"
removal_trigger: "なし。registry bindingとdeterministic rebuild exact setは恒久回帰oracleである。"
parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md
pair_artifact: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md, oracle_id: U-SKAPP-005, test_path: tests/asset-catalog.test.ts }
  - { parent_design: docs/design/helix/L5-detail/development-model-runtime-routing.md, oracle_id: U-SKAPP-005, test_path: tests/slow/projection-writer.test.ts }
dependencies:
  parent: docs/plans/PLAN-L7-702-skill-applicability-db-projection.md
  requires:
    - docs/plans/PLAN-L7-702-skill-applicability-db-projection.md
  blocks: []
  references:
    - "issue:1220"
    - "issue:248"
    - "pr:1213"
agent_slots:
  - { role: aim, slot_label: "AIM — post-merge findingとForward再合流範囲" }
  - { role: qa, slot_label: "QA — registry binding／rebuild exact set mutation oracle" }
  - { role: se, slot_label: "SE — deterministic rebuild正本経路" }
  - { role: tl, slot_label: "TL — post-merge RecoveryとForward再合流" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-71-skill-applicability-oracle-closure.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/test-design/helix/L8-development-model-runtime-routing-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/asset-catalog.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/projection-writer.test.ts, artifact_type: test_code }
---

# skill applicability post-merge oracle Recovery

PR #1213のproduction実装はmainへ着地したが、その後に完了したOpus exact-HEAD reviewが、PLAN-L7-702の
registry binding再現性とcatalog／deterministic rebuild同一行集合に対するoracle不足を検出した。本PLANは
履歴を改変せず、既存U-SKAPP-005の検証を実体へ追従させてForwardへ再合流する。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | registry version／digestをcatalog rowで実値照合 | [並列] | M2／M3 kill |
| 2 | deterministic rebuild用typed skill fixtureとexact row oracleを追加 | [並列] | M5 kill |
| 3 | L8 test designへ両経路とmutation責務を還流 | [直列] | U-SKAPP-005 claimとtestが一致 |
| 4 | targeted、mutation、typecheck、PLAN lint、全回帰 | [直列] | 全green |
| 5 | Claude Opus exact-HEAD review、merge、main read-after | [review] | blocker 0、DB convergence |
