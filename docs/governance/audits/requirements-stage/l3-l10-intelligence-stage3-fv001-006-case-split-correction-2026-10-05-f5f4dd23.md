# INTELLIGENCE Stage 3 FV001–006 CASE分解の作成側補正

本文revision `f5f4dd2387019e61f5b496e72e249840fcefa7f2` で、Stage 3の親001–006に対応するfunctional verification caseを分解した。以前の129はStage 3 CASE行の数であり、各行に記された変異すべてが固有ID・個別oracle・戻し先を持つことの証明ではない。この補正後はStage 3全体で168 CASE行。追加39行は親001–006だけに属する。他の親の独立negative coverageやclosureを主張しない。

001ではadd/split/merge/retire正常例を分け、identity欠落・衝突、split/merge relation欠落、履歴混同、固定enum拒否、別authority化を各CASEへ分けた。併発、未見domainの正常例、未見例のrelation局所unknownも別IDとし、domain編成へ戻す条件を記した。

002ではdomain別capability正常、根拠欠落、他domain設定の流用、unknownの暗黙true化、併発を分けた。未見domainの根拠付きsubsetと一能力だけ根拠欠落する対照を分け、該当domainのINTELLIGENCE判断設計へ戻す。

003ではrequired-source欠落、dependency revision stale、risk source conflict、dependency孤立を別IDにし、併発、未見worker/provider/environmentの正常join、dependencyだけ未取得の局所unknownを分けた。不足はそれぞれのsource ownerへ戻す。

004では仮説のFact化、source identity欠落、revision欠落、Unknownをsuccessとする変異を分けた。併発、未見evidence typeのsource-backed正常例、source locatorだけ欠ける対照も個別CASEにした。

005では未承認要求、stale要求、dependency欠落、dependency cycle、fallback欠落、current-state source欠落を個別化し、併発、未見dependencyの正常候補、stopだけ不足する局所unknownを分けた。要求・工程contract・current state不足は各sourceへ、ticket/assignmentはOSへ戻す。

006ではevidence、falsification、assumption、uncertaintyの欠落、predictionへのactual上書き、併発、current-state revision staleを分けた。未見予測対象の正常例とfalsification sourceだけ欠ける局所unknownを分け、実測はLABOへ残す。

固定L2/L11はPO採択revision `633bf12ea8f948db8ba3d6600179c4a9507377a7` から親別の物理行・raw-LF SHA付きで新JSONに固定した。承認済みmainの6文書prefixは全てbyte-identical。前回cutout監査とsummaryは変更していない。

検証: 対象57 CASE行は全て固有ID、表の6列幅を満たし、各親のAC-01/02/03を参照する。`scfctl validate` は147 bindings・fail 0、`stale=0`、`residuals=0`、`govcheck` はatoms 7622 / requirements 57 / files 58でPASS。旧runtime・旧CI・Bunは実行していない。これは作成側の静的確認であり、独立reviewやL3承認ではない。
