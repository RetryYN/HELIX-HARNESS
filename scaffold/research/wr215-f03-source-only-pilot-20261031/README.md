# WR215 F03 source-only pilot evidence

status: scaffold（研究・比較証拠。要求、設計、実装、承認、完了を生成しない）
authority_effect: none
binding: [SCF-B-0186](../../bindings/SCF-B-0186.json)

## 目的と境界

L5↔L8の1 V-pairに関係するHARNESS-L3/L10-003-F03の意味を、既存L4/L5/L8/L9期待を読む前に上流pair/trace義務から導いたsource-only記録と、既存期待を読んだ後の比較記録を分けて保管する。これはL8/L9の新しいexpected、case、class、oracle、algorithmではない。

- `source-only-frozen.json` は比較前に固定したbytesの複製である。元の `/tmp/wr215-f03-blind.json` とSHA-256 `0f388cac639d6b1e056ec263849d0b133cc7e2b68b4bca2695b691d3d9bd7800` が一致する。
- `comparison-after.md` は固定後に初めて読んだL4/L5/L8/L9の2 witnessとの対応、解釈の限界、比較時の範囲逸脱を記録する。
- 現行L8は変更しない。2 witnessにはすでにL5 contract、L9 mutation、個別input/expectedへのcase参照がある。source-only artifactをL8入力、expected、algorithm、4-way markerの意味へ追加する上流根拠はなく、新fieldは作らない。
- 既存`negative_class_assignment`は両caseを`F03_REQUIRED_PAIR_MISSING`へ割り当てるが、L8 expectedの`pair_result`/`pair_results`のvalueはNORMALと同じsupported（packet refsはcase別）、L9 expectedの`pair_result`もsupportedで、expectedにfailure codeやmissing stateはない。L5 failure output contractとの関係は未解決であり、classとexpectedの一致とは記さない。
- L3原文はticket発行条件として由来欠落を挙げるが、trace欠落は同じ列挙に明記しない。固定artifactの`pair_and_trace_obligation`要約はこのticket条件文を含まないため、artifactはticket候補差を導出していない。trace欠落がticket発行を禁止すると推定しない。
- rootがbase 4beeの静的childで223 failuresを測定し、対象4文書がbase 51ebeと同bytesであることを確認。4-way成立や223個の独立した意味欠陥とは扱わない。既存の4-way markerも変更しない。

## 上流・現行pair参照

比較前固定のapproved revisionは`771dd7e802189506d88cf9d9570c42b94cf7b8fb`。source-only artifactはL3 `/requirements/66`、L10 `/cases/66`と、L9 `/cases/3/negative_cases/{0,2}/mutation`だけを入力にした。

比較後の現行pair参照は、SCF-B-0186の`upstream`にhash pinしたmain revision `51ebe7e7e563cdc85607f72fdc234e1c7f665a70`時点の次のファイルである。

- L4 `process-state-port.json` — `HARNESS-L4-003-F03` contractと4件のfailure classification
- L5 `process-state-port.json` — `HARNESS-L5-003-F03` function/contractとfailure output contract
- L8 `process-state-port.json` — `H003-L8-F03-ORIGIN-MISSING`、`H003-L8-F03-TRACE-MISSING`
- L9 `process-state-port.json` — `H003-F03-ORIGIN-MISSING`、`H003-F03-TRACE-MISSING`

R1再確認時のmain `3082abb893bbec7c919d4ed88a927e5100874372`でも、上記6つのupstream fileのbytes/hashはSCF-B-0186のpinと一致した。

## 旧sourceと失敗記録

旧HELIXは意味の再導出元として読み、実行経路へ移さない。

- 旧`ddd-tdd-rules.md`（`LEGACY-ASSET-5E22432B0A5A8F7CC8B3`、SHA-256 `9eac2cc9e5fa8f1177b39f86681fa928cb22070666a5306dce7ae6943597d7af`）23–24行は、Redを意図した欠陥を検出した証拠、Greenを最小実装、Refactorを同じoracleを保つ証拠として記録する。
- 旧`L08-L14-verification-phase.md` 28–35行はV-pairと差戻し、73–79行は検証evidenceの形を記録する。旧G8等の層番号やgateは現行へ移さない。
- 失敗事例の直接sourceは旧`predecessor-harness-full-weakness-audit-2026-07-20.md`（`LEGACY-ASSET-A127DEC3EEE6ED63CF17`、SHA-256 `bab121404c956a0a4b403e589bea1c414af59b5996989bea5fab9f98f42f6872`）71行 UTW-005（PR trace/review evidenceの最新HEAD・merge-baseへの再束縛不足）、87行 UTW-021（完了evidenceが時刻・prose・自己申告に戻る余地）。これは今回のsynthetic mutationそのものの実incidentではない。特定のactual incident ID、root cause、同一incident性へ拡張しない。

## 検証の限界

このbundleはhash、revision、pointer、field対応の静的確認に限る。L4/L5 algorithm、旧CLI/runtime/test/CI、新世代CIを実行しない。SCF-B-0186の`verification.evidence_kind`は`scaffold`であり、formalなpair成立、実ticket発行、Reverse実行、完了を示さない。
