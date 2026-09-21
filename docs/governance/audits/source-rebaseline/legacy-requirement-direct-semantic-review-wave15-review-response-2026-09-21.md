# Wave15 review response

## 適用した指摘

BR08、BR09、BR11の候補判定では、candidate membershipはsemantic evidenceではないことを明記し、catalog候補であることだけから意味リンクを生成しなかった。planもdesignと同じcounterevidence／gate対象にし、implementation confirmedを0に固定した。BR09 connectionは `product_scope` の2製品表現を保持し、単一product targetやproduct-exclusive atomへ変換していない。接続契約の人間decisionとshared connection atomの独立reviewをunresolvedとして各edgeへ保持した。

## asset別対応

- `LEGACY-ASSET-A60CF91DD2AF6693E6F9`: 要求IRのA60 source spanをBR08、BR09、BR11へそれぞれexactに対応づけ、契約のみconfirmedとした。
- `LEGACY-ASSET-B69B5BD788C619424F37`: Scope Gateのscope／admissibilityはBR08-A01に部分接地するが、子Issue＋Reverse分離は示さない。A02をcoveredにしていない。
- `LEGACY-ASSET-A0F75E001FB05D4E4BFB`: `outsideAllowed`／`permissionRequiredPaths` はBR08-A01に部分接地するが、A02は示さない。未実行のためunresolvedとした。
- `LEGACY-ASSET-DAF9D643EFD59089B776`: deterministic `TeamDefinition`／schema／teamはBR09-A02に部分接地するが、WBSのlayer×drive×task-kind×verification patternは示さない。
- `LEGACY-ASSET-7B4CF1846551FCE73294`: TeamDefinition、provider、hybridはBR09-A02に部分接地するが、WBS入力軸は示さない。実行していない。
- `LEGACY-ASSET-F7D8469171F0934898A5`: recipe／learning resultとskill／detector／gateはBR11-A01/A02に部分接地するが、A03の即時強制適用禁止は示さない。
- `LEGACY-ASSET-A52E28E25240059292CA`: reproducible、promotion_allowed、quarantine_candidateはBR11-A02に部分接地するが、履歴からrecipe候補生成とA03は禁止を示さない。実行していない。

## 結果

7 atom、9 edgeを保存した。requirement 3 edgeのみcontract confirmed、plan/design 3 edgeはunresolved、implementation 3 edgeもunresolvedで、implementation confirmed 0である。BR08は設計相当1/2、実装相当1/2、BR09は設計相当1/2、実装相当1/2、BR11は設計相当2/3、実装相当1/3の部分引用である。consumer closureとproduct authorityはpendingのまま残した。

旧資産のruntime、test、hook、CI、adapterは実行していない。完了は静的な引用・digest・counterevidence・責務境界の検証に限る。

