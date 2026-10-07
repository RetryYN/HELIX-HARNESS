# HARNESS-044 review03 postbody時点監査候補

> 修正本文の時点監査。対象PR #2641、body `15290029d3c622a3903e26e24c6e80de45068d94`、parent `e7af7499a419059addd475a6ae3ec72fa3b0c9cc`、base `ceda1c53b53c53fffb8c23f394add1f2b809deb1`。

## Formal review03と反映内容

正式comment `6023320984` の全文・R1–R14 rawをJSONに保存した。R1–R9の詳細を追跡できるようreview02を含む履歴comment rawも保持している。review03 M1はbusiness側が同じCASE IDを別の期待値で定義し、返却先も省いていた点を指摘した。
Rootのexact change JSONと実bodyを照合し、`business-verification.md`の該当節がfunctional verificationの主CASEを指す3行の索引へ置き換わったことを確認した。原因別の既知責務区分、意味/authority区分不明時の既存要求owner fallback、個体identity unknownの分離、不足scopeの未完/未評価とclosure claim拒否が反映されている。変更はこの1ファイルだけ。

## 文書・CASE pin

| 文書 | before bytes / SHA-256 | after bytes / SHA-256 |
|---|---|---|
| `docs/helix-harness/L3-requirements/business-requirements.md` | 16811 / `7c1d8c454867d5f87e356a5b1c3388a965d60678097a1aec5bea3bb9b07f3b6b` | 16811 / `7c1d8c454867d5f87e356a5b1c3388a965d60678097a1aec5bea3bb9b07f3b6b` |
| `docs/helix-harness/L3-requirements/functional-requirements.md` | 211548 / `0b8521a18172a49e87e8f3372ec6c207d25ccda292b0e9f155cd96e4bb82be66` | 211548 / `0b8521a18172a49e87e8f3372ec6c207d25ccda292b0e9f155cd96e4bb82be66` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | 46412 / `d27ede8b122ca15ef7035f9f40fe7e03a75b915cfce4265962983bd923028fec` | 46412 / `d27ede8b122ca15ef7035f9f40fe7e03a75b915cfce4265962983bd923028fec` |
| `docs/helix-harness/L10-verification/business-verification.md` | 12931 / `a119ddbe629f03b4adbad00d2fff91ab8dcb77cbe0e3b554fbc7ce019585c543` | 13125 / `fd1eec8bc798670b6f970146a502e0d6d33ea25a43137b16558b8abbcd5ab3e5` |
| `docs/helix-harness/L10-verification/functional-verification.md` | 668790 / `3420b2760d56bd25ae5463ce80ab815e2fe27ae99a8df20a9ea2336125aa8a48` | 668790 / `3420b2760d56bd25ae5463ce80ab815e2fe27ae99a8df20a9ea2336125aa8a48` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | 40600 / `18bb204d6057cb0b6f2c2dc7c9bec635408a9d2c148ac23eb36a21895c683ced` | 40600 / `18bb204d6057cb0b6f2c2dc7c9bec635408a9d2c148ac23eb36a21895c683ced` |

Functional verificationには主CASE定義が51件あり、全ID unique。旧source checkpointの39 IDはすべて現在の51 IDに含まれる。差分12 ID。BV側の3行は主CASE参照索引になり、functional側とCASE定義を二重化しない。件数からsemantic completenessは主張しない。

## 固定親と例外記録

- `L2-044 output/dependencies/return route` `318ec4a04abb3c1cc17111b3d939f913facd5fd3` `docs/helix-harness/L2-requirements/product-requirements.md:1008-1010`: full `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`, span raw-LF `acecba67e8bce3a57845402da3f2efc2d4de7319bec58c2361987785d01a74ab`.
- `L11-044 return route` `318ec4a04abb3c1cc17111b3d939f913facd5fd3` `docs/helix-harness/L11-acceptance/product-acceptance.md:745-745`: full `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`, span raw-LF `7449dfa8c7bbc81d31d84d318abfdb187dd01fa3cc474ea891c02eadd299d6d8`.
- PO判断 `ceda1c53b53c53fffb8c23f394add1f2b809deb1` `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:49`: `| `HARNESS-L2-044` | 条件付き採択：Bルート、名称はDesign Contract Portfolio。採択済み025/026へ無断追記しない。 | `MPR-RC-HARNESS-L2-044-002` | `docs/helix-harness/L2-requirements/product-requirements.md` | `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09` | `sha256:690f2bfa866c778be47459baa99139905260d3ca569739a4d4707c61096212f2` | `HARNESS-L2-044` | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5` | `sha256:9c79b73100f4afa63abba7f79d47b8931a1c29983ac08a3e4ded95e56107bfc8` | `docs/governance/audits/requirement-registration/harness-contract-portfolio-coverage-receipt-2026-09-28.json#HARNESS-L2-044` |`; row SHA `212948ea669ed647a3a3b188b0efb39a9e2d2fdf020e7be5cd8f088fac79807b`.
- 旧X1 audit `docs/governance/audits/requirements-stage/harness-stage3-parent044-review01-disposition-2026-10-07-d6877a903.md` はbefore/after同一bytes 20176、SHA `c7956182b162f3ff206564da0a1f5423ea7797b3e8b666e016e4ec7df10a67ae`。末尾空白はline 49, 51, 54に残り、正式review03 comment `6023320984`が時点記録として変更しない例外を明示している。

Root報告のgovcheck/current document diffcheck PASSは再実行していない。full diffcheckに関しては、上記X1例外を正式commentが記録している。postbody HEADの独立reviewやFable判断、fixture実行、意味完全性、merge admissionは未確認。

## 証跡

- JSON: `/tmp/harness044-review03-postbody-audit-worker.json`
- JSON SHA-256: `2a1c3d40c5655bc4c5b9095e9a197bdc88a19dc4eef0fec2d8152ef5de7ec2a9`
