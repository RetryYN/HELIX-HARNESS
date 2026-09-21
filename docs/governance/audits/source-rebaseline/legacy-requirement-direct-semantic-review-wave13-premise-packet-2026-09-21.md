# Wave13 research premise packet（2026-09-21）

`authority_effect: none`、`new_build_allowed: false`、`legacy_execution_performed: false`。対象はHELIX-OSのBR01／BR02／BR03 product unitで、製品境界decisionとconsumer closureはpendingである。

| unit | phase candidates | atom数 | 判定概要 |
|---|---|---:|---|
| IRUNIT-HIL-BR-01-HELIX-OS | PHCAP-10／12／13 | 5 | requirement confirmed、design unresolved（2/5）、implementation rejected |
| IRUNIT-HIL-BR-02-HELIX-OS | PHCAP-10／12 | 4 | requirement confirmed、plan unresolved（2/4）、implementation unresolved（2/4、product conflict） |
| IRUNIT-HIL-BR-03-HELIX-OS | PHCAP-19／20 | 7 | requirement confirmed、design unresolved（3/7）、implementation unresolved（1/7） |

選択asset exact set: `LEGACY-ASSET-110202C8AB8053B3BBF2`, `LEGACY-ASSET-13BA93ADBFD33682AF62`, `LEGACY-ASSET-256C9F8C3029B185B151`, `LEGACY-ASSET-4305445847D8D431F684`, `LEGACY-ASSET-A60CF91DD2AF6693E6F9`, `LEGACY-ASSET-AC2078FFF049D6B56D19`, `LEGACY-ASSET-F35F343229FA2B08B3E0`。Wave1〜12の非requirement assetとの重複は0件である。

9 edgeはconfirmed 3／rejected 1／unresolved 5。implementation confirmedは0、current実装は `not_established`、consumer closureはpendingである。
