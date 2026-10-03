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
| HELIX-Web | HARNESS Version 1完成後に展開するWeb提供系の製品の総称（WEB-HARNESSの7製品、WEB-HARNESS-CORE、WEB-CONNECTOR） | [企画](helix-web/L1-planning/product-intent.md) | [要求](helix-web/L2-requirements/product-requirements.md) | [受入](helix-web/L11-acceptance/product-acceptance.md) |
| HELIX-WEB-OS | HELIX-OS外でWeb service runtimeを運転 | [企画](helix-web-os/L1-planning/system-intent.md) | [要求](helix-web-os/L2-requirements/service-governance-requirements.md) | [受入](helix-web-os/L11-acceptance/service-acceptance.md) |

HELIX-WebとHELIX-WEB-OSはHELIX本体とは別の製品・機構として、`docs/`の下で対象別folderに分ける（2026-10-03のPO判断、[配置判断記録](governance/decisions/helix-web-docs-consolidation-po-decisions-2026-10-03.md)）。2026-09-26のPO選択は当時の配置判断として[履歴記録](governance/decisions/helix-web-relocation-po-decisions-2026-09-26.md)に保持する。製品群の構成と要求候補は、以下の[HELIX-Web入口](helix-web/README.md)と[製品群の判断記録](governance/decisions/helix-web-product-group-po-decisions-2026-09-26.md)から辿る。

`governance/`はauthority台帳、変更方針、再構築の進め方に関する候補、intake、旧sourceとのcrosswalkを保持する。旧HELIXからの移行作業の台帳・待ち行列・wave記録は、現行の規則文書と分けて[`governance/legacy-migration/`](governance/legacy-migration/README.md)に種類ごとに置く（2026-09-26のPO判断、[判断記録](governance/decisions/governance-legacy-migration-layout-po-decisions-2026-09-26.md)）。
機構の要求候補は、担当する機構のフォルダの`candidates/`に置く（2026-09-25のPO判断）。[HELIX-LABO](helix-labo/README.md)、[HELIX-BRAIN](helix-brain/README.md)、[HELIX-INTELLIGENCE](helix-intelligence/README.md)、[HELIX-SECURITY](helix-security/README.md)、[HELIX-INFRASTRUCTURE](helix-infrastructure/README.md)は、2026-09-26にPOの原文をもとにしたL1企画案を持つ（POが対象revisionを確認する）。HELIX-INFRASTRUCTUREは、同日のPO判断でConceptの機構に加えた、HELIX自身の実行環境の資源と状態を持つ機構である（[判断記録](governance/decisions/infrastructure-concept-placement-po-decisions-2026-09-26.md)）。
`governance/audits/source-rebaseline/`は新世代上流を決めるための監査証拠であり、製品要求のownerではない。

旧世代はrepository rootの`archive/legacy-generation-2026-09-14/root/`に元構造のまま凍結している。
archive内の物理構成は新世代の製品区分へ並べ替えない。sourceで採用済みだった要求意味は、そのsource authorityを保って
[現行保持領域](governance/requirements-source/README.md)へ同一byteで保持し、意味を削減せず対象別上流へ再配置する。
候補は元の候補状態を保つ。sourceで採用済みだった要求を、新世代targetが未承認であることを理由に候補へ降格しない。

## HELIX-Web製品群の対象

2026-09-26のPO原案でHELIX-Webは製品群の総称となった。対象別folder分離を保ち、当時の配置はrepository直下`helix-web/docs/`の下だった。現在は2026-10-03のPO選択によりrepository rootの`docs/`以下に配置し、対象別folder分離を保つ。

| 対象 | 属性 | 文書 |
|---|---|---|
| HELIX-Web | Web提供系の製品総称。外部提供する製品 | [入口](helix-web/README.md) |
| HELIX-WEB-HARNESS | 開発系7製品の総称・統合提供 | [入口](helix-web-harness/README.md) |
| HELIX-WEB-HARNESS-PROTOTYPE | 製品① 画面プロト／PoC | [入口](helix-web-harness-prototype/README.md) |
| HELIX-WEB-HARNESS-REQUIREMENTS | 製品② 要件定義 | [入口](helix-web-harness-requirements/README.md) |
| HELIX-WEB-HARNESS-DESIGN | 製品③ 設計 | [入口](helix-web-harness-design/README.md) |
| HELIX-WEB-HARNESS-DEVELOPMENT | 製品④ 開発 | [入口](helix-web-harness-development/README.md) |
| HELIX-WEB-HARNESS-REFACTORING | 製品⑤ リファクタリング | [入口](helix-web-harness-refactoring/README.md) |
| HELIX-WEB-HARNESS-RELEASE | 製品⑥ リリース | [入口](helix-web-harness-release/README.md) |
| HELIX-WEB-HARNESS-OPERATIONS | 製品⑦ 運用保守 | [入口](helix-web-harness-operations/README.md) |
| HELIX-WEB-HARNESS-CORE | WEB-HARNESS配下の共通機構。製品として数えない | [入口](helix-web-harness-core/README.md) |
| HELIX-WEB-CONNECTOR | Web提供系の接続製品 | [入口](helix-web-connector/README.md) |
| HELIX-WEB-OS | Web提供系の運転機構。製品ではない | [入口](helix-web-os/README.md) |

LABOへの追加分（原案14節）はHELIX本体の[LABOの候補](helix-labo/candidates/improvement-research-requirements.md)に置く。親はHELIX本体の[HELIX Concept](concept/helix-concept.md)である。HELIX-WebとHELIX-WEB-OSの既存L1・L2・L11は、2026-09-24のPO判断でVisionレベルの材料へ分類し直した。2026-09-26原案の要求は、各対象のcandidates/にある未採択候補であり、既存IDの意味を上書きしない（[製品群の判断記録](governance/decisions/helix-web-product-group-po-decisions-2026-09-26.md)）。
