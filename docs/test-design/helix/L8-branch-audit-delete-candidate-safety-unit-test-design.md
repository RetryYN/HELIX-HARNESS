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

| U-ID | 対象 | 正例 | 反例／mutation | 実行先 |
|---|---|---|---|---|
| U-BRAS-001 | merged candidate | main到達かつ非占有を`delete-candidate`にする | merge済みbranchをactiveへ落とす | `tests/branch-audit.test.ts` |
| U-BRAS-002 | gone evidence | goneかつmain到達を`gone-merged`にする | goneだけで削除候補にする | 同上 |
| U-BRAS-003 | current／protected | currentと保護branchを`keep`にする | merge証拠で保護を上書きする | 同上 |
| U-BRAS-004 | worktree occupancy | 任意worktree占有を`keep`にする | merged／goneで占有を相殺する | 同上 |
| U-BRAS-005 | missing main | unresolvedを`ok=false`／`review`にする | merged入力を信じて削除候補にする | 同上 |
| U-BRAS-006 | shallow history | shallowを`ok=false`／`review`にする | 不完全履歴のmerge集合を採用する | 同上 |
| U-BRAS-007 | worktree parser | named branchを抽出する | detached entryをbranchへ捏造する | 同上 |
| U-BRAS-008 | CLI fail-close | main無しrepoでexit 1とtyped authorityを返す | JSONを返してexit 0にする | `tests/cli-surface.test.ts` |
| U-BRAS-009 | CLI正常系 | current repoでexit 0と完全authorityを返す | authority fieldを欠落させる | 同上 |
| U-BRAS-010 | design freeze trace | L6設計pathとcatalog digestを一致させる | catalogだけ更新しfreeze pinを残す | `tests/l3-g3-freeze-packet-v2.test.ts` |

## Red／Green／mutation境界

旧実装へU-BRAS-002／004／005／006／007／008を先行適用すると、gone即削除、worktree未検査、
main authority未投影、shallow未検査、parser未実装、CLI exit未連動により6件がredとなる。
修復後はU-BRAS-001〜010をgreenにし、`gone`条件を即削除へ戻すmutation、worktree分岐を除くmutation、
resultの`ok`を定数trueへ戻すmutationを各反例が検出することを要求する。テストはbranchやworktreeを削除せず、
CLI反例は一時repositoryを作成して終了時にfixtureだけを破棄する。
