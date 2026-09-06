---
artifact_id: HELIX-L8-REVIEW-RECEIPT-PLAN-BINDING-TEST
layer: L8
status: draft
related_plan: PLAN-RECOVERY-1603-review-receipt-plan-binding
related_issue: 1603
pair_artifact: docs/design/helix/L6-function-design/review-receipt-plan-binding.md
---

# Review receipt と PLAN evidence 接合の単体テスト設計

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
