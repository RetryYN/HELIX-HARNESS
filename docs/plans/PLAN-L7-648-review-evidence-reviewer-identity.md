---
plan_id: PLAN-L7-648-review-evidence-reviewer-identity
superseded_by: [PLAN-RECOVERY-1543-reviewer-session-model-history]
title: "PLAN-L7-648 (impl): review_evidence の reviewer 主体を構造化フィールドで一意にする"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
created: 2026-08-22
updated: 2026-08-22
owner: Claude / TL
github_issue_id: 923
behavior_contract_id: REVIEW-EVIDENCE-REVIEWER-IDENTITY-001
responsibility_owner: review-evidence
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "receipt (helix-claude-pr-review-receipt.v4) は reviewerSessionId を必須構造化フィールドとして持つのに対し、review_evidence[] は reviewer_model が optional で session に相当するフィールドを持たず、PLAN 側は主体を scope の prose にしか書けない"
contract_postconditions: "2026-08-22 以降に created された confirmed/completed PLAN の cross_agent／intra_runtime_subagent entry は reviewer_session_id と reviewer_model を型付きで持ち、欠落・形式不正・session×model 矛盾を doctor が fail-close する"
contract_invariants: "gate は updated ではなく created で行い、既存 233 entry へ記録の無い session の遡及入力を強いない。human entry は session を持たないため対象外とする"
contract_failures: "session 検査の無効化、missing／invalid／missing_reviewer_model の素通し、date gate の updated への差し戻し、session×model 衝突検査の無効化・閾値緩和、ok からの除外、parse 削除を U-RVIDENT-001〜010 が個別に red にする"
tdd_red_required: false
tdd_red_waiver_reason: "PR #872／#857／#858／#889／#885 の実測 5 例（Issue #883 本文と追記に記録）を既存 Red とし、未記録 timestamp を捏造しない"
complexity_effect: net_negative
complexity_justification: "既存の analyzeReviewEvidence へ直交する 1 検査を足すだけで、prose 解読に依存していた主体特定を型付きの照合対象へ移す"
removal_trigger: "receipt との exact 照合（次 slice）が admission 側で fail-close するようになり、offline presence 検査が冗長になった時点で本検査を照合へ吸収する"
parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-identity.md
pair_artifact: docs/test-design/helix/L8-review-evidence-reviewer-identity-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #923で分離したreview evidence reviewer identityの実測誤帰属をRecoveryする"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/review-evidence-reviewer-identity.md, oracle_id: U-RVIDENT-001, test_path: tests/review-evidence.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — 9 mutation の individual kill と実 repo 0 violation の反証" }
  - { role: tl, slot_label: "TL — created gate と遡及禁止の妥当性確認" }
review_evidence:
  - reviewer: Codex Sol
    review_kind: cross_agent
    reviewer_session_id: 019febe1-8983-7820-bee4-4cd62876f9b6
    reviewed_at: "2026-08-21T22:56:13Z"
    tests_green_at: "2026-08-21T22:55:55Z"
    verdict: approve
    worker_model: claude:claude-opus-5
    reviewer_model: codex:gpt-5.6-sol
    scope: "PR #919 exact HEAD 3097c797b16d5a06beb2333c174a8b455ce031d2を独立reviewし、created date gate、session／model presence、date非依存conflict、doctor fail-close、legacy非遡及、Issue #923 RECOVERY ownershipを確認した。blocker／high／medium 0。canonical review comment: https://github.com/RetryYN/HELIX-HARNESS/pull/919#issuecomment-5376232742"
    green_commands:
      - kind: unit_test
        command: "npm run typecheck && npx --no-install vitest run --project fast tests/review-evidence.test.ts tests/ci-governance-self-heal.test.ts tests/green-command-digest.test.ts && npx --no-install tsx src/cli.ts plan lint docs/plans/PLAN-L7-648-review-evidence-reviewer-identity.md"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-21T22:55:55Z"
        evidence_path: tests/review-evidence.test.ts
        output_digest: "sha256:3dfa3c9635a14fa90d36fdc32c336781bc01f576bf3309dbe97cc009e835cd34"
        result: "typecheck green、3 files／57 tests green、PLAN lint全gate green"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-21T22:56:13Z"
  review_binding:
    reviewer: "Codex Sol"
    reviewed_at: "2026-08-21T22:56:13Z"
    evidence_digest: "sha256:8008f531055b69cb706675e51705eeb8be56e045e34b1a908032d2dd14d5a2f7"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-648-review-evidence-reviewer-identity.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/review-evidence-reviewer-identity.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-review-evidence-reviewer-identity-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/review-evidence.ts, artifact_type: source_module }
  - { artifact_path: src/schema/frontmatter.ts, artifact_type: source_module }
  - { artifact_path: tests/review-evidence.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-13-cross-review-enforcement.md
  requires:
    - docs/plans/PLAN-L6-13-cross-review-enforcement.md
  blocks:
    - issue:923
---

# review_evidence の reviewer 主体を構造化フィールドで一意にする

## §背景（実測）

Issue #883 に記録した誤帰属 5 例（#872 / #857 / #858 / #889 / #885）は、**すべて
`review_evidence` 側で発生し、receipt 側では 1 件も発生していない**。両者の schema を比較すると
差は 1 点に絞れる。

```
receipt   (src/runtime/claude-pr-convergence.ts:265)  reviewerSessionId: string;   ← 必須・構造化
review_evidence (src/lint/review-evidence.ts)         reviewer_model?: string;     ← optional
                                                      （session 相当フィールドなし）
```

PR #899 の receipt は、本 session（`792345fd-…`）とは別の Claude 収束レーン
（`8e73aa7e-…`、同一 model `claude-opus-5`）が発行しており、**同一 model の複数レーンが同時稼働する**
運用は実在する。`reviewer` / `reviewer_model` だけでは主体が定まらない。

## §工程表 schedule

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | `reviewer_session_id` を ReviewEntry と frontmatter schema へ追加 | yaml から型付きで読める |
| 2 | `reviewerSessionViolationReason` を追加 | 欠落 / 形式不正 / model 欠落を個別 code で返す |
| 3 | `created` gate で confirmed PLAN へ presence 強制 | 既存 PLAN を遡及要求しない |
| 4 | repo 横断の session×model 矛盾検査 | date-gate 非依存で衝突を surface する |
| 5 | mutation で各 oracle の検出力を実測 | 9 変異が個別に red になる |

## §境界

- **receipt との exact 照合は本 PR では行わない**。offline lint は「cite された comment の実際の投稿者と
  一致するか」「`reviewed_at` が改変されていないか」を判定できない。これは
  `github-cross-review-admission` へ `reviewer_session_id ↔ reviewerSessionId` /
  `reviewer_model ↔ reviewerModel` の照合を足す次 slice の対象とする。
- 既存 233 件の cross_agent entry への遡及 backfill は行わない。記録の残っていない session を
  後から書くことは捏造であり、`created` gate はそれを避けるための設計である。
- 実例として `PLAN-RECOVERY-63` の review entry（`reviewed_at: 2026-08-21T13:37:03Z`、HEAD `68ed0ab0`）は、
  PR #903 に存在する receipt（HEAD `af5f172d`、`reviewedAt: 14:08:47Z`）と HEAD も時刻も一致せず、
  **構造化データからは session を復元できない**。この PLAN は本検査の対象外（`created: 2026-08-21`）とする。
