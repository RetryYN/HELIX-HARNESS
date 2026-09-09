---
plan_id: PLAN-RECOVERY-1293-cursor-image-git
title: "Cursor環境のclone前Git欠如を修復"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-09
updated: 2026-09-09
github_issue_id: 1293
behavior_contract_id: TER-CURSOR-CLOUD-ENV-001
responsibility_owner: provider-environment-admission
engineering_discipline_required: true
no_code_decision: add_code
ddd_modeling_decision: value_object
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
contract_preconditions: "repo-owned Dockerfileを選択したDraft Buildでclone前のgit欠如が再現済み"
contract_postconditions: "image内のGitでcloneでき、既存install検証列へ到達する"
contract_invariants: "Node manifest、独立レビュー、installのhost変更禁止を維持する"
contract_failures: "Git欠如、clone失敗、install未完走を成功と扱わない"
tdd_red_required: true
red_at: "2026-09-09T23:48:25+09:00"
green_at: "2026-09-09T23:48:40+09:00"
complexity_effect: justified_positive
complexity_justification: "clone前提をimage所有へ戻し、install時の循環とprovider側再試行を解消する"
removal_trigger: "同等のcheckout前提を提供する検証済みbase imageへ移管した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md
pair_artifact: docs/test-design/helix/L8-cursor-cloud-environment-admission-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: [docs/plans/PLAN-RECOVERY-76-cursor-cloud-environment-admission.md]
  references: ["issue:1293", "issue:1356"]
  blocks: []
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md, oracle_id: U-CURSOR-ENV-005, test_path: tests/cursor-cloud-environment.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1293-cursor-image-git.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: .cursor/Dockerfile, artifact_type: config }
  - { artifact_path: tests/cursor-cloud-environment.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L6-function-design/cursor-cloud-environment-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-cursor-cloud-environment-admission-unit-test-design.md, artifact_type: test_design }
agent_slots:
  - { role: aim, slot_label: "AIM — imageとhostの変更境界を検証" }
  - { role: se, slot_label: "SE — clone前提の修復" }
  - { role: qa, slot_label: "QA — 静的反例と実Build検収" }
review_evidence: []
---

# Cursor環境のclone前提修復

## 実測と範囲

基準mainは`f2695861e22812444e7b22d4fc74ff5c69e00546`。
Draft Build `bld-20260909-52658bbb-ee0f-4819-8088-cef2f143ab9e`はDocker build exit 0後、
gitCheckoutで`git: command not found`となった。Issue #1293 comment 5603812979に記録した。
過去Recurring全件の同根性は未証明。初回失敗は再投入しない。

## 検証と残義務

新規oracleのみRed（他4件Green）を確認し、修復後5件Green、bash構文・diff検査成功。
これは静的契約の証拠であり実image成功ではない。ローカルDockerはWSL連携未設定で実行不能。
修復branchのDraft Buildを1件ずつ追跡し、clone・installの完走とimage/package identityを確認する。
未観測の費用は未測定とし、失敗時は同一入力の無制限再試行を行わない。
独立レビュー、fresh CI、merge/read-after、active採用の適否確認は未完了。
