# HELIX-OSの要求・設計

要求対象と責務は[2026-09-14のPO決定](../concept/product-boundary.md)に従う。

HELIX-OSはHELIXプロジェクト群の管理・統制、Worker実行、学習、ログ、CI、継続・復旧を担う。
その中核目的はHARNESSをHARNESS自身へ適用し、各projectの運用と観測を通じてHARNESSとHELIX全体を
継続的に改善することである。今回の外部提供プロダクトはHARNESSであり、
HELIX-OSを別の輸出プロダクトとして定義しない。
[HARNESS](../helix-harness/README.md)が規定する工程と検証条件を参照して、作業を実行し進行を制御する。
工程規則の本文をOS側の別正本として複製しない。

管理対象にはHARNESS自身、[HELIX-Web](../helix-web/README.md)、[HELIX-Web-OS](../helix-web-os/README.md)を含む。
Webの利用者向け要求とWeb-OSのservice運転要求は各対象が所有し、OSはその開発・改善を統制する。
Web-OSから許可されたservice logを改善入力として受領するが、管理対象のruntime stateをOS機能として吸収しない。

| 入口 | 内容と状態 |
|---|---|
| [L1企画候補](L1-planning/system-intent.md) | 管理・統制、Worker、CI、証拠、配布運転、改善価値。Concept v4.1承認待ち |
| [L2統制・実行要求](L2-requirements/governance-requirements.md) | 対象別に整理した13要求とWorker・学習・ログ・CIの条件。draft、IR移管未完了 |
| [L11受入案](L11-acceptance/governance-acceptance.md) | 同じ13要求の利用シナリオ・反例。全件未実行 |
| [移管元・対象別対応](../governance/audits/source-rebaseline/l2-source-register.md) | 旧混在要求の監査、13柱の帰属、未移管条件 |

HARNESS版、対象プロジェクト、要求revision、作業scopeと証拠を対応づける。
GitHubは作業管理の接続先であり、OSの要求意味やHARNESS工程規則の正本ではない。
本フォルダの作成はCLI・state directory・配布repositoryの改名やcutoverを実行するものではない。
