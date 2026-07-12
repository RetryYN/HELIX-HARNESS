---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/closure-authority-production-route.md
plan: docs/plans/PLAN-L6-74-closure-authority-production-route.md
---

# closure authority本番経路 機能設計

## 1. 問題と境界

`buildClosureAuthorityBackfill`とreview/apply verifierは存在するが、current mainから初回bundleを作るpublic loaderとCLIがない。
加えて設計指定の`docs/governance/closure-gate-allowlist.yaml`が未配置である。このため既存CLIはempty registryを
直接分類し、362件すべてを`human_only / authority absent`として返す。proposalの6分類とは別経路であり、収束を開始できない。

本設計は初回bundle生成だけを追加する。registry適用、closure status、approval、不可逆actionは変更しない。

## 2. runとwindowの型

`buildCurrentClosureAuthorityBackfillRun(input) => ClosureAuthorityBackfillRun`を正規contractとする。

- runはcurrent review scopeの全候補をexactly-once、同順序で保持し、`total_candidates`、`scope_digest`、
  `candidate_plan_ids`、全件`bundle`、`windows[]`、`run_digest`を返す。
- `bundle`は全候補のdecision保存則を担う。`windows[]`は実行資源のpartitionであり、bundleを部分化しない。
- 各windowは連続する最大100件の`start`、`end_exclusive`、`plan_ids`、`window_digest`を持つ。
  windowの連結は全candidate列と完全一致し、欠落、重複、並べ替え、空windowを拒否する。
- review/applyはrun全体のbundle digestと、対象window digestの両方へ束縛する。初回生成と再検証は同じ
  `buildCurrentClosureAuthorityCandidate`を共有し、verifier専用のlogic forkを作らない。

## 3. source来歴

production loaderはnetwork fetchを行わない。入力`expected_head_sha`を必須とし、次をすべて要求する。

- `HEAD`、local tracking ref `refs/remotes/origin/main`、`expected_head_sha`が同じ40桁SHAである。
- tracking ref欠落、detached HEAD、別branch、default branch名の曖昧化はfail-closeする。remote鮮度は呼出前の
  `git fetch origin main`証跡の責務であり、loaderはlocal ref一致だけを正直に記録する。
- PLAN、L8、test、parent design、registry、allowlistは`git cat-file -e <head>:<path>`でtracked HEAD blobを確認し、
  filesystem bytes digestとblob digestをexact joinする。
- index差分、tracked worktree差分、untracked pathを一件でも認めない。ignored pathはsource setとして列挙せず、
  tracked canonical pathとのcase-fold collision、symlink ancestry、submodule path、絶対path、`..`を拒否する。

## 4. canonical許可リスト

pathは`docs/governance/closure-gate-allowlist.yaml`へ固定する。schemaは
`closure-gate-allowlist.v1`、unknown field禁止、gate ID一意、`command_id`とargv-free canonical commandを必須とする。
caller path、PLAN prose、review text、green commandからgate authorityを生成しない。missing/invalid/untracked/symlink/
HEAD driftはtyped error codeで全runを失敗させる。

## 5. public APIとCLI

- public exports: `buildCurrentClosureAuthorityCandidate`、`loadCurrentClosureAuthorityBackfillInput`、
  `buildCurrentClosureAuthorityBackfillRun`。CLIとverifierはこの3つだけをcomposeする。
- CLI: `helix closure authority-backfill --dry-run --from-db --expected-head <sha> --json`。
  `--dry-run`と`--from-db`と`--expected-head`を必須とし、未知option、DB欠落、schema未migrationをexit 2で拒否する。
- stdoutは単一JSON document、診断はstderr、成功exit 0、contract/input errorはexit 2、内部errorはexit 1とする。
- 本sliceは`--out`を提供しない。stdout bundleの保存・review receipt・applyは後続の既存transaction routeが担う。
- CLIはregistry、PLAN、test、DB、closure status、approval、evidence directoryを一切変更しない。

## 6. Vペア

`docs/test-design/harness/closure-authority-production-route.md`の`U-CABF-011..018`を正本oracleとする。
