---
title: "review_evidence reviewer identity機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-22
updated: 2026-08-22
owner: Claude / TL
plan: docs/plans/PLAN-L7-648-review-evidence-reviewer-identity.md
pair_artifact: docs/test-design/helix/L8-review-evidence-reviewer-identity-unit-test-design.md
github_issue_id: 883
behavior_contract_id: REVIEW-EVIDENCE-REVIEWER-IDENTITY-001
responsibility_owner: review-evidence
---

# review_evidence reviewer identity機能設計

## 責務

`review_evidence[]` の各 entry について、**その review を誰が実施したか**を prose ではなく構造化
フィールドで一意に定める。主体は **session × model の対**で定まり、片方だけでは一意にならない。

既存の cross-review semantic 強制（IMP-076、`same_model_approval`）は model の**相異**を見る検査であり、
主体の**特定可能性**を見る本設計とは検査軸が直交する。

## 背景（実測）

Issue #883 に記録した誤帰属 5 例（PR #872 / #857 / #858 / #889 / #885）は、すべて `review_evidence`
側で発生し、receipt 側では 1 件も発生していない。両者の schema 差は 1 点に絞れる。

| 面 | session フィールド | 発生した誤帰属 |
|---|---|---|
| receipt `helix-claude-pr-review-receipt.v4` | `reviewerSessionId: string`（必須） | 0 件 |
| `review_evidence[]` | なし（`scope` の prose に書くのみ） | 5 件 |

PR #899 の receipt は本 session とは別の Claude 収束レーン（同一 model `claude-opus-5`）が発行しており、
**同一 model の複数レーンが同時稼働する**運用は実在する。`reviewer` / `reviewer_model` だけでは
主体が定まらない。

## §1 schema 拡張（review_evidence entry）

`review_evidence[]` の各 entry へ**任意フィールド 1 つ**を追加する（既存 entry 非破壊）。

- `reviewer_session_id?: string` — review を実施した session の識別子。receipt の
  `reviewerSessionId` と対になる PLAN 側フィールド。

## §2 判定関数（DbC）

### `reviewerSessionViolationReason(entry): string | null`

- **Precondition**: `review_evidence` の 1 entry。
- **Postcondition**: `review_kind ∈ {cross_agent, intra_runtime_subagent}` の entry について、
  `reviewer_session_id` 欠落を `missing_reviewer_session_id`、形式不正を
  `invalid_reviewer_session_id`、`reviewer_model` 欠落を `missing_reviewer_model` として返す。
  `human` は session を持たないため常に `null` を返す。
- **Invariant**: 形式は `^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$`。空白・prose 混入・8 文字未満・
  先頭非英数を受理しない（`session id: …` のような prose 断片を session として通さない）。

### `analyzeReviewEvidence(plans)` 拡張 — `reviewerIdentityViolations`

- **Precondition**: parsed plan 群（archived は除外）。
- **Postcondition**:
  1. `created >= REVIEWER_SESSION_ENFORCEMENT_DATE`（`2026-08-22`）かつ status ∈ {confirmed, completed}
     の PLAN で `reviewerSessionViolationReason` が non-null なら、1 PLAN 1 件 collect する。
  2. date-gate 非依存で、**同一 `reviewer_session_id` が異なる `reviewer_model` を名乗る**記録を
     `reviewer_session_model_conflict:<session>` として collect する（少なくとも一方が誤帰属である）。
- **Invariant**: gate は `updated` ではなく **`created`** で行う。既存 PLAN を後から編集しただけで、
  記録の残っていない session の遡及入力（＝捏造）を強いる状態を作らない。
  `ok` は `reviewerIdentityViolations.length === 0` を含む。

## §3 doctor 配線

`checkReviewEvidence`（既存 hard、IMP-071）が `result.ok` をそのまま返すため、
`reviewerIdentityViolations` は自動で `runDoctor.ok` 連動（hard / fail-close）となる。追加配線は不要で、
`reviewEvidenceMessages` が違反を surface する。

## §4 本設計が判定できない範囲

offline lint は PLAN 本文だけを読むため、次は**判定できない**。

- cite された comment の実際の投稿者と `reviewer` が一致するか（PR #885 / #889 の型）
- `reviewed_at` が他 runtime の記録から改変されていないか（PR #872 の型）

これらは GitHub 側の receipt を参照しないと判定できず、`github-cross-review-admission` へ
`reviewer_session_id ↔ reviewerSessionId` / `reviewer_model ↔ reviewerModel` の exact 照合を足す
次 slice の対象とする。本設計は**その照合相手を PLAN 側に用意する**段階である。

## §5 移行

既存 233 件の cross_agent entry は遡及対象にしない。実例として `PLAN-RECOVERY-63` の review entry
（`reviewed_at: 2026-08-21T13:37:03Z`、HEAD `68ed0ab0`）は、PR #903 に存在する receipt
（HEAD `af5f172d`、`reviewedAt: 14:08:47Z`）と HEAD も時刻も一致せず、構造化データから session を
復元できない。`created` gate はこの型の PLAN へ捏造を強いないための設計である。
