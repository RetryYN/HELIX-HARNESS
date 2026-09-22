---
title: "HELIX-WebのVision由来利用要求案"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: design
status: draft
freeze_blocking: true
pair_artifact: docs/test-design/helix-web/L11-product-acceptance.md
parent_l1_candidate: docs/design/helix-web/L1-planning/product-intent.md
---

# HELIX-WebのVision由来利用要求案

HELIX-WebはHELIX-OSが開発・改善projectとして管理し、HELIX-Web-OSが展開後のservice runtimeを担う個別プロダクトである。本書は保存された
[Vision原文](../../../archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md)の§6／7／10／11／13／14から、
Webの利用者に対する要求を具体化した案である。最新PO指示の管理関係と原文の将来構想を区別する。
以下の9件の個別採択・L2合意・L3凍結・IR admission・提供時期は未確定。HELIX-Web自体はHARNESS Version 1の
完成条件へ追加しない。一方、HELIX-Webの展開はHARNESS製品群Version 1の完成を必須前提とする。

親は[HELIX-Web L1企画候補](../L1-planning/product-intent.md)である。現在は親ConceptとL1が未承認のため、
以下のrelationは接続案であり、承認済み導出ではない。

| L2要求 | 親L1候補 |
|---|---|
| HELIXWEB-L2-001／HELIXWEB-L2-002／HELIXWEB-L2-004 | HELIXWEB-L1-001 |
| HELIXWEB-L2-003 | HELIXWEB-L1-002 |
| HELIXWEB-L2-005 | HELIXWEB-L1-003 |
| HELIXWEB-L2-006／HELIXWEB-L2-007 | HELIXWEB-L1-004 |
| HELIXWEB-L2-008 | HELIXWEB-L1-005 |
| HELIXWEB-L2-009 | HELIXWEB-L1-006 |

| ID | 構想段階 | 出典 | Webに対する利用要求 |
|---|---|---|---|
| HELIXWEB-L2-001 | 初期Connector構想 | §6.1、U08／09 | 利用者がWebから自分の許可された開発環境を選び、対象プロジェクトの操作と進行をダッシュボードで確認できる。全コード・計算資源をSaaSへ移すことを必須にしない |
| HELIXWEB-L2-002 | 初期Connector構想 | §3.2、§6.1、§10 | 必要な開発能力の提供版を選び、Connectorへの導入・互換性・更新・撤去と結果を確認できる。Connectorに開発engineを重複実装しない |
| HELIXWEB-L2-003 | 初期Connector構想 | §6.2、§10、§13 | 長時間jobの実行・切断・取消・再開・終端と証拠を確認できる。結果不明の副作用を無条件に再実行しない |
| HELIXWEB-L2-004 | 接続前に方式確定 | §6.2、O03／04 | 対応するprovider経路と利用条件、利用者環境から返送する情報の範囲を確認できる。未確認のログイン再利用や経路を対応済みと表示しない |
| HELIXWEB-L2-005 | 操作別に段階採択 | §7、U17、O05 | 何を変更し、何を許可し、何を受け入れるかを自分で判断し、検収済み範囲の保守・改修を行える。残る専門判断を確認できる |
| HELIXWEB-L2-006 | Web3の将来構想 | §6.3、U14、O08 | 適用範囲・版・評価証拠を確認したHDAを開発補助に利用できる。学習と分散推論の提供責務を分け、応答を独立検収済みとみなさない |
| HELIXWEB-L2-007 | 能力接続時に採択 | §10、§11 | Webが採用する開発能力・Connector・モデル・接続契約の構成版を確認できる。Webの変更で無関係なHARNESSやモデルを一斉更新しない |
| HELIXWEB-L2-008 | 改善還流時に採択 | §10、§11 学習とデータ利用 | Web-OSのservice log・telemetry・利用結果をどの目的・範囲でHELIX-OSの改善へ渡すかを確認できる。サービス利用をログexportや横断学習への包括同意とみなさない |
| HELIXWEB-L2-009 | 展開前に必須 | §3、§13、2026-09-14 PO指示 | 複数プロダクトの開発検証とHELIX自身への適用を含む、HELIX-HARNESS製品群Version 1の完成証拠を確認した後にHELIX-Webを展開できる。Webの完成をVersion 1へ算入せず、HARNESS未完成のまま展開しない |

## 要求対象と未決定の境界

HARNESSは利用する開発能力・工程条件を提供する。HELIX-OSはWebプロジェクトの要求・進行・Worker・CI・学習・ログを管理し、
HELIX-Web-OSは展開後のtenant・Connector job・service state・配備・監視・復旧を担う。
本書はWebの利用者向け操作・表示・サービス体験を所有し、OS内部管理UIの要求をWebの製品要求として一括転用しない。

provider認証方式、MCP等の通信方式、対応環境、料金、具体モデル、性能・可用性の数値は未決定である。
本書はそれらの変更や外部接続実行を認可しない。原文のPC／WSL／VPSは構想上の選択肢であり、WSL必須とはしない。
HDA、動的計画、System Compiler、差分再生成は別段階の構想であり、初期Connectorへ一律に必須化しない。
後二者の詳細仕様・納品契約は原文§5・O10から別途具体化が必要であり、本書の9件で全Visionを網羅したとは扱わない。

プロトでは対象環境・選択能力・操作・状態・結果を確認する。画面数やレイアウトは未確定である。
要求合意と操作の許可、提供済みと利用成功、運用健全性と改善効果を別状態として扱う。
GitHubは作業記録の接続先であり、要求の意味・採否をIssueの状態から生成しない。
