# outside67 follow-up candidate research (034/036/046/052/056)

`origin/main`の#2017 merge後HEAD `98b5fb0f0743969835dcde7ebd00b476470a53a8`へrebaselineしたbranch worktree `research/outside67-followup-selection`で、outside67 holding 67件から未調査の5 source/path_revision_pairを静的保持するresearch Scaffoldです。既レビュー12件（008/011/030/033/043/045/055/059/063/064/065/066）とはsource ID・pathを共有しません。候補5件を加えた研究会計は17/67、残50ですが、path_revision_pair分母であり正式holding採否ではありません。

選定は034 `legacy-harness-requirements-source-crosswalk.md`、036 `new-generation-bounded-repair-source-crosswalk.md`、046 `new-generation-security-engagement-source-crosswalk.md`、052 `ai-readable-authority-requirements.md`、056 `next-generation-ci-requirements.md`です。各sourceから5本ずつ、合計25本のpre-isolation/archive exact line anchorを保持し、052のrevision line offsetも別々に記録しました。multi-duty lineの完全分解は未了なのでcomposite_unresolvedをopen questionに残しています。

pre-isolation、archive、current counterpartは別revision/観測として保持します。hash一致・不一致・path/wording driftから意味同値、relocation、authority、successor、実装成立、縮退成立、failure/consumer/decision closureを推論しません。四製品は`candidate_boundary_only`、product/phase/implementation/degradation/failure/consumer/decisionはunknownです。旧7 ledgerの選択ID/path exact hitは0件ですが、これは不在や完了の証拠ではありません。

SCF-B-0069はresearch Scaffold Bindingとして登録済みです。commit・push・PRの状態から正式holding採否は生成しません。今回の検証幅は5 source/path_revision_pairであり、安全なbatch上限は断定しません。次batchはその時点のorigin/mainからsource chainごとに独立確認します。旧archive runtime/test/CI、現行runtimeは実行していません。
