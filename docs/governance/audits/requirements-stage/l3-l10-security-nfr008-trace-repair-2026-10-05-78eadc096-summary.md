# SECURITY NFR-008 trace修正記録

本文commit `78eadc0967a378e06049a4b2c4b3591c662ed233`（親 `a776a9fa0b8ad0fed6ca84634ee58039d0ffc6ae`）で、`nfr-grade.md` と `nfr-verification.md` のSEC-NFR-008 AC一覧に `SECURITY-AC-005-01` を加えた。L2-005→SEC-NFR-008のcrosswalk、NFR候補の根拠・測定意味、既存AC-009/010/013/033は保持した。これは既存L2-005 credential/secret境界とSECURITY-AC-005-01のraw-secret/classifier oracleをNFR-008のraw-secret scan測定へ接続するtrace修正であり、要求意味・scope・owner・versionを変更しない。

編集前にNFR-008のL3候補/L10測定行、L2-005固定source、SECURITY-AC-005-01を再読した。固定L2-005のfull SHA `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c` とlines 110–119 raw-LF SHA `5eccc4d1683c144c57800071294756713aff52f78db467382665002c8ed39cad`、対応L11 lines 29 raw-LF SHA `19f3e8c523ec522f35982ed3837c21fb6c22623c587d17fd7ae6bad1f6a3f107`、PO registration row 43を照合した。新本文commitで6正本の全current SHA/byte数/行数を固定し、2つの変更以外は未変更である。

| 正本 | SHA-256 | 行数 | bytes |
|---|---|---:|---:|
| `docs/helix-security/L3-requirements/business-requirements.md` | `fcf2504a4fef152d1829fddb1a9d65397cb16114a6edbd964c619422da75097d` | 5 | 747 |
| `docs/helix-security/L3-requirements/functional-requirements.md` | `43f95d98b1c1d0bda7f0be3948baa17f15c979a18bd807720cf87db955ee8dd3` | 324 | 64994 |
| `docs/helix-security/L3-requirements/nfr-grade.md` | `3fe1d98024d5a54e734ab8276ee3d55af78d743c7f1bf12b46b9d351139fe50b` | 45 | 6964 |
| `docs/helix-security/L10-verification/business-verification.md` | `717e206126b910a8261e5448227bb73b0961ac3dbf3f1f71a41ef487dc0f6ee5` | 3 | 526 |
| `docs/helix-security/L10-verification/functional-verification.md` | `9854850a1c9b8ab3b504c241d86ce78d2152fbd11bf80784eaedafa9887b5936` | 249 | 49441 |
| `docs/helix-security/L10-verification/nfr-verification.md` | `37d223cb22f8a7923662967ad501200e5f2a7e5f4db436a180d7af3affd0da9c` | 19 | 4983 |

既存のstatic-validation、15910e2 correction、1258f8023 followup auditはSHA一致で不変。58件の元finding ID/severity対応（Major 26/Minor 32）と3件followupの範囲はread-only補助監査で再照合済み。旧資産13件のfull source SHAと16 bounded locator、計算したraw span SHAを追補監査JSONに含めた。ただし旧監査schemaは各spanの期待literal/raw SHAを持たないため、旧spanのsemantic closureまでは主張しない。

静的確認: `scfctl validate` 147/fail 0、`stale=0`、`residuals=0`、`govcheck` 7622/57/58 PASS、diff check PASS。旧runtime/test/CI/Bunは実行していない。旧immutable記録を更新せず、新audit/summaryは本文とは別commitにする。root検収と修正後exact-HEAD独立reviewは未完了。
