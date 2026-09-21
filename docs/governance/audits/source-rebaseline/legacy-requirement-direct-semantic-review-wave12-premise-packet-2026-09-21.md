# Wave12 research premise packet（2026-09-21）

`authority_effect: none`、`new_build_allowed: false`、`legacy_execution_performed: false`。対象はHELIX-HARNESSのBR07／BR21／FR45 product unitで、製品境界decisionとconsumer closureはpendingである。

| unit | phase candidates | 判定概要 |
|---|---|---|
| `IRUNIT-HIL-BR-07-HELIX-HARNESS` | `PHCAP-04`, `PHCAP-12` | requirement confirmed、design rejected、implementation rejected |
| `IRUNIT-HIL-BR-21-HELIX-HARNESS` | `PHCAP-18` | requirement confirmed、design confirmed（2/3 atom）、implementation rejected |
| `IRUNIT-HIL-FR-45-HELIX-HARNESS` | `PHCAP-03`, `PHCAP-05` | requirement confirmed、plan unresolved（0 atom）、implementation unresolved（1/6 atom、classification conflict） |

選択asset exact set:

- requirement: `LEGACY-ASSET-A60CF91DD2AF6693E6F9`
- BR07 design／implementation: `LEGACY-ASSET-F99FFC68663F1106347E`, `LEGACY-ASSET-57A29D57A3AD07CA4DFF`
- BR21 design／implementation: `LEGACY-ASSET-3B8F5F0230F7469B5D11`, `LEGACY-ASSET-4253C9EE9C0E93F5980A`
- FR45 plan／implementation: `LEGACY-ASSET-AE6C75BE20AE0DC9BD20`, `LEGACY-ASSET-E3E4D23A3AB9C149BE3D`

`LEGACY-ASSET-33E80E6D11CC51ADA817` はWave8で使用済みのため選択から除外した。E3E4は未使用だがcatalog phase `PHCAP-02`、product候補空であり、FR45 HARNESS unitとのclassification conflictを解消しない。静的sourceにstable identityの部分証拠があることだけを記録する。

9 edgeはconfirmed 4／rejected 3／unresolved 2。implementation confirmedは0、current実装は `not_established`、legacy実装状況は `unknown_pending_direct_asset_semantic_review`、consumer closureはpendingである。
