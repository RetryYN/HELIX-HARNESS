# Wave16 旧HELIX要求直接意味レビュー premise packet

## 監査前提

batch `LEGACY-SEMANTIC-WAVE16-2026-09-21` は親revision `6dad906ed9a52c9e49611931645db2f298c6bf6a` の候補再照合である。対象は3 unit、8 atom、9 edge、累計47 unit／141 edge／残り171 unit。authority effectは `none`、旧資産の実行はなく、new buildは許可しない。candidate membershipはsemantic evidenceではない。

## unitとatom境界

| unit | product scope | phase candidates | atoms | shared / exclusive |
| --- | --- | --- | ---: | --- |
| IRUNIT-HIL-BR-12-HELIX-HARNESS | HELIX-HARNESS | PHCAP-03 | 2 | A01 shared peer / A02 product-exclusive |
| IRUNIT-HIL-BR-14-HELIX-HARNESS | HELIX-HARNESS | PHCAP-03 / 04 / 06 / 07 | 3 | all product-exclusive |
| IRUNIT-HIL-BR-14-HELIX-OS | HELIX-OS | phase 0 | 3 | all product-exclusive |

BR12-A01はshared peerとして `同じintake契約へ正規化し` を共有し、peerは `IRUNIT-HIL-BR-12-HELIX-OS` のWave2 `BR12-OS-A06` である。BR12-A02は `development style、case-driven activation、specialist capability、style再接続点を決定する`。BR14-Hはcurrent ref authority、atomic behavior分解、採否から要件・設計・test・Gate traceを分けた。BR14-OSはaggregate/readの採用拒否、authority receipt由来分母、観測件数の非固定を分けた。BR14のatomはproduct-exclusiveである。

## selected asset（catalog exact）

要求assetは `LEGACY-ASSET-A60CF91DD2AF6693E6F9`。非要求assetは次の6件で、過去Waveのnonrequirement assetとの重複なしを確認した。

- `LEGACY-ASSET-3B336ED418F22DB3745A`（BR12 design）
- `LEGACY-ASSET-412ED61BCBBD6ACCC3C1`（BR12 implementation source）
- `LEGACY-ASSET-B07A2E5BD7DA80C16817`（BR14-H design）
- `LEGACY-ASSET-A098EACAF07A5848E6B1`（BR14-H implementation source）
- `LEGACY-ASSET-41A13F9012DD822F1DDC`（BR14-OS design）
- `LEGACY-ASSET-AF851B7714F4CF28BAC6`（BR14-OS implementation source）

選定集合は `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、`LEGACY-ASSET-3B336ED418F22DB3745A`、`LEGACY-ASSET-412ED61BCBBD6ACCC3C1`、`LEGACY-ASSET-B07A2E5BD7DA80C16817`、`LEGACY-ASSET-A098EACAF07A5848E6B1`、`LEGACY-ASSET-41A13F9012DD822F1DDC`、`LEGACY-ASSET-AF851B7714F4CF28BAC6` である。

## 保守的な意味判定

| unit | requirement | design | implementation |
| --- | --- | --- | --- |
| BR12-HARNESS | A01/A02 confirmed | A01 unresolved、A02未covered | A02 unresolved、A01未covered |
| BR14-HARNESS | A01/A02/A03 confirmed | A02/A03 unresolved、A01未covered | A02 unresolved、A01/A03未covered |
| BR14-OS | A01/A02/A03 confirmed | A01/A02 unresolved、A03未covered | A01 unresolved、A02/A03未covered |

未covered atomは台帳counterevidenceにIDと原文を記録し、候補assetの存在だけで意味成立を主張していない。implementation confirmedは0である。

## parent decomposition unresolved

BR12のshared overlapは `product_boundary_pending_human_decision`、`source_atomization_review_pending`、`unit_split_requires_independent_review` を保持する。BR14-HとBR14-OSのparentはいずれも `one_or_more_unit_phase_unresolved` を保持する。BR14-Hはsource atomization／unit split／product boundary pendingも保持し、BR14-OSの製品unitはphase 0である。これらはauthority判断へ昇格させない。
