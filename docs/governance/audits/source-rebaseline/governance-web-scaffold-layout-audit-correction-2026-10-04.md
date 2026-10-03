# Governance/Web/Scaffold統合監査の事実訂正（2026-10-04）

本記録は、[統合監査MD](governance-web-scaffold-layout-integration-audit-2026-10-04.md)の「Web候補内で相対リンクが更新されていたためbaseへ戻した」という説明だけを訂正する。既存監査本文は時点記録として変更せず、本訂正を併読する。

Web統合候補 `64be94b4cf90c2b06c4c9f28eb6b407689509403` とWeb統合後のmain `0c693b271bae23eb9c7cb7c65f79c9c155c18103` の両方で、2026-09-26の2 decision recordはbaseと同じbytesだった。SHA-256はWeb decision `6f689d117a0bb87338d6c6cc8b7796013965afe2364fddcf2c0c99a8f7cf4d0e`、Governance配置 decision `f4b48c25125081bb223857e7f8de73323b8ca7d2bbde114c395e2c83a4508376`。

差分を導入したのは、ローカルGovernance固定記録移動commit `ff8442d5bf5e37d46f08372cd9f223817dea9540`（その後の候補HEAD `fe8a8a1729d2bf2422a6eece4dd312e3d857a61c`でも同じ）である。ローカル統合時にのみ両decisionの相対リンクtokenが変わった。そのためrestore commit `cae64e0436c02ef1ced80143d3c91760e6877984`で両方をbase exact bytesへ戻した。Web candidate由来ではない。現在の統合treeでも両SHAが維持されている。

機械可読な各commit・各fileのSHA比較は[訂正JSON](governance-web-scaffold-layout-audit-correction-2026-10-04.json)に記録する。
