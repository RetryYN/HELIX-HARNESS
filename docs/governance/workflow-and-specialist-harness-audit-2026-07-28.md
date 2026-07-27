---
title: "ワークフロー／工程専門ハーネス整合監査"
status: recorded
date: 2026-07-28
issue: 165
---

# ワークフロー／工程専門ハーネス整合監査

## 1. 監査範囲

Forward／Scrum／Hybridだけでなく、全入口route、Forward工程専門、Design HARNESS、
signal routing、PLAN kind、branch admission、Reverse backfill、right-arm evidenceを照合した。

## 2. 経路集合

| 区分 | exact set | 判定 |
|---|---|---|
| spine | Forward Full V | catalogへ登録 |
| delivery | Production Scrum、V設計＋Scrum実装Hybrid | catalogへ登録 |
| exploration/normalization | Discovery、Reverse | catalogへ登録 |
| change | Add-feature A/B、Refactor、design-bottomup | catalogへ登録 |
| migration/restoration | Retrofit、Recovery | catalogへ登録 |
| emergency/decision | Incident、Research | catalogへ登録 |
| preservation/verification | version-up、OperationVerification | catalogへ登録 |

初回監査では`design-bottomup`がruntime route、kind matrix、TDD fitに存在する一方、
process文書と統合catalogから欠落していた。`docs/process/modes/design-bottomup.md`を追加し、
15 route exact setへ是正した。

## 3. 工程専門

concept正本上の工程専門はscreen-designとfrontend-designの2件であり、独立modeではない。
従来は名称、layer、親routeだけで、entry/artifact/pair/exitを検査できなかった。
`docs/process/specialist-workflows.md`とcatalogへ次を固定した。

| workflow | layer/pair | 必須境界 |
|---|---|---|
| screen-design | L2↔L11 | screen/flow/wireframe/UI element、prototype agreementまたはno-UI receipt |
| frontend-design | L10↔L3 | visual、token、a11y、VRT、UX review、実装後の実測証拠 |

## 4. Design HARNESS実装成熟度

| capability | 設計 | runtime | disposition |
|---|---:|---:|---|
| document metadata | あり | あり | 現行能力として維持 |
| document semantic diff | あり | あり | 現行能力として維持 |
| ScreenApplicabilityGate | あり | なし | #168 |
| executable prototype/walkthrough | あり | なし | #168 |
| Design Registry／要求翻訳 | あり | なし | #168 |
| Design Refactor | あり | なし | #168 |

設計済みを実装済みとして表示しない。#168はcapability groupingであり、実装時は4 sliceを
子Issueへ分ける。#165へ実装を混載しない。

## 5. 類似workflowの分類

| surface | 分類 | routeとの関係 |
|---|---|---|
| proposal document packs（20 pattern） | taskに必要文書・gateを選ぶprofile | routeではない。選択済routeの成果物集合を補助する |
| design elicitation engine | design-bottomupの意味コア | backend事実からFE要求候補を抽出しForward/Discoveryへ渡す |
| universal workflow judgment engine | HELIXが作るproduct capability | 開発駆動モデルではない。選択済delivery route上で設計・実装する |
| pair-agent TDD | runtime execution pattern | Add-feature等のrouteを置換せず、worker/reviewer構成だけを決める |
| team definition | orchestration configuration | drive modelやkindではなくexecution modeを具体化する |

類似名を新しいmodeへ昇格させない。入口状況を変えるものだけをroute、Forwardの特定layerで
必須成果物を作るものだけを工程専門、成果物選択やruntime構成は補助軸として扱う。

## 6. 承認と自律境界

route全体を承認待ちにしない。catalogは`approval_requirements`のtrigger/action/approverと、
`autonomous_actions`を分離した。Recoveryは診断・証拠収集、Incidentは検知・証拠収集、
Retrofitはinventory・impact・dry-runまで自律継続する。

ただし既存`ROUTE_SIGNAL_MAP.requiresApproval`はRecovery/Incidentの入口推薦時点で広く停止する。
実action境界との段階分離は#168の4 sliceとは別責務であり、#169の
successor correctionとして扱う。production actionの承認を弱めず、診断まで止めない契約へ
分離する必要がある。

## 7. 結論

- route集合の欠落: `design-bottomup`を是正。
- 工程専門の形式登録のみ: entry/artifact/pair/exit契約へ是正。
- Design HARNESS runtime欠落: #168へ階層化し、現PRの完成主張から除外。
- 残るruntime drift: route推薦とaction承認の粒度差。#169の後続correction対象。
- Scrum以外を「その他」として一括処理せず、各routeの入口、工程、合流、exitを機械正本へ固定した。
