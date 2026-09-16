---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
plan: docs/plans/PLAN-L6-18-review-evidence-stale.md
---

> **L6 contract marker**: `analyzeReviewEvidence(input: ReviewEvidenceInput) => ReviewEvidenceResult` は unit-test 粒度の contract である。DbC pre/post/invariant は stale approval residues を U-REVIEW-007..008 へ対応させる。

# review-evidence stale approval lint の function design (IMP-080)

## §1 対象範囲

この add-design は `review-evidence` を reverse 方向に拡張する。`status: draft` またはそれ以外の downgrade 済み PLAN は、approval verdict を持つ `review_evidence` を保持してはならない。その record は un-freeze 後に残った stale approval evidence である。

この check は既存の confirmed/completed missing-evidence rule を維持し、既存 `reviewEvidence.ok` doctor path を通じて stale approval detection を hard violation として追加する。

## §2 関数

| function | contract |
|---|---|
| `extractReviewEntries(content)` | `review_evidence` entries から reviewer、review kind、timestamps、tests timestamp、verdict を抽出する。 |
| `analyzeReviewEvidence(plans)` | 既存 missing-evidence rule に non-confirmed plans 向け stale approval detection を追加する。 |
| `reviewEvidenceMessages(result)` | missing evidence message と stale approval message を分けて出力する。 |

## §3 Stale Approval Rule の規則

対象 statuses は `confirmed` / `completed` 以外のすべてである。review entry のいずれかが `verdict: approve`、`verdict: approve_after_fixes`、または `verdict: pass` を持つ場合、その PLAN は `staleApprovalViolations` に報告される。

許可される cases:

- `confirmed` または `completed` で approval evidence を持つ。
- `draft` で `review_evidence` を持たない。
- `draft` で `request_changes` などの non-approval evidence を持つ。

拒否される case:

- `draft` で approval verdict を持つ。

## §4 Test Oracle の判定基準

`tests/review-evidence.test.ts` と `docs/test-design/harness/L7-unit-test-design.md` で coverage を持つ:

| ID | oracle |
|---|---|
| U-REVIEW-007 | draft + `verdict=approve` -> stale approval violation を出す |
| U-REVIEW-008 | confirmed + approve と evidence なし draft -> ok |
