# 調査方法

1. requested exact base b343360a104d377e545adc404a4151d70eac024e と一致する origin/main から fresh isolated worktreeを作り、pre-isolation 2d4991042be55268bac30a8bbcdac45b3865030a と archive 064280b5c1c5c98f949e6e3be5ef87cbe4a4b658 のsource pathをgit objectから静的取得した。base driftは観測していない。
2. outside67 holding 67 path_revision_pairと、既済27件および候補5件のexact ID/pathを比較し、非重複を確認した。研究会計は32/67、残35である。
3. 各候補から5 source lineを選び、pre/archive line number、line SHA256、逐語fragmentを独立保存した。current counterpartは別path・別観測として保存した。
4. pre/archive/currentのhash、bytes、path relocation、wording driftをsource-diffsとselected-source-itemsへ分離した。差分からsemantic equivalence、authority、successor、実装成立を生成しなかった。
5. 旧asset disposition、decision、copy/read-after、phase/product、implementation crosswalk、IR decompositionの7 ledgerをID/path exact scanし、全候補hit 0を記録した。
6. 四製品をcandidate boundaryとして保持し、product/phase/implementation/degradation/failure/consumer/decisionはunknownとした。source line外のactor/action/condition/guard/sequenceは補完していない。
7. 旧runtime、test、CI、hook、adapter、source実行、外部API、GitHub、PR、DB操作は行っていない。検証幅は5 source pairであり、安全なbatch上限は断定していない。
