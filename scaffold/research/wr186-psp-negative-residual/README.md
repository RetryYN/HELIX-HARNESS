# WR186 process-state-port L9負例監査候補

## PR-Aの範囲

PR classは `design_verification`、対象V-pairは **HELIX-HARNESS L4/L9**。このcandidateはL9監査記録と共有scaffold evidenceに限定し、L9の既存expected、case population、checker marker、formal projection row、freezeを変更しない。F03 14件とF05 8件、合計22件の固定入力根拠・L3/L4/L5照合を保持する。L9の出力は監査候補であり、製品実行・test・checker合格ではない。

共有証拠は [SCF-B-0174](../../bindings/SCF-B-0174.json) に登録した。後続PR-Bでは同じ証拠ファイルを再配置・複製せず、必要な層側の参照だけを追加する。

## F03 14件

入力刺激は固定L9 raw snapshot `ed3981e7b9419d796adf1981f8990c6b626ecabe` の `docs/helix-harness/L9-integration-verification/process-state-port.json` にあるcase-specific `independent_source_packet.raw_utf8`。L9各case自身の `base_case_ref` と `mutation` を入力由来として記録する。既存 `expected_material`、`negative_class_assignment`、checker出力からfindingを導いていない。

L3 `/requirements/66/obligation`、L4 `/contracts/3` と対応classification、L5 `/functions/3/failure_output_contract` および対応failure rulesから、ruleの発火・非発火とL9 ordered finding候補を手動で照合した。trace欠落1件、観点欠落10件、wrong-layer pair 3件。wrong-layer pairでは `F03_REQUIRED_PAIR_MISSING` と `F03_PAIR_SCOPE_CONFLICT` の両方を順序どおり保持する。各入力hash、raw pointer、L9 mutation pointer、発火・非発火rule、出力候補は [`manual-projection-candidates.json`](manual-projection-candidates.json) に一度だけ記録した。

## F05 8件

固定raw snapshotは同じrevisionのL9 `raw_utf8`。8件とも必須Port観測のうち対象1項目がnull、定義seq `0` が開発開始seq `1` より前である。L3 `/requirements/68/obligation`、L4 `/contracts/5`、L5 `/functions/5/failure_output_contract` と `/failure_rules/23..27` に照らし、対象必須field欠落ruleのみを発火候補とし、他ruleを発火させない理由を共有記録に保持する。L9自身の `base_case_ref` と `mutation` を維持し、L9候補出力を [`f05-single-finding-candidates.json`](f05-single-finding-candidates.json) に記録した。

## 独立照合と境界

別workerは候補を見る前に、L3/L4/L5および固定raw snapshotからF03 14件・F05 8件を独立に手動導出し、22件すべてでL9候補と照合した。独立記録の日本語要約は [`independent-manual-review.md`](independent-manual-review.md)、元メモSHA-256はF03 `181c85c63c6e286830e71b3d6bf0c7d62df9b581f163226b047df62a6e98c619`、F05 `35dbf7772bd15adcfe31c99e3e4488cf7d6b1cfaa943c35342e7291800710baf`。

監査候補22件をformal projection rowまたは全体coverageへ昇格させない。process-state-portのnegative populationは182件で、175件は未形成のまま残る。

## 現行checkerの前後比較とfreeze

`design_verification_checker.py check-child` をmain `821a655ad6949b2a7a5344b26e3c170cccc353a6` のbaseと、この候補で同じ4つの明示path（L4/L9/L5/L8）を指定して比較した。両方の出力でL4↔L9とL5↔L8のpairはPASS、ownership caps 4件とpin 4件もPASS。negative 4-wayは両方 `L4=34, L9=182, L8=0, L5=34; matched=0` で223 FAIL、failure detail配列も完全一致した。全体checker結果は223 FAILを含むためFAILのままで、候補22件を4-way coverageへ算入しない。

`docs/governance/audits/tdd` をprocess-state-portのpathとHARNESS-L4/L5/L8/L9-003-F03/F05 IDで照合したが、対象pairのfreeze recordは見つからなかった。よってfreeze前後比較の対象はなく、この候補からfreezeも生成しない。

## 再現可能な静的確認

```sh
python3 scaffold/research/wr186-psp-negative-residual/validate_l9.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
```

`validate_l9.py` は固定git object、L9のinput pointer・mutation、raw SHA-256、L3/L4/L5 source pointer、case populationと既存期待の不変だけを静的照合する。L4/L5 predicateをコード化・実行せず、期待値を算出しない。
