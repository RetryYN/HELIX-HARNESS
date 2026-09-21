# Wave14 research premise packet（2026-09-21）

`authority_effect: none`、`new_build_allowed: false`、`legacy_execution_performed: false`。対象はHELIX-OS／HELIX-HARNESSのBR05／BR06／BR07 product unitで、製品境界decisionとconsumer closureはpendingである。

| unit | product | phase candidates | atom数 | 判定概要 |
|---|---|---|---:|---|
| IRUNIT-HIL-BR-05-HELIX-OS | HELIX-OS | PHCAP-18 | 2 | requirement confirmed、design unresolved（2/2）、implementation rejected |
| IRUNIT-HIL-BR-06-HELIX-HARNESS | HELIX-HARNESS | PHCAP-04／07／13 | 2 | requirement confirmed、plan unresolved（2/2）、implementation unresolved（2/2、product conflict） |
| IRUNIT-HIL-BR-07-HELIX-OS | HELIX-OS | PHCAP-02／13 | 2 | requirement confirmed、design unresolved（2/2）、implementation unresolved（1/2） |

9 edgeはconfirmed 3／rejected 1／unresolved 5。implementation confirmedは0、current実装は `not_established`、consumer closureはpendingである。BR06のcomposite shared overlapは、2 source spanの順序連結1件を2 atomへ展開した。

選択asset exact set: `LEGACY-ASSET-3486C63C2FA7F3131BC4`, `LEGACY-ASSET-466077EC93AB78271860`, `LEGACY-ASSET-232CF371CADA30110ABB`, `LEGACY-ASSET-F4A843BC7BDF768E9968`, `LEGACY-ASSET-4D2499F624A84EEAF937`, `LEGACY-ASSET-A813B096E3205791EC07`, `LEGACY-ASSET-A60CF91DD2AF6693E6F9`。Wave1〜13のnon-requirement assetとの重複は0件である。
