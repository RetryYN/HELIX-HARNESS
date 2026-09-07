---
artifact_id: HELIX-L8-REVIEW-RECEIPT-PLAN-BINDING-TEST
layer: L8
status: draft
related_plan: PLAN-RECOVERY-1603-review-receipt-plan-binding
related_issue: 1603
pair_artifact: docs/design/helix/L6-function-design/review-receipt-plan-binding.md
---

# Review receipt と PLAN evidence 接合の単体テスト設計

Issue #1627のRecovery oracleを既存pairへ追加し、別のtest-design authorityを作らない。

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-RRPB-001 | 正常なexact join | 全terminal変更PLANが同じsession/modelのcross-agent承認を持つ場合だけ受理する | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-002 | sessionの独立性 | 作成側spawn sessionをPLANへ記録し、receiptが常駐sessionならsession mismatchで拒否する | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-003 | model一致 | session文字列が一致してもmodelが異なる場合は拒否する | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-004 | review kind | humanまたはintra-runtime entryだけでは独立承認として受理しない | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-005 | terminal母集団 | draft変更PLANはreceipt sealのterminal evidence母集団へ入れない | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-006 | evaluator取得失敗 | parse不能として渡されたPLANをfail-closeする | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-007 | accepted母集団 | `accepted` PLANにcross-agent承認がなければterminal母集団として拒否する | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-008 | terminal遷移 | baseですでにterminalのPLANへmetadataだけを追加しても再照合しない | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-009 | model正規化 | 同providerのprefix差だけを許容し、異providerを拒否する | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-010 | Git取得失敗 | Git差分を取得できないrepository/baseをfail-closeする | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-011 | path境界 | `docs/plans/`直下以外のpathを母集団から除外する | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-012 | frontmatter parse | 変更PLANのfrontmatterが壊れていればfail-closeする | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-013 | local HEAD境界 | local HEADとGitHub candidate HEADが異なる場合はfail-closeする | `tests/review-receipt-plan-binding.test.ts` |
| U-CPRCONV-020 | merge CLI接合 | terminal化した変更PLANのreview sessionとreceiptが異なる場合、`pr-merge-reviewed`がrequired checks参照前にfail-closeする | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-044 | 未解消block | block後の別session approveを拒否し、履歴を現在approve一件へ縮退するmutationをkillする | `tests/claude-pr-convergence.test.ts` |
| U-CPRCONV-045 | 正規解消 | 同一sessionの後続approveまたはexplicit supersessionだけで解除する | `tests/claude-pr-convergence.test.ts` |
| U-GCRA-014 | GitHub admission | valid blockを`outstanding_request_changes`へ射影し、invalid候補として捨てるmutationをkillする | `tests/github-cross-review-admission.test.ts` |
| U-RRCF-001 | terminal境界 | draft継続とterminal昇格を分離し、base status比較削除をkillする | `tests/review-receipt-plan-binding.test.ts` |
| U-RRCF-002 | receipt exact join | session／model／HEAD／verdict／CI世代の各不一致を個別に拒否する | `tests/review-receipt-plan-binding.test.ts` |
| U-RRCF-003 | receipt locator | receipt URL欠落または引用receipt不在を拒否し、自己申告だけのreview evidenceをkillする | `tests/review-receipt-plan-binding.test.ts` |
| U-RRCF-004 | candidate本文 | commit済みterminal PLANを作業ファイルだけdraftへ変更してもterminal昇格を検出する | `tests/review-receipt-plan-binding.test.ts` |
