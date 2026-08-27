---
title: "branch audit delete-candidate安全化 L8単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-28
updated: 2026-08-28
owner: QA / Codex TL
plan: docs/plans/PLAN-L7-690-branch-audit-delete-candidate-safety.md
pair_artifact: docs/design/helix/L6-function-design/branch-audit-delete-candidate-safety.md
github_issue_id: 1110
behavior_contract_id: BRANCH-AUDIT-DELETE-SAFETY-001
responsibility_owner: branch-audit
---

# branch audit delete-candidate安全化 L8単体テスト設計

本書は、local branchの削除候補をcanonical main到達性とworktree非占有へ束縛するL6契約を、
`tests/branch-audit.test.ts`と`tests/cli-surface.test.ts`へ降ろすoracleである。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-BRAS-001 | merged candidate | main未到達またはworktree占有なら削除候補へ入れず、main到達かつ非占有だけを`delete-candidate`にする | `tests/branch-audit.test.ts` |
| U-BRAS-002 | gone evidence | goneだけでは削除候補にせず、main未到達なら`review / gone-unmerged`にする | `tests/branch-audit.test.ts` |
| U-BRAS-003 | current／protected | merge証拠があってもcurrentと保護branchを`keep`にする | `tests/branch-audit.test.ts` |
| U-BRAS-004 | worktree occupancy | merged／goneでも任意worktree占有branchを`keep`にする | `tests/branch-audit.test.ts` |
| U-BRAS-005 | missing main | unresolved時にmerged入力を採用せず、`ok=false`／`review`にする | `tests/branch-audit.test.ts` |
| U-BRAS-006 | shallow history | 不完全履歴のmerge集合を採用せず、`ok=false`／`review`にする | `tests/branch-audit.test.ts` |
| U-BRAS-007 | worktree parser | detached entryをbranchへ捏造せず、named branchだけを抽出する | `tests/branch-audit.test.ts` |
| U-BRAS-008 | CLI fail-close | main無しrepoでJSONを返してもexit 0にせず、exit 1とtyped authorityを返す | `tests/cli-surface.test.ts` |
| U-BRAS-009 | CLI正常系 | current repoでauthority fieldを欠落させず、exit 0と完全authorityを返す | `tests/cli-surface.test.ts` |
| U-BRAS-010 | design freeze trace | catalogだけ更新してfreeze pinを残さず、L6設計pathとcatalog digestを一致させる | `tests/l3-g3-freeze-packet-v2.test.ts` |

## Red／Green／mutation境界

旧実装へU-BRAS-002／004／005／006／007／008を先行適用すると、gone即削除、worktree未検査、
main authority未投影、shallow未検査、parser未実装、CLI exit未連動により6件がredとなる。
修復後はU-BRAS-001〜010をgreenにし、`gone`条件を即削除へ戻すmutation、worktree分岐を除くmutation、
resultの`ok`を定数trueへ戻すmutationを各反例が検出することを要求する。テストはbranchやworktreeを削除せず、
CLI反例は一時repositoryを作成して終了時にfixtureだけを破棄する。
