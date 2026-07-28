---
title: "HELIX 駆動モデル／経路体系"
status: confirmed
authority: config/drive-route-catalog.json
schema_version: drive-route-catalog.v1
---

# HELIX 駆動モデル／経路体系

## 1. 目的

駆動モデルは「どの開発手法が優れているか」を選ぶ分類ではない。観測した入口signalを、
その状況に必要な工程へ送り、最後にcanonical Forward spineへ戻す経路制御である。
Forward、Production Scrum、V設計＋Scrum実装Hybridだけをdelivery routeとして比較し、
Reverse、Recovery、Incident、Refactor等を雑な例外処理へ落とさない。

機械正本は`config/drive-route-catalog.json`である。本書はその軸と選択規律を説明する。
route exact set、signal、kind、承認境界、遷移、文書、Forward到達可能性は
`drive-route-catalog` doctor gateが検査する。

## 2. 混同してはいけない軸

| 軸 | 決めること | 例 |
|---|---|---|
| Forward spine | 全経路が最後に接着するL1〜L12正本 | `forward_full_v` |
| delivery route | productionをどう分割して届けるか | Full V、Production Scrum、Hybrid |
| drive route | 現在のsignalをどの工程へ送るか | Reverse、Recovery、Refactor等15 route |
| PLAN kind | 1 PLANが何を変更するか | `design`、`add-impl`、`recovery` |
| drive | 招集する専門職 | `be`、`fe`、`fullstack`、`db`、`agent` |
| execution mode | どのruntime構成で実行するか | `standalone`、`claude-only`、`codex-only`、`hybrid` |
| specialist workflow | 選択済route内の特定layerで必須成果物を作る工程 | screen-design、frontend-design |
| specialist capability | routeを置換せず専門判断・成果物を提供するsubsystem | Design HARNESS、NFR、Authoring、外部worker |

route、kind、drive、execution modeを一つのenumへ畳み込まない。たとえば`Recovery`はroute、
`recovery`はPLAN kind、`fullstack`はdrive、`hybrid`はruntime編成であり、同じ問いへの候補ではない。

## 3. 15 routeの役割

| route | 主な入口 | 所有する工程 | 正規出口 |
|---|---|---|---|
| `forward_full_v` | 要求が定義済み | L1〜L12をslice化せずpair closure | Forward終端 |
| `production_scrum` | 高feedback、継続的要求精緻化 | S0〜S4＋SR0〜SR4 | ReverseまたはForward |
| `v_design_scrum_impl_hybrid` | V設計後の段階release | L1〜L5＋S0〜S4＋SR0〜SR4 | ReverseまたはForward |
| `discovery` | 要求・実現性・成功条件が未確定 | S0〜S4の仮説検証 | ReverseまたはForward |
| `reverse` | 実装／正本drift、設計gap | R0〜R4の事実回収と再接着 | Forward |
| `add_feature_top_down` | 要件からの機能追加 | impact→add-design→add-impl→test | Forward |
| `add_feature_bottom_up` | L6/L7起点の局所追加 | 実装後R0〜R4 fullback | ReverseまたはForward |
| `refactor` | debt、code smell、構造劣化 | 振る舞い不変の極小変更 | ReverseまたはForward |
| `retrofit` | dependency／config／platform移行 | inventory→dry-run→compatibility→cutover | ReverseまたはForward |
| `recovery` | 開発中断、runaway、context枯渇、開発回帰 | diagnose→contain→repair→verify→resume | ReverseまたはForward |
| `incident` | production障害、緊急hotfix | detect→contain→restore→postmortem | Recovery、ReverseまたはForward |
| `research` | 技術判断、比較、ADRが必要 | question→一次source→比較→decision | DiscoveryまたはForward |
| `version_up` | 今版へ入れず将来版へ保全 | park→refresh→rehearsal→activate | Add-feature |
| `operation_verification` | merge後／scheduled検証 | L7〜L12実行証拠 | Recovery、Incident、ReverseまたはForward |
| `design_bottomup` | backend事実からFE／screen要求を抽出 | inventory→elicitation→mock→L3/L5/L6 backfill | DiscoveryまたはForward |

catalogの`phases`、`approval_requirements`、`autonomous_actions`、`exit_conditions`が詳細正本である。
表の短縮説明だけでrouteを実行しない。

## 4. 選択と遷移

1. production deliveryの形だけを決める場合はFull V、Production Scrum、Hybridを比較する。
2. 不確実性が残る場合はDiscovery、既存事実から正本を回復する場合はReverseへ送る。
3. failureを直す場合でも、開発中断はRecovery、production影響はIncident、計画済み検証は
   OperationVerificationとして別契約にする。
4. 振る舞いを変えない改善はRefactor、外部version／platform整合はRetrofit、意味追加はAdd-featureにする。
5. 各routeの`next_routes`は実在するだけでなく、循環せず有限遷移で`forward_full_v`へ到達しなければならない。
6. `forward_full_v`は終端であり、`next_routes`を持たない。循環だけでForwardへ届かないgraphはfail-closeする。

複数signalが同時にある場合は、production safetyを先に守る
`Incident → Recovery → Reverse → Discovery/Research → change/delivery`の順で現在の阻害要因を解消する。
ただし承認はroute入口全体ではなく、catalogの`approval_requirements[].trigger`に該当するactionだけへ束縛する。

## 5. 専門工程と専門capability

工程専門workflowのexact setは`screen_design`と`frontend_design`の2件である。これらは独立routeではなく、
ForwardのL2↔L11、L3↔L10で成果物とright-arm evidenceを閉じる。

設計ハーネス、検証・計測、正本化受付、非機能要件台帳、専門エージェント台帳、
外部AI worker受付、編成容量・セキュリティ、Universal Workflowは専門capabilityである。
各capabilityは選択済routeへentry、artifact、authority、stale/re-entry、exitを提供するが、
新しい駆動モデルを勝手に増やさない。

## 6. 完了規律

routeの完了は、固有`exit_conditions`、Forward再合流、影響V-pair、current HEADのright-arm evidence、
独立review、DB追従が全てcurrentであることを要する。PLANや文書の存在だけで完了にしない。
非blocker改善は階層Issueへ送り、現在routeを無限review loopへ戻さない。
