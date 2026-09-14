---
title: "review_evidence reviewer identity単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-22
updated: 2026-08-22
owner: QA / TL
plan: docs/plans/PLAN-L7-648-review-evidence-reviewer-identity.md
pair_artifact: docs/design/helix/L6-function-design/review-evidence-reviewer-identity.md
---

# review_evidence reviewer identity単体テスト設計

対象は `src/lint/review-evidence.ts` の `reviewerSessionViolationReason` と
`analyzeReviewEvidence` の `reviewerIdentityViolations`、および `src/schema/frontmatter.ts` の
`reviewer_session_id`。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RVIDENT-001 | identity 成立 | enforcement date 以降に **created** された confirmed PLAN の AI review entry に `reviewer_session_id` があれば `reviewerIdentityViolations=[]` / `ok=true` | `tests/review-evidence.test.ts` |
| U-RVIDENT-002 | session 欠落 | `reviewer_session_id` 欠落を `missing_reviewer_session_id` / `ok=false` として拒否し、prose だけの主体記録を受理しない | `tests/review-evidence.test.ts` |
| U-RVIDENT-003 | 形式不正 | 空文字、空白のみ、prose 混入（`session id: …`）、8 文字未満、先頭非英数を `invalid_reviewer_session_id` として拒否する | `tests/review-evidence.test.ts` |
| U-RVIDENT-004 | model 欠落 | session があっても `reviewer_model` 欠落は `missing_reviewer_model`。主体は session × model の対で定まる | `tests/review-evidence.test.ts` |
| U-RVIDENT-005 | 遡及禁止 | `created` が enforcement date より前の PLAN は、後から `updated` しても要求しない（記録の無い session の捏造を強いない） | `tests/review-evidence.test.ts` |
| U-RVIDENT-006 | human 除外 | `review_kind=human` は session を持たないため対象外とする | `tests/review-evidence.test.ts` |
| U-RVIDENT-007 | session×model 矛盾 | 同一 `reviewer_session_id` が異なる `reviewer_model` を名乗る記録を date-gate 非依存で `reviewer_session_model_conflict:<session>` として拒否する | `tests/review-evidence.test.ts` |
| U-RVIDENT-008 | 正常な再利用 | 同一 session が同一 model で複数 PLAN に現れるのは衝突にしない | `tests/review-evidence.test.ts` |
| U-RVIDENT-009 | 型付き抽出 | `extractReviewEntries` が frontmatter yaml から `reviewer_session_id` を読む（prose scope に依存しない） | `tests/review-evidence.test.ts` |
| U-RVIDENT-010 | 実 repo ガード | 現行 `docs/plans` に reviewer identity violation が無いことを fail-close で保つ | `tests/review-evidence.test.ts` |
| U-RVIDENT-011 | freeze 伝播 | 本設計と L8 の design-catalog 登録が G3 freeze packet の digest へ伝播していることを固定する | `tests/l3-g3-freeze-packet-v2.test.ts` |

## 検出力の実測（mutation）

宣言した検出力は prose ではなく変異注入で確認する。次の 9 変異が**個別に** red になることを要求する。

| 変異 | red になる oracle |
|---|---|
| session 検査を無条件 `null` 化 | U-RVIDENT-002 / 003 / 004 |
| `missing_reviewer_session_id` を素通し | U-RVIDENT-002 |
| 形式検査を外す | U-RVIDENT-003 |
| `missing_reviewer_model` を素通し | U-RVIDENT-004 |
| date gate を `created` から `updated` へ差し戻す | U-RVIDENT-005 / 010 |
| session×model 衝突検査を無効化 | U-RVIDENT-007 |
| 衝突閾値を `size <= 2` へ緩める | U-RVIDENT-007 |
| `ok` から `reviewerIdentityViolations` を除外 | U-RVIDENT-002 / 003 / 004 / 007 |
| `extractReviewEntries` の parse を削除 | U-RVIDENT-009 |

既存 233 件の cross_agent entry が green であることで、新 oracle の失敗を相殺しない。
