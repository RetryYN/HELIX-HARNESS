# Wave15 旧HELIX要求直接意味レビュー premise packet

## 監査前提

batch `LEGACY-SEMANTIC-WAVE15-2026-09-21` は親revision `de98b6cfe0d700cdd5027f6f0b2a2695f5d1e070` の候補再照合である。対象は3 unit、7 atom、9 edge。authority effectは `none`、legacy executionは未実行、new buildは許可しない。candidate membershipはsemantic evidenceではない。

## 対象unit

| unit | product scope | phases | atoms | shared overlap |
| --- | --- | --- | ---: | --- |
| IRUNIT-HIL-BR-08-HELIX-HARNESS | HELIX-HARNESS | PHCAP-04 / PHCAP-05 / PHCAP-09 | 2 | 0 / all exclusive |
| IRCONN-HIL-BR-09-HARNESS-OS | HELIX-HARNESS／HELIX-OS | PHCAP-08 / PHCAP-10 | 2 | 0 / cross-product connection decision pending |
| IRUNIT-HIL-BR-11-HELIX-OS | HELIX-OS | PHCAP-07 / PHCAP-19 | 3 | 0 / all exclusive |

BR08はScope Gate拒否と子Issue＋Reverse分離、BR09はWBS軸入力とHARNESS agent contractからのW-agent決定論的射影、BR11は履歴からのrecipe候補・再現性後の昇格・即時強制適用禁止をatom化した。BR09の2 atomはproduct-exclusiveへ分類せず、接続契約の人間decisionとshared connection atomの独立reviewをpendingとして保持する。

## selected asset

要求asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9` は3 unitで同一source requirement IDの契約を照合した。非要求assetは次の6件で、いずれも過去Waveのnonreq asset重複なしを確認した。

- `LEGACY-ASSET-B69B5BD788C619424F37`（BR08 plan）
- `LEGACY-ASSET-A0F75E001FB05D4E4BFB`（BR08 implementation source）
- `LEGACY-ASSET-DAF9D643EFD59089B776`（BR09 plan）
- `LEGACY-ASSET-7B4CF1846551FCE73294`（BR09 implementation source）
- `LEGACY-ASSET-F7D8469171F0934898A5`（BR11 design）
- `LEGACY-ASSET-A52E28E25240059292CA`（BR11 implementation source）

要求assetを含む選定集合は `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、`LEGACY-ASSET-B69B5BD788C619424F37`、`LEGACY-ASSET-A0F75E001FB05D4E4BFB`、`LEGACY-ASSET-DAF9D643EFD59089B776`、`LEGACY-ASSET-7B4CF1846551FCE73294`、`LEGACY-ASSET-F7D8469171F0934898A5`、`LEGACY-ASSET-A52E28E25240059292CA` である。

## 保守的な意味判定

| unit | requirement | plan/design | implementation |
| --- | --- | --- | --- |
| BR08 | A01/A02 confirmed | B69はA01のみ unresolved、A02は未covered | A0はA01のみ unresolved、A02は未covered |
| BR09 | A01/A02 confirmed | DAFはA02のみ unresolved、WBS軸は未covered | 7BはA02のみ unresolved、WBS軸は未covered |
| BR11 | A01/A02/A03 confirmed | F7はA01/A02のみ unresolved、A03は未covered | A52はA02のみ unresolved、A01/A03は未covered |

planはdesignと同じcounterevidence／gate対象とした。implementation confirmed 0であり、部分引用は実装成立を主張しない。
