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
| U-RRPB-006 | 取得失敗 | Git差分取得不能、frontmatter parse不能、対象PLAN pathの逸脱をfail-closeする | `tests/review-receipt-plan-binding.test.ts` |
| U-RRPB-007 | accepted母集団 | `accepted` PLANにcross-agent承認がなければterminal母集団として拒否する | `tests/review-receipt-plan-binding.test.ts` |
