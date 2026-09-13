# HARNESSの要求・設計

要求対象と責務は[2026-09-14のPO決定](../../governance/product-governance-boundary-2026-09-14.md)に従う。

HARNESSは外部へ提供・配布するプロダクトであり、Vモデル等の工程、層とV-pair、要求・設計・検証の関係、進行・完了条件を規定する。
2026-09-14のPO指示に従い、管理・統制・Worker・学習・ログ・CIを担う
[HELIX-OS](../helix-os/README.md)から要求対象を分離する。

| 入口 | 内容と状態 |
|---|---|
| [L1企画候補](L1-planning/product-intent.md) | 外部提供価値、対象外、L2への導出。Concept v4.1承認待ち |
| [L2利用要求](L2-requirements/product-requirements.md) | 対象別に整理した6要求と工程条件。draft、IR移管未完了 |
| [L11受入案](../../test-design/harness/L11-product-acceptance.md) | 同じ6要求の利用シナリオ・反例。全件未実行 |
| [移管元・対象別対応](../helix/L2-requirements/README.md) | 旧混在要求の監査、13柱の帰属、未移管条件 |

既存の`L1-requirements/`、`L2-screen/`等には旧harnessの層・画面・実行方式が混在している。
フォルダ名を理由にその全内容を現行HARNESS要求として再採用しない。各文書のauthority・revision・移管状態を確認する。
本入口は要求本文を複製せず、承認や既存JSON正本の変更を代替しない。
