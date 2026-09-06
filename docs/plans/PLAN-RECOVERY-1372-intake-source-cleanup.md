---
plan_id: PLAN-RECOVERY-1372-intake-source-cleanup
title: "取り込み済み要求指示書の削除記録と台帳状態を整合する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
github_issue_id: 1372
behavior_contract_id: DOCUMENT-INTAKE-CLEANUP-001
responsibility_owner: document-intake-cleanup
entry_signals: [regression_dev]
agent_slots:
  - { role: aim, slot_label: "AIM — 要求保持と廃棄範囲を照合" }
  - { role: tl, slot_label: "TL — 原文保全と削除対象を照合" }
  - { role: qa, slot_label: "QA — hash・参照・残存原稿を検査" }
parent_design: docs/governance/repository-structure.md
pair_artifact: docs/governance/request-source-cleanup-2026-09-06.md
verification_bindings:
  - { parent_design: docs/governance/repository-structure.md, oracle_id: U-RSC-001, test_path: tests/request-source-retention.test.ts }
  - { parent_design: docs/governance/repository-structure.md, oracle_id: U-RSC-002, test_path: tests/request-source-retention.test.ts }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1372", "issue:1556", "issue:1558", "issue:1500"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1372-intake-source-cleanup.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/request-source-cleanup-2026-09-06.md, artifact_type: markdown_doc }
  - { artifact_path: tests/request-source-retention.test.ts, artifact_type: test_code }
modifies:
  - { artifact_path: docs/governance/candidates/design-grounding-human-convergence-intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/requirement-formation-scoped-admission-intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/world-governance-intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence: []
---

# 取込み済み原稿の局所整理

要求指示書5件の保存・要件/受入への対応を確認し、明示依頼どおりローカル原稿を削除した。
本PLANは取込台帳の観測状態と削除検証記録だけを更新する。候補要求の意味・承認・実装状態を変更しない。
前提はmain保全本文との全文一致、受入は指定5件の不存在・原文保持・参照更新・他者成果非干渉である。
新しい削除engineやCensus runtimeを追加せず、#1372全体完了とも数えない。
文書変更のため検証は全文比較、参照検索、PLAN governance、diff検査と独立レビューを用いる。
