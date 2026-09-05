---
title: "branch入力authorityの実Git反例"
layer: L7
status: draft
plan: docs/plans/PLAN-RECOVERY-935-branch-authority-input.md
pair_artifact: docs/design/helix/L6-function-design/branch-kind-authority-input.md
created: 2026-09-05
updated: 2026-09-05
---

# 実Git入力からの検証

本書は検証設計候補であり、全oracleの実装・検証完了を意味しない。
一時repositoryをfixtureごとに分離し、実commitと明示base／candidateを使用する。
fixtureのGit操作結果をmockして正常に見せず、失敗注入が必要な箇所だけ明示adapterを用いる。

| Oracle | 正例 | 反例・禁止事項 |
| --- | --- | --- |
| U-BRAUTH-001 | clean branchのcommit済みPLANを認識する | statusだけへ退行するとmissing PLANで失敗 |
| U-BRAUTH-002 | committed＋staged＋unstaged＋untrackedの重複なしunion | 一系統欠落、二重計上、明示空集合のfallbackを拒否 |
| U-BRAUTH-003 | explicit base／candidateを使用する | wrong/missing base、曖昧merge-base、別remoteへのfallbackを拒否 |
| U-BRAUTH-004 | 非Git consumerは理由付きnot_applicable | Git権限／object障害を対象外やokへ丸めるmutationを拒否 |
| U-BRAUTH-005 | detached候補も明示branchで検査する | branch未解決、shallowでbase欠落、HEAD driftを拒否 |
| U-BRAUTH-006 | Unicode／空白／rename／deleteを実Gitから取得する | quote誤読、削除PLANの現在file読込、unsafe pathを拒否 |
| U-BRAUTH-007 | superseded_by-onlyを同一baseで比較する | candidateとの差が消える別baseで許可するmutationを拒否 |
| U-BRAUTH-008 | 同一snapshotのCLI／doctorでPLAN集合・findingが一致 | CLIだけの再取得、stale snapshot、未検証changed path上書きを拒否 |

## 受入境界

### PR contextによるlocal入力供給（局所検証・全体検収は後続）

同一repositoryのopen PRとlocal HEAD／branchが一致する実Git fixtureを正例とする。
取得adapterの応答だけを注入し、実Gitのcommit実在性検証は置換しない。
全snapshot引数未指定の場合のみproviderが呼ばれること、一部指定・不正な明示値では
provider呼出しが0であることを確認する。閉じたPR、別repository、fork取り違え、
wrong branch、未push HEAD、取得中HEAD変更、不正JSON、timeoutを個別に拒否する。
providerなし／PRなしの失敗を正常化せず、明示snapshotの既存正例も維持する。
実CLIの引数なし経路と明示経路を比較するまで、local doctor接合の完了を宣言しない。

### 実GitHub読取による局所確認（2026-09-05）

PR #1554の公開HEAD `b953bc67452dfff3fb2e242e6cd231f0994ed711` と同名branchへ
固定した一時cloneで、作業中CLIの `guard branch-kind --json` を引数なしで実行した。
GitHubの実PR応答を読み、exit 0、`kind: recovery`、`findings: []` を確認した。
対して、未pushの作業HEAD `c2ed2e912` では同じ入口がexit 1となり、
`branch_authority_unavailable`／`branch_snapshot_required` を返した。
公開PRのHEADをlocal候補へ偽装して通す挙動は確認されていない。
これは未commitのCLI変更による局所実測であり、exact-HEADレビュー証跡、doctor全体、
PR作成前／offline経路の検収を代替しない。

`U-BRAUTH-009`ではLinux workflowのshell本文を実行し、schedule／manualの空before、
pushのzero／通常before、PRの空／zero base、不正な明示baseを両stepで照合する。
最終CLI呼出しはbase観測用関数へ置換するため、このoracleだけでCLI admission成功は主張しない。
実CLIの拒否判定は`U-BRAUTH-008`と組み合わせ、GitHub実runは別途検収する。

`U-BRAUTH-006`はcommit済みPLAN削除に加え、新規PLANをstage後に作業treeから削除した
相殺ケースも検証する。どちらも削除pathを保持し、`available`かつPLAN集合は空、
分類結果は`missing_plan`となることを要求する。

以下は実装済みの局所検証との対応である。上表の複合条件をすべて検収済みとは扱わない。

`U-BRAUTH-012`は不正repository／不正SHA／空branch／detached HEADに対して
`readPr`呼出し0回を要求する。拒否結果だけでなく外部読取前の検査順を検証する。
`U-BRAUTH-013`は`doctor --scope toolchain`で代替ghの呼出し0回を要求し、
通常doctor／reviewのbranch検査が維持されることも同じfixtureで検証する。

| U-ID | 対象 | 反例と期待結果 | test citation |
| --- | --- | --- | --- |
| U-BRAUTH-013 | CLIのPR取得 | 実CLIと代替ghを使い、明示hostname／repository、単一PR、部分引数時の呼出し0、不正JSON／複数PR／差分偽装拒否を検査する。実GitHub取得とdoctor全体の成功は別検収 | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-012 | PR入力provider | 注入したPR応答を実Git loaderへ渡す正例と、repository／branch／HEAD不一致、取得中の実ref変更、入力引数改変を検査する。ネットワーク取得とCLI自動配線は未検証 | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-010 | merge-base一意性 | 実criss-cross履歴の2件のbaseを拒否し、単一baseは受理する | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-011 | snapshot整合 | diff取得直後の実HEAD変更を拒否する | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-001 | commit済みPLAN | clean treeでもcandidateのPLANを認識する | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-002 | 作業差分 | staged／unstaged／untrackedを欠落・重複なく取得する | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-003 | base identity | 存在しない明示baseを別baseで相殺しない。実criss-cross履歴の2件のmerge-baseを拒否し、同じfixtureの単一merge-baseは受理する | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-004 | 適用対象 | 非Git consumerの明示対象外を表示し、Git repositoryと不存在pathの対象外偽装を拒否する | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-005 | branch identity | 作業branch偽装と未解決HEADを拒否し明示detached候補を維持する。diff取得直後の実HEAD変更を注入し読込途中のdriftを拒否する | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-006 | PLAN削除 | Gitの削除事実を取得障害と混同せずmissing_planへ渡す | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-007 | supersession比較 | 同じbaseに対しcandidate-onlyの許可へ作業tree本文を混入させない | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-008 | CLI／doctor入口 | 同じsnapshotで正常判定が一致し、CLIの差分偽装とdoctorの取得不能を拒否する | `tests/branch-kind-authority-input.test.ts` |
| U-BRAUTH-009 | CI配線 | guardとdoctorのbase／candidate／branch束縛欠落を各mutationで拒否する | `tests/harness-check-workflow.test.ts` |

専用`tests/branch-kind-authority-input.test.ts`で001〜007を実装する。
008は実CLI入口とdoctor入口を経由して比較し、pure analyzerだけの比較で代替しない。
既存branch種別テスト、TypeScript型検査、current HEADの独立reviewとCIを別途必要とする。
修正前Red、修正後Green、mutation、main read-afterが揃うまで復旧完了を主張しない。
