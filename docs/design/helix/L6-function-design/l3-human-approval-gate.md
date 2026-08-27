---
title: "L3 要件 human approval gate L6機能設計"
layer: L6
kind: add-design
status: draft
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
plan: PLAN-L7-687-l3-human-approval-gate
pair_artifact: docs/test-design/helix/L8-l3-human-approval-gate-unit-test-design.md
github_issue_id: 1097
behavior_contract_id: L3-HUMAN-APPROVAL-GATE-001
responsibility_owner: l3-human-approval-gate
---

# L3 要件 human approval gate L6機能設計

## §0 目的とauthority

L3 Requirement Compiler の G1/G3 人間承認を、技術レビューの証跡から機械的に分離する。
`review_evidence` は Codex／Claude 等による技術内容の検証を表すため、そこに
`review_kind: human` を追加しただけでは PO の要件承認とはみなさない。

要件・承認境界のauthorityは `docs/governance/helix-harness-requirements_v1.3.md` §4.9 と
L0 charter の自律境界であり、本sliceはその既存要件を実行gateへ降ろす。新しい要件の意味や
別の承認台帳は追加しない。

## §1 型付き承認

L3 PLAN が `confirmed` または `completed` へ到達する際、基準日
`2026-08-27` 以降に作成・更新されたものは、frontmatter の
`l3_human_approval` を必須とする。recordは次をすべて持つ。

- `schema_version: helix-l3-human-approval.v1`
- `approval_kind: human_po`
- `decision: approve`
- 承認者、承認時刻、対象 `plan_id`
- `approval_record_id`
- `approval_source` と `approval_source_url`

対象 `plan_id` はPLAN自身とexact一致し、schema不一致・対象違い・欠落はfail-closeする。
技術 `review_evidence` の有無、reviewer名、model名だけではこのrecordを代替できない。

## §2 移行境界

既存の基準日前に確定したL3 PLANへ、後付けの承認記録を捏造させない。基準日前の履歴は
既存証跡として保持し、以後のL3 terminal化・更新では承認recordを要求する。日付欠落・不正も
新規経路の抜け道にしない。

このsliceが検証するのは「AI技術reviewをPO承認として誤認しないこと」とrecordの型・対象束縛である。
GitHub actor／署名／sessionを用いた人間actorの真正性証明は、承認provenanceを実装する後続sliceへ
残し、本sliceで人間性を推測しない。

## §3 consumerとfailure

`review-evidence` loaderがPLAN frontmatterからtyped recordを読み、doctorの既存hard gateへ
`l3HumanApprovalViolations`として合流させる。既存の技術review、green command、session identityの
検査はそのまま維持し、どの検査も互いを相殺しない。

failure reasonは次のexact setとする。

- `missing_human_po_approval`
- `invalid_human_po_approval`

現時点ではwarningへ縮退させず、L3 terminal化をfail-closeする。
