# WR255 SEC009 L4/L9 pair: current state and historical evidence

このscaffold監査はL4/L9 V-pairの静的source/pointer照合です。authority、runtime実行結果、個別test oracleは生成しません。

## 現行状態

最新mainは `0e218828fbb3b487eff1469cd57ead8e3dfa7b67`（PR #4022を含む）です。PR #4018 R1修正後の現行L9 SHA-256は `bfcdd2c297c08458043b7a78dd483faf7c87873774d3b0c321e65ca6cf1f5a6c` です。

- L9の `cases[].negative_cases`、`positive_cases`、`source_case_refs` はありません。L9 `integration_cases` の285 IDと行ごとのcondition/expected/expected_preservedは維持され、L9 integration self pointerは0件です。
- L8のgroup envelope参照3件と285 `unit_cases.integration_case_ref` は現行L9へ解決します。
- L9のtaxonomy alias 30件とR2由来の固定history参照3件は残っています。L4 nested payloadも残っています。L5 nested references 30件はPR #4022でcanonical pointerへ移行済みです。
- 撤去前の285 case rowsではgivenとwhenがそれぞれ一種類の共通値でした。旧given-only sourceは固定revisionからvalidatorが読み、現行rowの条件・期待はcurrent `integration_cases`とL8 U-IDから照合します。individual oracle/test citationはnull、positive 8行は未観測です。L3/L10 system oracle鎖は契約単位で照合します。
- SCF-B-0209はR2固定history refsとL4 nested payloadが残るためpendingです。`check-replacement`/`retire`は実施していません。

## 現行の再検証

repository rootから以下を実行します。通常実行はread-onlyで、`--record`を明示した場合のみcurrent L9 SHAを含む新規artifactをexclusive createします。

```sh
python3 -B scaffold/research/wr255-sec009-l9-transfer-20261101/validate_l9_nested_retirement.py
python3 -B scaffold/research/wr255-sec009-l5l8-audit-20261101/validate_wr255_l5l8.py
python3 -B scaffold/tools/design_verification_checker.py check-child --root . --l4 docs/helix-security/L4-basic-design/revoke-quarantine-propagation.json --l9 docs/helix-security/L9-integration-verification/revoke-quarantine-propagation.json --l5 docs/helix-security/L5-detail-design/revoke-quarantine-propagation.json --l8 docs/helix-security/L8-unit-verification/revoke-quarantine-propagation.json
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
```

現行L9 retirement summaryは[l9-nested-retirement-audit-bfcdd2c297c08458.json](l9-nested-retirement-audit-bfcdd2c297c08458.json)、最新main overlayの現行測定は[overlay report](latest-main-overlay-0e218828-1ba440f8.json)です。最新overlayでは両pair PASS、4way 277 matched/0 failures、scfctl validate 210 bindings/0 failures、stale 0を確認します。これは静的source/pointer照合で、security runtimeの挙動は証明しません。

## 固定履歴

初回pointer移行時の詳細auditおよび当時のoverlay本文はcurrent treeから重複配置せず、[historical artifact disposition](historical-artifact-disposition.json)に集約しました。固定commit/blob/SHA-256とcurrent treeを変えない復元コマンドを記録しています。旧auditはvalidatorが固定Git blobから読み、blob IDとcontent SHA-256を検証します。

初回pointer移行時点では、L9の583 nested pointer文字列中580件をL4 canonical aliasへ移し、3件をR2 fixed history referencesとして保持しました。当時のL9 `given`/`when`/`expected_proposal`/ID/orderを変えていないという記録はその初回revisionのみを指します。その後のPR #4018 R1でcase sectionsを撤去した現行状態の説明ではありません。初回移行validator `validate_l9_pointer_transfer.py` はその固定時点の履歴測定用です。現在のL9 retirement確認には上記current validatorを使用します。
