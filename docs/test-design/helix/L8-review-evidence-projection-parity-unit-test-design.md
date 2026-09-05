---
title: "review-evidence projection 環境非依存化 L8単体テスト設計"
layer: L8
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: QA
plan: docs/plans/PLAN-RECOVERY-1548-review-evidence-projection-parity.md
pair_artifact: docs/design/helix/L6-function-design/review-evidence-projection-parity.md
---

# review-evidence projection 環境非依存化 L8単体テスト設計

本 pair の oracle は `tests/review-evidence-projection-parity.test.ts` に置く。fixture は一時 git repo
（`git init` → PLAN 1 本 + `.gitignore` を commit）で、実 repository の green 状態に依存しない。

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-REVPAR-001 | untracked runtime locator の決定性 | `.helix/harness.db`（gitignore 済み）を置く前後で `review-evidence-projection` の findings が変わると red。期待は両方とも `green-command-evidence-untracked` 1 件 | `tests/review-evidence-projection-parity.test.ts` |
| U-REVPAR-002 | tracked 集合による分類 | 未 commit path は存在しても `untracked`、commit 後は finding 0、tracked かつ削除で `missing`。この遷移のどれかが崩れると red | `tests/review-evidence-projection-parity.test.ts` |
| U-REVPAR-003 | 非 git root の fallback | git の無い root で従来の `missing` 判定に戻らないと red | `tests/review-evidence-projection-parity.test.ts` |
| U-REVPAR-004 | index と HEAD の区別 | `git add` のみの path が tracked 扱いになる（`git ls-files` を正本にする）と red | `tests/review-evidence-projection-parity.test.ts` |
| U-REVPAR-005 | HEAD tree 取得失敗の fail-close | unborn HEAD の git repo で `existsSync` へ戻り rebuild が成功すると red。期待は `tracked path set unavailable … ls-tree HEAD failed` で rebuild が例外 | `tests/review-evidence-projection-parity.test.ts` |
| U-REVPAR-006 | receipt 全体の別 root parity | 同一 HEAD の clean clone と `.helix/harness.db` ありの clone で `projection_digest` / `checkpoint_digest` / `replay_projection_digest` / `receipt_digest` のいずれかが違うと red | `tests/review-evidence-projection-parity.test.ts` |
| U-REVPAR-007 | git 障害の非 git 同一視禁止 | exec を注入し、ENOENT・dubious ownership・rev-parse 異常出力で null を返す（暗黙 fallback）と red。`not a git repository` だけが null | `tests/review-evidence-projection-parity.test.ts` |

## mutation 実測記録

origin/main 版 `src/state-db/projection-writer.ts` を一時的に配置して同 test を実行し、
U-REVPAR-001 / 002 / 004 / 005 / 006 の 5 件が red（003 のみ pass）となることを 2026-09-05T03:14:16Z に
実測した後、修正版で 7 passed（03:16:16Z）へ遷移した。U-REVPAR-007 は Codex の関数レベル fault injection
（ENOENT / dubious ownership で null が返る）の指摘を受けて追加した oracle であり、初版実装（rev-parse の
catch を無条件で null）では red になる反例を含む。

U-REVPAR-006 の fixture には receipt verifier が repoRoot から読む `docs/governance/l3-g3-logical-db-bootstrap-policy.json`
と `src/doctor/l3-g3-logical-db-receipt.ts` を同梱する必要がある。実 repository でも同一 HEAD で
`.helix/harness.db` の有無により projection digest `6d24b2a4…` が一致することを別途実測している。
