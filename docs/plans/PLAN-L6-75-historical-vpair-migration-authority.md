---
plan_id: PLAN-L6-75-historical-vpair-migration-authority
title: "PLAN-L6-75 (add-design): historical Vペア migration authority"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-12 historical bindings debtをauthority非推測で分類する"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-73のauthority非推測境界をhistorical migration分類へ具体化する。要求意味とclosure権限は変更しない。"
pair_artifact: docs/test-design/harness/historical-vpair-migration-authority.md
agent_slots:
  - { role: se, slot_label: "SE - Git provenance、baseline authority、dynamic census設計" }
  - { role: qa, slot_label: "QA - cutoff spoof、保存則、promotion禁止の敵対検証" }
generates:
  - { artifact_path: docs/design/harness/L6-function-design/historical-vpair-migration-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/historical-vpair-migration-authority.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L6-73-closure-authority-backfill.md
  requires: [docs/plans/PLAN-L6-73-closure-authority-backfill.md]
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-12T05:23:26Z"
    reviewed_at: "2026-07-12T05:24:00Z"
    verdict: approve_after_fixes
    scope: "cutoff境界、timestamp spoof、pinned commit/tree/blob、immutable baseline provenance、admission保存則、promotion禁止を敵対監査した。初回B0/H2/M2/L1、再review B0/H1/M0/L0を是正し、最終B0/H0/M0/L0。"
    green_commands:
      - { kind: unit_test, command: "bunx vitest run tests/design-coverage.test.ts tests/design-language.test.ts tests/l6-completion.test.ts tests/plan-entry-routing.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T05:23:26Z", evidence_path: docs/test-design/harness/historical-vpair-migration-authority.md, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
      - { kind: lint, command: "bun run src/cli.ts plan lint docs/plans/PLAN-L6-75-historical-vpair-migration-authority.md", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-12T05:23:26Z", evidence_path: docs/plans/PLAN-L6-75-historical-vpair-migration-authority.md, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
---

# PLAN-L6-75: historical Vペア migration authority

## 1. 目的

cutoff treeに存在するbindings欠落とcutoff後の違反を、Git provenanceとbaseline pinで安全に分類する。
後続実装は`PLAN-L7-437-historical-vpair-migration-authority`を想定する。

## 2. 完了条件

- cutoff SSoT、tree存在ベースのprimary境界、pinned commit/tree、immutable baseline authority、dynamic census、overlap tag、append-only reviewをL6でfreezeする。
- `U-HVMA-001..010`とintegration/system verificationを一対一で定義する。
- confirmed designやbaselineからbinding/gate/capabilityを推測せず、registry/closure promotionを禁止する。

## 3. 非目標

- historical classificationだけでPLAN、test、registry、closure statusを変更しない。
- production観測値をproductionロジックへ固定しない。
- 不可逆操作と外部公開を自動承認しない。
