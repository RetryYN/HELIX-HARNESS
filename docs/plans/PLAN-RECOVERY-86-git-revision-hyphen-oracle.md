---
plan_id: PLAN-RECOVERY-86-git-revision-hyphen-oracle
title: "PLAN-RECOVERY-86: Git revision leading-hyphen oracle"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / QA
github_issue_id: 1450
behavior_contract_id: GIT-ARGUMENT-BOUNDARY-001
responsibility_owner: git-argument-boundary
engineering_discipline_required: true
change_slice: atomic
refactor_step: parity
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: not_applicable
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  # current routerのlegacy input-only token。#1449 canonical化後はtyped finding dispositionへ移行する。
  - "po_directive:Issue #1450 leading-hyphen拒否のmutationが既存oracleを生存した"
contract_preconditions: "requireSafeGitRevisionRangeが先頭hyphenを副作用前に拒否する"
contract_postconditions: "長短option形revisionとremoteのnegative oracleがguard削除mutationを検出する"
contract_invariants: "正常な単一revision、二点range、remote identityの受理を維持する"
contract_failures: "-foo、-p、-upload-pack=idを安全なGit引数として受理する退行を拒否する"
tdd_red_required: true
red_test: "PR #1447 exact HEAD 245953312で先頭hyphen guardを無効化しても既存20 testsがgreenとなるmutation生存を実測"
red_at: "2026-09-02T04:27:00Z"
green_at: "2026-09-02T14:25:58+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "src/runtime/git-argument-boundary.tsのvalue.startsWith('-')を除去すると-foo/-pの2 caseがred（21 passed / 2 failed、exit 1）。guard復元後はtests/git-argument-boundary.test.tsが23 passed、exit 0。"
complexity_effect: net_negative
complexity_justification: "production guardは変更せず、単一防壁の未被覆分岐を既存table oracleへ追加する"
removal_trigger: "なし。GIT-ARGUMENT-BOUNDARY-001の恒久回帰oracle"
backprop_decision: not_required
backprop_decision_reason: "既存L6/L8契約に明記済みのoption形拒否を検証へ接着するRecoveryであり、新要求意味を追加しない"
parent_design: docs/design/helix/L6-function-design/git-argument-boundary.md
pair_artifact: docs/test-design/helix/L8-git-argument-boundary-unit-test-design.md
dependencies:
  parent: docs/plans/PLAN-RECOVERY-85-git-argument-boundary.md
  requires:
    - docs/plans/PLAN-RECOVERY-85-git-argument-boundary.md
  references:
    - "issue:1429"
    - "issue:1450"
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-86-git-revision-hyphen-oracle.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: tests/git-argument-boundary.test.ts, artifact_type: test_code }
agent_slots:
  - { role: aim, slot_label: "AIM — Recovery findingと既存要求契約の接着確認" }
  - { role: qa, slot_label: "QA — leading-hyphen mutation oracle" }
  - { role: tl, slot_label: "TL — Recovery scopeと既存契約接着" }
review_evidence: []
---

# Git revision leading-hyphen oracle

既存production guardの意味を変えず、optionとして再解釈される先頭hyphen入力を独立negative caseで固定する。
