---
layer: L8
sub_doc: unit-test-design
status: draft
pair_artifact: docs/design/harness/L6-function-design/github-project-projection.md
plan: docs/plans/PLAN-L7-463-github-project-projection.md
---

# GitHub Project open work投影 テスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-GPROJ-001 | dry-run差分 | 欠落itemとStatus mismatchを決定的順序で列挙し、余剰itemを削除mutationへ変換しない | `tests/github-project-projection.test.ts` |
| U-GPROJ-002 | apply/read-back | addとStatus更新後に再取得し、一致した場合だけgreenにする | `tests/github-project-projection.test.ts` |
| U-GPROJ-003 | fail-close | mutationが無効またはread-back不一致なら`readback_mismatch`を返す | `tests/github-project-projection.test.ts` |
認証不足、option欠落、GraphQL/API failureはadapter境界で例外とし、CLI exit 1へ写像する。secret値をfixtureへ含めない。
