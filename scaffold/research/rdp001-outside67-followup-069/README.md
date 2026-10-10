# outside67 follow-up candidate research (034/036/046/052/056)

`origin/main`の#2017 merge後HEAD `98b5fb0f0743969835dcde7ebd00b476470a53a8`へrebaselineしたbranch worktree `research/outside67-followup-selection`で、outside67 holding 67件から未調査の5 source/path_revision_pairを静的保持するresearch Scaffoldです。既レビュー12件（008/011/030/033/043/045/055/059/063/064/065/066）とはsource ID・pathを共有しません。候補5件を加えた研究会計は17/67、残50ですが、path_revision_pair分母であり正式holding採否ではありません。

選定は034 `legacy-harness-requirements-source-crosswalk.md`、036 `new-generation-bounded-repair-source-crosswalk.md`、046 `new-generation-security-engagement-source-crosswalk.md`、052 `ai-readable-authority-requirements.md`、056 `next-generation-ci-requirements.md`です。各sourceから5本ずつ、合計25本のpre-isolation/archive exact line anchorを保持し、052のrevision line offsetも別々に記録しました。multi-duty lineの完全分解は未了なのでcomposite_unresolvedをopen questionに残しています。

pre-isolation、archive、current counterpartは別revision/観測として保持します。hash一致・不一致・path/wording driftから意味同値、relocation、authority、successor、実装成立、縮退成立、failure/consumer/decision closureを推論しません。四製品は`candidate_boundary_only`、product/phase/implementation/degradation/failure/consumer/decisionはunknownです。旧7 ledgerの選択ID/path exact hitは0件ですが、これは不在や完了の証拠ではありません。

SCF-B-0069はresearch Scaffold Bindingとして登録済みです。commit・push・PRの状態から正式holding採否は生成しません。今回の検証幅は5 source/path_revision_pairであり、安全なbatch上限は断定しません。次batchはその時点のorigin/mainからsource chainごとに独立確認します。旧archive runtime/test/CI、現行runtimeは実行していません。

## 固定入力の再照合（2026-10-10）

期待register digest `79c1e5a…fbcd` と一致する1c276ab26dc50ca5d0f2d8c25441f17c303b9919の637行・45 holding captureへ読取先とBindingを結び、後続の現在台帳appendを過去研究へ混ぜない。当初baseと後続の入力digest更新は同一時点ではない。旧holdingと3 ledgerのlogical pathは保持し、実際の読取先だけ既決legacy-migration配置へ対応づけた。 selfcheckの成果物pathは現行scaffold/research/配置へ訂正した。候補JSON/JSONL・unknown・未調査残差は保持し、これらの検証から要求採択・authority・正式successor・全consumer closureを生成しない。以前のholding数の時間的照合と研究全体のclosureは未完として保持する。

追加の入力照合でPATH-052/056のcounterpart pathが現在は存在しないことを確認した。保存済みdigestに一致する旧候補本文（052:3969a2f8、056:469870d3）を同一bytesの歴史snapshotへ保全して比較入力へ束縛する。元候補を現在の要求へ復活させず、当時の比較記録としてのみ保持する。
