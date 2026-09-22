# 調査方法

1. origin/mainから作ったfresh detached worktreeを用い、作業中のbase drift（685c69c3→af288f397→b6b4215bc）についてselected inputの不変を各回確認してb6b4215bcへ明示再baselineした。現行registerの `MPR-SH-OUTSIDE67-001` を固定した。source holding 67行を全走査し、path prefix／reported scopeがHELIX-WebとHELIX-Web-OSのL2候補となるPATH-011／PATH-008を選択した。
2. 各pairのpre-isolation／archive commitから同じsource pathを `git show` で静的取得し、holding記録のblob OID、SHA-256、bytes、relation、line countと照合した。
3. source blobを一要求にせず、frontmatter／表／要求row／境界説明をspanへ分けた。複数義務を含むL2要求rowはactor／action／condition／negative／sequenceの逐語fragment単位へ分割し、同一lineのcoverageを一回だけ集計した。安全に独立できない表・metadata・境界は `composite_unresolved` とし、atomized完了数から除外した。
4. 各spanへpre／archiveのexact text、line digest、候補kind、逐語source_fragment、actor／action／condition／negative／sequence、四製品候補、旧phase候補、unknown statusを付けた。Web↔Web-OS、Web-OS↔HELIX-OSの接続候補は未確定のまま保持した。
5. 109 atomized candidatesを再監査し、`source_support`のactor／action／condition／guard／sequence各値をfragment内または同一source lineのexact inherited predicate spanへ照合した。列挙語に共有される述語は`inherited_predicate`のpre-isolation／archive位置とline digestを保持してfragment＋述語を復元し、action 53件、condition 16件を継承述語付きでsource-supportedへ戻した。fragment自身のdirect action 40件、direct condition 21件も保持した。行全体にない生成guardは削除し、actor／sequenceや責務の補完だけを`candidate_inference`へ残した。13 `composite_unresolved`はsource_supportも推論も未確定のままにした。
6. validatorはsource textを編集せず、selfcheckは改変時に閉じるべき境界を検査した。
