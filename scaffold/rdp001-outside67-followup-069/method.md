# 調査方法

1.  #2017 merge後のlatest `origin/main` `98b5fb0f0743969835dcde7ebd00b476470a53a8`へfresh worktreeをrebaselineし、pre-isolation `2d4991042be55268bac30a8bbcdac45b3865030a`とarchive `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658`の同一source pathを`git show`で静的取得した。直前基点 `38d38f47794e70d621403ad8dbeac56518a76766`からのdriftとrebaselineをscopeに記録した。
2. outside67 holding 67 path_revision_pairと、既レビュー12件および候補5件のexact ID/pathを比較し、相互非重複を確認した。研究会計は17/67、残50である。
3. 各候補から5 source lineを選び、pre/archive line number、line sha256、逐語fragmentを独立保存した。052はrevisionでline offsetが変わるため両revisionのlineを別管理した。
4. current counterpart hash/bytesとpre/archive diffを観測記録に分離した。hash/path/wordingの一致・不一致からsemantic equivalence、relocation、authority、successorを生成しなかった。
5. 旧asset disposition、decision、copy/read-after、phase/product、implementation crosswalk、IR decompositionの7 ledgerをID/path exact scanし、全候補hit 0を記録した。
6. 四製品をcandidate boundaryとして保持し、product/phase/implementation/degradation/failure/consumer/decisionはunknownとした。source line外のactor/action/condition/guard/sequenceは補完していない。
7. 旧runtime、test、CI、hook、adapter、source実行、外部API、GitHub、PR、DB操作は行っていない。検証幅は5 source pairであり、安全なbatch上限は断定していない。
