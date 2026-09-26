# HELIX-Web

このフォルダは、Web提供系（HELIX-Web製品群とHELIX-WEB-OS）の文書の置き場所である。HELIX本体（Concept、HARNESS、OS、LABO等）の文書は
[docs/](../docs/README.md)に置き、Web側の文書と分ける（2026-09-26のPO判断、[配置の判断記録](../docs/governance/decisions/helix-web-relocation-po-decisions-2026-09-26.md)）。

2026-09-26にPOが示した「HELIX-Web製品群 要求原案」により、HELIX-Webは製品の総称になった。各対象の文書は`docs/`の下に対象ごとのフォルダで置く（[製品群の判断記録](../docs/governance/decisions/helix-web-product-group-po-decisions-2026-09-26.md)）。

| 対象 | 属性 | 文書 |
|---|---|---|
| HELIX-Web | Web提供系の製品総称。外部提供する製品 | [入口](docs/helix-web/README.md) |
| HELIX-WEB-HARNESS | 開発系7製品の総称・統合提供 | [入口](docs/helix-web-harness/README.md) |
| HELIX-WEB-HARNESS-PROTOTYPE | 製品① 画面プロト／PoC | [入口](docs/helix-web-harness-prototype/README.md) |
| HELIX-WEB-HARNESS-REQUIREMENTS | 製品② 要件定義 | [入口](docs/helix-web-harness-requirements/README.md) |
| HELIX-WEB-HARNESS-DESIGN | 製品③ 設計 | [入口](docs/helix-web-harness-design/README.md) |
| HELIX-WEB-HARNESS-DEVELOPMENT | 製品④ 開発 | [入口](docs/helix-web-harness-development/README.md) |
| HELIX-WEB-HARNESS-REFACTORING | 製品⑤ リファクタリング | [入口](docs/helix-web-harness-refactoring/README.md) |
| HELIX-WEB-HARNESS-RELEASE | 製品⑥ リリース | [入口](docs/helix-web-harness-release/README.md) |
| HELIX-WEB-HARNESS-OPERATIONS | 製品⑦ 運用保守 | [入口](docs/helix-web-harness-operations/README.md) |
| HELIX-WEB-HARNESS-CORE | WEB-HARNESS配下の共通機構。製品として数えない | [入口](docs/helix-web-harness-core/README.md) |
| HELIX-WEB-CONNECTOR | Web提供系の接続製品 | [入口](docs/helix-web-connector/README.md) |
| HELIX-WEB-OS | Web提供系の運転機構。製品ではない | [入口](docs/helix-web-os/README.md) |

LABOへの追加分（原案14節）はHELIX本体の[LABOの候補](../docs/helix-labo/candidates/improvement-research-requirements.md)に置く。

親は、HELIX本体の[HELIX Concept](../docs/concept/helix-concept.md)である。
HELIX-WebとHELIX-WEB-OSの既存のL1・L2・L11は、2026-09-24のPO判断でVisionレベルの材料へ分類し直した
（[decision record](../docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md)）。2026-09-26の原案は、各対象の`candidates/`にある要求候補（未採択）であり、既存のIDの意味を上書きしない。
