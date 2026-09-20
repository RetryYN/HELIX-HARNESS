# 旧HELIX reviewed merge経路の再配置評価

status: reuse_assessment
authority_effect: none
target_pr: 1886
assessed_at: 2026-09-20

## 目的

PR #1886を、新しいCapability Leaseを独自開発する作業から、旧HELIXに存在したreview済みPRのmerge経路を現行HELIXへ
再配置する作業へ戻す。HELIXの現行作業は旧HELIXを捨てた新規開発ではなく、既存の意味・判断史・failure・consumerを保持しながら
最適化と拡張を行いやすい構造へ組み替える再編である。

本評価は旧runtimeを実行せず、旧資産を新世代のbaseline、oracle、fallbackにも使わない。旧契約と既知の失敗を抽出し、
現行側との差分を特定する。実装の採否、要求承認、merge authorityは生成しない。

## 参照した旧資産

| asset ID | archive相対path | SHA-256 | 読んだ役割 | 現在の台帳状態 |
|---|---|---|---|---|
| `LEGACY-ASSET-FA8D4E24D8399E8350F1` | `src/cli.ts` | `608660021df710e6c91239dbfbb4d23e9357d73bc0b7c9ffd5c4f5b4544f0dad` | `helix github pr-merge-reviewed --receipt`、dry-run／apply、GitHub読取り、merge、read-after | `unresolved`、`legacy_runtime_cli_or_adapter` |
| `LEGACY-ASSET-AC2078FFF049D6B56D19` | `src/runtime/claude-pr-convergence.ts` | `059f5e925c727fe8003c9e6c72b595d4697bd4d930d97a92cd4a9ee1f5ebdff8` | current HEAD、required CI、review receipt履歴、独立性、未解消blockのadmission | `unresolved`、`legacy_runtime_cli_or_adapter` |
| `LEGACY-ASSET-EA1DFC00D984068C2444` | `src/runtime/github-cross-review-admission.ts` | `dc49bad26c9ed553ce5b040e77f0c95895fad51aa0fe20aa5573360764119cc7` | merge後のstate、commit、parent、treeのread-afterとreceipt | `unresolved`、`legacy_runtime_cli_or_adapter` |
| `LEGACY-ASSET-54515309EF4528FEED70` | `src/lint/github-guards.ts` | `ce66b773779cb85340bce805b93b427772a8a30f59101780d46cd234098d1b55` | PR scope manifestの必須fieldと変更pathの境界 | `unresolved`、`legacy_runtime_cli_or_adapter` |

台帳の4資産はいずれも個別採否前である。旧runtime／CLI／adapterは完全一致再利用の対象外なので、現行pathへbyte copyしない。
意味を再導出する場合は、親要求、owner、consumer、権利、実行性、secret、外部作用を確認し、台帳と判断ログを更新してから行う。

## 旧経路がすでに持っていた契約

1. merge入口は`helix github pr-merge-reviewed --receipt`の一つで、既定はdry-run、`--apply`のときだけ書き込む。
2. repository、PR番号、PR URL、review済みHEADをreceiptと現在のGitHub状態で照合する。
3. PRはopenで、review receiptはcurrent HEADへ束縛され、approveかつblocker 0でなければならない。
4. authorとreviewerのruntimeを分け、過去のrequest changesが後続reviewで解消されていることをreceipt履歴から確認する。
5. receiptが示すCI runは同じHEAD、completed、success、期待するworkflowとgenerationでなければならない。required checkも全件passを求める。
6. 変更された計画・scope manifestとreview receiptをjoinし、対象外の変更や必要なcompanion pathの欠落を拒否する。
7. mergeは`gh pr merge --merge --match-head-commit <review済みHEAD>`でHEAD driftを拒否する。
8. merge後にPRのMERGED表示、報告されたmerge commit、review済みHEADがparentであること、candidate treeとmerge treeの一致を読み直す。
9. read-after結果をdigest付きreceiptとして保存し、不一致は`merged_unverified`として成功扱いしない。

## 現行側との対応

| 旧契約 | 現行に存在するもの | 未成立の差分 |
|---|---|---|
| exact HEAD review | GitHub上流運用モデルのexact base／content HEAD pair、review request／delivery receipt／response | canonicalな現行receipt schemaと実行commandへの接続 |
| scope manifest | PR class、対象範囲、Scaffold Binding、`scfctl stale` | 旧scope manifestとのfield対応と、どのPR classで何を必須にするかの採否 |
| required CI | `scfctl`、govcheckのローカル検査 | 新世代CIは未構築。旧`harness-check`とDB receiptを代替したと推定してはならない |
| 独立review | 作成側とレビュー対応側の分離、Claude×Codex GUI通知scaffold（PR #1885） | GUI応答をcanonical receiptへ変換する正式契約 |
| HEAD固定merge | 現行運用モデルのmerge直前再取得 | 現行`helix` wrapper内の単一commandは未構築 |
| merge後read-after | 現行運用モデルに責務として存在 | digest付きreceiptの現行保存先とschema |

## PR #1886で作っていたものの扱い

旧経路との差分確認より先に追加したGitHub App、専用OS user、root所有copy、sudoers、Capability Lease、独自executor、
非常経路、削除不能probeは、旧HELIXのreviewed merge経路に無かった。これらは外部監査向けの追加trust boundaryであり、
現行の最適化・拡張に必須であることを旧契約との差分から示していない。

したがってPR #1886からこれらの実装と、それらを前提にした`AGENTS.md`・GitHub運用モデルの変更を外す。
PR #1883のCapability Lease判断recordは履歴としてmainに残るが、再編したPR #1886の実装根拠には使わない。Capability Leaseを
将来再開する場合は、旧経路では満たせない具体的な要求と追加する差分を改めて示す。

## 再配置の順序

1. 上表4資産の意味、failure、consumerを本評価へ固定する。
2. 資産台帳で採否を判断し、採用する資産を`semantic_rederive`としてHELIX-OSの親要求へ接続する。
3. 旧CLI名と一入口、dry-run既定、current HEAD receipt、scope、required CI、独立review、read-afterという契約を保持する。
4. 旧`harness-check`、DB receipt、Claude専用receiptは、現行の承認済み契約が成立した部分だけ差し替える。未成立部分はmissingとして止める。
5. PR #1885のGUI通知はreview transportとして接続し、merge admissionやauthorityを通知から生成しない。
6. 実装は現行`helix` wrapperの一commandへ置き、既存認証を使う。GitHub Appや専用OS userは、別の承認済み要求が必要とした場合だけ追加する。

## このPRでの停止位置

本PRでは参照義務を`AGENTS.md`と`CLAUDE.md`へ追加し、本評価を置くところで止める。4資産が`unresolved`で、正式なHELIX-OSの
委任authority要求もL2／L11未承認であるため、merge runtimeを新しく実装しない。この停止は機能の放棄ではなく、旧HELIXの契約を
基準にした無損失の再配置へ戻すための境界である。
