---
title: "repository hygiene read-only inventory L8単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-11
updated: 2026-09-11
owner: QA / Codex TL
plan: docs/plans/PLAN-L7-1110-repository-hygiene-inventory.md
pair_artifact: docs/design/helix/L6-function-design/repository-hygiene-inventory.md
github_issue_id: 1110
behavior_contract_id: REPOSITORY-HYGIENE-INVENTORY-001
responsibility_owner: repository-hygiene
---

# repository hygiene read-only inventory L8単体テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-RHYG-001 | reclaim候補 | cleanかつmain到達、PR／writerなしだけを`reclaim_candidate`にする | `tests/repository-hygiene-inventory.test.ts` |
| U-RHYG-002 | 保護対象 | dirty、未到達、open PR、active writerを個別reason付き`protected`にする | `tests/repository-hygiene-inventory.test.ts` |
| U-RHYG-003 | identity／外部証拠 | detachedまたはPR証拠不能を`unknown_fail_closed`にしresultを`ok=false`にする | `tests/repository-hygiene-inventory.test.ts` |
| U-RHYG-004 | 履歴／物理証拠 | shallow、cleanliness／reachability不明の複数unknown reasonを保持する | `tests/repository-hygiene-inventory.test.ts` |

実装前は対象module不在でsuiteがRedとなることを確認し、実装後は同suiteをgreenにする。今後loaderを接続する際も、
GitHub API失敗やGit command失敗を空集合へ変換せず、同じtyped unknown契約へ落とす。
