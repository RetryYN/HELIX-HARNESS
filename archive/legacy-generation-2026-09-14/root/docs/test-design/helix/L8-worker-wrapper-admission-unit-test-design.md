---
title: "worker wrapper admission L8単体テスト設計"
layer: L8
artifact_type: test_design
status: confirmed
created: 2026-08-03
updated: 2026-08-03
owner: QA
plan: docs/plans/PLAN-L5-87-worker-wrapper-admission.md
pair_artifact: docs/design/helix/L5-detail/worker-wrapper-admission.md
github_issue_id: 225
behavior_contract_id: WCC-FR-02
responsibility_owner: worker-wrapper-admission
---

# worker wrapper admission L8単体テスト設計

| oracle | 契約 | negative／mutation |
|---|---|---|
| U-WWA-001 | 正規wrapper planだけcapability発行 | plain object copyをcapability扱いするとRed |
| U-WWA-002 | raw／copy plan拒否 | object field一致だけでadmitするとRed |
| U-WWA-003 | plan digest再照合 | args改竄を許可するとRed |
| U-WWA-004 | providerを独立検証 | providerをdigest mismatchへ潰すとRed |
| U-WWA-005 | direct route拒否 | raw route許可でRed |
| U-WWA-006 | plan digest branch到達 | 比較削除でRed |
| U-WWA-007 | invocation digest branch到達 | 比較削除でRed |

全failureはexact objectで検証し、`toContain()`による文言存在だけを合格根拠にしない。
