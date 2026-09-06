---
artifact_id: HELIX-L6-REVIEW-RECEIPT-PLAN-BINDING
layer: L6
status: draft
related_plan: PLAN-RECOVERY-1603-review-receipt-plan-binding
related_issue: 1603
pair_artifact: docs/test-design/helix/L8-review-receipt-plan-binding-unit-test-design.md
---

# Review receipt と PLAN review evidence の接合

## 目的

PRの最終merge admissionが採用するsealed review receiptと、変更対象PLANがterminal化に使用した
`review_evidence`を同じreviewer sessionへ束縛する。作成側が起動した限定worker runの結果を
PLANだけへ転記し、常駐収束レーンの検収と見せかける経路を拒否する。

## 境界

- Git差分から変更対象のPLANを決定し、worktree全体の無関係な過去PLANを母集団にしない。
- baseで非terminal、HEADで`confirmed`／`completed`／`accepted`へ遷移したPLANだけを検査する。
  既存terminal PLANへの注記・supersession metadata追加は再terminal化ではないため母集団外とする。
- PR receiptの`reviewerSessionId`、`reviewerModel`とPLAN側の`reviewer_session_id`、
  `reviewer_model`を照合する。modelはproviderを一致させた上でprovider prefixだけを正規化する。
- 対象PLANごとに一致する`cross_agent`承認がなければreceipt sealとmerge admissionをfail-closeする。
- human approval、`intra_runtime_subagent`、proseのscopeは独立検収を代替しない。
- evidence logの実体検査はIssue #1430の責務を再実装しない。

## 失敗コード

- `review_plan_binding_unavailable`: Git差分またはPLAN frontmatterを決定的に取得できない。
- `review_plan_session_mismatch`: terminal変更PLANとreceiptのreviewer sessionが一致しない。
- `review_plan_model_mismatch`: sessionは一致するがreviewer modelが一致しない。
- `review_plan_cross_agent_approval_missing`: 独立技術承認entryがない。
