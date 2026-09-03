---
plan_id: PLAN-RECOVERY-98-schedule-ci-range-normalization
title: "PLAN-RECOVERY-98: schedule CI revision range正規化"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-03
updated: 2026-09-03
owner: Codex / TL
github_issue_id: 1481
behavior_contract_id: SCHEDULE-CI-RANGE-001
responsibility_owner: impact-ci-recovery
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "pull_request／pushではrevision rangeを導出できるが、schedule／workflow_dispatchのgithub.event.beforeは空になり、branch-kind／commitlintがunsafe_git_revision_rangeで停止する"
contract_postconditions: "非PR eventのbefore SHAが空またはzero SHAならcandidate HEADの親をbaseとして、branch-kind／commitlint／Impact CIが同じ有限revision rangeを使う"
contract_invariants: "PRではmerge-base、通常pushではevent before、初回push・schedule・workflow_dispatchではHEAD親を使い、空range、untrusted revision、test skip、commitlint bypassを許可しない"
contract_failures: "空before SHA、zero SHA、wrong candidate HEAD、branch-kindとcommitlintのrange乖離、unsafe revisionを黙ってsuccessへ変換しない"
tdd_red_required: true
red_test: "U-IMPACTCI-WF-006がbranch-kind／commitlintの空before SHA正規化欠落を検出し、現行main workflowでredになることを実測する"
red_at: "2026-09-03T09:12:34Z"
green_at: "2026-09-03T09:13:46Z"
mutation_oracle_required: true
mutation_oracle_evidence: "2026-09-03T09:12:34Zにtests/harness-check-workflow.test.tsのU-IMPACTCI-WF-006を現行main workflowへ追加し、branch-kind／commitlintの両方がnon_pr_range_invalidとなってtargeted vitestがexit 1になるRedを実測した。空before SHAをHEAD親へ正規化後、2026-09-03T09:13:46Zに同じtargeted testがexit 0となった。さらにbranch-kindまたはcommitlintからempty判定だけを個別に除去する2 mutationを同oracleが各non_pr_range_invalidとしてkillする。"
complexity_effect: net_negative
complexity_justification: "3箇所に散在する非PR revision range導出を同じ明示規則へ収束し、schedule固有の暗黙入力差を除去する"
removal_trigger: "GitHub event snapshotからtyped revision rangeを返す単一adapterへ全consumerが移行し、workflow内shell導出が0になった時"
backprop_decision: not_required
backprop_decision_reason: "既存CI admissionのschedule入力Recoveryであり、新しい要求意味・ユーザー価値を追加しない"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-WF-006, test_path: tests/harness-check-workflow.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-98-schedule-ci-range-normalization.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
modifies:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L6-function-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: aim, slot_label: "AIM — schedule event入力と既存range authorityの差分監査" }
  - { role: se, slot_label: "SE — branch-kind／commitlint revision range正規化" }
  - { role: qa, slot_label: "QA — empty／zero before SHA mutation検証" }
  - { role: tl, slot_label: "TL — #1336／#1475との責務境界" }
dependencies:
  parent: docs/plans/PLAN-L6-92-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L6-92-impact-ci-recovery.md
  references:
    - "issue:1481"
    - "issue:1336"
    - "issue:1475"
  blocks: []
review_evidence: []
---

# PLAN-RECOVERY-98: schedule CI revision range正規化

## 目的

scheduled `harness-check` run 33731672138で実測した、空の`github.event.before`から
`..HEAD`を生成してcommitlintが`unsafe_git_revision_range`で停止する欠陥を回復する。
branch-kind、commitlint、Impact CIが非PR eventで同じrevision range authorityを使うようにする。

## 非対象

- event classごとのconcurrency generation分離（#1336）
- finalize shard fail-close oracle（#1475）
- commit message規約やbranch kind規約の変更

## 完了条件

- [ ] U-IMPACTCI-WF-006のRed→Greenとbranch-kind／commitlint個別mutation killを確認する。
- [ ] typecheck、targeted test、PLAN lint、全回帰、doctor、Claude exact-HEAD reviewがgreenになる。
- [ ] scheduleまたはworkflow_dispatchの実runでpreflight／aggregate successをread-after確認する。
