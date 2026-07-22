---
plan_id: PLAN-L3-21-contextual-pr-review-db-convergence
title: "PLAN-L3-21 (add-design): PR文脈レビューと同一HEAD DB追従のmerge必須要件"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-22 CI greenだけでなく別AIの文脈レビューとharness.db追従をmerge必須要件にする"
created: 2026-07-22
updated: 2026-07-22
owner: Codex / TL
parent_design: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/github-autonomous-operations-acceptance.md
agent_slots:
  - role: tl
    slot_label: "TL — 文脈入力閉包、AI-A/AI-B identity・session分離、同一HEAD receipt stale規則のレビュー"
  - role: qa
    slot_label: "QA — event/projection/checkpoint/schema追従と隔離rebuild oracleのレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L3-21-contextual-pr-review-db-convergence.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-autonomous-operations-acceptance.md
    artifact_type: test_design
  - artifact_path: docs/governance/helix-harness-requirements_v1.3.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/github-pr-audit-promotion.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-github-pr-audit-promotion-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/infinity-loop-system-assertion-cases.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/infinity-loop-design-progress-ledger.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts
    artifact_type: source_module
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
  - artifact_path: docs/governance/devops-external-source-research-2026-07-22.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/infinity-loop-requirements-consistency-audit-2026-07-22.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
    - docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md
  references:
    - docs/plans/PLAN-L3-19-github-operations-projection.md
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
    - "github:RetryYN/HELIX-HARNESS#91"
    - docs/governance/devops-external-source-research-2026-07-22.md
  blocks: []
review_evidence:
  - reviewer: claude-cross-review
    review_kind: cross_agent
    reviewed_at: "2026-07-22T01:35:00+09:00"
    tests_green_at: "2026-07-22T01:05:45+09:00 (tests/l12-hybrid-recognition.test.ts 16/16, tests/plan-lint.test.ts 51/51, tests/harness-memory-reconciliation-binding.test.ts 8/8, tests/cli-surface.test.ts -t objective 4/4; full harness-check aggregateはCI run待ち)"
    verdict: advisory_approve_pending_l3_confirm
    scope: "commit d8a4e569..5e5d0125 (GH-FR-018..021、GH-NFR-009..014、HST-HIL-034..039、HST-CASE-034..039、EnvironmentPromotionController等L4追加)をclaude-fable-5(advisor-fable)相談を経てクロスレビュー。GH-FR-021 staging/production境界は承認gate強化方向でありCLAUDE.md安全境界違反ではないと判定(誤検出だったローカルref遅延を修正しremote tip基準で再確認済み)。GH-FR-019/020に単一runtime時degraded_modeフォールバックが欠落(GH-FR-018と同型の再発パターン)していたためこのreview自身が追記して是正。HST-HIL-036に正常系case欠落(HST-CASE-036-06として追加)。L3 confirmはPO承認境界として未実施、本reviewはGH-FR-019のcross review責務をこのPLAN自身へ自己適用したもの。"
    worker_model: codex
    reviewer_model: claude-sonnet-5
---

# PLAN-L3-21: PR文脈レビューと同一HEAD DB追従

## §0 目的

CIを意味判断の代替にせず、別runtime/providerのAIが上位正本と変更文脈を読み、同じPR HEADに対して
`harness.db`のevent、projection、checkpoint、schema revisionが追従していることを確認してからmerge可能にする。
本変更により既存G1/G3 freeze packetのsnapshotはstaleとなるため、review後にpacketを再生成する。

## §工程表

### Step 1: L3要件とACの追加 [直列]

- `GH-FR-018..022`、`GH-AC-014..029`を追加し、CI green単独merge、監査AI自己承認、ユーザー未承認要件PR、性能検査縮退、不完全なmain Recovery解除、安全証拠のないproduction promotion/migration、Update backlog誤分類を拒否する。

### Step 2: L4/L9 pairへの降下 [直列]

- `ContextualPrReviewRouter`から`UpdateBacklogClassifier`までの責務境界をL4へ追加する。
- HST-HIL-034..040と原子的caseをL9へ追加する。

### Step 2.5: L5詳細設計とL8 test設計への降下 [直列]

- current HEAD review、DB convergence、layer-aware audit、CI/Recovery、要件承認、production promotion、Update backlogをtyped API、state、DB、failure契約へ分解する。
- L8 integration testへ`IT-GPAP-018..033`を追加し、HST-HIL-034..040を単独mutation、stale、transaction fault oracleへ接続する。

### Step 3: 正本・分母同期 [直列]

- requirements v1.3、system assertion分母、design progress ledgerを同じ変更で同期する。

### Step 4: 機械検証と別AIレビュー [直列]

- plan lint、design coverage、L12 recognition、doctorを実行する。
- 作成側と異なるruntime/providerが文脈とDB追従契約をreviewし、current HEADへreceiptを束縛する。

## §受入条件

- AC-1: CI greenだけのPR fixtureがmerge不可になる要件とoracleが存在する。
- AC-2: reviewerが読む正本・Issue/PLAN・diff・trace・consumer・security/blast radiusが列挙される。
- AC-3: DB追従receiptがsource HEAD、event head、projection/checkpoint digest、schema revision、stale/orphan件数、隔離rebuild結果を持つ。
- AC-4: push、base更新、CI self-heal、正本digest変更で両receiptがstaleになる。
- AC-5: plan lint、targeted test、doctorがgreenで、別runtime/provider review evidenceが記録される。
- AC-6: GH-FR-018..022、GH-NFR-009..014、GH-AC-014..029がL4 component、L5 API、L8 IT、L9 HSTへexact joinし、orphan 0となる。
- AC-7: production deploy/migrationはdecision proposalに留まり、action-binding approvalなしのapply command、SQL、external writeを設計しない。

## §6 用語更新 (§G.9)

- `contextual PR review`: PRの機械検証とは別に、上位正本と変更文脈を読む意味レビュー。
- `PR database convergence`: current PR HEADとharness.dbのevent/projection/checkpoint/schema整合。
