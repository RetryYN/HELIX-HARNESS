---
title: "Review変更要求fail-closeテスト設計"
status: draft
plan_id: PLAN-RECOVERY-1627-review-request-changes-fail-close
---

# Review変更要求fail-closeテスト設計

- U-CPRCONV-044: 同一HEADのblockを別session approveで上書きできない。
- U-CPRCONV-045: 同一sessionの後続approveまたはexplicit supersessionでのみ解除できる。
- U-GCRA-014: GitHub admissionが単一approve候補だけを選ばず未解消blockを拒否する。
- U-RRCF-001: draft修正は継続できるが、未解消block中のterminal PLAN昇格は拒否する。
- U-RRCF-002: receipt履歴取得不能時にmergeをfail-closeする。

mutation oracleは、receipt履歴を現在approve一件へ縮退する変更、session比較を削除する変更、draftとterminalを
無条件同一扱いする変更を各反例がkillすることを確認する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CPRCONV-044 | `evaluateClaudePrMerge` | block後の別session approveを拒否し、履歴を現在approve一件へ縮退するmutationをkill | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-045 | 同上 | 同一sessionまたはexplicit supersessionで解除し、session比較削除をkill | `tests/claude-pr-convergence.test.ts` |
| U-GCRA-014 | `evaluateGitHubCrossReviewAdmission` | valid blockを`outstanding_request_changes`へ射影し、invalid候補として捨てるmutationをkill | `tests/github-cross-review-admission.test.ts` |
| U-RRCF-001 | `hasTerminalPlanPromotion` | draft継続とterminal昇格を分離し、base status比較削除をkill | `tests/review-receipt-plan-binding.test.ts` |
