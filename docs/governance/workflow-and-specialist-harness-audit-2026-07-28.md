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

既存`ROUTE_SIGNAL_MAP.requiresApproval`がRecovery/Incidentの入口推薦時点で広く停止していた
問題は#169で分離した。route選択はproposal-only、実action承認は
`action_approval_required`、`approval_trigger`、`approved_action`へ分け、診断・証拠収集を
承認待ちにしない。production actionの承認境界は維持する。

## 7. ハイブリッド制御面のbackfill exact set

要件正本 §4.6 は、routeそのものではなく全routeを支える制御面10責務を定義する。
repository exact searchでは既存runtime／test在庫は多い一方、`HR-FR-HYB-001..010`から
L4〜L9 owner／oracleへのexact traceがほぼ無く、実装存在を要件充足として扱えない。

| requirement | responsibility | 現在のruntime在庫 | 判定 |
|---|---|---|---|
| HR-FR-HYB-001 | closure authority | registry、review receipt、convergence、CLI／testあり | trace backfill要 |
| HR-FR-HYB-002 | MCP profile catalog | profile safety PLAN／verification profileあり | trace backfill要 |
| HR-FR-HYB-003 | Discovery Scrum promotion | S0〜S4 decision／promotion runtimeあり | trace backfill要 |
| HR-FR-HYB-004 | hybrid git lane | lane、work-guard、git-command-guard、override transactionあり | trace backfill要 |
| HR-FR-HYB-005 | memory v2 | lifecycle、fence、retirement実装と一部ID traceあり | trace closure要 |
| HR-FR-HYB-006 | feedback lifecycle | event／projection／SessionStart surfaceあり | trace backfill要 |
| HR-FR-HYB-007 | skill engine | suggest／firing／efficacy telemetryあり | trace backfill要 |
| HR-FR-HYB-008 | distribution | plan／sync／packageとapproval境界あり | trace backfill要 |
| HR-FR-HYB-009 | VS Code read model | DB read model／tree viewあり | trace backfill要 |
| HR-FR-HYB-010 | GitHub自走 | Issue／PR／CI／merge契約あり | trace backfill要 |

10機能を再実装せず、#195で既存owner、pair、positive／negative oracle、DB evidence、
stale／re-entry、approval境界をexact tableへ再接着する。実装欠落だけをsuccessorへ分離する。

## 8. 非Scrum専門capability exact set

工程専門workflowとは別に、選択済route上で成果物や判断を生成・検証する専門capabilityがある。
これらを新しいmodeへ昇格せず、固有のentry、artifact/evidence、authority、stale/re-entry、exitを持つ
subsystemとして扱う。

| capability | L3 authority | 現在のruntime成熟度 | 残責務 |
|---|---|---|---|
| verification／measurement | requirements §4.3 | verification profileとright-arm strategyは部分実装。全NFR共通のtyped registry／metric時系列は未実装 | #193 |
| Universal Workflow AI判断 | `universal-workflow-ai-judgment-engine.md` | envelope共通境界はPR #189 candidate。interview、compiler、proposal authority、allocationは未実装 | #179、#184〜#188 |
| AI Vision Design HARNESS | `ai-vision-design-harness-engine.md`、requirements §4.9 | metadata／semantic diffは実装済み。screen applicability、prototype、Design Registry、Design Refactorは未実装 | #168、#175〜#178、#180 |
| Authoring Admission | requirements §4.7 | semantic diff等の部品はあるが、Proposal→Candidate→CanonicalのCAS transaction ownerは未実装 | #192 |
| NFR registry | requirements §4.8 | `nfr-grade.md`はplaceholder projection。全NFRのstable typed registryは未実装 | #193 |
| specialist agent registry | `UTH-FR-033`／`UTH-AC-025` | capability resolver、model SSoT、allowlist検査が分散実装。versioned snapshot、definition digest、verification team routingが未実装 | #190 |
| 外部AI worker admission | requirements §4.10 | Python semantic core境界は別責務として存在。provider-neutral external worker admissionは未実装 | #194、provider固有 #51 |

親Issue #191を非Scrum専門capabilityの収束単位とし、#192〜#194を実sub-issueへ登録する。
Design HARNESS #168、Universal Workflow #179、specialist agent registry #190は既存階層を保持し、
同じ責務を複製しない。

## 9. 成熟度判定規律

各capabilityは次の状態を独立に表示する。

1. `requirements_confirmed`: L3 authorityと受入oracleがconfirmed。
2. `design_paired`: L4/L9、L5/L8、L6/L7のpairがcurrent。
3. `runtime_implemented`: canonical ownerとtargeted oracleがgreen。
4. `execution_verified`: current HEAD／environment／evidence digestへ束縛された実行証拠がある。
5. `operation_observed`: L12時間軸metricと改善結果がcurrent。

上流状態だけで下流状態を導出しない。文書存在、truthy artifact名、screenshot、binding test、
provider起動だけを`runtime_implemented`または`execution_verified`の証拠にしない。

## 10. 結論

- route集合の欠落: `design-bottomup`を是正。
- 工程専門の形式登録のみ: entry/artifact/pair/exit契約へ是正。
- Design HARNESS runtime欠落: #168へ階層化し、現PRの完成主張から除外。
- route推薦とaction承認の粒度差: #169で是正済み。
- 非Scrum専門capabilityの未実装: #191配下と既存#168／#179／#190へexact ownerを固定。
- §4.6制御面の要件ID trace欠落: #195で既存runtimeへbackfillし、再実装と分離。
- Scrum以外を「その他」として一括処理せず、各routeの入口、工程、合流、exitを機械正本へ固定した。
