# SCF-B-0091 Web／Web-OS Vision coverage research

基準は `origin/main` の `f15c3ca2ed1dc865b242b0a21e1516fdeec6f9f6`。SCF-B-0080 の Vision parent span と、SCF-B-0081／0084／0088 の候補を静的に再照合し、Web と Web-OS の候補境界を分離した接続行列を作成する bounded Scaffold です。

入力から 29 parent span、35 candidate record（atomized 19、composite_unresolved 16）を保持しました。候補 product の重複を正式要求の分母へ合算せず、product candidate edge は 49 件として個別に記録しています。親span coverage edge は 35 件、phase／asset の未接続行を各35件含む connection matrix は154件です。候補ごとの source line と source ID は重複を検査します。

PHCAP inventory と implementation crosswalk には、候補の parent span／atom ID を専用ID/link fieldで指す直接静的リンクがないため、phase direct links と implementation direct links は0件です。各候補の `phase_status`、`asset_status`、formal owner、authority、formal requirement unit、legacy/current implementation、degradation、failure、consumer closure は `unknown` または `not_generated` のまま保持し、matrixにも `unlinked_unknown` を出力します。説明文や任意のJSON欄に候補IDが現れるだけでは直接リンクへ昇格しません。

`candidate_product_candidates` は四製品への候補境界であり、正式な product owner／authority／phase 割当ではありません。正式 Web／Web-OS requirement denominator、owner、採否、phase、実装、縮退、failure／consumer closure は未決です。旧世代資料は意味と判断履歴の静的参照だけに使い、旧runtime／test／CI／workflow／sourceは実行していません。

## 生成物

- `parent-coverage.jsonl`: 29 parent span と候補IDの機械可読対応
- `candidate-records.jsonl`: 35候補の exact source line、候補product、未確定状態
- `connection-matrix.jsonl`: source coverage、product candidate、phase／asset unlinked edge
- `inventory.json`: 入力digest、件数、境界、残課題、検証契約
- `plan.json`: 対象選定と接続判定の研究計画
- `generate.py`: 入力から上記JSONL／inventoryを再生成
- `validate.py`: source line／ID重複、digest、件数、専用ID/link fieldによる直接リンク、境界を検査
- `selfcheck.py`: validatorと33個の意味ある負例を実行（3 artifactの余剰key、matrix全edge種別のstatus／type／lineを含む）

## 検証

```text
python3 -B scaffold/rdp001-web-webos-vision-coverage-0091/generate.py
python3 -B scaffold/rdp001-web-webos-vision-coverage-0091/validate.py
python3 -B scaffold/rdp001-web-webos-vision-coverage-0091/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

件数はこのREADMEの記載をoracleにせず、`candidate-records.jsonl`、`parent-coverage.jsonl`、`connection-matrix.jsonl`から validator が再導出します。
