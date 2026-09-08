---
plan_id: PLAN-RECOVERY-1677-review-session-model-receipt-drift
title: "PLAN-RECOVERY-1677: typed receiptにsession model historyを追従する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-09
updated: 2026-09-09
github_issue_id: 1677
behavior_contract_id: REVIEW-SESSION-MODEL-RECEIPT-DRIFT-001
responsibility_owner: review-evidence
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: retained
no_code_decision: configure
ddd_modeling_decision: policy
contract_preconditions: "PR #1675の型付きreceiptは同一Claude sessionのOpus 5を記録するが、historyはFable 5.1のopen windowを保持し、PLAN terminal化に解がない"
contract_postconditions: "receiptのreviewed_atを境界に旧windowを閉じ、新model windowを開始し、history検査とreceipt bindingが同じ主体を受理する"
contract_invariants: "過去windowを書き換えず、切替時刻をreceipt以前へ推定せず、historyを実効provider attestationとして扱わず、既存fail-closeを維持する"
contract_failures: "window重複、時刻gapの推測補完、PLAN側model偽装、history無効化、providerだけの粗い一致を拒否する"
tdd_red_required: true
red_test: "U-RVIDENT-020で新Opus windowのsinceをreceipt境界より1秒遅らせると、境界時刻のmodel解決がnullとなり1 failedを実測した"
red_at: "2026-09-08T17:03:23Z"
green_at: "2026-09-08T17:03:57Z"
mutation_oracle_required: true
mutation_oracle: "tests/review-evidence.test.ts::U-RVIDENT-020がreceipt境界のgap、旧open window残置による重複、境界一致の旧model残留を拒否する"
mutation_oracle_evidence: "tests/review-evidence.test.ts::U-RVIDENT-020。2026-09-08T17:03:23Zに新Opus windowのsinceを16:45:59Zから16:46:00Zへ変異し、境界時刻がnullとなって1 failed。変異を復元し、同日17:03:57Zに1 passed。全review-evidence testでも再検証する。"
complexity_effect: net_neutral
complexity_justification: "新しい判定器を増やさず、既存history projectionとreceipt間の矛盾を除去する"
removal_trigger: "model変更時にsessionを再発行し、同一sessionの複数model windowが不要になった時"
backprop_decision: not_required
backprop_decision_reason: "独立review主体の意味・受入・権限を変えず、観測済みmodel windowだけを追従するRecoveryである"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md
pair_artifact: docs/test-design/helix/L8-review-evidence-reviewer-session-model-history-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-RVIDENT-020, test_path: tests/review-evidence.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1677", "issue:1603", "issue:923", "issue:1543", "pr:1675"]
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1677-review-session-model-receipt-drift.md, artifact_type: markdown_doc }
  - { artifact_path: tests/review-evidence.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/governance/reviewer-session-model-history.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-review-evidence-reviewer-session-model-history-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: tl, slot_label: "TL — receiptとhistoryの同一主体境界を照合" }
  - { role: qa, slot_label: "QA — window重複・境界時刻・real repo evidenceを検証" }
  - { role: aim, slot_label: "AIM — attestation僭称と過去履歴改変がないことを監査" }
review_evidence: []
---

# typed receiptへのhistory追従

PR #1675の正式receiptが初めて観測した`claude-opus-5`時刻を、新windowの開始境界とする。
旧Fable windowは同時刻で閉じ、観測以前の実切替時刻を推定しない。

## 工程表

1. R0: receipt、PLAN binding、current historyの三者矛盾を再現した。
2. R1/R2: 既存U-RVIDENT-010がOpus転記をhistory mismatchとして拒否することを確認した。
3. R3: 型付きreceipt時刻でwindowを一方向追従し、既存parser・重複拒否・provider照合を再利用する。
4. R4: review evidence、PLAN lint、全CI、独立review後にPR #1675のterminal化を再試行する。

## 完了境界

本sliceはhistory projectionの追従だけを所有する。Claude model変更時のsession再発行、PR #1675のBun移行、
過去全receiptの再監査を完了扱いにしない。
