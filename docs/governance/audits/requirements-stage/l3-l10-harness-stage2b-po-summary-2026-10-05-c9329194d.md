# HARNESS Stage 2b（012/013）L3/L10確認資料

本文revision `c9329194d37ec98a86ad05ddcaa99b3cb17ddcde` は、HARNESS-L2-012/013のL3要件と対のL10総合検証を起草したローカル候補です。Stage 2b全体や他の採択親を完了扱いしません。

FR 2件・AC 7件・機能CASE 11件、独立BR 0件・business CASE 0件、NFR候補2件・測定CASE 2件です。012はPrototypeとtechnical PoCを別々に判断し、非適用時の固定L2記録を保持します。013は単独での1次形成を可能にし、012を実際に適用した場合だけ2次形成を対応づけます。人の意味判断・要求合意・L3承認を生成しません。

旧sourceの項目別再利用・再導出・置換と理由、固定L2/L11およびPO/G0根拠、全6文書のSHA/prefix、現在のFR/AC/CASE/NFR行locator、旧assetのfull-file SHAと有界raw-LF source spanは静的監査に記録しました。先行inventoryのsemantic_role誤記を訂正しています。旧sourceの該当bytesは変えていません。

作成側の静的確認は52 source pin（bounded span 41、全体pin 6）、現在行pin 26件。`scfctl validate` は147 bindings・fail 0、`stale` 0、`residuals` 0、`govcheck` はatoms 7622 / requirements 57 / files 58、`git diff --check` は合格です。旧runtime・CI・test、Bun、実装、L10実行、性能実測は行っていません。

**この候補revisionの独立Claude review、POのL3承認、L10実行、実測は未成立です。** Stage1/2a/2cは今回の親のauthorityとして扱いません。本文commitと本記録commitは分離しています。

| 正本 | SHA-256 |
|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `e1a2c1b8e719e5e818b795d6ae7f67808691911bd8e065b41ac7da5576b9aa3f` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `375ee38f05d0fd6c527096116361d647cb57a80e8ff707637499a3190c62fa86` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `99e406711c73b053c20c8dec44491ca6e6168c566af0ea1082ee86d3e3926e49` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `fcaf483550ae6a62c60ed9634e2c30cb0e04583efc54f506a445d948943569f5` |
| `docs/helix-harness/L10-verification/business-verification.md` | `4d32df2b83ff46b85e5765bb69f7dea03f7391b81aac22f8ce6cc45b378d6449` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `01d85f42e48955561d0002c24a46db717b89b084027370235d2860272a3d4f8a` |

静的監査: [l3-l10-harness-stage2b-static-validation-2026-10-05-c9329194d.json](l3-l10-harness-stage2b-static-validation-2026-10-05-c9329194d.json)。
