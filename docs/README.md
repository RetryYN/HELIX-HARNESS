# HELIX新世代 文書構成

## 上流

- [HELIX Concept入口](concept/README.md)
- [製品責務境界](concept/product-boundary.md)
- [作業入口](governance/new-generation-start-here.md)

## 対象別V-model

| 対象 | 責務 | L1 | L2 | L11 |
|---|---|---|---|---|
| HELIX-HARNESS | 外部提供するV-model開発基盤 | [企画](helix-harness/L1-planning/product-intent.md) | [要求](helix-harness/L2-requirements/product-requirements.md) | [受入](helix-harness/L11-acceptance/product-acceptance.md) |
| HELIX-OS | HARNESS自身を含むプロジェクト群の管理・統制・継続改善 | [企画](helix-os/L1-planning/system-intent.md) | [要求](helix-os/L2-requirements/governance-requirements.md) | [受入](helix-os/L11-acceptance/governance-acceptance.md) |
| HELIX-Web | HARNESS Version 1完成後に展開するConnector型Web製品 | [企画](../helix-web/docs/helix-web/L1-planning/product-intent.md) | [要求](../helix-web/docs/helix-web/L2-requirements/product-requirements.md) | [受入](../helix-web/docs/helix-web/L11-acceptance/product-acceptance.md) |
| HELIX-Web-OS | HELIX-OS外でWeb service runtimeを運転 | [企画](../helix-web/docs/helix-web-os/L1-planning/system-intent.md) | [要求](../helix-web/docs/helix-web-os/L2-requirements/service-governance-requirements.md) | [受入](../helix-web/docs/helix-web-os/L11-acceptance/service-acceptance.md) |

HELIX-WebとHELIX-Web-OSは、HELIX本体とは別の製品・機構として、文書をrepository直下の[`helix-web/`](../helix-web/README.md)に置く（2026-09-26のPO判断、[判断記録](governance/decisions/helix-web-relocation-po-decisions-2026-09-26.md)）。上の表の2行はその文書へリンクする。

`governance/`はauthority台帳、変更方針、再構築の進め方に関する候補、intake、旧sourceとのcrosswalkを保持する。
機構の要求候補は、担当する機構のフォルダの`candidates/`に置く（2026-09-25のPO判断）。[HELIX-LABO](helix-labo/README.md)、[HELIX-BRAIN](helix-brain/README.md)、[HELIX-INTELLIGENCE](helix-intelligence/README.md)、[HELIX-SECURITY](helix-security/README.md)は、2026-09-26にPOの原文をもとにしたL1企画案を持つ（POが対象revisionを確認する）。
`governance/audits/source-rebaseline/`は新世代上流を決めるための監査証拠であり、製品要求のownerではない。

旧世代はrepository rootの`archive/legacy-generation-2026-09-14/root/`に元構造のまま凍結している。
archive内の物理構成は新世代の製品区分へ並べ替えない。sourceで採用済みだった要求意味は、そのsource authorityを保って
[現行保持領域](governance/requirements-source/README.md)へ同一byteで保持し、意味を削減せず対象別上流へ再配置する。
候補は元の候補状態を保つ。sourceで採用済みだった要求を、新世代targetが未承認であることを理由に候補へ降格しない。
