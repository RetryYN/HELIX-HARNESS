---
plan_id: PLAN-RECOVERY-1677-review-session-model-receipt-drift
title: "PLAN-RECOVERY-1677: typed receiptにsession model historyを追従する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: true
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
contract_postconditions: "session transcriptの実観測境界で旧windowを閉じ、新model windowを開始し、同区間の構造化review_evidenceと同じmodelを鏡像する本文だけを訂正してhistory検査とreceipt bindingが同じ主体を受理する"
contract_invariants: "receipt公開時刻で先行する実観測を上書きせず、historyを実効provider attestationとして扱わず、既存fail-closeを維持する"
contract_failures: "window重複、時刻gapの推測補完、PLAN側model偽装、history無効化、providerだけの粗い一致を拒否する"
tdd_red_required: true
red_test: "U-RVIDENT-020で新Opus windowのsinceを実観測境界より1秒遅らせると、境界時刻のmodel解決がnullとなり1 failedを実測した"
red_at: "2026-09-08T17:26:14Z"
green_at: "2026-09-08T17:27:58Z"
mutation_oracle_required: true
mutation_oracle: "tests/review-evidence.test.ts のU-RVIDENT-020へ実観測境界を1秒遅らせるseeded mutationを投入し、境界時刻のmodel解決がnullとなる1 failedでkillした。tests/branch-kind.test.ts のU-RVIDENT-021は無関係な本文変更をowner候補へ戻す"
mutation_oracle_evidence: "tests/review-evidence.test.ts::U-RVIDENT-020。2026-09-08T17:26:14Zに新Opus windowのsinceを18:03:40Zから18:03:41Zへ変異し、境界時刻がnullとなって1 failed。復元後17:27:58Zに95 tests greenを再検証した。"
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
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, oracle_id: U-RVIDENT-021, test_path: tests/branch-kind.test.ts }
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
modifies:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1633-ci-non-pr-base-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L3-1639-bugbot-generation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-1649-three-lane-ir-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-1652-commitlint-pre-push.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/reviewer-session-model-history.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-review-evidence-reviewer-session-model-history-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/lint/branch-kind.ts, artifact_type: source_module }
  - { artifact_path: src/adapters/github-workflow-identity-admission.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: tests/review-evidence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
agent_slots:
  - { role: tl, slot_label: "TL — receiptとhistoryの同一主体境界を照合" }
  - { role: qa, slot_label: "QA — window重複・境界時刻・real repo evidenceを検証" }
  - { role: aim, slot_label: "AIM — attestation僭称と過去履歴改変がないことを監査" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-09-08T19:34:00Z"
    tests_green_at: "2026-09-08T19:23:39Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewer_session_id: "20813c5a-21cd-4497-9cd1-b58cf81f2000"
    reviewed_head_sha: 966f75ca6493f93e86872070cb93a2e9ae497306
    scope: "PR #1678 exact HEADをClaude Code Opusがread-only独立reviewし、session transcriptの5 model window、訂正4 PLANのreviewed_at、27件のsession evidence、例外判定14反例、reviewed-safe pin、targeted 126 tests、CI run 34266275486の12/12 successを実測した。blocker 0でapprove。canonical receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/1678#issuecomment-5590738623"
    green_commands:
      - kind: smoke
        command: "gh run view 34266275486 --repo RetryYN/HELIX-HARNESS --json status,conclusion,headSha,databaseId,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-09-08T19:23:39Z"
        evidence_path: .github/workflows/harness-check.yml
        output_digest: "sha256:3c0866bd9176475816e11dabb767f4d57af260f9d885ce89c7d3e67cf272f364"
        result: "completed / success / HEAD 966f75ca6493f93e86872070cb93a2e9ae497306 / run 34266275486"
---

# typed receiptへのhistory追従

同session transcriptが最初に観測した`claude-opus-5`時刻を、新windowの開始境界とする。
旧Fable windowは同時刻で閉じ、後続receiptの公開時刻で先行する実観測を覆わない。

## 工程表

1. R0: receipt、PLAN binding、current historyの三者矛盾を再現した。
2. R1/R2: 既存U-RVIDENT-010がOpus転記をhistory mismatchとして拒否することを確認した。
3. R3: transcriptの実観測時刻でwindowを一方向追従し、同区間の4件の誤帰属を訂正する。
4. R4: review evidence、PLAN lint、全CI、独立review後にPR #1675のterminal化を再試行する。

## 完了境界

本sliceはhistory projectionの追従だけを所有する。Claude model変更時のsession再発行、PR #1675のBun移行、
境界区間外の過去receipt再監査を完了扱いにしない。
