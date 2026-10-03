# 方法

1. initial exact base `ee03352d8fc36c4e16d65f861ac9f0262b47fe87` のfresh isolated worktreeを #2033 merge後の `f8abbba3c04fbbd3e0a4787701a53d854d37b889`、さらに#2032 merge後のlatest main `c5ed4587d8563bd473368f5eb0f3c311fefb44a6` へrebaselineし、base driftをscopeへ記録した。候補source、holding、ledger、current counterpartの実測hashに変更がないことを再照合した。
2. outside67 holding 67 path_revision_pair、既済47件、未調査20件をexact ID/pathで照合し、019/022/024/041/058を選び、52/67研究会計・残15を正式holding採否から分離した。
3. pre-isolation `2d4991042be55268bac30a8bbcdac45b3865030a` とarchive `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658` の5 sourceをgit objectから静的に読み、source snapshot、pre/archive hash/blob/bytes、5本ずつのexact line anchor、current counterpart差分を保存した。
4. exact path/blob/sha relationとsemantic inclusionを別観測にし、current counterpartのpath relocation、hash equality、content driftを意味同値・authority・successorへ変換しなかった。
5. 旧asset disposition/decision/copy-read-after/decision-log/phase-product/crosswalk/product-unitの7 ledgerをfull candidate ID/path exact scanし、failure/consumer/decision evidenceをunknownのまま記録した。source fragment外のactor/action/condition/guard/sequenceを補完せず、multi-duty lineはcomposite_unresolved、四製品候補とphase/implementation/degradation/failure/consumer/decisionはunknownのまま固定した。

archive sourceは意味・判断史・failure・consumerのstatic referenceとしてのみ読み、旧workflow/runtime/test/CI/hook/adapterは実行していない。
