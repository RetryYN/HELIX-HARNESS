# 調査方法

1. #2020 merge後latest origin/main 95ba7e1813116632fd68ab3dcfc3b52ef18712b1からfresh isolated worktreeを作り、pre-isolation 2d4991042be55268bac30a8bbcdac45b3865030aとarchive 064280b5c1c5c98f949e6e3be5ef87cbe4a4b658のsource pathをgit objectから静的取得した。直前基点 cbee6b056c5132e178392b0a9a4e7a5ebcb9085aからのmain driftとrebaselineをscopeへ記録した。
2. outside67 holding 67 path_revision_pairと、#2020までの既済22件および候補5件のexact ID/pathを比較し、非重複を確認した。研究会計は27/67、残40である。
3. 各候補から5 source lineを選び、pre/archive line number、line SHA256、逐語fragmentを独立保存した。060はpre/archiveの行移動を別anchorとして記録した。current counterpartは別path・別観測として保存した。
4. pre/archive/currentのhash、bytes、path relocation、wording driftをsource-diffsとselected-source-itemsへ分離した。差分からsemantic equivalence、authority、successor、実装成立を生成しなかった。
5. 旧asset disposition、decision、copy/read-after、phase/product、implementation crosswalk、IR decompositionの7 ledgerをID/path exact scanし、全候補hit 0を記録した。
6. 四製品をcandidate boundaryとして保持し、product/phase/implementation/degradation/failure/consumer/decisionはunknownとした。source line外のactor/action/condition/guard/sequenceは補完していない。
7. 旧runtime、test、CI、hook、adapter、source実行、外部API、GitHub、PR、DB操作は行っていない。検証幅は5 source pairであり、安全なbatch上限は断定していない。
