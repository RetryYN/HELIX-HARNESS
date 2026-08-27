---
title: "L3 human approval gate L8単体テスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: draft
created: 2026-08-27
updated: 2026-08-27
owner: QA / Codex TL
plan: PLAN-L7-687-l3-human-approval-gate
pair_artifact: docs/design/helix/L6-function-design/l3-human-approval-gate.md
github_issue_id: 1097
behavior_contract_id: L3-HUMAN-APPROVAL-GATE-001
responsibility_owner: l3-human-approval-gate
---

# L3 human approval gate L8単体テスト設計

## §0 合否境界

技術reviewの存在や `review_kind: human` の文字列だけでL3要件承認に昇格しないことを検証する。
typed recordの型・対象PLAN・外部記録が揃う場合だけ、基準日以降のL3 terminal PLANを通す。
過去の確定履歴は遡及対象外とする。

## §1 oracle完全一致集合

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-L3APP-001 | AI技術reviewのみ | 基準日以降のL3 confirmedを`missing_human_po_approval`で拒否する | `tests/review-evidence.test.ts` |
| U-L3APP-002 | review kind分離 | `review_kind: human`だけではPO approvalの代替にならない | `tests/review-evidence.test.ts` |
| U-L3APP-003 | typed approval | `approval_kind`、decision、対象PLAN、承認者、時刻、record、sourceが一致すれば受理する | `tests/review-evidence.test.ts` |
| U-L3APP-004 | migration boundary | 基準日前に確定したL3 PLANへ遡及違反を出さない | `tests/review-evidence.test.ts` |
| U-L3APP-005 | schema／binding mutation | malformed recordまたは別PLANのrecordを`invalid_human_po_approval`で拒否する | `tests/review-evidence.test.ts` |
| U-L3APP-006 | 日付順序 | 基準日以降に作成したL3 PLANの`updated`を過去へ戻す時系列逆転は、承認recordがあっても`invalid_l3_plan_dates`で拒否する | `tests/review-evidence.test.ts` |
| U-L3APP-007 | 日付整合性 | 日付欠落または暦日不正は承認recordがあっても`invalid_l3_plan_dates`で拒否する | `tests/review-evidence.test.ts` |
| U-L3APP-008 | Git初出日付 | frontmatterの両日付を過去へ戻してもGit初出が基準日以降なら`missing_human_po_approval`で拒否する | `tests/review-evidence.test.ts` |
| U-L3APP-009 | Git最終変更日付 | frontmatterの両日付を過去へ戻してもGit最終変更が基準日以降なら`missing_human_po_approval`で拒否する | `tests/review-evidence.test.ts` |
| U-L3APP-010 | Git provenance欠落 | L3 terminal PLANのGit provenanceが欠落・取得不能なら承認recordがあっても`missing_l3_plan_git_provenance`で拒否する | `tests/review-evidence.test.ts` |
| U-L3APP-011 | grandfather境界 | Git初出・最終変更が基準日前の既存L3 PLANはfrontmatter日付に依存せず承認を遡及要求しない | `tests/review-evidence.test.ts` |
| U-L3APP-012 | loader integration | tracked PLANのloaderがGit初出／最終変更日を取得し、Git provenanceを解析対象へ束縛する | `tests/review-evidence.test.ts` |

## §2 非対象

GitHub actorの実在性、署名、承認者アカウントの本人性はこの純粋lint sliceの責務外である。
Git command自体の署名性やremoteの信頼性は扱わず、CIの完全履歴checkoutと対象pathのGit provenance
取得不能をfail-closeする境界だけを検査する。
外部approval provenanceを取得・検証する後続sliceでは、同じ `approval_record_id` と対象PLANを
現在HEADへ再束縛し、AIがrecordを自己発行しても通らない経路を追加する。
