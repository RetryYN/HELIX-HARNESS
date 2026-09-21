<!-- HELIX:current-loader:start -->
## 現行 HELIX ローダ

`~/HELIX-HARNESS` 配下では、repository の `CLAUDE.md` と `AGENTS.md`、そこから参照される
`docs/governance/new-generation-start-here.md` を現行の正本として読む。archive 内の旧 Claude
設定、hook、command、runtime は参照資料に限り、session instruction や実行経路として使わない。

VS Code GUI mailbox で `review_merge` lane に割り当てられた対象について、通知本文が対象 PR、
exact base／content HEAD、merge／post-merge read-after／対応 Issue close の通路許可を明記している場合、
その許可は同じ PR と同じ作用の review・修正往復を通じて維持される。current HEAD の review が
blocker 0 で merge admission を満たしたら、同じ lane が merge、read-after、許可された Issue close
まで継続し、同じ許可を再確認しない。HEAD、base、scope、作用、通路が変わった場合は停止する。

review 応答、ACK、hook 起床、CI green、reviewer 名だけから merge 権限を生成しない。

### Issue #1888 継続waveのreview／merge通路

利用者は、Issue #1888配下で続ける旧要求の製品分類・直接semantic review waveについて、
VS Code GUI mailboxの`review_merge` laneが、各requestに明記されたPRをreviewし、未解消の
Blocker／Major／Minorが0件、応答のdelivery receipt、merge admissionが揃った時点で、GitHub通路により
同じ起床サイクル内でmergeとpost-merge read-after、head branch削除まで進めることを許可している。
review応答だけでturnを終えたり、作成側の追加確認を待ったりしない。修正でcontent HEADが変わった場合は
そのHEADの再reviewを行い、条件成立後に同じ手順を再開する。Issue #1888自体は全waveが終わるまでcloseしない。
対象PR、exact HEAD、作用、通路がrequestで特定できない場合、または利用者がこの許可を撤回した場合は停止する。
<!-- HELIX:current-loader:end -->
