---
plan_id: PLAN-RECOVERY-1716-l3-approval-provenance-baseline
title: "L3承認gateのPR基準HEAD比較境界を修復する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-10
updated: 2026-09-10
owner: Codex / TL
github_issue_id: 1716
behavior_contract_id: L3-APPROVAL-PROVENANCE-BASELINE-001
responsibility_owner: l3-human-approval-gate
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "repo-wide guardが完全履歴を持つPR checkoutで実行され、PR baseの完全なcommit SHAがstep環境へ明示される"
contract_postconditions: "最終PLAN本文がPR baseと同じbytesの既存L3 PLANはbase時点のGit provenanceで評価され、枝上の一時変更による承認要求を発生させない。最終bytesが変わるPLANは現在枝のprovenanceで従来どおり承認境界へ送る"
contract_invariants: "L3 PLANの意味変更・status変更・approval変更にはtyped human approvalを要求し、base SHAの欠落・不正・解決不能を推測で補完せず、既存fail-closeを維持する"
contract_failures: "base SHA不正、base側path欠落、PLAN bytes差分、Git履歴欠落、日付不整合は境界を緩めず、現在provenanceまたは既存のfail-close理由へ収束する"
tdd_red_required: true
red_test: "U-L3APP-015のbase provenance比較を無効化した変異で、枝上の一時変更を含む最終同一PLANがmissing_human_po_approvalとなることを実測する"
red_at: "2026-09-10T20:10:21+09:00"
green_at: "2026-09-10T20:10:57+09:00"
mutation_oracle_required: true
mutation_oracle: "U-L3APP-015のbase比較をcurrent historyへ戻す変異を投入し、既存L3 PLANへmissing_human_po_approvalを出すことでkillする"
mutation_oracle_evidence: "2026-09-10T20:10:21+09:00にloadReviewPlansのbasePlans振り分けを空集合へ変異し、tests/review-evidence.test.ts U-L3APP-015が1 failedとなった。復元後に同testを再実行して63 tests greenを確認する。"
complexity_effect: net_neutral
complexity_justification: "承認authorityや別のbypassを追加せず、既存Git provenance loaderへPR baseの評価境界を追加する"
removal_trigger: "PR枝の一時履歴を含まないimmutable provenance serviceへ移行し、repo-wide guardが同じbase-aware判定を別経路で再現できるようになった時"
backprop_decision: not_required
backprop_decision_reason: "既存L3 human approvalの意味・適用対象・承認者を変更せず、後続consumer移行で生じるbranch-transient historyだけを分離する"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md
pair_artifact: docs/test-design/helix/L8-l3-human-approval-gate-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/l3-human-approval-gate.md, oracle_id: U-L3APP-015, test_path: tests/review-evidence.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  parent: null
  requires: []
  references: ["issue:1716", "issue:1097", "issue:1102", "issue:1437", "pr:1715"]
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1716-l3-approval-provenance-baseline.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/helix/L6-function-design/l3-human-approval-gate.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-l3-human-approval-gate-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/review-evidence.ts, artifact_type: source_module }
  - { artifact_path: tests/review-evidence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/repo-wide-guard-registry.test.ts, artifact_type: test_code }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: aim, slot_label: "AIM — L3承認と後続consumer移行の適用境界を監査" }
  - { role: se, slot_label: "SE — base-aware Git provenanceを実装" }
  - { role: qa, slot_label: "QA — transient history・bytes差分・base不正を反例検証" }
  - { role: tl, slot_label: "TL — 包括bypassになっていないことを検収" }
review_evidence: []
---

# L3承認gateのPR基準HEAD比較境界

## 目的

Issue #1716で確認した、既存L3 PLANを枝上で一時変更して元のbytesへ戻した場合に、Git履歴だけを
見て新規のPO承認を要求する誤検知を修復する。対象は既存PLANの後続consumer移行であり、新しい
L3要件のterminal化や意味変更を承認不要にするものではない。

## 受入境界

- PR baseは完全なcommit SHAだけを受け付け、欠落・不正・解決不能は推測しない。
- 最終PLAN本文のbytesがbaseの同じpathと一致する場合だけ、base時点のprovenanceを採用する。
- PLAN本文、status、approval、要求意味がbaseと異なる場合は、現在枝のprovenanceと既存L3承認gateを使う。
- base側pathが存在しない新規PLANはbase比較の対象外とし、現在枝のprovenanceで判定する。
- 旧L3 approval gateの反例と、#1715型の後続移行反例を同じテスト集合で保持する。

## 非対象

artifact owner・後続PLAN・独立reviewの自動認定、L3 approvalの包括免除、生成物の自動書換え、
既存PLANのstatus／approvalの改変、物理削除は本sliceに含めない。

## 完了条件

実装変更、U-L3APP-015のgreen、repo-wide guardへのPR base SHA配線、独立review、current mainへの
read-afterをすべて別々に確認する。CI greenだけを完了根拠にしない。
