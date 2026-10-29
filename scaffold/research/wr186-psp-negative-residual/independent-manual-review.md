# F03/F05独立手動導出の記録（L9 PR-A範囲）

## 方法

別workerがcandidate manifestを見る前に、固定main `821a655ad6949b2a7a5344b26e3c170cccc353a6` のL3/L4/L5と固定raw snapshot `ed3981e7b9419d796adf1981f8990c6b626ecabe` のL9 `raw_utf8` から、F03 14件とF05 8件を手動で独立導出した。ここではPR-Aの `design_verification` V-pair（HARNESS L4/L9）に対応するL9側の結論と入力根拠だけを記録する。L9の既存 `expected_material` は導出根拠に使っていない。

元メモSHA-256はF03 `181c85c63c6e286830e71b3d6bf0c7d62df9b581f163226b047df62a6e98c619`、F05 `35dbf7772bd15adcfe31c99e3e4488cf7d6b1cfaa943c35342e7291800710baf`。元メモは当時の独立照合結果の識別用digestとして示し、PR-AではそのうちL9側の結果だけを候補へ記録する。

## F03: 14件

根拠はL3 `HARNESS-L3-003-F03`、L4 `/contracts/3` と対応classification、L5 `/functions/3/failure_output_contract` および `/failure_rules/19..22`。canonical pairはL8↔L5、L9↔L4、L10↔L3。L9 ordered finding候補は、元trace欠落1件で `F03_REQUIRED_PAIR_MISSING`、L9観点の欠落10件で `F03_L9_DIMENSION_UNKNOWN`、wrong-layer pair 3件で `F03_REQUIRED_PAIR_MISSING` の後に `F03_PAIR_SCOPE_CONFLICT`。

固定rawごとに提示pair・trace・10観点・ticket/Reverse作用の有無を上流の条件に照らした。case ID、L9 raw SHA-256、L9 `base_case_ref`/`mutation` pointer、発火・非発火ruleと出力候補は [`manual-projection-candidates.json`](manual-projection-candidates.json) に記録した。

## F05: 8件

根拠はL3 `HARNESS-L3-003-F05`、L4 `/contracts/5` と `/contracts/5/negative_classifications/0..4`、L5 `/functions/5/failure_output_contract` と `/failure_rules/23..27`。各rawではPort必須観測の1項目だけがnull、定義seq `0` は開発開始seq `1` より前。他のrequired observationは存在する。

8件とも独立導出は `F05_REQUIRED_PORT_FIELD_MISSING` のみ。操作選択はfalseで、未決authorityを実操作許可にせず、戻り先null・Reverse未実行を保持し、恒久対策・backfill・Issue closeを成立させない。よって残る4 ruleは発火しない。L9 raw hash、`base_case_ref`/`mutation` pointer、ruleごとの照合とordered finding候補は [`f05-single-finding-candidates.json`](f05-single-finding-candidates.json) に保存した。

## 限界

これは固定文書・source pointer・raw bytesと手動rule照合の記録であり、関数実行、製品test、checker合格、freezeを意味しない。既存期待・182件のcase populationは変更しない。175件の未形成caseは残る。
