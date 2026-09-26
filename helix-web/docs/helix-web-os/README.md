# HELIX-WEB-OSの要求整理入口

> **2026-09-24 PO判断**：本フォルダのL1・L2・L11は、要求層から外してVisionレベルの材料として扱う（[decision record](../../../docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md)）。POの意図は「最終はローカルコネクタの提供からで最終的にクラウド型にできたらいいね。ぐらいの話」であり、現行の文書はVisionを拡大解釈している。要求は今後POの指示から起こす。

親は[HELIX Concept](../../../docs/concept/helix-concept.md)である。[2026-09-14の責務発言記録](../../../docs/concept/product-boundary.md)は旧発言の出典として保持する。旧L1の承認は2026-09-17の対象revisionに限り、現行Conceptとの意味差分、L2／L11の合意、L3の承認は別に扱う。

HELIX-WEB-OSは、HELIX-Web展開時にHELIX-OSの外へ構成するサービス運転基盤（Web提供系の運転機構。製品ではない）である。
HELIX-OSはHELIX-Web／HELIX-WEB-OSを開発・改善するプロジェクトを統制するが、利用者向けサービスの
runtime state、Connector job、tenant境界、service evidenceを自身の内部stateへ収容しない。
WEB-OSは許可されたservice log・telemetryをHELIX-OSへexportし、HELIX-OSはそれを改善候補へ統合する。
runtime authorityを分けたまま、この観測・改善contractで接続する。

- [L1企画候補](L1-planning/system-intent.md)
- [L2要求案](L2-requirements/service-governance-requirements.md)
- [L11受入案](L11-acceptance/service-acceptance.md)
- [要求候補（2026-09-26のPO原案13節、`HELIXWEBOS-L2-007`〜`021`。未採択）](candidates/service-governance-requirements.md)

HARNESSの工程・検証義務は[HARNESS](../../../docs/helix-harness/README.md)、HELIX全体の開発統制は
[HELIX-OS](../../../docs/helix-os/README.md)、利用者向け体験は[HELIX-Web](../helix-web/README.md)を参照する。
