---
title: "Claude review未応答のread-only検出"
status: draft
canonical_layer: L6
canonical_pair: L7
plan: docs/plans/PLAN-L7-1743-claude-unanswered-review-detector.md
pair_artifact: docs/test-design/helix/L7-claude-unanswered-review-detector-unit-test-design.md
---

# Claude review未応答のread-only検出

GitHub上のreview依頼と後続receiptを観測し、書込みを行わず未応答集合を導出する。意味契約は本設計、
request／responseの発生事実はGitHub observation、継続用stateは前回artifactから再構築するprojectionとする。

## 境界

- request identityは`subject_kind + number + comment_id + requested_head`で固定する。
- 編集でmentionが失われても、前回観測済みrequestを消さない。
- responseはrequestより後、同一HEAD、明示されたtrusted responder loginに一致する場合だけ受理する。
- bot mention、別HEAD、先行reply、untrusted userのreview見出しを回答へ数えない。
- list／comment paginationは同じID・updated_at集合を2回read-afterし、drift時は`pagination_race`でfail-closeする。
- detectorはPLAN、receipt、Issue、DB、PRを変更しない。
