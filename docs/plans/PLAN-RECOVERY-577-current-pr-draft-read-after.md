---
plan_id: PLAN-RECOVERY-577-current-pr-draft-read-after
title: "PLAN-RECOVERY-577: rerun admissionのcurrent PR draft read-after束縛"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-10
updated: 2026-09-10
github_issue_id: 577
behavior_contract_id: GITHUB-CROSS-REVIEW-ADMISSION-001
responsibility_owner: github-cross-review-admission
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "既存Draft defer契約のworkflow入力を古いevent payloadからcurrent GitHub PR read-afterへ修復し、要求意味・merge権限・Ready admission条件を変更しない。"
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "pull_request workflowがGitHub Pulls APIでcurrent PR snapshotをreadでき、pure admission engineはis_draftを入力として受け取る"
contract_postconditions: "failed-jobs rerunでもcurrent PRがDraftならreview admissionをdeferし、Readyなら既存exact-HEAD receipt条件を維持する"
contract_invariants: "event payloadのdraftをcurrent authorityにしない。repository、PR number、HEAD、base、draftが観測中に変化した場合はfail-closeする。意味のないcommitをbootstrap条件にしない"
contract_failures: "Pulls API失敗、snapshot field欠落、read-after drift、Ready receipt不成立は非0で停止する"
tdd_red_required: true
red_test: "workflow adapterをevent payloadのPR_DRAFTへ戻すmutationでU-GCRA-WF-003がRed"
red_at: "2026-09-10T06:15:53Z"
green_at: "2026-09-10T06:16:15Z"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/harness-check-workflow.test.ts::U-GCRA-WF-003でis_draftをreadAfter.draftからprocess.env.PR_DRAFTへ戻すmutationを実測し、1 failed／exit 1。正規実装へ復元後は対象test green。"
complexity_effect: net_negative
complexity_justification: "既存workflow adapterとpure admission engineを再利用し、event payload依存と意味のないbootstrap commitを除去する。新workflow、DB、serviceは追加しない"
removal_trigger: "GitHub Actions rerunがcurrent PR stateを保証したimmutable event generationを提供し、同じread-after反例を満たす場合"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md
pair_artifact: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L5-detail/github-cross-review-admission.md, oracle_id: U-GCRA-WF-003, test_path: tests/harness-check-workflow.test.ts }
dependencies:
  requires: []
  references:
    - issue:577
    - issue:1638
    - docs/plans/PLAN-RECOVERY-40-github-cross-review-admission.md
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-577-current-pr-draft-read-after.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: docs/design/helix/L5-detail/github-cross-review-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/test-design/helix/L8-github-cross-review-admission-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
agent_slots:
  - { role: se, slot_label: "Codex — current PR snapshot adapter修復" }
  - { role: qa, slot_label: "QA — stale event payload／read-after drift反例" }
  - { role: tl, slot_label: "TL — #577/#1638境界とmerge条件不変の収束" }
review_evidence: []
---

# rerun admissionのcurrent PR draft read-after束縛

PR #1625のrun `34399004476` attempt 3では、PRをDraftへ戻した後もfailed-jobs rerunが元event payloadの
`draft=false`を再利用し、review admission循環を解消できなかった。workflow adapterがcurrent Pulls API
snapshotを入力正本にし、取得後のread-afterまで同一である場合だけpure evaluatorへ渡す。

## このslice

1. `github.event.pull_request.draft`をreview admission入力から除外する。
2. current PR snapshotのHEADとdraftからruns／DB取得条件を作る。
3. admission直前にPulls APIを再読し、repository／number／HEAD／base／draft driftを拒否する。
4. Readyのcanonical receipt、CI、DB、exact-HEAD条件は変更しない。

## 完了証拠

- targeted workflow oracle、PLAN lint、typecheck、required CIを同一HEADで通す。
- 独立reviewerがevent payloadへの退行、Draft無条件許可、Ready gate緩和がないことを検収する。
- 実consumerでDraft化後のrerunまたは同等のsame-HEAD bootstrapを実証し、Ready復帰後は従来のadmissionを通す。
