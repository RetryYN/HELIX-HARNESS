# GitHub 運用ルール（Issue #592）

- status: current
- decided: 2026-08-12
- scope: GitHub の branch、PR admission、scope manifest、外部 author 処理
- source: [Issue #592](https://github.com/RetryYN/HELIX-HARNESS/issues/592)

## 1. 現在の決定

この文書は、HELIX-HARNESS の main 向け GitHub lane における運用判断を記録する。main は PR 経由で更新し、required check、PR context、独立 review、Issue closure の証跡を同じ PR head に結び付ける。

- GitHub native auto-merge は **2026-08-12 に有効化済み**である。admission、必要な review evidence、required CI が同一 PR head で揃った後に限り、`gh pr merge --auto --merge` を使える。
- auto-merge の有効化は admission を省略する理由にならない。CI が red、receipt が stale、PR head が変わった、または scope が実差分と一致しない場合は merge を許可しない。
- release、tag、cutover、配布先切替は、既存の action-binding approval 境界を維持する。この文書はそれらの承認を自動化しない。

### Claude authored PR の非対称性

Claude authored PR は、[Issue #514](https://github.com/RetryYN/HELIX-HARNESS/issues/514) に記録された current-head admission の非対称性により、Claude lane から直接 merge できない。この制約を author identity の書換えや架空の receipt で回避してはならない。

Claude が作成した PR は、実際の author/runtime を保持したまま Codex lane へ委譲する。Codex lane が current head の scope、CI、review receipt、closure 条件を再照合し、正規の admission 経路として ready/merge 操作を担う。

## 2. branch-kind の prefix

branch name は次の governed prefix のいずれかで始める。prefix の後には `/` と目的を表す短い名前を置く。

| 区分 | governed prefix | 扱い |
| --- | --- | --- |
| 通常の作業 | `feature/`、`design/`、`research/`、`poc/`、`reverse/`、`add/`、`hotfix/`、`refactor/`、`docs/`、`chore/` | branch-kind の対象として受理し、prefix と作業の kind を一致させる |
| automation | `codex/`、`dependabot/`、`renovate/` | automation owner の branch として受理し、PR body の author/runtime と scope を実体に合わせる |
| block | `fix/`、`work/`、`bugfix/`、未登録の prefix、prefix のない branch | unknown または許可されていない kind として fail-close する |

上表に明記されていない prefix は、名前が妥当に見えても自動的に block する。`hotfix/` と `fix/` は別の扱いであり、`fix/` を `hotfix/` の代替として使わない。

## 3. `pr-context-guard` と scope manifest

`pr-context-guard` は PR body の manifest と同じ PR head の実差分を照合する。manifest は次の **6 項目**を、指定された field name のまま記載する。

```text
## HELIX scope manifest

- Behavior contract: <1つの安定した behavior contract ID>
- Responsibility owner: <1つの責務 owner>
- Allowed path families: <狭く限定した repo-relative path family>
- Expected changed paths: <実差分と完全一致する repo-relative path の列挙>
- Required companion paths: <必須 companion path の列挙、または none>
- Scope expansion: none
```

各項目の制約は次のとおりとする。

- `Behavior contract` は PR が閉じる1つの behavior と対応させる。複数の独立目的を1つの manifest にまとめない。
- `Responsibility owner` は1つに固定する。reviewer、CI、provider名を owner の代用にしない。
- `Allowed path families` は repo-relative で、目的に必要な最小範囲に限定する。絶対 path、`..`、traversal、`*` や `**` による wildcard、空の指定、リポジトリ全体を表す root family（`.` や root 全体）は禁止する。root-level の単一ファイルを指定する場合は `CLAUDE.md` のように exact path として記載する。
- `Expected changed paths` は glob やディレクトリ名ではなく exact path の集合で記載し、PR diff の path 集合と完全一致させる。未変更 path の先行記載、manifest にない変更、重複 path を許可しない。
- `Required companion paths` は behavior contract の成立に必要な PLAN、test、design などを exact path で指定する。`src/` を1つでも変更する PR は、対応する PLAN と tests companion を実差分へ含め、manifest にも記載しなければならない。companion の省略や prose だけの代替は認めない。
- `Scope expansion` は通常 `none` とする。変更対象を後から広げる場合は、理由・承認・新しい manifest と CI/review の再実行を揃えるまで ready にしない。

この Issue の文書化 PR は、`docs/governance/github-operation-rules.md` と `CLAUDE.md` だけを変更対象とする。`src/` 変更を含まないため、source companion は発生しない。

## 4. 外部 author PR の処理手順

外部 author（Dependabot など）が作成した PR は、author/runtime を正確に保持したまま、次の順序で admission する。

1. **recreate** — provider の recreate 操作で、第三者による意図しない PR head 編集や stale な生成物を除去する。recreate 後の head SHA を記録する。
2. **manifest 追記** — PR body に6項目の `HELIX scope manifest` を追加し、allowed family と expected changed paths が実差分と一致することを確認する。
3. **draft 化して CI green** — PR を Draft にし、引用する CI run が対象 head で完了して green になるまで待つ。CI が完了する前の review receipt は有効な証跡にしない。
4. **PR head worktree で receipt seal** — PR の現在 state と `mergedAt` を先に確認し、未 merge の exact head を clean worktree で検査する。`pr-review-receipt` を seal し、実際の provider を `authorRuntime=external` として記録する。`reviewedAt` は、引用した CI run の完了後、かつ receipt comment の投稿前の時刻にする。
5. **ready → merge** — receipt comment、scope、CI、PR head、必要な Issue closure 条件が一致した後にだけ Ready にし、main の通常 merge/admission 経路へ進める。head が変わった場合は receipt と CI を stale として手順を最初から再実行する。

この手順は [PR #384](https://github.com/RetryYN/HELIX-HARNESS/pull/384) で確立した。PR #384 の receipt comment は、`authorRuntime=external`、引用 CI run、CI 完了後の `reviewedAt`、PR head と receipt digest を同じ証跡面に記録している。

## 5. fail-close 規則

- author/runtime を別の値へ置換して admission を通してはならない。外部 author は `external`、Claude author は `claude` として扱う。
- Draft、stale head、未完了または非 green の引用 CI、scope manifest と diff の不一致、root family、未知の branch prefix は ready/merge を block する。
- auto-merge が有効でも、merge queue に入った事実だけを完了証拠にしない。CI、独立 review、receipt、Issue closure の current-head 一致を確認する。
