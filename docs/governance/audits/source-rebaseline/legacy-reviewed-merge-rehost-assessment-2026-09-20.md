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

| asset ID | 台帳source path（`archive/legacy-generation-2026-09-14/root/`相対） | SHA-256 | 読んだ役割 | 現在の台帳状態 |
|---|---|---|---|---|
| `LEGACY-ASSET-FA8D4E24D8399E8350F1` | `src/cli.ts` | `608660021df710e6c91239dbfbb4d23e9357d73bc0b7c9ffd5c4f5b4544f0dad` | `helix github pr-merge-reviewed --receipt`、dry-run／apply、GitHub読取り、merge、read-after | `unresolved`、`legacy_runtime_cli_or_adapter` |
| `LEGACY-ASSET-AC2078FFF049D6B56D19` | `src/runtime/claude-pr-convergence.ts` | `059f5e925c727fe8003c9e6c72b595d4697bd4d930d97a92cd4a9ee1f5ebdff8` | current HEAD、required CI、review receipt履歴、独立性、未解消blockのadmission | `unresolved`、`legacy_runtime_cli_or_adapter` |
| `LEGACY-ASSET-EA1DFC00D984068C2444` | `src/runtime/github-cross-review-admission.ts` | `dc49bad26c9ed553ce5b040e77f0c95895fad51aa0fe20aa5573360764119cc7` | merge後のstate、commit、parent、treeのread-afterとreceipt | `unresolved`、`legacy_runtime_cli_or_adapter` |
| `LEGACY-ASSET-54515309EF4528FEED70` | `src/lint/github-guards.ts` | `ce66b773779cb85340bce805b93b427772a8a30f59101780d46cd234098d1b55` | PR scope manifestの必須fieldと変更pathの境界 | `unresolved`、`legacy_runtime_cli_or_adapter` |
| `LEGACY-ASSET-0F431CE7CE360BCBB909` | `src/runtime/independent-review-fallback.ts` | `864927c4261b7a34a80c8abb73a901c44faf034cd7de06340cd62b600fbe4e15` | provider-neutral v4 receiptの検証とadvisory-only境界 | `unresolved`、`legacy_runtime_cli_or_adapter` |
| `LEGACY-ASSET-0659C4937EA6463385A0` | `src/runtime/git-command-guard-hook.ts` | `4566d6206c0c38472ea7f4e9fc44b0052795159aec0a07f4c442faa5b1c2be8b` | 単一入口外の直接`gh pr merge`を拒否するguard | `unresolved`、`legacy_runtime_cli_or_adapter` |

台帳の6資産はいずれも個別採否前である。旧runtime／CLI／adapterは完全一致再利用の対象外なので、現行pathへbyte copyしない。
意味を再導出する場合は、親要求、owner、consumer、権利、実行性、secret、外部作用を確認し、台帳と判断ログを更新してから行う。

## 旧経路がすでに持っていた契約

1. merge入口は`helix github pr-merge-reviewed --receipt`の一つで、既定はdry-run、`--apply`のときだけ書き込む。guard hookは入口外の直接`gh pr merge`とPR close／reopenを拒否し、単一入口を実行面でも強制する。この拒否はoverride対象外であり、nonce付き記録によるoverrideは別層の破壊的git操作だけに限る。
2. repository、PR番号、PR URL、review済みHEADをreceiptと現在のGitHub状態で照合する。
3. Claude専用receipt経路では、PRがopenで、review receiptがcurrent HEADへ束縛され、approveかつblocker 0であることを求める。
4. Claude専用receipt経路ではauthorとreviewerのruntimeを分け、review commentのread-after、author runtimeの実測、過去のrequest changesが後続reviewで解消されていること、CI generationを確認する。
5. provider-neutral v4 receipt経路は上記より弱く、判定理由へ常に`provider_neutral_receipt_advisory_only`を加えるためmergeを成立させない。この停止境界を維持し、他providerのreview応答からmerge authorityを生成しない。
6. Claude専用receipt経路では、CI runが同じHEAD、completed、event=`pull_request`、name=`harness-check`、successで、attempt／generationも一致することを求める。provider-neutral v4経路のCI照合はhead SHA一致とconclusion=`success`だけである。required check全件passは両経路に共通する。
7. DBが収束し、receiptがその状態へ束縛されていなければ`db_not_converged`としてmergeを拒否する。
8. 変更された計画・scope manifestとreview receiptをjoinし、対象外の変更や必要なcompanion pathの欠落を拒否する。
9. mergeは`gh pr merge --merge --match-head-commit <review済みHEAD>`でHEAD driftを拒否する。
10. merge後にPRのMERGED表示、報告されたmerge commit、review済みHEADがparentであること、candidate treeとmerge treeの一致を読み直す。
11. read-after結果をdigest付きreceiptとして保存し、不一致は`merged_unverified`として成功扱いしない。

## 現行側との対応

| 旧契約 | 現行に存在するもの | 未成立の差分 |
|---|---|---|
| exact HEAD review | GitHub上流運用モデルのexact base／content HEAD pair、review request／delivery receipt／response | canonicalな現行receipt schemaと実行commandへの接続 |
| scope manifest | PR class、対象範囲、Scaffold Binding、`scfctl stale` | 旧scope manifestとのfield対応と、どのPR classで何を必須にするかの採否 |
| required CI | `scfctl`、govcheckのローカル検査 | 新世代CIは未構築。旧`harness-check`とDB receiptを代替したと推定してはならない |
| 独立review | 作成側とレビュー対応側の分離、Claude×Codex GUI通知scaffold（PR #1885） | GUI応答をcanonical receiptへ変換する正式契約 |
| provider-neutral receipt | GUI通知で他providerの応答を運べる | 旧v4はadvisory onlyでmergeを成立させない。GUI応答を強いreceiptへ昇格する要件・独立性・認証は未成立 |
| DB収束 | 対応物なし | 旧DB停止条件を何で置換するか、またはどの判断で削除するか未確定 |
| 単一入口の迂回拒否 | 現行規則では直接mergeを禁止 | 現行`helix` commandと同時に成立する実行面のguardは未構築。直接merge／PR close／reopenをoverride不能で拒否し、破壊的git操作だけを記録付きoverrideの対象にする境界の採否も未確定 |
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

1. 上表6資産とその参照閉包の意味、failure、consumerを本評価へ固定する。
2. 資産台帳で採否を判断し、採用する資産を`semantic_rederive`としてHELIX-OSの親要求へ接続する。
3. 旧CLI名と一入口、dry-run既定、current HEAD receipt、scope、required CI、独立review、read-afterという契約を保持する。
4. 旧`harness-check`、DB receipt、Claude専用receiptは、現行の承認済み契約が成立した部分だけ差し替える。未成立部分はmissingとして止める。
5. PR #1885のGUI通知はreview transportとして接続し、merge admissionやauthorityを通知から生成しない。GUI応答がClaude専用receipt相当か、advisory-onlyのprovider-neutral receipt相当かは未成立差分として扱う。
6. 実装は現行`helix` wrapperの一commandへ置き、既存認証を使う。同時に入口外の直接mergeを拒否するguardを成立させ、guardが無い間は単一入口が未成立として止める。GitHub Appや専用OS userは、別の承認済み要求が必要とした場合だけ追加する。

## このPRでの停止位置

本PRでは参照義務を`AGENTS.md`と`CLAUDE.md`へ追加し、本評価を置くところで止める。6資産が`unresolved`で、正式なHELIX-OSの
委任authority要求もL2／L11未承認であるため、merge runtimeを新しく実装しない。この停止は機能の放棄ではなく、旧HELIXの契約を
基準にした無損失の再配置へ戻すための境界である。
