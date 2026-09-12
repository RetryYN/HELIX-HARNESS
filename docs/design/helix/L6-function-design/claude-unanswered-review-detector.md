---
title: "Claude review未応答のread-only検出"
status: confirmed
canonical_layer: L6
canonical_pair: L7
plan: docs/plans/PLAN-L7-1743-claude-unanswered-review-detector.md
pair_artifact: docs/test-design/helix/L8-claude-unanswered-review-detector-unit-test-design.md
---

# Claude review未応答のread-only検出

GitHub上のreview依頼と後続receiptを観測し、書込みを行わず未応答集合を導出する。意味契約は本設計、
request／responseの発生事実はGitHub observation、継続用stateは前回artifactから再構築するprojectionとする。

## 境界

- request identityは`subject_kind + number + comment_id + requested_head`で固定する。
- 編集でmentionが失われても、前回観測済みrequestを消さない。
- 前回artifactの観測状態を`loaded`／明示revision付き`bootstrap`／`missing`／`expired`へ分類する。
  `missing`と`expired`はdegradedな観測gapとしてreportへ残し、未応答0を正常観測と主張しない。
- responseはrequestより後、同一HEAD、明示されたtrusted responder loginに一致し、current v4の
  canonical independent-review receiptとして封緘済みの場合だけ受理する。人間可読のreview見出しや
  legacy v2／v3 receiptを回答済みへ昇格しない。
- 同一GitHub accountを複数runtimeが共有する運用ではloginだけでruntimeを識別せず、typed receiptの
  `reviewerSessionId`とexact HEADを後段admissionで照合する。
- bot mention、別HEAD、先行reply、untrusted userのreview見出しを回答へ数えない。
- list／comment paginationは同じID・updated_at集合を2回read-afterし、drift時は`pagination_race`でfail-closeする。
  この経路はcollector実processと差分HTTP応答を用いるoracleで固定する。
- detectorはPLAN、receipt、Issue、DB、PRを変更しない。
