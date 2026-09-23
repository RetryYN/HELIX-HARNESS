# HELIX-Web-OSの要求整理入口

親は[HELIX Concept](../concept/helix-concept.md)である。[2026-09-14の責務発言記録](../concept/product-boundary.md)は旧発言の出典として保持する。旧L1の承認は2026-09-17の対象revisionに限り、現行Conceptとの意味差分、L2／L11の合意、L3の承認は別に扱う。

HELIX-Web-OSは、HELIX-Web展開時にHELIX-OSの外へ構成するサービス運転基盤である。
HELIX-OSはHELIX-Web／HELIX-Web-OSを開発・改善するプロジェクトを統制するが、利用者向けサービスの
runtime state、Connector job、tenant境界、service evidenceを自身の内部stateへ収容しない。
Web-OSは許可されたservice log・telemetryをHELIX-OSへexportし、HELIX-OSはそれを改善候補へ統合する。
runtime authorityを分けたまま、この観測・改善contractで接続する。

- [L1企画候補](L1-planning/system-intent.md)
- [L2要求案](L2-requirements/service-governance-requirements.md)
- [L11受入案](L11-acceptance/service-acceptance.md)

HARNESSの工程・検証義務は[HARNESS](../helix-harness/README.md)、HELIX全体の開発統制は
[HELIX-OS](../helix-os/README.md)、利用者向け体験は[HELIX-Web](../helix-web/README.md)を参照する。
