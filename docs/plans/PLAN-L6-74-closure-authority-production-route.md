---
plan_id: PLAN-L6-74-closure-authority-production-route
title: "PLAN-L6-74 (add-design): closure authority production route"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-12 ハーネスメモリと起票を潰し、設計基準へ検出力を追従させる継続指示。PR #19 merge後のcurrent mainでproduction入口欠落を検出"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
irreversible_impact: none
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-73の既存contractをproduction CLIへ到達させるadditive設計であり、L0-L3要求とhuman/action-binding境界を変更しない。"
pair_artifact: docs/test-design/harness/closure-authority-production-route.md
agent_slots:
  - { role: se, slot_label: "SE - current-main proposal bundle生成とcanonical allowlist配線" }
  - { role: qa, slot_label: "QA - clean HEAD、全候補保存則、read-only、欠落source fail-close検証" }
generates:
  - { artifact_path: docs/design/harness/L6-function-design/closure-authority-production-route.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/closure-authority-production-route.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
dependencies:
  parent: docs/plans/PLAN-L6-73-closure-authority-backfill.md
  requires: [docs/plans/PLAN-L6-73-closure-authority-backfill.md]
review_evidence:
  - reviewer: codex-independent-reviewer
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: codex-intra-runtime
    tests_green_at: "2026-07-12T03:58:41Z"
    reviewed_at: "2026-07-12T03:59:30Z"
    verdict: approve_after_fixes
    scope: "production builder欠落を反証し、run全件保存則と最大100件window、HEAD/blob provenance、dirty/source境界、strict allowlist、public CLI、read-only、builder/verifier同型を敵対監査した。初回B0/H1/M3/L1を是正し、再review B0/H0/M0/L1の残Lowも解消した。"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run tests/design-coverage.test.ts tests/design-language.test.ts tests/l6-completion.test.ts tests/plan-entry-routing.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-12T03:58:41Z", evidence_path: docs/test-design/harness/closure-authority-production-route.md, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
      - { kind: lint, command: "npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L6-74-closure-authority-production-route.md", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-12T03:58:41Z", evidence_path: docs/plans/PLAN-L6-74-closure-authority-production-route.md, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
---

# PLAN-L6-74: closure authority本番経路

## 1. 目的

`buildClosureAuthorityBackfill`のpure policyと厳密verifierの間に欠けているproduction bundle生成routeを補い、
current mainの全`close_ready`候補を、推測なしの6分類へ実測可能にする。

## 2. 完了条件

- canonical gate allowlistがrepo-owned、strict、HEAD tracked sourceとして存在する。
- public loaderがcurrent review scopeの全候補を100件以下のwindowで再構築する。
- `helix closure authority-backfill --dry-run --from-db --expected-head <sha> --json`がread-only bundleを返す。
- clean current `HEAD == origin/main`、persistent DB、全候補保存則、source digestをfail-closeで強制する。
- `U-CABF-011..018`がL8で一対一に定義される。

## 3. 非目標

- 本設計だけでregistry row、closure status、approvalを変更しない。
- authority blockが無いPLANへcapability/gateを推測・一括注入しない。
- human/action-binding対象を自動承認しない。
