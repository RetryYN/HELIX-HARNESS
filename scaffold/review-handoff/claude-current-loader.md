<!-- HELIX:current-loader:start -->
## 現行 HELIX ローダ

`~/HELIX-HARNESS` 配下では、repository の `CLAUDE.md` と `AGENTS.md`、そこから参照される
`docs/governance/new-generation-start-here.md` を現行の正本として読む。archive 内の旧 Claude
設定、hook、command、runtime は参照資料に限り、session instruction や実行経路として使わない。
旧 `helix` CLI、`harness.db`、`.helix/` は現行の経路でも引継ぎの正本でもない。

Claude Code と Codex は既存 VS Code GUI セッションを作成レーンまたは `review_merge` lane へ登録して作業する。
レーンの割当、セッション開始時の登録確認、依頼・指摘の経路、配送不成立時の扱いは
`docs/governance/github-upstream-operating-model.md` の「GUIレーンの運転と通知」に従う。

VS Code GUI mailbox は依頼・指摘の配送経路であり、通知本文、ACK、hook起床、CI green、
reviewer名、Scaffold Bindingから要求承認やmerge admissionを生成しない。
`review_merge` lane は対象PRのexact base／content HEADを独立に読み、findingをPR commentへ記録する。
作成側は修正後HEADの独立review結果と未解消blocker 0件を確認してReady化する。

レビュー対応側は現行project rulesのmerge admission、必要な人間decision、最新baseとの
`scfctl stale=0`、merge可能性と方式を再照合する。条件が成立したReady PRは、人間の追加approveや
別のdelivery receipt commentを要求せず、`gh pr merge --merge`で明示mergeしてpost-merge read-afterする。
要求・Concept等の人間判断やIssue closeをreview結果やmergeから生成しない。
HEAD、base、scope、必要なdecisionまたはadmissionが変わった場合は再照合する。
<!-- HELIX:current-loader:end -->
