---
title: "Review変更要求fail-close設計"
layer: L6
status: draft
plan: docs/plans/PLAN-RECOVERY-1627-review-request-changes-fail-close.md
pair_artifact: docs/test-design/helix/L7-review-request-changes-fail-close.md
created: 2026-09-08
updated: 2026-09-08
---

# Review変更要求fail-close設計

GitHub上でsealedされた同一PR・同一HEADのcurrent receiptだけを時系列に並べる。`block`を未解消集合へ追加し、
同一`reviewer_session_id`の後続`approve`または`supersedesReceiptId`のexact edgeだけで解除する。
別sessionのapprove、別HEAD、別PR、parse不能receiptは解除根拠にしない。

Ready／merge admissionは未解消集合が非空なら`outstanding_request_changes`で拒否する。draft中の通常修正は
許可するが、変更PLANをterminalへ進める場合は`outstanding_request_changes_terminal_plan`で拒否する。
履歴取得不能はmerge経路でfail-closeし、PATや単一receipt判定へfallbackしない。
