---
layer: L8
artifact_type: test_design
status: draft
plan: docs/plans/PLAN-RECOVERY-1411-review-checklist-validation.md
parent_design: docs/design/helix/L6-function-design/review-checklist-validation.md
pair_artifact: docs/design/helix/L6-function-design/review-checklist-validation.md
---

# checklist検証の単体受入

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-CHKREV-001 | loadReviewChecklist / evaluateGateReview | status欠落/PASS/skip/null/number、重複fail→pass、未知ID、欠落、shape不正をloader/直接入力で拒否する。正常pass・理由付きn-aを維持する | `tests/gate-review-tier.test.ts` |

旧skill templateは完成証拠として受理しない。テスト用ファイルは専用一時directoryへ限定する。
Red実測は修正前7 failed/11 passed。修正後20 passedだけで全体gate完了とはしない。
