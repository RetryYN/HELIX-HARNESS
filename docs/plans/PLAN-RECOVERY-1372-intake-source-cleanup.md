---
plan_id: PLAN-RECOVERY-1372-intake-source-cleanup
title: "取り込み済み要求指示書の削除記録と台帳状態を整合する"
kind: recovery
layer: cross
drive: agent
status: confirmed
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
  - { artifact_path: .helix/evidence/review-1598/biome.log, artifact_type: other }
  - { artifact_path: .helix/evidence/review-1598/tsc.log, artifact_type: other }
modifies:
  - { artifact_path: docs/governance/candidates/design-grounding-human-convergence-intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/requirement-formation-scoped-admission-intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/candidates/world-governance-intake.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
review_evidence:
  - reviewer: "Claude Code / Fable 5.1"
    review_kind: cross_agent
    reviewed_at: "2026-09-06T12:22:53Z"
    tests_green_at: "2026-09-06T12:21:19Z"
    verdict: approve
    worker_model: codex
    reviewer_model: claude:claude-fable-5-1
    reviewer_session_id: 9867601a-a3ad-4369-980c-11757d63a7de
    reviewed_head_sha: 43f8b0d97c09cd776a720ff163a6d450934c1423
    scope: "独立PLANレビュー。実測と帰属は https://github.com/RetryYN/HELIX-HARNESS/pull/1598#issuecomment-5559187603 。保存ログのbytesを照合した。全doctorはexit 1でgreen扱いしない。後続修正HEADの最終PR receiptを代替しない。"
    green_commands:
      - kind: typecheck
        command: "npx tsc --noEmit -p ."
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-06T12:21:15Z"
        evidence_path: .helix/evidence/review-1598/tsc.log
        output_digest: "sha256:31459e49ca66b58895c7db3c2845a8602a56998f49292b045860ebcd886839f9"
      - kind: lint
        command: "npx biome check tests/request-source-retention.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-09-06T12:21:19Z"
        evidence_path: .helix/evidence/review-1598/biome.log
        output_digest: "sha256:a9f5b2a97501cfed1b646d90a23ef96ae3348fe89055fb93b94c7f663926a4d3"
---

# 取込み済み原稿の局所整理

要求指示書5件の保存・要件/受入への対応を確認し、明示依頼どおりローカル原稿を削除した。
本PLANは取込台帳の観測状態と削除検証記録だけを更新する。候補要求の意味・承認・実装状態を変更しない。
前提はmain保全本文との全文一致、受入は指定5件の不存在・原文保持・参照更新・他者成果非干渉である。
新しい削除engineやCensus runtimeを追加せず、#1372全体完了とも数えない。
文書変更のため検証は全文比較、参照検索、PLAN governance、diff検査と独立レビューを用いる。
