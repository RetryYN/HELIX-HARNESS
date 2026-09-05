---
plan_id: PLAN-RECOVERY-1562-durable-loop-completion
title: "PLAN-RECOVERY-1562: stale writerによる完了記録阻害の是正"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-06
updated: 2026-09-06
owner: Codex
github_issue_id: 1562
behavior_contract_id: DURABLE-LOOP-COMPLETION-001
responsibility_owner: durable-loop-epoch
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — 既存の副作用安全性と修正範囲を照合" }
  - { role: tl, slot_label: "TL — snapshotとclaimの責務境界を検収" }
  - { role: se, slot_label: "SE — 既知staleの早期拒否を実装" }
  - { role: qa, slot_label: "QA — 実2process反例とCAS退行を検証" }
parent_design: docs/design/harness/L6-function-design/durability-boundaries.md
pair_artifact: docs/test-design/harness/L8-durability-boundaries.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/durability-boundaries.md, oracle_id: U-DUR-007, test_path: tests/loop-store-durability.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/durability-boundaries.md, oracle_id: IT-DUR-008, test_path: tests/durable-loop-process.test.ts }
backprop_decision: not_required
backprop_decision_reason: "既存snapshot preconditionと取得後CASを維持する。全競合下の進行保証は追加せず、既知staleの早期拒否をL6/L8へ追記する。非stale contenderによるclaim_conflictと副作用実行済み・完了未記録の残余は#1562で追跡し、本PRで親Issueを閉じない。"
dependencies:
  parent: docs/plans/PLAN-L7-449-durability-boundary-implementation.md
  requires: []
  references: ["issue:1562", "issue:93"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1562-durable-loop-completion.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: src/orchestration/durable-loop-epoch.ts, artifact_type: source_module }
  - { artifact_path: tests/durable-loop-process.test.ts, artifact_type: test_code }
  - { artifact_path: tests/fixtures/durable-loop-process-child.ts, artifact_type: test_code }
  - { artifact_path: tests/loop-store-durability.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/harness/L6-function-design/durability-boundaries.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-durability-boundaries.md, artifact_type: test_design }
---

# 完了記録の競合是正

## 範囲と工程

#1561のCI失敗から独立させる。元CIのstderrが欠落しているため同一根因とは断定しない。
既知staleをclaim取得前に拒否し、取得後CAS、曖昧状態の拒否、副作用再実行防止を維持する。
全スケジュールの進行保証や旧loop authorityの再活性化は非対象。

1. 実2process反例を追加しREDを確認する。
2. 早期拒否と取得後CASの反例を検証する。
3. mutation、型検査、整形、PLAN lint、DB投影を確認する。
4. 独立レビュー、exact-HEAD CI、main read-afterで収束する。

## 実測

2026-09-06 01:54:55 JST、実2process反例が旧runtimeでclaim_conflictによりRED。
01:56:23 JST、修正候補のdurability関連4ファイル41テストが成功。
これは独立レビュー証拠ではない。Windows実runner、全CI、main統合は未検収。
事前照合後の競合可能性は残るため、全競合の解消と主張しない。

02:00:36 JST、早期拒否を無効化したmutationは実2process反例でRED。
02:00:49 JST、取得後CASを無効化したmutationはsnapshot変更反例でRED。
両mutationは検証後に復元した。独立レビューや全CIの代用にはしない。
