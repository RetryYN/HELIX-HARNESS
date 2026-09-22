# 状態

findings_only / authority_effect:none / meaning_change_applied:false。初期要求base `74f724b4699feca7f9f2e87e939fe6578f75669e` からmain driftを検知し、親指示で最新 origin/main `6396443e150d285b0b08edd43ea52a26f85dd434` へrebaseline済み。

003/006/009/012/014の5 source/path_revision_pairから25 exact line anchorsを静的保持した。既済32件とID/path非重複、旧7 ledger exact hit 0、研究会計37/67・残30を独立検証する。この件数は正式要求identity、四製品owner、実装・縮退状態の分母ではない。正式holding採否、product/phase authority、successor、implementation/degradation/failure/consumer/decision closureは未確定でunknownを維持する。

003/006/009はpre/archive同一内容だがcurrent counterpartへ移設・内容差分、012/014はpre/archive/current差分を観測した。これらは観測事実として別保持し、semantic equivalenceやauthorityを断定しない。

SCF-B-0076はresearch Scaffoldとして登録済み。今回の検証幅は5 source pairであり、安全なbatch上限は断定せず、次batchはsource chainごとに独立確認する。validator/selfcheckはancestor-only base gateで検証する。

stacked stop条件: このrebaseline後にorigin/mainまたはparent lineageが進んだ場合はsource選定・正式化を停止し、最新mainへの再materializationとscope/base digestの再検証を行う。silent rebase・merge・holding昇格はしない。
