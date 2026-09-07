---
artifact_id: HELIX-L6-REVIEW-RECEIPT-PLAN-BINDING
layer: L6
status: draft
related_plan: PLAN-RECOVERY-1603-review-receipt-plan-binding
related_issue: 1603
pair_artifact: docs/test-design/helix/L8-review-receipt-plan-binding-unit-test-design.md
---

# Review receipt と PLAN review evidence の接合

Issue #1627の未解消変更要求と引用receipt exact joinは、本責務の追加Recoveryとして扱う。

## 目的

PRの最終merge admissionが採用するsealed review receiptと、変更対象PLANがterminal化に使用した
`review_evidence`を同じreviewer sessionへ束縛する。作成側が起動した限定worker runの結果を
PLANだけへ転記し、常駐収束レーンの検収と見せかける経路を拒否する。

## 境界

- Git差分から変更対象のPLANを決定し、worktree全体の無関係な過去PLANを母集団にしない。
- local HEADがreceipt／GitHubのcandidate HEADと一致しないworktreeからのseal・mergeを拒否する。
- PLAN本文も取得時に固定したcandidate commitから読み、未commitのstatus／review記録で検査対象を変更させない。
- baseで非terminal、HEADで`confirmed`／`completed`／`accepted`へ遷移したPLANだけを検査する。
  既存terminal PLANへの注記・supersession metadata追加は再terminal化ではないため母集団外とする。
- Git／frontmatter取得不能の場合は上記対象外と推定せず検査対象へ送り、
  `review_plan_binding_unavailable`で拒否する。terminal状態へ認定する意味ではない。
- PR receiptの`reviewerSessionId`、`reviewerModel`とPLAN側の`reviewer_session_id`、
  `reviewer_model`を照合する。modelはproviderを一致させた上でprovider prefixだけを正規化する。
- 対象PLANごとに一致する`cross_agent`承認がなければreceipt sealとmerge admissionをfail-closeする。
- 同一PR・HEADの`block`は、同じreviewer sessionかつ時刻が後のapproveまで未解消findingとして保持する。
  対象receipt IDを明示したsupersessionもsession一致条件を迂回しない。同時刻・別sessionでは解除しない。
- terminalへ昇格するPLANは`receipt_url`をlookup keyとしてsealed receiptを取得し、
  `reviewer_session_id`、`reviewer_model`、`reviewed_head_sha`、`verdict`、
  `ci_evidence_generation`をexact照合する。最終merge receiptと過去の実装review receiptは同一とは限らないため、
  current receiptへ推測接合せず、PLANが明示的に引用したreceiptだけを根拠にする。
  独立承認entryは全件照合し、正しい一件で別entryの欠落・不一致を相殺しない。
- draft中の修正は継続可能とし、未解消block中のterminal昇格とmergeだけを拒否する。
- receipt履歴を取得できない場合は単一approveやPAT経路へfallbackせずfail-closeする。
- schemaとdigestを検証して取得した同一PR／HEADのblockは、CI失敗・DB未収束・CI世代差を理由に
  検出集合から除外しない。解除に使うapproveには成功receiptの成立条件を引き続き要求する。
- human approval、`intra_runtime_subagent`、proseのscopeは独立検収を代替しない。
- evidence logの実体検査はIssue #1430の責務を再実装しない。

## 失敗コード

- `review_plan_binding_unavailable`: Git差分またはPLAN frontmatterを決定的に取得できない。
- `review_plan_session_mismatch`: terminal変更PLANとreceiptのreviewer sessionが一致しない。
- `review_plan_model_mismatch`: sessionは一致するがreviewer modelが一致しない。
- `review_plan_cross_agent_approval_missing`: 独立技術承認entryがない。
- `outstanding_request_changes`: 同一PR・HEADに未解消の変更要求がある。
- `outstanding_request_changes_terminal_plan`: 未解消変更要求中にPLANをterminalへ昇格した。
- `review_plan_receipt_locator_missing`／`review_plan_receipt_missing`: 引用receiptを特定・取得できない。
- `review_plan_head_mismatch`／`review_plan_verdict_mismatch`／`review_plan_ci_generation_mismatch`:
  PLAN転記値と引用sealed receiptが一致しない。
