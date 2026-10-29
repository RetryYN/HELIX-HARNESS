# WR186 process-state-port L9負例監査候補

## PR-Aの範囲

PR classは `design_verification`、対象V-pairは **HELIX-HARNESS L4/L9**。このcandidateはL9監査記録と共有scaffold evidenceに限定し、L9の既存期待、case population、checker marker、formal projection row、freezeを変更しない。F03 14件とF05 8件、合計22件の固定入力根拠と上流照合を保持する。L9の出力は監査候補であり、製品実行・test・checker合格ではない。

共有証拠は [SCF-B-0174](../../bindings/SCF-B-0174.json) に登録した。後続PR-Bでは同じ証拠ファイルを再配置・複製せず、必要な層側の参照だけを追加する。

## 期待の出典境界

L3は要求の意味を持ち、L4の負例分類はcaseのfinding code、state、backflow ownerと各singletonの `expected.finding_codes` を持つ。候補の期待はL3/L4のこの情報と固定L9入力から導く。L5はL4と候補のcode/ownerが整合するかを確かめる照合情報に限り、候補期待・finding順の生成元にしない。

## F03 14件

入力刺激は固定L9 raw snapshot `ed3981e7b9419d796adf1981f8990c6b626ecabe` の `docs/helix-harness/L9-integration-verification/process-state-port.json` にあるcase-specific `independent_source_packet.raw_utf8`。L9各case自身の `base_case_ref` と `mutation` を入力由来として記録する。既存 `expected_material`、`negative_class_assignment`、checker出力からfindingを導いていない。

L3 `/requirements/66/obligation`、L4 `/contracts/3/negative_classifications/0..3` と各caseの固定rawを照合した。trace欠落1件と観点欠落10件はsingletonであり、L4の `expected.finding_codes`・`backflow_owner` から候補code/ownerを得る。wrong-layer pair 3件はL4の「必要pair欠落」と「pair scope conflict」による2-code**集合**を保持するが、L4はemission orderを定めていないためL9の順序はunknownとする。候補にL5の順序を採用しない。各入力hash、raw pointer、L9 mutation pointer、発火・非発火class、L4 source pointer、候補または順序未確定状態は [`manual-projection-candidates.json`](manual-projection-candidates.json) に記録した。

## F05 8件

固定raw snapshotは同じrevisionのL9 `raw_utf8`。8件とも必須Port観測のうち対象1項目がnull、定義seq `0` が開発開始seq `1` より前である。L3 `/requirements/68/obligation`、L4 `/contracts/5/negative_classifications/0..4`、`connection_detail/port_fields`、`initial_order` と各rawを照合した。対象必須field欠落だけがL4分類として成立し、他4分類を発火させない根拠も記録した。8件ともsingletonなので、L4のcode/ownerからL9候補を順方向に記録した。L9自身の `base_case_ref` と `mutation` を維持し、L5はruleとの一致照合だけに使う。詳細は [`f05-single-finding-candidates.json`](f05-single-finding-candidates.json)。

## 独立照合と境界

別workerはcandidateを見る前にL3/L4/L5と固定rawからF03 14件・F05 8件を手動照合した。F03の手動メモはL5 rule順も確認しているため、wrong-layer 3件のL9出力順に関する独立した上流根拠とは扱わない。F03の独立照合が示すのは対象2-code集合までであり、L9順序は未確定のままとする。F05はsingleton code/ownerをL4根拠で再照合し、L5は一致確認とする。日本語要約は [`independent-manual-review.md`](independent-manual-review.md)、元メモSHA-256はF03 `181c85c63c6e286830e71b3d6bf0c7d62df9b581f163226b047df62a6e98c619`、F05 `35dbf7772bd15adcfe31c99e3e4488cf7d6b1cfaa943c35342e7291800710baf`。

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

`validate_l9.py` は固定git object、L9 input pointer/mutation、raw SHA-256、L3/L4 class参照、case populationと既存期待の不変を確認する。L5は候補の発火・出力を生成せず、L4との一致だけを照合する。L4/L5 predicateをコード化・実行せず、期待値を算出しない。
