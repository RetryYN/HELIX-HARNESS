# 旧KPI D01–D09の責務・条件比較

基準main `6012791623a6ec421d79be34d193bef5fa1ad501`、authority_effect: none。[JSON証拠](nine-kpi-responsibility-comparison-2026-10-10.json)、SHA-256 `3674b56e5edf0a93c4c7a216baad110287697c27349bf2161d4578ad56fcf15b`。

33名指し入力のD01-D09を各4セル（名称/式/目標/場所）計36条件候補で比較。cell内の詳細条件は全文保持し、正式atom化/移管/全consumer閉包を生成しない。

## 9原入力の比較

| 原入力 | 名称 | 計測式 | 目標 | 原計測場所 | 比較／未解決 |
|---|---|---|---|---|---|
| D-01 | PLAN 起票数/sprint | sprint 期間中に起票された PLAN 件数 | ≥ 1 件/sprint | `.helix/plan_registry/` / `helix plan list` | 起票件数はOSの原記録、対象期間/sprintの集計はLABO評価候補。起票1件以上という旧目標を、現在のticket発行義務や事例の質へ変換しない。期間未確定/重複起票/取消/起票元consumerの閉包は未完。 |
| D-02 | gate 通過率 | gate pass 件数 / gate 総実行件数 × 100 | ≥ 90 % | `.helix/gate_runs/` / `helix gate log` | pass/総実行×100と>=90%を保持。OT30のD07誤参照を区別。再試行/中断/stale/未実行の母数条件は別照合、CIgreenのみでreview/authority成立としない。 |
| D-03 | V-model 順序遵守違反 | 前工程未完了で後工程着手した検知件数 | 0 件 | `helix doctor` / `helix plan lint` | 前工程未完で後工程着手の検知0を保持。検知0が違反実在0の証拠になるには観測範囲/検知能力が要る。HARNESS工程規則とOS進行/原証拠を分け、旧doctor/lintを実行しない。 |
| D-04 | 回帰検出率 | テストで検出した回帰件数 / 回帰発生総件数 × 100 | ≥ 80 % | CI gate / `helix trace` | 検出回帰/回帰発生総数×100と>=80%を保持。未発見回帰を含む分母の取得/観測期間が未確定なら「100%」としない。成功率やgate通過率とは別。 |
| D-05 | 4 artifact trace 整合率 | trace 整合 PLAN 件数 / 全 PLAN 件数 × 100 | ≥ 95 % | `helix trace check` / `.helix/artifact/trace/` | 4artifact trace整合PLAN/全PLAN×100と>=95%を保持。4artifactの正確な集合/対象PLAN/整合条件を現行template exact setへ推測接続しない。trace表示や部分成功は全体完了ではない。 |
| D-06 | agent guard bypass 件数 | `HELIX_ALLOW_RAW_AGENT=1` 実行件数 (audit 記録) | 0 件 目標 (PO 承認時のみ許容) | `.helix/audit/` / agent-guard log | raw-agent bypassの旧env名/原audit、0目標とPO承認例外を保持。NFR14<=2/sprintとの意味差は未判断。bypass観測/評価でauthorityを拡張せず、旧envを設定/実行しない。 |
| D-07 | AI 委譲時間率 | AI 委譲タスク工数 / 総開発工数 × 100 | ≥ 70 % | PLAN `drive:` 集計 / `helix status` | AI工数/総工数×100と>=70%を保持。8hAI+4h人で66.7%、旧PhaseA>=50%と最終70%は別。OT30 gate率と統合しない。driveタグの件数を工数と同一視せず、実測/推定/並列の扱いは未確定。 |
| D-08 | gate override 件数/sprint | PO による gate fail-close 例外行使件数 | ≤ 2 件/sprint | `.helix/audit/` / gate override log | POによるgate fail-close例外件数<=2/sprintを保持。D06 raw-agent bypassとは異なる対象作用。少ない件数だけで例外を許可せず、target/revision/有効permissionの現行境界は保持。 |
| D-09 | continuation 再開成功率 | next authority 実行成功件数 / continuation event 総件数 × 100 | ≥ 95 % | `harness.db` continuation projection / `helix status` | next authority実行成功/continuation event総数×100と>=95%を保持。旧NFR16のhandover成功率と同一性は未判断。再開件数だけで未完義務/累積制約/二重実行防止を代用しない。 |

## consumer差の確認

- KF01: D07はAI委譲時間率。OT30はD07をgate通過率>=90%と呼ぶが、businessとNFR13ではgate率はD02。文字の取り違えと測定対象の差を保全し、旧sourceを無断訂正しない。（K01,K03,K04,K05）
- KF02: business D06はraw-agent bypass 0目標+PO例外、D08はgate override<=2/sprint。NFR14はD06 bypass<=2/sprint。source差は残り、2を一般許可や新閾値にしない。（K01,K05）
- KF03: D09 next authority continuation実行成功とNFR16 onboarding/handover成功はconsumer語彙が違う。successの同じ95%だけで対象populationを統合しない。（K01,K06,K09,K10）
- KF04: D07最終目標>=70%、旧PhaseA>=50%、BR21着手はG14 AND 直近sprint>=50%。8/(8+4)66.7%の旧例を保持し、現行着手許可にしない。（K01,K04,K07）
- KF05: OT21は9件の式/目標/場所の整合を求めるが、旧CLI名・宣言・比較候補だけでは実際の測定、分母取得、全consumer適用を証明しない。未観測/対象0の扱いを成功や0違反へ補完しない。（K01,K02,N04,N05）

## 限定参照

| 根拠 | path | 行 | 確認対象 |
|---|---|---|---|
| N01 | `docs/helix-os/L2-requirements/governance-requirements.md` | 58–60 | OS005登録/振分け、007原証拠/ログ |
| N03 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 39–41 | 未計測/誤推薦/旧版、同意/data class/retention/scope不足の拒否 |
| N04 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 71–79 | LABO001許可観測、sourceauthority非移管、欠測保留 |
| N05 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 110–125 | LABO006実験/007system化候補、Worker割当はOS |
| N06 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 132–149 | LABO009一般化/010Feedback、登録はOS/変更targetowner |
| N12 | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 45–54 | LABO001/006/007/009/010の反例 |
| N14 | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 100–100 | LABO050登録/CI成功だけでは改善完了しない |
| K01 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` | 192–204 | D01-D09原表全体、PO承認metadata。現行revisionへの採用ではない |
| K02 | `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L1-operational-test-design.md` | 72–72 | OT21全KPIの式/目標/場所の整合を要求 |
| K03 | `archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L1-operational-test-design.md` | 81–81 | OT30がD07をgate通過率と呼ぶ差 |
| K04 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md` | 63–74 | D07 AI工数比、50/70%と8/(8+4)の旧例 |
| K05 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md` | 88–92 | D05/D02/D06/01/04、D06<=2とD08の関係は未判断 |
| K06 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md` | 34–34 | D09 continuation対handoverの意味差 |
| K07 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md` | 156–163 | G14 AND 直近sprintD07>=50%と最終70%の差 |
| K08 | `docs/helix-os/L2-requirements/governance-requirements.md` | 55–60 | OS002 trace/004許可制約/005還流/007ログ |
| K09 | `docs/helix-os/L2-requirements/governance-requirements.md` | 62–64 | OS009継続復旧/010管理推進検収/011検証計画 |
| K10 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 29–29 | OS009累積制約/未完義務/二重実行/予算reset/無許可復旧拒否 |

## 残作業

- 33入力中FR19/20/36/38/43とD01-D09、計14入力の比較記録を作ったが、残19入力と各全consumer閉包は未完。
- sprint/期間・4artifact集合・工数・回帰分母・cancel/retry/stale・0対象・bypass/override・continuation/handoverの意味とsource差を個別要求判断へ示す。
- OS005/007/012/013全atom、双方停止/再送/欠測/取消、物理分離判断条件、data writer/retention/adoption全量表、判断packetは未完。

9原carry recordと原文/contextを保持し、36候補のsuccessorは空。今回の比較で旧sourceを修正/retireせず、#2089/#1861はOPENを保持する。
