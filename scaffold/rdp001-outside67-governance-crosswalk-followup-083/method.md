# 方法

1. requested exact base `1db1e9d78b9cb552394c647145343704efffe529` のfresh isolated worktreeを、#2030 merge後のlatest main `3184d6131a7c8aecc21c1544ec7882c2ef94f033` へrebaselineし、base driftをscopeへ記録した。候補source、holding、ledger、current counterpartの実測hashに変更がないことを再照合した。
2. outside67 holding 67 path_revision_pair、既済42件、未調査25件をexact ID/pathで照合し、016/020/023/038/062を選び、47/67研究会計・残20を正式holding採否から分離した。
3. pre-isolation `2d4991042be55268bac30a8bbcdac45b3865030a` とarchive `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658` の5 sourceをgit objectから静的に読み、source snapshot、pre/archive hash/blob/bytes、5本ずつのexact line anchor、current counterpart差分を保存した。
4. 旧asset disposition/decision/copy-read-after/decision-log/phase-product/crosswalk/product-unitの7 ledgerをfull candidate ID/path exact scanし、failure/consumer/decision evidenceをunknownのまま記録した。
5. source fragment外のactor/action/condition/guard/sequenceを補完せず、multi-duty lineはcomposite_unresolved、四製品候補とphase/implementation/degradation/failure/consumer/decisionはunknownのまま固定した。

archive sourceは意味・判断史・failure・consumerのstatic referenceとしてのみ読み、旧workflow/runtime/test/CI/hook/adapterは実行していない。
