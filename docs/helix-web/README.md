# HELIX-Webの要求整理入口

要求対象と責務は[2026-09-14の責務発言記録](../concept/product-boundary.md)を候補境界として参照する。
恒久authorityは人間判断packetのexact SHA decisionへ束縛する。

HELIX-Webは、HELIX-OSが開発・改善projectとして管理する個別プロダクトである。展開後のservice runtimeは
HELIX-OS外のHELIX-Web-OSが担う。HARNESSの外部提供要求、HELIX-OSの開発統制、Web固有の利用者要求、
Web-OSのサービス運転要求を分離する。

| 責務 | 要求の所属先 |
|---|---|
| Web固有の企画・提供価値 | [L1企画候補](L1-planning/product-intent.md)。Concept v4.1とWeb固有価値の承認待ち |
| Webの利用者体験・サービスとして提供する能力 | [L2要求案](L2-requirements/product-requirements.md)と[L11受入案](L11-acceptance/product-acceptance.md)。Vision由来9件、個別採択・受入未完了 |
| 適用する開発工程・Vモデル・検証条件 | [HARNESS](../helix-harness/README.md)。Webが採用する版と能力を参照 |
| Webの要求・進行・Worker・CI・開発ログ・改善還流の管理 | [HELIX-OS](../helix-os/L2-requirements/governance-requirements.md) |
| 展開後のtenant・Connector・job・service state・配備・監視・復旧 | [HELIX-Web-OS](../helix-web-os/README.md) |

## 原文と現在の整理

[保存されたVision原文](../../archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md)の
§2.2、§3.2、§4、付録U07〜U11は、Webを別進行のAI開発SaaSとし、能力の受渡しと実践からの改善を示している。
原文は受領時の構想を残す資料であり、最新の責務名はPO指示のHELIX-OS／HARNESSへ対応づける。
ユーザーの「Vision2」という呼称を、原文の本体2.0、公開版、実装期限と自動的に同一視しない。

Connector型の提供、利用者自身の環境の操作、保守・改修の支援等は原文にある構想である。
個々の利用者要求・受入条件・採択revisionを照合してL2／L11へ具体化するまで、実装必須・合意済み・検収済みとは表示しない。
この入口だけで詳細要求の移管完了とはしない。原文の全内容をOSやHARNESSの要求集合へ一括取り込みしない。

GitHubは各要求に対応する作業管理に使用し、要求の意味・採否・合意の正本にしない。
